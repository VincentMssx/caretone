import React, { useState } from 'react';
import { CotationItem, Patient } from '../types';
import { X, Calculator, Plus } from 'lucide-react';

interface NewCotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onAddCotation: (cotation: CotationItem) => void;
}

export const NewCotationModal: React.FC<NewCotationModalProps> = ({
  isOpen,
  onClose,
  patients,
  onAddCotation
}) => {
  const [patientName, setPatientName] = useState(patients[0]?.name || 'Jean Dupont');
  const [code, setCode] = useState('AMI 1 + MA');
  const [description, setDescription] = useState('Prise de sang à domicile');
  const [amount, setAmount] = useState<number>(8.50);
  const [status, setStatus] = useState<'brouillon' | 'valide' | 'envoye'>('brouillon');

  if (!isOpen) return null;

  const presetCodes = [
    { code: 'AMI 1 + MA', desc: 'Prise de sang à domicile', price: 8.50 },
    { code: 'AIS 3', desc: 'Soins d\'hygiène (30 min)', price: 26.50 },
    { code: 'AMI 4 + MA', desc: 'Pansement complexe', price: 16.25 },
    { code: 'AMI 1.5 + IFD', desc: 'Injection sous-cutanée + déplacement', price: 7.65 },
    { code: 'BSI Bilatéral', desc: 'Bilan de soins infirmiers', price: 42.00 }
  ];

  const handleSelectPreset = (preset: typeof presetCodes[0]) => {
    setCode(preset.code);
    setDescription(preset.desc);
    setAmount(preset.price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCot: CotationItem = {
      id: `c-${Date.now()}`,
      date: 'Aujourd\'hui, 11:30',
      patientName,
      code,
      description,
      amount: Number(amount),
      status
    };
    onAddCotation(newCot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 bg-[#006591] text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-sky-300" />
            <h3 className="font-bold text-lg">Nouvelle Cotation NGAP</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Patient
            </label>
            <select
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Raccourcis Actes Fréquents (NGAP)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presetCodes.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#006591] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  {p.code} ({p.price.toFixed(2)} €)
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Code Cotation
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Montant (€)
              </label>
              <input
                type="number"
                step="0.05"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Description du soin
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              >
                <option value="brouillon">Brouillon</option>
                <option value="valide">Validé</option>
                <option value="envoye">Envoyé</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#006591] hover:bg-[#004c6e] text-white rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter la cotation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
