import React, { useState, useEffect } from 'react';
import { Patient, ProposedExtraction, NavView } from '../types';
import { 
  Mic, 
  Pause, 
  RotateCcw, 
  Square, 
  Sparkles, 
  CheckCircle2, 
  UserPlus, 
  Loader2, 
  ArrowLeft,
  Wand2
} from 'lucide-react';
import { ShaderCanvas } from '../components/ShaderCanvas';

interface LiveVoiceTransmissionViewProps {
  patients: Patient[];
  onBack: () => void;
  onApproveAllModifications: (
    updatedObservations: { patientId: string; donnees: string; actions: string; resultats: string }[],
    newPatientsToCreate: Partial<Patient>[]
  ) => void;
}

export const LiveVoiceTransmissionView: React.FC<LiveVoiceTransmissionViewProps> = ({
  patients,
  onBack,
  onApproveAllModifications
}) => {
  const [seconds, setSeconds] = useState(1127); // 18:47 formatted
  const [isPaused, setIsPaused] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Raw continuous dictation text (nurse's voice transcript)
  const [dictationText, setDictationText] = useState<string>(
    "Pour Jean Dupont: plaie sacrum, glycémie 1.85 ce matin à 08h. Nettoyage de la plaie selon protocole et application d'un nouveau pansement. Cicatrisation en cours, bourgeonnement observé. " +
    "Pour Chantal Martin: douleur cheville droite suite à une chute dans la cuisine, tension à 13/8. Application de glace et préconisation de repos. " +
    "Créer une nouvelle fiche pour Bernard Thomas né le 12/05/1954, suivi post-opératoire de pansement lourd."
  );

  // Default proposed extractions
  const [extractions, setExtractions] = useState<ProposedExtraction[]>([
    {
      patientId: 'p1',
      patientName: 'Jean Dupont',
      lastUpdateText: 'Dernière mise à jour : hier, 18h30',
      donnees: 'Plaie sacrum, <span class="diff-removed line-through text-red-600 opacity-60">glycémie 1.10</span> <span class="diff-added bg-emerald-100 text-emerald-800 font-semibold px-1 py-0.5 rounded">glycémie 1.85 à 08h</span>.',
      actions: 'Nettoyage plaie, protocole suivi. <span class="diff-added bg-emerald-100 text-emerald-800 font-semibold px-1 py-0.5 rounded">Application nouveau pansement.</span>',
      resultats: 'Cicatrisation en cours, <span class="diff-added bg-emerald-100 text-emerald-800 font-semibold px-1 py-0.5 rounded">bourgeonnement observé.</span>'
    },
    {
      patientId: 'p5',
      patientName: 'Chantal Martin',
      lastUpdateText: 'Dernière mise à jour : ce matin, 09h00',
      donnees: '<span class="diff-added bg-emerald-100 text-emerald-800 font-semibold px-1 py-0.5 rounded">Douleur cheville droite post-chute cuisine.</span> Tension 13/8.',
      actions: '<span class="diff-added bg-emerald-100 text-emerald-800 font-semibold px-1 py-0.5 rounded">Application glace, préconisation repos.</span> Surveillance paramètres.',
      resultats: 'État stable, <span class="diff-added bg-emerald-100 text-emerald-800 font-semibold px-1 py-0.5 rounded">mobilité conservée malgré gêne.</span>'
    },
    {
      isNewPatient: true,
      patientName: 'Bernard Thomas',
      birthDate: '12/05/1954',
      donnees: 'Mise en place suivi post-opératoire.',
      actions: 'Pansement lourd sur cicatrice opératoire.',
      resultats: 'Dossier créé via transmission vocale.'
    }
  ]);

  // Timer loop
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Trigger server dictation extraction
  const handleAIExtract = async () => {
    if (!dictationText.trim()) return;
    setIsExtracting(true);

    try {
      const response = await fetch('/api/dictation/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dictationText,
          existingPatients: patients.map(p => ({ id: p.id, name: p.name }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.extractions && Array.isArray(data.extractions) && data.extractions.length > 0) {
          setExtractions(data.extractions);
        }
      }
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  // Sync / Approve handler
  const handleApprove = () => {
    const updatedObs = extractions
      .filter(e => !e.isNewPatient && e.patientId)
      .map(e => ({
        patientId: e.patientId!,
        donnees: e.donnees.replace(/<[^>]*>/g, ''), // strip HTML tags
        actions: e.actions.replace(/<[^>]*>/g, ''),
        resultats: e.resultats.replace(/<[^>]*>/g, '')
      }));

    const newPatients = extractions
      .filter(e => e.isNewPatient)
      .map(e => ({
        name: e.patientName,
        birthDate: e.birthDate || '12/05/1954',
        age: 72,
        careSummary: 'Pansement lourd post-opératoire',
        pathologyBadge: 'POST-OPÉRATOIRE',
        warnings: ['Pansement stérile quotidien']
      }));

    onApproveAllModifications(updatedObs, newPatients);
  };

  return (
    <div className="p-4 md:p-8 pb-32 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#006591] hover:underline font-bold text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'accueil</span>
        </button>
        <span className="text-xs text-slate-500 font-semibold">
          Session IDEL: Julie R. • HDS Chiffré
        </span>
      </div>

      {/* Hero Live Recording Screen (Dark Navy Surface) */}
      <section className="w-full bg-[#131b2e] text-white rounded-2xl overflow-hidden shadow-xl relative flex flex-col min-h-[360px]">
        {/* WebGL Wave background shader */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <ShaderCanvas isAnimated={!isPaused} className="w-full h-full" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5">
          {/* Live indicator badge */}
          <div>
            <span className="bg-red-600 px-3.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>EN DIRECT</span>
            </span>
          </div>

          {/* Timer Display */}
          <div className="text-5xl md:text-6xl font-extrabold tracking-tight font-mono text-white">
            {formatTimer(seconds)}
          </div>

          {/* Pulsing Mic Button */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-28 h-28 bg-sky-500/20 rounded-full animate-ping pointer-events-none" />
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="relative z-20 w-20 h-20 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95 cursor-pointer"
            >
              <Mic className="w-10 h-10" />
            </button>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-8 pt-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex flex-col items-center gap-1 group text-slate-300 hover:text-white cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <Pause className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">{isPaused ? 'Reprendre' : 'Pause'}</span>
            </button>

            <button
              onClick={() => setSeconds(0)}
              className="flex flex-col items-center gap-1 group text-slate-300 hover:text-white cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">Recommencer</span>
            </button>

            <button
              onClick={() => setIsPaused(true)}
              className="flex flex-col items-center gap-1 group text-red-400 hover:text-red-300 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 group-hover:bg-red-500/30 flex items-center justify-center transition-colors">
                <Square className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-xs font-semibold">Terminer</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live Transcript & Gemini Extraction Control */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-[#006591]" />
            <span>Transcription Vocale Continu en Direct (Modifiable)</span>
          </label>

          <button
            onClick={handleAIExtract}
            disabled={isExtracting}
            className="px-4 py-2 bg-[#006591] hover:bg-[#004c6e] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isExtracting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 text-sky-300" />
            )}
            <span>Ré-analyser la dictée</span>
          </button>
        </div>

        <textarea
          value={dictationText}
          onChange={(e) => setDictationText(e.target.value)}
          rows={3}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none"
        />
      </section>

      {/* Analysis Preview / Diff Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#006591]" />
            <span>Extraction intelligente : Modifications proposées</span>
          </h3>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            {extractions.length} fiches impactées
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {extractions.map((item, index) => {
            if (item.isNewPatient) {
              return (
                <div 
                  key={index}
                  className="lg:col-span-2 bg-sky-50/80 border-2 border-dashed border-sky-300 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 shadow-sm"
                >
                  <div className="w-16 h-16 rounded-full bg-sky-200/80 text-[#006591] flex items-center justify-center shrink-0">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-1">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <h4 className="font-bold text-lg text-[#006591]">
                        Nouveau Patient Détecté : {item.patientName}
                      </h4>
                      <span className="text-[10px] font-bold uppercase bg-sky-200 text-[#006591] px-2 py-0.5 rounded-full">
                        Création Auto
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Né le {item.birthDate}. Informations de soin et pansement détectées à partir de votre dictée vocale.
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm"
              >
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sky-100 text-[#006591] flex items-center justify-center font-bold text-sm">
                      {item.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{item.patientName}</h4>
                      <span className="text-[11px] text-slate-400">{item.lastUpdateText || 'Mis à jour'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 text-xs">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Observations DAR extraites :
                  </p>
                  
                  <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 leading-relaxed">
                    <p>
                      <strong className="text-slate-800 font-bold mr-1">D :</strong> 
                      <span dangerouslySetInnerHTML={{ __html: item.donnees }} />
                    </p>
                    <p>
                      <strong className="text-slate-800 font-bold mr-1">A :</strong> 
                      <span dangerouslySetInnerHTML={{ __html: item.actions }} />
                    </p>
                    <p>
                      <strong className="text-slate-800 font-bold mr-1">R :</strong> 
                      <span dangerouslySetInnerHTML={{ __html: item.resultats }} />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-[280px] right-0 h-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 md:px-8 flex items-center justify-between z-50 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-sky-500 text-white flex items-center justify-center text-xs font-bold">JD</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">CM</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-teal-500 text-white flex items-center justify-center text-xs font-bold">BT</div>
          </div>
          <p className="text-xs md:text-sm font-semibold text-slate-700 hidden sm:block">
            Prêt à synchroniser les mises à jour pour 2 patients + 1 création
          </p>
        </div>

        <button
          onClick={handleApprove}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Approuver toutes les modifications</span>
        </button>
      </div>
    </div>
  );
};
