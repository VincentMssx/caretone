'use client';

import { FormEvent, useState } from 'react';
import { createBrowserSupabaseClient } from '../lib/supabase/client';

export default function LoginForm({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!configured) {
      setError('Supabase doit être configuré avant d’activer la connexion.');
      return;
    }
    setState('sending');
    setError('');
    const supabase = createBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) setError('Si cette adresse est autorisée, un nouveau lien peut être demandé dans quelques instants.');
    setState('sent');
  }

  if (state === 'sent') {
    return (
      <div className="auth-success" role="status">
        <span className="material-symbols-outlined">mark_email_read</span>
        <h2>Consultez votre boîte mail</h2>
        <p>Si votre accès est actif, vous recevrez un lien de connexion sécurisé.</p>
        <button className="auth-link-button" onClick={() => setState('idle')}>Utiliser une autre adresse</button>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="email">Adresse e-mail professionnelle</label>
      <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom@cabinet.fr" />
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="auth-primary" disabled={state === 'sending'}>
        <span className="material-symbols-outlined">mail</span>
        {state === 'sending' ? 'Envoi…' : 'Recevoir mon lien sécurisé'}
      </button>
      <p className="auth-help">Le lien est personnel et temporaire. Aucun mot de passe à mémoriser.</p>
    </form>
  );
}
