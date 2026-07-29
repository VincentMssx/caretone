import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Stethoscope, 
  Tag, 
  Clock, 
  Check, 
  Sparkles,
  FileText
} from 'lucide-react';

interface CareNotePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  tourneeName: string;
  initialNote?: string;
  initialSequenceOrder?: number;
  onSave: (careNote: string, sequenceOrder?: number) => void;
  onUnassign?: () => void;
}

const QUICK_NOTE_PRESETS = [
  { label: '💉 Insuline', note: 'Injection insuline + glycémie' },
  { label: '🩹 Pansement', note: 'Pansement stérile & réfection' },
  { label: '🩸 Prise de sang', note: 'Prise de sang à jeun' },
  { label: '🧼 Toilette', note: 'Toilette complète & constantes' },
  { label: '💊 Médicaments', note: 'Distribution & préparation pilulier' },
  { label: '🩺 Constantes', note: 'Prise de tension & saturation' },
  { label: '🧪 Glycémie', note: 'Contrôle glycémie capillaire' },
];

export const CareNotePopover: React.FC<CareNotePopoverProps> = ({
  isOpen,
  onClose,
  patientName,
  tourneeName,
  initialNote = '',
  initialSequenceOrder = 1,
  onSave,
  onUnassign
}) => {
  const [careNote, setCareNote] = useState<string>(initialNote);
  const [sequenceOrder, setSequenceOrder] = useState<number>(initialSequenceOrder);

  useEffect(() => {
    if (isOpen) {
      setCareNote(initialNote || '');
      setSequenceOrder(initialSequenceOrder || 1);
    }
  }, [isOpen, initialNote, initialSequenceOrder]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(careNote.trim(), sequenceOrder);
    onClose();
  };

  const handleApplyPreset = (presetText: string) => {
    if (!careNote.trim()) {
      setCareNote(presetText);
    } else if (!careNote.includes(presetText)) {
      setCareNote(`${careNote} • ${presetText}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#006591] to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/20 rounded-2xl border border-sky-400/30">
              <Stethoscope className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-200">
                Note Spécifique de Passage
              </div>
              <h3 className="text-base font-black text-white leading-tight">
                {patientName}
              </h3>
              <div className="text-xs text-sky-100/90 font-medium">
                Passage : <span className="font-extrabold text-amber-300">{tourneeName}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#006591]" />
              <span>Raccourcis de soins IDEL :</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_NOTE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p.note)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-[#006591] hover:border-sky-300 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Care Note Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#006591]" />
                <span>Consignes de Soin & Traitement pour ce passage</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Optionnel</span>
            </label>
            <textarea
              value={careNote}
              onChange={(e) => setCareNote(e.target.value)}
              placeholder="Ex: Injection insuline 12 UI à jeun, réfection pansement jambe gauche..."
              rows={3}
              className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#006591] focus:ring-2 focus:ring-sky-100 outline-none transition-all font-medium text-slate-800"
            />
          </div>

          {/* Sequence Order Selector */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Ordre de Passage de la Tournée</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Position dans la séquence de visites IDEL
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-500">N°</span>
              <select
                value={sequenceOrder}
                onChange={(e) => setSequenceOrder(parseInt(e.target.value))}
                className="bg-white text-slate-900 font-black text-xs px-3 py-1.5 rounded-xl border border-slate-300 outline-none cursor-pointer shadow-2xs"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((num) => (
                  <option key={num} value={num}>
                    #{num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            {onUnassign ? (
              <button
                type="button"
                onClick={() => {
                  onUnassign();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Retirer de la tournée</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#006591] hover:bg-[#004c6e] text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
