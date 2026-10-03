import { NextResponse } from 'next/server';
import { isAuthEnabled } from '../../../lib/supabase/config';
import { createAdminSupabaseClient } from '../../../lib/supabase/server';

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Les demandes seront disponibles après la connexion Supabase.' }, { status: 503 });
  }
  const body = await request.json().catch(() => ({}));
  const email = clean(body.email, 254).toLowerCase();
  const displayName = clean(body.displayName, 100);
  const message = clean(body.message, 600);
  const website = clean(body.website, 100);
  if (website) return NextResponse.json({ ok: true });
  if (!displayName || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Nom et adresse e-mail valides requis.' }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data: organization } = await admin
    .from('organizations')
    .select('id')
    .eq('accepting_requests', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!organization) {
    return NextResponse.json({ error: 'Le cabinet ne reçoit pas de nouvelles demandes.' }, { status: 403 });
  }
  const { error } = await admin.from('access_requests').upsert(
    {
      organization_id: organization.id,
      email,
      display_name: displayName,
      message: message || null,
      status: 'pending',
      reviewed_at: null,
      reviewed_by: null,
    },
    { onConflict: 'organization_id,email' },
  );
  if (error) return NextResponse.json({ error: 'Impossible d’enregistrer la demande.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
