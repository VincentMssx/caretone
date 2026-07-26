import React, { useState } from 'react';
import { Patient } from '../types';
import { X, UserPlus, Save } from 'lucide-react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: Patient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onAddPatient
}) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('12/05/1954');
  const [secuNumber, setSecuNumber] = useState('1 54 05 75 112 042');
  const [phone, setPhone] = useState('06 12 34 56 78');
  const [address, setAddress] = useState('12 rue de la Paix, 75011 Paris');
  const [doctor, setDoctor] = useState('Dr. Morel');
  const [pathologyBadge, setPathologyBadge] = useState('POST-OPÉRATOIRE');
  const [careSummary, setCareSummary] = useState('Pansement complexe + Injections');
  const [warnings, setWarnings] = useState('Traitement anticoagulant');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newP: Patient = {
      id: `p-${Date.now()}`,
      name,
      birthDate,
      age: 72,
      secuNumber,
      bloodType: 'O+',
      address,
      phone,
      doctor,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      pathologyBadge,
      careSummary,
      nextVisitTime: 'Demain, 09:00',
      visitFrequency: '1x / Jour',
      warnings: warnings ? warnings.split(',').map(s => s.trim()) : [],
      status: 'active',
      observationsHistory: [
        {
          id: `obs-init-${Date.now()}`,
          date: 'Aujourd\'hui',
          timestamp: new Date().toISOString(),
          author: 'Julie R.',
          donnees: 'Initialisation du dossier patient.',
          actions: 'Bilan de soins infirmiers établi.',
          resultats: 'Dossier créé avec succès.'
        }
      ]
    };

    onAddPatient(newP);
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
            <UserPlus className="w-5 h-5 text-sky-300" />
            <h3 className="font-bold text-lg">Ajouter un nouveau patient</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Bernard Thomas"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Date de naissance
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="12/05/1954"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                N° Sécurité Sociale
              </label>
              <input
                type="text"
                value={secuNumber}
                onChange={(e) => setSecuNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Téléphone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Médecin traitant
              </label>
              <input
                type="text"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pathologie / Badge
              </label>
              <input
                type="text"
                value={pathologyBadge}
                onChange={(e) => setPathologyBadge(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Résumé des soins
              </label>
              <input
                type="text"
                value={careSummary}
                onChange={(e) => setCareSummary(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Points d'attention / Allergies (séparés par virgules)
              </label>
              <input
                type="text"
                value={warnings}
                onChange={(e) => setWarnings(e.target.value)}
                placeholder="Ex: Allergie Pénicilline, Risque chute"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
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
              <Save className="w-4 h-4" />
              <span>Créer la fiche</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
