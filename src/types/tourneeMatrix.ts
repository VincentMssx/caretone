export interface TourneeAssignment {
  id: string;
  patientId: string;
  tourneeId: string;
  sequenceOrder?: number; // Order position in the route (e.g., #1, #2)
  careNote?: string; // Specific medical note for this passage (e.g., "Insuline")
}

export interface Patient {
  id: string;
  fullName: string;
  address?: string;
  assignments: TourneeAssignment[];
}

export interface Tournee {
  id: string;
  name: string; // e.g., "Tournée Matin", "Tournée Soir", "Garde Cabinet"
  timeSlot: string; // e.g., "08h - 12h"
  color: string; // Tailwind color class
}

export const DEFAULT_TOURNESS: Tournee[] = [
  {
    id: 'MATIN',
    name: 'Tournée Matin',
    timeSlot: '08h - 12h',
    color: 'amber'
  },
  {
    id: 'SOIR',
    name: 'Tournée Soir',
    timeSlot: '16h - 20h',
    color: 'indigo'
  },
  {
    id: 'CABINET',
    name: 'Garde Cabinet',
    timeSlot: 'Permanence',
    color: 'emerald'
  }
];

export const INITIAL_MATRIX_PATIENTS: Patient[] = [
  {
    id: 'tp-1',
    fullName: 'Mme DUPONT',
    address: 'Place Graslin, 44000 Nantes',
    assignments: [
      {
        id: 'asg-1-1',
        patientId: 'tp-1',
        tourneeId: 'MATIN',
        sequenceOrder: 1,
        careNote: 'Pansement sacrum & Bilan'
      },
      {
        id: 'asg-1-2',
        patientId: 'tp-1',
        tourneeId: 'SOIR',
        sequenceOrder: 2,
        careNote: 'Insuline 14 UI'
      }
    ]
  },
  {
    id: 'tp-2',
    fullName: 'M. MARTIN',
    address: 'Boulevard de la Prairie au Duc, 44200 Nantes',
    assignments: [
      {
        id: 'asg-2-1',
        patientId: 'tp-2',
        tourneeId: 'MATIN',
        sequenceOrder: 2,
        careNote: 'Prise de sang à jeun'
      }
    ]
  },
  {
    id: 'tp-3',
    fullName: 'Mme BERNARD',
    address: 'Rue de la Juiverie, 44000 Nantes',
    assignments: [
      {
        id: 'asg-3-1',
        patientId: 'tp-3',
        tourneeId: 'MATIN',
        sequenceOrder: 3,
        careNote: 'Injection insuline (Fixe 09:00)'
      },
      {
        id: 'asg-3-2',
        patientId: 'tp-3',
        tourneeId: 'SOIR',
        sequenceOrder: 1,
        careNote: 'Contrôle tension & traitement'
      }
    ]
  },
  {
    id: 'tp-4',
    fullName: 'M. MOREAU',
    address: 'Rue Lebrun, 44000 Nantes',
    assignments: [
      {
        id: 'asg-4-1',
        patientId: 'tp-4',
        tourneeId: 'MATIN',
        sequenceOrder: 4,
        careNote: 'Toilette complète & aérosol'
      }
    ]
  },
  {
    id: 'tp-5',
    fullName: 'Mme PETIT',
    address: 'Place Lechat, 44100 Nantes',
    assignments: [
      {
        id: 'asg-5-1',
        patientId: 'tp-5',
        tourneeId: 'MATIN',
        sequenceOrder: 5,
        careNote: 'Pansement plaie complexe'
      },
      {
        id: 'asg-5-2',
        patientId: 'tp-5',
        tourneeId: 'CABINET',
        sequenceOrder: 1,
        careNote: 'Ablation fils au cabinet'
      }
    ]
  },
  {
    id: 'tp-6',
    fullName: 'M. ROUX',
    address: 'Boulevard Clovis Constant, 44000 Nantes',
    assignments: [] // Unassigned initially
  },
  {
    id: 'tp-7',
    fullName: 'Mme GIRARD',
    address: 'Place Zola, 44100 Nantes',
    assignments: [] // Unassigned initially
  },
  {
    id: 'tp-8',
    fullName: 'M. DUBOIS',
    address: 'Boulevard de Doulon, 44300 Nantes',
    assignments: [
      {
        id: 'asg-8-1',
        patientId: 'tp-8',
        tourneeId: 'SOIR',
        sequenceOrder: 3,
        careNote: 'Bilan de soins & distribution pilulier'
      }
    ]
  }
];
