import React, { useState, useEffect, useRef } from 'react';
import { DarTransmission } from '../types/transmission';
import { 
  Mic, 
  Square, 
  Send, 
  Sparkles, 
  Activity, 
  Thermometer, 
  Heart, 
  Check, 
  RotateCcw,
  GitCommit,
  GitMerge,
  UserCheck
} from 'lucide-react';

interface TransmissionFormProps {
  patientId: string;
  patientName: string;
  currentPassage?: DarTransmission | null;
  onSubmitPassage: (transmissionData: Omit<DarTransmission, 'id'>, isEditingCurrent: boolean) => void;
  onCancelEdit?: () => void;
}

export const TransmissionForm: React.FC<TransmissionFormProps> = ({
  patientId,
  patientName,
  currentPassage,
  onSubmitPassage,
  onCancelEdit
}) => {
  const [isEditingMode, setIsEditingMode] = useState<boolean>(!!currentPassage);

  // Form State
  const [nurseName, setNurseName] = useState('Julie IDEL');
  const [cible, setCible] = useState('');
  const [donnees, setDonnees] = useState('');
  const [actions, setActions] = useState('');
  const [resultats, setResultats] = useState('');

  // Constantes
  const [tension, setTension] = useState('');
  const [glycemie, setGlycemie] = useState('');
  const [temperature, setTemperature] = useState('');
  const [pouls, setPouls] = useState('');

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (currentPassage && isEditingMode) {
      setCible(currentPassage.cible || '');
      setDonnees(currentPassage.donnees || '');
      setActions(currentPassage.actions || '');
      setResultats(currentPassage.resultats || '');
      setTension(currentPassage.constantes?.tension || '');
      setGlycemie(currentPassage.constantes?.glycemie || '');
      setTemperature(currentPassage.constantes?.temperature || '');
      setPouls(currentPassage.constantes?.pouls || '');
    }
  }, [currentPassage, isEditingMode]);

  // Setup Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'fr-FR';

      rec.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setVoiceTranscript(currentText);
        parseVoiceToForm(currentText);
      };

      rec.onerror = (e: any) => {
        console.warn('Speech error:', e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Parse voice text into DAR & Constantes fields intelligently
  const parseVoiceToForm = (text: string) => {
    const lower = text.toLowerCase();

    // Check tension
    const tensionMatch = text.match(/tension\s*(?:est|de)?\s*(\d{2,3}[/.]\d{1,2}|\d{2}\s*\d{2})/i);
    if (tensionMatch) {
      setTension(tensionMatch[1].replace(' ', '/'));
    }

    // Check glycémie
    const glycMatch = text.match(/glycémie\s*(?:est|de)?\s*(\d+[.,]?\d*)/i);
    if (glycMatch) {
      setGlycemie(glycMatch[1].replace(',', '.'));
    }

    // Check température
    const tempMatch = text.match(/température\s*(?:est|de)?\s*(\d{2}[.,]?\d?)/i);
    if (tempMatch) {
      setTemperature(tempMatch[1].replace(',', '.'));
    }

    // Extract DAR if keywords spoken
    if (lower.includes('cible')) {
      const parts = text.split(/cible/i);
      if (parts[1]) setCible(parts[1].split(/donnée|donnee|action|résultat|resultat/i)[0].trim());
    }
    if (lower.includes('donnée') || lower.includes('donnee')) {
      const parts = text.split(/donnée|donnee/i);
      if (parts[1]) setDonnees(parts[1].split(/action|résultat|resultat/i)[0].trim());
    } else if (!donnees) {
      setDonnees(text);
    }

    if (lower.includes('action')) {
      const parts = text.split(/action/i);
      if (parts[1]) setActions(parts[1].split(/résultat|resultat/i)[0].trim());
    }
    if (lower.includes('résultat') || lower.includes('resultat')) {
      const parts = text.split(/résultat|resultat/i);
      if (parts[1]) setResultats(parts[1]);
    }
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
    } else {
      setVoiceTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback simulation
        setIsRecording(true);
        setTimeout(() => {
          const sample = "Cible glycémie. Données glycémie à 1.4, tension 13/8. Action insuline rapide 4 unités. Résultat état stable.";
          setVoiceTranscript(sample);
          parseVoiceToForm(sample);
          setIsRecording(false);
        }, 1500);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donnees.trim() && !cible.trim()) return;

    const now = new Date();
    const todayStr = `${now.getDate()} ${['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'][now.getMonth()]} ${now.getFullYear()}`;
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (isEditingMode && currentPassage) {
      // Modifying existing passage -> Increments Version (v2, v3...), updates lastModifiedAt
      const updatedPassage: Omit<DarTransmission, 'id'> = {
        patientId,
        nurseName,
        passageDate: currentPassage.passageDate,
        passageTime: currentPassage.passageTime,
        version: (currentPassage.version || 1) + 1,
        lastModifiedAt: timeStr,
        cible: cible || currentPassage.cible || 'Soin du jour',
        donnees: donnees || 'Passage effectué.',
        actions: actions || 'Soin paramédical réalisé.',
        resultats: resultats || 'Évolution satisfaisante.',
        constantes: {
          tension: tension || undefined,
          glycemie: glycemie || undefined,
          temperature: temperature || undefined,
          pouls: pouls || undefined
        }
      };

      onSubmitPassage(updatedPassage, true);
    } else {
      // New Passage Commit (Version 1)
      const newPassage: Omit<DarTransmission, 'id'> = {
        patientId,
        nurseName,
        passageDate: todayStr,
        passageTime: timeStr,
        version: 1,
        cible: cible || 'Soin & Surveillance',
        donnees: donnees || 'Passage réalisé.',
        actions: actions || 'Actes infirmiers exécutés.',
        resultats: resultats || 'Avis favorable.',
        constantes: {
          tension: tension || undefined,
          glycemie: glycemie || undefined,
          temperature: temperature || undefined,
          pouls: pouls || undefined
        }
      };

      onSubmitPassage(newPassage, false);
    }

    // Reset Form
    resetForm();
  };

  const resetForm = () => {
    setCible('');
    setDonnees('');
    setActions('');
    setResultats('');
    setTension('');
    setGlycemie('');
    setTemperature('');
    setPouls('');
    setIsEditingMode(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 shadow-lg border border-slate-200/80 space-y-5 relative overflow-hidden">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0ea5e9] via-[#006591] to-emerald-500" />

      {/* Header & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isEditingMode ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-[#006591]'}`}>
            {isEditingMode ? <GitMerge className="w-5 h-5" /> : <GitCommit className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base">
                {isEditingMode ? `Modification du passage (v${(currentPassage?.version || 1) + 1})` : `Saisie du Passage Actuel`}
              </h3>
              {isEditingMode && (
                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-300">
                  Édition Commit
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Patient : <span className="font-bold text-slate-700">{patientName}</span>
            </p>
          </div>
        </div>

        {/* Dictée Vocale Button */}
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-gradient-to-r from-[#0ea5e9] to-[#006591] hover:from-[#0284c7] hover:to-[#004c6e] text-white'
          }`}
        >
          {isRecording ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4" />}
          <span>{isRecording ? 'Arrêter la dictée' : 'Dictée Vocale 🎙️'}</span>
        </button>
      </div>

      {/* Mode Switcher */}
      {currentPassage && (
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-medium border border-slate-200">
          <button
            type="button"
            onClick={() => setIsEditingMode(false)}
            className={`flex-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer font-bold ${
              !isEditingMode ? 'bg-white text-[#006591] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Nouveau Passage
          </button>
          <button
            type="button"
            onClick={() => setIsEditingMode(true)}
            className={`flex-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer font-bold ${
              isEditingMode ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✏️ Modifier le passage existant (v{(currentPassage.version || 1) + 1})
          </button>
        </div>
      )}

      {/* Voice Transcript live preview */}
      {voiceTranscript && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 space-y-1">
          <span className="font-bold flex items-center gap-1 text-[#006591]">
            <Sparkles className="w-3.5 h-3.5 text-[#0ea5e9]" /> Détection vocale en direct :
          </span>
          <p className="italic text-slate-700">"{voiceTranscript}"</p>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cible */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Cible / Motif du soin <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={cible}
            onChange={(e) => setCible(e.target.value)}
            placeholder="Ex: Glycémie & Pansement Sacrum, Bilan sanguin..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0ea5e9] outline-none text-slate-800"
            required
          />
        </div>

        {/* Structured DAR Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Données */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-sky-900 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              D - Données (Constat / Clinique)
            </label>
            <textarea
              rows={3}
              value={donnees}
              onChange={(e) => setDonnees(e.target.value)}
              placeholder="Ex: Plaie propre 4cm, glycémie élevée..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0ea5e9] outline-none resize-none leading-relaxed"
              required
            />
          </div>

          {/* Actions */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-emerald-900 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              A - Actions (Soin réalisé)
            </label>
            <textarea
              rows={3}
              value={actions}
              onChange={(e) => setActions(e.target.value)}
              placeholder="Ex: Nettoyage sérum, réfection pansement..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Résultats */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-purple-900 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              R - Résultats (Évolution)
            </label>
            <textarea
              rows={3}
              value={resultats}
              onChange={(e) => setResultats(e.target.value)}
              placeholder="Ex: Bonne tolérance, douleur 2/10..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Constantes Saisie Rapide */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#0ea5e9]" /> Constantes du passage
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Tension */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block">Tension (mmHg)</label>
              <input
                type="text"
                value={tension}
                onChange={(e) => setTension(e.target.value)}
                placeholder="Ex: 13/8"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>

            {/* Glycémie */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block">Glycémie (g/L)</label>
              <input
                type="text"
                value={glycemie}
                onChange={(e) => setGlycemie(e.target.value)}
                placeholder="Ex: 1.4"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>

            {/* Température */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block">Température (°C)</label>
              <input
                type="text"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Ex: 37.2"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>

            {/* Pouls */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block">Pouls (bpm)</label>
              <input
                type="text"
                value={pouls}
                onChange={(e) => setPouls(e.target.value)}
                placeholder="Ex: 72"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Auteur :</span>
            <input
              type="text"
              value={nurseName}
              onChange={(e) => setNurseName(e.target.value)}
              className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
            />
          </div>

          <div className="flex items-center gap-2">
            {isEditingMode && onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
            )}

            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                isEditingMode
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-[#006591] hover:bg-[#004c6e] shadow-sky-900/20'
              }`}
            >
              {isEditingMode ? <GitMerge className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{isEditingMode ? 'Enregistrer la version v' + ((currentPassage?.version || 1) + 1) : 'Valider le passage (Commit)'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
