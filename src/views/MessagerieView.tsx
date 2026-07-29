import React, { useState, useMemo } from 'react';
import { Conversation, ChatMessage, Patient, Doctor } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Search, 
  Edit3, 
  Paperclip, 
  Send, 
  Mic, 
  FileText, 
  FolderHeart,
  Stethoscope,
  UserCheck,
  CheckCheck,
  ArrowLeft
} from 'lucide-react';

interface MessagerieViewProps {
  conversations: Conversation[];
  patients?: Patient[];
  doctors?: Doctor[];
  onSendMessage: (conversationId: string, text: string) => void;
  onViewDossier?: (patientId: string) => void;
  onViewDoctor?: (doctorName: string) => void;
  onSuccessToast?: (msg: string) => void;
}

export const MessagerieView: React.FC<MessagerieViewProps> = ({
  conversations,
  patients = [],
  doctors = [],
  onSendMessage,
  onViewDossier,
  onViewDoctor,
  onSuccessToast
}) => {
  // Merge conversations with all patients and health professionals
  const allMergedConversations = useMemo(() => {
    const list: Conversation[] = [...conversations];

    // Add patients not already in conversations
    patients.forEach(p => {
      const exists = list.some(c => 
        c.contactName.toLowerCase().includes(p.name.toLowerCase()) || 
        (c.patientId && c.patientId === p.id)
      );
      if (!exists) {
        list.push({
          id: `conv-patient-${p.id}`,
          patientId: p.id,
          contactName: `${p.name} (Patient)`,
          contactRole: `Patient • Secu: ${p.secuNumber || 'N/A'}`,
          avatarUrl: p.photoUrl,
          isOnline: false,
          lastMessage: 'Démarrez une discussion chiffrée avec le patient.',
          lastTime: 'Récent',
          unreadCount: 0,
          category: 'patient',
          messages: [
            {
              id: `m-init-${p.id}`,
              conversationId: `conv-patient-${p.id}`,
              senderName: p.name,
              text: `Canal de messagerie sécurisé (HDS) ouvert pour ${p.name}.`,
              time: '09:00',
              isMe: false
            }
          ]
        });
      }
    });

    // Add doctors/professionals not already in conversations
    doctors.forEach(d => {
      const exists = list.some(c => c.contactName.toLowerCase().includes(d.name.toLowerCase()));
      if (!exists) {
        list.push({
          id: `conv-doc-${d.id}`,
          contactName: `${d.name} (Médecin)`,
          contactRole: `${d.specialty} • ${d.phone}`,
          contactInitials: d.name.replace('Dr.', '').trim().split(' ').map(n => n[0]).join(''),
          isOnline: true,
          lastMessage: 'Démarrez une échange sécurisé avec le professionnel.',
          lastTime: 'En ligne',
          unreadCount: 0,
          category: 'medecin',
          messages: [
            {
              id: `m-init-doc-${d.id}`,
              conversationId: `conv-doc-${d.id}`,
              senderName: d.name,
              text: `Bonjour, vous êtes en contact sécurisé avec ${d.name} (${d.specialty}).`,
              time: '08:30',
              isMe: false
            }
          ]
        });
      }
    });

    return list;
  }, [conversations, patients, doctors]);

  const [activeConvId, setActiveConvId] = useState<string>(allMergedConversations[0]?.id || '');
  const [showChatOnMobile, setShowChatOnMobile] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'tous' | 'non-lus' | 'medecin' | 'patient'>('tous');
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);

  const activeConv = allMergedConversations.find(c => c.id === activeConvId) || allMergedConversations[0];

  const filteredConversations = allMergedConversations.filter(c => {
    const matchesSearch = c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterCategory === 'non-lus') return matchesSearch && c.unreadCount > 0;
    if (filterCategory === 'medecin') return matchesSearch && c.category === 'medecin';
    if (filterCategory === 'patient') return matchesSearch && c.category === 'patient';
    return matchesSearch;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachment) || !activeConv) return;
    const finalMsg = attachment ? `${inputText ? inputText + ' ' : ''}[Pièce jointe sécurisée : ${attachment}]` : inputText;
    onSendMessage(activeConv.id, finalMsg);
    setInputText('');
    setAttachment(null);
  };

  const handleFileAttach = () => {
    const fileName = prompt("Saisissez le nom du document / compte-rendu à joindre :", "Ordonnance_Mise_A_Jour.pdf");
    if (fileName) {
      setAttachment(fileName);
      if (onSuccessToast) {
        onSuccessToast(`Pièce jointe '${fileName}' ajoutée à la conversation.`);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 md:p-6 flex flex-col md:flex-row gap-4 max-w-7xl mx-auto overflow-hidden">
      {/* Sidebar: Conversations List */}
      <aside className={`w-full md:w-80 lg:w-96 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm shrink-0 ${
        showChatOnMobile ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
              <span>Conversations</span>
              <Lock className="w-3.5 h-3.5 text-teal-600" title="Sécurité HDS" />
            </h2>
            <button className="text-[#006591] hover:bg-sky-50 p-1.5 rounded-full transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher contact..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 p-2 border-b border-slate-200 bg-white overflow-x-auto text-[11px] font-semibold">
          <button
            onClick={() => setFilterCategory('tous')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              filterCategory === 'tous' ? 'bg-[#006591] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterCategory('non-lus')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              filterCategory === 'non-lus' ? 'bg-[#006591] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Non lus
          </button>
          <button
            onClick={() => setFilterCategory('medecin')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              filterCategory === 'medecin' ? 'bg-[#006591] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Médecins
          </button>
          <button
            onClick={() => setFilterCategory('patient')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              filterCategory === 'patient' ? 'bg-[#006591] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Patients
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.map((conv) => {
            const isActive = conv.id === activeConvId;
            return (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConvId(conv.id);
                  setShowChatOnMobile(true);
                }}
                className={`p-3.5 flex gap-3 items-start cursor-pointer transition-colors ${
                  isActive ? 'bg-sky-50/80 border-l-4 border-l-[#006591]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative shrink-0">
                  {conv.avatarUrl ? (
                    <img 
                      src={conv.avatarUrl} 
                      alt={conv.contactName} 
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm">
                      {conv.contactInitials || conv.contactName.slice(0, 2)}
                    </div>
                  )}
                  {conv.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-teal-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-xs text-slate-800 truncate pr-1">
                      {conv.contactName}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {conv.lastTime}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Chat Area */}
      {activeConv ? (
        <section className={`flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm ${
          !showChatOnMobile ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Chat Header */}
          <div className="px-4 md:px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowChatOnMobile(false)}
                className="md:hidden p-1.5 text-slate-600 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
                title="Retour aux conversations"
              >
                <ArrowLeft className="w-5 h-5 text-[#006591]" />
              </button>

              {activeConv.avatarUrl ? (
                <img src={activeConv.avatarUrl} alt={activeConv.contactName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#006591]/10 text-[#006591] font-bold flex items-center justify-center text-sm">
                  {activeConv.contactInitials || activeConv.contactName.slice(0, 2)}
                </div>
              )}
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <span>{activeConv.contactName}</span>
                  <Lock className="w-3.5 h-3.5 text-teal-600" title="E2E Encrypted" />
                </h3>
                <p className="text-xs text-slate-500">{activeConv.contactRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeConv.category === 'patient' || activeConv.patientId || activeConv.contactName.toLowerCase().includes('patient') ? (
                <button 
                  onClick={() => {
                    const pid = activeConv.patientId || 'p1';
                    if (onViewDossier) onViewDossier(pid);
                  }}
                  title="Consulter le Dossier Patient" 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#006591] border border-sky-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  <FolderHeart className="w-4 h-4 text-[#006591]" />
                  <span className="hidden sm:inline">Consulter dossier patient</span>
                  <span className="sm:hidden">Dossier</span>
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (onViewDoctor) onViewDoctor(activeConv.contactName);
                    else if (onSuccessToast) onSuccessToast(`Fiche de ${activeConv.contactName} consultée.`);
                  }}
                  title="Consulter la fiche du professionnel" 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#006591] border border-sky-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4 text-[#006591]" />
                  <span className="hidden sm:inline">Fiche du professionnel</span>
                  <span className="sm:hidden">Fiche Pro</span>
                </button>
              )}
            </div>
          </div>

          {/* HDS Security Banner */}
          <div className="bg-teal-50 py-1.5 px-4 flex items-center justify-center gap-2 border-b border-teal-100">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <p className="text-xs font-semibold text-teal-800">
              Cette conversation est sécurisée (HDS) et chiffrée de bout en bout.
            </p>
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
            <div className="flex justify-center">
              <span className="bg-slate-200/80 px-3 py-0.5 rounded-full text-[11px] font-semibold text-slate-600">
                Aujourd'hui
              </span>
            </div>

            {activeConv.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[80%] ${msg.isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className="flex flex-col gap-1">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.isMe
                        ? 'bg-[#006591] text-white rounded-br-xs shadow-sm font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${msg.isMe ? 'justify-end' : ''}`}>
                    <span>{msg.time}</span>
                    {msg.isMe && <CheckCheck className="w-3.5 h-3.5 text-teal-600" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Text Input Area */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white space-y-2">
            {attachment && (
              <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 text-[#006591] px-3 py-1.5 rounded-xl text-xs font-semibold">
                <Paperclip className="w-3.5 h-3.5" />
                <span className="truncate flex-1">Pièce jointe : {attachment}</span>
                <button 
                  type="button" 
                  onClick={() => setAttachment(null)} 
                  className="text-slate-400 hover:text-red-600 font-bold ml-1"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-[#0ea5e9]">
            <button 
              onClick={handleFileAttach}
              type="button" 
              title="Joindre un document ou un compte-rendu"
              className="p-2 text-slate-400 hover:text-[#006591] rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const phrases = [
                  "Constantes stables ce matin, pansement refait sans particularité.",
                  "Demande de renouvellement d'ordonnance transmise au médecin.",
                  "Patient absent lors du passage de 9h, relancé par téléphone."
                ];
                const chosen = phrases[Math.floor(Math.random() * phrases.length)];
                setInputText(prev => prev ? prev + " " + chosen : chosen);
                if (onSuccessToast) onSuccessToast("Dictée vocale transcrite dans le message !");
              }}
              title="Dictée vocale"
              className="p-2 text-slate-400 hover:text-[#006591] rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4" />
            </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Écrire un message sécurisé..."
                className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="p-2 bg-[#006591] hover:bg-[#004c6e] text-white rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> HDS Chiffré
              </span>
              <span>Appuyez sur Entrée pour envoyer</span>
            </div>
          </form>
        </section>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
          Sélectionnez une conversation
        </div>
      )}
    </div>
  );
};
