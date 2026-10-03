import { createAdminSupabaseClient, createServerSupabaseClient } from './server';

export async function requireOwner() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié', status: 401 as const };

  const admin = createAdminSupabaseClient();
  let { data: membership } = await admin
    .from('organization_members')
    .select('organization_id, role, status')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .eq('status', 'active')
    .maybeSingle();
  if (!membership && user.email) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase());
    if (adminEmails.includes(user.email.toLowerCase())) {
      let { data: organization } = await admin.from('organizations').select('id').eq('owner_id', user.id).maybeSingle();
      if (!organization) {
        const created = await admin.from('organizations').insert({ name: 'Cabinet des Tilleuls', owner_id: user.id, accepting_requests: true }).select('id').single();
        organization = created.data;
      }
      if (organization) {
        await admin.from('organization_members').upsert({ organization_id: organization.id, user_id: user.id, display_name: user.user_metadata?.display_name || user.email, role: 'owner', status: 'active' });
        membership = { organization_id: organization.id, role: 'owner', status: 'active' };
      }
    }
  }
  if (!membership) return { error: 'Accès administrateur requis', status: 403 as const };
  return { user, organizationId: membership.organization_id as string, admin };
}
