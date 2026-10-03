'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from '../app/admin/acces/admin.module.css';

type RequestRow = { id: string; email: string; display_name: string; message: string | null; status: string; requested_at: string };
type MemberRow = { user_id: string; email: string; display_name: string; role: string; status: string; created_at: string };

const demoRequests: RequestRow[] = [
  { id: 'demo-1', email: 'camille.martin@exemple.fr', display_name: 'Camille Martin', message: 'Remplaçante prévue pour la tournée du 12 octobre.', status: 'pending', requested_at: new Date().toISOString() },
  { id: 'demo-2', email: 'sophie.bernard@exemple.fr', display_name: 'Sophie Bernard', message: 'Je rejoins le cabinet trois jours par semaine.', status: 'pending', requested_at: new Date().toISOString() },
];
const demoMembers: MemberRow[] = [
  { user_id: 'owner', email: 'julie@cabinet-exemple.fr', display_name: 'Julie Renaud', role: 'owner', status: 'active', created_at: new Date().toISOString() },
  { user_id: 'nurse', email: 'marion@cabinet-exemple.fr', display_name: 'Marion Leclerc', role: 'nurse', status: 'active', created_at: new Date().toISOString() },
];

export default function AccessAdmin({ configured }: { configured: boolean }) {
  const [tab, setTab] = useState<'requests' | 'members'>('requests');
  const [requests, setRequests] = useState<RequestRow[]>(configured ? [] : demoRequests);
  const [members, setMembers] = useState<MemberRow[]>(configured ? [] : demoMembers);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    if (!configured) return;
    const response = await fetch('/api/admin/access', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      setRequests(data.requests);
      setMembers(data.members);
    } else setNotice('Impossible de charger les accès. Vérifiez votre rôle administrateur.');
  }
  useEffect(() => { void load(); }, [configured]);

  async function action(payload: Record<string, string>) {
    const key = payload.requestId || payload.memberId || 'action';
    setBusy(key);
    if (!configured) {
      if (payload.action === 'approve') {
        const item = requests.find((request) => request.id === payload.requestId);
        if (item) {
          setRequests((rows) => rows.filter((row) => row.id !== item.id));
          setMembers((rows) => [...rows, { user_id: item.id, email: item.email, display_name: item.display_name, role: payload.role || 'nurse', status: 'active', created_at: new Date().toISOString() }]);
          setNotice('Aperçu : invitation envoyée et accès activé.');
        }
      } else if (payload.action === 'reject') setRequests((rows) => rows.filter((row) => row.id !== payload.requestId));
      else if (payload.action === 'suspend' || payload.action === 'activate') setMembers((rows) => rows.map((row) => row.user_id === payload.memberId ? { ...row, status: payload.action === 'suspend' ? 'suspended' : 'active' } : row));
      else if (payload.action === 'remove') setMembers((rows) => rows.filter((row) => row.user_id !== payload.memberId));
      else if (payload.action === 'role') setMembers((rows) => rows.map((row) => row.user_id === payload.memberId ? { ...row, role: payload.role } : row));
      setBusy('');
      return;
    }
    const response = await fetch('/api/admin/access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    setNotice(response.ok ? 'Modification enregistrée.' : result.error || 'Action impossible.');
    if (response.ok) await load();
    setBusy('');
  }

  const pending = useMemo(() => requests.filter((request) => request.status === 'pending'), [requests]);
  const active = members.filter((member) => member.status === 'active').length;
  const labels: Record<string, string> = { owner: 'Administratrice', nurse: 'Infirmière', replacement: 'Remplaçante' };
  return <>
    {!configured && <div className={styles.notice}>Aperçu administrateur avec données fictives. Connectez Supabase pour envoyer de vraies invitations.</div>}
    {notice && <div className={styles.notice} role="status">{notice}</div>}
    <div className={styles.tabs}>
      <button className={tab === 'requests' ? styles.active : ''} onClick={() => setTab('requests')}>Demandes <span className={styles.badge}>{pending.length}</span></button>
      <button className={tab === 'members' ? styles.active : ''} onClick={() => setTab('members')}>Membres du cabinet</button>
    </div>
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>{tab === 'requests' ? 'Demandes en attente' : 'Accès autorisés'}</h2>
        <p>{tab === 'requests' ? 'Accepter une demande crée le compte et envoie le lien personnel.' : `${active} accès actif${active > 1 ? 's' : ''} · toute suspension est immédiate.`}</p>
      </div>
      {tab === 'requests' ? (pending.length ? pending.map((request) => <RequestItem key={request.id} request={request} busy={busy === request.id} action={action} />) : <div className={styles.empty}>Aucune demande en attente.</div>) : (members.length ? members.map((member) => <div className={styles.row} key={member.user_id}>
        <Identity name={member.display_name} email={member.email} />
        <div><span className={`${styles.state} ${member.status === 'suspended' ? styles.suspended : ''}`}>{member.status === 'active' ? 'Accès actif' : 'Accès suspendu'}</span><p className={styles.detail}>Ajouté le {new Date(member.created_at).toLocaleDateString('fr-FR')}</p></div>
        <div className={styles.actions}>
          <select value={member.role} disabled={member.role === 'owner'} onChange={(e) => action({ action: 'role', memberId: member.user_id, role: e.target.value })}><option value="nurse">Infirmière</option><option value="replacement">Remplaçante</option><option value="owner">Administratrice</option></select>
          <button onClick={() => action({ action: 'resend', memberId: member.user_id })}>Renvoyer le lien</button>
          {member.role !== 'owner' && <button onClick={() => action({ action: member.status === 'active' ? 'suspend' : 'activate', memberId: member.user_id })}>{member.status === 'active' ? 'Suspendre' : 'Réactiver'}</button>}
          {member.role !== 'owner' && <button className={styles.danger} onClick={() => action({ action: 'remove', memberId: member.user_id })}>Retirer</button>}
        </div>
      </div>) : <div className={styles.empty}>Aucun membre.</div>)}
    </section>
  </>;
}

function RequestItem({ request, busy, action }: { request: RequestRow; busy: boolean; action: (payload: Record<string, string>) => void }) {
  const [role, setRole] = useState('nurse');
  return <div className={styles.row}>
    <Identity name={request.display_name} email={request.email} />
    <div><p className={styles.message}>{request.message || 'Aucun message joint.'}</p><p className={styles.detail}>Demandé le {new Date(request.requested_at).toLocaleDateString('fr-FR')}</p></div>
    <div className={styles.actions}><select value={role} onChange={(e) => setRole(e.target.value)}><option value="nurse">Infirmière</option><option value="replacement">Remplaçante</option><option value="owner">Administratrice</option></select><button className={styles.approve} disabled={busy} onClick={() => action({ action: 'approve', requestId: request.id, role })}>Accepter et inviter</button><button disabled={busy} onClick={() => action({ action: 'reject', requestId: request.id })}>Refuser</button></div>
  </div>;
}

function Identity({ name, email }: { name: string; email: string }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return <div className={styles.identity}><span className={styles.avatar}>{initials}</span><div><strong>{name}</strong><small>{email}</small></div></div>;
}
