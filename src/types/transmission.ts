export enum TransmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export enum AlertSeverity {
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface PatientAlert {
  id: string;
  dailyTransmissionId: string;
  patientId: string;
  patientName: string;
  severity: AlertSeverity;
  description: string;
  createdAt: string;
}

export interface DailyGlobalTransmission {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  tourneeId?: string;
  summaryNote: string; // Manual summary note of patient news
  voiceNoteUrl?: string; // Audio file URL or base64 / blob for raw vocal recording
  voiceNoteDuration?: number; // duration in seconds
  status: TransmissionStatus;
  authorId: string;
  authorName: string;
  authorRole?: string;
  alerts: PatientAlert[];
  validatedDiffs?: PatientUpdate[];
  isDiffsValidated?: boolean;
  validatedBy?: string;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface PatientChange {
  id?: string;
  field: string; // e.g., tension, glycémie, état plaie, humeur, traitement
  previousValue: string; // Existing value in DB (or 'Aucune' if new)
  newValue: string; // Value extracted from voice note
  actionType: 'UPDATE' | 'ALERT' | 'INFO';
  isManuallyEdited?: boolean; // Set to true when nurse manually edits via inline pencil
  selected?: boolean; // Toggled via line checkbox
}

export interface PatientDAR {
  cible?: string;
  donnees: string;
  actions: string;
  resultats: string;
}

export interface PatientUpdate {
  patientId: string;
  patientName: string;
  selected?: boolean; // Toggled via patient card checkbox
  changes: PatientChange[];
  dar?: PatientDAR;
}

export interface VoiceExtractionResult {
  rawTranscript: string;
  patientUpdates: PatientUpdate[];
}

