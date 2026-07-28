import React from 'react';
import { Patient } from '../types';
import { 
  X, 
  Edit, 
  Printer, 
  AlertTriangle, 
  ShieldAlert, 
  PlayCircle, 
  Mic, 
  FileText,
  Clock,
  Phone,
  UserCheck,
  Stethoscope
} from 'lucide-react';

interface PatientDrawerProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullDossier: (patientId: string) => void;
  onStartVoiceForPatient: (patient: Patient) => void;
  onOpenDoctorInfo?: (doctorName: string) => void;
}

export const PatientDrawer: React.FC<PatientDrawerProps> = ({
  patient,
  isOpen,
  onClose,
  onViewFullDossier,
  onStartVoiceForPatient,
  onOpenDoctorInfo
}) => {
  if (!patient || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-10 w-full sm:w-[480px] md:w-[520px] bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-[#0ea5e9] text-white">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold">Fiche Patient</h2>
          </div>
          <div className="flex items-center gap-1">
            <button 
              title="Modifier" 
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              title="Imprimer" 
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f7f9fb]">
          {/* Patient Profile Card */}
          <section className="flex flex-col items-center text-center gap-3 py-4 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md relative">
              <img 
                src={patient.photoUrl} 
                alt={patient.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{patient.name}</h3>
              <p className="text-sm text-slate-500 mt-0.5">Né le {patient.birthDate} ({patient.age} ans)</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                  Groupe {patient.bloodType}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                  N° {patient.secuNumber}
                </span>
              </div>
            </div>

            <div className="w-full border-t border-slate-100 pt-3 mt-1 flex justify-around text-xs text-slate-600">
              <button
                type="button"
                onClick={() => onOpenDoctorInfo && onOpenDoctorInfo(patient.doctor)}
                className="flex items-center gap-1.5 font-bold text-[#006591] hover:underline cursor-pointer"
                title="Voir la fiche du médecin"
              >
                <Stethoscope className="w-3.5 h-3.5 text-[#006591]" />
                <span>{patient.doctor}</span>
              </button>
              <a href={`tel:${patient.phone.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 hover:underline font-semibold">
                <Phone className="w-3.5 h-3.5 text-[#006591]" />
                <span>{patient.phone}</span>
              </a>
            </div>
          </section>

          {/* Points d'attention */}
          <section className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Points d'attention</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {patient.warnings.map((warning, idx) => (
                <span 
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                    warning.toLowerCase().includes('allergie')
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {warning}
                </span>
              ))}
            </div>
          </section>

          {/* History Timeline */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Historique & Timeline
              </h4>
              <button
                onClick={() => onViewFullDossier(patient.id)}
                className="text-xs font-semibold text-[#006591] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Voir dossier complet</span>
              </button>
            </div>

            <div className="relative border-l-2 border-slate-200 ml-3 space-y-4">
              {patient.observationsHistory.map((obs) => (
                <div key={obs.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#006591] ring-4 ring-white" />
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#006591]">{obs.date}</span>
                      <span className="text-slate-400 italic">Par {obs.author}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Observation (DAR)</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{obs.donnees}</p>
                    </div>
                    {obs.actions && (
                      <p className="text-xs text-slate-600"><span className="font-semibold text-slate-700">Actions :</span> {obs.actions}</p>
                    )}
                    {obs.resultats && (
                      <p className="text-xs text-slate-600"><span className="font-semibold text-slate-700">Résultat :</span> {obs.resultats}</p>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <button className="text-xs text-[#006591] bg-sky-50 hover:bg-sky-100 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer">
                        <PlayCircle className="w-4 h-4 text-[#006591]" />
                        <span>Écouter transmission</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
          <button
            onClick={() => onStartVoiceForPatient(patient)}
            className="flex-1 py-3 bg-[#006591] hover:bg-[#004c6e] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>Enregistrer une transmission</span>
          </button>
        </div>
      </div>
    </div>
  );
};
