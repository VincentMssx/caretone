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
  getStoredTourneePatients, 
  saveStoredTourneePatients 
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
  GripVertical
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

  useEffect(() => {
    const loaded = getStoredTourneePatients();
    setPatients(loaded);
  }, []);

  const handleSave = (newPatients: TourneePatient[]) => {
    setPatients(newPatients);
    saveStoredTourneePatients(newPatients);
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
      handleSave(updatedAll);
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
      handleSave(updatedAll);

      if (onSuccessToast) {
        const columnNames: Record<StatutTournee, string> = {
          UNASSIGNED: 'Non Assignés',
          MATIN: 'Tournée 1',
          SOIR: 'Tournée 2'
        };
        onSuccessToast(`${movedPatient.nom} déplacé(e) vers ${columnNames[newStatus]}`);
      }
    }
  };

  const getColumnPatients = (status: StatutTournee) => {
    return patients
      .filter(p => p.statutTournee === status)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  };

  const columns: Array<{
    id: StatutTournee;
    title: string;
    subtitle: string;
    icon: React.FC<{ className?: string }>;
    bgColor: string;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
  }> = [
    {
      id: 'UNASSIGNED',
      title: 'Patients Non Assignés',
      subtitle: 'À planifier dans une tournée',
      icon: HelpCircle,
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      badgeBg: 'bg-slate-200',
      badgeText: 'text-slate-800'
    },
    {
      id: 'MATIN',
      title: 'Tournée 1',
      subtitle: 'Premier passage de la journée (08h00 - 12h00)',
      icon: Sun,
      bgColor: 'bg-amber-50/50',
      borderColor: 'border-amber-200/80',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800'
    },
    {
      id: 'SOIR',
      title: 'Tournée 2',
      subtitle: 'Second passage de la journée (16h00 - 20h00)',
      icon: Moon,
      bgColor: 'bg-indigo-50/50',
      borderColor: 'border-indigo-200/80',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-800'
    }
  ];

  const unassignedCount = getColumnPatients('UNASSIGNED').length;
  const matinCount = getColumnPatients('MATIN').length;
  const soirCount = getColumnPatients('SOIR').length;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#006591]/10 text-[#006591] text-[11px] font-extrabold uppercase rounded-md tracking-wider">
              Nantes Métropole
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">CareVoice IDEL</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Gestion des Tournées</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organisez par glisser-déposer vos passages de soins entre le matin, le soir et les patients en attente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToRoutePlanner}
            className="flex items-center gap-2 bg-[#006591] hover:bg-[#004d70] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Map className="w-4 h-4 text-sky-300" />
            <span>Voir Carte & Trajet</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Non Assignés</p>
              <p className="text-xl font-bold text-slate-800">{unassignedCount} patient(s)</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Tournée 1</p>
              <p className="text-xl font-bold text-slate-800">{matinCount} patient(s)</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Tournée 2</p>
              <p className="text-xl font-bold text-slate-800">{soirCount} patient(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Columns Grid */}
      <DragDropContextComp onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map(col => {
            const ColumnIcon = col.icon;
            const columnPatients = getColumnPatients(col.id);

            return (
              <div
                key={col.id}
                className={`${col.bgColor} border ${col.borderColor} rounded-2xl p-4 flex flex-col min-h-[500px] shadow-xs`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
                  <div className="flex items-center gap-2">
                    <ColumnIcon className="w-5 h-5 text-slate-700" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{col.title}</h3>
                      <p className="text-[11px] text-slate-500">{col.subtitle}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${col.badgeBg} ${col.badgeText}`}>
                    {columnPatients.length}
                  </span>
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
                        <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs gap-1">
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
                                className={`bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative ${
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

                                    <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-100 text-xs">
                                      <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                        <Clock className="w-3 h-3 text-[#006591]" />
                                        {patient.heurePassage}
                                      </span>
                                      <span className="flex items-center gap-1 text-slate-600 bg-sky-50 text-[#006591] px-2 py-0.5 rounded-md font-medium">
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
          "Changer l'horaire de visite à 10:15",
          "Déplacer Mme Bernard en Tournée 2"
        ]}
        onVoiceCommand={(cmd) => {
          if (onSuccessToast) onSuccessToast(`Modification vocale enregistrée : ${cmd}`);
        }}
      />
    </div>
  );
};
