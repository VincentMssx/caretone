import React, { useState, useEffect, useRef } from 'react';
import { 
  DailyGlobalTransmission, 
  TransmissionStatus, 
  AlertSeverity, 
  PatientAlert 
} from '../types/transmission';
import { Patient } from '../types';
import { INITIAL_PATIENTS } from '../data/mockData';
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
  Edit3
} from 'lucide-react';

interface TransmissionPageProps {
  onInspectPatient?: (patient: Patient) => void;
  onStartLiveRecording?: () => void;
}

export const TransmissionPage: React.FC<TransmissionPageProps> = ({
  onInspectPatient,
  onStartLiveRecording
}) => {
  // Current selected date string YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>('2026-07-27');
  const [transmissionsMap, setTransmissionsMap] = useState<Record<string, DailyGlobalTransmission>>(() => {
    return getStoredDailyTransmissions();
  });

  // Current active transmission record
  const currentTx: DailyGlobalTransmission = transmissionsMap[selectedDate] || createEmptyDailyTransmission(selectedDate);

  // Editable state for current transmission
  const [summaryNote, setSummaryNote] = useState<string>(currentTx.summaryNote);
  const [alerts, setAlerts] = useState<PatientAlert[]>(currentTx.alerts || []);
  const [status, setStatus] = useState<TransmissionStatus>(currentTx.status);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | undefined>(currentTx.voiceNoteUrl);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number | undefined>(currentTx.voiceNoteDuration);

  // Modal & Toast states
  const [isAddAlertModalOpen, setIsAddAlertModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  // Sync state when selectedDate changes
  useEffect(() => {
    const tx = transmissionsMap[selectedDate] || createEmptyDailyTransmission(selectedDate);
    setSummaryNote(tx.summaryNote || '');
    setAlerts(tx.alerts || []);
    setStatus(tx.status || TransmissionStatus.DRAFT);
    setVoiceNoteUrl(tx.voiceNoteUrl);
    setVoiceNoteDuration(tx.voiceNoteDuration);
    setIsPlayingAudio(false);
    setAudioPlaybackProgress(0);
  }, [selectedDate, transmissionsMap]);

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
    updatedAudioDuration?: number
  ) => {
    const updatedTx: DailyGlobalTransmission = {
      ...currentTx,
      date: selectedDate,
      summaryNote: updatedNote,
      alerts: updatedAlerts,
      status: updatedStatus,
      voiceNoteUrl: updatedAudioUrl,
      voiceNoteDuration: updatedAudioDuration,
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
    setSummaryNote(val);
    handlePersistChanges(val, alerts, status, voiceNoteUrl, voiceNoteDuration);
  };

  // Insert Template Helpers
  const handleInsertTemplate = (templateText: string) => {
    const newText = summaryNote ? `${summaryNote}\n\n${templateText}` : templateText;
    setSummaryNote(newText);
    handlePersistChanges(newText, alerts, status, voiceNoteUrl, voiceNoteDuration);
    showToast("Gabarit inséré dans la synthèse !");
  };

  // Alert Management
  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
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

  // Audio Recording Handlers
  const handleStartRecording = () => {
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
    const duration = Math.max(12, recordingSeconds);
    const fakeUrl = `recorded-voice-${Date.now()}.mp3`;

    setVoiceNoteUrl(fakeUrl);
    setVoiceNoteDuration(duration);
    handlePersistChanges(summaryNote, alerts, status, fakeUrl, duration);
    showToast("Relève vocale enregistrée et rattachée à la synthèse !");
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
    const nextStatus = status === TransmissionStatus.DRAFT ? TransmissionStatus.SUBMITTED : TransmissionStatus.DRAFT;
    setStatus(nextStatus);
    handlePersistChanges(summaryNote, alerts, nextStatus, voiceNoteUrl, voiceNoteDuration);

    if (nextStatus === TransmissionStatus.SUBMITTED) {
      showToast(" Relève officielle transmise et validée avec succès !");
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
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
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
              Note de relève centralisée, enregistrement vocal brut et alertes prioritaires de la journée.
            </p>
          </div>

          {/* Status Badge Indicator */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
            {status === TransmissionStatus.SUBMITTED ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Relève Transmise & Signée
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Clock className="w-4 h-4 text-amber-300 animate-pulse" /> Brouillon en cours
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 1. CALENDAR DATE NAVIGATION BAR */}
      <section className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
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

        {/* Quick Date Chips & Native Date Input */}
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
      </section>

      {/* 2. RELÈVE VOCALE ("BRUT VOCAL") FIRST */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-base">
                  Relève Vocale ("Brut Vocal")
                </h2>
                {voiceNoteUrl && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-black text-xs">
                    Audio Attaché
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Dictée vocale rapide pour expliciter les détails oraux de la relève
              </p>
            </div>
          </div>
        </div>

        {/* Audio Recording / Playback Interface */}
        {!voiceNoteUrl && !isRecording && (
          <div className="bg-gradient-to-br from-purple-50/80 to-sky-50/80 rounded-2xl p-6 border border-purple-200/60 text-center space-y-4">
            <div className="p-4 bg-white text-purple-700 rounded-full w-16 h-16 mx-auto shadow-md flex items-center justify-center border border-purple-100">
              <Mic className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-extrabold text-slate-800 text-sm">
                Enregistrer une relève vocale
              </h3>
              <p className="text-xs text-slate-500">
                Dictez les consignes orales de fin de tournée pour l'infirmier(e) qui prend la suite.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleStartRecording}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Démarrer la dictée vocale</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Recording active state */}
        {isRecording && (
          <div className="bg-rose-50 border-2 border-rose-400/80 rounded-2xl p-6 text-center space-y-4 animate-pulse">
            <div className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping" />
              <span className="font-black text-rose-700 text-sm tracking-wider uppercase">
                Enregistrement en cours...
              </span>
            </div>

            <div className="text-3xl font-black text-rose-900 font-mono">
              {formatSeconds(recordingSeconds)}
            </div>

            {/* Equalizer animation */}
            <div className="flex items-center justify-center gap-1.5 h-8">
              <span className="w-1.5 bg-rose-500 rounded-full animate-[bounce_1s_infinite_100ms] h-6" />
              <span className="w-1.5 bg-rose-600 rounded-full animate-[bounce_1s_infinite_300ms] h-8" />
              <span className="w-1.5 bg-rose-500 rounded-full animate-[bounce_1s_infinite_200ms] h-4" />
              <span className="w-1.5 bg-rose-600 rounded-full animate-[bounce_1s_infinite_400ms] h-7" />
              <span className="w-1.5 bg-rose-500 rounded-full animate-[bounce_1s_infinite_150ms] h-5" />
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleStopRecording}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Terminer & Sauvegarder</span>
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
                    Relève Vocale Rattachée
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
            <div className="flex items-center justify-between pt-1">
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

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartRecording}
                  className="text-xs font-bold text-slate-300 hover:text-white underline cursor-pointer"
                >
                  Ré-enregistrer
                </button>
                <span className="text-slate-500">•</span>
                <button
                  onClick={handleDeleteAudio}
                  className="text-xs font-bold text-rose-300 hover:text-rose-100 underline cursor-pointer"
                >
                  Effacer
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. SYNTHÈSE (EXTRACTION TEXTUELLE DU VOCAL) SECOND */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-sky-100 text-[#006591] rounded-2xl font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                Synthèse (Extraction textuelle du vocal)
              </h2>
              <p className="text-xs text-slate-500">
                Transcription et synthèse rédigée automatiquement à partir de l'enregistrement vocal de relève
              </p>
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={summaryNote}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="La synthèse apparaîtra ici sous forme d'extraction textuelle de votre relève vocale..."
            rows={8}
            className="w-full bg-slate-50/70 focus:bg-white text-slate-800 text-xs sm:text-sm leading-relaxed p-4 rounded-2xl border border-slate-200 focus:border-[#006591] focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-y font-medium"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 px-1 font-medium">
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Enregistré automatiquement
            </span>
            <span>
              {summaryNote.length} caractères • {summaryNote.trim() ? summaryNote.trim().split(/\s+/).length : 0} mots
            </span>
          </div>
        </div>
      </section>

      {/* 5. CLEAN HANDOFF SIGN-OFF WORKFLOW (BOTTOM BAR) */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#006591] rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-300 flex items-center gap-1">
              <UserCheck className="w-4 h-4 text-sky-400" />
              Rédigé par {currentTx.authorName}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-300">
              Dernière MAJ : {new Date(currentTx.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="text-xs text-slate-300">
            {alerts.length} alerte(s) signalée(s) • {voiceNoteUrl ? 'Audio rattaché' : 'Pas d\'audio'}
          </div>
        </div>

        <button
          onClick={handleToggleStatus}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all active:scale-95 cursor-pointer border ${
            status === TransmissionStatus.SUBMITTED
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400/30'
              : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-amber-300/30'
          }`}
        >
          {status === TransmissionStatus.SUBMITTED ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>Relève Officielle Transmise ✓ (Déverrouiller)</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 text-amber-200" />
              <span>Signer & Valider la Relève Officielle</span>
            </>
          )}
        </button>
      </section>

      {/* ADD ALERT MODAL */}
      {isAddAlertModalOpen && (
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

                {/* Quick Presets */}
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
    </div>
  );
};
