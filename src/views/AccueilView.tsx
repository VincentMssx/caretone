import React, { useState } from 'react';
import { Patient, MedicalAlert, NavView } from '../types';
import { 
  Search, 
  Clock,
  ChevronRight
} from 'lucide-react';

interface AccueilViewProps {
  patients: Patient[];
  alerts: MedicalAlert[];
  onSelectPatient: (patient: Patient) => void;
  onNavigate: (view: NavView) => void;
  onStartVoiceTransmission: () => void;
  onOpenNewCare: () => void;
}

export const AccueilView: React.FC<AccueilViewProps> = ({
  patients,
  onSelectPatient,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.careSummary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Search Input */}
      <section className="relative w-full">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un patient, un soin ou une pathologie..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#006591] outline-none shadow-sm text-sm text-slate-800 placeholder:text-slate-400"
        />
      </section>

      {/* Calendrier de la Tournée */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#006591]" />
            <h2 className="text-lg font-bold text-slate-800">Calendrier de la Tournée du Jour</h2>
          </div>
          <button
            onClick={() => onNavigate('patients')}
            className="text-xs font-semibold text-[#006591] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Voir tous les patients</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative border-l-2 border-slate-200 ml-3 space-y-4">
          {filteredPatients.map((patient) => {
            return (
              <div key={patient.id} className="relative pl-6">
                <div 
                  className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full ring-4 ring-white bg-slate-300" 
                />
                
                <div 
                  onClick={() => onSelectPatient(patient)}
                  className="p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center bg-slate-50/60 border-slate-200 hover:bg-slate-100/60"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-500">
                      {patient.nextVisitTime}
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm">{patient.name}</h3>
                    <p className="text-xs text-slate-600">{patient.careSummary}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {patient.pathologyBadge && (
                      <span className="hidden sm:inline-block px-2.5 py-1 bg-sky-100 text-[#006591] rounded-full text-xs font-medium">
                        {patient.pathologyBadge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
