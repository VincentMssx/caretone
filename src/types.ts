export type NavView = 
  | 'accueil' 
  | 'patients' 
  | 'patient-detail' 
  | 'doctors'
  | 'tournee-manager'
  | 'tournee-scheduling'
  | 'route-planner'
  | 'voice-transmission-hub' 
  | 'live-voice-transmission' 
  | 'cotations' 
  | 'messagerie' 
  | 'notes'
  | 'settings';

export interface Doctor {
  id: string;
  name: string; // e.g. "Dr. Morel"
  specialty: string; // e.g. "Médecin Généraliste"
  phone: string;
  email?: string;
  address: string;
  rppsNumber?: string;
  notes?: string;
}

export interface PersonalNote {
  id: string;
  title: string;
  content: string;
  category: 'pense-bete' | 'tournee' | 'cabinet' | 'administratif' | 'autre';
  color: 'yellow' | 'blue' | 'green' | 'purple' | 'rose' | 'amber';
  date: string;
  isPinned: boolean;
  tags: string[];
  patientId?: string;
  patientName?: string;
  audioDuration?: string;
}

export interface DARObservation {
  id: string;
  date: string; // e.g. "Aujourd'hui, 08:30"
  timestamp: string; // ISO or date string
  author: string; // e.g. "Julie R."
  donnees: string; // D
  actions: string; // A
  resultats: string; // R
  audioUrl?: string;
  isDiff?: boolean;
}

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  age: number;
  secuNumber: string;
  bloodType: string;
  address: string;
  phone: string;
  doctor: string;
  photoUrl: string;
  pathologyBadge?: string;
  careSummary: string;
  nextVisitTime: string; // e.g. "08:30" or "Aujourd'hui, 17:30"
  visitFrequency: string; // e.g. "2x / Jour"
  warnings: string[]; // e.g. ["Allergie: Pénicilline", "Diabète Type 2"]
  observationsHistory: DARObservation[];
  status: 'active' | 'archived';
}

export interface MedicalAlert {
  id: string;
  patientId: string;
  patientName: string;
  type: 'glycemie' | 'tension' | 'wound' | 'general';
  title: string;
  value: string;
  level: 'critique' | 'warning' | 'info';
  actionType: 'intervenir' | 'appeler' | 'voir';
}

export interface CotationItem {
  id: string;
  date: string;
  patientName: string;
  code: string; // e.g. "AMI 1 + MA", "AIS 3", "AMI 4 + MA"
  description: string;
  amount: number;
  status: 'brouillon' | 'valide' | 'envoye';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderName: string;
  senderAvatar?: string;
  senderInitials?: string;
  text: string;
  time: string;
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  contactName: string;
  contactRole: string; // e.g. "Médecin Traitant", "Patient", "Collègue"
  contactInitials?: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  urgentBadge?: string;
  category: 'medecin' | 'patient' | 'collegue' | 'pharmacie';
  messages: ChatMessage[];
}

export interface ProposedExtraction {
  patientId?: string;
  isNewPatient?: boolean;
  patientName: string;
  birthDate?: string;
  donnees: string;
  actions: string;
  resultats: string;
  diffSummary?: string;
  lastUpdateText?: string;
}
