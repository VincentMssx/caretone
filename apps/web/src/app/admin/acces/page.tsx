import Link from 'next/link';
import AccessAdmin from '../../../components/AccessAdmin';
import { isAuthEnabled } from '../../../lib/supabase/config';
import styles from './admin.module.css';

export default function AccessAdminPage() {
  const configured = isAuthEnabled();
  return <main className={styles.page}>
    <header className={styles.header}>
      <Link className={styles.brand} href="/"><span className="material-symbols-outlined">graphic_eq</span>carevoice.</Link>
      <div className={styles.headerActions}><Link href="/parametres">Retour aux paramètres</Link>{configured && <form action="/api/session" method="post"><input type="hidden" name="_method" value="DELETE" /><button>Se déconnecter</button></form>}</div>
    </header>
    <div className={styles.main}>
      <div className={styles.heading}><div><span className={styles.eyebrow}>ADMINISTRATION · ACCÈS</span><h1>Équipe et invitations</h1><p>Vous décidez qui rejoint le cabinet et pouvez couper un accès immédiatement.</p></div><div className={styles.status}><div><strong>1</strong><span>Cabinet</span></div><div><strong>3</strong><span>Rôles</span></div><div><strong>RLS</strong><span>Isolation</span></div></div></div>
      <AccessAdmin configured={configured} />
    </div>
  </main>;
}
