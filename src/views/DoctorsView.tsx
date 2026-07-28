import React, { useState } from 'react';
import { Doctor, Patient } from '../types';
import { Search, Plus, Stethoscope, Phone, Mail, MapPin, UserCheck, ChevronRight, User, ShieldCheck, HeartPulse } from 'lucide-react';
import { DoctorDetailModal } from '../components/DoctorDetailModal';

export interface NursePro {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  rppsNumber?: string;
  specialities?: string;
  avatarUrl?: string;
}

const INITIAL_NURSES: NursePro[] = [
  {
    id: 'nurse-julie',
    name: 'Julie R.',
    role: 'IDEL Titulaire (Référente Soins)',
    phone: '06 12 34 56 78',
    email: 'julie.idel@caretone.fr',
    rppsNumber: '10100987601',
    specialities: 'Plaies complexes, Diabétologie, Perfusions',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'nurse-marc',
    name: 'Marc V.',
    role: 'Infirmier Libéral Associé',
    phone: '06 23 45 67 89',
    email: 'marc.v@caretone.fr',
    rppsNumber: '10100987602',
    specialities: 'Soins palliatifs, Oncologie, Dialyse',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'nurse-sophie',
    name: 'Sophie L.',
    role: 'IDEL Remplaçante',
    phone: '06 34 56 78 90',
    email: 'sophie.l@caretone.fr',
    rppsNumber: '10100987603',
    specialities: 'Soins à domicile, Gériatrie',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78901?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'nurse-thomas',
    name: 'Thomas B.',
    role: 'IDEL Collaborateur',
    phone: '06 45 67 89 01',
    email: 'thomas.b@caretone.fr',
    rppsNumber: '10100987604',
    specialities: 'Pédiatrie, Injection, Surveillance Post-Op',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80'
  }
];

interface DoctorsViewProps {
  doctors: Doctor[];
  patients: Patient[];
  onAddDoctor: (doctor: Doctor) => void;
  onUpdateDoctor: (doctor: Doctor) => void;
  onViewPatientDossier: (patientId: string) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  doctors,
  patients,
  onAddDoctor,
  onUpdateDoctor,
  onViewPatientDossier
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'DOCTORS' | 'NURSES'>('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedNurse, setSelectedNurse] = useState<NursePro | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'DOCTOR' | 'NURSE'>('DOCTOR');

  const [nursesList, setNursesList] = useState<NursePro[]>(INITIAL_NURSES);

  // New item form state
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('Médecin Généraliste');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [rppsNumber, setRppsNumber] = useState('');
  const [notes, setNotes] = useState('');

  const filteredDoctors = doctors.filter(doc => {
    const query = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(query) ||
      doc.specialty.toLowerCase().includes(query) ||
      doc.address.toLowerCase().includes(query) ||
      doc.phone.includes(query)
    );
  });

  const filteredNurses = nursesList.filter(nurse => {
    const query = searchQuery.toLowerCase();
    return (
      nurse.name.toLowerCase().includes(query) ||
      nurse.role.toLowerCase().includes(query) ||
      (nurse.specialities && nurse.specialities.toLowerCase().includes(query)) ||
      nurse.phone.includes(query)
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (addType === 'DOCTOR') {
      const newDoc: Doctor = {
        id: `doc-${Date.now()}`,
        name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
        specialty: specialty || 'Médecin Généraliste',
        phone,
        email,
        address: address || 'Cabinet Médical',
        rppsNumber,
        notes
      };
      onAddDoctor(newDoc);
    } else {
      const newNurse: NursePro = {
        id: `nurse-${Date.now()}`,
        name: name.startsWith('Dr.') ? name.replace('Dr.', '').trim() : name,
        role: specialty || 'Infirmier Libéral',
        phone,
        email,
        rppsNumber,
        specialities: notes || 'Soins infirmiers à domicile',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'
      };
      setNursesList([newNurse, ...nursesList]);
    }

    setShowAddModal(false);
    // Reset form
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setRppsNumber('');
    setNotes('');
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Title & Section Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#006591]/10 text-[#006591] text-[11px] font-extrabold uppercase rounded-md tracking-wider">
              Annuaire de Santé
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">{doctors.length} Médecins • {nursesList.length} Infirmiers</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mt-1">Professionnels de Santé</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consultez les coordonnées des médecins traitants et de l'équipe d'infirmièr(e)s diplômé(e)s d'État.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setAddType('DOCTOR'); setShowAddModal(true); }}
            className="flex items-center gap-1.5 bg-[#006591] hover:bg-[#004c6e] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Médecin</span>
          </button>
          <button
            onClick={() => { setAddType('NURSE'); setShowAddModal(true); }}
            className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Infirmier</span>
          </button>
        </div>
      </div>

      {/* Search & Tabs Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, spécialité, téléphone ou RPPS..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none transition-all"
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL' ? 'bg-[#006591] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({doctors.length + nursesList.length})
          </button>
          <button
            onClick={() => setActiveTab('DOCTORS')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DOCTORS' ? 'bg-[#006591] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Médecins ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab('NURSES')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'NURSES' ? 'bg-[#006591] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Infirmiers ({nursesList.length})
          </button>
        </div>
      </div>

      {/* SECTION 1: MÉDECINS */}
      {(activeTab === 'ALL' || activeTab === 'DOCTORS') && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-100 text-[#006591] rounded-lg">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Médecins Traitants & Spécialistes ({filteredDoctors.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => {
              const assignedPatients = patients.filter(p =>
                p.doctor && p.doctor.toLowerCase().includes(doc.name.toLowerCase().replace('dr.', '').trim())
              );

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-[#006591] flex items-center justify-center font-bold text-lg shrink-0">
                          <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-[#006591] transition-colors">
                            {doc.name}
                          </h3>
                          <span className="inline-block px-2.5 py-0.5 bg-sky-100/70 text-[#006591] rounded-full text-[11px] font-bold mt-0.5">
                            {doc.specialty}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#006591] shrink-0" />
                        <a href={`tel:${doc.phone.replace(/\s+/g, '')}`} className="font-semibold text-slate-800 hover:underline">
                          {doc.phone || 'Non renseigné'}
                        </a>
                      </div>

                      {doc.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{doc.email}</span>
                        </div>
                      )}

                      {/* Adresse du Cabinet - SEULEMENT POUR MÉDECINS */}
                      <div className="flex items-start gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-[#006591] shrink-0 mt-0.5" />
                        <span className="line-clamp-2 text-slate-700 font-medium">{doc.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Linked Patients Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#006591]" />
                      <span className="text-xs font-bold text-slate-700">
                        {assignedPatients.length} patient(s)
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedDoctor(doc)}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#006591] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Fiche complète</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: INFIRMIERS (MÊMES INFOS SANS ADRESSE DU CABINET) */}
      {(activeTab === 'ALL' || activeTab === 'NURSES') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Équipe d'Infirmièr(e)s Libéraux ({filteredNurses.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNurses.map((nurse) => (
              <div
                key={nurse.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-4 group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border-2 border-teal-300 shrink-0 shadow-2xs">
                        <img
                          src={nurse.avatarUrl}
                          alt={nurse.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-800 transition-colors">
                          {nurse.name}
                        </h3>
                        <span className="inline-block px-2.5 py-0.5 bg-teal-100/80 text-teal-900 rounded-full text-[11px] font-bold mt-0.5">
                          {nurse.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Same Info as Doctor WITHOUT cabinet address */}
                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <a href={`tel:${nurse.phone.replace(/\s+/g, '')}`} className="font-semibold text-slate-800 hover:underline">
                        {nurse.phone}
                      </a>
                    </div>

                    {nurse.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{nurse.email}</span>
                      </div>
                    )}

                    {nurse.rppsNumber && (
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-600">RPPS: {nurse.rppsNumber}</span>
                      </div>
                    )}

                    {nurse.specialities && (
                      <div className="flex items-start gap-2 bg-teal-50/60 p-2 rounded-xl border border-teal-100 text-slate-700 font-medium">
                        <HeartPulse className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                        <span>{nurse.specialities}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer status for Nurse */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-bold text-slate-700">
                      Infirmier(e) Diplômé(e) d'État
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedNurse(nurse)}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Fiche IDEL</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Detail Modal */}
      <DoctorDetailModal
        doctor={selectedDoctor}
        isOpen={Boolean(selectedDoctor)}
        onClose={() => setSelectedDoctor(null)}
        patients={patients}
        onViewPatientDossier={onViewPatientDossier}
        onUpdateDoctor={onUpdateDoctor}
      />

      {/* Nurse Detail Modal */}
      {selectedNurse && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSelectedNurse(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-teal-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-lg">Fiche Infirmier(e)</h3>
              </div>
              <button
                onClick={() => setSelectedNurse(null)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedNurse.avatarUrl}
                  alt={selectedNurse.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-300 shadow-xs"
                />
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedNurse.name}</h4>
                  <p className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md inline-block mt-0.5">
                    {selectedNurse.role}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <p className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Téléphone :</span>
                  <span className="font-bold text-slate-900">{selectedNurse.phone}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Email :</span>
                  <span className="font-semibold text-slate-900">{selectedNurse.email || 'N/A'}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">N° RPPS :</span>
                  <span className="font-mono text-slate-900">{selectedNurse.rppsNumber || 'N/A'}</span>
                </p>
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-500 block mb-1">Domaines d'expertise :</span>
                  <p className="text-slate-800 font-medium">{selectedNurse.specialities}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedNurse(null)}
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal (Doctor or Nurse) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />

          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className={`p-5 text-white flex justify-between items-center ${addType === 'DOCTOR' ? 'bg-[#006591]' : 'bg-teal-800'}`}>
              <div className="flex items-center gap-2.5">
                {addType === 'DOCTOR' ? <Stethoscope className="w-5 h-5 text-sky-300" /> : <User className="w-5 h-5 text-teal-300" />}
                <h3 className="font-bold text-lg">
                  {addType === 'DOCTOR' ? 'Ajouter un nouveau médecin' : 'Ajouter un nouvel infirmier'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nom & Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={addType === 'DOCTOR' ? 'Ex: Dr. Martin Dupont' : 'Ex: Claire D.'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {addType === 'DOCTOR' ? 'Spécialité' : 'Rôle IDEL'}
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    placeholder={addType === 'DOCTOR' ? 'Médecin Généraliste' : 'IDEL Collaborateur'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contact@soins.fr"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              {/* Adresse du cabinet ONLY FOR DOCTOR */}
              {addType === 'DOCTOR' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Adresse du cabinet
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="15 Rue de la Paix, 44000 Nantes"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  N° RPPS / ADELI
                </label>
                <input
                  type="text"
                  value={rppsNumber}
                  onChange={e => setRppsNumber(e.target.value)}
                  placeholder="10100987654"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {addType === 'DOCTOR' ? 'Notes / Remarques' : 'Spécialités de soins'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={addType === 'DOCTOR' ? 'Consulation sans RDV le jeudi...' : 'Plaies complexes, Diabète, Perfusions...'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl text-sm font-semibold shadow-sm cursor-pointer ${
                    addType === 'DOCTOR' ? 'bg-[#006591] hover:bg-[#004c6e]' : 'bg-teal-800 hover:bg-teal-900'
                  }`}
                >
                  {addType === 'DOCTOR' ? 'Ajouter le Médecin' : 'Ajouter l\'Infirmier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
