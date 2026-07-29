import React, { useState } from 'react';
import { 
  TourneeCalendar, 
  ShiftAssignment, 
  ShiftStatus, 
  UserRoleProfile, 
  AppNotification 
} from '../types/tourneeScheduling';
import { 
  DEMO_USERS, 
  INITIAL_TOURNEE_CALENDARS, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockTourneeCalendars';
import { getStoredTourneeColumns, TourneeColumn } from '../data/mockPatients';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  AlertTriangle,
  Scale,
  Users,
  Clock, 
  Send, 
  MessageSquare, 
  User, 
  Bell, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Grid,
  List,
  Check, 
  RotateCcw, 
  CalendarDays, 
  ShieldCheck, 
  Info,
  Filter,
  UserCheck
} from 'lucide-react';

interface TourneeSchedulingPanelProps {
  onSuccessToast?: (msg: string) => void;
}

export const TourneeSchedulingPanel: React.FC<TourneeSchedulingPanelProps> = ({ onSuccessToast }) => {
  // State for active role / user profile
  const [currentUser, setCurrentUser] = useState<UserRoleProfile>(DEMO_USERS[0]); // Default Marc V. (Partner)
  
  // State for calendars and notifications
  const [calendars, setCalendars] = useState<TourneeCalendar[]>(INITIAL_TOURNEE_CALENDARS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  
  // Active selected calendar for negotiation
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>(INITIAL_TOURNEE_CALENDARS[0].id);
  
  // Filter by tournee name and nurse
  const [tourneeFilter, setTourneeFilter] = useState<string>('ALL');
  const [nurseFilter, setNurseFilter] = useState<string>('ALL');
  const [availableTournees, setAvailableTournees] = useState<TourneeColumn[]>([]);

  React.useEffect(() => {
    const loadedCols = getStoredTourneeColumns();
    setAvailableTournees(loadedCols.filter(c => c.id !== 'UNASSIGNED'));
  }, []);

  // View mode: 'GRID' (Calendrier Mensuel Visuel) or 'LIST' (Négociations & Clavardage)
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [mobileSubView, setMobileSubView] = useState<'GRID' | 'AGENDA'>('GRID');

  // Selected Month & Year for Grid
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // 7 = August (0-indexed)

  // Day Selection & Planning Modal State
  const [selectedDayDateStr, setSelectedDayDateStr] = useState<string | null>(null);
  const [planNurseId, setPlanNurseId] = useState<string>('nurse-julie');
  const [planTourneeName, setPlanTourneeName] = useState<string>('Tournée Matin');
  const [planStatus, setPlanStatus] = useState<ShiftStatus>('PENDING');
  const [planComment, setPlanComment] = useState<string>('');

  // Multi-day Click & Drag selection
  const [selectedMultiDates, setSelectedMultiDates] = useState<string[]>([]);
  const [isMouseDownGrid, setIsMouseDownGrid] = useState<boolean>(false);
  const [multiSelectNurseId, setMultiSelectNurseId] = useState<string>('nurse-julie');
  const [multiSelectTourneeName, setMultiSelectTourneeName] = useState<string>('Tournée Matin');

  const handleDayCellMouseDown = (dateStr: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    setIsMouseDownGrid(true);
    if (selectedMultiDates.includes(dateStr)) {
      setSelectedMultiDates(selectedMultiDates.filter(d => d !== dateStr));
    } else {
      setSelectedMultiDates(prev => [...prev, dateStr]);
    }
  };

  const handleDayCellMouseEnter = (dateStr: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || !isMouseDownGrid) return;
    if (!selectedMultiDates.includes(dateStr)) {
      setSelectedMultiDates(prev => [...prev, dateStr]);
    }
  };

  const handleApplyMultiSelection = () => {
    if (selectedMultiDates.length === 0) return;

    // Apply new shifts for multiSelectNurseId & multiSelectTourneeName
    const updatedCalendars = calendars.map(cal => {
      if (cal.nurseId === multiSelectNurseId) {
        const existingShifts = [...cal.shifts];
        selectedMultiDates.forEach(dateStr => {
          const shiftIndex = existingShifts.findIndex(s => s.date === dateStr);
          if (shiftIndex >= 0) {
            existingShifts[shiftIndex] = {
              ...existingShifts[shiftIndex],
              tourneeName: multiSelectTourneeName,
              status: 'PENDING',
              updatedAt: new Date().toISOString()
            };
          } else {
            existingShifts.push({
              id: `shift-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              date: dateStr,
              tourneeName: multiSelectTourneeName,
              status: 'PENDING',
              proposedByRole: currentUser.role,
              updatedAt: new Date().toISOString()
            });
          }
        });
        return {
          ...cal,
          shifts: existingShifts,
          updatedAt: new Date().toISOString()
        };
      }
      return cal;
    });

    setCalendars(updatedCalendars);
    setSelectedMultiDates([]);
    if (onSuccessToast) {
      onSuccessToast(`${selectedMultiDates.length} jour(s) affecté(s) à ${multiSelectNurseId === 'nurse-julie' ? 'Julie R.' : multiSelectNurseId === 'nurse-marc' ? 'Marc V.' : 'Sophie L.'} (${multiSelectTourneeName})`);
    }
  };

  // Quick Shift Detail Modal
  const [activeShiftDetail, setActiveShiftDetail] = useState<{
    shift: ShiftAssignment;
    calendar: TourneeCalendar;
    nurseName: string;
    nurseAvatar: string;
  } | null>(null);

  const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Month Grid Calculation
  const gridCells = React.useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    let startDayOfWeek = (firstDay.getDay() + 6) % 7; // Mon=0..Sun=6
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const cells = [];

    // Padding previous month
    const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const pMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
      const pYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      const dateStr = `${pYear}-${String(pMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({ dayNumber: dayNum, dateStr, isCurrentMonth: false, isWeekend: false });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(selectedYear, selectedMonth, day);
      const dayOfWeek = (d.getDay() + 6) % 7;
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: true,
        isWeekend: dayOfWeek >= 5
      });
    }

    // Next month padding
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
      const nYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
      const dateStr = `${nYear}-${String(nMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({ dayNumber: i, dateStr, isCurrentMonth: false, isWeekend: false });
    }

    return cells;
  }, [selectedYear, selectedMonth]);

  // Helper to match Tournée filters reliably across naming conventions
  const checkTourneeMatch = (tourneeName: string, filterStr: string): boolean => {
    if (!filterStr || filterStr === 'ALL') return true;
    const t = (tourneeName || '').toLowerCase();
    const f = filterStr.toLowerCase();

    if (t.includes(f) || f.includes(t)) return true;

    const isMatinFilter = f.includes('matin') || f.includes('1') || f.includes('t1');
    const isMatinTournee = t.includes('matin') || t.includes('1') || t.includes('t1') || t.includes('centre-ville');
    if (isMatinFilter && isMatinTournee) return true;

    const isSoirFilter = f.includes('soir') || f.includes('2') || f.includes('t2');
    const isSoirTournee = t.includes('soir') || t.includes('2') || t.includes('t2') || t.includes('secteur est');
    if (isSoirFilter && isSoirTournee) return true;

    return false;
  };

  // Ref and helper for smooth scroll down to Chat section
  const chatSectionRef = React.useRef<HTMLDivElement>(null);
  const scrollToChat = () => {
    setTimeout(() => {
      chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Aggregate shifts by date for month grid
  const shiftsByDate = React.useMemo(() => {
    const map: Record<string, Array<{
      shift: ShiftAssignment;
      calendar: TourneeCalendar;
      nurseName: string;
      nurseAvatar: string;
      tourneeTag: string;
    }>> = {};

    calendars.forEach(cal => {
      if (nurseFilter !== 'ALL' && cal.nurseId !== nurseFilter) return;

      cal.shifts.forEach(shift => {
        const shiftTournee = shift.tourneeName || cal.tourneeName;

        if (tourneeFilter !== 'ALL') {
          const matchCal = checkTourneeMatch(cal.tourneeName, tourneeFilter);
          const matchShift = checkTourneeMatch(shiftTournee, tourneeFilter);
          if (!matchCal && !matchShift) return;
        }

        if (!map[shift.date]) map[shift.date] = [];
        map[shift.date].push({
          shift,
          calendar: cal,
          nurseName: cal.nurseName,
          nurseAvatar: cal.nurseAvatar,
          tourneeTag: shiftTournee.includes('1') || shiftTournee.toLowerCase().includes('matin') ? 'T1' : 'T2'
        });
      });
    });

    return map;
  }, [calendars, tourneeFilter, nurseFilter]);

  // Nurse Workload Summary (Boxes for all nurses)
  const nurseWorkloadList = React.useMemo(() => {
    const nurses = DEMO_USERS.filter(u => u.role === 'NURSE');
    return nurses.map(nurse => {
      const nurseCal = calendars.find(c => c.nurseId === nurse.id);
      let totalShifts = 0;
      let acceptedShifts = 0;
      let pendingShifts = 0;
      let rejectedShifts = 0;
      let alternativeShifts = 0;

      calendars.filter(c => c.nurseId === nurse.id).forEach(cal => {
        cal.shifts.forEach(s => {
          if (tourneeFilter !== 'ALL') {
            const sTournee = s.tourneeName || cal.tourneeName;
            if (!checkTourneeMatch(cal.tourneeName, tourneeFilter) && !checkTourneeMatch(sTournee, tourneeFilter)) {
              return;
            }
          }
          totalShifts++;
          if (s.status === 'ACCEPTED') acceptedShifts++;
          else if (s.status === 'PENDING') pendingShifts++;
          else if (s.status === 'REJECTED') rejectedShifts++;
          else if (s.status === 'PROPOSED_ALTERNATIVE') alternativeShifts++;
        });
      });

      return {
        nurseId: nurse.id,
        nurseName: nurse.name,
        nurseAvatar: nurse.avatar,
        role: nurse.name === 'Julie R.' ? 'IDEL Titulaire' : nurse.name === 'Marc V.' ? 'IDEL Associé' : 'IDEL Remplaçant(e)',
        tourneeName: nurseCal ? nurseCal.tourneeName : 'Tournée Matin',
        totalShifts,
        acceptedShifts,
        pendingShifts,
        rejectedShifts,
        alternativeShifts,
        calendarId: nurseCal ? nurseCal.id : (calendars[0]?.id || '')
      };
    });
  }, [calendars, tourneeFilter]);

  // New Calendar Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTourneeName, setNewTourneeName] = useState('Tournée 1 - Centre-Ville & Port');
  const [newNurseId, setNewNurseId] = useState('nurse-julie');
  const [newTitle, setNewTitle] = useState('Planning Fin Août 2026');
  const [newStartDate, setNewStartDate] = useState('2026-08-17');
  const [newEndDate, setNewEndDate] = useState('2026-08-23');
  const [newShiftDatesText, setNewShiftDatesText] = useState('2026-08-17, 2026-08-18, 2026-08-19, 2026-08-20');
  const [newInitialMsg, setNewInitialMsg] = useState('Bonjour, voici ton planning pour la 3ème semaine d\'août.');

  // Inline Message Input State
  const [replyMessage, setReplyMessage] = useState('');

  // Chat Tabs & Multi-Manager State
  const [chatTab, setChatTab] = useState<'CONFLICTS' | 'GENERAL' | 'DIRECT'>('CONFLICTS');
  const [activeConflictId, setActiveConflictId] = useState<string>('conf-1');
  const [activeSenderPersona, setActiveSenderPersona] = useState<string>('Dr Morel (Gérant)');

  // General Cabinet Chat Messages
  const [generalMessages, setGeneralMessages] = useState<Array<{
    id: string;
    senderName: string;
    senderRole: string;
    content: string;
    createdAt: string;
  }>>([
    {
      id: 'gen-1',
      senderName: 'Dr Morel (Gérant)',
      senderRole: 'GERANT',
      content: 'Bonjour l\'équipe ! Merci de vérifier vos disponibilités pour fin Juillet. En cas de conflit, utilisez l\'onglet Arbitrage.',
      createdAt: '2026-07-27T08:30:00Z'
    },
    {
      id: 'gen-2',
      senderName: 'Julie R. (Co-Gérante)',
      senderRole: 'GERANT',
      content: 'Parfait ! J\'ai transmis mes demandes de garde. N\'hésitez pas si vous souhaitez échanger une tournée.',
      createdAt: '2026-07-27T09:10:00Z'
    }
  ]);

  // Conflicts State
  const [conflictsList, setConflictsList] = useState([
    {
      id: 'conf-1',
      date: '2026-07-28',
      tourneeName: 'Tournée Matin (Centre-ville)',
      nurseAName: 'Julie R.',
      nurseAId: 'nurse-julie',
      nurseBName: 'Marc V.',
      nurseBId: 'nurse-marc',
      reason: 'Double demande simultanée pour la même tournée du 28 Juillet.',
      status: 'OPEN' as 'OPEN' | 'RESOLVED',
      resolvedWinner: null as string | null,
      messages: [
        {
          id: 'cm-1',
          senderName: 'Marc V. (IDEL)',
          senderRole: 'NURSE',
          content: 'J\'ai posé ma candidature pour la garde du 28/07.',
          createdAt: '2026-07-27T10:00:00Z'
        },
        {
          id: 'cm-2',
          senderName: 'Julie R. (Co-Gérante)',
          senderRole: 'GERANT',
          content: 'Je suis également disponible le 28/07. On attend l\'arbitrage de la gérance.',
          createdAt: '2026-07-27T10:15:00Z'
        }
      ]
    },
    {
      id: 'conf-2',
      date: '2026-08-05',
      tourneeName: 'Tournée Soir (Secteur Est)',
      nurseAName: 'Marc V.',
      nurseAId: 'nurse-marc',
      nurseBName: 'Sophie L.',
      nurseBId: 'nurse-sophie',
      reason: 'Demande de remplacement non arbitrée sur la tournée du soir.',
      status: 'OPEN' as 'OPEN' | 'RESOLVED',
      resolvedWinner: null as string | null,
      messages: [
        {
          id: 'cm-201',
          senderName: 'Sophie L. (Remplaçante)',
          senderRole: 'NURSE',
          content: 'Bonjour, disponible pour remplacer Marc V. le 05/08.',
          createdAt: '2026-07-27T14:20:00Z'
        }
      ]
    }
  ]);

  // Handler: Arbitrate Conflict
  const handleArbitrateConflict = (conflictId: string, winnerNurseName: string, winnerNurseId: string) => {
    const activeConf = conflictsList.find(c => c.id === conflictId);
    if (!activeConf) return;

    const arbMsgText = `⚖️ ARBITRAGE GÉRANCE : La garde du ${activeConf.date} (${activeConf.tourneeName}) est officiellement attribuée à ${winnerNurseName} par ${activeSenderPersona}.`;

    // 1. Mark conflict as resolved and append arbitration message
    setConflictsList(prev => prev.map(c => {
      if (c.id === conflictId) {
        return {
          ...c,
          status: 'RESOLVED',
          resolvedWinner: winnerNurseName,
          messages: [
            ...c.messages,
            {
              id: `arb-${Date.now()}`,
              senderName: activeSenderPersona,
              senderRole: 'GERANT',
              content: arbMsgText,
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return c;
    }));

    // 2. Also append to general cabinet chat
    setGeneralMessages(prev => [
      ...prev,
      {
        id: `gen-arb-${Date.now()}`,
        senderName: activeSenderPersona,
        senderRole: 'GERANT',
        content: arbMsgText,
        createdAt: new Date().toISOString()
      }
    ]);

    // 3. Update shift status in calendars state
    setCalendars(prevCals => prevCals.map(cal => {
      if (cal.nurseId === winnerNurseId) {
        // Accept shift for winner
        const existingShiftIndex = cal.shifts.findIndex(s => s.date === activeConf.date);
        let newShifts = [...cal.shifts];
        if (existingShiftIndex !== -1) {
          newShifts[existingShiftIndex] = { ...newShifts[existingShiftIndex], status: 'ACCEPTED' };
        } else {
          newShifts.push({
            id: `shift-arb-${Date.now()}`,
            date: activeConf.date,
            tourneeName: activeConf.tourneeName,
            status: 'ACCEPTED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        return { ...cal, shifts: newShifts };
      } else if (cal.nurseId === (winnerNurseId === activeConf.nurseAId ? activeConf.nurseBId : activeConf.nurseAId)) {
        // Reject or cancel for other nurse
        const newShifts = cal.shifts.map(s => s.date === activeConf.date ? { ...s, status: 'REJECTED' as ShiftStatus } : s);
        return { ...cal, shifts: newShifts };
      }
      return cal;
    }));

    if (onSuccessToast) {
      onSuccessToast(`Arbitrage effectué ! Garde attribuée à ${winnerNurseName}. Planning mis à jour.`);
    }
  };

  // Selected Calendar object
  const activeCalendar = calendars.find(c => c.id === selectedCalendarId) || calendars[0];

  // User Unread Notification Count
  const userNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  // Filtered Calendars list
  const filteredCalendars = calendars.filter(c => {
    if (tourneeFilter === 'ALL') return true;
    return c.tourneeName.includes(tourneeFilter);
  });

  // Handler: Add or update shift for a selected day dateStr
  const handleAddShiftToDate = (
    dateStr: string,
    nurseId: string,
    tourneeTitle: string,
    status: ShiftStatus,
    comment?: string
  ) => {
    const nurseObj = DEMO_USERS.find(u => u.id === nurseId);
    const nurseName = nurseObj ? nurseObj.name : 'Infirmier(e)';
    const nurseAvatar = nurseObj ? nurseObj.avatar : 'https://images.unsplash.com/photo-1594824813566-7885a3961ad2?auto=format&fit=crop&q=80&w=150';

    setCalendars(prevCalendars => {
      // Find matching calendar for this nurse or tournee
      let targetCal = prevCalendars.find(c => c.nurseId === nurseId && c.tourneeName.startsWith(tourneeTitle.split(' - ')[0]));
      if (!targetCal) {
        targetCal = prevCalendars.find(c => c.nurseId === nurseId);
      }

      if (targetCal) {
        // Update existing calendar
        const existingShiftIndex = targetCal.shifts.findIndex(s => s.date === dateStr);
        let updatedShifts = [...targetCal.shifts];

        if (existingShiftIndex !== -1) {
          updatedShifts[existingShiftIndex] = {
            ...updatedShifts[existingShiftIndex],
            status,
            nurseComment: comment || updatedShifts[existingShiftIndex].nurseComment,
            updatedAt: new Date().toISOString()
          };
        } else {
          updatedShifts.push({
            id: `s-${Date.now()}`,
            tourneeCalendarId: targetCal.id,
            date: dateStr,
            status,
            nurseComment: comment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        return prevCalendars.map(c => c.id === targetCal!.id ? { ...c, shifts: updatedShifts, updatedAt: new Date().toISOString() } : c);
      } else {
        // Create new calendar
        const newCalId = `cal-new-${Date.now()}`;
        const newCal: TourneeCalendar = {
          id: newCalId,
          tourneeName: tourneeTitle,
          title: `Planning - ${nurseName}`,
          partnerId: currentUser.id,
          partnerName: currentUser.name,
          nurseId: nurseId,
          nurseName: nurseName,
          nurseAvatar: nurseAvatar,
          startDate: dateStr,
          endDate: dateStr,
          status: 'SENT',
          shifts: [
            {
              id: `s-${Date.now()}`,
              tourneeCalendarId: newCalId,
              date: dateStr,
              status,
              nurseComment: comment,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return [...prevCalendars, newCal];
      }
    });
  };

  const handleRemoveShiftFromDay = (calendarId: string, shiftId: string) => {
    setCalendars(prev => prev.map(c => {
      if (c.id === calendarId) {
        return {
          ...c,
          shifts: c.shifts.filter(s => s.id !== shiftId),
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
    if (onSuccessToast) onSuccessToast('Garde supprimée avec succès.');
  };

  // Helper to add notification
  const sendNotification = (userId: string, userRole: 'PARTNER' | 'NURSE', title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId,
      userRole,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Nurse "Accept All"
  const handleNurseAcceptAll = () => {
    if (!activeCalendar) return;

    const updatedShifts = activeCalendar.shifts.map(s => ({
      ...s,
      status: 'ACCEPTED' as ShiftStatus,
      updatedAt: new Date().toISOString()
    }));

    const updatedCalendar: TourneeCalendar = {
      ...activeCalendar,
      status: 'IN_REVIEW',
      shifts: updatedShifts,
      updatedAt: new Date().toISOString()
    };

    setCalendars(prev => prev.map(c => c.id === activeCalendar.id ? updatedCalendar : c));

    // Notify partner
    sendNotification(
      activeCalendar.partnerId,
      'PARTNER',
      `Planning Accepté par ${currentUser.name}`,
      `${currentUser.name} a accepté l'intégralité des gardes pour ${activeCalendar.tourneeName}.`,
      'nurse_response'
    );

    if (onSuccessToast) onSuccessToast(`Vous avez accepté toutes les gardes pour ${activeCalendar.tourneeName} !`);
  };

  // Handler: Nurse Toggle Shift Status (Accepted <-> Rejected / Proposed)
  const handleNurseToggleShift = (shiftId: string, targetStatus: ShiftStatus) => {
    if (!activeCalendar) return;

    const updatedShifts = activeCalendar.shifts.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          status: targetStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    const updatedCalendar: TourneeCalendar = {
      ...activeCalendar,
      shifts: updatedShifts,
      updatedAt: new Date().toISOString()
    };

    setCalendars(prev => prev.map(c => c.id === activeCalendar.id ? updatedCalendar : c));
  };

  // Handler: Nurse Update Proposed Date
  const handleNurseUpdateProposedDate = (shiftId: string, proposedDate: string, comment?: string) => {
    if (!activeCalendar) return;

    const updatedShifts = activeCalendar.shifts.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          status: 'PROPOSED_ALTERNATIVE' as ShiftStatus,
          proposedDate: proposedDate || undefined,
          nurseComment: comment ?? s.nurseComment,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    const updatedCalendar: TourneeCalendar = {
      ...activeCalendar,
      shifts: updatedShifts,
      updatedAt: new Date().toISOString()
    };

    setCalendars(prev => prev.map(c => c.id === activeCalendar.id ? updatedCalendar : c));
  };

  // Handler: Nurse Update Comment
  const handleNurseUpdateComment = (shiftId: string, comment: string) => {
    if (!activeCalendar) return;

    const updatedShifts = activeCalendar.shifts.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          nurseComment: comment,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    const updatedCalendar: TourneeCalendar = {
      ...activeCalendar,
      shifts: updatedShifts,
      updatedAt: new Date().toISOString()
    };

    setCalendars(prev => prev.map(c => c.id === activeCalendar.id ? updatedCalendar : c));
  };

  // Handler: Submit Nurse Counter-Proposal / Response
  const handleSubmitNurseResponse = () => {
    if (!activeCalendar) return;

    const updatedCalendar: TourneeCalendar = {
      ...activeCalendar,
      status: 'IN_REVIEW',
      updatedAt: new Date().toISOString()
    };

    setCalendars(prev => prev.map(c => c.id === activeCalendar.id ? updatedCalendar : c));

    // Send notification to partner
    const acceptedCount = activeCalendar.shifts.filter(s => s.status === 'ACCEPTED').length;
    const rejectedCount = activeCalendar.shifts.filter(s => s.status === 'REJECTED').length;
    const proposedCount = activeCalendar.shifts.filter(s => s.status === 'PROPOSED_ALTERNATIVE').length;

    sendNotification(
      activeCalendar.partnerId,
      'PARTNER',
      `Réponse Négociation - ${currentUser.name}`,
      `${currentUser.name} a transmis ses réponses (${acceptedCount} acceptée(s), ${rejectedCount} refusée(s), ${proposedCount} alternative(s)).`,
      'nurse_response'
    );

    if (onSuccessToast) onSuccessToast(`Vos choix de planning ont été transmis à ${activeCalendar.partnerName} !`);
  };

  // Handler: Partner Accept Alternative Date for a Shift
  const handlePartnerAcceptAlternative = (shiftId: string) => {
    if (!activeCalendar) return;

    const updatedShifts = activeCalendar.shifts.map(s => {
      if (s.id === shiftId && s.proposedDate) {
        return {
          ...s,
          date: s.proposedDate,
          proposedDate: undefined,
          status: 'ACCEPTED' as ShiftStatus,
          nurseComment: `[Alternative validée par le gérant] ${s.nurseComment || ''}`,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    const updatedCalendar: TourneeCalendar = {
      ...activeCalendar,
      shifts: updatedShifts,
      updatedAt: new Date().toISOString()
    };

    setCalendars(prev => prev.map(c => c.id === activeCalendar.id ? updatedCalendar : c));

    if (onSuccessToast) onSuccessToast("Date alternative acceptée et intégrée dans le planning !");
  };

  // Handler: Partner Confirm Schedule
  const handlePartnerConfirmSchedule = () => {
    if (!activeCalendar) return;

    const updatedCalendar: TourneeCalendar = {
      ...activeCalendar,
      status: 'CONFIRMED',
      updatedAt: new Date().toISOString()
    };

    setCalendars(prev => prev.map(c => c.id === activeCalendar.id ? updatedCalendar : c));

    // Notify Nurse
    sendNotification(
      activeCalendar.nurseId,
      'NURSE',
      `Planning Confirmé !`,
      `${activeCalendar.partnerName} a validé et verrouillé le planning final pour ${activeCalendar.tourneeName}.`,
      'calendar_confirmed'
    );

    if (onSuccessToast) onSuccessToast(`Planning de ${activeCalendar.nurseName} officiellement confirmé !`);
  };

  // Handler: Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    const contentText = replyMessage.trim();

    if (chatTab === 'CONFLICTS') {
      const activeConf = conflictsList.find(c => c.id === activeConflictId);
      if (activeConf) {
        const newMsg = {
          id: `cm-${Date.now()}`,
          senderName: activeSenderPersona,
          senderRole: activeSenderPersona.includes('Gérant') ? 'GERANT' : 'NURSE',
          content: contentText,
          createdAt: new Date().toISOString()
        };
        setConflictsList(prev => prev.map(c => c.id === activeConflictId ? { ...c, messages: [...c.messages, newMsg] } : c));
        setReplyMessage('');
        if (onSuccessToast) onSuccessToast("Message posté dans le fil de conflit !");
      }
      return;
    }

    if (chatTab === 'GENERAL') {
      const newMsg = {
        id: `gen-${Date.now()}`,
        senderName: activeSenderPersona,
        senderRole: activeSenderPersona.includes('Gérant') ? 'GERANT' : 'NURSE',
        content: contentText,
        createdAt: new Date().toISOString()
      };
      setGeneralMessages(prev => [...prev, newMsg]);
      setReplyMessage('');
      if (onSuccessToast) onSuccessToast("Message posté sur le canal général du cabinet !");
      return;
    }

    if (!activeCalendar) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      tourneeCalendarId: activeCalendar.id,
      senderId: currentUser.id,
      senderName: activeSenderPersona,
      senderRole: activeSenderPersona.includes('Gérant') ? 'PARTNER' : 'NURSE',
      content: contentText,
      createdAt: new Date().toISOString()
    };

    const updatedCalendar: TourneeCalendar = {
      ...activeCalendar,
      messages: [...activeCalendar.messages, newMessage],
      updatedAt: new Date().toISOString()
    };

    setCalendars(prev => prev.map(c => c.id === activeCalendar.id ? updatedCalendar : c));
    setReplyMessage('');

    if (onSuccessToast) onSuccessToast("Message envoyé !");
  };

  // Handler: Create New Calendar
  const handleCreateCalendarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedNurse = DEMO_USERS.find(u => u.id === newNurseId);
    if (!assignedNurse) return;

    // Parse dates
    const dates = newShiftDatesText.split(',').map(d => d.trim()).filter(Boolean);
    const shifts: ShiftAssignment[] = dates.map((d, idx) => ({
      id: `s-new-${idx}-${Date.now()}`,
      tourneeCalendarId: `cal-${Date.now()}`,
      date: d,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const newCalendar: TourneeCalendar = {
      id: `cal-${Date.now()}`,
      tourneeName: newTourneeName,
      title: newTitle,
      partnerId: currentUser.id,
      partnerName: currentUser.name,
      nurseId: assignedNurse.id,
      nurseName: assignedNurse.name,
      nurseAvatar: assignedNurse.avatar,
      startDate: newStartDate,
      endDate: newEndDate,
      status: 'SENT',
      shifts,
      messages: newInitialMsg ? [
        {
          id: `msg-init-${Date.now()}`,
          tourneeCalendarId: `cal-${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: 'PARTNER',
          content: newInitialMsg,
          createdAt: new Date().toISOString()
        }
      ] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCalendars(prev => [newCalendar, ...prev]);
    setSelectedCalendarId(newCalendar.id);
    setShowCreateModal(false);

    // Send Notification
    sendNotification(
      assignedNurse.id,
      'NURSE',
      `Nouveau Planning Proposé`,
      `${currentUser.name} vous a transmis une nouvelle proposition de garde pour ${newTourneeName}.`,
      'calendar_sent'
    );

    if (onSuccessToast) onSuccessToast(`Planning transmis à ${assignedNurse.name} !`);
  };

  // Shift Status badge styling helper
  const getShiftBadge = (status: ShiftStatus, proposedDate?: string) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Accepté
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Refusé
          </span>
        );
      case 'PROPOSED_ALTERNATIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            Proposé le {proposedDate}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            En attente de réponse
          </span>
        );
    }
  };

  // Calendar Status badge helper
  const getCalendarStatusBadge = (status: TourneeCalendar['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">Brouillon</span>;
      case 'SENT':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-sky-100 text-sky-800">Transmis</span>;
      case 'IN_REVIEW':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">En Négociation</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">Confirmé</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* User Role Switcher Header & Notification Bell */}
      <div className="bg-gradient-to-r from-[#131b2e] to-[#004c6e] text-white p-5 rounded-2xl shadow-md border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-sky-300">
                Sélecteur de Rôle Démo
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-300">Basculer le point de vue</span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{currentUser.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-200 border border-sky-400/30 font-semibold">
                {currentUser.role === 'PARTNER' ? 'Partenaire / Gérant' : 'Infirmier(e) IDEL'}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Select dropdown for user switching */}
          <select
            value={currentUser.id}
            onChange={(e) => {
              const u = DEMO_USERS.find(x => x.id === e.target.value);
              if (u) setCurrentUser(u);
            }}
            className="bg-slate-800/90 text-white border border-slate-600 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            {DEMO_USERS.map(user => (
              <option key={user.id} value={user.id}>
                {user.role === 'PARTNER' ? '👔' : '💉'} {user.name} ({user.role === 'PARTNER' ? 'Gérant' : 'IDEL'})
              </option>
            ))}
          </select>

          {/* In-App Notification Bell Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="relative p-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl border border-slate-600 transition-colors cursor-pointer"
              title="Notifications en direct"
            >
              <Bell className="w-5 h-5 text-sky-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Dropdown */}
            {showNotifDrawer && (
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-sm">Notifications In-App ({currentUser.name})</span>
                  </div>
                  {userNotifications.length > 0 && (
                    <button
                      onClick={() => setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, isRead: true } : n))}
                      className="text-[11px] text-sky-400 hover:underline cursor-pointer"
                    >
                      Tout marquer lu
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {userNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Aucune notification pour le moment.
                    </div>
                  ) : (
                    userNotifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3.5 text-xs flex flex-col gap-1 transition-colors ${
                          n.isRead ? 'bg-white opacity-70' : 'bg-sky-50/70 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: CALENDRIER AVEC BANDEAU COLLÉ */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
        {/* Bandeau collé au calendrier avec nom du mois, nav, filtre infirmier & filtre tournée tout à droite */}
        <div className="bg-slate-900 text-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
          {/* Left: Nom du mois + Boutons de navigation */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-300 rounded-xl border border-sky-400/30 shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <h3 className="text-base sm:text-lg font-bold text-white min-w-[130px]">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </h3>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  title="Mois Précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setSelectedYear(2026); setSelectedMonth(7); }}
                  className="px-2.5 py-1 bg-[#006591] hover:bg-sky-600 text-white font-bold text-xs rounded-lg shadow-2xs cursor-pointer"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  title="Mois Suivant"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Filtre Infirmier & Filtre Tournée (Tout à droite) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtre par Infirmier */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <select
                value={nurseFilter}
                onChange={(e) => setNurseFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-white cursor-pointer focus:outline-none"
              >
                <option value="ALL" className="text-slate-900">Tous les Infirmiers</option>
                {DEMO_USERS.filter(u => u.role === 'NURSE').map(u => (
                  <option key={u.id} value={u.id} className="text-slate-900">{u.name}</option>
                ))}
              </select>
            </div>

            {/* Filtre des Tournées tout à droite */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <Filter className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <select
                value={tourneeFilter}
                onChange={(e) => setTourneeFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-white cursor-pointer focus:outline-none max-w-[180px] truncate"
              >
                <option value="ALL" className="text-slate-900">Toutes les Tournées</option>
                {availableTournees.map(col => (
                  <option key={col.id} value={col.title} className="text-slate-900">
                    {col.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Full Month Visual Calendar Grid */}
        <div className="bg-white overflow-hidden">
          {/* Calendar Weekday Headers */}
          <div className="grid grid-cols-7 bg-slate-800 text-white text-[11px] sm:text-xs font-bold py-2.5 text-center divide-x divide-slate-700">
            <div><span className="hidden sm:inline">Lundi</span><span className="sm:hidden">Lun</span></div>
            <div><span className="hidden sm:inline">Mardi</span><span className="sm:hidden">Mar</span></div>
            <div><span className="hidden sm:inline">Mercredi</span><span className="sm:hidden">Mer</span></div>
            <div><span className="hidden sm:inline">Jeudi</span><span className="sm:hidden">Jeu</span></div>
            <div><span className="hidden sm:inline">Vendredi</span><span className="sm:hidden">Ven</span></div>
            <div className="text-sky-300"><span className="hidden sm:inline">Samedi</span><span className="sm:hidden">Sam</span></div>
            <div className="text-sky-300"><span className="hidden sm:inline">Dimanche</span><span className="sm:hidden">Dim</span></div>
          </div>

          {/* Days Grid */}
          <div 
            className="grid grid-cols-7 divide-x divide-y divide-slate-200 bg-slate-50/50 select-none"
            onMouseLeave={() => setIsMouseDownGrid(false)}
            onMouseUp={() => setIsMouseDownGrid(false)}
          >
            {gridCells.map((cell, idx) => {
              const dayShifts = shiftsByDate[cell.dateStr] || [];
              const isMultiSelected = selectedMultiDates.includes(cell.dateStr);

              return (
                <div
                  key={cell.dateStr + '-' + idx}
                  onMouseDown={() => handleDayCellMouseDown(cell.dateStr, cell.isCurrentMonth)}
                  onMouseEnter={() => handleDayCellMouseEnter(cell.dateStr, cell.isCurrentMonth)}
                  onClick={() => {
                    if (cell.isCurrentMonth && selectedMultiDates.length === 0) {
                      setSelectedDayDateStr(cell.dateStr);
                    }
                  }}
                  className={`min-h-[85px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col justify-start transition-all cursor-pointer group relative ${
                    isMultiSelected
                      ? 'bg-sky-200/90 ring-2 ring-[#006591] z-10 shadow-md'
                      : !cell.isCurrentMonth
                      ? 'bg-slate-100/60 opacity-40 cursor-not-allowed'
                      : cell.isWeekend
                      ? 'bg-sky-50/20 hover:bg-sky-100/50'
                      : 'bg-white hover:bg-sky-50/50'
                  }`}
                >
                  {/* Day Header Row */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                      cell.dateStr === '2026-08-03' 
                        ? 'bg-[#006591] text-white shadow-xs' 
                        : cell.isCurrentMonth ? 'text-slate-700 group-hover:text-[#006591]' : 'text-slate-400'
                    }`}>
                      {cell.dayNumber}
                    </span>

                    {cell.isCurrentMonth && (
                      <div className="flex items-center gap-1">
                        {dayShifts.length > 0 ? (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                            {dayShifts.length}
                          </span>
                        ) : (
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-[#006591] bg-sky-100 px-1 rounded transition-opacity">
                            +
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Nurse Shifts Cards on this Day */}
                  <div className="space-y-1 sm:space-y-1.5 flex-1">
                    {dayShifts.map(({ shift, calendar, nurseName, nurseAvatar, tourneeTag }) => {
                      let statusBg = 'bg-sky-50 border-sky-200 text-sky-900';
                      let statusBadgeText = 'En attente';
                      let statusIcon = <Clock className="w-3 h-3 text-sky-600" />;

                      if (shift.status === 'ACCEPTED') {
                        statusBg = 'bg-emerald-50 border-emerald-300 text-emerald-950';
                        statusBadgeText = 'Validé';
                        statusIcon = <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
                      } else if (shift.status === 'REJECTED') {
                        statusBg = 'bg-rose-50 border-rose-300 text-rose-950';
                        statusBadgeText = 'Refusé';
                        statusIcon = <XCircle className="w-3 h-3 text-rose-600" />;
                      } else if (shift.status === 'PROPOSED_ALTERNATIVE') {
                        statusBg = 'bg-amber-50 border-amber-300 text-amber-950';
                        statusBadgeText = `Alt`;
                        statusIcon = <RotateCcw className="w-3 h-3 text-amber-600" />;
                      }

                      return (
                        <div
                          key={shift.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveShiftDetail({ shift, calendar, nurseName, nurseAvatar });
                          }}
                          className={`p-1 sm:p-1.5 rounded-xl border shadow-2xs hover:shadow-md transition-all cursor-pointer text-xs ${statusBg}`}
                          title={`Garde de ${nurseName} pour ${calendar.tourneeName}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1 rounded bg-black/10 text-slate-800 truncate max-w-[60px]">
                              {tourneeTag}
                            </span>
                            <div className="hidden sm:flex items-center gap-1 font-extrabold text-[10px]">
                              {statusIcon}
                              <span className="truncate">{statusBadgeText}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 mt-0.5">
                            <img
                              src={nurseAvatar}
                              alt={nurseName}
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-white shrink-0"
                            />
                            <span className="font-bold text-[10px] sm:text-xs truncate leading-tight">
                              {nurseName}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Floating Multi-Day Assignment Bar */}
      {selectedMultiDates.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-[#131b2e] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-sky-400 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-3xl w-[94vw]">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-black text-xs flex items-center justify-center shadow-inner">
              {selectedMultiDates.length}
            </div>
            <div>
              <h4 className="font-bold text-xs leading-tight">Jours sélectionnés</h4>
              <p className="text-[10px] text-sky-200 leading-tight">Affectation rapide</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <select
              value={multiSelectNurseId}
              onChange={e => setMultiSelectNurseId(e.target.value)}
              className="bg-slate-800 text-white text-xs font-bold p-2 rounded-xl border border-slate-700 outline-none flex-1 sm:flex-none min-w-[100px]"
            >
              <option value="nurse-julie">Julie R.</option>
              <option value="nurse-marc">Marc V.</option>
              <option value="nurse-sophie">Sophie L.</option>
            </select>

            <select
              value={multiSelectTourneeName}
              onChange={e => setMultiSelectTourneeName(e.target.value)}
              className="bg-slate-800 text-white text-xs font-bold p-2 rounded-xl border border-slate-700 outline-none flex-1 sm:flex-none min-w-[120px]"
            >
              <option value="Tournée Matin">Tournée Matin</option>
              <option value="Tournée Soir">Tournée Soir</option>
              <option value="Tournée Garde Cabinet">Tournée Garde Cabinet</option>
            </select>

            <button
              onClick={handleApplyMultiSelection}
              className="shrink-0 px-3.5 py-2 bg-[#006591] hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer whitespace-nowrap transition-all active:scale-95"
            >
              Affecter l'infirmier
            </button>

            <button
              onClick={() => setSelectedMultiDates([])}
              className="p-2 text-slate-400 hover:text-white rounded-xl cursor-pointer shrink-0"
              title="Annuler la sélection"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: LA LISTE DES INFIRMIERS COMME C'EST */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-[#006591]" />
          <span>Équipe d'Infirmiers & Gardes ({nurseWorkloadList.length})</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nurseWorkloadList.map(nurse => {
            const isSelected = nurse.calendarId === selectedCalendarId;
            return (
              <div
                key={nurse.nurseId}
                onClick={() => {
                  setSelectedCalendarId(nurse.calendarId);
                  scrollToChat();
                }}
                className={`bg-white p-4 rounded-2xl border shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#006591] ring-2 ring-[#006591]/20 shadow-md'
                    : 'border-slate-200 hover:border-[#006591]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={nurse.nurseAvatar}
                    alt={nurse.nurseName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-sky-500/30"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{nurse.nurseName}</h4>
                    <span className="text-[11px] font-semibold text-[#006591]">{nurse.tourneeName.split('-')[0]}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Gardes prévues :</span>
                    <span className="font-bold text-slate-900">{nurse.totalShifts} jours</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    {nurse.acceptedShifts > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md">
                        {nurse.acceptedShifts} valides
                      </span>
                    )}
                    {nurse.alternativeShifts > 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md">
                        {nurse.alternativeShifts} alt.
                      </span>
                    )}
                    {nurse.rejectedShifts > 0 && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-md">
                        {nurse.rejectedShifts} ref.
                      </span>
                    )}
                    {nurse.pendingShifts > 0 && (
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold rounded-md">
                        {nurse.pendingShifts} att.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: CHAT & ARBITRAGE DE CONFLITS (MULTI-GÉRANTS) */}
      <section ref={chatSectionRef} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 text-[#006591] rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Chat & Négociations du Cabinet
              </h3>
              <p className="text-xs text-slate-500">
                Co-gérance multi-gérants et résolution des conflits d'affectation.
              </p>
            </div>
          </div>

          {/* Chat Mode Tabs */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              onClick={() => setChatTab('CONFLICTS')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                chatTab === 'CONFLICTS' ? 'bg-[#006591] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>Arbitrage Conflits ({conflictsList.filter(c => c.status === 'OPEN').length})</span>
            </button>
            <button
              onClick={() => setChatTab('GENERAL')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                chatTab === 'GENERAL' ? 'bg-[#006591] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Canal Général</span>
            </button>
            <button
              onClick={() => setChatTab('DIRECT')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                chatTab === 'DIRECT' ? 'bg-[#006591] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discussion Directe {activeCalendar ? `(${activeCalendar.nurseName})` : ''}</span>
            </button>
          </div>
        </div>

        {/* Multi-Manager Sender Persona Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-sky-50/70 p-2.5 rounded-xl border border-sky-100 text-xs">
          <div className="flex items-center gap-2 font-semibold text-sky-900">
            <Scale className="w-4 h-4 text-[#006591]" />
            <span>Identité de l'expéditeur (Gérance) :</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['Dr Morel (Gérant)', 'Julie R. (Co-Gérante)', 'Marc V. (Associé)'].map(persona => (
              <button
                key={persona}
                onClick={() => setActiveSenderPersona(persona)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  activeSenderPersona === persona
                    ? 'bg-[#006591] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-sky-100 border border-slate-200'
                }`}
              >
                {persona}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: CONFLICTS ARBITRATION */}
        {chatTab === 'CONFLICTS' && (
          <div className="space-y-4">
            {/* Conflict selector tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              {conflictsList.map(conf => (
                <button
                  key={conf.id}
                  onClick={() => setActiveConflictId(conf.id)}
                  className={`px-3 py-2 rounded-xl border flex items-center gap-2 font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeConflictId === conf.id
                      ? 'border-[#006591] bg-sky-50/80 text-[#006591]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${conf.status === 'OPEN' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span>{conf.date} : {conf.nurseAName} vs {conf.nurseBName}</span>
                  {conf.status === 'RESOLVED' && <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">Résolu</span>}
                </button>
              ))}
            </div>

            {/* Active Conflict Detail Box */}
            {(() => {
              const activeConf = conflictsList.find(c => c.id === activeConflictId) || conflictsList[0];
              if (!activeConf) return null;

              return (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${activeConf.status === 'OPEN' ? 'bg-amber-50/70 border-amber-200' : 'bg-emerald-50/70 border-emerald-200'} space-y-3`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 shrink-0 ${activeConf.status === 'OPEN' ? 'text-amber-600' : 'text-emerald-600'}`} />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            Conflit d'affectation : {activeConf.tourneeName} — {activeConf.date}
                          </h4>
                          <p className="text-xs text-slate-600">{activeConf.reason}</p>
                        </div>
                      </div>
                      <span className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-xs font-bold ${activeConf.status === 'OPEN' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                        {activeConf.status === 'OPEN' ? '⚡ Conflit Ouvert' : `✅ Attribué à ${activeConf.resolvedWinner}`}
                      </span>
                    </div>

                    {/* Arbitration Buttons for Managers */}
                    {activeConf.status === 'OPEN' ? (
                      <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-amber-950">Arbitrer en tant que {activeSenderPersona} :</span>
                        <button
                          onClick={() => handleArbitrateConflict(activeConf.id, activeConf.nurseAName, activeConf.nurseAId)}
                          className="px-3 py-1.5 bg-[#006591] hover:bg-[#004d70] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          Accorder la garde à {activeConf.nurseAName}
                        </button>
                        <button
                          onClick={() => handleArbitrateConflict(activeConf.id, activeConf.nurseBName, activeConf.nurseBId)}
                          className="px-3 py-1.5 bg-[#006591] hover:bg-[#004d70] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          Accorder la garde à {activeConf.nurseBName}
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-800 font-semibold pt-1 border-t border-emerald-200/80">
                        Arbitrage effectué par la gérance. Le calendrier a été synchronisé avec les créneaux validés.
                      </p>
                    )}
                  </div>

                  {/* Conflict Messages Timeline */}
                  <div className="space-y-2.5 max-h-72 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
                    {activeConf.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          msg.content.includes('ARBITRAGE')
                            ? 'bg-amber-100/90 text-amber-950 border border-amber-300 font-medium'
                            : msg.senderName.includes(activeSenderPersona)
                            ? 'bg-sky-50 text-sky-950 border border-sky-200 ml-8'
                            : 'bg-white text-slate-800 border border-slate-200 mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[11px] text-slate-700">
                          <span>{msg.senderName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 2: CANAL GÉNÉRAL */}
        {chatTab === 'GENERAL' && (
          <div className="space-y-4">
            <div className="space-y-2.5 max-h-72 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
              {generalMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl text-xs space-y-1 ${
                    msg.content.includes('ARBITRAGE')
                      ? 'bg-amber-100/90 text-amber-950 border border-amber-300 font-medium'
                      : msg.senderName.includes(activeSenderPersona)
                      ? 'bg-sky-50 text-sky-950 border border-sky-200 ml-8'
                      : 'bg-white text-slate-800 border border-slate-200 mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[11px] text-slate-700">
                    <span>{msg.senderName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DISCUSSION DIRECTE */}
        {chatTab === 'DIRECT' && (
          <div>
            {activeCalendar ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
                {activeCalendar.messages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Aucun message direct pour l'instant.</p>
                ) : (
                  activeCalendar.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        msg.senderName.includes(activeSenderPersona)
                          ? 'bg-sky-50 text-sky-950 border border-sky-200 ml-8'
                          : 'bg-white text-slate-800 border border-slate-200 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[11px] text-slate-700">
                        <span>{msg.senderName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                Sélectionnez un infirmier dans la liste ci-dessus pour ouvrir le chat.
              </p>
            )}
          </div>
        )}

        {/* Input Form across all tabs */}
        <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder={`Écrire en tant que ${activeSenderPersona}...`}
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006591]"
          />
          <button
            type="submit"
            className="bg-[#006591] hover:bg-[#004d70] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Envoyer</span>
          </button>
        </form>
      </section>

      {/* Modal: Shift Detail Quick Actions */}
      {activeShiftDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-50 text-[#006591] rounded-lg">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Garde du {activeShiftDetail.shift.date}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#006591]">
                    {activeShiftDetail.calendar.tourneeName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveShiftDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Nurse Info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={activeShiftDetail.nurseAvatar}
                alt={activeShiftDetail.nurseName}
                className="w-10 h-10 rounded-full object-cover border border-slate-300"
              />
              <div>
                <div className="font-bold text-slate-900 text-xs">{activeShiftDetail.nurseName}</div>
                <div className="text-[11px] text-slate-500">Infirmier(e) IDEL de Garde</div>
              </div>
              <div className="ml-auto">
                {getShiftBadge(activeShiftDetail.shift.status, activeShiftDetail.shift.proposedDate)}
              </div>
            </div>

            {/* Comment or note if any */}
            {activeShiftDetail.shift.nurseComment && (
              <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs">
                <span className="font-bold">Note de l'infirmier(e) : </span>
                {activeShiftDetail.shift.nurseComment}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-2">
              {currentUser.role === 'NURSE' ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleNurseToggleShift(activeShiftDetail.shift.id, 'ACCEPTED');
                      if (onSuccessToast) onSuccessToast(`Garde du ${activeShiftDetail.shift.date} validée personnellement !`);
                      setActiveShiftDetail(null);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Valider Ma Garde</span>
                  </button>
                  <button
                    onClick={() => {
                      handleNurseToggleShift(activeShiftDetail.shift.id, 'REJECTED');
                      if (onSuccessToast) onSuccessToast(`Garde du ${activeShiftDetail.shift.date} refusée.`);
                      setActiveShiftDetail(null);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Refuser Garde</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">🔒 Statut de Validation :</p>
                  <p className="text-[11px] leading-snug">
                    En tant que gérant/partenaire, vous ne pouvez pas autovalider cette garde. Seul(e) l'infirmier(e) concerné(e) (<strong>{activeShiftDetail.nurseName}</strong>) peut valider sa garde depuis son espace.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedCalendarId(activeShiftDetail.calendar.id);
                  setViewMode('LIST');
                  setActiveShiftDetail(null);
                  scrollToChat();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-all cursor-pointer border border-slate-200"
              >
                <MessageSquare className="w-4 h-4 text-[#006591]" />
                <span>Ouvrir la négociation & discussions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Calendar */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Nouveau Planning de Tournée</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCalendarSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tournée :</label>
                <select
                  value={newTourneeName}
                  onChange={(e) => setNewTourneeName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800"
                >
                  {availableTournees.map(col => (
                    <option key={col.id} value={`${col.title} - ${col.subtitle}`}>
                      {col.title} ({col.subtitle})
                    </option>
                  ))}
                  {availableTournees.length === 0 && (
                    <>
                      <option value="Tournée 1 - Centre-Ville & Port">Tournée 1 - Centre-Ville & Port</option>
                      <option value="Tournée 2 - Secteur Est & Clinique">Tournée 2 - Secteur Est & Clinique</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Infirmier(e) Assigné(e) :</label>
                <select
                  value={newNurseId}
                  onChange={(e) => setNewNurseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800"
                >
                  {DEMO_USERS.filter(u => u.role === 'NURSE').map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.title})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre du Planning :</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date Début :</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date Fin :</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dates des Gardes (séparées par des virgules YYYY-MM-DD) :</label>
                <input
                  type="text"
                  value={newShiftDatesText}
                  onChange={(e) => setNewShiftDatesText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message d'accompagnement :</label>
                <textarea
                  rows={2}
                  value={newInitialMsg}
                  onChange={(e) => setNewInitialMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006591] hover:bg-[#004d70] text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Transmettre l'offre de planning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Plan Nurse & Tournée for Specific Day */}
      {selectedDayDateStr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-100 text-[#006591] rounded-xl font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 capitalize">
                    {new Date(selectedDayDateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Planification et affectation d'un infirmier pour ce jour
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDayDateStr(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Existing Gardes on this Day */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#006591]" />
                <span>Gardes Déjà Affectées Ce Jour ({shiftsByDate[selectedDayDateStr]?.length || 0})</span>
              </h4>

              {(!shiftsByDate[selectedDayDateStr] || shiftsByDate[selectedDayDateStr].length === 0) ? (
                <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  Aucune garde attribuée pour cette date.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {shiftsByDate[selectedDayDateStr].map(({ shift, calendar, nurseName, nurseAvatar, tourneeTag }) => (
                    <div
                      key={'modal-shift-' + shift.id}
                      className="p-2.5 bg-sky-50/60 border border-sky-100 rounded-xl flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={nurseAvatar}
                          alt={nurseName}
                          className="w-7 h-7 rounded-full object-cover border border-white shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{nurseName}</p>
                          <p className="text-[10px] text-slate-500 font-medium truncate">
                            {tourneeTag} • {calendar.tourneeName.split('-')[0]}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          shift.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {shift.status === 'ACCEPTED' ? 'Validé' : 'En attente'}
                        </span>
                        <button
                          onClick={() => handleRemoveShiftFromDay(calendar.id, shift.id)}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer cette garde"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form to Assign New Shift */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddShiftToDate(
                  selectedDayDateStr,
                  planNurseId,
                  planTourneeName,
                  planStatus,
                  planComment
                );
                const nurseName = DEMO_USERS.find(u => u.id === planNurseId)?.name || 'Infirmier(e)';
                if (onSuccessToast) onSuccessToast(`Garde enregistrée pour ${nurseName} le ${selectedDayDateStr}`);
                setSelectedDayDateStr(null);
                setPlanComment('');
              }}
              className="space-y-3.5 text-xs border-t border-slate-100 pt-3"
            >
              <h4 className="font-bold text-slate-900 text-xs">AFFECTER UNE NOUVELLE GARDE :</h4>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. Sélectionner l'Infirmier(e) IDEL :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEMO_USERS.filter(u => u.role === 'NURSE').map(n => (
                    <div
                      key={n.id}
                      onClick={() => setPlanNurseId(n.id)}
                      className={`p-2 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        planNurseId === n.id
                          ? 'bg-sky-50 border-[#006591] ring-1 ring-[#006591]'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={n.avatar} alt={n.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{n.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{n.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  2. Tournée Affectée :
                </label>
                <select
                  value={planTourneeName}
                  onChange={(e) => setPlanTourneeName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                >
                  {availableTournees.map(col => (
                    <option key={col.id} value={col.title}>
                      {col.title} ({col.subtitle})
                    </option>
                  ))}
                  {availableTournees.length === 0 && (
                    <>
                      <option value="Tournée 1">Tournée 1 - Centre-Ville & Port</option>
                      <option value="Tournée 2">Tournée 2 - Secteur Est & Clinique</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. Statut de Transmission :
                </label>
                {currentUser.role === 'PARTNER' ? (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#006591] text-xs">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>En attente de validation IDEL (PENDING)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      🔒 <strong>Règle de conformité :</strong> Un gérant/partenaire ne peut pas autovalider un planning pour un infirmier. La proposition est transmise à l'infirmier(e) sélectionné(e) qui doit la valider personnellement depuis son espace.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPlanStatus('ACCEPTED')}
                      className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        planStatus === 'ACCEPTED'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valider ma garde</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlanStatus('PENDING')}
                      className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        planStatus === 'PENDING'
                          ? 'bg-[#006591] text-white border-[#006591] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Proposer en attente</span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  4. Note ou Consigne d'organisation (Optionnel) :
                </label>
                <input
                  type="text"
                  placeholder="Ex: Attention clé sous le paillasson chez M. Martin..."
                  value={planComment}
                  onChange={(e) => setPlanComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDayDateStr(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006591] hover:bg-[#004d70] text-white rounded-xl font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enregistrer la Garde</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
