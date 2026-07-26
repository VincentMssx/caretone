import React, { useState, useEffect } from 'react';
import { Moon, Sun, Shield, Palette, Check } from 'lucide-react';

export type Theme = 'classic' | 'stitch-dark' | 'light-sun';

export interface ThemeOption {
  id: Theme;
  label: string;
  icon: React.ElementType;
  badgeBg: string;
  badgeText: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'classic',
    label: 'Cabinet Médical',
    icon: Shield,
    badgeBg: 'bg-[#006591]',
    badgeText: 'text-white',
    description: 'Bleu IDEL traditionnel & épuré'
  },
  {
    id: 'stitch-dark',
    label: 'Émeraude Nocturne (Stitch)',
    icon: Moon,
    badgeBg: 'bg-[#10B981]',
    badgeText: 'text-[#0F172A]',
    description: 'Vert Émeraude & Fond sombre #0F172A'
  },
  {
    id: 'light-sun',
    label: 'Plein Soleil',
    icon: Sun,
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    description: 'Haute visibilité anti-reflets extérieur'
  }
];

export const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('carevoice_theme') as Theme;
      if (saved && ['classic', 'stitch-dark', 'light-sun'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'classic';
  });

  const [isOpen, setIsOpen] = useState(false);

  // Synchronize class on <html> element
  useEffect(() => {
    const root = document.documentElement;

    // Reset theme classes
    root.classList.remove('dark', 'theme-stitch', 'theme-light-sun', 'theme-classic');

    if (theme === 'stitch-dark') {
      root.classList.add('dark', 'theme-stitch');
    } else if (theme === 'light-sun') {
      root.classList.add('theme-light-sun');
    } else {
      root.classList.add('theme-classic');
    }

    try {
      localStorage.setItem('carevoice_theme', theme);
    } catch (e) {
      console.error('Could not save theme to localStorage', e);
    }
  }, [theme]);

  const activeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white/80 hover:bg-slate-100/80 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
        title="Changer de thème visuel"
      >
        <Palette className="w-4 h-4 text-[#006591] dark:text-[#10B981]" />
        <span className="hidden sm:inline-block">{activeOption.label}</span>
        <span className={`w-2 h-2 rounded-full ${activeOption.badgeBg}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-fadeIn">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Thème d'affichage
              </p>
            </div>

            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-emerald-950/40 border border-sky-200 dark:border-emerald-800/50'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${opt.badgeBg} ${opt.badgeText}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                          {opt.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[#006591] dark:text-[#10B981] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
