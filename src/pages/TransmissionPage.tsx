import React, { useState, useEffect, useRef } from 'react';
import { 
  DailyGlobalTransmission, 
  TransmissionStatus, 
  AlertSeverity, 
  PatientAlert,
  VoiceExtractionResult,
  PatientUpdate
} from '../types/transmission';
import { VoiceReviewDiffModal } from '../components/VoiceReviewDiffModal';
import { Patient } from '../types';
import { INITIAL_PATIENTS } from '../data/mockData';
import { getStoredTourneeColumns, TourneeColumn } from '../data/mockPatients';
import { 
  getStoredDailyTransmissions, 
  saveDailyTransmission, 
  createEmptyDailyTransmission 
} from '../data/mockDailyTransmissions';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  ShieldAlert, 
  AlertCircle, 
  Plus, 
  Trash2, 
  User, 
  Search, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sparkles, 
  Send, 
  Lock, 
  Unlock, 
  Volume2, 
  FileCheck,
  Zap,
  Info,
  X,
  UserCheck,
  Edit3,
  Check
} from 'lucide-react';

export interface UserAccount {
  id: string;
  name: string;
  role: string;
  assignedTournees: string[];
}

const SIMULATED_ACCOUNTS: UserAccount[] = [
  {
    id: 'julie',
    name: 'Julie R. (Titulaire)',
    role: "Infirmière Diplômée d'État Titulaire",
    assignedTournees: ['Tournée Matin', 'Tournée Soir', 'Tournée Garde Cabinet', 'Tournée 1 - Matin Centre', 'Tournée 2 - Soir Sud']
  },
  {
    id: 'sarah',
    name: 'Sarah L. (Titulaire)',
    role: "Infirmière Diplômée d'État Titulaire",
    assignedTournees: ['Tournée Matin', 'Tournée Soir', 'Tournée 1 - Matin Centre', 'Tournée 2 - Soir Sud']
  },
  {
    id: 'marc',
    name: 'Marc D. (Remplaçant non inscrit)',
    role: 'Infirmier Remplaçant (Non affecté)',
    assignedTournees: []
  }
];

interface TransmissionPageProps {
  onInspectPatient?: (patient: Patient) => void;
  onStartLiveRecording?: () => void;
}

export const TransmissionPage: React.FC<TransmissionPageProps> = ({
  onInspectPatient,
  onStartLiveRecording
}) => {
  // Current selected date string YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-27');
  const [tourneeColumns, setTourneeColumns] = useState<TourneeColumn[]>([]);
  const [selectedTournee, setSelectedTournee] = useState<string>('Tournée Matin');

  // Account simulation state
  const [selectedAccountId, setSelectedAccountId] = useState<string>('julie');
  const currentAccount = SIMULATED_ACCOUNTS.find(a => a.id === selectedAccountId) || SIMULATED_ACCOUNTS[0];

  // Registered check
  const isRegisteredOnTournee = currentAccount.id !== 'marc' || currentAccount.assignedTournees.includes(selectedTournee);

  useEffect(() => {
    const cols = getStoredTourneeColumns().filter(c => c.id !== 'UNASSIGNED');
    setTourneeColumns(cols);
    if (cols.length > 0 && !cols.some(c => c.title === selectedTournee)) {
      setSelectedTournee(cols[0].title);
    }
  }, []);

  const [transmissionsMap, setTransmissionsMap] = useState<Record<string, DailyGlobalTransmission>>(() => {
    return getStoredDailyTransmissions();
  });

  // Key generator helper for per-tournee transmission storage
  const getTxKey = (dateStr: string, tourneeStr: string) => `${dateStr}_${tourneeStr}`;

  const currentKey = getTxKey(selectedDate, selectedTournee);

  // Current active transmission record
  const currentTx: DailyGlobalTransmission = transmissionsMap[currentKey] || transmissionsMap[selectedDate] || createEmptyDailyTransmission(selectedDate);

  // Editable state for current transmission
  const [summaryNote, setSummaryNote] = useState<string>(currentTx.summaryNote);
  const [alerts, setAlerts] = useState<PatientAlert[]>(currentTx.alerts || []);
  const [status, setStatus] = useState<TransmissionStatus>(currentTx.status);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | undefined>(currentTx.voiceNoteUrl);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number | undefined>(currentTx.voiceNoteDuration);
  const [validatedDiffs, setValidatedDiffs] = useState<PatientUpdate[]>(currentTx.validatedDiffs || []);
  const [isDiffsValidated, setIsDiffsValidated] = useState<boolean>(currentTx.isDiffsValidated || false);
  const [validatedBy, setValidatedBy] = useState<string | undefined>(currentTx.validatedBy);

  // Modal & Toast states
  const [isAddAlertModalOpen, setIsAddAlertModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Voice Review & Diff Modal states
  const [isVoiceDiffModalOpen, setIsVoiceDiffModalOpen] = useState(false);
  const [voiceExtractionData, setVoiceExtractionData] = useState<VoiceExtractionResult | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const handleProcessVoiceAndOpenDiffModal = async (dictationText?: string) => {
    if (!isRegisteredOnTournee) {
      showToast("Seul un infirmier inscrit sur cette tournée peut réviser les diffs.");
      return;
    }
    setIsProcessingVoice(true);
    try {
      const res = await fetch('/api/transmissions/process-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dictationText: dictationText || summaryNote || "Pour M. Jean Dupont, tension 13/8 ce matin, glycémie 1.85 g/L, pansement sacrum bourgeonnant. Mme Chantal Martin, glycémie 2.40 g/L, douleur cheville EVA 4/10.",
          existingPatients: INITIAL_PATIENTS
        })
      });
      const data = await res.json();
      setVoiceExtractionData(data);
      setIsVoiceDiffModalOpen(true);
    } catch (err) {
      console.error('Failed to process voice:', err);
      setVoiceExtractionData({
        rawTranscript: "Pour M. Jean Dupont, tension 13/8 ce matin, glycémie 1.85 g/L, pansement sacrum bourgeonnant. Mme Chantal Martin, glycémie 2.40 g/L, douleur cheville EVA 4/10.",
        patientUpdates: [
          {
            patientId: "p1",
            patientName: "Jean Dupont",
            changes: [
              { field: "Tension Artérielle", previousValue: "12/8", newValue: "13/8", actionType: "UPDATE" },
              { field: "Glycémie Capillaire", previousValue: "1.40 g/L", newValue: "1.85 g/L", actionType: "UPDATE" }
            ]
          },
          {
            patientId: "p5",
            patientName: "Chantal Martin",
            changes: [
              { field: "Glycémie Capillaire", previousValue: "1.30 g/L", newValue: "2.40 g/L", actionType: "ALERT" },
              { field: "Douleur Cheville", previousValue: "Aucune", newValue: "EVA 4/10 suite chute", actionType: "ALERT" }
            ]
          }
        ]
      });
      setIsVoiceDiffModalOpen(true);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleApplyVoiceUpdates = async (validatedUpdates: PatientUpdate[]) => {
    try {
      await fetch('/api/transmissions/apply-voice-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: validatedUpdates,
          date: selectedDate,
          tourneeName: selectedTournee
        })
      });

      let updatedNote = summaryNote ? `${summaryNote}\n\n` : '';
      updatedNote += `--- RELÈVE VOCALE VALIDÉE (${selectedTournee}) ---\n`;

      validatedUpdates.forEach(pu => {
        updatedNote += `\n• ${pu.patientName} :\n`;
        pu.changes.forEach(c => {
          updatedNote += `  - ${c.field} : ${c.previousValue} ➔ ${c.newValue} [${c.actionType}]${c.isManuallyEdited ? ' (✏️ Corriger manuellement)' : ''}\n`;
        });
      });

      setSummaryNote(updatedNote);
      setValidatedDiffs(validatedUpdates);
      setIsDiffsValidated(true);
      handlePersistChanges(updatedNote, alerts, status, voiceNoteUrl, voiceNoteDuration, validatedUpdates, true);
      setIsVoiceDiffModalOpen(false);
      showToast(`Diffs validés et enregistrés pour ${validatedUpdates.length} patient(s) !`);
    } catch (err) {
      console.error('Failed to apply voice updates:', err);
      setIsVoiceDiffModalOpen(false);
      showToast('Erreur lors de l\'enregistrement des modifications.');
    }
  };

  // New Alert Form state
  const [selectedPatientId, setSelectedPatientId] = useState<string>('p1');
  const [customPatientName, setCustomPatientName] = useState<string>('');
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>(AlertSeverity.HIGH);
  const [alertDescription, setAlertDescription] = useState<string>('');

  // Audio Recording & Playback state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const audioProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state when selectedDate or selectedTournee changes
  useEffect(() => {
    const key = getTxKey(selectedDate, selectedTournee);
    const tx = transmissionsMap[key] || createEmptyDailyTransmission(selectedDate);
    setSummaryNote(tx.summaryNote || '');
    setAlerts(tx.alerts || []);
    setStatus(tx.status || TransmissionStatus.DRAFT);
    setVoiceNoteUrl(tx.voiceNoteUrl);
    setVoiceNoteDuration(tx.voiceNoteDuration);
    setValidatedDiffs(tx.validatedDiffs || []);
    setIsDiffsValidated(tx.isDiffsValidated || false);
    setValidatedBy(tx.validatedBy);
    setIsPlayingAudio(false);
    setAudioPlaybackProgress(0);
  }, [selectedDate, selectedTournee, transmissionsMap]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Save changes to state and localStorage
  const handlePersistChanges = (
    updatedNote: string,
    updatedAlerts: PatientAlert[],
    updatedStatus: TransmissionStatus,
    updatedAudioUrl?: string,
    updatedAudioDuration?: number,
    updatedValidatedDiffs?: PatientUpdate[],
    updatedIsDiffsValidated?: boolean,
    updatedValidatedBy?: string
  ) => {
    const key = getTxKey(selectedDate, selectedTournee);
    const updatedTx: DailyGlobalTransmission = {
      ...currentTx,
      id: key,
      date: selectedDate,
      summaryNote: updatedNote,
      alerts: updatedAlerts,
      status: updatedStatus,
      voiceNoteUrl: updatedAudioUrl,
      voiceNoteDuration: updatedAudioDuration,
      validatedDiffs: updatedValidatedDiffs !== undefined ? updatedValidatedDiffs : validatedDiffs,
      isDiffsValidated: updatedIsDiffsValidated !== undefined ? updatedIsDiffsValidated : isDiffsValidated,
      validatedBy: updatedValidatedBy !== undefined ? updatedValidatedBy : validatedBy,
      updatedAt: new Date().toISOString()
    };

    const newMap = saveDailyTransmission(updatedTx);
    setTransmissionsMap(newMap);
  };

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const dt = new Date(selectedDate);
    dt.setDate(dt.getDate() - 1);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const handleNextDay = () => {
    const dt = new Date(selectedDate);
    dt.setDate(dt.getDate() + 1);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const handleToday = () => {
    setSelectedDate('2026-07-27');
  };

  // Format Date Display in French
  const formatFrenchDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const dt = new Date(year, month, day);

      const formatted = dt.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return dateStr;
    }
  };

  // Note auto-save handler
  const handleNoteChange = (val: string) => {
    if (!isRegisteredOnTournee) return;
    setSummaryNote(val);
    handlePersistChanges(val, alerts, status, voiceNoteUrl, voiceNoteDuration);
  };

  // Alert Management
  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegisteredOnTournee) return;
    if (!alertDescription.trim()) {
      showToast("Veuillez saisir la description de l'incident.");
      return;
    }

    const patientObj = INITIAL_PATIENTS.find(p => p.id === selectedPatientId);
    const targetPatientName = customPatientName.trim() || (patientObj ? patientObj.name : 'Patient Inconnu');

    const newAlert: PatientAlert = {
      id: `alt-${Date.now()}`,
      dailyTransmissionId: currentTx.id,
      patientId: selectedPatientId,
      patientName: targetPatientName,
      severity: alertSeverity,
      description: alertDescription.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedAlerts = [newAlert, ...alerts];
    setAlerts(updatedAlerts);
    handlePersistChanges(summaryNote, updatedAlerts, status, voiceNoteUrl, voiceNoteDuration);

    setIsAddAlertModalOpen(false);
    setAlertDescription('');
    setCustomPatientName('');
    showToast(`Alerte ajoutée pour ${targetPatientName}`);
  };

  const handleDeleteAlert = (alertId: string) => {
    if (!isRegisteredOnTournee) return;
    const updatedAlerts = alerts.filter(a => a.id !== alertId);
    setAlerts(updatedAlerts);
    handlePersistChanges(summaryNote, updatedAlerts, status, voiceNoteUrl, voiceNoteDuration);
    showToast("Alerte retirée.");
  };

  // Inspect Patient Action
  const handleInspectPatientClick = (patientId: string, patientName: string) => {
    const patientObj = INITIAL_PATIENTS.find(p => p.id === patientId || p.name.toLowerCase().includes(patientName.toLowerCase()));
    if (patientObj && onInspectPatient) {
      onInspectPatient(patientObj);
    } else {
      showToast(`Ouverture de la fiche de ${patientName}`);
    }
  };

  // Audio Recording Handlers (Simulated Vocal Dictation with automatic text & diff extraction)
  const handleStartRecording = () => {
    if (!isRegisteredOnTournee) return;
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    const duration = Math.max(24, recordingSeconds || 24);
    const fakeUrl = `recorded-voice-${Date.now()}.mp3`;

    const simulatedText = "Pour M. Jean Dupont, tension 13/8 ce matin, glycémie 1.85 g/L, pansement sacrum bourgeonnant. Mme Chantal Martin, glycémie 2.40 g/L, douleur cheville EVA 4/10 suite à une chute à domicile.";

    const simulatedDiffs: PatientUpdate[] = [
      {
        patientId: 'p1',
        patientName: 'Jean Dupont',
        dar: {
          cible: 'Constantes & Pansement Sacrum',
          donnees: 'Tension artérielle 13/8 ce matin. Glycémie capillaire 1.85 g/L. Pansement sacrum au retrait : plaie propre, aspect bourgeonnant.',
          actions: 'Nettoyage au sérum physiologique, réfection du pansement hydrocolloïde. Administration de l\'insuline selon protocole.',
          resultats: 'Soin bien toléré par le patient. Plaie en bonne voie de cicatrisation, constantes contrôlées.'
        },
        changes: [
          { field: 'Tension Artérielle', previousValue: '12/8', newValue: '13/8', actionType: 'UPDATE' },
          { field: 'Glycémie Capillaire', previousValue: '1.40 g/L', newValue: '1.85 g/L', actionType: 'UPDATE' },
          { field: 'Pansement Sacrum', previousValue: 'Non bourgeonnant', newValue: 'Aspect bourgeonnant propre', actionType: 'UPDATE' }
        ]
      },
      {
        patientId: 'p5',
        patientName: 'Chantal Martin',
        dar: {
          cible: 'Glycémie élevée & Douleur cheville post-chute',
          donnees: 'Glycémie capillaire mesurée à 2.40 g/L. Plainte de douleur au niveau de la cheville droite (EVA 4/10) suite à une chute à domicile ce matin.',
          actions: 'Pose d\'une poche de glace sur la cheville, vérification de la mobilité, administration d\'antalgique (Paracétamol 1g). Médecin traitant prévenu.',
          resultats: 'Douleur atténuée à EVA 2/10 après 30 min. Pas de déformation visible, repos recommandé au lit.'
        },
        changes: [
          { field: 'Glycémie Capillaire', previousValue: '1.30 g/L', newValue: '2.40 g/L', actionType: 'ALERT' },
          { field: 'Douleur Cheville', previousValue: 'Aucune', newValue: 'EVA 4/10 suite chute', actionType: 'ALERT' }
        ]
      }
    ];

    const newNote = summaryNote ? `${summaryNote}\n\n[Dictée vocale] : ${simulatedText}` : simulatedText;

    setSummaryNote(newNote);
    setVoiceNoteUrl(fakeUrl);
    setVoiceNoteDuration(duration);
    setValidatedDiffs(simulatedDiffs);
    setIsDiffsValidated(true);

    handlePersistChanges(newNote, alerts, status, fakeUrl, duration, simulatedDiffs, true, validatedBy);
    showToast("Vocal enregistré : texte transcrit et diffs patients extraits automatiquement !");
  };

  const handleCancelRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleDeleteAudio = () => {
    if (!isRegisteredOnTournee) return;
    setVoiceNoteUrl(undefined);
    setVoiceNoteDuration(undefined);
    setIsPlayingAudio(false);
    handlePersistChanges(summaryNote, alerts, status, undefined, undefined);
    showToast("Relève vocale supprimée.");
  };

  // Audio Playback Handler
  const handleTogglePlayAudio = () => {
    if (!isPlayingAudio) {
      setIsPlayingAudio(true);
      const totalSec = voiceNoteDuration || 60;
      audioProgressIntervalRef.current = setInterval(() => {
        setAudioPlaybackProgress(prev => {
          if (prev >= 100) {
            clearInterval(audioProgressIntervalRef.current!);
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + (100 / totalSec) * playbackSpeed;
        });
      }, 1000);
    } else {
      if (audioProgressIntervalRef.current) {
        clearInterval(audioProgressIntervalRef.current);
      }
      setIsPlayingAudio(false);
    }
  };

  // Sign-off status toggle
  const handleToggleStatus = () => {
    if (!isRegisteredOnTournee) {
      showToast("Seul un soignant inscrit sur cette tournée peut la valider.");
      return;
    }
    const nextStatus = status === TransmissionStatus.DRAFT ? TransmissionStatus.SUBMITTED : TransmissionStatus.DRAFT;
    const nextValidatedBy = nextStatus === TransmissionStatus.SUBMITTED ? currentAccount.name : undefined;
    setStatus(nextStatus);
    setValidatedBy(nextValidatedBy);
    handlePersistChanges(
      summaryNote, 
      alerts, 
      nextStatus, 
      voiceNoteUrl, 
      voiceNoteDuration, 
      validatedDiffs, 
      isDiffsValidated, 
      nextValidatedBy
    );

    if (nextStatus === TransmissionStatus.SUBMITTED) {
      showToast(`Relève transmise et validée par ${currentAccount.name} !`);
    } else {
      showToast("Transmission repassée en mode Brouillon.");
    }
  };

  // Helper formatting for seconds to MM:SS
  const formatSeconds = (sec?: number) => {
    if (!sec) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-sky-400/30 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Header / Title Card */}
      <div className="bg-gradient-to-r from-[#006591] via-[#004c6e] to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-300 bg-sky-950/70 px-3 py-1 rounded-lg border border-sky-500/30">
                Relève IDEL
              </span>
              <span className="text-xs font-bold text-sky-100 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-sky-400" /> Transmission Globale
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Synthèse Globale de Tournée
            </h1>
            <p className="text-xs text-sky-100/80">
              Note de relève centralisée, enregistrement vocal brut et diffs validés par patient.
            </p>
          </div>

          {/* Status Badge Indicator */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
            {status === TransmissionStatus.SUBMITTED ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Relève Transmise & Validée
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Clock className="w-4 h-4 text-amber-300 animate-pulse" /> Brouillon en cours
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ACCOUNT SIMULATION SELECTOR BAR */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-700">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-extrabold text-slate-200">Simuler un Compte Utilisateur :</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SIMULATED_ACCOUNTS.map(acc => {
            const isSelected = selectedAccountId === acc.id;
            const isAssigned = acc.assignedTournees.includes(selectedTournee);
            return (
              <button
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#006591] text-white border-sky-400 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isAssigned ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span>{acc.name}</span>
                <span className="text-[10px] opacity-75">({isAssigned ? 'Inscrit' : 'Non inscrit'})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* NON-REGISTERED USER CONSULTATION BANNER */}
      {!isRegisteredOnTournee && (
        <div className="p-4 bg-amber-500/10 border-2 border-amber-400/60 rounded-2xl text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-800 rounded-xl font-bold">
              <Lock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                <span>Mode Consultation Seule ({currentAccount.name})</span>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  Non inscrit sur cette tournée
                </span>
              </h4>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                Vous n'êtes pas affecté(e) à la <strong>{selectedTournee}</strong>. Vous pouvez consulter les transmissions vocales, la synthèse textuelle et les diffs validés, mais les boutons de modification et validation sont masqués.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VALIDATED TRANSMISSION LABEL BANNER FOR ALL PROFILES */}
      {status === TransmissionStatus.SUBMITTED && (
        <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-emerald-950 text-sm flex items-center gap-2">
                <span>Relève Transmise & Validée par {validatedBy || currentTx.validatedBy || currentTx.authorName || 'Julie R. (Titulaire)'}</span>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  Validation Officielle
                </span>
              </h4>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                Cette transmission a été révisée et validée par <strong>{validatedBy || currentTx.validatedBy || currentTx.authorName || 'Julie R. (Titulaire)'}</strong>. Tous les soignants peuvent consulter cette relève.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. CALENDAR DATE NAVIGATION & TOURNEE SELECTION BAR */}
      <section className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer font-bold active:scale-95"
              title="Jour précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-50 text-[#006591] rounded-xl font-bold">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Date Sélectionnée
                </div>
                <div className="text-sm sm:text-base font-black text-slate-900">
                  {formatFrenchDate(selectedDate)}
                </div>
              </div>
            </div>

            <button
              onClick={handleNextDay}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer font-bold active:scale-95"
              title="Jour suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Date Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToday}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                selectedDate === '2026-07-27'
                  ? 'bg-[#006591] text-white border-[#006591] shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Aujourd'hui
            </button>

            <button
              onClick={() => setSelectedDate('2026-07-26')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                selectedDate === '2026-07-26'
                  ? 'bg-[#006591] text-white border-[#006591] shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Hier
            </button>

            <div className="relative flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-200 outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Tournée Selector Tabs */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1">Tournée active :</span>
          {tourneeColumns.length > 0 ? (
            tourneeColumns.map((col) => {
              const isSelected = selectedTournee === col.title;
              return (
                <button
                  key={col.id}
                  onClick={() => setSelectedTournee(col.title)}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#006591] text-white border-[#006591] shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {col.title}
                </button>
              );
            })
          ) : (
            <>
              <button
                onClick={() => setSelectedTournee('Tournée Matin')}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                  selectedTournee === 'Tournée Matin'
                    ? 'bg-[#006591] text-white border-[#006591] shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Tournée Matin
              </button>
              <button
                onClick={() => setSelectedTournee('Tournée Soir')}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                  selectedTournee === 'Tournée Soir'
                    ? 'bg-[#006591] text-white border-[#006591] shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Tournée Soir
              </button>
              <button
                onClick={() => setSelectedTournee('Tournée Garde Cabinet')}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                  selectedTournee === 'Tournée Garde Cabinet'
                    ? 'bg-[#006591] text-white border-[#006591] shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Tournée Garde Cabinet
              </button>
            </>
          )}
        </div>
      </section>

      {/* STEP 1: TRANSMISSION VOCAL ("BRUT VOCAL") & BOUTON COMPLÉMENT VOCAL */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-base">
                  1. Transmission Vocale ("Brut Vocal")
                </h2>
                {voiceNoteUrl && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-black text-xs">
                    Audio Rattaché
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Dictée vocale et compléments oraux pour la relève de tournée
              </p>
            </div>
          </div>

          {/* Button to add additional vocal */}
          {isRegisteredOnTournee && (
            <button
              onClick={handleStartRecording}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Ajouter un complément vocal</span>
            </button>
          )}
        </div>

        {/* Audio Recording / Playback Interface */}
        {!voiceNoteUrl && !isRecording && (
          <div className="bg-gradient-to-br from-purple-50/80 to-sky-50/80 rounded-2xl p-6 border border-purple-200/60 text-center space-y-4">
            <div className="p-4 bg-white text-purple-700 rounded-full w-16 h-16 mx-auto shadow-md flex items-center justify-center border border-purple-100">
              <Mic className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-extrabold text-slate-800 text-sm">
                Aucune relève vocale enregistrée
              </h3>
              <p className="text-xs text-slate-500">
                Dictez les consignes orales de fin de tournée pour l'infirmier(e) qui prend la suite.
              </p>
            </div>

            {isRegisteredOnTournee && (
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={handleStartRecording}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Démarrer la dictée vocale</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live Recording active state */}
        {isRecording && isRegisteredOnTournee && (
          <div className="bg-rose-50 border-2 border-rose-400/80 rounded-2xl p-6 text-center space-y-4 animate-pulse">
            <div className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping" />
              <span className="font-black text-rose-700 text-sm tracking-wider uppercase">
                Enregistrement vocal en cours...
              </span>
            </div>

            <div className="text-3xl font-black text-rose-900 font-mono">
              {formatSeconds(recordingSeconds)}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleStopRecording}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Terminer & Rattaché</span>
              </button>

              <button
                onClick={handleCancelRecording}
                className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all"
              >
                <span>Annuler</span>
              </button>
            </div>
          </div>
        )}

        {/* Audio Player State */}
        {voiceNoteUrl && !isRecording && (
          <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-[#006591] rounded-2xl p-5 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/30 text-purple-300 rounded-xl border border-purple-400/30">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-purple-200">
                    Transmission Vocale Enregistrée
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Durée totale : {formatSeconds(voiceNoteDuration)}
                  </div>
                </div>
              </div>

              {/* Playback speed selector */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/20">
                {[1.0, 1.25, 1.5, 2.0].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      playbackSpeed === speed
                        ? 'bg-purple-500 text-white shadow-2xs'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Scrubber / Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden cursor-pointer">
                <div
                  className="bg-gradient-to-r from-purple-400 to-sky-400 h-full transition-all duration-300"
                  style={{ width: `${audioPlaybackProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                <span>{formatSeconds(Math.round(((voiceNoteDuration || 60) * audioPlaybackProgress) / 100))}</span>
                <span>{formatSeconds(voiceNoteDuration)}</span>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                onClick={handleTogglePlayAudio}
                className="flex items-center gap-2 bg-white text-slate-900 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md hover:bg-sky-50 cursor-pointer transition-all active:scale-95"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-4 h-4 text-purple-700 fill-current" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-purple-700 fill-current" /> Écouter la relève
                  </>
                )}
              </button>

              {isRegisteredOnTournee && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartRecording}
                    className="text-xs font-bold text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    Compléter l'audio
                  </button>
                  <span className="text-slate-500">•</span>
                  <button
                    onClick={handleDeleteAudio}
                    className="text-xs font-bold text-rose-300 hover:text-rose-100 underline cursor-pointer"
                  >
                    Effacer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* STEP 2: TEXT EXTRACTED FROM VOCAL (SYNTHÈSE ET EXTRACTION TEXTUELLE) */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-sky-100 text-[#006591] rounded-2xl font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                2. Texte Extrait du Vocal (Synthèse globale)
              </h2>
              <p className="text-xs text-slate-500">
                Transcription et synthèse rédigée à partir de la relève vocale
              </p>
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={summaryNote}
            onChange={(e) => handleNoteChange(e.target.value)}
            disabled={!isRegisteredOnTournee}
            placeholder="La synthèse et le texte extrait du vocal apparaîtront ici..."
            rows={8}
            className={`w-full text-slate-800 text-xs sm:text-sm leading-relaxed p-4 rounded-2xl border transition-all resize-y font-medium outline-none ${
              isRegisteredOnTournee 
                ? 'bg-slate-50/70 focus:bg-white border-slate-200 focus:border-[#006591] focus:ring-2 focus:ring-sky-100'
                : 'bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed'
            }`}
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 px-1 font-medium">
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Synchronisé en direct
            </span>
            <span>
              {summaryNote.length} caractères • {summaryNote.trim() ? summaryNote.trim().split(/\s+/).length : 0} mots
            </span>
          </div>
        </div>
      </section>

      {/* STEP 3: TRANSMISSIONS DAR (DONNÉES - ACTIONS - RÉSULTATS) */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#006591]/10 text-[#006591] rounded-2xl font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-base">
                  3. Transmissions DAR - Fiches Patients ({validatedDiffs.length})
                </h2>
                {isDiffsValidated && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Formats DAR rattachés
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Synthèse structurée (Données - Actions - Résultats) générée depuis la dictée vocale pour chaque dossier patient
              </p>
            </div>
          </div>
        </div>

        {validatedDiffs.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-500">
              Aucune transmission DAR n'a encore été générée pour cette tournée.
            </p>
            {isRegisteredOnTournee && (
              <p className="text-xs text-[#006591] font-bold">
                Cliquez sur le bouton "Démarrer la dictée vocale" en haut de la page pour créer automatiquement les transmissions DAR.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {validatedDiffs.map((patientUpdate, idx) => {
              const dar = patientUpdate.dar || {
                cible: patientUpdate.changes.map(c => c.field).join(', ') || 'Suivi clinique',
                donnees: patientUpdate.changes.map(c => `${c.field}: ${c.newValue}`).join('. ') || 'Constats effectués lors du passage.',
                actions: 'Soins infirmiers et vérifications réalisés selon prescriptions.',
                resultats: 'Patient stable, surveillance poursuivie.'
              };

              return (
                <div key={idx} className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 space-y-3 shadow-2xs">
                  {/* Fiche Patient Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#006591] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        {patientUpdate.patientName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                          <span>{patientUpdate.patientName}</span>
                          <span className="text-[10px] bg-sky-100 text-[#006591] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            Fiche Patient
                          </span>
                        </h3>
                        {dar.cible && (
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            Cible : <span className="text-slate-800 font-bold">{dar.cible}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleInspectPatientClick(patientUpdate.patientId, patientUpdate.patientName)}
                      className="text-xs font-extrabold text-[#006591] bg-white hover:bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Consulter Dossier Patient</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* DAR Blocks Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* D - Données */}
                    <div className="bg-white p-3.5 rounded-xl border border-sky-200/70 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-sky-800">
                        <span className="w-5 h-5 rounded-md bg-sky-600 text-white flex items-center justify-center text-[11px] font-black">
                          D
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider">
                          Données (Constats)
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {dar.donnees}
                      </p>
                    </div>

                    {/* A - Actions */}
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200/70 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-800">
                        <span className="w-5 h-5 rounded-md bg-amber-600 text-white flex items-center justify-center text-[11px] font-black">
                          A
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider">
                          Actions (Soins)
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {dar.actions}
                      </p>
                    </div>

                    {/* R - Résultats */}
                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200/70 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black">
                          R
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider">
                          Résultats (Évolution)
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {dar.resultats}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* STEP 4 & BOTTOM ACTION BAR: FINAL TRANSMISSION VALIDATION */}
      {isRegisteredOnTournee && (
        <section className="bg-gradient-to-r from-slate-900 via-[#003852] to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-sky-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Finalisation & Validation de Relève</span>
            </h3>
            <p className="text-xs text-sky-200">
              Valider officiellement la transmission de tournée pour l'ensemble du cabinet.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            {/* BUTTON TO VALIDATE THE TRANSMISSION */}
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer ${
                status === TransmissionStatus.SUBMITTED
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#006591] hover:bg-[#004c6e] text-white border border-sky-400/40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {status === TransmissionStatus.SUBMITTED
                  ? `Transmission Validée (${validatedBy || 'Soignant'})`
                  : 'Valider la transmission'}
              </span>
            </button>
          </div>
        </section>
      )}

      {/* ADD ALERT MODAL */}
      {isAddAlertModalOpen && isRegisteredOnTournee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Signaler un Incident Patient
                </h3>
              </div>

              <button
                onClick={() => setIsAddAlertModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAlert} className="space-y-4">
              {/* Patient Selector */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Patient concerné :
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-[#006591]"
                >
                  {INITIAL_PATIENTS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.careSummary})
                    </option>
                  ))}
                  <option value="custom">Autre patient (saisir le nom ci-dessous)</option>
                </select>
              </div>

              {selectedPatientId === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nom du patient :
                  </label>
                  <input
                    type="text"
                    value={customPatientName}
                    onChange={(e) => setCustomPatientName(e.target.value)}
                    placeholder="ex: M. Petit Robert"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs p-2.5 text-slate-800 outline-none"
                  />
                </div>
              )}

              {/* Severity Selector */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Niveau d'Urgence / Gravité :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertSeverity(AlertSeverity.MEDIUM)}
                    className={`p-2.5 rounded-xl border font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      alertSeverity === AlertSeverity.MEDIUM
                        ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" /> À surveiller
                  </button>

                  <button
                    type="button"
                    onClick={() => setAlertSeverity(AlertSeverity.HIGH)}
                    className={`p-2.5 rounded-xl border font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      alertSeverity === AlertSeverity.HIGH
                        ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Important
                  </button>

                  <button
                    type="button"
                    onClick={() => setAlertSeverity(AlertSeverity.CRITICAL)}
                    className={`p-2.5 rounded-xl border font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      alertSeverity === AlertSeverity.CRITICAL
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" /> Urgent
                  </button>
                </div>
              </div>

              {/* Description & Quick Presets */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-extrabold text-slate-700">
                    Description de l'incident :
                  </label>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {[
                    '⚡ Chute à domicile',
                    '🩸 Glycémie > 2.5 g/L',
                    '🫀 TA > 16/10 mmHg',
                    '🩹 Plaie surinfectée',
                    '💊 Refus de traitement',
                    '📞 Dr Traitant contacté'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAlertDescription(prev => prev ? `${prev} - ${preset}` : preset)}
                      className="text-[10px] bg-slate-100 hover:bg-sky-50 hover:text-[#006591] font-bold text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  value={alertDescription}
                  onChange={(e) => setAlertDescription(e.target.value)}
                  placeholder="Ex: Patient trouvé au sol sans perte de connaissance. Constantes stables. Medecin traitant prévenu..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs p-3 text-slate-800 outline-none focus:ring-2 focus:ring-[#006591]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAlertModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006591] hover:bg-[#004d70] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
                >
                  Ajouter l'Alerte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VOICE REVIEW & PATIENT DIFF VALIDATION MODAL */}
      <VoiceReviewDiffModal
        isOpen={isVoiceDiffModalOpen}
        onClose={() => setIsVoiceDiffModalOpen(false)}
        extractionData={voiceExtractionData}
        audioUrl={voiceNoteUrl}
        audioDuration={voiceNoteDuration || 24}
        onApplyUpdates={handleApplyVoiceUpdates}
        isLoading={isProcessingVoice}
      />
    </div>
  );
};
