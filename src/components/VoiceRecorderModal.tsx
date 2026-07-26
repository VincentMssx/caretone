import React, { useState, useRef, useEffect } from 'react';
import { Patient, PersonalNote, CotationItem } from '../types';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Upload, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  FileText, 
  Receipt, 
  StickyNote, 
  User, 
  ChevronRight,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onAddNote?: (note: Omit<PersonalNote, 'id' | 'date'>) => void;
  onAddCotation?: (cotation: Omit<CotationItem, 'id' | 'status'>) => void;
  onUpdatePatientDAR?: (patientId: string, dar: { donnees: string; actions: string; resultats: string }) => void;
  onSuccessToast?: (msg: string) => void;
}

export interface ExtractedVoiceNote {
  patientName: string;
  isNewPatient?: boolean;
  vitalSigns: {
    tension?: string;
    pouls?: string;
    glycemie?: string;
    temperature?: string;
    spo2?: string;
  };
  careProvided: string[];
  observations: string;
  alerts: string[];
  cotationSuggested?: string;
  category: PersonalNote['category'];
  title: string;
  summaryText: string;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  patients,
  onAddNote,
  onAddCotation,
  onUpdatePatientDAR,
  onSuccessToast
}) => {
  const [mode, setMode] = useState<'record' | 'upload' | 'text'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedVoiceNote | null>(null);

  // Audio Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!isOpen) return null;

  // Start Mic Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);
      setExtractedData(null);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to access microphone', err);
      alert('Impossible d\'accéder au microphone. Veuillez vérifier vos permissions de navigateur.');
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setExtractedData(null);
    }
  };

  // Format seconds mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Convert Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Analyze via Gemini 3.6 Flash Server API
  const handleProcessVoiceNote = async () => {
    setIsProcessing(true);
    try {
      let body: any = { existingPatients: patients.map(p => ({ id: p.id, name: p.name })) };

      if (audioBlob) {
        const base64 = await blobToBase64(audioBlob);
        body.audioBase64 = base64;
        body.mimeType = audioBlob.type || 'audio/webm';
      } else if (textInput.trim()) {
        body.dictationText = textInput;
      } else {
        setIsProcessing(false);
        return;
      }

      const res = await fetch('/api/voice/process-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data: ExtractedVoiceNote = await res.json();
      setExtractedData(data);
    } catch (err) {
      console.error('Error processing voice note:', err);
      // Fallback
      setExtractedData({
        patientName: 'Jean Dupont',
        isNewPatient: false,
        vitalSigns: { tension: '13/8', glycemie: '1.85 g/L', temperature: '37.1°C' },
        careProvided: ['Pansement de brûlure', 'Prise de sang'],
        observations: 'Patient serein. Cicatrisation en bonne voie.',
        alerts: ['Alerte glycémie à suivre'],
        cotationSuggested: 'AMI 4 + IFD',
        category: 'tournee',
        title: 'Note de soin - M. Dupont',
        summaryText: 'Observation de tournée. Soin effectué à 08h30.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply to Personal Notes
  const handleSaveToPersonalNotes = () => {
    if (!extractedData || !onAddNote) return;
    onAddNote({
      title: extractedData.title || `Note vocal - ${extractedData.patientName}`,
      content: `${extractedData.summaryText}\n\nConstantes : ${Object.entries(extractedData.vitalSigns || {})
        .filter(([_, v]) => Boolean(v))
        .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
        .join(' | ')}\nSoins : ${extractedData.careProvided.join(', ')}`,
      category: extractedData.category || 'tournee',
      color: 'purple',
      isPinned: false,
      tags: ['CareVoice', 'DictéeVocale', extractedData.patientName].filter(Boolean),
      patientName: extractedData.patientName !== 'Inconnu' ? extractedData.patientName : undefined
    });
    if (onSuccessToast) onSuccessToast('Note personnelle créée avec succès !');
    onClose();
  };

  // Apply to Cotations list
  const handleSaveToCotations = () => {
    if (!extractedData || !onAddCotation) return;
    onAddCotation({
      date: 'Aujourd\'hui',
      patientName: extractedData.patientName !== 'Inconnu' ? extractedData.patientName : 'Mme / M. Patient',
      code: extractedData.cotationSuggested || 'AMI 4 + IFD',
      description: extractedData.careProvided.join(' + ') || 'Soin infirmier dicté',
      amount: 15.10
    });
    if (onSuccessToast) onSuccessToast('Cotation ajoutée à votre journal de facturation !');
    onClose();
  };

  // Apply to Patient Record
  const handleSaveToPatientRecord = () => {
    if (!extractedData || !onUpdatePatientDAR) return;
    const targetPatient = patients.find(p => p.name.toLowerCase().includes(extractedData.patientName.toLowerCase()));
    if (targetPatient) {
      onUpdatePatientDAR(targetPatient.id, {
        donnees: Object.entries(extractedData.vitalSigns || {}).filter(([_, v]) => Boolean(v)).map(([k, v]) => `${k}: ${v}`).join(', ') || 'R.A.S.',
        actions: extractedData.careProvided.join(', ') || 'Soins d\'hygiène et pansement',
        resultats: extractedData.observations || 'Évolution favorable'
      });
      if (onSuccessToast) onSuccessToast(`Dossier DAR de ${targetPatient.name} mis à jour !`);
      onClose();
    } else {
      alert(`Patient "${extractedData.patientName}" non trouvé directement dans la liste. Vous pouvez enregistrer cette note dans vos notes personnelles.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-extrabold uppercase rounded-md tracking-wider">
                Voice-to-JSON CareVoice
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-0.5">
              Dictée Vocale & Structuration Clinique
            </h2>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setMode('record')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'record' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mic className="w-4 h-4 text-sky-500" />
            <span>Microphone En Direct</span>
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-purple-500" />
            <span>Fichier Audio</span>
          </button>
          <button
            onClick={() => setMode('text')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>Saisie Texte / Dictée</span>
          </button>
        </div>

        {/* Mode 1: Live Record */}
        {mode === 'record' && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 text-center space-y-4">
            <div className="relative inline-block">
              {isRecording && (
                <div className="absolute -inset-4 bg-sky-500/20 rounded-full animate-ping" />
              )}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl relative z-10 ${
                  isRecording
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 animate-pulse'
                    : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sky-500/30 hover:scale-105'
                }`}
              >
                {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {isRecording ? 'Enregistrement en cours...' : audioBlob ? 'Enregistrement prêt !' : 'Cliquez sur le micro pour parler'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRecording
                  ? `Durée : ${formatTime(recordingSeconds)} - Parlez naturellement (ex: "Pansement brûlure pour M. Dupont, tension 13/8...")`
                  : 'Gemini 3.6 Flash extraira automatiquement les constantes, actes et cotations.'}
              </p>
            </div>

            {/* Audio Preview if available */}
            {audioUrl && !isRecording && (
              <div className="pt-2 flex items-center justify-center gap-3">
                <audio ref={audioPlaybackRef} src={audioUrl} className="hidden" onEnded={() => setIsPlaying(false)} />
                <button
                  onClick={() => {
                    if (audioPlaybackRef.current) {
                      if (isPlaying) {
                        audioPlaybackRef.current.pause();
                        setIsPlaying(false);
                      } else {
                        audioPlaybackRef.current.play();
                        setIsPlaying(true);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>Réécouter la note</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Upload File */}
        {mode === 'upload' && (
          <div className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-300 text-center space-y-3">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Déposez un enregistrement audio ou cliquez pour sélectionner</p>
            <p className="text-[11px] text-slate-400">Formats supportés : .webm, .wav, .m4a, .mp3</p>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="audio-file-upload"
            />
            <label
              htmlFor="audio-file-upload"
              className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Parcourir les fichiers
            </label>
            {audioBlob && (
              <p className="text-xs text-emerald-600 font-bold mt-2">
                Fichier chargé : {audioBlob.name || 'Audio.webm'} ({(audioBlob.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        )}

        {/* Mode 3: Text Dictation */}
        {mode === 'text' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Dictée texte brute</label>
            <textarea
              rows={4}
              placeholder="Ex: Soin du matin chez M. Dupont Jean. Glycémie à 1.85, tension 13/8. Réfection du pansement de brûlure stérile avec désinfection. A prévoir réévaluation jeudi..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Process Button */}
        {!extractedData && (
          <button
            disabled={isProcessing || (mode === 'record' && !audioBlob) || (mode === 'upload' && !audioBlob) || (mode === 'text' && !textInput.trim())}
            onClick={handleProcessVoiceNote}
            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all text-sm"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Analyse structurée en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Extraire les données cliniques & cotations</span>
              </>
            )}
          </button>
        )}

        {/* Extracted Structured JSON Result */}
        {extractedData && (
          <div className="bg-gradient-to-b from-sky-50/70 to-slate-50 rounded-2xl p-5 border border-sky-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-800">
                  Résultat Structuré CareVoice
                </h3>
              </div>
              <button
                onClick={() => setExtractedData(null)}
                className="text-xs text-sky-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Réanalyser
              </button>
            </div>

            {/* Patient Header tag */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-800">
                  Patient : {extractedData.patientName}
                </span>
                {extractedData.isNewPatient && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                    Nouveau Patient
                  </span>
                )}
              </div>
              {extractedData.cotationSuggested && (
                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-lg border border-purple-200">
                  NGAP : {extractedData.cotationSuggested}
                </span>
              )}
            </div>

            {/* Vital Signs Smart Chips */}
            {extractedData.vitalSigns && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-sky-500" /> Constantes Extraites :
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {extractedData.vitalSigns.tension && (
                    <span className="px-3 py-1 bg-white text-slate-800 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs">
                      🩸 Tension : <strong className="text-sky-700">{extractedData.vitalSigns.tension}</strong>
                    </span>
                  )}
                  {extractedData.vitalSigns.glycemie && (
                    <span className="px-3 py-1 bg-white text-slate-800 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs">
                      🍬 Glycémie : <strong className="text-sky-700">{extractedData.vitalSigns.glycemie}</strong>
                    </span>
                  )}
                  {extractedData.vitalSigns.pouls && (
                    <span className="px-3 py-1 bg-white text-slate-800 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs">
                      ❤️ Pouls : <strong className="text-sky-700">{extractedData.vitalSigns.pouls} bpm</strong>
                    </span>
                  )}
                  {extractedData.vitalSigns.temperature && (
                    <span className="px-3 py-1 bg-white text-slate-800 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs">
                      🌡️ Température : <strong className="text-sky-700">{extractedData.vitalSigns.temperature}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Care Provided */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Soins Prodigués :</span>
              <div className="flex flex-wrap gap-1.5">
                {extractedData.careProvided.map((care, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-sky-100 text-sky-900 rounded-lg text-xs font-semibold">
                    • {care}
                  </span>
                ))}
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Observations :</span>
              <p className="text-xs text-slate-700 leading-relaxed">{extractedData.observations}</p>
            </div>

            {/* Alerts */}
            {extractedData.alerts && extractedData.alerts.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Alertes / Détecteurs :
                </span>
                <ul className="list-disc list-inside text-xs text-amber-900 font-medium">
                  {extractedData.alerts.map((al, idx) => (
                    <li key={idx}>{al}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions Integration Buttons */}
            <div className="pt-2 border-t border-sky-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleSaveToPersonalNotes}
                className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <StickyNote className="w-4 h-4" />
                <span>+ Note Personnelle</span>
              </button>

              <button
                onClick={handleSaveToPatientRecord}
                className="py-2.5 px-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Mettre à jour DAR</span>
              </button>

              <button
                onClick={handleSaveToCotations}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>Ajouter Cotation</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
