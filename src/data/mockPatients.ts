export type StatutTournee = string;

export interface TourneeColumn {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  isDeletable?: boolean;
}

export const DEFAULT_TOURNEE_COLUMNS: TourneeColumn[] = [
  {
    id: 'UNASSIGNED',
    title: 'Patients Non Assignés',
    subtitle: 'À planifier dans une tournée',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-800',
    isDeletable: false,
  },
  {
    id: 'MATIN',
    title: 'Tournée Matin',
    subtitle: 'Premier passage de la journée (08h00 - 12h00)',
    bgColor: 'bg-amber-50/50',
    borderColor: 'border-amber-200/80',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    isDeletable: true,
  },
  {
    id: 'SOIR',
    title: 'Tournée Soir',
    subtitle: 'Second passage de la journée (16h00 - 20h00)',
    bgColor: 'bg-indigo-50/50',
    borderColor: 'border-indigo-200/80',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    isDeletable: true,
  },
  {
    id: 'CABINET',
    title: 'Tournée Garde Cabinet',
    subtitle: 'Permanence & Soins sur place',
    bgColor: 'bg-emerald-50/50',
    borderColor: 'border-emerald-200/80',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    isDeletable: true,
  },
];

const TOURNEE_COLUMNS_KEY = 'caretone_tournee_columns_v1';

export function getStoredTourneeColumns(): TourneeColumn[] {
  try {
    const data = localStorage.getItem(TOURNEE_COLUMNS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load tournee columns from localStorage", e);
  }
  return DEFAULT_TOURNEE_COLUMNS;
}

export function saveStoredTourneeColumns(columns: TourneeColumn[]): void {
  try {
    localStorage.setItem(TOURNEE_COLUMNS_KEY, JSON.stringify(columns));
  } catch (e) {
    console.error("Failed to save tournee columns to localStorage", e);
  }
}

export interface TourneePatient {
  id: string;
  nom: string;
  adresse: string;
  lat: number;
  lng: number;
  heurePassage?: string; // e.g., "08:00" or empty/flexible
  hasFixedTime?: boolean; // True if mandatory fixed time (e.g., insuline/à jeun)
  estimatedDurationMinutes?: number; // Care duration in minutes
  typeSoin: string;
  statutTournee: StatutTournee;
  orderIndex?: number;
}

export const initialMockTourneePatients: TourneePatient[] = [
  {
    id: 'tp-1',
    nom: 'Mme DUPONT',
    adresse: 'Place Graslin, 44000 Nantes',
    lat: 47.2133,
    lng: -1.5622,
    heurePassage: '08:00',
    hasFixedTime: true,
    estimatedDurationMinutes: 20,
    typeSoin: 'Pansement lourd & Bilan (Horaire Fixe Impératif)',
    statutTournee: 'MATIN',
    orderIndex: 0,
  },
  {
    id: 'tp-2',
    nom: 'M. MARTIN',
    adresse: 'Boulevard de la Prairie au Duc, 44200 Nantes (Île de Nantes)',
    lat: 47.2061,
    lng: -1.5542,
    heurePassage: '',
    hasFixedTime: false,
    estimatedDurationMinutes: 15,
    typeSoin: 'Prise de sang (Sans horaire précis / Flexible)',
    statutTournee: 'MATIN',
    orderIndex: 1,
  },
  {
    id: 'tp-3',
    nom: 'Mme BERNARD',
    adresse: 'Rue de la Juiverie, 44000 Nantes (Bouffay)',
    lat: 47.2154,
    lng: -1.5528,
    heurePassage: '09:00',
    hasFixedTime: true,
    estimatedDurationMinutes: 15,
    typeSoin: 'Injection insuline (Horaire Fixe Impératif)',
    statutTournee: 'MATIN',
    orderIndex: 2,
  },
  {
    id: 'tp-4',
    nom: 'M. MOREAU',
    adresse: 'Rue Lebrun, 44000 Nantes (St-Donatien)',
    lat: 47.2268,
    lng: -1.5431,
    heurePassage: '',
    hasFixedTime: false,
    estimatedDurationMinutes: 30,
    typeSoin: 'Toilette complète (Flexible matinée)',
    statutTournee: 'MATIN',
    orderIndex: 3,
  },
  {
    id: 'tp-5',
    nom: 'Mme PETIT',
    adresse: 'Place Lechat, 44100 Nantes (Chantenay)',
    lat: 47.2031,
    lng: -1.5839,
    heurePassage: '10:30',
    hasFixedTime: true,
    estimatedDurationMinutes: 20,
    typeSoin: 'Pansement de plaie complexe (Fixe 10h30)',
    statutTournee: 'MATIN',
    orderIndex: 4,
  },
  {
    id: 'tp-6',
    nom: 'M. ROUX',
    adresse: 'Boulevard Clovis Constant, 44000 Nantes (Procé)',
    lat: 47.2242,
    lng: -1.5753,
    heurePassage: '',
    hasFixedTime: false,
    estimatedDurationMinutes: 10,
    typeSoin: 'Distribution médicaments (Passage flexible)',
    statutTournee: 'UNASSIGNED',
    orderIndex: 0,
  },
  {
    id: 'tp-7',
    nom: 'Mme GIRARD',
    adresse: 'Place Zola, 44100 Nantes (Zola)',
    lat: 47.2189,
    lng: -1.5821,
    heurePassage: '07:45',
    hasFixedTime: true,
    estimatedDurationMinutes: 15,
    typeSoin: 'Prise de sang à jeun (Fixe 07h45)',
    statutTournee: 'UNASSIGNED',
    orderIndex: 1,
  },
  {
    id: 'tp-8',
    nom: 'M. DUBOIS',
    adresse: 'Boulevard de Doulon, 44300 Nantes (Doulon)',
    lat: 47.2281,
    lng: -1.5182,
    heurePassage: '',
    hasFixedTime: false,
    estimatedDurationMinutes: 25,
    typeSoin: 'Bilan de soins (Passage flexible soir)',
    statutTournee: 'SOIR',
    orderIndex: 0,
  }
];

const LOCAL_STORAGE_KEY = 'caretone_tournee_patients_v1';

export function getStoredTourneePatients(): TourneePatient[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load tournee patients from localStorage", e);
  }
  return initialMockTourneePatients;
}

export function saveStoredTourneePatients(patients: TourneePatient[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error("Failed to save tournee patients to localStorage", e);
  }
}
