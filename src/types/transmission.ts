export interface Constantes {
  tension?: string;
  glycemie?: string;
  temperature?: string;
  pouls?: string;
}

export interface DiffBadge {
  label: string;
  type: 'increase' | 'decrease' | 'new' | 'neutral';
  value: string;
}

export interface DarTransmission {
  id: string;
  patientId: string;
  nurseName: string;
  passageDate: string; // ex: "26 Juillet 2026"
  passageTime: string; // ex: "08:30"
  version: number; // default: 1
  lastModifiedAt?: string; // ex: "09:15"
  cible: string; // ex: "Plaie sacrum / Glycémie"
  donnees: string;
  actions: string;
  resultats: string;
  constantes: Constantes;
  diffBadges?: DiffBadge[];
}
