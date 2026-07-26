import React, { useState } from 'react';
import { Patient, NavView } from '../types';
import { PageVoiceMicButton } from '../components/PageVoiceMicButton';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List as ListIcon, 
  UserPlus, 
  Plus,
  ChevronDown, 
  Mic, 
  Phone, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

interface PatientsViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onViewDossier: (patientId: string) => void;
  onOpenAddPatient: () => void;
  onStartVoice: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onSelectPatient,
  onViewDossier,
  onOpenAddPatient,
  onStartVoice
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'tous' | 'tournee' | 'critique'>('tous');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.careSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'critique') {
      return matchesSearch && patient.warnings.length > 0;
    }
    return matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, pathologie ou adresse..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Filter Chips */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveFilter('tous')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'tous' ? 'bg-white text-[#006591] shadow-xs' : 'text-slate-600'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveFilter('critique')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'critique' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Points Vigilance
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#006591] shadow-xs' : 'text-slate-500'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-[#006591] shadow-xs' : 'text-slate-500'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Add Patient Button */}
          <button
            onClick={onOpenAddPatient}
            className="flex items-center gap-1.5 bg-[#006591] hover:bg-[#004c6e] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:shadow-lg transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={patient.photoUrl}
                    alt={patient.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-[#006591] transition-colors truncate">
                    {patient.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Né le {patient.birthDate} ({patient.age} ans)
                  </p>
                  {patient.pathologyBadge && (
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-sky-100 text-[#006591] rounded-full text-[11px] font-bold">
                      {patient.pathologyBadge}
                    </span>
                  )}
                </div>
              </div>

              {/* Care Summary Box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-xs text-slate-700 font-medium">
                  {patient.careSummary}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/50 pt-2">
                  <span className="flex items-center gap-1 font-semibold text-[#006591]">
                    <Clock className="w-3.5 h-3.5" />
                    {patient.nextVisitTime}
                  </span>
                  <span>Freq: {patient.visitFrequency}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onSelectPatient(patient)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Fiche Rapide
                </button>
                <button
                  onClick={() => onViewDossier(patient.id)}
                  className="flex-1 py-2 px-3 bg-[#006591] hover:bg-[#004c6e] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Dossier</span>
                </button>
              </div>
            </div>
          ))}

          {/* Add New Patient Card Trigger */}
          <button
            onClick={onOpenAddPatient}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 hover:border-[#006591] transition-all group min-h-[220px] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#006591] group-hover:text-white transition-colors text-slate-500">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800 text-sm">Ajouter un nouveau patient</p>
              <p className="text-xs text-slate-500 mt-0.5">Créer une fiche de soins complète</p>
            </div>
          </button>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-200">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <img src={patient.photoUrl} alt={patient.name} className="w-12 h-12 rounded-full object-cover border" />
                  <div>
                    <h4 className="font-bold text-slate-800">{patient.name}</h4>
                    <p className="text-xs text-slate-500">{patient.careSummary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#006591] font-semibold">{patient.nextVisitTime}</span>
                  <button onClick={() => onViewDossier(patient.id)} className="px-3 py-1.5 bg-[#006591] text-white rounded-lg text-xs font-semibold">
                    Voir Dossier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page Voice Mic Button */}
      <PageVoiceMicButton
        pageTitle="Patients & Fiches de soins"
        placeholderExamples={[
          "Rechercher le patient Martin",
          "Filtrer sur les points de vigilance",
          "Ajouter le patient Pierre Durand"
        ]}
        onVoiceCommand={(cmd) => {
          setSearchQuery(cmd);
        }}
      />
    </div>
  );
};
