import Link from 'next/link';
import LoginForm from '../../components/LoginForm';
import { isAuthEnabled } from '../../lib/supabase/config';
import styles from '../acces.module.css';

export default function LoginPage() {
  const configured = isAuthEnabled();
  return (
    <main className={styles.page}>
      <AccessVisual />
      <section className={styles.content}>
        <div className={styles.card}>
          <Link className={styles.back} href="/"><span className="material-symbols-outlined">arrow_back</span> Retour à CareVoice</Link>
          <span className={styles.eyebrow}>ESPACE SÉCURISÉ</span>
          <h1>Connexion</h1>
          <p className={styles.intro}>Recevez un lien personnel sur l’adresse autorisée par votre administrateur.</p>
          {!configured && <p className={styles.demoNotice}>Mode démonstration : connectez Supabase et activez AUTH_ENABLED pour verrouiller l’application.</p>}
          <LoginForm configured={configured} />
          <p className={styles.switch}>Vous rejoignez le cabinet ? <Link href="/demande-acces">Demander un accès</Link></p>
        </div>
      </section>
    </main>
  );
}

function AccessVisual() {
  return <section className={styles.visual}>
    <div className={styles.brand}><span className={`${styles.brandMark} material-symbols-outlined`}>graphic_eq</span>carevoice.</div>
    <div className={styles.visualCopy}><span>ACCÈS AU CABINET</span><h2>Les soins partagés avec la bonne équipe.</h2><p>Les dossiers, tournées et transmissions restent accessibles aux seules personnes acceptées par l’administrateur du cabinet.</p></div>
    <div className={styles.privacy}><span className="material-symbols-outlined">verified_user</span>Session sécurisée · accès révocable à tout moment</div>
  </section>;
}
