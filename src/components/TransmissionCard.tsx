import React, { useState } from 'react';
import { DarTransmission, DiffBadge } from '../types/transmission';
import { calculateTransmissionDiff } from '../utils/diffCalculators';
import { 
  GitCommit, 
  GitBranch, 
  Clock, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Sparkles
} from 'lucide-react';

interface TransmissionCardProps {
  transmission: DarTransmission;
  previousTransmission?: DarTransmission;
  onEdit?: (transmission: DarTransmission) => void;
  isLatest?: boolean;
}

export const TransmissionCard: React.FC<TransmissionCardProps> = ({
  transmission,
  previousTransmission,
  onEdit,
  isLatest = false
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Compute diff badges dynamically if not pre-computed
  const diffBadges: DiffBadge[] = transmission.diffBadges || calculateTransmissionDiff(transmission, previousTransmission);

  // Get nurse initials
  const initials = transmission.nurseName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative pl-6 sm:pl-8 group">
      {/* Git Timeline Node Line */}
      <div className="absolute left-2.5 sm:left-3.5 top-0 bottom-0 w-0.5 bg-slate-200 group-last:bottom-8" />

      {/* Git Commit Bullet Dot */}
      <div className={`absolute left-0.5 sm:left-1.5 top-5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white shadow-xs z-10 ${
        transmission.version > 1 ? 'bg-amber-500 text-white' : 'bg-[#006591] text-white'
      }`}>
        <GitCommit className="w-3 h-3" />
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          {/* Author info & timestamp */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#006591] text-white flex items-center justify-center text-xs font-extrabold shadow-xs">
              {initials || 'ID'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">{transmission.nurseName}</span>
                {/* Git Version Tag */}
                {transmission.version > 1 ? (
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300/60 flex items-center gap-1">
                    <GitBranch className="w-3 h-3 text-amber-600" />
                    v{transmission.version} {transmission.lastModifiedAt && `- modifiée à ${transmission.lastModifiedAt}`}
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold bg-sky-100 text-[#006591] px-2 py-0.5 rounded-md border border-sky-200">
                    v1 (Original)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium pt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Passage du {transmission.passageDate} à {transmission.passageTime}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {isLatest && onEdit && (
              <button
                onClick={() => onEdit(transmission)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title="Modifier cette transmission du jour"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#0ea5e9]" />
                <span className="hidden sm:inline">Modifier</span>
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title={isOpen ? "Réduire les détails DAR" : "Déplier la transmission"}
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Section Diffs Clés Badges */}
        {diffBadges.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#0ea5e9]" /> Diffs Clés :
            </span>
            {diffBadges.map((badge, idx) => {
              let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
              let icon = null;

              if (badge.type === 'increase') {
                badgeStyle = "bg-red-50 text-red-800 border-red-200/80 font-extrabold";
                icon = <TrendingUp className="w-3 h-3 text-red-600" />;
              } else if (badge.type === 'decrease') {
                badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200/80 font-extrabold";
                icon = <TrendingDown className="w-3 h-3 text-emerald-600" />;
              } else if (badge.type === 'new') {
                badgeStyle = "bg-purple-50 text-purple-800 border-purple-200/80 font-extrabold";
                icon = <PlusCircle className="w-3 h-3 text-purple-600" />;
              }

              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border shadow-2xs ${badgeStyle}`}
                >
                  {icon}
                  <span>{badge.value}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Cible Highlight */}
        <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70 flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-[#006591] uppercase tracking-wider">Cible :</span>
          <span className="text-xs font-bold text-slate-800">{transmission.cible}</span>
        </div>

        {/* Accordion DAR Content */}
        {isOpen && (
          <div className="space-y-3 pt-2 animate-fadeIn">
            {/* Structured DAR Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              {/* Données */}
              <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-100 space-y-1">
                <span className="font-extrabold text-[#006591] text-[11px] block">
                  D - Données
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">{transmission.donnees}</p>
              </div>

              {/* Actions */}
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 space-y-1">
                <span className="font-extrabold text-emerald-800 text-[11px] block">
                  A - Actions
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">{transmission.actions}</p>
              </div>

              {/* Résultats */}
              <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 space-y-1">
                <span className="font-extrabold text-purple-800 text-[11px] block">
                  R - Résultats
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">{transmission.resultats}</p>
              </div>
            </div>

            {/* Constantes Row */}
            {(transmission.constantes.tension || transmission.constantes.glycemie || transmission.constantes.temperature || transmission.constantes.pouls) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-[#0ea5e9]" /> Constantes :
                </span>

                {transmission.constantes.tension && (
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                    TA: {transmission.constantes.tension} mmHg
                  </span>
                )}
                {transmission.constantes.glycemie && (
                  <span className="text-[11px] font-bold bg-sky-100 text-sky-900 px-2.5 py-1 rounded-md border border-sky-200">
                    Glycémie: {transmission.constantes.glycemie} g/L
                  </span>
                )}
                {transmission.constantes.temperature && (
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-200">
                    Temp: {transmission.constantes.temperature}°C
                  </span>
                )}
                {transmission.constantes.pouls && (
                  <span className="text-[11px] font-bold bg-rose-100 text-rose-900 px-2.5 py-1 rounded-md border border-rose-200">
                    Pouls: {transmission.constantes.pouls} bpm
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
