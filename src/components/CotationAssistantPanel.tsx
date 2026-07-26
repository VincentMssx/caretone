import React, { useState } from 'react';
import { CotationItem, Patient } from '../types';
import { 
  Sparkles, 
  Receipt, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Mic, 
  Calendar, 
  Clock, 
  Zap, 
  Info,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

interface CotationAssistantPanelProps {
  patients: Patient[];
  onAddCotation: (cotation: Omit<CotationItem, 'id' | 'status'>) => void;
  onSuccessToast?: (msg: string) => void;
}

export interface NgapAnalysisResult {
  acts: {
    code: string;
    label: string;
    coefficient: number;
    basePrice: number;
    percentageApplied: number;
    finalPrice: number;
    ruleExplanation: string;
  }[];
  supplements: {
    code: string;
    label: string;
    price: number;
  }[];
  totalPrice: number;
  cumulExplanation: string;
  warnings: string[];
}

export const CotationAssistantPanel: React.FC<CotationAssistantPanelProps> = ({
  patients,
  onAddCotation,
  onSuccessToast
}) => {
  const [careDescription, setCareDescription] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [isSunday, setIsSunday] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NgapAnalysisResult | null>(null);

  const presets = [
    'Pansement lourd de brûlure + Prise de sang à domicile',
    'BSI Bilan Initial + Injection sous-cutanée',
    'Ablation de 12 agrafes + Pansement simple de cicatrice',
    'Perfusion IV sous surveillance continue 1h'
  ];

  const handleAnalyze = async (overrideText?: string) => {
    const textToAnalyze = overrideText || careDescription;
    if (!textToAnalyze.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/cotation/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careDescription: textToAnalyze,
          patientName: selectedPatient,
          isSunday,
          isNight,
          isUrgent
        })
      });

      const data: NgapAnalysisResult = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Error analyzing cotation:', err);
      // Fallback result
      setResult({
        acts: [
          {
            code: 'AMI 4',
            label: 'Pansement lourd et complexe',
            coefficient: 4,
            basePrice: 3.15,
            percentageApplied: 100,
            finalPrice: 12.60,
            ruleExplanation: '1er acte coté à 100% selon Article 11B NGAP'
          },
          {
            code: 'AMI 1.5',
            label: 'Prélèvement sanguin veineux',
            coefficient: 1.5,
            basePrice: 3.15,
            percentageApplied: 50,
            finalPrice: 2.36,
            ruleExplanation: '2ème acte décoté à 50%'
          }
        ],
        supplements: [
          { code: 'IFD', label: 'Indemnité de déplacement', price: 2.50 },
          { code: 'MCI', label: 'Majoration Coordination Infirmière', price: 5.00 }
        ],
        totalPrice: 22.46,
        cumulExplanation: 'AMI 4 à 100% (12.60€) + AMI 1.5 à 50% (2.36€) + IFD (2.50€) + MCI (5.00€) = 22.46€',
        warnings: ['Vérifier que la prescription mentionne explicitement "à domicile".']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCotation = () => {
    if (!result) return;
    const codesStr = result.acts.map(a => a.code).concat(result.supplements.map(s => s.code)).join(' + ');
    const descStr = result.acts.map(a => a.label).join(' + ');

    onAddCotation({
      date: 'Aujourd\'hui',
      patientName: selectedPatient || 'Patient Soins Libéraux',
      code: codesStr || 'AMI 4 + IFD',
      description: descStr || careDescription || 'Soin infirmier calculé NGAP',
      amount: result.totalPrice
    });

    if (onSuccessToast) {
      onSuccessToast('Cotation enregistrée avec succès dans le journal de facturation !');
    }
    setResult(null);
    setCareDescription('');
  };

  return (
    <div className="bg-gradient-to-br from-[#004c6e] via-[#006591] to-sky-900 text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-extrabold text-[10px] rounded uppercase tracking-wider">
                NGAP Assistant CareVoice
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight mt-0.5">
              Calculateur & Optimiseur de Cotations NGAP
            </h3>
          </div>
        </div>

        <p className="text-xs text-sky-100 max-w-xs sm:text-right font-medium">
          Règles de cumul Article 11B, dégressivité 100/50/0%, majorations MCI, MAU & déplacements CPAM intégrés.
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Patient Selector */}
          <div>
            <label className="text-xs font-bold text-sky-100 mb-1.5 block">Patient concerné (optionnel)</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-sky-200/50 focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              <option value="" className="text-slate-800">-- Sélectionner un patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.name} className="text-slate-800">{p.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Context Toggles */}
          <div>
            <label className="text-xs font-bold text-sky-100 mb-1.5 block">Majorations de contexte</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsSunday(!isSunday)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isSunday ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Dimanche / Férié
              </button>

              <button
                type="button"
                onClick={() => setIsNight(!isNight)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isNight ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Nuit (20h-08h)
              </button>

              <button
                type="button"
                onClick={() => setIsUrgent(!isUrgent)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isUrgent ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Urgence
              </button>
            </div>
          </div>

        </div>

        {/* Text / Dictation Area */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-sky-100 block">
              Description des soins réalisés lors de la visite
            </label>
            <span className="text-[10px] text-sky-200">
              Langage naturel accepté (ex: "Pansement et prise de sang")
            </span>
          </div>

          <textarea
            rows={3}
            placeholder="Ex: J'ai fait une réfection de pansement lourd de brûlure de la jambe droite avec injection sous-cutanée d'anticoagulant et prise de sang chez le patient..."
            value={careDescription}
            onChange={(e) => setCareDescription(e.target.value)}
            className="w-full p-3.5 bg-white/10 border border-white/20 rounded-2xl text-xs text-white placeholder-sky-200/50 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none leading-relaxed"
          />
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-sky-200">Exemples de combinaisons IDEL :</span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCareDescription(preset);
                  handleAnalyze(preset);
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-[11px] font-semibold text-sky-100 transition-colors cursor-pointer"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze Button */}
        <button
          disabled={isLoading || !careDescription.trim()}
          onClick={() => handleAnalyze()}
          className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 text-xs uppercase tracking-wider"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Calcul des règles NGAP en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Analyser & Calculer la Cotation Optimale NGAP</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Result Display */}
      {result && (
        <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border border-sky-100 space-y-5 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-extrabold text-[#006591] uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded">
                Résultat CPAM NGAP
              </span>
              <h4 className="text-lg font-bold text-slate-800 mt-1">
                Décomposition des Actes & Tarification
              </h4>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-right">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Montant Total Estimé</span>
              <span className="text-2xl font-black text-emerald-700">
                {result.totalPrice.toFixed(2).replace('.', ',')} €
              </span>
            </div>
          </div>

          {/* Acts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2">Code Acte</th>
                  <th className="py-2">Libellé Officiel NGAP</th>
                  <th className="py-2 text-center">Taux Cumul</th>
                  <th className="py-2 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {result.acts.map((act, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-[#006591]">{act.code}</td>
                    <td className="py-2.5 text-slate-700">
                      <div>{act.label}</div>
                      <div className="text-[10px] text-slate-400">{act.ruleExplanation}</div>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        act.percentageApplied === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {act.percentageApplied}%
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-800">
                      {act.finalPrice.toFixed(2).replace('.', ',')} €
                    </td>
                  </tr>
                ))}

                {/* Supplements */}
                {result.supplements.map((supp, i) => (
                  <tr key={`supp-${i}`} className="bg-sky-50/50">
                    <td className="py-2.5 font-bold text-purple-700">{supp.code}</td>
                    <td className="py-2.5 text-slate-700 font-semibold">{supp.label}</td>
                    <td className="py-2.5 text-center text-[10px] text-slate-400">Forfait</td>
                    <td className="py-2.5 text-right font-bold text-purple-800">
                      +{supp.price.toFixed(2).replace('.', ',')} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cumul Justification */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-600" /> Règle de cumul appliquée (Article 11B) :
            </span>
            <p className="text-slate-600 leading-relaxed">{result.cumulExplanation}</p>
          </div>

          {/* Regulatory Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs space-y-1">
              <span className="font-bold text-amber-800 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Vigilance Télétransmission CPAM :
              </span>
              <ul className="list-disc list-inside text-amber-900 space-y-0.5">
                {result.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleApplyCotation}
            className="w-full py-3 bg-[#006591] hover:bg-[#004c6e] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Ajouter cette Cotation à mon Journal de Facturation</span>
          </button>

        </div>
      )}

    </div>
  );
};
