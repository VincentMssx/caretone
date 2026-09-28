'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DAR, Patient, patients, readRecords, SavedRecord, STORAGE_KEY } from '../lib/demo';
import './demo.css';

type View = 'home' | 'patients' | 'patient' | 'transmission';
const labels = { donnees: 'Données', actions: 'Actions', resultats: 'Résultats' };
const keys = ['donnees', 'actions', 'resultats'] as const;
function Icon({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className="material-symbols-outlined">
      {name}
    </span>
  );
}
function Dar({ data }: { data: DAR }) {
  return (
    <div className="dar-grid">
      {keys.map((key, i) => (
        <div key={key}>
          <span className="dar-label">
            <b>{['D', 'A', 'R'][i]}</b>
            {labels[key]}
          </span>
          <p>{data[key]}</p>
        </div>
      ))}
    </div>
  );
}
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function DemoApp({ view = 'home', patientId }: { view?: View; patientId?: string }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [guide, setGuide] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [extraPatients, setExtraPatients] = useState<Patient[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState('1');
  const [phase, setPhase] = useState<'idle' | 'playing' | 'paused' | 'review' | 'saved'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [draft, setDraft] = useState<DAR>(patients[0].draft);
  const [checked, setChecked] = useState(false);
  const allPatients = [...patients, ...extraPatients].filter((p) => !archivedIds.includes(p.id));
  const selected = allPatients.find((p) => p.id === selectedId) || allPatients[0] || patients[0];
  const patient = allPatients.find((p) => p.id === patientId);
  useEffect(() => {
    try {
      setRecords(readRecords());
      const storedPatients = JSON.parse(sessionStorage.getItem('carevoice-demo-patients-v1') || '[]');
      const storedArchived = JSON.parse(sessionStorage.getItem('carevoice-demo-archived-v1') || '[]');
      if (Array.isArray(storedPatients)) setExtraPatients(storedPatients as Patient[]);
      if (Array.isArray(storedArchived)) setArchivedIds(storedArchived as string[]);
    } catch {
      setNotice(
        'Le stockage de la démo est indisponible. La validation vous signalera si elle ne peut pas être enregistrée.',
      );
    }
    const query = new URLSearchParams(window.location.search).get('patient');
    const match = patients.find((p) => p.id === query);
    if (match) {
      setSelectedId(match.id);
      setDraft({ ...match.draft });
    }
    setReady(true);
  }, []);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get('patient');
    const match = allPatients.find((p) => p.id === query);
    if (match) {
      setSelectedId(match.id);
      setDraft({ ...match.draft });
    }
    // Le nombre de patients change uniquement lors du chargement ou de l'ajout d'un dossier fictif.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraPatients.length]);
  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = window.setInterval(() => setSeconds((s) => Math.min(s + 1, 12)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);
  useEffect(() => {
    if (phase === 'playing' && seconds >= 12) setPhase('review');
  }, [phase, seconds]);
  const done = new Set(records.map((r) => r.patientId));
  const filtered = allPatients.filter(
    (p) =>
      normalize(`${p.name} ${p.care} ${p.sector}`).includes(normalize(search)) &&
      (filter !== 'pending' || !done.has(p.id)),
  );
  function reset() {
    try {
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith('carevoice-demo-'))
        .forEach((key) => sessionStorage.removeItem(key));
      setRecords([]);
      setExtraPatients([]);
      setArchivedIds([]);
      setPhase('idle');
      setSeconds(0);
      setChecked(false);
      setDraft({ ...selected.draft });
      setNotice('La démonstration a été réinitialisée.');
      setResetOpen(false);
    } catch {
      setNotice('Impossible de réinitialiser le stockage de cette session.');
    }
  }
  function addPatient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
    const care = String(form.get('care') || '').trim();
    const nextPatient: Patient = {
      id: String(Date.now()),
      name,
      initials,
      age: Number(form.get('age')),
      time: String(form.get('time')),
      sector: String(form.get('district')),
      district: String(form.get('district')),
      address: String(form.get('address')),
      phone: '02 55 99 09 99',
      coordinates: [47.2184, -1.5536],
      doctor: String(form.get('doctor')),
      frequency: String(form.get('frequency')),
      warnings: String(form.get('warning') || '').trim() ? [String(form.get('warning'))] : [],
      care,
      context: `${care} · Dossier de test créé pendant cette session`,
      attention: String(form.get('warning') || 'Aucun point d’attention renseigné'),
      followup: 'À préciser lors de la première transmission de démonstration.',
      previous: {
        donnees: 'Aucune transmission antérieure dans cette session de démonstration.',
        actions: 'Dossier fictif créé pour tester le parcours.',
        resultats: 'Premier passage à documenter.',
      },
      draft: {
        donnees: 'Patient vu au domicile. État clinique à préciser après observation.',
        actions: `${care} réalisé selon la prescription fictive et les habitudes du patient.`,
        resultats: 'Soin toléré. Résultat à compléter avant validation.',
      },
      dictation: `Passage chez ${name}. ${care} réalisé. Les observations et le résultat sont à compléter avant validation.`,
    };
    const next = [...extraPatients, nextPatient];
    setExtraPatients(next);
    sessionStorage.setItem('carevoice-demo-patients-v1', JSON.stringify(next));
    setNewPatientOpen(false);
    setNotice(`${name} a été ajouté à la session de démonstration.`);
    event.currentTarget.reset();
  }
  function save() {
    if (!checked || keys.some((k) => !draft[k].trim()) || phase !== 'review') return;
    const record: SavedRecord = {
      ...draft,
      id: crypto.randomUUID(),
      patientId: selected.id,
      savedAt: new Date().toISOString(),
    };
    try {
      const next = [record, ...readRecords()];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setRecords(next);
      setPhase('saved');
      setNotice('Transmission validée et ajoutée au dossier de démonstration.');
    } catch {
      setNotice(
        'La sauvegarde n’a pas abouti. Votre texte reste disponible : autorisez le stockage de session puis réessayez.',
      );
    }
  }
  const title =
    view === 'home'
      ? 'Votre tournée, l’esprit libre.'
      : view === 'patients'
        ? 'Les patients de votre tournée'
        : view === 'patient'
          ? 'Le fil des soins'
          : 'Vous racontez. Le dossier prend forme.';
  return (
    <div className="cv-app">
      <aside className="cv-sidebar extended-sidebar">
        <Link href="/" className="cv-brand">
          <span className="brand-mark">
            <Icon name="graphic_eq" />
          </span>
          carevoice<span className="brand-dot">.</span>
        </Link>
        <div className="cabinet">
          ESPACE INFIRMIER<span>Cabinet des Tilleuls</span>
        </div>
        <nav aria-label="Navigation principale">
          <Link href="/" aria-current={view === 'home' ? 'page' : undefined}>
            <Icon name="space_dashboard" />
            Ma tournée
          </Link>
          <Link
            href="/patients"
            aria-current={view === 'patients' || view === 'patient' ? 'page' : undefined}
          >
            <Icon name="group" />
            Patients<span className="nav-count">{allPatients.length}</span>
          </Link>
          <Link href="/tournees">
            <Icon name="view_week" />
            Tournées
          </Link>
          <Link href="/planning">
            <Icon name="calendar_month" />
            Planning
          </Link>
          <Link href="/equipe">
            <Icon name="groups" />
            Équipe
          </Link>
          <Link href="/trajet">
            <Icon name="route" />
            Trajet
          </Link>
          <Link href="/transmissions">
            <Icon name="graphic_eq" />
            Transmissions
          </Link>
        </nav>
        <span className="nav-section-label">CABINET</span>
        <nav aria-label="Outils du cabinet">
          <Link href="/professionnels">
            <Icon name="stethoscope" />
            Professionnels
          </Link>
          <Link href="/cotations">
            <Icon name="calculate" />
            Cotations
          </Link>
          <Link href="/messagerie">
            <Icon name="forum" />
            Messagerie<span className="nav-count">1</span>
          </Link>
          <Link href="/notes">
            <Icon name="sticky_note_2" />
            Notes
          </Link>
          <Link href="/parametres">
            <Icon name="settings" />
            Paramètres
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-side">
            <span className="tiny-label">PRÊT POUR LA RELÈVE</span>
            <h3>
              Moins de saisie.
              <br />
              Plus de présence.
            </h3>
            <p>Découvrez le parcours avec une transmission d’exemple.</p>
            <button onClick={() => setGuide(true)}>
              Guide de la démo <span>↗</span>
            </button>
          </div>
          <div className="profile">
            <span className="avatar small">JR</span>
            <div>
              <strong>Julie Renaud</strong>
              <small>Infirmière libérale · Démo</small>
            </div>
            <Icon name="verified" />
          </div>
        </div>
      </aside>
      <main className="cv-main">
        <header className="cv-top">
          <span>
            Cabinet des Tilleuls <span className="top-divider">/</span>{' '}
            {view === 'home' ? 'Ma tournée' : view === 'transmission' ? 'Transmission' : 'Patients'}
          </span>
          <div>
            <span className="demo-pill">
              <i />
              Démonstration · données fictives
            </span>
            <button
              className="icon-button"
              aria-label="Ouvrir le guide de présentation"
              onClick={() => setGuide(true)}
            >
              <Icon name="help" />
            </button>
          </div>
        </header>
        <div className="cv-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                {view === 'home'
                  ? 'LUNDI 28 SEPTEMBRE · TOURNÉE DU MATIN'
                  : 'DES TRANSMISSIONS QUI RELIENT LES SOIGNANTS'}
              </span>
              <h1>{title}</h1>
              <p>
                {view === 'home'
                  ? `Bonjour Julie. ${allPatients.length} patients, une équipe, le même fil de soins.`
                  : view === 'patients'
                    ? 'Retrouvez les informations utiles avant chaque passage.'
                    : view === 'patient'
                      ? 'Observations, actions et résultats : chaque passage garde sa place.'
                      : 'Un exemple fictif pour découvrir la relecture et la validation infirmière.'}
              </p>
            </div>
            {view !== 'transmission' && (
              <Link className="button primary" href="/transmission">
                <Icon name="mic" />
                Nouvelle transmission
              </Link>
            )}
          </div>
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button aria-label="Fermer le message" onClick={() => setNotice('')}>
                ×
              </button>
            </div>
          )}
          {view === 'home' && (
            <>
              <div className="stats">
                <div>
                  <span>Visites prévues</span>
                  <strong>
                    08<small>ce matin</small>
                  </strong>
                  <div className="stat-line" />
                </div>
                <div>
                  <span>Patients avec transmission validée</span>
                  <strong>
                    {String(done.size).padStart(2, '0')}
                    <small>sur {allPatients.length} patients</small>
                  </strong>
                  <div className="progress">
                    <i style={{ width: `${(done.size / allPatients.length) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <span>À transmettre</span>
                  <strong>
                    {String(Math.max(0, allPatients.length - done.size)).padStart(2, '0')}
                    <small>dossiers à compléter</small>
                  </strong>
                  <div className="stat-line amber" />
                </div>
              </div>
              <div className="home-grid">
                <section className="panel tour-panel">
                  <div className="section-title">
                    <div>
                      <span className="eyebrow">VOTRE MATINÉE</span>
                      <h2>La tournée du jour</h2>
                    </div>
                    <span className="soft-tag">07:30 — 10:20</span>
                  </div>
                  <label className="search">
                    <Icon name="search" />
                    <input
                      aria-label="Rechercher dans la tournée"
                      placeholder="Un patient, un soin, un quartier…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                  <div className="tour-list">
                    {filtered.filter((p) => p.time < '12:30').map((p) => (
                      <Link className="tour-row" key={p.id} href={`/patients/${p.id}`}>
                        <time>{p.time}</time>
                        <span className={`avatar tone-${Number(p.id) % 3}`}>{p.initials}</span>
                        <div className="tour-info">
                          <strong>{p.name}</strong>
                          <span>{p.care}</span>
                          <small>{p.sector}</small>
                        </div>
                        <span className={`status ${done.has(p.id) ? 'complete' : ''}`}>
                          {done.has(p.id) ? 'Transmis' : 'À transmettre'}
                        </span>
                        <span className="row-arrow">↗</span>
                      </Link>
                    ))}
                    {filtered.filter((p) => p.time < '12:30').length === 0 && (
                      <p className="empty">Aucun patient ne correspond à votre recherche.</p>
                    )}
                  </div>
                </section>
                <div className="right-stack">
                  <section className="voice-card">
                    <span className="soft-tag">LA VOIX AU SERVICE DU SOIN</span>
                    <div className="wave" aria-hidden="true">
                      {[18, 32, 52, 28, 68, 90, 48, 72, 38, 60, 24, 42, 18].map((h, i) => (
                        <i key={i} style={{ height: h }} />
                      ))}
                    </div>
                    <h2>
                      Une visite racontée.
                      <br />
                      Une relève facilitée.
                    </h2>
                    <p>Essayez une transmission structurée en données, actions et résultats.</p>
                    <Link className="button light" href="/transmission">
                      Essayer le scénario <span>→</span>
                    </Link>
                    <small>Simulation guidée · aucun microphone utilisé</small>
                  </section>
                  <section className="panel attention-card">
                    <span className="eyebrow">POUR LA CONTINUITÉ DES SOINS</span>
                    <h2>
                      À garder en tête <span className="count">1</span>
                    </h2>
                    <Link href="/patients/3">
                      <span className="attention-dot" />
                      <div>
                        <strong>Nadia Benali</strong>
                        <p>Compte rendu de sortie attendu</p>
                        <small>À vérifier avec le cabinet · suivi administratif</small>
                      </div>
                      <span>↗</span>
                    </Link>
                  </section>
                </div>
              </div>
            </>
          )}
          {view === 'patients' && (
            <>
              <div className="patient-toolbar">
                <label className="search">
                  <Icon name="search" />
                  <input
                    aria-label="Rechercher un patient"
                    placeholder="Nom, soin ou quartier…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <div className="segments">
                  <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
                    Tous les patients
                  </button>
                  <button aria-pressed={filter === 'pending'} onClick={() => setFilter('pending')}>
                    À transmettre
                  </button>
                </div>
                <button className="button primary" onClick={() => setNewPatientOpen(true)}>
                  <Icon name="person_add" />
                  Patient fictif
                </button>
              </div>
              <p className="result-count">
                {filtered.length} patient{filtered.length > 1 ? 's' : ''} · Identités entièrement
                fictives
              </p>
              <div className="patient-grid">
                {filtered.map((p) => (
                  <Link className="panel patient-card" href={`/patients/${p.id}`} key={p.id}>
                    <div className="patient-card-top">
                      <span className={`avatar tone-${Number(p.id) % 3}`}>{p.initials}</span>
                      <span className={`status ${done.has(p.id) ? 'complete' : ''}`}>
                        {done.has(p.id) ? 'Transmis' : 'À transmettre'}
                      </span>
                    </div>
                    <h2>{p.name}</h2>
                    <p>
                      {p.age} ans · {p.district}
                    </p>
                    <div className="care-line">
                      <Icon name="medical_services" />
                      {p.care}
                    </div>
                    <div className="card-bottom">
                      <span>Passage à {p.time}</span>
                      <strong>Ouvrir le dossier ↗</strong>
                    </div>
                  </Link>
                ))}
              </div>
              {!filtered.length && (
                <div className="panel empty">
                  Aucun patient trouvé.{' '}
                  <button
                    onClick={() => {
                      setSearch('');
                      setFilter('all');
                    }}
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </>
          )}
          {view === 'patient' &&
            (!patient ? (
              <section className="panel empty">
                <h2>Ce patient ne fait pas partie de la démo.</h2>
                <Link className="button primary" href="/patients">
                  Voir les {allPatients.length} patients
                </Link>
              </section>
            ) : (
              <>
                <Link className="back-link" href="/patients">
                  ← Tous les patients
                </Link>
                <section className="panel patient-summary">
                  <span className={`avatar large tone-${Number(patient.id) % 3}`}>
                    {patient.initials}
                  </span>
                  <div>
                    <span className="eyebrow">DOSSIER FICTIF · CV-00{patient.id}</span>
                    <h2>{patient.name}</h2>
                    <p>
                      {patient.age} ans · {patient.district}
                    </p>
                    <span>{patient.context}</span>
                  </div>
                  <div className="patient-summary-actions">
                    <Link className="button primary" href={`/transmission?patient=${patient.id}`}>
                      <Icon name="mic" />
                      Transmettre ce passage
                    </Link>
                    <button
                      className="button secondary"
                      onClick={() => {
                        const next = [...archivedIds, patient.id];
                        setArchivedIds(next);
                        sessionStorage.setItem('carevoice-demo-archived-v1', JSON.stringify(next));
                        setNotice(`${patient.name} a été retiré de la tournée de démonstration.`);
                        window.location.href = '/patients';
                      }}
                    >
                      Retirer de la tournée
                    </button>
                  </div>
                </section>
                <div className="detail-grid">
                  <aside>
                    <section className="panel detail-aside">
                      <span className="eyebrow">LE PROCHAIN PASSAGE</span>
                      <h3>{patient.care}</h3>
                      <p>
                        <Icon name="schedule" />
                        Tournée de démo · {patient.time}
                      </p>
                      <hr />
                      <span className="eyebrow">POINT D’ATTENTION</span>
                      <p>{patient.attention}</p>
                      <hr />
                      <span className="eyebrow">POUR LA RELÈVE</span>
                      <p>{patient.followup}</p>
                      <hr />
                      <span className="eyebrow">AU DOMICILE</span>
                      <p><Icon name="location_on" />{patient.address}</p>
                      <p><Icon name="event_repeat" />{patient.frequency}</p>
                      <p><Icon name="stethoscope" />{patient.doctor}</p>
                      {patient.warnings.map((warning) => (
                        <p className="clinical-warning" key={warning}><Icon name="warning" />{warning}</p>
                      ))}
                    </section>
                  </aside>
                  <section className="history">
                    <div className="section-title">
                      <h2>Transmissions</h2>
                      <span className="soft-tag">Données · Actions · Résultats</span>
                    </div>
                    {records
                      .filter((r) => r.patientId === patient.id)
                      .map((r) => (
                        <article className="panel history-card" key={r.id}>
                          <div className="history-heading">
                            <div>
                              <span className="eyebrow">CETTE SESSION DE DÉMONSTRATION</span>
                              <h3>Passage du matin</h3>
                              <small>
                                Validée par Julie Renaud ·{' '}
                                {new Date(r.savedAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </small>
                            </div>
                            <span className="status complete">Validée</span>
                          </div>
                          <Dar data={r} />
                        </article>
                      ))}
                    <article className="panel history-card">
                      <div className="history-heading">
                        <div>
                          <span className="eyebrow">LUNDI 14 SEPTEMBRE 2026</span>
                          <h3>Dernier passage</h3>
                          <small>Exemple de transmission · Marc Thomas, IDEL</small>
                        </div>
                        <span className="soft-tag">Historique fictif</span>
                      </div>
                      <Dar data={patient.previous} />
                    </article>
                  </section>
                </div>
              </>
            ))}
          {view === 'transmission' && (
            <>
              <ol className="steps">
                {['Choisir le patient', 'Simuler la dictée', 'Relire et valider'].map((step, i) => (
                  <li
                    className={
                      (
                        phase === 'idle'
                          ? i === 0
                          : phase === 'playing' || phase === 'paused'
                            ? i === 1
                            : i === 2
                      )
                        ? 'active'
                        : ''
                    }
                    key={step}
                  >
                    <span>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="transmission-grid">
                <div>
                  <section className="panel patient-select">
                    <label htmlFor="patient-select" className="eyebrow">
                      À QUI CONCERNE CE PASSAGE ?
                    </label>
                    <select
                      id="patient-select"
                      disabled={phase !== 'idle'}
                      value={selectedId}
                      onChange={(e) => {
                        setSelectedId(e.target.value);
                        setDraft({ ...allPatients.find((p) => p.id === e.target.value)!.draft });
                        setChecked(false);
                      }}
                    >
                      {allPatients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {p.care}
                        </option>
                      ))}
                    </select>
                    <p>{selected.context}</p>
                  </section>
                  <section className={`recorder ${phase === 'playing' ? 'is-playing' : ''}`}>
                    <span className="soft-tag">
                      {phase === 'idle'
                        ? 'EXEMPLE PRÊT À DÉCOUVRIR'
                        : phase === 'playing'
                          ? 'DICTÉE SIMULÉE EN COURS'
                          : phase === 'paused'
                            ? 'SIMULATION EN PAUSE'
                            : 'SIMULATION TERMINÉE'}
                    </span>
                    <div className="wave" aria-hidden="true">
                      {[22, 44, 66, 36, 90, 56, 76, 42, 64, 30, 20].map((h, i) => (
                        <i key={i} style={{ height: h, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                    <strong className="timer">00:{String(seconds).padStart(2, '0')}</strong>
                    <p>Un scénario préparé, sans enregistrement audio.</p>
                    <div className="recorder-actions">
                      {phase === 'idle' && (
                        <button
                          className="button light"
                          disabled={!ready}
                          onClick={() => {
                            setSeconds(0);
                            setPhase('playing');
                          }}
                        >
                          <Icon name="play_arrow" />
                          Lancer la simulation
                        </button>
                      )}
                      {(phase === 'playing' || phase === 'paused') && (
                        <>
                          <button
                            className="button light"
                            onClick={() => setPhase(phase === 'playing' ? 'paused' : 'playing')}
                          >
                            <Icon name={phase === 'playing' ? 'pause' : 'play_arrow'} />
                            {phase === 'playing' ? 'Pause' : 'Reprendre'}
                          </button>
                          <button
                            className="button outline-light"
                            onClick={() => {
                              setSeconds(12);
                              setPhase('review');
                            }}
                          >
                            Passer à la relecture →
                          </button>
                        </>
                      )}
                      {(phase === 'review' || phase === 'saved') && (
                        <button
                          className="button outline-light"
                          onClick={() => {
                            setPhase('idle');
                            setSeconds(0);
                            setDraft({ ...selected.draft });
                            setChecked(false);
                          }}
                        >
                          Nouvel essai
                        </button>
                      )}
                    </div>
                  </section>
                  <section className="panel transcript">
                    <span className="eyebrow">LE RÉCIT DU PASSAGE · TEXTE D’EXEMPLE</span>
                    <p>
                      {phase === 'idle'
                        ? 'Lancez le scénario pour voir apparaître le récit du soin. Vous pourrez ensuite corriger la proposition avant de la valider.'
                        : selected.dictation.slice(
                            0,
                            phase === 'playing' || phase === 'paused'
                              ? Math.ceil((selected.dictation.length * seconds) / 12)
                              : undefined,
                          )}
                    </p>
                  </section>
                </div>
                <section className="panel review">
                  <div className="section-title">
                    <div>
                      <span className="eyebrow">TRANSMISSION STRUCTURÉE</span>
                      <h2>Votre regard fait la différence.</h2>
                    </div>
                    <Icon name="edit_note" />
                  </div>
                  <p className="review-intro">
                    La proposition d’exemple est modifiable. Chaque transmission reste soumise à
                    votre relecture.
                  </p>
                  {phase === 'idle' || phase === 'playing' || phase === 'paused' ? (
                    <div className="review-placeholder">
                      <Icon name="notes" />
                      <h3>La synthèse apparaîtra ici</h3>
                      <p>
                        Un espace pour les observations, les soins réalisés et les résultats
                        constatés.
                      </p>
                      {keys.map((k, i) => (
                        <div key={k}>
                          <span>{['D', 'A', 'R'][i]}</span>
                          {labels[k]}
                          <i />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="review-fields">
                        {keys.map((key, i) => (
                          <label key={key}>
                            <span className="dar-label">
                              <b>{['D', 'A', 'R'][i]}</b>
                              {labels[key]}
                            </span>
                            <textarea
                              value={draft[key]}
                              readOnly={phase === 'saved'}
                              onChange={(e) => {
                                setDraft({ ...draft, [key]: e.target.value });
                                setChecked(false);
                              }}
                              rows={4}
                            />
                          </label>
                        ))}
                      </div>
                      {phase === 'review' ? (
                        <>
                          <label className="review-check">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => setChecked(e.target.checked)}
                            />
                            J’ai relu les trois rubriques et vérifié le patient sélectionné.
                          </label>
                          <button
                            className="button primary full"
                            disabled={!checked || keys.some((k) => !draft[k].trim())}
                            onClick={save}
                          >
                            <Icon name="check_circle" />
                            Valider la transmission de démo
                          </button>
                          <small className="storage-note">
                            Conservée dans cet onglet uniquement. Aucune donnée envoyée.
                          </small>
                        </>
                      ) : (
                        <div className="save-success">
                          <Icon name="check_circle" />
                          <strong>La relève peut retrouver votre transmission.</strong>
                          <Link className="button primary full" href={`/patients/${selected.id}`}>
                            Voir le dossier mis à jour →
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </section>
              </div>
            </>
          )}
          <footer className="cv-footer">
            <span>CareVoice · Démonstration de parcours · Patients et observations fictifs</span>
            <button onClick={() => setResetOpen(true)}>Réinitialiser la démo</button>
          </footer>
        </div>
      </main>
      <nav className="mobile-nav" aria-label="Navigation mobile">
        <Link href="/" aria-current={view === 'home' ? 'page' : undefined}>
          <Icon name="home" />
          Accueil
        </Link>
        <Link
          href="/patients"
          aria-current={view === 'patients' || view === 'patient' ? 'page' : undefined}
        >
          <Icon name="group" />
          Patients
        </Link>
        <Link href="/trajet">
          <Icon name="route" />
          Trajet
        </Link>
        <Link href="/transmission" aria-current={view === 'transmission' ? 'page' : undefined}>
          <Icon name="mic" />
          Transmettre
        </Link>
        <Link href="/messagerie">
          <Icon name="forum" />
          Messages
        </Link>
      </nav>
      {view !== 'transmission' && (
        <Link
          className="floating-mic"
          href="/transmission"
          aria-label="Ouvrir la transmission vocale"
        >
          <Icon name="mic" />
          <span>Dicter</span>
        </Link>
      )}
      {newPatientOpen && (
        <div className="modal-backdrop" onClick={() => setNewPatientOpen(false)}>
          <section
            className="panel modal patient-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Ajouter un patient fictif"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close icon-button" onClick={() => setNewPatientOpen(false)}>×</button>
            <span className="eyebrow">MODE TEST · DONNÉES FICTIVES</span>
            <h2>Ajouter un patient à la tournée</h2>
            <div className="soft-alert warning-alert">
              <Icon name="privacy_tip" />
              Utilisez uniquement une identité et des coordonnées inventées. Ne saisissez aucune donnée réelle.
            </div>
            <form className="feature-form" onSubmit={addPatient}>
              <div className="form-two">
                <label>Nom fictif<input name="name" required placeholder="Ex. Louise Chevalier" /></label>
                <label>Âge<input name="age" type="number" min="18" max="110" required defaultValue="74" /></label>
              </div>
              <label>Soin principal<input name="care" required placeholder="Ex. Pansement post-opératoire" /></label>
              <div className="form-two">
                <label>Quartier<select name="district" required defaultValue=""><option value="" disabled>Choisir un quartier</option><option>Centre-ville</option><option>Hauts-Pavés · Saint-Félix</option><option>Île de Nantes</option><option>Doulon · Bottière</option><option>Bellevue · Chantenay</option><option>Nantes Nord</option></select></label>
                <label>Horaire<input name="time" type="time" required defaultValue="11:45" /></label>
              </div>
              <label>Adresse fictive<input name="address" required placeholder="Ex. 10 rue Exemple, 44000 Nantes" /></label>
              <div className="form-two">
                <label>Médecin fictif<input name="doctor" required placeholder="Ex. Dr Camille Martin" /></label>
                <label>Fréquence<input name="frequency" required placeholder="Ex. Tous les matins" /></label>
              </div>
              <label>Point d’attention fictif<input name="warning" placeholder="Ex. Risque de chute" /></label>
              <button className="button primary full"><Icon name="person_add" /> Ajouter à la démo</button>
            </form>
          </section>
        </div>
      )}
      {(guide || resetOpen) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setGuide(false);
            setResetOpen(false);
          }}
        >
          <section
            className="panel modal"
            role="dialog"
            aria-modal="true"
            aria-label={guide ? 'Guide de présentation' : 'Réinitialiser la démonstration'}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setGuide(false);
                setResetOpen(false);
              }
            }}
          >
            <button
              autoFocus
              className="modal-close icon-button"
              aria-label="Fermer"
              onClick={() => {
                setGuide(false);
                setResetOpen(false);
              }}
            >
              ×
            </button>
            <span className="eyebrow">
              {guide ? 'PARCOURS TERRAIN · 10 MINUTES' : 'REPARTIR DU SCÉNARIO INITIAL'}
            </span>
            <h2>{guide ? 'Du passage à la relève.' : 'Réinitialiser la démo ?'}</h2>
            {guide ? (
              <>
                <ol className="guide-list">
                  <li>
                    <strong>Préparez la tournée.</strong>
                    <p>
                      Dans Tournées, déplacez un patient entre matin, soir et cabinet puis ajoutez une consigne.
                    </p>
                  </li>
                  <li>
                    <strong>Vérifiez un dossier au domicile.</strong>
                    <p>
                      Ouvrez Jeanne Morel et repérez le soin, l’adresse fictive, les alertes et le dernier passage.
                    </p>
                  </li>
                  <li>
                    <strong>Dictez, corrigez et validez.</strong>
                    <p>
                      Lancez la simulation, corrigez une rubrique DAR et confirmez votre relecture.
                    </p>
                  </li>
                  <li>
                    <strong>Préparez la relève.</strong>
                    <p>
                      Retrouvez la transmission dans le dossier et consultez le fil global Transmissions.
                    </p>
                  </li>
                </ol>
                <p className="guide-note">
                  Testez uniquement avec des informations inventées. L’audio et l’extraction sont simulés ; les modifications restent dans cet onglet.
                </p>
                <Link
                  className="button primary full"
                  href="/transmission"
                  onClick={() => setGuide(false)}
                >
                  Essayer la transmission →
                </Link>
              </>
            ) : (
              <>
                <p>
                  Les transmissions, patients ajoutés, affectations, notes et messages créés dans cet onglet seront effacés. Les dix dossiers fictifs initiaux resteront disponibles.
                </p>
                <button className="button primary full" onClick={reset}>
                  Réinitialiser
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
