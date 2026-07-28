import { TourneeCalendar, UserRoleProfile, AppNotification } from '../types/tourneeScheduling';

export const DEMO_USERS: UserRoleProfile[] = [
  {
    id: 'partner-marc',
    name: 'Marc V.',
    role: 'PARTNER',
    title: 'Gérant du Cabinet & Partenaire CareTone',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'nurse-julie',
    name: 'Julie R.',
    role: 'NURSE',
    title: 'Infirmière Libérale (Tournée 1 - Titulaire)',
    avatar: 'https://images.unsplash.com/photo-1594824813566-7885a3961ad2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'nurse-thomas',
    name: 'Thomas D.',
    role: 'NURSE',
    title: 'Infirmier Remplaçant (Tournée 1 - Binôme)',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'nurse-sophie',
    name: 'Sophie M.',
    role: 'NURSE',
    title: 'Infirmière Référente (Tournée 2 - Titulaire)',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'nurse-antoine',
    name: 'Antoine L.',
    role: 'NURSE',
    title: 'Infirmier Associé (Tournée 2 - Binôme)',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'nurse-julie',
    userRole: 'NURSE',
    title: 'Nouveau Planning de Tournée',
    message: 'Marc V. vous a transmis la proposition de planning pour la Tournée 1 (Août 2026). Merci de valider vos gardes.',
    type: 'calendar_sent',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'notif-2',
    userId: 'partner-marc',
    userRole: 'PARTNER',
    title: 'Réponse Negotiation - Sophie M.',
    message: 'Sophie M. a accepté 5 gardes et proposé une date alternative pour le 12/08 dans la Tournée 2.',
    type: 'nurse_response',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

export const INITIAL_TOURNEE_CALENDARS: TourneeCalendar[] = [
  // Tournée 1 - Nurse 1: Julie R.
  {
    id: 'cal-t1-julie',
    tourneeName: 'Tournée 1 - Centre-Ville & Port',
    title: 'Planning Août 2026 - Julie R.',
    partnerId: 'partner-marc',
    partnerName: 'Marc V. (Cabinet CareTone)',
    nurseId: 'nurse-julie',
    nurseName: 'Julie R.',
    nurseAvatar: 'https://images.unsplash.com/photo-1594824813566-7885a3961ad2?auto=format&fit=crop&q=80&w=150',
    startDate: '2026-08-03',
    endDate: '2026-08-16',
    status: 'SENT',
    shifts: [
      { id: 's-j1', tourneeCalendarId: 'cal-t1-julie', date: '2026-08-03', status: 'PENDING', createdAt: '2026-07-26T10:00:00Z', updatedAt: '2026-07-26T10:00:00Z' },
      { id: 's-j2', tourneeCalendarId: 'cal-t1-julie', date: '2026-08-04', status: 'PENDING', createdAt: '2026-07-26T10:00:00Z', updatedAt: '2026-07-26T10:00:00Z' },
      { id: 's-j3', tourneeCalendarId: 'cal-t1-julie', date: '2026-08-05', status: 'PENDING', createdAt: '2026-07-26T10:00:00Z', updatedAt: '2026-07-26T10:00:00Z' },
      { id: 's-j4', tourneeCalendarId: 'cal-t1-julie', date: '2026-08-10', status: 'PENDING', createdAt: '2026-07-26T10:00:00Z', updatedAt: '2026-07-26T10:00:00Z' },
      { id: 's-j5', tourneeCalendarId: 'cal-t1-julie', date: '2026-08-11', status: 'PENDING', createdAt: '2026-07-26T10:00:00Z', updatedAt: '2026-07-26T10:00:00Z' },
      { id: 's-j6', tourneeCalendarId: 'cal-t1-julie', date: '2026-08-12', status: 'PENDING', createdAt: '2026-07-26T10:00:00Z', updatedAt: '2026-07-26T10:00:00Z' }
    ],
    messages: [
      {
        id: 'msg-j1',
        tourneeCalendarId: 'cal-t1-julie',
        senderId: 'partner-marc',
        senderName: 'Marc V.',
        senderRole: 'PARTNER',
        content: 'Bonjour Julie, voici ta proposition de planning pour les deux premières semaines d\'août sur la Tournée 1. Dis-moi si tout te convient.',
        createdAt: '2026-07-26T10:05:00Z'
      }
    ],
    createdAt: '2026-07-26T10:00:00Z',
    updatedAt: '2026-07-26T10:05:00Z'
  },

  // Tournée 1 - Nurse 2: Thomas D.
  {
    id: 'cal-t1-thomas',
    tourneeName: 'Tournée 1 - Centre-Ville & Port',
    title: 'Planning Août 2026 - Thomas D. (Remplacements)',
    partnerId: 'partner-marc',
    partnerName: 'Marc V. (Cabinet CareTone)',
    nurseId: 'nurse-thomas',
    nurseName: 'Thomas D.',
    nurseAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
    startDate: '2026-08-06',
    endDate: '2026-08-15',
    status: 'CONFIRMED',
    shifts: [
      { id: 's-t1', tourneeCalendarId: 'cal-t1-thomas', date: '2026-08-06', status: 'ACCEPTED', createdAt: '2026-07-25T08:00:00Z', updatedAt: '2026-07-25T14:00:00Z' },
      { id: 's-t2', tourneeCalendarId: 'cal-t1-thomas', date: '2026-08-07', status: 'ACCEPTED', createdAt: '2026-07-25T08:00:00Z', updatedAt: '2026-07-25T14:00:00Z' },
      { id: 's-t3', tourneeCalendarId: 'cal-t1-thomas', date: '2026-08-13', status: 'ACCEPTED', createdAt: '2026-07-25T08:00:00Z', updatedAt: '2026-07-25T14:00:00Z' },
      { id: 's-t4', tourneeCalendarId: 'cal-t1-thomas', date: '2026-08-14', status: 'ACCEPTED', createdAt: '2026-07-25T08:00:00Z', updatedAt: '2026-07-25T14:00:00Z' }
    ],
    messages: [
      {
        id: 'msg-t1',
        tourneeCalendarId: 'cal-t1-thomas',
        senderId: 'partner-marc',
        senderName: 'Marc V.',
        senderRole: 'PARTNER',
        content: 'Thomas, es-tu disponible pour couvrir le complément de la Tournée 1 du 6 au 14 août ?',
        createdAt: '2026-07-25T08:05:00Z'
      },
      {
        id: 'msg-t2',
        tourneeCalendarId: 'cal-t1-thomas',
        senderId: 'nurse-thomas',
        senderName: 'Thomas D.',
        senderRole: 'NURSE',
        content: 'Parfait Marc, toutes ces dates sont confirmées dans mon agenda !',
        createdAt: '2026-07-25T14:00:00Z'
      }
    ],
    createdAt: '2026-07-25T08:00:00Z',
    updatedAt: '2026-07-25T14:00:00Z'
  },

  // Tournée 2 - Nurse 1: Sophie M.
  {
    id: 'cal-t2-sophie',
    tourneeName: 'Tournée 2 - Secteur Est & Clinique',
    title: 'Planning Août 2026 - Sophie M.',
    partnerId: 'partner-marc',
    partnerName: 'Marc V. (Cabinet CareTone)',
    nurseId: 'nurse-sophie',
    nurseName: 'Sophie M.',
    nurseAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
    startDate: '2026-08-03',
    endDate: '2026-08-14',
    status: 'IN_REVIEW',
    shifts: [
      { id: 's-s1', tourneeCalendarId: 'cal-t2-sophie', date: '2026-08-03', status: 'ACCEPTED', createdAt: '2026-07-26T11:00:00Z', updatedAt: '2026-07-26T16:00:00Z' },
      { id: 's-s2', tourneeCalendarId: 'cal-t2-sophie', date: '2026-08-04', status: 'ACCEPTED', createdAt: '2026-07-26T11:00:00Z', updatedAt: '2026-07-26T16:00:00Z' },
      { id: 's-s3', tourneeCalendarId: 'cal-t2-sophie', date: '2026-08-05', status: 'ACCEPTED', createdAt: '2026-07-26T11:00:00Z', updatedAt: '2026-07-26T16:00:00Z' },
      { id: 's-s4', tourneeCalendarId: 'cal-t2-sophie', date: '2026-08-06', status: 'REJECTED', nurseComment: 'Indisponible (Formation DPC)', createdAt: '2026-07-26T11:00:00Z', updatedAt: '2026-07-26T16:00:00Z' },
      { id: 's-s5', tourneeCalendarId: 'cal-t2-sophie', date: '2026-08-10', status: 'PROPOSED_ALTERNATIVE', proposedDate: '2026-08-09', nurseComment: 'Préfère échanger avec le dimanche 9 août', createdAt: '2026-07-26T11:00:00Z', updatedAt: '2026-07-26T16:00:00Z' },
      { id: 's-s6', tourneeCalendarId: 'cal-t2-sophie', date: '2026-08-11', status: 'ACCEPTED', createdAt: '2026-07-26T11:00:00Z', updatedAt: '2026-07-26T16:00:00Z' }
    ],
    messages: [
      {
        id: 'msg-s1',
        tourneeCalendarId: 'cal-t2-sophie',
        senderId: 'partner-marc',
        senderName: 'Marc V.',
        senderRole: 'PARTNER',
        content: 'Sophie, voici la proposition pour le secteur Est.',
        createdAt: '2026-07-26T11:00:00Z'
      },
      {
        id: 'msg-s2',
        tourneeCalendarId: 'cal-t2-sophie',
        senderId: 'nurse-sophie',
        senderName: 'Sophie M.',
        senderRole: 'NURSE',
        content: 'J\'ai validé la majorité des jours. Je suis en formation DPC le 06/08 et j\'ai proposé de décaler le passage du 10 au 9 si Antoine peut permuter.',
        createdAt: '2026-07-26T16:00:00Z'
      }
    ],
    createdAt: '2026-07-26T11:00:00Z',
    updatedAt: '2026-07-26T16:00:00Z'
  },

  // Tournée 2 - Nurse 2: Antoine L.
  {
    id: 'cal-t2-antoine',
    tourneeName: 'Tournée 2 - Secteur Est & Clinique',
    title: 'Planning Août 2026 - Antoine L.',
    partnerId: 'partner-marc',
    partnerName: 'Marc V. (Cabinet CareTone)',
    nurseId: 'nurse-antoine',
    nurseName: 'Antoine L.',
    nurseAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
    startDate: '2026-08-07',
    endDate: '2026-08-16',
    status: 'SENT',
    shifts: [
      { id: 's-a1', tourneeCalendarId: 'cal-t2-antoine', date: '2026-08-07', status: 'PENDING', createdAt: '2026-07-26T12:00:00Z', updatedAt: '2026-07-26T12:00:00Z' },
      { id: 's-a2', tourneeCalendarId: 'cal-t2-antoine', date: '2026-08-08', status: 'PENDING', createdAt: '2026-07-26T12:00:00Z', updatedAt: '2026-07-26T12:00:00Z' },
      { id: 's-a3', tourneeCalendarId: 'cal-t2-antoine', date: '2026-08-09', status: 'PENDING', createdAt: '2026-07-26T12:00:00Z', updatedAt: '2026-07-26T12:00:00Z' },
      { id: 's-a4', tourneeCalendarId: 'cal-t2-antoine', date: '2026-08-14', status: 'PENDING', createdAt: '2026-07-26T12:00:00Z', updatedAt: '2026-07-26T12:00:00Z' },
      { id: 's-a5', tourneeCalendarId: 'cal-t2-antoine', date: '2026-08-15', status: 'PENDING', createdAt: '2026-07-26T12:00:00Z', updatedAt: '2026-07-26T12:00:00Z' }
    ],
    messages: [
      {
        id: 'msg-a1',
        tourneeCalendarId: 'cal-t2-antoine',
        senderId: 'partner-marc',
        senderName: 'Marc V.',
        senderRole: 'PARTNER',
        content: 'Antoine, voici ton planning pour le milieu de mois sur la Tournée 2.',
        createdAt: '2026-07-26T12:05:00Z'
      }
    ],
    createdAt: '2026-07-26T12:00:00Z',
    updatedAt: '2026-07-26T12:05:00Z'
  }
];
