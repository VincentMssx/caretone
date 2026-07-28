import React, { useState, useEffect } from 'react';
import { PageVoiceMicButton } from './PageVoiceMicButton';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';

const DragDropContextComp = DragDropContext as any;
const DroppableComp = Droppable as any;
const DraggableComp = Draggable as any;
import { 
  TourneePatient, 
  StatutTournee, 
  TourneeColumn,
  getStoredTourneePatients, 
  saveStoredTourneePatients,
  getStoredTourneeColumns,
  saveStoredTourneeColumns
} from '../data/mockPatients';
import { 
  Users, 
  Sun, 
  Moon, 
  HelpCircle, 
  MapPin, 
  Clock, 
  Stethoscope, 
  Map, 
  RotateCcw,
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Route
} from 'lucide-react';

interface TourneeManagerProps {
  onNavigateToRoutePlanner: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const TourneeManager: React.FC<TourneeManagerProps> = ({
  onNavigateToRoutePlanner,
  onSuccessToast
}) => {
  const [patients, setPatients] = useState<TourneePatient[]>([]);
  const [columns, setColumns] = useState<TourneeColumn[]>([]);

  // Column editing state
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');

  // New column modal/form state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnSubtitle, setNewColumnSubtitle] = useState('');

  useEffect(() => {
    const loadedPatients = getStoredTourneePatients();
    setPatients(loadedPatients);
    const loadedColumns = getStoredTourneeColumns();
    setColumns(loadedColumns);
  }, []);

  const handleSavePatients = (newPatients: TourneePatient[]) => {
    setPatients(newPatients);
    saveStoredTourneePatients(newPatients);
  };

  const handleSaveColumns = (updatedCols: TourneeColumn[]) => {
    setColumns(updatedCols);
    saveStoredTourneeColumns(updatedCols);
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    const newId = `TOURNEE_${Date.now()}`;
    const colorPresets = [
      { bgColor: 'bg-emerald-50/60', borderColor: 'border-emerald-200', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800' },
      { bgColor: 'bg-teal-50/60', borderColor: 'border-teal-200', badgeBg: 'bg-teal-100', badgeText: 'text-teal-800' },
      { bgColor: 'bg-sky-50/60', borderColor: 'border-sky-200', badgeBg: 'bg-sky-100', badgeText: 'text-sky-800' },
      { bgColor: 'bg-[#006591]/10', borderColor: 'border-[#006591]/30', badgeBg: 'bg-[#006591]/20', badgeText: 'text-[#006591]' },
      { bgColor: 'bg-purple-50/60', borderColor: 'border-purple-200', badgeBg: 'bg-purple-100', badgeText: 'text-purple-800' },
    ];
    const preset = colorPresets[columns.length % colorPresets.length];

    const newCol: TourneeColumn = {
      id: newId,
      title: newColumnTitle.trim(),
      subtitle: newColumnSubtitle.trim() || 'Tournée personnalisée',
      ...preset,
      isDeletable: true
    };

    const updated = [...columns, newCol];
    handleSaveColumns(updated);
    setNewColumnTitle('');
    setNewColumnSubtitle('');
    setIsAddingColumn(false);
    if (onSuccessToast) onSuccessToast(`Nouvelle tournée "${newCol.title}" créée avec succès !`);
  };

  const handleStartEditColumn = (col: TourneeColumn) => {
    setEditingColumnId(col.id);
    setEditTitle(col.title);
    setEditSubtitle(col.subtitle);
  };

  const handleSaveColumnEdit = (colId: string) => {
    if (!editTitle.trim()) return;
    const updated = columns.map(c => {
      if (c.id === colId) {
        return {
          ...c,
          title: editTitle.trim(),
          subtitle: editSubtitle.trim()
        };
      }
      return c;
    });
    handleSaveColumns(updated);
    setEditingColumnId(null);
    if (onSuccessToast) onSuccessToast(`Nom de la tournée mis à jour : "${editTitle.trim()}"`);
  };

  const handleDeleteColumn = (colId: string, colTitle: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la tournée "${colTitle}" ? Tous ses patients seront replacés dans "Non Assignés".`)) {
      return;
    }

    // Reassign patients in this column to 'UNASSIGNED'
    const updatedPatients = patients.map(p => {
      if (p.statutTournee === colId) {
        return { ...p, statutTournee: 'UNASSIGNED' };
      }
      return p;
    });
    handleSavePatients(updatedPatients);

    const updatedCols = columns.filter(c => c.id !== colId);
    handleSaveColumns(updatedCols);

    if (onSuccessToast) onSuccessToast(`Tournée "${colTitle}" supprimée. Patients déplacés vers Non Assignés.`);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as StatutTournee;
    const movedPatient = patients.find(p => p.id === draggableId);
    if (!movedPatient) return;

    // Filter patients per column
    const sourceColumnList: TourneePatient[] = patients
      .filter(p => p.statutTournee === source.droppableId)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    const destColumnList: TourneePatient[] = patients
      .filter(p => p.statutTournee === destination.droppableId)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    if (source.droppableId === destination.droppableId) {
      // Reorder inside same column
      const reordered = Array.from(sourceColumnList);
      const [removed] = reordered.splice(source.index, 1);
      if (removed) {
        reordered.splice(destination.index, 0, removed);
      }

      const updatedColumn: TourneePatient[] = reordered.map((item, idx) => ({
        ...item,
        orderIndex: idx
      }));

      const otherPatients = patients.filter(
        p => p.statutTournee !== source.droppableId
      );
      const updatedAll = [...otherPatients, ...updatedColumn];
      handleSavePatients(updatedAll);
    } else {
      // Move to different column
      const sourceCopy = Array.from(sourceColumnList);
      sourceCopy.splice(source.index, 1);
      const updatedSource: TourneePatient[] = sourceCopy.map((item, idx) => ({
        ...item,
        orderIndex: idx
      }));

      const destCopy = Array.from(destColumnList);
      const updatedMoved: TourneePatient = {
        ...movedPatient,
        statutTournee: newStatus
      };
      destCopy.splice(destination.index, 0, updatedMoved);
      const updatedDest: TourneePatient[] = destCopy.map((item, idx) => ({
        ...item,
        orderIndex: idx
      }));

      const otherPatients = patients.filter(
        p =>
          p.statutTournee !== source.droppableId &&
          p.statutTournee !== destination.droppableId
      );

      const updatedAll = [...otherPatients, ...updatedSource, ...updatedDest];
      handleSavePatients(updatedAll);

      if (onSuccessToast) {
        const destCol = columns.find(c => c.id === newStatus);
        const colName = destCol ? destCol.title : newStatus;
        onSuccessToast(`${movedPatient.nom} déplacé(e) vers ${colName}`);
      }
    }
  };

  const getColumnPatients = (status: StatutTournee) => {
    return patients
      .filter(p => p.statutTournee === status)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#006591]/10 text-[#006591] text-[11px] font-extrabold uppercase rounded-md tracking-wider">
              Cabinet IDEL Nantes
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">{columns.length - 1} Tournée(s) Active(s)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Tournées</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organisez l'ordre des visites, renommez vos tournées à la volée ou ajoutez de nouvelles colonnes de tournée.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddingColumn(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ajouter une Tournée</span>
          </button>

          <button
            onClick={onNavigateToRoutePlanner}
            className="flex items-center gap-2 bg-[#006591] hover:bg-[#004d70] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Map className="w-4 h-4 text-sky-300" />
            <span>Voir Carte & Trajet GPS</span>
          </button>
        </div>
      </div>

      {/* Add New Tournee Modal */}
      {isAddingColumn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddColumn} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#006591]">
                <Route className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Créer une Nouvelle Tournée</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingColumn(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom de la tournée *</label>
                <input
                  type="text"
                  placeholder="ex: Tournée 3 - Centre Est, Garde Dimanche..."
                  value={newColumnTitle}
                  onChange={e => setNewColumnTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#006591] outline-none"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Horaire</label>
                <input
                  type="text"
                  placeholder="ex: Passages après-midi (13h00 - 16h00)"
                  value={newColumnSubtitle}
                  onChange={e => setNewColumnSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#006591] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingColumn(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Créer la Tournée</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {columns.map(col => {
          const count = getColumnPatients(col.id).length;
          return (
            <div key={'summary-' + col.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-500 font-extrabold uppercase truncate">{col.title}</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">{count} patient(s)</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag & Drop Columns Grid */}
      <DragDropContextComp onDragEnd={handleDragEnd}>
        <div className={`grid grid-cols-1 ${
          columns.length === 2 ? 'md:grid-cols-2' : 
          columns.length === 3 ? 'md:grid-cols-3' : 
          'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        } gap-5`}>
          {columns.map(col => {
            const columnPatients = getColumnPatients(col.id);
            const isEditing = editingColumnId === col.id;

            return (
              <div
                key={col.id}
                className={`${col.bgColor} border ${col.borderColor} rounded-2xl p-4 flex flex-col min-h-[520px] shadow-xs relative`}
              >
                {/* Column Header */}
                <div className="pb-3 border-b border-slate-200/80 mb-3">
                  {isEditing ? (
                    <div className="space-y-2 bg-white p-2.5 rounded-xl border border-sky-300 shadow-sm">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-[#006591] uppercase">Éditer le nom</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSaveColumnEdit(col.id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                            title="Valider"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingColumnId(null)}
                            className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 cursor-pointer"
                            title="Annuler"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded focus:ring-1 focus:ring-[#006591] outline-none"
                        placeholder="Nom de la tournée..."
                      />
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={e => setEditSubtitle(e.target.value)}
                        className="w-full px-2 py-1 text-[11px] text-slate-600 border border-slate-200 rounded outline-none"
                        placeholder="Sous-titre / horaire..."
                      />
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {col.id === 'UNASSIGNED' ? (
                          <HelpCircle className="w-5 h-5 text-slate-500 shrink-0" />
                        ) : col.id === 'MATIN' ? (
                          <Sun className="w-5 h-5 text-amber-600 shrink-0" />
                        ) : col.id === 'SOIR' ? (
                          <Moon className="w-5 h-5 text-indigo-600 shrink-0" />
                        ) : (
                          <Route className="w-5 h-5 text-[#006591] shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-slate-900 truncate">{col.title}</h3>
                            <button
                              onClick={() => handleStartEditColumn(col)}
                              className="text-slate-400 hover:text-[#006591] p-0.5 rounded cursor-pointer transition-colors shrink-0"
                              title="Renommer cette tournée"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{col.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${col.badgeBg} ${col.badgeText}`}>
                          {columnPatients.length}
                        </span>
                        {col.isDeletable !== false && (
                          <button
                            onClick={() => handleDeleteColumn(col.id, col.title)}
                            className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                            title="Supprimer cette tournée"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Droppable Area */}
                <DroppableComp droppableId={col.id}>
                  {(provided: any, snapshot: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 transition-colors p-1 rounded-xl ${
                        snapshot.isDraggingOver ? 'bg-sky-100/50 border-2 border-dashed border-sky-300' : ''
                      }`}
                    >
                      {columnPatients.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200/80 rounded-xl text-slate-400 text-xs gap-1">
                          <Users className="w-6 h-6 opacity-40" />
                          <span>Aucun patient dans cette colonne</span>
                          <span className="text-[10px]">Glissez des cartes ici</span>
                        </div>
                      ) : (
                        columnPatients.map((patient, index) => (
                          <DraggableComp
                            key={patient.id}
                            draggableId={patient.id}
                            index={index}
                          >
                            {(providedDrag: any, snapshotDrag: any) => (
                              <div
                                ref={providedDrag.innerRef}
                                {...providedDrag.draggableProps}
                                className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all relative ${
                                  snapshotDrag.isDragging ? 'shadow-2xl ring-2 ring-[#0ea5e9] rotate-1' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-sm">
                                        {patient.nom}
                                      </span>
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">
                                        #{index + 1}
                                      </span>
                                    </div>

                                    <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                      <span className="line-clamp-2 leading-tight">{patient.adresse}</span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100 text-xs flex-wrap">
                                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${
                                        patient.hasFixedTime
                                          ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                                          : 'bg-slate-100 text-slate-600 font-medium'
                                      }`}>
                                        <Clock className="w-3 h-3 text-[#006591]" />
                                        {patient.heurePassage ? patient.heurePassage : 'Flexible (Sans horaire)'}
                                      </span>
                                      <span className="flex items-center gap-1 text-slate-600 bg-sky-50 text-[#006591] px-2 py-0.5 rounded-md font-medium truncate">
                                        <Stethoscope className="w-3 h-3 text-[#006591]" />
                                        {patient.typeSoin}
                                      </span>
                                    </div>
                                  </div>

                                  <div
                                    {...providedDrag.dragHandleProps}
                                    title="Glisser pour déplacer"
                                    className="p-1.5 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing rounded"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </DraggableComp>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </DroppableComp>
              </div>
            );
          })}
        </div>
      </DragDropContextComp>

      {/* Voice Assistant button for Tournées */}
      <PageVoiceMicButton
        pageTitle="Gestion des Tournées"
        placeholderExamples={[
          "Passer M. Dupont en Tournée 1",
          "Renommer la tournée du matin en Tournée Centre",
          "Ajouter une nouvelle tournée après-midi"
        ]}
        onVoiceCommand={(cmd) => {
          if (onSuccessToast) onSuccessToast(`Modification vocale enregistrée : ${cmd}`);
        }}
      />
    </div>
  );
};

