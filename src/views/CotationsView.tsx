import React, { useState } from 'react';
import { CotationItem, Patient } from '../types';
import { CotationAssistantPanel } from '../components/CotationAssistantPanel';
import { PageVoiceMicButton } from '../components/PageVoiceMicButton';
import { 
  Download, 
  Plus, 
  Clock, 
  Receipt, 
  CheckCircle2, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Edit, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface CotationsViewProps {
  cotations: CotationItem[];
  patients: Patient[];
  onOpenNewCotation: () => void;
  onAddCotation?: (cotation: Omit<CotationItem, 'id' | 'status'>) => void;
  onSuccessToast?: (msg: string) => void;
}

export const CotationsView: React.FC<CotationsViewProps> = ({
  cotations,
  patients,
  onOpenNewCotation,
  onAddCotation,
  onSuccessToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<'tous' | 'brouillon' | 'valide' | 'envoye'>('tous');
  const [showAssistant, setShowAssistant] = useState(true);

  const filteredCotations = cotations.filter((c) => {
    const matchesSearch = 
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeStatusTab === 'tous') return matchesSearch;
    return matchesSearch && c.status === activeStatusTab;
  });

  const totalPendingAmount = cotations
    .filter(c => c.status === 'brouillon')
    .reduce((acc, curr) => acc + curr.amount, 0) + 450.00;

  const totalPaidAmount = cotations
    .filter(c => c.status === 'envoye' || c.status === 'valide')
    .reduce((acc, curr) => acc + curr.amount, 0) + 3240.50;

  const handleExportCSV = () => {
    const headers = ["ID", "Date", "Patient", "Code NGAP", "Description", "Montant (€)", "Statut"];
    const rows = filteredCotations.map(c => [
      c.id,
      c.date,
      `"${c.patientName}"`,
      c.code,
      `"${c.description}"`,
      c.amount,
      c.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cotations_caretone_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onSuccessToast) {
      onSuccessToast("Fichier CSV de cotations télétransmises téléchargé avec succès !");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cotations & Facturation</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Gérez vos actes infirmiers (NGAP / BSI), suivez les paiements et télétransmettez vos factures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAssistant(!showAssistant)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{showAssistant ? 'Masquer l\'Assistant NGAP' : 'Assistant NGAP'}</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exporter</span>
          </button>

          <button
            onClick={onOpenNewCotation}
            className="px-4 py-2 bg-[#006591] hover:bg-[#004c6e] text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Cotation</span>
          </button>
        </div>
      </div>

      {/* Cotation Smart Assistant NGAP Panel */}
      {showAssistant && onAddCotation && (
        <CotationAssistantPanel
          patients={patients}
          onAddCotation={onAddCotation}
          onSuccessToast={onSuccessToast}
        />
      )}

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Actes en attente */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-sky-50 text-[#006591] rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              Ce mois
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Actes en attente</p>
            <h3 className="text-2xl font-bold text-slate-800">
              12 <span className="text-xs font-semibold text-slate-400">actes</span>
            </h3>
          </div>
        </div>

        {/* Card 2: Montant à facturer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 bg-red-100 text-red-700 rounded-full">
              À télétransmettre
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Montant à facturer</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {totalPendingAmount.toFixed(2).replace('.', ',')} €
            </h3>
          </div>
        </div>

        {/* Card 3: Facturé & Payé */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full">
              Payé
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Facturé & Payé</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {totalPaidAmount.toFixed(2).replace('.', ',')} €
            </h3>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Chercher une cotation ou un patient..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none"
              />
            </div>
          </div>

          <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
            <button
              onClick={() => setActiveStatusTab('tous')}
              className={`px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                activeStatusTab === 'tous'
                  ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveStatusTab('brouillon')}
              className={`px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                activeStatusTab === 'brouillon'
                  ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Brouillon
            </button>
            <button
              onClick={() => setActiveStatusTab('valide')}
              className={`px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                activeStatusTab === 'valide'
                  ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Validé
            </button>
            <button
              onClick={() => setActiveStatusTab('envoye')}
              className={`px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                activeStatusTab === 'envoye'
                  ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Envoyé
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Date du soin</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Cotation (Acte NGAP)</th>
                <th className="p-4 text-right">Montant</th>
                <th className="p-4 text-center">Statut</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredCotations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 whitespace-nowrap text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.date}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{item.patientName}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#006591]">{item.code}</span>
                      <span className="text-[11px] text-slate-500">{item.description}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-800">
                    {item.amount.toFixed(2).replace('.', ',')} €
                  </td>
                  <td className="p-4 text-center">
                    {item.status === 'brouillon' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Brouillon
                      </span>
                    )}
                    {item.status === 'valide' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> Validé
                      </span>
                    )}
                    {item.status === 'envoye' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600" /> Envoyé
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-slate-400 hover:text-[#006591] p-1 transition-colors cursor-pointer">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 bg-slate-50/50">
          <span>Affichage {filteredCotations.length} cotations</span>
          <div className="flex gap-1">
            <button className="p-1 border border-slate-300 rounded bg-white hover:bg-slate-100 text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 border border-slate-300 rounded bg-white hover:bg-slate-100 text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Voice Assistant button for Cotations */}
      <PageVoiceMicButton
        pageTitle="Cotations & Facturation NGAP"
        placeholderExamples={[
          "Ajouter cotation AMI 4 pour M. Dupont",
          "Créer forfait bilan BSI 15€",
          "Saisir indemnité forfaitaire de déplacement IFD"
        ]}
        onVoiceCommand={(cmd) => {
          if (onAddCotation) {
            onAddCotation({
              date: 'Aujourd\'hui',
              patientName: 'Mme / M. Patient (Dicté)',
              code: 'AMI 4 + IFD',
              description: cmd,
              amount: 15.10
            });
          }
        }}
      />
    </div>
  );
};
