import React, { useState } from 'react';
import { Patient, Doctor } from '../types';
import { EditPatientModal } from '../components/EditPatientModal';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Mic, 
  Plus, 
  Sun, 
  Sunset, 
  Info, 
  Stethoscope, 
  CheckCircle2, 
  PlayCircle,
  FileText,
  Clock,
  Edit,
  Sparkles
} from 'lucide-react';

interface PatientDetailViewProps {
  patient: Patient;
  onBack: () => void;
  onStartVoice: (patient: Patient) => void;
  onOpenNewCareNote: (patientId: string) => void;
  onOpenDoctorInfo?: (doctorName: string) => void;
  onUpdatePatient?: (updatedPatient: Patient) => void;
  doctors?: Doctor[];
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  onBack,
  onStartVoice,
  onOpenNewCareNote,
  onOpenDoctorInfo,
  onUpdatePatient,
  doctors = []
}) => {
  const [selectedTimelineDate, setSelectedTimelineDate] = useState<string>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const getFormattedNextVisit = (nextVisitTime: string) => {
    if (!nextVisitTime) return "Aujourd'hui";
    if (nextVisitTime.includes(',')) {
      return nextVisitTime.split(',')[0].trim();
    }
    if (/^\d{1,2}:\d{2}$/.test(nextVisitTime.trim())) {
      return "Aujourd'hui";
    }
    return nextVisitTime;
  };

  const getFormattedVisitHeading = (dateStr: string, author: string) => {
    let dayPart = dateStr.includes(',') ? dateStr.split(',')[0].trim() : dateStr.trim();
    return `${dayPart} - ${author}`;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer text-[#006591]"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#006591]">Dossier Patient</h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Historique des soins & DAR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs md:text-sm rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            title="Modifier les informations du patient"
          >
            <Edit className="w-4 h-4 text-[#006591]" />
            <span>Modifier Dossier</span>
          </button>
          <button
            onClick={() => onOpenNewCareNote(patient.id)}
            className="px-4 py-2 bg-[#006591] hover:bg-[#004c6e] text-white font-semibold text-xs md:text-sm rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Note DAR</span>
          </button>
        </div>
      </div>

      {/* Patient Header Summary Card */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5 w-full">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-sky-300 shrink-0 shadow-sm">
            <img 
              src={patient.photoUrl} 
              alt={patient.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-800">{patient.name}</h2>
                {patient.pathologyBadge && (
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold uppercase">
                    {patient.pathologyBadge}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold text-[#006591] bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Éditer infos</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8 mt-2 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase block">Âge</span>
                <span className="font-bold text-slate-700 text-sm">{patient.age} ans</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase block">Prochaine visite</span>
                <span className="font-bold text-[#006591] text-sm">{getFormattedNextVisit(patient.nextVisitTime)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase block">Fréquence soins</span>
                <span className="font-bold text-slate-700 text-sm">{patient.visitFrequency || '1x / Jour'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase block">Médecin Traitant</span>
                <button
                  type="button"
                  onClick={() => onOpenDoctorInfo && onOpenDoctorInfo(patient.doctor)}
                  className="font-bold text-[#006591] text-sm hover:underline flex items-center gap-1 cursor-pointer"
                  title="Voir la fiche du médecin"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-[#006591]" />
                  <span>{patient.doctor}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chronological DAR Log & Timeline Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Care Calendar Navigation */}
        <aside className="lg:col-span-3 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Calendrier des soins
          </h3>
          <div className="flex overflow-x-auto whitespace-nowrap lg:flex-col gap-1.5 pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedTimelineDate('all')}
              className={`flex items-center justify-between p-3 rounded-xl text-left font-semibold text-xs transition-all cursor-pointer shrink-0 ${
                selectedTimelineDate === 'all'
                  ? 'bg-[#0ea5e9] text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span>Toutes les dates</span>
            </button>
            {patient.observationsHistory.map((obs) => (
              <button
                key={obs.id}
                onClick={() => setSelectedTimelineDate(obs.id)}
                className={`flex items-center justify-between p-3 rounded-xl text-left font-semibold text-xs transition-all cursor-pointer shrink-0 ${
                  selectedTimelineDate === obs.id
                    ? 'bg-[#0ea5e9] text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{obs.date}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Right: DAR Observations Log */}
        <main className="lg:col-span-9 space-y-6">
          <div className="relative pl-6 border-l-2 border-[#006591]/30 space-y-6">
            {patient.observationsHistory
              .filter(obs => selectedTimelineDate === 'all' || selectedTimelineDate === obs.id)
              .map((obs) => (
                <div key={obs.id} className="relative space-y-3">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#006591] ring-4 ring-slate-100" />
                  
                  <h3 className="text-base font-bold text-slate-800">
                    {getFormattedVisitHeading(obs.date, obs.author)}
                  </h3>

                  {/* DAR Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span>Visite effectuée par {obs.author}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      {/* D: Données */}
                      <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                        <div className="flex items-center gap-1.5 text-[#006591] font-bold text-xs uppercase tracking-wider">
                          <Info className="w-4 h-4" />
                          <span>D (Données)</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          {obs.donnees}
                        </p>
                      </div>

                      {/* A: Actions */}
                      <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                        <div className="flex items-center gap-1.5 text-[#006591] font-bold text-xs uppercase tracking-wider">
                          <Stethoscope className="w-4 h-4" />
                          <span>A (Actions)</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          {obs.actions}
                        </p>
                      </div>

                      {/* R: Résultats */}
                      <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                        <div className="flex items-center gap-1.5 text-[#006591] font-bold text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>R (Résultats)</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          {obs.resultats}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </main>
      </div>

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={patient}
        onUpdatePatient={(updated) => {
          if (onUpdatePatient) {
            onUpdatePatient(updated);
          }
        }}
        doctors={doctors}
      />
    </div>
  );
};
