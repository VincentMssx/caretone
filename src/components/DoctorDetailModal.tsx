import React, { useState } from 'react';
import { Doctor, Patient } from '../types';
import { X, Phone, Mail, MapPin, FileText, UserCheck, Stethoscope, Edit2, Save, User } from 'lucide-react';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onViewPatientDossier?: (patientId: string) => void;
  onUpdateDoctor?: (updatedDoctor: Doctor) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  isOpen,
  onClose,
  patients,
  onViewPatientDossier,
  onUpdateDoctor
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Doctor | null>(doctor);

  React.useEffect(() => {
    setEditForm(doctor);
    setIsEditing(false);
  }, [doctor]);

  if (!isOpen || !doctor) return null;

  const assignedPatients = patients.filter(
    p => p.doctor && p.doctor.toLowerCase().includes(doctor.name.toLowerCase().replace('dr.', '').trim())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm && onUpdateDoctor) {
      onUpdateDoctor(editForm);
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#006591] to-[#0ea5e9] text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{doctor.name}</h3>
              <p className="text-xs text-sky-100 font-medium">{doctor.specialty || 'Médecin'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
              title="Modifier la fiche"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-[#f7f9fb]">
          {isEditing && editForm ? (
            <form onSubmit={handleSave} className="bg-white p-5 rounded-2xl border border-sky-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-[#006591] uppercase tracking-wider">Modifier la fiche médecin</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom du Médecin</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Spécialité</label>
                  <input
                    type="text"
                    value={editForm.specialty}
                    onChange={e => setEditForm({...editForm, specialty: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adresse du cabinet</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={e => setEditForm({...editForm, address: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">N° RPPS / ADELI</label>
                  <input
                    type="text"
                    value={editForm.rppsNumber || ''}
                    onChange={e => setEditForm({...editForm, rppsNumber: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Horaires de garde</label>
                  <textarea
                    rows={2}
                    value={editForm.notes || ''}
                    onChange={e => setEditForm({...editForm, notes: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006591] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Téléphone Cabinet</span>
                  <a 
                    href={`tel:${doctor.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 text-sm font-bold text-[#006591] hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{doctor.phone || 'Non renseigné'}</span>
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Email Professionnel</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{doctor.email || 'Non renseigné'}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1 pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Adresse du Cabinet</span>
                  <div className="flex items-start gap-2 text-sm font-semibold text-slate-800">
                    <MapPin className="w-4 h-4 text-[#006591] shrink-0 mt-0.5" />
                    <span>{doctor.address || 'Non renseignée'}</span>
                  </div>
                </div>

                {doctor.rppsNumber && (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">N° RPPS / ADELI</span>
                    <p className="text-sm font-bold text-slate-800">{doctor.rppsNumber}</p>
                  </div>
                )}

                {doctor.notes && (
                  <div className="sm:col-span-2 space-y-1 pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Notes & Consignes</span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                      {doctor.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Linked Patients List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#006591]" />
                <span>Patients pris en charge ({assignedPatients.length})</span>
              </h4>
            </div>

            {assignedPatients.length === 0 ? (
              <p className="text-xs text-slate-500 bg-white p-4 rounded-xl border border-slate-200 italic">
                Aucun patient du cabinet actuellement rattaché à ce médecin.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignedPatients.map(p => (
                  <div
                    key={p.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between hover:border-[#006591] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{p.name}</h5>
                        <p className="text-[11px] text-slate-500">{p.careSummary}</p>
                      </div>
                    </div>
                    {onViewPatientDossier && (
                      <button
                        onClick={() => {
                          onClose();
                          onViewPatientDossier(p.id);
                        }}
                        className="p-2 bg-sky-50 text-[#006591] hover:bg-sky-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="Voir le dossier patient"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
