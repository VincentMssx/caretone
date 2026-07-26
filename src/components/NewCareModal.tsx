import React, { useState } from 'react';
import { Patient } from '../types';
import { X, Mic, Send, Stethoscope, Sparkles } from 'lucide-react';

interface NewCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSaveCareNote: (patientId: string, donnees: string, actions: string, resultats: string) => void;
  onStartVoiceTransmission: (patientId?: string) => void;
}

export const NewCareModal: React.FC<NewCareModalProps> = ({
  isOpen,
  onClose,
  patients,
  onSaveCareNote,
  onStartVoiceTransmission
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [donnees, setDonnees] = useState('');
  const [actions, setActions] = useState('');
  const [resultats, setResultats] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !donnees) return;
    onSaveCareNote(selectedPatientId, donnees, actions, resultats);
    setDonnees('');
    setActions('');
    setResultats('');
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
            <Stethoscope className="w-5 h-5 text-sky-300" />
            <h3 className="font-bold text-lg">Nouveau Soin / Note DAR</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Patient
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.careSummary})
                </option>
              ))}
            </select>
          </div>

          {/* Voice Shortcut Banner */}
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#006591]" />
              <span className="text-xs font-semibold text-[#006591]">
                Dictée vocale intelligente CareVoice
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartVoiceTransmission(selectedPatientId);
              }}
              className="px-3 py-1 bg-[#006591] text-white rounded-lg text-xs font-semibold hover:bg-[#004c6e] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Dicter</span>
            </button>
          </div>

          {/* DAR Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Données (D) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={donnees}
                onChange={(e) => setDonnees(e.target.value)}
                placeholder="Ex: Patient reposé, glycémie à jeun 1.25 g/L, tension 13/8..."
                required
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Actions (A)
              </label>
              <textarea
                value={actions}
                onChange={(e) => setActions(e.target.value)}
                placeholder="Ex: Injection insuline 6u, réfection du pansement sacrum..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Résultats (R)
              </label>
              <textarea
                value={resultats}
                onChange={(e) => setResultats(e.target.value)}
                placeholder="Ex: Cicatrisation en cours, aspect sain, patient coopératif..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
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
              <Send className="w-4 h-4" />
              <span>Enregistrer le soin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
