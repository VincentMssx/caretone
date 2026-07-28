import { Doctor } from '../types';

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Morel',
    specialty: 'Médecin Généraliste',
    phone: '02 40 12 34 56',
    email: 'dr.morel@sante-nantes.fr',
    address: '14 Place Royale, 44000 Nantes',
    rppsNumber: '10100458921',
    notes: 'Cabinet ouvert du Lundi au Vendredi. Injoignable le mercredi après-midi.'
  },
  {
    id: 'doc-2',
    name: 'Dr. Leroy',
    specialty: 'Cardiologue',
    phone: '02 40 98 76 54',
    email: 'dr.leroy@chu-nantes.fr',
    address: '1 Allée de l\'Île Gloriette, 44000 Nantes',
    rppsNumber: '10100782341',
    notes: 'Consultation CHU Nantes - Service Cardiologie B.'
  },
  {
    id: 'doc-3',
    name: 'Dr. Lambert',
    specialty: 'Chirurgien Orthopédiste',
    phone: '02 40 55 11 22',
    email: 'dr.lambert@clinique-julesverne.fr',
    address: '2 Route de Paris, 44300 Nantes',
    rppsNumber: '10100349812',
    notes: 'Orthopédie & Suivi post-opératoire.'
  },
  {
    id: 'doc-4',
    name: 'Dr. Vasseur',
    specialty: 'Diabétologue & Endocrinologue',
    phone: '02 40 33 44 55',
    email: 'dr.vasseur@cabinet-med.fr',
    address: '8 Rue Jean Jaurès, 44000 Nantes',
    rppsNumber: '10100912384',
    notes: 'Spécialiste diabète Type 1 et 2, pompe à insuline.'
  }
];

const DOCTORS_STORAGE_KEY = 'caretone_doctors_db_v1';

export const getStoredDoctors = (): Doctor[] => {
  try {
    const saved = localStorage.getItem(DOCTORS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load doctors from localStorage', e);
  }
  return INITIAL_DOCTORS;
};

export const saveStoredDoctors = (doctors: Doctor[]) => {
  try {
    localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctors));
  } catch (e) {
    console.error('Failed to save doctors to localStorage', e);
  }
};
