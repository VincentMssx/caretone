import React, { useState, useEffect } from 'react';
import { Patient, Doctor } from '../types';
import { X, Save, User, Stethoscope, AlertTriangle, FileText, Phone, MapPin, Calendar, Activity } from 'lucide-react';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onUpdatePatient: (updatedPatient: Patient) => void;
  doctors?: Doctor[];
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onUpdatePatient,
  doctors = []
}) => {
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [warningsText, setWarningsText] = useState<string>('');

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        birthDate: patient.birthDate || '',
        age: patient.age || 0,
        secuNumber: patient.secuNumber || '',
        bloodType: patient.bloodType || 'A+',
        address: patient.address || '',
        phone: patient.phone || '',
        doctor: patient.doctor || '',
        pathologyBadge: patient.pathologyBadge || '',
        careSummary: patient.careSummary || '',
        nextVisitTime: patient.nextVisitTime || '',
        visitFrequency: patient.visitFrequency || '1x / Jour',
        status: patient.status || 'active'
      });
      setWarningsText(patient.warnings ? patient.warnings.join(', ') : '');
    }
  }, [patient, isOpen]);

  if (!isOpen || !patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const parsedWarnings = warningsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const updated: Patient = {
      ...patient,
      name: formData.name || patient.name,
      birthDate: formData.birthDate || patient.birthDate,
      age: Number(formData.age) || patient.age,
      secuNumber: formData.secuNumber || patient.secuNumber,
      bloodType: formData.bloodType || patient.bloodType,
      address: formData.address || patient.address,
      phone: formData.phone || patient.phone,
      doctor: formData.doctor || patient.doctor,
      pathologyBadge: formData.pathologyBadge || patient.pathologyBadge,
      careSummary: formData.careSummary || patient.careSummary,
      nextVisitTime: formData.nextVisitTime || patient.nextVisitTime,
      visitFrequency: formData.visitFrequency || patient.visitFrequency,
      warnings: parsedWarnings,
      status: formData.status as 'active' | 'archived' || patient.status
    };

    onUpdatePatient(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#006591] text-white rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Modifier les données du Patient</h2>
              <p className="text-xs text-sky-200">{patient.name} • N° {patient.secuNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Identity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nom & Prénom *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#006591] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                N° Sécurité Sociale
              </label>
              <input
                type="text"
                value={formData.secuNumber || ''}
                onChange={e => setFormData({ ...formData, secuNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:ring-2 focus:ring-[#006591] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Date de Naissance
              </label>
              <input
                type="text"
                value={formData.birthDate || ''}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                placeholder="JJ/MM/AAAA"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#006591] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Âge (ans)
              </label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#006591] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Groupe Sanguin
              </label>
              <select
                value={formData.bloodType || 'A+'}
                onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#006591] outline-none"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Téléphone</span>
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#006591] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                <span>Médecin Traitant</span>
              </label>
              <input
                type="text"
                list="doctor-options"
                value={formData.doctor || ''}
                onChange={e => setFormData({ ...formData, doctor: e.target.value })}
                placeholder="ex. Dr. Morel"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#006591] outline-none"
              />
              <datalist id="doctor-options">
                {doctors.map(d => (
                  <option key={d.id} value={d.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Adresse Domicile</span>
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#006591] outline-none"
            />
          </div>

          {/* Medical Info & Tournée details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Badge / Pathologie
              </label>
              <input
                type="text"
                value={formData.pathologyBadge || ''}
                onChange={e => setFormData({ ...formData, pathologyBadge: e.target.value })}
                placeholder="ex. Diabète T2, Pansement lourds"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#006591] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Fréquence des soins
              </label>
              <input
                type="text"
                value={formData.visitFrequency || ''}
                onChange={e => setFormData({ ...formData, visitFrequency: e.target.value })}
                placeholder="ex. 2x / Jour"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#006591] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Prochaine Visite / Passage
              </label>
              <input
                type="text"
                value={formData.nextVisitTime || ''}
                onChange={e => setFormData({ ...formData, nextVisitTime: e.target.value })}
                placeholder="ex. 08:30"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#006591] outline-none"
              />
            </div>
          </div>

          {/* Care Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Résumé du protocole de soins & Antécédents</span>
            </label>
            <textarea
              rows={3}
              value={formData.careSummary || ''}
              onChange={e => setFormData({ ...formData, careSummary: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:ring-2 focus:ring-[#006591] outline-none resize-none"
            />
          </div>

          {/* Vigilances / Warnings */}
          <div>
            <label className="block text-xs font-bold text-amber-700 uppercase mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Vigilances & Allergies (séparées par une virgule)</span>
            </label>
            <input
              type="text"
              value={warningsText}
              onChange={e => setWarningsText(e.target.value)}
              placeholder="ex. Allergie Pénicilline, Risque de chute, Diabète insulino-dépendant"
              className="w-full px-3.5 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-sm font-semibold text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#006591] hover:bg-[#004d70] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les Modifications</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
