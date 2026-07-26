export type StatutTournee = 'UNASSIGNED' | 'MATIN' | 'SOIR';

export interface TourneePatient {
  id: string;
  nom: string;
  adresse: string;
  lat: number;
  lng: number;
  heurePassage: string;
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
    typeSoin: 'Pansement lourd',
    statutTournee: 'MATIN',
    orderIndex: 0,
  },
  {
    id: 'tp-2',
    nom: 'M. MARTIN',
    adresse: 'Boulevard de la Prairie au Duc, 44200 Nantes (Île de Nantes)',
    lat: 47.2061,
    lng: -1.5542,
    heurePassage: '08:30',
    typeSoin: 'Prise de sang',
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
    typeSoin: 'Injection insuline',
    statutTournee: 'MATIN',
    orderIndex: 2,
  },
  {
    id: 'tp-4',
    nom: 'M. MOREAU',
    adresse: 'Rue Lebrun, 44000 Nantes (St-Donatien)',
    lat: 47.2268,
    lng: -1.5431,
    heurePassage: '09:30',
    typeSoin: 'Toilette complète',
    statutTournee: 'MATIN',
    orderIndex: 3,
  },
  {
    id: 'tp-5',
    nom: 'Mme PETIT',
    adresse: 'Place Lechat, 44100 Nantes (Chantenay)',
    lat: 47.2031,
    lng: -1.5839,
    heurePassage: '10:00',
    typeSoin: 'Pansement de plaie',
    statutTournee: 'MATIN',
    orderIndex: 4,
  },
  {
    id: 'tp-6',
    nom: 'M. ROUX',
    adresse: 'Boulevard Clovis Constant, 44000 Nantes (Procé)',
    lat: 47.2242,
    lng: -1.5753,
    heurePassage: '10:30',
    typeSoin: 'Distribution médicaments',
    statutTournee: 'UNASSIGNED',
    orderIndex: 0,
  },
  {
    id: 'tp-7',
    nom: 'Mme GIRARD',
    adresse: 'Place Zola, 44100 Nantes (Zola)',
    lat: 47.2189,
    lng: -1.5821,
    heurePassage: '11:00',
    typeSoin: 'Prise de sang',
    statutTournee: 'UNASSIGNED',
    orderIndex: 1,
  },
  {
    id: 'tp-8',
    nom: 'M. DUBOIS',
    adresse: 'Boulevard de Doulon, 44300 Nantes (Doulon)',
    lat: 47.2281,
    lng: -1.5182,
    heurePassage: '11:30',
    typeSoin: 'Bilan de soins',
    statutTournee: 'SOIR',
    orderIndex: 0,
  }
];

const LOCAL_STORAGE_KEY = 'carevoice_tournee_patients_v1';

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
