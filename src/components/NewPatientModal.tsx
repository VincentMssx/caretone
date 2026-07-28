import React, { useState } from 'react';
import { Patient, Doctor } from '../types';
import { X, UserPlus, Save, Stethoscope, ChevronDown, Check } from 'lucide-react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: Patient) => void;
  doctors?: Doctor[];
  onAddDoctor?: (doctor: Doctor) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onAddPatient,
  doctors = [],
  onAddDoctor
}) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('12/05/1954');
  const [secuNumber, setSecuNumber] = useState('1 54 05 75 112 042');
  const [phone, setPhone] = useState('06 12 34 56 78');
  const [address, setAddress] = useState('12 rue de la Paix, 75011 Paris');
  const [doctorName, setDoctorName] = useState('Dr. Morel');
  const [doctorSpecialty, setDoctorSpecialty] = useState('Médecin Généraliste');
  const [doctorPhone, setDoctorPhone] = useState('02 40 12 34 56');
  const [doctorAddress, setDoctorAddress] = useState('14 Place Royale, 44000 Nantes');
  const [doctorRpps, setDoctorRpps] = useState('');
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [pathologyBadge, setPathologyBadge] = useState('POST-OPÉRATOIRE');
  const [careSummary, setCareSummary] = useState('Pansement complexe + Injections');
  const [visitFrequency, setVisitFrequency] = useState('1x / Jour');
  const [warnings, setWarnings] = useState('Traitement anticoagulant');

  if (!isOpen) return null;

  const matchingDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(doctorName.toLowerCase()) ||
    d.specialty.toLowerCase().includes(doctorName.toLowerCase())
  );

  const handleSelectDoctor = (doc: Doctor) => {
    setDoctorName(doc.name);
    setDoctorSpecialty(doc.specialty);
    setDoctorPhone(doc.phone);
    setDoctorAddress(doc.address);
    if (doc.rppsNumber) setDoctorRpps(doc.rppsNumber);
    setShowDoctorDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // Check if doctor exists, otherwise create new doctor
    const formattedDoctorName = doctorName.trim().startsWith('Dr.') ? doctorName.trim() : `Dr. ${doctorName.trim()}`;
    const existingDoc = doctors.find(d => d.name.toLowerCase() === formattedDoctorName.toLowerCase());
    if (!existingDoc && onAddDoctor && formattedDoctorName) {
      onAddDoctor({
        id: `doc-${Date.now()}`,
        name: formattedDoctorName,
        specialty: doctorSpecialty || 'Médecin Généraliste',
        phone: doctorPhone,
        address: doctorAddress,
        rppsNumber: doctorRpps
      });
    }

    const newP: Patient = {
      id: `p-${Date.now()}`,
      name,
      birthDate,
      age: 72,
      secuNumber,
      bloodType: 'O+',
      address,
      phone,
      doctor: formattedDoctorName,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      pathologyBadge,
      careSummary,
      nextVisitTime: 'Demain, 09:00',
      visitFrequency,
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
                Fréquence des visites
              </label>
              <input
                type="text"
                value={visitFrequency}
                onChange={(e) => setVisitFrequency(e.target.value)}
                placeholder="Ex: 1x / Jour, 2x / Semaine"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
              />
            </div>

            <div className="col-span-2">
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

            <div className="col-span-2 bg-sky-50/60 p-3.5 rounded-2xl border border-sky-200/80 space-y-3 relative mt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#006591] uppercase">
                <Stethoscope className="w-4 h-4" />
                <span>Médecin traitant & Informations de contact</span>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nom du médecin (Tapez pour autocompléter)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => {
                      setDoctorName(e.target.value);
                      setShowDoctorDropdown(true);
                    }}
                    onFocus={() => setShowDoctorDropdown(true)}
                    placeholder="Ex: Dr. Morel"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none pr-8"
                  />
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Autocomplete Dropdown */}
                {showDoctorDropdown && matchingDoctors.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {matchingDoctors.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => handleSelectDoctor(doc)}
                        className="p-2.5 hover:bg-sky-50 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                          <p className="text-[11px] text-slate-500">{doc.specialty} • {doc.phone}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-[#006591] bg-sky-100 px-2 py-0.5 rounded-full">
                          Sélectionner
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Spécialité</label>
                  <input
                    type="text"
                    value={doctorSpecialty}
                    onChange={e => setDoctorSpecialty(e.target.value)}
                    placeholder="Médecin Généraliste"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Tél. Cabinet</label>
                  <input
                    type="text"
                    value={doctorPhone}
                    onChange={e => setDoctorPhone(e.target.value)}
                    placeholder="02 40 12 34 56"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Adresse Cabinet</label>
                  <input
                    type="text"
                    value={doctorAddress}
                    onChange={e => setDoctorAddress(e.target.value)}
                    placeholder="14 Place Royale, 44000 Nantes"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
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
