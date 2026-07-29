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
  Calculator,
  Plus,
  Trash2,
  UserCheck
} from 'lucide-react';

export interface Titulaire {
  id: string;
  name: string;
  role: string;
  rpps: string;
}

export const SettingsView: React.FC = () => {
  const [cabinetName, setCabinetName] = useState('Cabinet Infirmier Libéral R. & L.');
  const [adeliNumber, setAdeliNumber] = useState('756482910');
  const [aiEngine, setAiEngine] = useState('gemini-2.5-flash');
  const [autoExtractDAR, setAutoExtractDAR] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Multiple titulaires state
  const [titulaires, setTitulaires] = useState<Titulaire[]>(() => {
    try {
      const saved = localStorage.getItem('caretone_titulaires');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 't1', name: 'Julie R.', role: "Infirmière Diplômée d'État (Associée)", rpps: '10003482910' },
      { id: 't2', name: 'Sarah L.', role: "Infirmière Diplômée d'État (Associée)", rpps: '10005928391' }
    ];
  });

  const handleAddTitulaire = () => {
    const newT: Titulaire = {
      id: `t-${Date.now()}`,
      name: 'Nouveau Titulaire',
      role: "Infirmier(ère) Diplômé(e) d'État",
      rpps: '10000000000'
    };
    const updated = [...titulaires, newT];
    setTitulaires(updated);
    localStorage.setItem('caretone_titulaires', JSON.stringify(updated));
  };

  const handleUpdateTitulaire = (id: string, field: keyof Titulaire, value: string) => {
    const updated = titulaires.map(t => t.id === id ? { ...t, [field]: value } : t);
    setTitulaires(updated);
    localStorage.setItem('caretone_titulaires', JSON.stringify(updated));
  };

  const handleRemoveTitulaire = (id: string) => {
    if (titulaires.length <= 1) return;
    const updated = titulaires.filter(t => t.id !== id);
    setTitulaires(updated);
    localStorage.setItem('caretone_titulaires', JSON.stringify(updated));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('caretone_titulaires', JSON.stringify(titulaires));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Paramètres de l'application</h2>
          <p className="text-xs text-slate-500 font-medium">Configuration du cabinet, Titulaires, Moteur Vocal & Sécurité HDS</p>
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
          <span>Identité du Cabinet & Informations Générales</span>
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
              N° ADELI du Cabinet
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

      {/* MULTIPLE TITULAIRES SECTION */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#006591]" />
            <span>Titulaires du Cabinet ({titulaires.length})</span>
          </h3>

          <button
            onClick={handleAddTitulaire}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#006591] border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un titulaire</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Gérez les praticiennes et praticiens titulaires associés à ce cabinet infirmier.
        </p>

        <div className="space-y-3">
          {titulaires.map((t, idx) => (
            <div key={t.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#006591] text-white flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  Titulaire #{idx + 1}
                </span>

                {titulaires.length > 1 && (
                  <button
                    onClick={() => handleRemoveTitulaire(t.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Supprimer ce titulaire"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Nom & Prénom
                  </label>
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => handleUpdateTitulaire(t.id, 'name', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Titre / Qualification
                  </label>
                  <input
                    type="text"
                    value={t.role}
                    onChange={(e) => handleUpdateTitulaire(t.id, 'role', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    N° RPPS
                  </label>
                  <input
                    type="text"
                    value={t.rpps}
                    onChange={(e) => handleUpdateTitulaire(t.id, 'rpps', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
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
              <option value="gemini-2.5-flash">Moteur CareTone Flash (Recommandé - Ultra rapide & structuré DAR)</option>
              <option value="gemini-2.5-pro">Moteur CareTone Pro (Haute précision médicale)</option>
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
