import Link from 'next/link';
import AccessRequestForm from '../../components/AccessRequestForm';
import styles from '../acces.module.css';

export default function RequestAccessPage() {
  return (
    <main className={styles.page}>
      <section className={styles.visual}>
        <div className={styles.brand}><span className={`${styles.brandMark} material-symbols-outlined`}>graphic_eq</span>carevoice.</div>
        <div className={styles.visualCopy}><span>REJOINDRE LE CABINET</span><h2>Votre demande reste sous contrôle.</h2><p>L’envoi du formulaire ne donne aucun accès. L’administrateur vérifie votre demande avant l’envoi d’un lien personnel.</p></div>
        <div className={styles.privacy}><span className="material-symbols-outlined">admin_panel_settings</span>Validation humaine obligatoire</div>
      </section>
      <section className={styles.content}>
        <div className={styles.card}>
          <Link className={styles.back} href="/connexion"><span className="material-symbols-outlined">arrow_back</span> J’ai déjà un accès</Link>
          <span className={styles.eyebrow}>DEMANDE D’INVITATION</span>
          <h1>Demander un accès</h1>
          <p className={styles.intro}>Présentez-vous à l’administrateur du Cabinet des Tilleuls.</p>
          <AccessRequestForm />
        </div>
      </section>
    </main>
  );
}
