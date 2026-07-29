import React, { useState, useEffect, useMemo } from 'react';
import { 
  Patient, 
  Tournee, 
  TourneeAssignment, 
  DEFAULT_TOURNESS, 
  INITIAL_MATRIX_PATIENTS 
} from '../types/tourneeMatrix';
import { CareNotePopover } from './CareNotePopover';
import { 
  Search, 
  Plus, 
  Check, 
  X, 
  User, 
  MapPin, 
  AlertTriangle, 
  Link2, 
  Layers, 
  Calendar, 
  Clock, 
  Sparkles, 
  LayoutGrid, 
  Kanban, 
  Trash2, 
  RotateCcw, 
  FileEdit,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';

const STORAGE_KEY_PATIENTS = 'caretone_matrix_patients_v2';

interface TourneeMatrixGridProps {
  onInspectPatient?: (patientName: string) => void;
  onSuccessToast?: (msg: string) => void;
}

export const TourneeMatrixGrid: React.FC<TourneeMatrixGridProps> = ({
  onInspectPatient,
  onSuccessToast
}) => {
  // Tournees Columns configuration
  const tourneesList: Tournee[] = DEFAULT_TOURNESS;

  // Patients & Assignments state
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PATIENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load matrix patients from localStorage', e);
    }
    return INITIAL_MATRIX_PATIENTS;
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNASSIGNED' | 'MULTI'>('ALL');

  // Popover State
  const [activePopover, setActivePopover] = useState<{
    isOpen: boolean;
    patientId: string;
    patientName: string;
    tourneeId: string;
    tourneeName: string;
    initialNote?: string;
    initialSequenceOrder?: number;
    assignmentId?: string;
  }>({
    isOpen: false,
    patientId: '',
    patientName: '',
    tourneeId: '',
    tourneeName: ''
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (onSuccessToast) onSuccessToast(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist local state changes & option API sync
  const savePatientsState = (updatedPatients: Patient[]) => {
    setPatients(updatedPatients);
    try {
      localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(updatedPatients));
    } catch (e) {
      console.error('Failed to save matrix patients', e);
    }
  };

  // Sync state via API endpoint `/api/tournees/assignments`
  const syncWithApi = async (action: string, payload: any) => {
    try {
      const res = await fetch('/api/tournees/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
      });
      if (!res.ok) {
        console.warn('API sync returned non-OK status');
      }
    } catch (err) {
      console.error('Failed to sync assignment with API:', err);
    }
  };

  // Helper: Toggle Assignment (Add if missing, remove if existing)
  const handleToggleAssignment = (patientId: string, tourneeId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const tournee = tourneesList.find(t => t.id === tourneeId);
    const existingIndex = patient.assignments.findIndex(a => a.tourneeId === tourneeId);

    let updatedPatients: Patient[];

    if (existingIndex >= 0) {
      // Unassign
      const updatedAssignments = patient.assignments.filter(a => a.tourneeId !== tourneeId);
      updatedPatients = patients.map(p => p.id === patientId ? { ...p, assignments: updatedAssignments } : p);
      savePatientsState(updatedPatients);
      showToast(`Passage ${tournee?.name || tourneeId} retiré pour ${patient.fullName}`);
      syncWithApi('UNASSIGN', { patientId, tourneeId });
    } else {
      // Assign
      const newAssignment: TourneeAssignment = {
        id: `asg-${patientId}-${tourneeId}-${Date.now()}`,
        patientId,
        tourneeId,
        sequenceOrder: patient.assignments.length + 1,
        careNote: ''
      };

      const updatedAssignments = [...patient.assignments, newAssignment];
      updatedPatients = patients.map(p => p.id === patientId ? { ...p, assignments: updatedAssignments } : p);
      savePatientsState(updatedPatients);
      showToast(`✓ ${patient.fullName} assigné(e) à ${tournee?.name || tourneeId}`);
      syncWithApi('ASSIGN', { patientId, tourneeId, assignment: newAssignment });
    }
  };

  // Helper: Save Note from Popover
  const handleSaveCareNote = (careNote: string, sequenceOrder?: number) => {
    const { patientId, tourneeId } = activePopover;
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const existingIndex = patient.assignments.findIndex(a => a.tourneeId === tourneeId);
    let updatedAssignments: TourneeAssignment[];

    if (existingIndex >= 0) {
      updatedAssignments = patient.assignments.map(a => 
        a.tourneeId === tourneeId 
          ? { ...a, careNote, sequenceOrder: sequenceOrder || a.sequenceOrder } 
          : a
      );
    } else {
      updatedAssignments = [
        ...patient.assignments,
        {
          id: `asg-${patientId}-${tourneeId}-${Date.now()}`,
          patientId,
          tourneeId,
          sequenceOrder: sequenceOrder || 1,
          careNote
        }
      ];
    }

    const updatedPatients = patients.map(p => p.id === patientId ? { ...p, assignments: updatedAssignments } : p);
    savePatientsState(updatedPatients);
    showToast(`Note de soin enregistrée pour ${patient.fullName}`);
    syncWithApi('UPDATE_NOTE', { patientId, tourneeId, careNote, sequenceOrder });
  };

  // Helper: Unassign from Popover
  const handleUnassignFromPopover = () => {
    const { patientId, tourneeId } = activePopover;
    handleToggleAssignment(patientId, tourneeId);
  };

  // Helper: Open Care Note Popover
  const handleOpenNotePopover = (patient: Patient, tournee: Tournee, assignment?: TourneeAssignment) => {
    setActivePopover({
      isOpen: true,
      patientId: patient.id,
      patientName: patient.fullName,
      tourneeId: tournee.id,
      tourneeName: tournee.name,
      initialNote: assignment?.careNote || '',
      initialSequenceOrder: assignment?.sequenceOrder || 1,
      assignmentId: assignment?.id
    });
  };

  // Helper: Clear All Assignments for a Patient
  const handleClearAllAssignments = (patientId: string, patientName: string) => {
    const updatedPatients = patients.map(p => p.id === patientId ? { ...p, assignments: [] } : p);
    savePatientsState(updatedPatients);
    showToast(`Toutes les affectations de ${patientName} ont été effacées.`);
    syncWithApi('CLEAR_ALL', { patientId });
  };

  // Reset to Demo initial state
  const handleResetDemoData = () => {
    savePatientsState(INITIAL_MATRIX_PATIENTS);
    showToast("Matrice de tournée réinitialisée aux données de démonstration.");
  };

  // Computed Counters
  const totalPatientsCount = patients.length;
  const unassignedCount = useMemo(() => patients.filter(p => p.assignments.length === 0).length, [patients]);
  const multiPassageCount = useMemo(() => patients.filter(p => p.assignments.length >= 2).length, [patients]);

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchSearch = 
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchSearch) return false;

      if (activeFilter === 'UNASSIGNED') {
        return p.assignments.length === 0;
      }
      if (activeFilter === 'MULTI') {
        return p.assignments.length >= 2;
      }
      return true;
    });
  }, [patients, searchTerm, activeFilter]);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-sky-400/40 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-[#006591] via-[#004c6e] to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-300 bg-sky-950/70 px-3 py-1 rounded-lg border border-sky-500/30">
                Planification IDEL
              </span>
              <span className="text-xs font-bold text-sky-100 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" /> Grille Multi-Passages
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Matrice d'Affectation des Tournées
            </h1>
            <p className="text-xs text-sky-100/80">
              Assignez chaque patient à plusieurs passages dans la journée (Matin, Soir, Cabinet) sur une seule ligne.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH AND QUICK FILTER BADGES BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un patient par nom ou adresse..."
              className="w-full text-xs sm:text-sm pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#006591] focus:ring-2 focus:ring-sky-100 outline-none transition-all font-medium text-slate-800"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Action Reset */}
          <button
            onClick={handleResetDemoData}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Réinitialiser la matrice de démo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Réinitialiser Démo</span>
          </button>
        </div>

        {/* Quick Filter Badges */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#006591]" /> Filtrer par statut :
          </span>

          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
              activeFilter === 'ALL'
                ? 'bg-[#006591] text-white border-[#006591] shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Tous les patients ({totalPatientsCount})
          </button>

          <button
            onClick={() => setActiveFilter('UNASSIGNED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border ${
              activeFilter === 'UNASSIGNED'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>⚠️ Non assignés ({unassignedCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('MULTI')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border ${
              activeFilter === 'MULTI'
                ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-purple-600" />
            <span>🔗 Multi-passages ({multiPassageCount})</span>
          </button>
        </div>
      </div>

      {/* MATRIX TABLE STRUCTURE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800 text-xs font-black uppercase tracking-wider">
                <th className="p-4 w-[280px] min-w-[240px]">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-400" />
                    <span>Patient (Nom & Adresse)</span>
                  </div>
                </th>
                {tourneesList.map((t) => {
                  const assignedCount = patients.filter(p => p.assignments.some(a => a.tourneeId === t.id)).length;
                  return (
                    <th key={t.id} className="p-4 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${
                            t.id === 'MATIN' ? 'text-amber-400' : t.id === 'SOIR' ? 'text-indigo-400' : 'text-emerald-400'
                          }`} />
                          <div>
                            <div>{t.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium normal-case">
                              {t.timeSlot}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[10px] font-black border border-slate-700">
                          {assignedCount}
                        </span>
                      </div>
                    </th>
                  );
                })}
                <th className="p-4 w-[180px] text-center">
                  <span>Statut du Jour & Actions</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-medium space-y-2">
                    <p>Aucun patient ne correspond aux critères de recherche actuels.</p>
                    <button
                      onClick={() => { setSearchTerm(''); setActiveFilter('ALL'); }}
                      className="text-xs font-bold text-[#006591] hover:underline"
                    >
                      Effacer tous les filtres
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const assignmentCount = patient.assignments.length;
                  const isUnassigned = assignmentCount === 0;
                  const isMulti = assignmentCount >= 2;

                  return (
                    <tr 
                      key={patient.id} 
                      className={`hover:bg-sky-50/40 transition-colors ${
                        isUnassigned ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Cell 1: Patient Info */}
                      <td className="p-4 font-semibold text-slate-900 border-r border-slate-100">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <button
                              onClick={() => onInspectPatient && onInspectPatient(patient.fullName)}
                              className="font-black text-sm text-slate-900 hover:text-[#006591] text-left hover:underline cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{patient.fullName}</span>
                            </button>

                            {/* Status Badge */}
                            {isUnassigned && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600" /> Non assigné
                              </span>
                            )}
                            {assignmentCount === 1 && (
                              <span className="px-2 py-0.5 rounded-md bg-sky-100 text-[#006591] text-[10px] font-black">
                                1 Passage
                              </span>
                            )}
                            {isMulti && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-black flex items-center gap-1">
                                <Link2 className="w-3 h-3 text-purple-600" /> {assignmentCount} Passages
                              </span>
                            )}
                          </div>

                          {patient.address && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-normal truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{patient.address}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Cells 2..4: Tournee Slots */}
                      {tourneesList.map((t) => {
                        const assignment = patient.assignments.find(a => a.tourneeId === t.id);
                        const isAssigned = !!assignment;

                        return (
                          <td 
                            key={t.id} 
                            className="p-3 border-r border-slate-100 align-top"
                          >
                            {!isAssigned ? (
                              // NOT ASSIGNED SLOT BUTTON
                              <button
                                onClick={() => handleToggleAssignment(patient.id, t.id)}
                                className={`w-full py-2.5 px-3 rounded-2xl border border-dashed transition-all flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer group ${
                                  t.id === 'MATIN'
                                    ? 'border-amber-300/80 bg-amber-50/20 hover:bg-amber-100/60 text-amber-800'
                                    : t.id === 'SOIR'
                                    ? 'border-indigo-300/80 bg-indigo-50/20 hover:bg-indigo-100/60 text-indigo-800'
                                    : 'border-emerald-300/80 bg-emerald-50/20 hover:bg-emerald-100/60 text-emerald-800'
                                }`}
                              >
                                <Plus className="w-4 h-4 opacity-70 group-hover:scale-110 transition-transform" />
                                <span>+ {t.name.replace('Tournée ', '')}</span>
                              </button>
                            ) : (
                              // ASSIGNED ACTIVE SLOT BADGE
                              <div
                                onClick={() => handleOpenNotePopover(patient, t, assignment)}
                                className={`p-2.5 rounded-2xl border transition-all shadow-2xs space-y-1.5 cursor-pointer hover:shadow-md relative group ${
                                  t.id === 'MATIN'
                                    ? 'bg-gradient-to-br from-amber-50 to-amber-100/70 border-amber-300 text-amber-950'
                                    : t.id === 'SOIR'
                                    ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/70 border-indigo-300 text-indigo-950'
                                    : 'bg-gradient-to-br from-emerald-50 to-emerald-100/70 border-emerald-300 text-emerald-950'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-extrabold text-xs flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                    <span>{t.name.replace('Tournée ', '')}</span>
                                    {assignment.sequenceOrder && (
                                      <span className="bg-white/80 px-1.5 py-0.5 rounded-md text-[10px] font-black text-slate-800 border border-slate-200">
                                        #{assignment.sequenceOrder}
                                      </span>
                                    )}
                                  </span>

                                  {/* Small Unassign X button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleAssignment(patient.id, t.id);
                                    }}
                                    className="p-1 hover:bg-rose-200 text-slate-500 hover:text-rose-800 rounded-lg transition-colors cursor-pointer"
                                    title="Retirer de cette tournée"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Care Note Snippet */}
                                <div className="text-[11px] font-medium leading-tight text-slate-700 flex items-start gap-1">
                                  <FileEdit className="w-3 h-3 text-[#006591] shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">
                                    {assignment.careNote || <span className="italic opacity-60">Ajouter note de soin...</span>}
                                  </span>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Cell 5: Statut du Jour & Actions */}
                      <td className="p-3 text-center align-middle">
                        <div className="flex flex-col items-center gap-2">
                          {isUnassigned ? (
                            <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-xl">
                              À planifier
                            </span>
                          ) : (
                            <div className="flex flex-wrap justify-center gap-1">
                              {patient.assignments.map(a => {
                                const tournee = tourneesList.find(t => t.id === a.tourneeId);
                                return (
                                  <span key={a.id} className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                                    {tournee?.name.replace('Tournée ', '')}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {!isUnassigned && (
                            <button
                              onClick={() => handleClearAllAssignments(patient.id, patient.fullName)}
                              className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
                              title="Effacer toutes les affectations"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Vider</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CARE NOTE POPOVER MODAL */}
      <CareNotePopover
        isOpen={activePopover.isOpen}
        onClose={() => setActivePopover(prev => ({ ...prev, isOpen: false }))}
        patientName={activePopover.patientName}
        tourneeName={activePopover.tourneeName}
        initialNote={activePopover.initialNote}
        initialSequenceOrder={activePopover.initialSequenceOrder}
        onSave={handleSaveCareNote}
        onUnassign={handleUnassignFromPopover}
      />
    </div>
  );
};
