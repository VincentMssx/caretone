import React, { useState, useEffect } from 'react';
import { 
  VoiceExtractionResult, 
  PatientUpdate, 
  PatientChange 
} from '../types/transmission';
import { 
  Sparkles, 
  Mic, 
  Volume2, 
  Play, 
  Pause, 
  Pencil, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  FileText, 
  ShieldCheck,
  ArrowRight,
  Info,
  Clock
} from 'lucide-react';

interface VoiceReviewDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractionData: VoiceExtractionResult | null;
  audioUrl?: string;
  audioDuration?: number;
  onApplyUpdates: (validatedUpdates: PatientUpdate[]) => void;
  isLoading?: boolean;
}

export const VoiceReviewDiffModal: React.FC<VoiceReviewDiffModalProps> = ({
  isOpen,
  onClose,
  extractionData,
  audioUrl,
  audioDuration = 24,
  onApplyUpdates,
  isLoading = false
}) => {
  if (!isOpen) return null;

  // Local state for interactive patient updates with selection & editing
  const [localUpdates, setLocalUpdates] = useState<PatientUpdate[]>([]);
  const [rawTranscript, setRawTranscript] = useState<string>('');

  // Editing state for inline pencil editing (Mechanism 1)
  const [editingKey, setEditingKey] = useState<string | null>(null); // e.g. "p0-c1"
  const [editInputValue, setEditInputValue] = useState<string>('');

  // Accordion for Raw Transcript
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState<boolean>(false);

  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Initialize local updates when extractionData changes
  useEffect(() => {
    if (extractionData) {
      setRawTranscript(extractionData.rawTranscript || '');
      const formatted = (extractionData.patientUpdates || []).map((p, pIdx) => ({
        ...p,
        selected: p.selected !== undefined ? p.selected : true,
        changes: (p.changes || []).map((c, cIdx) => ({
          ...c,
          id: c.id || `p${pIdx}-c${cIdx}`,
          selected: c.selected !== undefined ? c.selected : true,
          isManuallyEdited: c.isManuallyEdited || false
        }))
      }));
      setLocalUpdates(formatted);
    }
  }, [extractionData]);

  // Audio Progress Simulator
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlayingAudio) {
      timer = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + (100 / audioDuration) * playbackSpeed;
        });
      }, 1000);
    } else if (timer) {
      clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingAudio, audioDuration, playbackSpeed]);

  // Toggle Patient Selection (selects/unselects all changes in card)
  const handleTogglePatientSelection = (pIdx: number) => {
    setLocalUpdates(prev => prev.map((p, idx) => {
      if (idx === pIdx) {
        const nextSel = !p.selected;
        return {
          ...p,
          selected: nextSel,
          changes: p.changes.map(c => ({ ...c, selected: nextSel }))
        };
      }
      return p;
    }));
  };

  // Toggle Line Change Selection
  const handleToggleChangeSelection = (pIdx: number, cIdx: number) => {
    setLocalUpdates(prev => prev.map((p, pI) => {
      if (pI === pIdx) {
        const updatedChanges = p.changes.map((c, cI) => cI === cIdx ? { ...c, selected: !c.selected } : c);
        const hasAnySelected = updatedChanges.some(c => c.selected);
        return {
          ...p,
          selected: hasAnySelected,
          changes: updatedChanges
        };
      }
      return p;
    }));
  };

  // Start Inline Edit Mode (Mechanism 1)
  const handleStartEditField = (pIdx: number, cIdx: number, currentValue: string) => {
    setEditingKey(`p${pIdx}-c${cIdx}`);
    setEditInputValue(currentValue);
  };

  // Save Inline Edit Field (Mechanism 1)
  const handleSaveEditField = (pIdx: number, cIdx: number) => {
    if (!editInputValue.trim()) return;

    setLocalUpdates(prev => prev.map((p, pI) => {
      if (pI === pIdx) {
        return {
          ...p,
          changes: p.changes.map((c, cI) => {
            if (cI === cIdx) {
              return {
                ...c,
                newValue: editInputValue.trim(),
                isManuallyEdited: true,
                selected: true // Auto select edited line
              };
            }
            return c;
          })
        };
      }
      return p;
    }));

    setEditingKey(null);
  };

  // Cancel Inline Edit
  const handleCancelEditField = () => {
    setEditingKey(null);
    setEditInputValue('');
  };

  // Calculate totals
  const totalSelectedPatients = localUpdates.filter(p => p.selected && p.changes.some(c => c.selected)).length;
  const totalSelectedChanges = localUpdates.reduce((acc, p) => p.selected ? acc + p.changes.filter(c => c.selected).length : acc, 0);

  // Confirm and apply updates
  const handleConfirmAndApply = () => {
    const filteredUpdates: PatientUpdate[] = localUpdates
      .filter(p => p.selected)
      .map(p => ({
        ...p,
        changes: p.changes.filter(c => c.selected)
      }))
      .filter(p => p.changes.length > 0);

    onApplyUpdates(filteredUpdates);
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-sky-900 via-[#006591] to-sky-800 text-white p-5 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-white">Révision de la synthèse vocale</h2>
                  <span className="bg-emerald-400/20 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Saisie IDEL HDS
                  </span>
                </div>
                <p className="text-xs text-sky-100">
                  Vérifiez le diff entre la base de données et les données extraites par l'IA Gemini.
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 text-sky-200 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* AUDIO PLAYER BAR */}
          <div className="bg-white/10 rounded-xl p-3 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-9 h-9 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold flex items-center justify-center shrink-0 shadow-md transition-all cursor-pointer active:scale-95"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              
              <div className="flex items-center gap-2 text-sky-100 font-mono text-[11px]">
                <Volume2 className="w-4 h-4 text-sky-200" />
                <span>{formatSecs((audioProgress / 100) * audioDuration)}</span>
                <span>/</span>
                <span>{formatSecs(audioDuration)}</span>
              </div>
            </div>

            {/* AUDIO PROGRESS BAR */}
            <div className="w-full flex-1 mx-2 bg-white/20 rounded-full h-2 relative cursor-pointer overflow-hidden"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const pct = ((e.clientX - rect.left) / rect.width) * 100;
                   setAudioProgress(Math.min(100, Math.max(0, pct)));
                 }}>
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-150"
                style={{ width: `${audioProgress}%` }}
              />
            </div>

            {/* SPEED CONTROLS */}
            <div className="flex items-center gap-1 shrink-0 bg-black/20 p-1 rounded-lg">
              {[1.0, 1.25, 1.5].map(spd => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    playbackSpeed === spd ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-sky-200 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* EXPANDABLE RAW TRANSCRIPTION SECTION */}
          <div className="border-t border-white/10 pt-2">
            <button
              onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
              className="flex items-center justify-between w-full text-xs text-sky-200 hover:text-white font-medium transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-300" />
                <span>Transcription brute complète (Dictée)</span>
              </div>
              {isTranscriptExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isTranscriptExpanded && (
              <div className="mt-2 p-3 bg-slate-950/60 rounded-xl border border-white/10 font-mono text-[11px] text-sky-100 leading-relaxed max-h-32 overflow-y-auto italic">
                "{rawTranscript || "Aucune transcription textuelle disponible."}"
              </div>
            )}
          </div>
        </div>

        {/* MODAL BODY: PATIENT DIFF CARDS WITH INLINE EDITING */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#006591] border-t-transparent" />
              <p className="text-sm font-semibold text-slate-600">Analyse Gemini de la synthèse vocale en cours...</p>
            </div>
          ) : localUpdates.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2 bg-white rounded-xl border border-slate-200 p-6">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-medium">Aucun changement ou patient détecté dans cette relève vocale.</p>
            </div>
          ) : (
            localUpdates.map((patient, pIdx) => (
              <div 
                key={patient.patientId || `patient-${pIdx}`}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
                  patient.selected ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-200 opacity-75'
                }`}
              >
                {/* PATIENT CARD HEADER */}
                <div className="p-3.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={patient.selected}
                      onChange={() => handleTogglePatientSelection(pIdx)}
                      className="w-4 h-4 text-[#006591] rounded border-slate-300 focus:ring-[#006591] cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-sky-100 text-[#006591] rounded-lg">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{patient.patientName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                      {patient.changes.filter(c => c.selected).length} / {patient.changes.length} modif.
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      patient.selected ? 'bg-sky-100 text-[#006591]' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {patient.selected ? 'Sélectionné' : 'Ignoré'}
                    </span>
                  </div>
                </div>

                {/* PATIENT CHANGES DIFF LIST */}
                <div className="p-3 sm:p-4 space-y-3">
                  {patient.changes.map((change, cIdx) => {
                    const fieldKey = `p${pIdx}-c${cIdx}`;
                    const isEditing = editingKey === fieldKey;

                    return (
                      <div 
                        key={change.id || cIdx}
                        className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          !change.selected 
                            ? 'bg-slate-50 border-slate-200 opacity-60' 
                            : change.isManuallyEdited
                            ? 'bg-amber-50/60 border-amber-300/80'
                            : 'bg-white border-slate-200 hover:border-sky-200'
                        }`}
                      >
                        {/* LINE CHECKBOX & FIELD NAME */}
                        <div className="flex items-center gap-3 shrink-0">
                          <input
                            type="checkbox"
                            checked={change.selected}
                            onChange={() => handleToggleChangeSelection(pIdx, cIdx)}
                            className="w-4 h-4 text-[#006591] rounded border-slate-300 focus:ring-[#006591] cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                                {change.field}
                              </span>
                              
                              {/* ACTION TYPE BADGE */}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                change.actionType === 'ALERT'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : change.actionType === 'UPDATE'
                                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {change.actionType}
                              </span>

                              {/* MANUAL EDIT BADGE */}
                              {change.isManuallyEdited && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                  <span>✏️ Modifié</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* DIFF COMPARISON VALUES (PREVIOUS vs NEW) & INLINE EDIT */}
                        <div className="flex flex-1 items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
                          {/* PREVIOUS VALUE BADGE (RED) */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-900">
                            <span className="text-[10px] uppercase text-red-600 font-bold">Ancien :</span>
                            <span>{change.previousValue || 'Aucune'}</span>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />

                          {/* NEW VALUE BADGE / INLINE EDITING (GREEN OR EDIT INPUT) */}
                          {isEditing ? (
                            /* MECHANISM 1: ACTIVE INLINE EDIT INPUT */
                            <div className="flex items-center gap-1.5 bg-sky-50 p-1 rounded-xl border border-[#006591] shadow-xs">
                              <input
                                type="text"
                                value={editInputValue}
                                onChange={(e) => setEditInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditField(pIdx, cIdx);
                                  if (e.key === 'Escape') handleCancelEditField();
                                }}
                                autoFocus
                                className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006591] min-w-[160px]"
                                placeholder="Corriger la valeur..."
                              />
                              <button
                                onClick={() => handleSaveEditField(pIdx, cIdx)}
                                title="Valider la correction"
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEditField}
                                title="Annuler"
                                className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            /* GREEN DISPLAY BADGE + PENCIL ICON BUTTON */
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold ${
                                change.isManuallyEdited
                                  ? 'bg-amber-100/90 border-amber-300 text-amber-950'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              }`}>
                                <span className="text-[10px] uppercase text-emerald-700 font-bold">Vocal :</span>
                                <span>{change.newValue}</span>
                              </div>

                              {/* PENCIL BUTTON FOR INLINE EDITING (MECHANISM 1) */}
                              <button
                                onClick={() => handleStartEditField(pIdx, cIdx, change.newValue)}
                                title="Corriger la valeur extraite par le vocal (Pencil Edit)"
                                className="p-2 text-slate-500 hover:text-[#006591] hover:bg-sky-100/80 rounded-xl transition-all cursor-pointer border border-transparent hover:border-sky-200 active:scale-95"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL FOOTER / ACTIONS */}
        <div className="bg-white border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong className="text-slate-900">{totalSelectedPatients}</strong> patient(s) •{' '}
              <strong className="text-slate-900">{totalSelectedChanges}</strong> mise(s) à jour validée(s)
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer w-1/2 sm:w-auto text-center"
            >
              Annuler
            </button>

            <button
              onClick={handleConfirmAndApply}
              disabled={totalSelectedChanges === 0}
              className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 w-1/2 sm:w-auto text-center active:scale-95 ${
                totalSelectedChanges > 0
                  ? 'bg-[#006591] hover:bg-[#004d70] text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider et appliquer ({totalSelectedPatients} patients)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
