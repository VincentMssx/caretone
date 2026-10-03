import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';

export async function DELETE(request: Request) {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/connexion', request.url), { status: 303 });
}

export const POST = DELETE;
