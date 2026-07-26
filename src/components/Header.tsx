import React from 'react';
import { Calendar, Menu } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onToggleMobileMenu?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onToggleMobileMenu,
  rightAction
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:px-8 w-full bg-[#f7f9fb]/90 backdrop-blur-md border-b border-[#bec8d2]/60 select-none">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-200/60 rounded-lg cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-[#006591] tracking-tight">{title}</h1>
            <div className="hidden sm:block h-5 w-px bg-slate-300"></div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-200/70 px-3 py-1 rounded-full cursor-pointer hover:bg-slate-300/80 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-[#006591]" />
              <span>Aujourd'hui - 26 Juillet 2026</span>
            </div>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium hidden md:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <ThemeSwitcher />
        {rightAction}
      </div>
    </header>
  );
};
