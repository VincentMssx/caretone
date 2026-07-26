import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Sparkles, 
  Database, 
  Bell, 
  CheckCircle2, 
  Save, 
  Lock,
  Mic,
  Calculator
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [cabinetName, setCabinetName] = useState('Cabinet Infirmier Libéral Julie R.');
  const [rppsNumber, setRppsNumber] = useState('10003482910');
  const [adeliNumber, setAdeliNumber] = useState('756482910');
  const [aiEngine, setAiEngine] = useState('gemini-2.5-flash');
  const [autoExtractDAR, setAutoExtractDAR] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Paramètres de l'application</h2>
          <p className="text-xs text-slate-500 font-medium">Configuration du cabinet, Moteur Vocal & Sécurité HDS</p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#006591] hover:bg-[#004c6e] text-white rounded-xl font-semibold text-xs md:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Paramètres enregistrés avec succès.</span>
        </div>
      )}

      {/* Profile & Cabinet Section */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <User className="w-4 h-4 text-[#006591]" />
          <span>Identité du Cabinet & Praticienne</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nom du Cabinet
            </label>
            <input
              type="text"
              value={cabinetName}
              onChange={(e) => setCabinetName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Praticienne Titulaire
            </label>
            <input
              type="text"
              disabled
              value="Julie R. - Infirmière Diplômée d'État"
              className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              N° RPPS
            </label>
            <input
              type="text"
              value={rppsNumber}
              onChange={(e) => setRppsNumber(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              N° ADELI
            </label>
            <input
              type="text"
              value={adeliNumber}
              onChange={(e) => setAdeliNumber(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none"
            />
          </div>
        </div>
      </section>

      {/* Dictation Engine */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <Sparkles className="w-4 h-4 text-[#006591]" />
          <span>Moteur de Dictée Vocale & Reconnaissance Médicale</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Moteur d'Analyse Vocal
            </label>
            <select
              value={aiEngine}
              onChange={(e) => setAiEngine(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none"
            >
              <option value="gemini-2.5-flash">Moteur CareVoice Flash (Recommandé - Ultra rapide & structuré DAR)</option>
              <option value="gemini-2.5-pro">Moteur CareVoice Pro (Haute précision médicale)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-sky-50 border border-sky-100 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block">Extraction Automatique des DAR</span>
              <span className="text-[11px] text-slate-500">Découpe automatiquement le discours vocal en Données, Actions et Résultats.</span>
            </div>
            <input
              type="checkbox"
              checked={autoExtractDAR}
              onChange={(e) => setAutoExtractDAR(e.target.checked)}
              className="w-4 h-4 text-[#006591] rounded accent-[#006591] cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Security HDS */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Sécurité & Hébergement Données de Santé (HDS)</span>
        </h3>

        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-teal-600 text-white rounded-full">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-teal-900 text-xs">Conformité HDS & RGPD Active</h4>
            <p className="text-[11px] text-teal-700 mt-0.5">
              Chiffrement AES-256 en transit et au repos. Aucune donnée vocale ou médicale n'est conservée par les modèles tiers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
