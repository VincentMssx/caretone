'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Patient, patients, readRecords, SavedRecord } from '../lib/demo';
import './demo.css';

export type FeatureView =
  | 'tours'
  | 'team'
  | 'transmissions'
  | 'planning'
  | 'route'
  | 'professionals'
  | 'billing'
  | 'messages'
  | 'notes'
  | 'settings';

type Quote = {
  id: string;
  patient: string;
  code: string;
  description: string;
  amount: number;
  status: 'Brouillon' | 'Validée' | 'Télétransmise';
};

type Memo = {
  id: string;
  title: string;
  content: string;
  category: string;
  patient?: string;
  pinned: boolean;
};

type Conversation = {
  id: string;
  name: string;
  role: string;
  initials: string;
  unread: number;
  messages: { mine: boolean; text: string; time: string }[];
};

const featureMeta: Record<FeatureView, { title: string; eyebrow: string; description: string }> = {
  tours: {
    title: 'Construisez les tournées en un coup d’œil.',
    eyebrow: 'TOURNÉES · RÉPARTITION DES PATIENTS',
    description:
      'Affectez chaque patient au matin, au soir ou au cabinet, puis précisez l’ordre et la consigne de soin.',
  },
  team: {
    title: 'Répartissez la semaine entre collègues.',
    eyebrow: 'ÉQUIPE · PLANNING DU CABINET',
    description:
      'Visualisez les gardes, les demandes en attente et la charge de chaque infirmière.',
  },
  transmissions: {
    title: 'Toute la relève, dans un même fil.',
    eyebrow: 'TRANSMISSIONS · HISTORIQUE DU CABINET',
    description:
      'Retrouvez les DAR, les constantes et leurs versions avant de préparer la relève.',
  },
  planning: {
    title: 'Une tournée qui s’adapte à votre journée.',
    eyebrow: 'PLANNING · ORGANISATION DES PASSAGES',
    description:
      'Visualisez les horaires, les durées et les contraintes sans perdre le fil des soins.',
  },
  route: {
    title: 'Le bon ordre, au bon moment.',
    eyebrow: 'TRAJET · TOURNÉE DU MATIN',
    description: 'Préparez un itinéraire lisible et conservez les horaires impératifs.',
  },
  professionals: {
    title: 'Les bons contacts autour du patient.',
    eyebrow: 'PROFESSIONNELS DE SANTÉ',
    description: 'Médecins, pharmacies et partenaires de soins réunis dans un même répertoire.',
  },
  billing: {
    title: 'Des cotations faciles à relire.',
    eyebrow: 'COTATIONS · SUIVI DE LA JOURNÉE',
    description: 'Préparez les actes de la tournée et repérez ce qui reste à valider.',
  },
  messages: {
    title: 'La coordination, sans chercher l’information.',
    eyebrow: 'MESSAGERIE DE DÉMONSTRATION',
    description: 'Un aperçu des échanges avec le cabinet et les professionnels de santé.',
  },
  notes: {
    title: 'Vos pense-bêtes restent à portée de main.',
    eyebrow: 'NOTES PERSONNELLES · DÉMO',
    description: 'Consignes de tournée, matériel et rappels administratifs dans un espace dédié.',
  },
  settings: {
    title: 'Un espace réglé pour votre pratique.',
    eyebrow: 'PARAMÈTRES DE DÉMONSTRATION',
    description: 'Personnalisez les rappels, la dictée et l’affichage de votre tournée.',
  },
};

const professionals = [
  {
    id: 'pro-1',
    name: 'Dr Claire Moreau',
    role: 'Médecin généraliste',
    initials: 'CM',
    phone: '02 40 00 00 14',
    email: 'cabinet.moreau@exemple.fr',
    address: '12 place des Tilleuls',
    patients: ['Jeanne Morel', 'André Bernard', 'Paul Garnier'],
  },
  {
    id: 'pro-2',
    name: 'Dr Malik Rahmani',
    role: 'Chirurgien orthopédiste',
    initials: 'MR',
    phone: '02 40 00 00 27',
    email: 'secretariat.rahmani@exemple.fr',
    address: 'Clinique du Parc · Bâtiment B',
    patients: ['Nadia Benali'],
  },
  {
    id: 'pro-3',
    name: 'Pharmacie des Jardins',
    role: 'Pharmacie partenaire',
    initials: 'PJ',
    phone: '02 40 00 00 39',
    email: 'contact@pharmacie-jardins.exemple',
    address: '4 avenue des Jardins',
    patients: ['Hélène Rousseau', 'Lucien Petit'],
  },
  {
    id: 'pro-4',
    name: 'Cabinet Kiné Horizon',
    role: 'Masseur-kinésithérapeute',
    initials: 'KH',
    phone: '02 40 00 00 45',
    email: 'accueil@kine-horizon.exemple',
    address: '8 rue du Centre',
    patients: ['Nadia Benali', 'Paul Garnier'],
  },
];

const initialQuotes: Quote[] = [
  {
    id: 'q1',
    patient: 'Jeanne Morel',
    code: 'AMI 4 + MCI',
    description: 'Pansement complexe',
    amount: 18.9,
    status: 'Validée',
  },
  {
    id: 'q2',
    patient: 'André Bernard',
    code: 'AMI 1',
    description: 'Surveillance et contrôle',
    amount: 3.15,
    status: 'Brouillon',
  },
  {
    id: 'q3',
    patient: 'Nadia Benali',
    code: 'AMI 2,5',
    description: 'Surveillance post-opératoire',
    amount: 7.88,
    status: 'Télétransmise',
  },
  {
    id: 'q4',
    patient: 'Lucien Petit',
    code: 'AIS 3',
    description: 'Séance de soins infirmiers',
    amount: 7.95,
    status: 'Brouillon',
  },
];

const initialNotes: Memo[] = [
  {
    id: 'n1',
    title: 'Matériel de pansement',
    content: 'Préparer compresses et bandes avant le passage chez Jeanne.',
    category: 'Tournée',
    patient: 'Jeanne Morel',
    pinned: true,
  },
  {
    id: 'n2',
    title: 'Compte rendu à relancer',
    content: 'Appeler le secrétariat de la clinique pour Nadia.',
    category: 'Coordination',
    patient: 'Nadia Benali',
    pinned: true,
  },
  {
    id: 'n3',
    title: 'Commande cabinet',
    content: 'Vérifier le stock de collecteurs et de gants taille M.',
    category: 'Cabinet',
    pinned: false,
  },
  {
    id: 'n4',
    title: 'Remplacement vendredi',
    content: 'Transmettre les horaires impératifs de la tournée du matin.',
    category: 'Administratif',
    pinned: false,
  },
];

const initialConversations: Conversation[] = [
  {
    id: 'c1',
    name: 'Dr Claire Moreau',
    role: 'Médecin généraliste',
    initials: 'CM',
    unread: 1,
    messages: [
      {
        mine: false,
        text: 'Bonjour Julie, pouvez-vous me confirmer le prochain contrôle de Mme Morel ?',
        time: '08:12',
      },
      {
        mine: true,
        text: 'Oui, le prochain passage est prévu demain matin. Je vous tiens informée après le soin.',
        time: '08:18',
      },
      {
        mine: false,
        text: 'Merci. Vous pouvez joindre une synthèse dans la relève.',
        time: '08:21',
      },
    ],
  },
  {
    id: 'c2',
    name: 'Cabinet des Tilleuls',
    role: 'Équipe infirmière',
    initials: 'CT',
    unread: 0,
    messages: [
      { mine: false, text: 'Le matériel de la tournée du soir est prêt au cabinet.', time: 'Hier' },
      {
        mine: true,
        text: 'Parfait, merci. Les transmissions du matin seront finalisées avant midi.',
        time: 'Hier',
      },
    ],
  },
  {
    id: 'c3',
    name: 'Pharmacie des Jardins',
    role: 'Pharmacie partenaire',
    initials: 'PJ',
    unread: 0,
    messages: [
      {
        mine: false,
        text: 'Le traitement de Mme Rousseau est disponible à partir de 14 h.',
        time: 'Lun.',
      },
    ],
  },
];

function useDemoState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) setValue(JSON.parse(saved) as T);
    } catch {
      // La démo reste utilisable si le stockage de session est bloqué.
    }
  }, [key]);
  const setPersistedValue = (nextValue: React.SetStateAction<T>) => {
    setValue((current) => {
      const next = typeof nextValue === 'function'
        ? (nextValue as (previous: T) => T)(current)
        : nextValue;
      try {
        sessionStorage.setItem(key, JSON.stringify(next));
      } catch {
        // La modification reste active en mémoire pour la session courante.
      }
      return next;
    });
  };
  return [value, setPersistedValue] as const;
}

function Icon({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className="material-symbols-outlined">
      {name}
    </span>
  );
}

function Sidebar({ view }: { view: FeatureView }) {
  const main = [
    ['/', 'space_dashboard', 'Ma tournée'],
    ['/patients', 'group', 'Patients'],
    ['/tournees', 'view_week', 'Tournées'],
    ['/planning', 'calendar_month', 'Planning'],
    ['/equipe', 'groups', 'Équipe'],
    ['/trajet', 'route', 'Trajet'],
    ['/transmissions', 'graphic_eq', 'Transmissions'],
  ];
  const cabinet = [
    ['/professionnels', 'stethoscope', 'Professionnels', 'professionals'],
    ['/cotations', 'calculate', 'Cotations', 'billing'],
    ['/messagerie', 'forum', 'Messagerie', 'messages'],
    ['/notes', 'sticky_note_2', 'Notes', 'notes'],
    ['/parametres', 'settings', 'Paramètres', 'settings'],
  ];
  return (
    <aside className="cv-sidebar feature-sidebar">
      <Link href="/" className="cv-brand">
        <span className="brand-mark">
          <Icon name="graphic_eq" />
        </span>
        carevoice<span className="brand-dot">.</span>
      </Link>
      <div className="cabinet">
        ESPACE INFIRMIER<span>Cabinet des Tilleuls</span>
      </div>
      <div className="feature-nav-scroll">
        <nav aria-label="Navigation principale">
          {main.map(([href, icon, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                (view === 'planning' && href === '/planning') ||
                (view === 'tours' && href === '/tournees') ||
                (view === 'team' && href === '/equipe') ||
                (view === 'transmissions' && href === '/transmissions') ||
                (view === 'route' && href === '/trajet')
                  ? 'page'
                  : undefined
              }
            >
              <Icon name={icon} />
              {label}
            </Link>
          ))}
        </nav>
        <span className="nav-section-label">CABINET</span>
        <nav aria-label="Outils du cabinet">
          {cabinet.map(([href, icon, label, id]) => (
            <Link key={href} href={href} aria-current={view === id ? 'page' : undefined}>
              <Icon name={icon} />
              {label}
              {label === 'Messagerie' && <span className="nav-count">1</span>}
            </Link>
          ))}
        </nav>
      </div>
      <div className="profile compact-profile">
        <span className="avatar small">JR</span>
        <div>
          <strong>Julie Renaud</strong>
          <small>Infirmière libérale · Démo</small>
        </div>
        <Icon name="verified" />
      </div>
    </aside>
  );
}

function Shell({
  view,
  children,
  notice,
  clearNotice,
}: {
  view: FeatureView;
  children: React.ReactNode;
  notice: string;
  clearNotice: () => void;
}) {
  const meta = featureMeta[view];
  return (
    <div className="cv-app">
      <Sidebar view={view} />
      <main className="cv-main">
        <header className="cv-top">
          <span>
            Cabinet des Tilleuls <span className="top-divider">/</span>{' '}
            {view === 'route'
              ? 'Trajet'
              : view === 'billing'
                ? 'Cotations'
                : meta.eyebrow.split(' · ')[0]}
          </span>
          <div>
            <span className="demo-pill">
              <i />
              Démonstration · données fictives
            </span>
            <Link className="icon-button" href="/parametres" aria-label="Ouvrir les paramètres">
              <Icon name="settings" />
            </Link>
          </div>
        </header>
        <div className="cv-content feature-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">{meta.eyebrow}</span>
              <h1>{meta.title}</h1>
              <p>{meta.description}</p>
            </div>
            {view !== 'messages' && (
              <Link className="button primary" href="/transmission">
                <Icon name="mic" />
                Nouvelle transmission
              </Link>
            )}
          </div>
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button aria-label="Fermer le message" onClick={clearNotice}>
                ×
              </button>
            </div>
          )}
          {children}
          <footer className="cv-footer">
            <span>CareVoice · Module inspiré de Caretone · Données entièrement fictives</span>
            <Link href="/">Retour à la tournée</Link>
          </footer>
        </div>
      </main>
      <nav className="mobile-nav" aria-label="Navigation mobile">
        <Link href="/">
          <Icon name="home" />
          Accueil
        </Link>
        <Link href="/patients">
          <Icon name="group" />
          Patients
        </Link>
        <Link href="/trajet" aria-current={view === 'route' ? 'page' : undefined}>
          <Icon name="route" />
          Trajet
        </Link>
        <Link href="/transmission">
          <Icon name="mic" />
          Transmettre
        </Link>
        <Link href="/messagerie" aria-current={view === 'messages' ? 'page' : undefined}>
          <Icon name="forum" />
          Messages
        </Link>
      </nav>
      {view !== 'settings' && (
        <Link
          className="floating-mic"
          href="/transmission"
          aria-label="Ouvrir la transmission vocale"
        >
          <Icon name="mic" />
          <span>Dicter</span>
        </Link>
      )}
    </div>
  );
}

export default function FeatureApp({ view }: { view: FeatureView }) {
  const [notice, setNotice] = useState('');
  return (
    <Shell view={view} notice={notice} clearNotice={() => setNotice('')}>
      {view === 'planning' && <Planning setNotice={setNotice} />}
      {view === 'tours' && <Tours setNotice={setNotice} />}
      {view === 'team' && <TeamPlanning setNotice={setNotice} />}
      {view === 'transmissions' && <TransmissionHub setNotice={setNotice} />}
      {view === 'route' && <RoutePlanner setNotice={setNotice} />}
      {view === 'professionals' && <Professionals />}
      {view === 'billing' && <Billing setNotice={setNotice} />}
      {view === 'messages' && <Messages setNotice={setNotice} />}
      {view === 'notes' && <Notes setNotice={setNotice} />}
      {view === 'settings' && <Settings setNotice={setNotice} />}
    </Shell>
  );
}

type TourId = 'morning' | 'evening' | 'office';
type TourAssignment = { tourId: TourId; order: number; note: string };

const tourColumns: { id: TourId; label: string; hours: string; icon: string }[] = [
  { id: 'morning', label: 'Matin', hours: '07:00–12:30', icon: 'wb_sunny' },
  { id: 'evening', label: 'Soir', hours: '16:30–20:00', icon: 'dark_mode' },
  { id: 'office', label: 'Cabinet', hours: 'Sur rendez-vous', icon: 'home_health' },
];

function initialTourAssignments(): Record<string, TourAssignment[]> {
  return Object.fromEntries(
    patients.map((patient, index) => [
      patient.id,
      index < 8
        ? [
            { tourId: 'morning' as TourId, order: index + 1, note: patient.attention },
            ...(patient.id === '2'
              ? [{ tourId: 'evening' as TourId, order: 1, note: 'Contrôle avant le dîner' }]
              : []),
          ]
        : [{ tourId: 'evening' as TourId, order: index - 7, note: patient.attention }],
    ]),
  );
}

function Tours({ setNotice }: { setNotice: (message: string) => void }) {
  const [customPatients] = useDemoState<Patient[]>('carevoice-demo-patients-v1', []);
  const tourPatients = [...patients, ...customPatients];
  const [assignments, setAssignments] = useDemoState('carevoice-demo-tours-v1', initialTourAssignments());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'multiple'>('all');
  const [editing, setEditing] = useState<{ patientId: string; tourId: TourId } | null>(null);
  const normalized = search.toLocaleLowerCase('fr');
  const visiblePatients = tourPatients.filter((patient) => {
    const rows = assignments[patient.id] || [];
    const matches = `${patient.name} ${patient.care} ${patient.district}`
      .toLocaleLowerCase('fr')
      .includes(normalized);
    return (
      matches &&
      (filter === 'all' ||
        (filter === 'unassigned' && rows.length === 0) ||
        (filter === 'multiple' && rows.length > 1))
    );
  });

  function toggle(patientId: string, tourId: TourId) {
    setAssignments((current) => {
      const rows = current[patientId] || [];
      const exists = rows.some((row) => row.tourId === tourId);
      const nextRows = exists
        ? rows.filter((row) => row.tourId !== tourId)
        : [
            ...rows,
            {
              tourId,
              order:
                Object.values(current)
                  .flat()
                  .filter((row) => row.tourId === tourId).length + 1,
              note: tourPatients.find((patient) => patient.id === patientId)?.attention || '',
            },
          ];
      return { ...current, [patientId]: nextRows };
    });
  }

  function updateAssignment(patientId: string, tourId: TourId, patch: Partial<TourAssignment>) {
    setAssignments((current) => ({
      ...current,
      [patientId]: (current[patientId] || []).map((row) =>
        row.tourId === tourId ? { ...row, ...patch } : row,
      ),
    }));
  }

  const counts = Object.values(assignments).flat();
  return (
    <div className="tours-layout">
      <section className="panel feature-panel tours-toolbar">
        <div className="tour-summary">
          {tourColumns.map((tour) => (
            <div key={tour.id}>
              <Icon name={tour.icon} />
              <span>
                <strong>{counts.filter((row) => row.tourId === tour.id).length}</strong>
                {tour.label} · {tour.hours}
              </span>
            </div>
          ))}
        </div>
        <div className="tour-tools">
          <label className="search-box">
            <Icon name="search" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Patient, soin ou quartier…"
            />
          </label>
          <div className="segments">
            {[
              ['all', 'Tous'],
              ['unassigned', 'Non affectés'],
              ['multiple', 'Multi-tournées'],
            ].map(([id, label]) => (
              <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id as typeof filter)}>
                {label}
              </button>
            ))}
          </div>
          <button
            className="button ghost"
            onClick={() => {
              setAssignments(initialTourAssignments());
              setNotice('La répartition de démonstration a été restaurée.');
            }}
          >
            <Icon name="restart_alt" /> Réinitialiser
          </button>
        </div>
      </section>

      <section className="panel tour-matrix-wrap">
        <div className="tour-matrix tour-matrix-head">
          <span>Patient et soin</span>
          {tourColumns.map((tour) => (
            <span key={tour.id}>{tour.label}</span>
          ))}
        </div>
        {visiblePatients.map((patient) => (
          <div className="tour-matrix tour-patient-row" key={patient.id}>
            <Link href={`/patients/${patient.id}`} className="tour-patient">
              <span className={`avatar tone-${Number(patient.id) % 3}`}>{patient.initials}</span>
              <span>
                <strong>{patient.name}</strong>
                <small>{patient.care} · {patient.district}</small>
              </span>
            </Link>
            {tourColumns.map((tour) => {
              const assignment = (assignments[patient.id] || []).find((row) => row.tourId === tour.id);
              const isEditing = editing?.patientId === patient.id && editing.tourId === tour.id;
              return (
                <div className="tour-cell" key={tour.id}>
                  <button
                    className={assignment ? 'tour-toggle selected' : 'tour-toggle'}
                    aria-pressed={Boolean(assignment)}
                    aria-label={`${assignment ? 'Retirer' : 'Affecter'} ${patient.name} à la tournée ${tour.label}`}
                    onClick={() => toggle(patient.id, tour.id)}
                  >
                    <Icon name={assignment ? 'check' : 'add'} />
                  </button>
                  {assignment && (
                    <button
                      className="tour-order"
                      onClick={() => setEditing(isEditing ? null : { patientId: patient.id, tourId: tour.id })}
                    >
                      Passage {assignment.order} · consigne
                    </button>
                  )}
                  {assignment && isEditing && (
                    <div className="tour-editor">
                      <label>
                        Ordre
                        <input
                          type="number"
                          min="1"
                          value={assignment.order}
                          onChange={(event) =>
                            updateAssignment(patient.id, tour.id, { order: Number(event.target.value) })
                          }
                        />
                      </label>
                      <label>
                        Consigne de passage
                        <textarea
                          rows={3}
                          value={assignment.note}
                          onChange={(event) =>
                            updateAssignment(patient.id, tour.id, { note: event.target.value })
                          }
                        />
                      </label>
                      <button
                        className="button primary full"
                        onClick={() => {
                          setEditing(null);
                          setNotice(`Consigne enregistrée pour ${patient.name}.`);
                        }}
                      >
                        Enregistrer
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {visiblePatients.length === 0 && (
          <div className="empty-feature">Aucun patient ne correspond à ce filtre.</div>
        )}
      </section>
      <div className="demo-data-caption">
        Identités, coordonnées et situations cliniques fictives · quartiers et voirie de Nantes utilisés pour la démonstration.
      </div>
    </div>
  );
}

type ShiftStatus = 'Confirmé' | 'En attente' | 'Indisponible';
type Shift = { nurse: string; day: number; period: 'Matin' | 'Soir'; status: ShiftStatus };

const nurses = [
  { name: 'Julie Renaud', initials: 'JR', color: '#255d4b' },
  { name: 'Sophie Martin', initials: 'SM', color: '#a46d3b' },
  { name: 'Thomas Leclerc', initials: 'TL', color: '#64748b' },
];

const baseShifts: Shift[] = [
  { nurse: 'Julie Renaud', day: 0, period: 'Matin', status: 'Confirmé' },
  { nurse: 'Julie Renaud', day: 1, period: 'Matin', status: 'Confirmé' },
  { nurse: 'Julie Renaud', day: 2, period: 'Soir', status: 'En attente' },
  { nurse: 'Julie Renaud', day: 4, period: 'Matin', status: 'Confirmé' },
  { nurse: 'Sophie Martin', day: 0, period: 'Soir', status: 'Confirmé' },
  { nurse: 'Sophie Martin', day: 2, period: 'Matin', status: 'Confirmé' },
  { nurse: 'Sophie Martin', day: 3, period: 'Matin', status: 'En attente' },
  { nurse: 'Sophie Martin', day: 5, period: 'Matin', status: 'Confirmé' },
  { nurse: 'Thomas Leclerc', day: 1, period: 'Soir', status: 'Confirmé' },
  { nurse: 'Thomas Leclerc', day: 3, period: 'Soir', status: 'Confirmé' },
  { nurse: 'Thomas Leclerc', day: 4, period: 'Soir', status: 'Confirmé' },
  { nurse: 'Thomas Leclerc', day: 6, period: 'Matin', status: 'Confirmé' },
];

function TeamPlanning({ setNotice }: { setNotice: (message: string) => void }) {
  const [shifts, setShifts] = useDemoState('carevoice-demo-shifts-v1', baseShifts);
  const [selectedNurse, setSelectedNurse] = useState('Julie Renaud');
  const days = ['Lun. 28', 'Mar. 29', 'Mer. 30', 'Jeu. 1', 'Ven. 2', 'Sam. 3', 'Dim. 4'];

  function toggleShift(day: number, period: 'Matin' | 'Soir') {
    setShifts((current) => {
      const existing = current.find(
        (shift) => shift.nurse === selectedNurse && shift.day === day && shift.period === period,
      );
      if (existing) {
        return current.filter((shift) => shift !== existing);
      }
      return [...current, { nurse: selectedNurse, day, period, status: 'En attente' }];
    });
  }

  const pending = shifts.filter((shift) => shift.status === 'En attente');
  return (
    <div className="team-layout">
      <section className="panel feature-panel">
        <div className="feature-panel-head">
          <div>
            <span className="eyebrow">SEMAINE DU 28 SEPTEMBRE AU 4 OCTOBRE 2026</span>
            <h2>Planning de l’équipe</h2>
          </div>
          <label className="compact-select">
            Modifier les gardes de
            <select value={selectedNurse} onChange={(event) => setSelectedNurse(event.target.value)}>
              {nurses.map((nurse) => <option key={nurse.name}>{nurse.name}</option>)}
            </select>
          </label>
        </div>
        <div className="team-calendar">
          <div className="team-calendar-head"><span>Équipe</span>{days.map((day) => <strong key={day}>{day}</strong>)}</div>
          {nurses.map((nurse) => (
            <div className="team-calendar-row" key={nurse.name}>
              <div className="team-nurse">
                <span className="avatar" style={{ background: nurse.color }}>{nurse.initials}</span>
                <strong>{nurse.name}</strong>
              </div>
              {days.map((_, day) => (
                <div className="team-day" key={day}>
                  {(['Matin', 'Soir'] as const).map((period) => {
                    const shift = shifts.find((item) => item.nurse === nurse.name && item.day === day && item.period === period);
                    return (
                      <button
                        key={period}
                        className={shift ? `shift-chip ${shift.status === 'En attente' ? 'pending' : ''}` : 'shift-chip empty'}
                        disabled={nurse.name !== selectedNurse}
                        onClick={() => toggleShift(day, period)}
                        title={nurse.name === selectedNurse ? 'Ajouter ou retirer cette garde' : 'Sélectionnez cette infirmière pour modifier'}
                      >
                        {shift ? period : '—'}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
      <aside className="side-stack">
        <section className="panel feature-panel">
          <span className="eyebrow">CHARGE DE LA SEMAINE</span>
          {nurses.map((nurse) => {
            const load = shifts.filter((shift) => shift.nurse === nurse.name).length;
            return <div className="load-row" key={nurse.name}><span>{nurse.name}</span><i><b style={{ width: `${load * 16}%` }} /></i><strong>{load} gardes</strong></div>;
          })}
        </section>
        <section className="panel feature-panel">
          <span className="eyebrow">À ARBITRER</span>
          <h3>{pending.length} demande{pending.length > 1 ? 's' : ''} en attente</h3>
          {pending.map((shift, index) => (
            <div className="pending-shift" key={`${shift.nurse}-${shift.day}-${shift.period}`}>
              <span>{shift.nurse}<small>{days[shift.day]} · {shift.period}</small></span>
              <button
                className="icon-button"
                onClick={() => {
                  setShifts((current) => current.map((item) => item === shift ? { ...item, status: 'Confirmé' } : item));
                  setNotice('La garde a été confirmée et la charge de travail recalculée.');
                }}
                aria-label={`Confirmer la garde ${index + 1}`}
              ><Icon name="check" /></button>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}

function TransmissionHub({ setNotice }: { setNotice: (message: string) => void }) {
  const [customPatients] = useDemoState<Patient[]>('carevoice-demo-patients-v1', []);
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState('1');
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCount, setManualCount] = useState(0);
  const hubPatients = [...patients, ...customPatients];
  useEffect(() => {
    try {
      setSavedRecords(readRecords());
    } catch {
      setSavedRecords([]);
    }
  }, []);
  const visible = hubPatients.filter((patient) =>
    `${patient.name} ${patient.care} ${patient.district}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')),
  );
  return (
    <>
      <div className="transmission-hub-layout">
        <section className="panel feature-panel">
          <div className="feature-panel-head">
            <label className="search-box">
              <Icon name="search" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Patient, soin ou quartier…" />
            </label>
            <button className="button secondary" onClick={() => setManualOpen(true)}><Icon name="edit_note" /> Saisie manuelle</button>
          </div>
          <div className="transmission-feed">
            {manualCount > 0 && <div className="soft-alert"><Icon name="check_circle" /> {manualCount} soin manuel ajouté à la relève de démonstration.</div>}
            {visible.map((patient, index) => (
              <article className="transmission-item" key={patient.id}>
                <button className="transmission-summary" onClick={() => setExpanded(expanded === patient.id ? '' : patient.id)}>
                  <span className={`avatar tone-${Number(patient.id) % 3}`}>{patient.initials}</span>
                  <span><strong>{patient.name}</strong><small>{patient.care} · {patient.district}</small></span>
                  <span className="transmission-time">{index < 6 ? patient.time : 'Hier'}<small>v{index % 3 === 0 ? '2' : '1'}</small></span>
                  <Icon name={expanded === patient.id ? 'expand_less' : 'expand_more'} />
                </button>
                {expanded === patient.id && (
                  <div className="transmission-detail">
                    <div className="vitals-row">
                      <span><Icon name="favorite" /> TA {patient.id === '6' ? '130/80' : '—'}</span>
                      <span><Icon name="thermometer" /> 36,8 °C</span>
                      <span><Icon name="monitor_heart" /> 72 bpm</span>
                    </div>
                    <div className="dar-compact">
                      <p><b>D</b>{savedRecords.find((record) => record.patientId === patient.id)?.donnees || patient.previous.donnees}</p>
                      <p><b>A</b>{savedRecords.find((record) => record.patientId === patient.id)?.actions || patient.previous.actions}</p>
                      <p><b>R</b>{savedRecords.find((record) => record.patientId === patient.id)?.resultats || patient.previous.resultats}</p>
                    </div>
                    <div className="transmission-actions">
                      <Link href={`/transmission?patient=${patient.id}`} className="text-link">Créer une nouvelle version →</Link>
                      <small>Validée par Julie Renaud · données fictives</small>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
        <aside className="side-stack">
          <section className="panel feature-panel"><span className="eyebrow">RELÈVE DU MATIN</span><div className="mini-stats"><div><strong>{hubPatients.length}</strong><span>dossiers</span></div><div><strong>2</strong><span>à surveiller</span></div><div><strong>{savedRecords.length}</strong><span>mise à jour</span></div></div></section>
          <section className="panel feature-panel"><span className="eyebrow">POINTS D’ATTENTION</span><p className="feature-copy">Compte rendu opératoire de Nadia encore attendu. Contrôle biologique de Monique prévu vendredi.</p><Link href="/messagerie" className="text-link">Ouvrir la coordination →</Link></section>
        </aside>
      </div>
      {manualOpen && (
        <div className="modal-backdrop">
          <section className="panel modal" role="dialog" aria-modal="true" aria-label="Saisie manuelle d’un soin">
            <button className="modal-close icon-button" onClick={() => setManualOpen(false)}>×</button>
            <span className="eyebrow">SOINS ET CONSTANTES</span><h2>Ajouter un soin manuel</h2>
            <form className="feature-form" onSubmit={(event) => { event.preventDefault(); setManualCount((count) => count + 1); setManualOpen(false); setNotice('Le soin manuel et ses constantes ont été ajoutés à la relève.'); }}>
              <label>Patient<select required defaultValue=""><option value="" disabled>Choisir un patient</option>{hubPatients.map((patient) => <option key={patient.id}>{patient.name}</option>)}</select></label>
              <div className="form-two"><label>Type de soin<input required placeholder="Ex. surveillance tensionnelle" /></label><label>Heure<input type="time" required defaultValue="11:30" /></label></div>
              <div className="form-two"><label>Tension artérielle<input placeholder="Ex. 128/76 mmHg" /></label><label>Température<input placeholder="Ex. 36,8 °C" /></label></div>
              <label>Observation<textarea rows={4} required placeholder="Contexte, soin réalisé et résultat observé…" /></label>
              <button className="button primary full">Ajouter à la relève</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function Planning({ setNotice }: { setNotice: (message: string) => void }) {
  const [period, setPeriod] = useState<'Matin' | 'Soir'>('Matin');
  const [extra, setExtra] = useState(false);
  const morning = patients.slice(0, 8).map((p, i) => ({
    ...p,
    duration: [30, 20, 25, 35, 20, 15, 15, 20][i],
    fixed: i === 0 || i === 2,
  }));
  const evening = [patients[1], ...patients.slice(8)]
    .map((p, i) => ({
      ...p,
      time: ['17:10', '17:50', '18:30'][i],
      duration: [20, 20, 25][i],
      fixed: i === 2,
    }));
  const rows = period === 'Matin' ? morning : evening;
  return (
    <div className="feature-grid planning-layout">
      <section className="panel feature-panel">
        <div className="feature-panel-head">
          <div>
            <span className="eyebrow">LUNDI 28 SEPTEMBRE 2026</span>
            <h2>Planning de la tournée</h2>
          </div>
          <div className="segments">
            <button aria-pressed={period === 'Matin'} onClick={() => setPeriod('Matin')}>
              Matin
            </button>
            <button aria-pressed={period === 'Soir'} onClick={() => setPeriod('Soir')}>
              Soir
            </button>
          </div>
        </div>
        <div className="schedule-list">
          {rows.map((p, i) => (
            <div className="schedule-row" key={p.id}>
              <div className="schedule-time">
                <strong>{p.time}</strong>
                <span>{p.duration} min</span>
              </div>
              <span className={`avatar tone-${Number(p.id) % 3}`}>{p.initials}</span>
              <div>
                <strong>{p.name}</strong>
                <p>{p.care}</p>
                <small>{p.sector}</small>
              </div>
              <span className={p.fixed ? 'constraint fixed' : 'constraint'}>
                {p.fixed ? 'Horaire impératif' : 'Flexible'}
              </span>
              <Link href={`/patients/${p.id}`} aria-label={`Ouvrir le dossier de ${p.name}`}>
                ↗
              </Link>
            </div>
          ))}
          {extra && (
            <div className="schedule-row added-row">
              <div className="schedule-time">
                <strong>11:00</strong>
                <span>20 min</span>
              </div>
              <span className="avatar">+</span>
              <div>
                <strong>Passage ajouté</strong>
                <p>Contrôle et relève téléphonique</p>
                <small>Cabinet des Tilleuls</small>
              </div>
              <span className="constraint">Flexible</span>
            </div>
          )}
        </div>
      </section>
      <aside className="side-stack">
        <section className="panel feature-panel">
          <span className="eyebrow">VUE D’ENSEMBLE</span>
          <div className="mini-stats">
            <div>
              <strong>{rows.length + (extra ? 1 : 0)}</strong>
              <span>passages</span>
            </div>
            <div>
              <strong>{period === 'Matin' ? '2 h 25' : '1 h 05'}</strong>
              <span>de soins</span>
            </div>
            <div>
              <strong>{rows.filter((r) => r.fixed).length}</strong>
              <span>impératifs</span>
            </div>
          </div>
        </section>
        <section className="panel feature-panel">
          <span className="eyebrow">ORGANISER</span>
          <h3>Une demande imprévue ?</h3>
          <p className="feature-copy">
            Ajoutez un passage fictif pour montrer comment le planning s’adapte.
          </p>
          <button
            className="button secondary full"
            disabled={extra}
            onClick={() => {
              setExtra(true);
              setNotice('Un passage fictif a été ajouté à 11:00.');
            }}
          >
            <Icon name="add" />
            Ajouter un passage
          </button>
          <Link className="text-link" href="/trajet">
            Préparer le trajet →
          </Link>
        </section>
      </aside>
    </div>
  );
}

function RoutePlanner({ setNotice }: { setNotice: (message: string) => void }) {
  const [optimized, setOptimized] = useState(false);
  const stops = optimized
    ? [patients[0], patients[1], patients[4], patients[7], patients[6], patients[3], patients[2], patients[5]]
    : patients.slice(0, 8);
  const times = optimized
    ? ['07:30', '08:00', '08:32', '08:55', '09:22', '09:48', '10:18', '10:55']
    : stops.map((p) => p.time);
  return (
    <div className="route-layout">
      <section className="panel route-map">
        <div className="map-top">
          <span className="soft-tag">APERÇU DE LA TOURNÉE</span>
          <span>12,8 km · {optimized ? '41 min' : '52 min'} de trajet estimé</span>
        </div>
        <div className="map-canvas" aria-label="Schéma fictif de l’itinéraire">
          <svg viewBox="0 0 700 360" role="img" aria-label="Trajet du cabinet vers huit patients">
            <path
              d="M55 285 C145 235 110 105 230 115 S360 255 430 190 S520 55 650 90"
              fill="none"
              stroke="#b8c8ad"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="2 15"
            />
            {stops.map((p, i) => {
              const coords = [
                [120, 245],
                [195, 130],
                [305, 170],
                [405, 210],
                [510, 115],
                [620, 92],
                [570, 230],
                [665, 285],
              ][i] || [0, 0];
              return (
                <g key={p.id}>
                  <circle cx={coords[0]} cy={coords[1]} r="19" fill="#255d4b" />
                  <text
                    x={coords[0]}
                    y={coords[1] + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="13"
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}
            <circle cx="55" cy="285" r="22" fill="#d0ad62" />
            <text x="55" y="290" textAnchor="middle" fill="white" fontSize="16">
              C
            </text>
          </svg>
          <div className="map-legend">Schéma de démonstration · aucune géolocalisation réelle</div>
        </div>
      </section>
      <section className="panel route-list-panel">
        <div className="feature-panel-head">
          <div>
            <span className="eyebrow">ORDRE DE PASSAGE</span>
            <h2>Tournée du matin</h2>
          </div>
          <button
            className="button secondary"
            onClick={() => {
              setOptimized(true);
              setNotice(
                'Trajet optimisé : 11 minutes estimées économisées, horaires impératifs conservés.',
              );
            }}
          >
            <Icon name="bolt" />
            Optimiser
          </button>
        </div>
        <div className="route-start">
          <Icon name="flag" />
          <div>
            <strong>Départ · Cabinet des Tilleuls</strong>
            <span>07:20</span>
          </div>
        </div>
        <ol className="route-stops">
          {stops.map((p, i) => (
            <li key={p.id}>
              <span>{i + 1}</span>
              <div>
                <strong>{p.name}</strong>
                <small>{p.care}</small>
              </div>
              <time>{times[i]}</time>
            </li>
          ))}
        </ol>
        <button
          className="button primary full"
          onClick={() =>
            setNotice(
              'L’itinéraire de démonstration est prêt. Dans la version connectée, il pourra être ouvert dans l’application de navigation choisie.',
            )
          }
        >
          <Icon name="navigation" />
          Préparer la navigation
        </button>
      </section>
    </div>
  );
}

function Professionals() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(professionals[0]);
  const filtered = professionals.filter((p) =>
    `${p.name} ${p.role} ${p.patients.join(' ')}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="directory-layout">
      <section>
        <label className="search feature-search">
          <Icon name="search" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, spécialité ou patient…"
          />
        </label>
        <div className="professional-grid">
          {filtered.map((pro) => (
            <button
              key={pro.id}
              className={`panel professional-card ${selected.id === pro.id ? 'selected' : ''}`}
              onClick={() => setSelected(pro)}
            >
              <span className="avatar large">{pro.initials}</span>
              <div>
                <h2>{pro.name}</h2>
                <p>{pro.role}</p>
                <small>
                  {pro.patients.length} patient{pro.patients.length > 1 ? 's' : ''} suivi
                  {pro.patients.length > 1 ? 's' : ''}
                </small>
              </div>
              <span>↗</span>
            </button>
          ))}
        </div>
      </section>
      <aside className="panel contact-card">
        <span className="eyebrow">FICHE PROFESSIONNEL</span>
        <span className="avatar large">{selected.initials}</span>
        <h2>{selected.name}</h2>
        <p>{selected.role}</p>
        <dl>
          <div>
            <dt>Téléphone</dt>
            <dd>{selected.phone}</dd>
          </div>
          <div>
            <dt>E-mail fictif</dt>
            <dd>{selected.email}</dd>
          </div>
          <div>
            <dt>Adresse</dt>
            <dd>{selected.address}</dd>
          </div>
        </dl>
        <span className="eyebrow">PATIENTS PARTAGÉS</span>
        <div className="patient-chips">
          {selected.patients.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
        <Link className="button secondary full" href="/messagerie">
          <Icon name="chat" />
          Ouvrir la messagerie
        </Link>
      </aside>
    </div>
  );
}

function Billing({ setNotice }: { setNotice: (message: string) => void }) {
  const [quotes, setQuotes] = useDemoState('carevoice-demo-quotes-v1', initialQuotes);
  const [open, setOpen] = useState(false);
  const [patient, setPatient] = useState(patients[0].name);
  const [code, setCode] = useState('AMI 1');
  const amount = quotes.reduce((sum, q) => sum + q.amount, 0);
  function add(e: FormEvent) {
    e.preventDefault();
    setQuotes((q) => [
      {
        id: crypto.randomUUID(),
        patient,
        code,
        description: 'Acte ajouté pendant la démonstration',
        amount: code === 'AMI 4 + MCI' ? 18.9 : 3.15,
        status: 'Brouillon',
      },
      ...q,
    ]);
    setOpen(false);
    setNotice('La cotation fictive a été ajoutée en brouillon.');
  }
  return (
    <>
      <div className="billing-stats">
        <div className="panel">
          <span>Actes préparés</span>
          <strong>{quotes.length}</strong>
          <small>pour la tournée</small>
        </div>
        <div className="panel">
          <span>Montant indicatif</span>
          <strong>{amount.toFixed(2)} €</strong>
          <small>démonstration uniquement</small>
        </div>
        <div className="panel">
          <span>À valider</span>
          <strong>{quotes.filter((q) => q.status === 'Brouillon').length}</strong>
          <small>brouillons</small>
        </div>
      </div>
      <section className="panel feature-panel">
        <div className="feature-panel-head">
          <div>
            <span className="eyebrow">ACTES DU JOUR</span>
            <h2>Cotations préparées</h2>
          </div>
          <button className="button primary" onClick={() => setOpen(true)}>
            <Icon name="add" />
            Ajouter une cotation
          </button>
        </div>
        <div className="data-table">
          <div className="table-row table-head">
            <span>Patient</span>
            <span>Code</span>
            <span>Acte</span>
            <span>Montant</span>
            <span>Statut</span>
          </div>
          {quotes.map((q) => (
            <div className="table-row" key={q.id}>
              <strong>{q.patient}</strong>
              <code>{q.code}</code>
              <span>{q.description}</span>
              <span>{q.amount.toFixed(2)} €</span>
              <span className={`status quote-${q.status.toLowerCase().replace('é', 'e')}`}>
                {q.status}
              </span>
            </div>
          ))}
        </div>
        <p className="legal-note">
          <Icon name="info" />
          Les codes et montants sont des exemples de démonstration. La validation réglementaire
          reste à la charge du professionnel.
        </p>
      </section>
      {open && (
        <div className="modal-backdrop">
          <section
            className="panel modal"
            role="dialog"
            aria-modal="true"
            aria-label="Ajouter une cotation"
          >
            <button className="modal-close icon-button" onClick={() => setOpen(false)}>
              ×
            </button>
            <span className="eyebrow">NOUVEAU BROUILLON</span>
            <h2>Ajouter une cotation</h2>
            <form className="feature-form" onSubmit={add}>
              <label>
                Patient
                <select value={patient} onChange={(e) => setPatient(e.target.value)}>
                  {patients.map((p) => (
                    <option key={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Code
                <select value={code} onChange={(e) => setCode(e.target.value)}>
                  <option>AMI 1</option>
                  <option>AMI 2,5</option>
                  <option>AMI 4 + MCI</option>
                  <option>AIS 3</option>
                </select>
              </label>
              <button className="button primary full">Créer le brouillon</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function Messages({ setNotice }: { setNotice: (message: string) => void }) {
  const [conversations, setConversations] = useDemoState('carevoice-demo-conversations-v1', initialConversations);
  const [selectedId, setSelectedId] = useState('c1');
  const [text, setText] = useState('');
  const selected = conversations.find((c) => c.id === selectedId)!;
  function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setConversations((list) =>
      list.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              messages: [...c.messages, { mine: true, text: text.trim(), time: 'Maintenant' }],
              unread: 0,
            }
          : c,
      ),
    );
    setText('');
    setNotice('Message ajouté à la conversation de démonstration. Aucun envoi externe.');
  }
  return (
    <div className="message-layout panel">
      <aside className="conversation-list">
        <label className="search">
          <Icon name="search" />
          <input placeholder="Rechercher une conversation…" />
        </label>
        {conversations.map((c) => (
          <button
            key={c.id}
            className={selectedId === c.id ? 'active' : ''}
            onClick={() => {
              setSelectedId(c.id);
              setConversations((list) =>
                list.map((item) => (item.id === c.id ? { ...item, unread: 0 } : item)),
              );
            }}
          >
            <span className="avatar">{c.initials}</span>
            <div>
              <strong>{c.name}</strong>
              <span>{c.role}</span>
              <small>{c.messages.at(-1)?.text}</small>
            </div>
            {c.unread > 0 && <b>{c.unread}</b>}
          </button>
        ))}
      </aside>
      <section className="chat">
        <header>
          <span className="avatar">{selected.initials}</span>
          <div>
            <strong>{selected.name}</strong>
            <span>{selected.role} · Démonstration locale</span>
          </div>
          <Link href="/professionnels" className="icon-button" aria-label="Voir le professionnel">
            <Icon name="contact_page" />
          </Link>
        </header>
        <div className="messages">
          {selected.messages.map((m, i) => (
            <div className={m.mine ? 'message mine' : 'message'} key={`${selected.id}-${i}`}>
              <p>{m.text}</p>
              <span>{m.time}</span>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="message-compose">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrire un message fictif…"
            aria-label="Message"
          />
          <button className="button primary" disabled={!text.trim()}>
            <Icon name="send" />
            Envoyer
          </button>
        </form>
      </section>
    </div>
  );
}

function Notes({ setNotice }: { setNotice: (message: string) => void }) {
  const [notes, setNotes] = useDemoState('carevoice-demo-notes-v1', initialNotes);
  const [filter, setFilter] = useState('Toutes');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const categories = ['Toutes', 'Tournée', 'Coordination', 'Cabinet', 'Administratif'];
  const filtered = notes
    .filter((n) => filter === 'Toutes' || n.category === filter)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  function add(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setNotes((n) => [
      { id: crypto.randomUUID(), title, content, category: 'Tournée', pinned: false },
      ...n,
    ]);
    setTitle('');
    setContent('');
    setOpen(false);
    setNotice('La note fictive a été ajoutée.');
  }
  return (
    <>
      <div className="notes-toolbar">
        <div className="segments note-segments">
          {categories.map((c) => (
            <button key={c} aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>
        <button className="button primary" onClick={() => setOpen(true)}>
          <Icon name="add" />
          Nouvelle note
        </button>
      </div>
      <div className="notes-grid">
        {filtered.map((note) => (
          <article className={`panel note-card ${note.pinned ? 'pinned' : ''}`} key={note.id}>
            <div>
              <span className="soft-tag">{note.category}</span>
              <button
                className="pin-button"
                aria-label={note.pinned ? 'Désépingler' : 'Épingler'}
                onClick={() =>
                  setNotes((list) =>
                    list.map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n)),
                  )
                }
              >
                <Icon name="push_pin" />
              </button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
            {note.patient && (
              <Link href={`/patients/${patients.find((p) => p.name === note.patient)?.id || '1'}`}>
                <Icon name="person" />
                {note.patient}
              </Link>
            )}
            <small>Aujourd’hui · note de démonstration</small>
          </article>
        ))}
      </div>
      {open && (
        <div className="modal-backdrop">
          <section
            className="panel modal"
            role="dialog"
            aria-modal="true"
            aria-label="Nouvelle note"
          >
            <button className="modal-close icon-button" onClick={() => setOpen(false)}>
              ×
            </button>
            <span className="eyebrow">PENSE-BÊTE PERSONNEL</span>
            <h2>Nouvelle note</h2>
            <form className="feature-form" onSubmit={add}>
              <label>
                Titre
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Matériel à commander"
                />
              </label>
              <label>
                Contenu
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Votre rappel…"
                />
              </label>
              <button className="button primary full">Ajouter la note</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function Settings({ setNotice }: { setNotice: (message: string) => void }) {
  const [settings, setSettings] = useDemoState('carevoice-demo-settings-v1', {
    reminders: true,
    sounds: false,
    confirm: true,
    compact: false,
  });
  const toggle = (key: keyof typeof settings) => setSettings((s) => ({ ...s, [key]: !s[key] }));
  return (
    <div className="settings-layout">
      <section className="panel settings-card">
        <div className="settings-head">
          <span className="settings-icon">
            <Icon name="notifications" />
          </span>
          <div>
            <h2>Rappels de tournée</h2>
            <p>Choisissez ce qui doit rester visible pendant les passages.</p>
          </div>
        </div>
        {[
          ['reminders', 'Rappel 15 minutes avant un horaire impératif'],
          ['sounds', 'Signal sonore pour les alertes de tournée'],
        ].map(([key, label]) => (
          <label className="toggle-row" key={key}>
            <span>{label}</span>
            <input
              type="checkbox"
              checked={settings[key as keyof typeof settings]}
              onChange={() => toggle(key as keyof typeof settings)}
            />
          </label>
        ))}
      </section>
      <section className="panel settings-card">
        <div className="settings-head">
          <span className="settings-icon">
            <Icon name="mic" />
          </span>
          <div>
            <h2>Transmission vocale</h2>
            <p>Gardez la validation humaine au centre du parcours.</p>
          </div>
        </div>
        <label className="toggle-row">
          <span>Demander une confirmation avant validation</span>
          <input type="checkbox" checked={settings.confirm} onChange={() => toggle('confirm')} />
        </label>
        <label className="toggle-row">
          <span>Affichage compact des trois rubriques DAR</span>
          <input type="checkbox" checked={settings.compact} onChange={() => toggle('compact')} />
        </label>
      </section>
      <section className="panel settings-card full-settings">
        <div className="settings-head">
          <span className="settings-icon">
            <Icon name="shield" />
          </span>
          <div>
            <h2>Données de démonstration</h2>
            <p>
              Cette version conserve les transmissions validées dans l’onglet du navigateur. Aucune
              donnée n’est envoyée vers un service externe.
            </p>
          </div>
        </div>
        <button
          className="button secondary"
          onClick={() =>
            setNotice('Les préférences de démonstration ont été enregistrées pour cette session.')
          }
        >
          <Icon name="save" />
          Enregistrer les préférences
        </button>
      </section>
    </div>
  );
}
