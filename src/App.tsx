import React, { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { NavView, Patient, MedicalAlert, CotationItem, Conversation, PersonalNote } from './types';
import { INITIAL_PATIENTS, INITIAL_ALERTS, INITIAL_COTATIONS, INITIAL_CONVERSATIONS, INITIAL_NOTES } from './data/mockData';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PatientDrawer } from './components/PatientDrawer';
import { NewCareModal } from './components/NewCareModal';
import { NewPatientModal } from './components/NewPatientModal';
import { NewCotationModal } from './components/NewCotationModal';
import { VoiceRecorderModal } from './components/VoiceRecorderModal';

import { AccueilView } from './views/AccueilView';
import { PatientsView } from './views/PatientsView';
import { PatientDetailView } from './views/PatientDetailView';
import { VoiceTransmissionHubView } from './views/VoiceTransmissionHubView';
import { LiveVoiceTransmissionView } from './views/LiveVoiceTransmissionView';
import { CotationsView } from './views/CotationsView';
import { MessagerieView } from './views/MessagerieView';
import { SettingsView } from './views/SettingsView';
import { NotesView } from './views/NotesView';
import { TourneeManager } from './components/TourneeManager';
import { TourneeSchedulingPanel } from './components/TourneeSchedulingPanel';
import { RoutePlanner } from './components/RoutePlanner';

import { CheckCircle2, Sparkles, X, LayoutDashboard, Users, Map, Mic, Mail, Menu } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<NavView>('accueil');

  // Enforce Classic Theme as default
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-stitch', 'theme-light-sun');
    root.classList.add('theme-classic');
    try {
      localStorage.removeItem('caretone_theme');
    } catch (e) {
      console.error(e);
    }
  }, []);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [alerts, setAlerts] = useState<MedicalAlert[]>(INITIAL_ALERTS);
  const [cotations, setCotations] = useState<CotationItem[]>(INITIAL_COTATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  
  const [notes, setNotes] = useState<PersonalNote[]>(() => {
    try {
      const saved = localStorage.getItem('idel_personal_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
    }
    return INITIAL_NOTES;
  });

  // Drawers & Modals state
  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<Patient | null>(null);
  const [isPatientDrawerOpen, setIsPatientDrawerOpen] = useState(false);
  const [selectedPatientDetailId, setSelectedPatientDetailId] = useState<string | null>(null);

  const [isNewCareModalOpen, setIsNewCareModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewCotationModalOpen, setIsNewCotationModalOpen] = useState(false);
  const [isVoiceRecorderModalOpen, setIsVoiceRecorderModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handler to open patient drawer
  const handleSelectPatientDrawer = (patient: Patient) => {
    setSelectedPatientForDrawer(patient);
    setIsPatientDrawerOpen(true);
  };

  // Handler to view full dossier page
  const handleViewFullDossier = (patientId: string) => {
    setSelectedPatientDetailId(patientId);
    setIsPatientDrawerOpen(false);
    setCurrentView('patient-detail');
  };

  // Add care note to patient
  const handleSaveCareNote = (patientId: string, donnees: string, actions: string, resultats: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const newObs = {
          id: `obs-${Date.now()}`,
          date: 'Aujourd\'hui, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString(),
          author: 'Julie R.',
          donnees,
          actions,
          resultats
        };
        return {
          ...p,
          observationsHistory: [newObs, ...p.observationsHistory]
        };
      }
      return p;
    }));
    showToast('Soin enregistré dans le dossier patient');
  };

  // Add new patient
  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
    showToast(`Fiche créée pour ${newPatient.name}`);
  };

  // Add new cotation
  const handleAddCotation = (newCotation: CotationItem) => {
    setCotations(prev => [newCotation, ...prev]);
    showToast(`Cotation ${newCotation.code} ajoutée (${newCotation.amount.toFixed(2)} €)`);
  };

  // Send message in Messagerie
  const handleSendMessage = (conversationId: string, text: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        const newMsg = {
          id: `msg-${Date.now()}`,
          senderName: 'Julie R.',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true
        };
        return {
          ...c,
          lastMessage: text,
          lastTime: newMsg.time,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));
  };

  // Approve Voice Transmission batch
  const handleApproveVoiceBatch = (
    updatedObservations: { patientId: string; donnees: string; actions: string; resultats: string }[],
    newPatientsToCreate: Partial<Patient>[]
  ) => {
    // 1. Update existing patients
    setPatients(prev => {
      let updated = [...prev];
      updatedObservations.forEach(obs => {
        updated = updated.map(p => {
          if (p.id === obs.patientId) {
            const newObs = {
              id: `obs-voice-${Date.now()}`,
              date: 'Aujourd\'hui, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: new Date().toISOString(),
              author: 'Julie R. (Dictée Vocale)',
              donnees: obs.donnees,
              actions: obs.actions,
              resultats: obs.resultats
            };
            return {
              ...p,
              observationsHistory: [newObs, ...p.observationsHistory]
            };
          }
          return p;
        });
      });

      // 2. Add new created patients
      newPatientsToCreate.forEach((np, idx) => {
        const created: Patient = {
          id: `p-created-${Date.now()}-${idx}`,
          name: np.name || 'Nouveau Patient',
          birthDate: np.birthDate || '12/05/1954',
          age: 72,
          secuNumber: '1 54 05 75 112 042',
          bloodType: 'A+',
          address: '15 rue des Fleurs, Paris',
          phone: '06 99 88 77 66',
          doctor: 'Dr. Morel',
          photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
          pathologyBadge: np.pathologyBadge || 'POST-OPÉRATOIRE',
          careSummary: np.careSummary || 'Suivi pansement lourd',
          nextVisitTime: 'Demain, 09:30',
          visitFrequency: '1x / Jour',
          warnings: np.warnings || ['Pansement stérile'],
          status: 'active',
          observationsHistory: [
            {
              id: `obs-init-${Date.now()}`,
              date: 'Aujourd\'hui',
              timestamp: new Date().toISOString(),
              author: 'Julie R. (Dictée Vocale)',
              donnees: 'Initialisation de la fiche via dictée vocale.',
              actions: 'Soins démarrés.',
              resultats: 'Validation effectuée.'
            }
          ]
        };
        updated.unshift(created);
      });

      return updated;
    });

    showToast('Modifications vocales synchronisées dans les dossiers !');
    setCurrentView('patients');
  };

  // Note Handlers
  const saveNotesToStorage = (updated: PersonalNote[]) => {
    setNotes(updated);
    try {
      localStorage.setItem('idel_personal_notes', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save notes to localStorage', e);
    }
  };

  const handleAddNote = (newNoteData: Omit<PersonalNote, 'id' | 'date'>) => {
    const newNote: PersonalNote = {
      ...newNoteData,
      id: `note-${Date.now()}`,
      date: 'Aujourd\'hui, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newNote, ...notes];
    saveNotesToStorage(updated);
    showToast('Note personnelle ajoutée avec succès');
  };

  const handleUpdateNote = (id: string, updatedFields: Partial<PersonalNote>) => {
    const updated = notes.map(n => n.id === id ? { ...n, ...updatedFields } : n);
    saveNotesToStorage(updated);
    showToast('Note mise à jour');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotesToStorage(updated);
    showToast('Note supprimée');
  };

  const handleTogglePinNote = (id: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
    saveNotesToStorage(updated);
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'accueil': return 'Accueil';
      case 'patients': return 'Patients';
      case 'patient-detail': return 'Dossier Patient';
      case 'voice-transmission-hub': return 'Voice Transmission';
      case 'live-voice-transmission': return 'Voice Transmission En Direct';
      case 'cotations': return 'Cotations & Facturation';
      case 'messagerie': return 'Messagerie Sécurisée HDS';
      case 'notes': return 'Notes Personnelles IDEL';
      case 'settings': return 'Settings';
      default: return 'CareTone IDEL';
    }
  };

  const activePatientForDetail = patients.find(p => p.id === selectedPatientDetailId) || patients[0];

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex text-slate-800 font-sans antialiased">
      <SpeedInsights />
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenNewCare={() => setIsNewCareModalOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:ml-[280px] min-w-0">
        <Header
          title={getHeaderTitle()}
          onOpenNewCare={() => setIsNewCareModalOpen(true)}
          onOpenVoiceModal={() => setIsVoiceRecorderModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onShowAlerts={() => {
            setCurrentView('accueil');
            showToast("Navigation vers les alertes prioritaires du jour.");
          }}
          onShowHelp={() => {
            showToast("CareTone IDEL: Utilisez le bouton 'Dictée Vocale' ou le micro pour saisir vos observations DAR.");
          }}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-[70] bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic Views */}
        <main className="flex-1 pb-24 md:pb-12">
          {currentView === 'accueil' && (
            <AccueilView
              patients={patients}
              alerts={alerts}
              onSelectPatient={handleSelectPatientDrawer}
              onNavigate={(view) => setCurrentView(view)}
              onStartVoiceTransmission={() => setCurrentView('live-voice-transmission')}
              onOpenNewCare={() => setIsNewCareModalOpen(true)}
            />
          )}

          {currentView === 'patients' && (
            <PatientsView
              patients={patients}
              onSelectPatient={handleSelectPatientDrawer}
              onViewDossier={(patientId) => handleViewFullDossier(patientId)}
              onOpenAddPatient={() => setIsNewPatientModalOpen(true)}
              onStartVoice={() => setCurrentView('live-voice-transmission')}
            />
          )}

          {currentView === 'tournee-manager' && (
            <TourneeManager
              onNavigateToRoutePlanner={() => setCurrentView('route-planner')}
              onSuccessToast={showToast}
            />
          )}

          {currentView === 'tournee-scheduling' && (
            <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
              <TourneeSchedulingPanel onSuccessToast={showToast} />
            </div>
          )}

          {currentView === 'route-planner' && (
            <RoutePlanner
              onNavigateToTourneeManager={() => setCurrentView('tournee-manager')}
              onSuccessToast={showToast}
            />
          )}

          {currentView === 'patient-detail' && (
            <PatientDetailView
              patient={activePatientForDetail}
              onBack={() => setCurrentView('patients')}
              onStartVoice={(patient) => {
                setCurrentView('live-voice-transmission');
              }}
              onOpenNewCareNote={() => setIsNewCareModalOpen(true)}
            />
          )}

          {currentView === 'voice-transmission-hub' && (
            <VoiceTransmissionHubView
              onStartLiveRecording={() => setCurrentView('live-voice-transmission')}
              onInspectPatient={handleSelectPatientDrawer}
            />
          )}

          {currentView === 'live-voice-transmission' && (
            <LiveVoiceTransmissionView
              patients={patients}
              onBack={() => setCurrentView('accueil')}
              onApproveAllModifications={handleApproveVoiceBatch}
            />
          )}

          {currentView === 'cotations' && (
            <CotationsView
              cotations={cotations}
              patients={patients}
              onOpenNewCotation={() => setIsNewCotationModalOpen(true)}
              onAddCotation={(c) => handleAddCotation({ ...c, id: `cot-${Date.now()}`, status: 'brouillon' })}
              onSuccessToast={showToast}
            />
          )}

          {currentView === 'messagerie' && (
            <MessagerieView
              conversations={conversations}
              onSendMessage={handleSendMessage}
              onViewDossier={(patientId) => {
                setSelectedPatientDetailId(patientId);
                setCurrentView('patient-detail');
              }}
              onSuccessToast={showToast}
            />
          )}

          {currentView === 'notes' && (
            <NotesView
              notes={notes}
              patients={patients}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onTogglePin={handleTogglePinNote}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Slide-over Patient Drawer */}
      <PatientDrawer
        patient={selectedPatientForDrawer}
        isOpen={isPatientDrawerOpen}
        onClose={() => setIsPatientDrawerOpen(false)}
        onViewFullDossier={(patientId) => handleViewFullDossier(patientId)}
        onStartVoiceForPatient={(patient) => {
          setIsPatientDrawerOpen(false);
          setCurrentView('live-voice-transmission');
        }}
      />

      {/* Modals */}
      <NewCareModal
        isOpen={isNewCareModalOpen}
        onClose={() => setIsNewCareModalOpen(false)}
        patients={patients}
        onSaveCareNote={handleSaveCareNote}
        onStartVoiceTransmission={() => {
          setIsNewCareModalOpen(false);
          setCurrentView('live-voice-transmission');
        }}
      />

      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onAddPatient={handleAddPatient}
      />

      <NewCotationModal
        isOpen={isNewCotationModalOpen}
        onClose={() => setIsNewCotationModalOpen(false)}
        patients={patients}
        onAddCotation={handleAddCotation}
      />

      <VoiceRecorderModal
        isOpen={isVoiceRecorderModalOpen}
        onClose={() => setIsVoiceRecorderModalOpen(false)}
        patients={patients}
        onAddNote={handleAddNote}
        onAddCotation={(c) => handleAddCotation({ ...c, id: `cot-${Date.now()}`, status: 'brouillon' })}
        onUpdatePatientDAR={(patientId, dar) => handleSaveCareNote(patientId, dar.donnees, dar.actions, dar.resultats)}
        onSuccessToast={showToast}
      />

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around select-none">
        <button
          onClick={() => setCurrentView('accueil')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'accueil' ? 'text-[#006591] font-bold bg-sky-50' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Accueil</span>
        </button>

        <button
          onClick={() => setCurrentView('patients')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'patients' || currentView === 'patient-detail' ? 'text-[#006591] font-bold bg-sky-50' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Patients</span>
        </button>

        <button
          onClick={() => setCurrentView('route-planner')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'route-planner' || currentView === 'tournee-manager' ? 'text-[#006591] font-bold bg-sky-50' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Trajet</span>
        </button>

        <button
          onClick={() => setCurrentView('voice-transmission-hub')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'voice-transmission-hub' || currentView === 'live-voice-transmission' ? 'text-[#006591] font-bold bg-sky-50' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Transmission</span>
        </button>

        <button
          onClick={() => setCurrentView('messagerie')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'messagerie' ? 'text-[#006591] font-bold bg-sky-50' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Messagerie</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
