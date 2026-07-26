import { Patient, MedicalAlert, CotationItem, Conversation, PersonalNote } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Jean Dupont',
    birthDate: '12/05/1948',
    age: 78,
    secuNumber: '1 48 05 75 112 042',
    bloodType: 'O+',
    address: '14 rue des Lilas, 75011 Paris',
    phone: '06 12 34 56 78',
    doctor: 'Dr. Morel',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    pathologyBadge: 'DIABÉTIQUE TYPE 2',
    careSummary: 'Cicatrisation escarre + Insuline',
    nextVisitTime: 'Aujourd\'hui, 17:30',
    visitFrequency: '2x / Jour',
    warnings: ['Allergie: Pénicilline', 'Insuffisance cardiaque', 'Diabète Type 2'],
    status: 'active',
    observationsHistory: [
      {
        id: 'obs-101',
        date: "Aujourd'hui, 08:30",
        timestamp: '2026-07-26T08:30:00Z',
        author: 'Julie R.',
        donnees: 'Patient reposé, pas de douleurs nocturnes signalées. Glycémie à jeun : 1.22 g/L. Tension stable 13/8.',
        actions: 'Injection insuline (Novorapid 6u). Pansement orteil gauche refait. Vérification pilulier matin.',
        resultats: 'Plaie de l\'orteil bien cicatrisante, aspect sain. Patient a bien compris les consignes alimentaires du jour.'
      },
      {
        id: 'obs-102',
        date: 'Hier, 22 Mai 2024',
        timestamp: '2024-05-22T18:00:00Z',
        author: 'Marc T. (Remplaçant)',
        donnees: 'Glycémie post-prandiale élevée : 1.85 g/L. Patient un peu essoufflé.',
        actions: 'Correction insuline effectuée selon protocole. Aide à la mise en bas de contention.',
        resultats: 'Respiration normalisée après 15 min de repos. Glycémie redescendue à 1.50 g/L avant départ.'
      }
    ]
  },
  {
    id: 'p2',
    name: 'Marie Lefebvre',
    birthDate: '04/11/1942',
    age: 82,
    secuNumber: '2 42 11 92 341 019',
    bloodType: 'A+',
    address: '8 avenue de la République, 75011 Paris',
    phone: '06 98 76 54 32',
    doctor: 'Dr. Morel',
    photoUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    pathologyBadge: 'POST-OPÉRATOIRE',
    careSummary: 'Pansement lourd + Injections',
    nextVisitTime: '08:30',
    visitFrequency: '1x / Jour',
    warnings: ['Anti-coagulant oral', 'Hypertension'],
    status: 'active',
    observationsHistory: [
      {
        id: 'obs-201',
        date: 'Aujourd\'hui, 08:30',
        timestamp: '2026-07-26T08:30:00Z',
        author: 'Julie R.',
        donnees: 'Tension 12/7. Constantes stables. Bon moral.',
        actions: 'Pansement lourd de prothèse de hanche refait sous conditions stériles.',
        resultats: 'Cicatrisation propre, pas d\'exsudat ni de rougeur.'
      }
    ]
  },
  {
    id: 'p3',
    name: 'Robert Martin',
    birthDate: '18/02/1956',
    age: 68,
    secuNumber: '1 56 02 75 009 881',
    bloodType: 'B+',
    address: '25 rue Oberkampf, 75011 Paris',
    phone: '06 55 44 33 22',
    doctor: 'Dr. Bernard',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    pathologyBadge: 'HYPERTENSION',
    careSummary: 'Surveillance TA + Prise de sang',
    nextVisitTime: '09:15',
    visitFrequency: '3x / Semaine',
    warnings: ['Tension artérielle labile', 'Régime hyposodé'],
    status: 'active',
    observationsHistory: [
      {
        id: 'obs-301',
        date: 'Aujourd\'hui, 09:15',
        timestamp: '2026-07-26T09:15:00Z',
        author: 'Julie R.',
        donnees: 'Tension artérielle mesurée à 18/10 mmHg. Céphalées légères.',
        actions: 'Prise de sang à jeun effectuée. Appel au Dr. Bernard pour consignes.',
        resultats: 'Mise au repos préconisée. Traitement antihypertenseur adapté.'
      }
    ]
  },
  {
    id: 'p4',
    name: 'Françoise Durand',
    birthDate: '29/08/1950',
    age: 74,
    secuNumber: '2 50 08 75 223 901',
    bloodType: 'AB+',
    address: '32 boulevard Voltaire, 75011 Paris',
    phone: '06 11 22 33 44',
    doctor: 'Dr. Morel',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    pathologyBadge: 'MANDAT NURSING',
    careSummary: 'Soins de nursing et pilulier hebdomadaire',
    nextVisitTime: '11:30',
    visitFrequency: '1x / Jour',
    warnings: ['Risque de chute', 'Ostéoporose'],
    status: 'active',
    observationsHistory: [
      {
        id: 'obs-401',
        date: 'Mardi, 21 Mai 2024',
        timestamp: '2024-05-21T11:30:00Z',
        author: 'Julie R.',
        donnees: 'Toilette accomplie sans difficulté. Patient souriant.',
        actions: 'Préparation du pilulier pour la semaine à venir.',
        resultats: 'Observance médicamenteuse vérifiée et validée.'
      }
    ]
  },
  {
    id: 'p5',
    name: 'Chantal Martin',
    birthDate: '15/03/1951',
    age: 73,
    secuNumber: '2 51 03 75 882 102',
    bloodType: 'O-',
    address: '5 rue Parmentier, 75011 Paris',
    phone: '06 77 88 99 00',
    doctor: 'Dr. Bernard',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    pathologyBadge: 'TRAUMATISME',
    careSummary: 'Surveillance cheville + antalgiques',
    nextVisitTime: 'Demain, 09:00',
    visitFrequency: '1x / Jour',
    warnings: ['Douleur aiguë'],
    status: 'active',
    observationsHistory: [
      {
        id: 'obs-501',
        date: 'Ce matin, 09:00',
        timestamp: '2026-07-26T09:00:00Z',
        author: 'Julie R.',
        donnees: 'Douleur cheville droite post-chute cuisine. Tension 13/8.',
        actions: 'Application glace, préconisation repos. Surveillance paramètres.',
        resultats: 'État stable, mobilité conservée malgré gêne.'
      }
    ]
  }
];

export const INITIAL_ALERTS: MedicalAlert[] = [
  {
    id: 'a1',
    patientId: 'p1',
    patientName: 'Jean Dupont',
    type: 'glycemie',
    title: 'Alerte Glycémie: Jean Dupont',
    value: '2.10 g/L (Critique)',
    level: 'critique',
    actionType: 'intervenir'
  },
  {
    id: 'a2',
    patientId: 'p3',
    patientName: 'Robert Martin',
    type: 'tension',
    title: 'TA Élevée: Robert Martin',
    value: '18/10 mmHg',
    level: 'critique',
    actionType: 'appeler'
  }
];

export const INITIAL_COTATIONS: CotationItem[] = [
  {
    id: 'c1',
    date: '12 Oct 2023, 08:30',
    patientName: 'Jean Dupont',
    code: 'AMI 1 + MA',
    description: 'Prise de sang',
    amount: 8.50,
    status: 'brouillon'
  },
  {
    id: 'c2',
    date: '12 Oct 2023, 10:15',
    patientName: 'Marie Curie',
    code: 'AIS 3',
    description: 'Soins d\'hygiène (30 min)',
    amount: 26.50,
    status: 'valide'
  },
  {
    id: 'c3',
    date: '11 Oct 2023, 14:00',
    patientName: 'Robert Martin',
    code: 'AMI 4 + MA',
    description: 'Pansement complexe',
    amount: 16.25,
    status: 'envoye'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    contactName: 'Dr. Morel (Médecin)',
    contactRole: 'Médecin Traitant - En ligne',
    contactInitials: 'MD',
    isOnline: true,
    lastMessage: 'Concernant les constantes de Mme. Dubois, pourriez-vous...',
    lastTime: '10:42',
    unreadCount: 0,
    urgentBadge: 'Urgent',
    category: 'medecin',
    messages: [
      {
        id: 'm1',
        conversationId: 'conv-1',
        senderName: 'Dr. Morel',
        senderInitials: 'MD',
        text: 'Bonjour, j\'ai vu que vous étiez passée chez Mme. Dubois ce matin. Comment vont ses constantes ?',
        time: '10:30',
        isMe: false
      },
      {
        id: 'm2',
        conversationId: 'conv-1',
        senderName: 'Julie R.',
        text: 'Bonjour Dr. Morel. Oui, je viens de terminer le soin. La tension est à 14/8, saturation 97%. La plaie évolue bien, pas de signes d\'infection.',
        time: '10:35',
        isMe: true,
        status: 'read'
      },
      {
        id: 'm3',
        conversationId: 'conv-1',
        senderName: 'Dr. Morel',
        senderInitials: 'MD',
        text: 'Parfait, merci. Concernant les constantes de Mme. Dubois, pourriez-vous faire un relevé strict sur 3 jours ? Je voudrais ajuster son traitement avant vendredi.',
        time: '10:42',
        isMe: false
      }
    ]
  },
  {
    id: 'conv-2',
    contactName: 'Mme. Dubois (Patient)',
    contactRole: 'Patient',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    isOnline: false,
    lastMessage: 'Bonjour, j\'ai une question sur mon pansement...',
    lastTime: 'Hier',
    unreadCount: 1,
    category: 'patient',
    messages: [
      {
        id: 'm21',
        conversationId: 'conv-2',
        senderName: 'Mme. Dubois',
        text: 'Bonjour Julie, est-ce normal que le pansement tire un peu sur le côté ? Merci !',
        time: 'Hier 16:20',
        isMe: false
      }
    ]
  },
  {
    id: 'conv-3',
    contactName: 'Pharmacie Lafayette',
    contactRole: 'Pharmacie Partenaire',
    contactInitials: 'PL',
    isOnline: true,
    lastMessage: 'L\'ordonnance est prête. Vous pouvez passer.',
    lastTime: 'Mar',
    unreadCount: 0,
    category: 'pharmacie',
    messages: [
      {
        id: 'm31',
        conversationId: 'conv-3',
        senderName: 'Pharmacie Lafayette',
        senderInitials: 'PL',
        text: 'L\'ordonnance de M. Dupont est prête. Vous pouvez passer la récupérer.',
        time: 'Mar 11:15',
        isMe: false
      }
    ]
  },
  {
    id: 'conv-4',
    contactName: 'Julien (Collègue)',
    contactRole: 'Infirmier Remplaçant',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    isOnline: false,
    lastMessage: 'Je te laisse les clés au cabinet.',
    lastTime: 'Lun',
    unreadCount: 0,
    category: 'collegue',
    messages: [
      {
        id: 'm41',
        conversationId: 'conv-4',
        senderName: 'Julien',
        text: 'Salut Julie, j\'ai fini la tournée de garde. Je te laisse les clés au cabinet.',
        time: 'Lun 20:00',
        isMe: false
      }
    ]
  }
];

export const INITIAL_NOTES: PersonalNote[] = [
  {
    id: 'note-1',
    title: 'Code Digicode Cabinet & Clés',
    content: 'Digicode porte extérieure : 4528A. La clé du local DASRI se trouve dans le tiroir du bureau sous le classeur bleu. Penser à vérifier le niveau des conteneurs à aiguilles.',
    category: 'cabinet',
    color: 'amber',
    date: 'Hier, 18:40',
    isPinned: true,
    tags: ['Cabinet', 'Matériel', 'Code'],
  },
  {
    id: 'note-2',
    title: 'Rappel Dr. Morel - Ordonnance M. Dupont',
    content: 'Recontacter le Dr. Morel concernant le renouvellement de l\'ordonnance de Novorapid + compresses pour M. Jean Dupont. Vérifier si possible de passer le bilan biologique en hebdomadaire.',
    category: 'pense-bete',
    color: 'purple',
    date: 'Aujourd\'hui, 08:15',
    isPinned: true,
    tags: ['Médecin', 'Ordonnance'],
    patientId: 'p1',
    patientName: 'Jean Dupont'
  },
  {
    id: 'note-3',
    title: 'Commande Matériel Pansements Lourd',
    content: 'Stock compresses stériles 10x10cm et bandes Hydrocolloïdes bientôt épuisé. Passer commande auprès de la Pharmacie Lafayette avant jeudi 12h pour livraison vendredi matin.',
    category: 'tournee',
    color: 'blue',
    date: 'Aujourd\'hui, 09:30',
    isPinned: false,
    tags: ['Pharmacie', 'Stock', 'Soins'],
    audioDuration: '0:45'
  },
  {
    id: 'note-4',
    title: 'Avis Remplaçant - Tournée Dimanche Prochain',
    content: 'Transmettre le mémo de tournée à Marc T. pour le week-end du 2-3 août. Ne pas oublier de lui indiquer le digicode de Mme. Lefebvre (Interphone 12 + Visiophone) et la consigne du chien de M. Martin.',
    category: 'tournee',
    color: 'green',
    date: '22 Mai 2024',
    isPinned: false,
    tags: ['Remplacement', 'Organisation']
  },
  {
    id: 'note-5',
    title: 'Déclaration URSSAF / CARPIMKO T3',
    content: 'Préparer les justificatifs de recettes pour la télétransmission du 3ème trimestre. Transmettre le récapitulatif SNIR au comptable avant le 15 du mois.',
    category: 'administratif',
    color: 'rose',
    date: '18 Mai 2024',
    isPinned: false,
    tags: ['Comptabilité', 'Urssaf']
  }
];
