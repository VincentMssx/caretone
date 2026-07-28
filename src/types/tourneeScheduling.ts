export type CalendarStatus = 'DRAFT' | 'SENT' | 'IN_REVIEW' | 'CONFIRMED';

export type ShiftStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'PROPOSED_ALTERNATIVE';

export interface ShiftAssignment {
  id: string;
  tourneeCalendarId: string;
  date: string; // ISO format YYYY-MM-DD
  status: ShiftStatus;
  proposedDate?: string; // ISO format YYYY-MM-DD
  nurseComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TourneeMessage {
  id: string;
  tourneeCalendarId: string;
  senderId: string;
  senderName: string;
  senderRole: 'PARTNER' | 'NURSE';
  content: string;
  createdAt: string;
}

export interface TourneeCalendar {
  id: string;
  tourneeName: string; // e.g. "Tournée 1 - Centre-Ville & Port" or "Tournée 2 - Secteur Est & Clinique"
  title: string;
  partnerId: string;
  partnerName: string;
  nurseId: string;
  nurseName: string;
  nurseAvatar?: string;
  startDate: string;
  endDate: string;
  status: CalendarStatus;
  shifts: ShiftAssignment[];
  messages: TourneeMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleProfile {
  id: string;
  name: string;
  role: 'PARTNER' | 'NURSE';
  title: string;
  avatar: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  userRole: 'PARTNER' | 'NURSE';
  title: string;
  message: string;
  type: 'calendar_sent' | 'nurse_response' | 'calendar_confirmed' | 'negotiation_update';
  link?: string;
  isRead: boolean;
  createdAt: string;
}
