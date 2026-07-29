import React, { useState, useEffect } from 'react';
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
import { TourneeMatrixGrid } from './TourneeMatrixGrid';
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
  Route,
  LayoutGrid,
  Kanban
} from 'lucide-react';

interface TourneeManagerProps {
  onNavigateToRoutePlanner: () => void;
  onSuccessToast?: (msg: string) => void;
  onInspectPatient?: (patientName: string) => void;
}

export const TourneeManager: React.FC<TourneeManagerProps> = ({
  onNavigateToRoutePlanner,
  onSuccessToast,
  onInspectPatient
}) => {
  return (
    <div className="p-4 md:p-8">
      <TourneeMatrixGrid
        onInspectPatient={onInspectPatient}
        onSuccessToast={onSuccessToast}
      />
    </div>
  );
};

