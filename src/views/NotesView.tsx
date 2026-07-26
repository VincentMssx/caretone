import React, { useState } from 'react';
import { PersonalNote, Patient } from '../types';
import { PageVoiceMicButton } from '../components/PageVoiceMicButton';
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  Mic, 
  Tag, 
  User, 
  Sparkles, 
  Volume2, 
  Copy, 
  Check, 
  X, 
  StickyNote,
  Building2,
  Briefcase,
  AlertCircle,
  FileText,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface NotesViewProps {
  notes: PersonalNote[];
  patients: Patient[];
  onAddNote: (note: Omit<PersonalNote, 'id' | 'date'>) => void;
  onUpdateNote: (id: string, updated: Partial<PersonalNote>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Toutes les notes', icon: FileText, color: 'text-slate-600 bg-slate-100' },
  { id: 'pense-bete', label: 'Pense-bête', icon: AlertCircle, color: 'text-purple-700 bg-purple-50' },
  { id: 'tournee', label: 'Tournée', icon: Briefcase, color: 'text-sky-700 bg-sky-50' },
  { id: 'cabinet', label: 'Cabinet', icon: Building2, color: 'text-amber-700 bg-amber-50' },
  { id: 'administratif', label: 'Administratif', icon: FileText, color: 'text-rose-700 bg-rose-50' },
  { id: 'autre', label: 'Autres', icon: StickyNote, color: 'text-slate-700 bg-slate-100' }
];

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  amber: { bg: 'bg-amber-50/60', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', text: 'text-amber-900' },
  purple: { bg: 'bg-purple-50/60', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', text: 'text-purple-900' },
  blue: { bg: 'bg-sky-50/60', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-800', text: 'text-sky-900' },
  green: { bg: 'bg-emerald-50/60', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', text: 'text-emerald-900' },
  rose: { bg: 'bg-rose-50/60', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-800', text: 'text-rose-900' },
  yellow: { bg: 'bg-yellow-50/60', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', text: 'text-yellow-900' }
};

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  patients,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePin
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null);

  // Modal form fields
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<PersonalNote['category']>('pense-bete');
  const [formColor, setFormColor] = useState<PersonalNote['color']>('purple');
  const [formPatientId, setFormPatientId] = useState<string>('');
  const [formTags, setFormTags] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.patientName && note.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  // Copy to clipboard
  const handleCopyNote = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedNoteId(id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingNote(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('pense-bete');
    setFormColor('purple');
    setFormPatientId('');
    setFormTags('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (note: PersonalNote) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCategory(note.category);
    setFormColor(note.color);
    setFormPatientId(note.patientId || '');
    setFormTags(note.tags.join(', '));
    setIsModalOpen(true);
  };

  // Voice dictation simulation inside modal
  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      const interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 4) {
            clearInterval(interval);
            setIsRecording(false);
            // Append transcribed text
            const textToAppend = " Penser à vérifier l'ordonnance et appeler la pharmacie pour la tournée de demain matin.";
            setFormContent(current => current ? current + textToAppend : "Dictée vocale :" + textToAppend);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  // Save Modal Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const patient = patients.find(p => p.id === formPatientId);
    const tagArray = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (editingNote) {
      onUpdateNote(editingNote.id, {
        title: formTitle,
        content: formContent,
        category: formCategory,
        color: formColor,
        patientId: formPatientId || undefined,
        patientName: patient ? patient.name : undefined,
        tags: tagArray
      });
    } else {
      onAddNote({
        title: formTitle,
        content: formContent,
        category: formCategory,
        color: formColor,
        isPinned: false,
        patientId: formPatientId || undefined,
        patientName: patient ? patient.name : undefined,
        tags: tagArray
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-[#131b2e] to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-sky-500/20 text-sky-300 text-xs font-semibold rounded-full border border-sky-500/30 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" /> Espace Personnel Infirmier
            </span>
            <span className="text-xs text-slate-400 font-medium">Confidentiel & Synchronisé</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Notes & Pense-bête IDEL
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Consignez vos rappels de tournée, mémo cabinet, consignes pour remplaçants et tâches administratives en toute simplicité.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/25 active:scale-98 transition-all cursor-pointer text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle Note</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par mot-clé, tag ou patient..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
              Total : <strong>{notes.length}</strong>
            </span>
            <span className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 flex items-center gap-1">
              <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Épinglées : <strong>{pinnedNotes.length}</strong>
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#131b2e] text-white border-[#131b2e] shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tag Pills */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags :
            </span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold flex items-center gap-1 hover:bg-sky-200 transition-colors"
              >
                Tout voir <X className="w-3 h-3" />
              </button>
            )}
            {allTags.map(tag => {
              const isTagSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isTagSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                    isTagSelected
                      ? 'bg-sky-500 text-white font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Notes Content Area */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
            <StickyNote className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Aucune note trouvée</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ajustez votre recherche ou créez une nouvelle note pour garder une trace de vos mémoires de tournée.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" /> Créer une note
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                  Notes Épinglées ({pinnedNotes.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onTogglePin={onTogglePin}
                    onEdit={handleOpenEditModal}
                    onDelete={onDeleteNote}
                    onCopy={handleCopyNote}
                    isCopied={copiedNoteId === note.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Unpinned / Other Section */}
          {unpinnedNotes.length > 0 && (
            <div className="space-y-3">
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-bold text-slate-700 tracking-wide uppercase">
                    Autres Notes ({unpinnedNotes.length})
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onTogglePin={onTogglePin}
                    onEdit={handleOpenEditModal}
                    onDelete={onDeleteNote}
                    onCopy={handleCopyNote}
                    isCopied={copiedNoteId === note.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Create / Edit Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative space-y-5">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <StickyNote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingNote ? 'Modifier la note' : 'Nouvelle note personnelle'}
                </h3>
                <p className="text-xs text-slate-500">Aide-mémoire confidentiel IDEL</p>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Titre de la note *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Digicode cabinet, Rappel pharmacie..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              {/* Category & Color row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Catégorie</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as PersonalNote['category'])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="pense-bete">Pense-bête</option>
                    <option value="tournee">Tournée</option>
                    <option value="cabinet">Cabinet</option>
                    <option value="administratif">Administratif</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Couleur d'accent</label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value as PersonalNote['color'])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="purple">Violet (Pense-bête)</option>
                    <option value="amber">Ambre / Jaune</option>
                    <option value="blue">Bleu Ciel</option>
                    <option value="green">Émeraude / Vert</option>
                    <option value="rose">Rose / Rouge</option>
                  </select>
                </div>
              </div>

              {/* Linked Patient Option */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Associer un patient (Optionnel)</span>
                  <User className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <select
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="">-- Aucun patient lié --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.careSummary})
                    </option>
                  ))}
                </select>
              </div>

              {/* Content Textarea & Voice Dictation button */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Contenu de la note *</label>
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isRecording ? `Dictée en cours (${recordingTime}s)...` : 'Dictée vocale'}</span>
                  </button>
                </div>

                <textarea
                  required
                  rows={4}
                  placeholder="Rédigez le détail de votre mémo ou utilisez la dictée vocale..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none leading-relaxed"
                />
              </div>

              {/* Tags input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  placeholder="Ex: Pharmacie, Code, Tournée, Matériel"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingNote ? 'Enregistrer les modifications' : 'Créer la note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voice Assistant button for Notes */}
      <PageVoiceMicButton
        pageTitle="Notes Personnelles IDEL"
        placeholderExamples={[
          "Créer note : Rappeler le médecin traitant à 17h",
          "Rappel matériel : Commander compresses stériles",
          "Note tournée : Route barrée rue Rousseau"
        ]}
        onVoiceCommand={(cmd) => {
          onAddNote({
            title: "Note dictée vocale",
            content: cmd,
            category: "pense-bete",
            color: "purple",
            isPinned: true,
            tags: ["vocale", "pense-bete"]
          });
        }}
      />
    </div>
  );
};

// Individual Note Card Component
interface NoteCardProps {
  note: PersonalNote;
  onTogglePin: (id: string) => void;
  onEdit: (note: PersonalNote) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string, content: string) => void;
  isCopied: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onTogglePin,
  onEdit,
  onDelete,
  onCopy,
  isCopied
}) => {
  const colorStyle = COLOR_MAP[note.color] || COLOR_MAP.purple;

  return (
    <div className={`rounded-2xl p-5 border ${colorStyle.border} ${colorStyle.bg} shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group`}>
      {/* Card Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 text-[10px] uppercase font-extrabold tracking-wider rounded-md ${colorStyle.badge}`}>
              {note.category}
            </span>
            {note.patientName && (
              <span className="px-2 py-0.5 bg-slate-800 text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                <User className="w-3 h-3 text-sky-400" /> {note.patientName}
              </span>
            )}
            {note.audioDuration && (
              <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-semibold rounded-md flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-sky-600" /> {note.audioDuration}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onTogglePin(note.id)}
              title={note.isPinned ? "Désépingler" : "Épingler en haut"}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                note.isPinned
                  ? 'text-amber-600 bg-amber-100 hover:bg-amber-200'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Note Title */}
        <h3 className={`text-base font-bold ${colorStyle.text} leading-snug`}>
          {note.title}
        </h3>

        {/* Content */}
        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
          {note.content}
        </p>
      </div>

      {/* Card Footer */}
      <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-slate-400 font-medium">
          {note.date}
        </span>

        {/* Tags & Action menu */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCopy(note.id, `${note.title}\n${note.content}`)}
            title="Copier le texte"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onEdit(note)}
            title="Modifier la note"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            title="Supprimer la note"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-100/60 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
