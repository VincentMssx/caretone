import type { EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = url.searchParams.get('next') || '/';
  const supabase = createServerSupabaseClient();
  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error('Lien incomplet') };
  if (result.error) {
    return NextResponse.redirect(new URL('/connexion?erreur=lien', url.origin));
  }
  return NextResponse.redirect(new URL(next.startsWith('/') ? next : '/', url.origin));
}
