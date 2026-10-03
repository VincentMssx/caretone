'use client';

import { FormEvent, useState } from 'react';

export default function AccessRequestForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/access-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: form.get('displayName'),
        email: form.get('email'),
        message: form.get('message'),
        website: form.get('website'),
      }),
    });
    const result = await response.json();
    if (!response.ok) setError(result.error || 'La demande n’a pas pu être envoyée.');
    else setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="auth-success" role="status">
        <span className="material-symbols-outlined">task_alt</span>
        <h2>Demande envoyée</h2>
        <p>L’administrateur du cabinet va l’examiner. Vous recevrez un e-mail uniquement après son acceptation.</p>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="displayName">Nom et prénom</label>
      <input id="displayName" name="displayName" required autoComplete="name" placeholder="Camille Martin" />
      <label htmlFor="requestEmail">Adresse e-mail professionnelle</label>
      <input id="requestEmail" name="email" type="email" required autoComplete="email" placeholder="camille@cabinet.fr" />
      <label htmlFor="message">Message pour l’administrateur <small>Facultatif</small></label>
      <textarea id="message" name="message" rows={4} maxLength={600} placeholder="Je rejoins le cabinet comme remplaçante à partir du…" />
      <input className="auth-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="auth-primary" disabled={loading}>
        <span className="material-symbols-outlined">send</span>
        {loading ? 'Envoi…' : 'Envoyer ma demande'}
      </button>
    </form>
  );
}
