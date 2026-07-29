import React from 'react';
import { NavView } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Mic, 
  Calculator, 
  Mail, 
  StickyNote,
  Settings, 
  LogOut, 
  Plus,
  Stethoscope,
  Route,
  Map,
  CalendarDays
} from 'lucide-react';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  onOpenNewCare: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenNewCare,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const isVoiceActive = currentView === 'voice-transmission-hub' || currentView === 'live-voice-transmission';

  const navItems = [
    { id: 'accueil' as NavView, label: 'Accueil', icon: LayoutDashboard },
    { id: 'patients' as NavView, label: 'Patients', icon: Users },
    { id: 'doctors' as NavView, label: 'Professionnels', icon: Stethoscope },
    { id: 'tournee-manager' as NavView, label: 'Tournées', icon: Route },
    { id: 'tournee-scheduling' as NavView, label: 'Planning', icon: CalendarDays },
    { id: 'route-planner' as NavView, label: 'Trajet', icon: Map },
    { id: 'voice-transmission-hub' as NavView, label: 'Transmission', icon: Mic, activeCheck: isVoiceActive },
    { id: 'cotations' as NavView, label: 'Cotations', icon: Calculator },
    { id: 'messagerie' as NavView, label: 'Messagerie', icon: Mail },
    { id: 'notes' as NavView, label: 'Notes', icon: StickyNote },
    { id: 'settings' as NavView, label: 'Settings', icon: Settings }
  ];

  const sidebarContent = (
    <aside className="h-full w-[280px] bg-[#131b2e] text-white flex flex-col gap-6 p-6 shadow-xl border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#006591] flex items-center justify-center text-white shadow-md shadow-sky-500/20">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-white leading-tight">CareTone IDEL</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex flex-col gap-1.5 flex-grow">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.activeCheck ?? (currentView === item.id);

          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-[#0ea5e9] text-white shadow-md shadow-sky-500/20 scale-[0.99]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="mt-auto p-3.5 bg-slate-800/40 rounded-xl flex items-center gap-3 border border-slate-800">
        <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center border border-sky-500/30 text-sm">
          JR
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-semibold text-white truncate">Julie R.</span>
          <span className="text-xs text-slate-400 truncate">Infirmière Libérale</span>
        </div>
        <button 
          onClick={() => alert("Session CareTone IDEL sécurisée. Pour vous déconnecter en toute sécurité, fermez votre navigateur HDS.")}
          title="Se déconnecter"
          className="ml-auto text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 z-50">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-[280px] h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
