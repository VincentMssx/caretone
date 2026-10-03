import { NextResponse } from 'next/server';
import { isAuthEnabled, publicSupabaseConfig } from '../../../../lib/supabase/config';
import { requireOwner } from '../../../../lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';

type ActionBody = { action?: string; requestId?: string; memberId?: string; role?: string };
const allowedRoles = new Set(['nurse', 'replacement', 'owner']);

export async function GET() {
  if (!isAuthEnabled()) return NextResponse.json({ error: 'Authentification inactive' }, { status: 503 });
  const owner = await requireOwner();
  if ('error' in owner) return NextResponse.json({ error: owner.error }, { status: owner.status });
  const [requests, members] = await Promise.all([
    owner.admin.from('access_requests').select('id,email,display_name,message,status,requested_at').eq('organization_id', owner.organizationId).order('requested_at', { ascending: false }),
    owner.admin.from('organization_members').select('user_id,display_name,role,status,created_at').eq('organization_id', owner.organizationId).order('created_at'),
  ]);
  const memberRows = await Promise.all((members.data || []).map(async (member) => {
    const { data } = await owner.admin.auth.admin.getUserById(member.user_id);
    return { ...member, email: data.user?.email || '' };
  }));
  return NextResponse.json({ requests: requests.data || [], members: memberRows });
}

export async function POST(request: Request) {
  if (!isAuthEnabled()) return NextResponse.json({ error: 'Authentification inactive' }, { status: 503 });
  const owner = await requireOwner();
  if ('error' in owner) return NextResponse.json({ error: owner.error }, { status: owner.status });
  const body = (await request.json().catch(() => ({}))) as ActionBody;
  const role = allowedRoles.has(body.role || '') ? body.role! : 'nurse';

  if (body.action === 'approve' && body.requestId) {
    const { data: accessRequest } = await owner.admin.from('access_requests').select('*').eq('id', body.requestId).eq('organization_id', owner.organizationId).single();
    if (!accessRequest) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    const origin = new URL(request.url).origin;
    let userId = '';
    const invitation = await owner.admin.auth.admin.inviteUserByEmail(accessRequest.email, {
      redirectTo: `${origin}/auth/callback`,
      data: { display_name: accessRequest.display_name },
    });
    if (invitation.data.user) userId = invitation.data.user.id;
    if (!userId) {
      const users = await owner.admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      userId = users.data.users.find((user) => user.email?.toLowerCase() === accessRequest.email.toLowerCase())?.id || '';
    }
    if (!userId) return NextResponse.json({ error: invitation.error?.message || 'Invitation impossible' }, { status: 400 });
    await owner.admin.from('organization_members').upsert({ organization_id: owner.organizationId, user_id: userId, display_name: accessRequest.display_name, role, status: 'active' });
    await owner.admin.from('access_requests').update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: owner.user.id }).eq('id', body.requestId);
    await owner.admin.from('access_audit_logs').insert({ organization_id: owner.organizationId, actor_id: owner.user.id, target_user_id: userId, event: 'access_approved', details: { email: accessRequest.email, role } });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'reject' && body.requestId) {
    await owner.admin.from('access_requests').update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: owner.user.id }).eq('id', body.requestId).eq('organization_id', owner.organizationId);
    return NextResponse.json({ ok: true });
  }

  if (['suspend', 'activate', 'remove', 'role'].includes(body.action || '') && body.memberId) {
    if (body.memberId === owner.user.id && body.action !== 'role') return NextResponse.json({ error: 'Vous ne pouvez pas retirer votre propre accès.' }, { status: 400 });
    if (body.action === 'remove') {
      await owner.admin.from('organization_members').delete().eq('organization_id', owner.organizationId).eq('user_id', body.memberId);
    } else {
      const update = body.action === 'role' ? { role } : { status: body.action === 'suspend' ? 'suspended' : 'active' };
      await owner.admin.from('organization_members').update(update).eq('organization_id', owner.organizationId).eq('user_id', body.memberId);
    }
    await owner.admin.from('access_audit_logs').insert({ organization_id: owner.organizationId, actor_id: owner.user.id, target_user_id: body.memberId, event: `member_${body.action}`, details: body.action === 'role' ? { role } : {} });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'resend' && body.memberId) {
    const { data: target } = await owner.admin.auth.admin.getUserById(body.memberId);
    if (!target.user?.email) return NextResponse.json({ error: 'Adresse introuvable' }, { status: 404 });
    const { url, anonKey } = publicSupabaseConfig();
    const publicClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const result = await publicClient.auth.signInWithOtp({ email: target.user.email, options: { shouldCreateUser: false, emailRedirectTo: `${new URL(request.url).origin}/auth/callback` } });
    if (result.error) return NextResponse.json({ error: 'Le lien n’a pas pu être envoyé.' }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
