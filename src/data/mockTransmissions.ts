export interface TransmissionCommit {
  id: string;
  patientId: string;
  patientName: string;
  nurseName: string;
  nurseInitials: string;
  timestamp: string;
  versionTag: string;
  changeType: 'CREATION' | 'CORRECTION_VOCALE' | 'AJOUT_DONNEES' | 'MAJ_MANUELLE';
  commitMessage: string;
  donnees: string;
  actions: string;
  resultats: string;
  previousVersionId?: string;
}

export const initialMockTransmissions: TransmissionCommit[] = [
  {
    id: 'tx-101',
    patientId: 'tp-1',
    patientName: 'Mme DUPONT',
    nurseName: 'Julie R. (IDEL)',
    nurseInitials: 'JR',
    timestamp: '26/07/2026 à 08:30',
    versionTag: 'v1.0',
    changeType: 'CREATION',
    commitMessage: 'Création transmission initiale - Pansement lourd & Glycémie',
    donnees: 'Plaie sacral 4x3 cm, exsudat modéré sans odeur. Glycémie à jeun à 1.85 g/L.',
    actions: 'Nettoyage au sérum physiologique, réfection du pansement hydrocolloïde.',
    resultats: 'Plaie propre en voie de bourgeonnement. Bonne tolérance du soin par la patiente.'
  },
  {
    id: 'tx-102',
    patientId: 'tp-1',
    patientName: 'Mme DUPONT',
    nurseName: 'Sophie M. (IDEL)',
    nurseInitials: 'SM',
    timestamp: '26/07/2026 à 11:15',
    versionTag: 'v1.1',
    changeType: 'CORRECTION_VOCALE',
    commitMessage: 'Correction vocale: Ajout observation douleur hanche & contact kiné',
    donnees: 'Plaie sacral 4x3 cm, exsudat modéré sans odeur. Glycémie à jeun à 1.85 g/L. [Ajout] Patiente signale une vive douleur à la hanche gauche lors des transferts.',
    actions: 'Nettoyage au sérum physiologique, réfection du pansement hydrocolloïde. [Ajout] Appel du kinésithérapeute M. Moreau pour bilan de mobilité.',
    resultats: 'Plaie propre. Kinésithérapeute passe ce jour à 15h. Prise de Paracétamol 1g programmée à midi.',
    previousVersionId: 'tx-101'
  },
  {
    id: 'tx-103',
    patientId: 'tp-2',
    patientName: 'M. MARTIN',
    nurseName: 'Julie R. (IDEL)',
    nurseInitials: 'JR',
    timestamp: '26/07/2026 à 09:00',
    versionTag: 'v1.0',
    changeType: 'CREATION',
    commitMessage: 'Création transmission - Bilan sanguin de contrôle INR',
    donnees: 'Prise de sang de contrôle sous AVK (Coumadine). Patient calme.',
    actions: 'Prélèvement veineux au pli du coude droit sans difficulté.',
    resultats: 'Échantillons déposés au laboratoire BioLoire Graslin à 09h35.'
  },
  {
    id: 'tx-104',
    patientId: 'tp-2',
    patientName: 'M. MARTIN',
    nurseName: 'Marc D. (IDEL Remplaçant)',
    nurseInitials: 'MD',
    timestamp: '26/07/2026 à 14:20',
    versionTag: 'v1.1',
    changeType: 'AJOUT_DONNEES',
    commitMessage: 'Mise à jour labo: Résultat INR reçu (2.6) & confirmation posologie',
    donnees: 'Prise de sang de contrôle sous AVK. [MAJ] Résultat INR transmis par le laboratoire : 2.6 (zone cible 2.0-3.0).',
    actions: 'Prélèvement veineux pli du coude droit. [MAJ] Transmission du résultat au Dr Lemoine. Confirmation de la posologie Coumadine 5mg.',
    resultats: 'INR satisfaisant. Patient rappelé au téléphone pour confirmer la dose du soir.',
    previousVersionId: 'tx-103'
  },
  {
    id: 'tx-105',
    patientId: 'tp-3',
    patientName: 'Mme BERNARD',
    nurseName: 'Sophie M. (IDEL)',
    nurseInitials: 'SM',
    timestamp: '26/07/2026 à 09:45',
    versionTag: 'v1.0',
    changeType: 'CREATION',
    commitMessage: 'Création transmission - Contrôle glycémique & Insuline',
    donnees: 'Glycémie préprandiale à 2.10 g/L au réveil.',
    actions: 'Injection sous-cutanée de 12 UI d\'insuline Novorapid cuisse gauche.',
    resultats: 'Collation servie immédiatement par l\'auxiliaire de vie.'
  }
];

const LOCAL_STORAGE_KEY = 'caretone_transmissions_git_v1';

export function getStoredTransmissions(): TransmissionCommit[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load transmissions from localStorage', e);
  }
  return initialMockTransmissions;
}

export function saveStoredTransmissions(transmissions: TransmissionCommit[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transmissions));
  } catch (e) {
    console.error('Failed to save transmissions to localStorage', e);
  }
}
