import React, { useState, useEffect } from 'react';
import { DarTransmission } from '../types/transmission';
import { calculateTransmissionDiff } from '../utils/diffCalculators';
import { TransmissionForm } from '../components/TransmissionForm';
import { TransmissionCard } from '../components/TransmissionCard';
import { PageVoiceMicButton } from '../components/PageVoiceMicButton';
import { 
  GitBranch, 
  GitCommit, 
  User, 
  Search, 
  Filter, 
  Sparkles, 
  History, 
  CheckCircle2, 
  Clock, 
  Layers,
  ArrowLeft
} from 'lucide-react';

interface PatientOption {
  id: string;
  name: string;
  chambre?: string;
  age?: number;
}

const DEFAULT_PATIENTS: PatientOption[] = [
  { id: 'pat-1', name: 'Mme DUPONT Jeanne', chambre: 'Ch. 102', age: 78 },
  { id: 'pat-2', name: 'M. MARTIN Bernard', chambre: 'Ch. 205', age: 82 },
  { id: 'pat-3', name: 'M. BERNARD Pierre', chambre: 'Domicile', age: 69 }
];

const INITIAL_MOCK_TRANSMISSIONS: Record<string, DarTransmission[]> = {
  'pat-1': [
    {
      id: 'tx-1-3',
      patientId: 'pat-1',
      nurseName: 'Julie IDEL',
      passageDate: '26 Juillet 2026',
      passageTime: '09:15',
      version: 2,
      lastModifiedAt: '09:20',
      cible: 'Glycémie & Surveillance Insuline',
      donnees: 'Glycémie recontrôlée à 1.4 g/L post-collation. Patient réveillé et lucide. Constantes stables.',
      actions: 'Collation prise (jus de fruit + 2 biscuits). Réévaluation des signes d\'hypoglycémie.',
      resultats: 'Normalisation de la glycémie. État général rassurant.',
      constantes: {
        tension: '13/8',
        glycemie: '1.4',
        temperature: '36.8',
        pouls: '72'
      }
    },
    {
      id: 'tx-1-2',
      patientId: 'pat-1',
      nurseName: 'Julie IDEL',
      passageDate: '26 Juillet 2026',
      passageTime: '08:30',
      version: 1,
      cible: 'Glycémie & Injection Insuline',
      donnees: 'Glycémie à jeun 2.1 g/L. Tension 15/9 mmHg. Légère sueur du réveil.',
      actions: 'Injection de 6 UI d\'insuline rapide NovoRapid sous-cutanée cuisse droite.',
      resultats: 'Injection bien tolérée. Petit déjeuner servi.',
      constantes: {
        tension: '15/9',
        glycemie: '2.1',
        temperature: '37.0',
        pouls: '78'
      }
    },
    {
      id: 'tx-1-1',
      patientId: 'pat-1',
      nurseName: 'Sophie M. IDEL',
      passageDate: '25 Juillet 2026',
      passageTime: '18:45',
      version: 1,
      cible: 'Plaie Sacrum & Bilan Vespéral',
      donnees: 'Pansement du sacrum propre et sec. Bourgeonnement satisfaisant.',
      actions: 'Nettoyage sérum phy, application hydrocolloïde.',
      resultats: 'Absence de douleur à la réfection.',
      constantes: {
        tension: '12/8',
        glycemie: '1.6',
        temperature: '36.9'
      }
    }
  ],
  'pat-2': [
    {
      id: 'tx-2-1',
      patientId: 'pat-2',
      nurseName: 'Julie IDEL',
      passageDate: '26 Juillet 2026',
      passageTime: '09:00',
      version: 1,
      cible: 'Administration traitement cardiaque',
      donnees: 'Tension 14/8, plaintes d\'essoufflement modéré à l\'effort.',
      actions: 'Prise des ttt matinaux validée (Kardegic + Tahor).',
      resultats: 'Repos au fauteuil conseillé.',
      constantes: {
        tension: '14/8',
        temperature: '36.7',
        pouls: '68'
      }
    }
  ]
};

export const TransmissionPage: React.FC = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1');
  const [transmissionsMap, setTransmissionsMap] = useState<Record<string, DarTransmission[]>>(() => {
    try {
      const stored = localStorage.getItem('idel_transmissions_git');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MOCK_TRANSMISSIONS;
  });

  const [editingPassage, setEditingPassage] = useState<DarTransmission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem('idel_transmissions_git', JSON.stringify(transmissionsMap));
    } catch (e) {
      console.error(e);
    }
  }, [transmissionsMap]);

  const activePatient = DEFAULT_PATIENTS.find(p => p.id === selectedPatientId) || DEFAULT_PATIENTS[0];
  const activeTransmissions = transmissionsMap[selectedPatientId] || [];

  // Filtered by search if typed
  const filteredTransmissions = activeTransmissions.filter(t => 
    t.cible.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.donnees.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nurseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSavePassage = (data: Omit<DarTransmission, 'id'>, isEditingCurrent: boolean) => {
    setTransmissionsMap(prev => {
      const currentList = prev[selectedPatientId] ? [...prev[selectedPatientId]] : [];

      if (isEditingCurrent && editingPassage) {
        // Replace existing current passage with updated version
        const updatedList = currentList.map(item => {
          if (item.id === editingPassage.id) {
            return {
              ...data,
              id: item.id
            };
          }
          return item;
        });

        return { ...prev, [selectedPatientId]: updatedList };
      } else {
        // Create new passage commit
        const newCommit: DarTransmission = {
          ...data,
          id: `tx-${selectedPatientId}-${Date.now()}`
        };

        return { ...prev, [selectedPatientId]: [newCommit, ...currentList] };
      }
    });

    setEditingPassage(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Patient Header */}
      <div className="bg-gradient-to-r from-[#006591] via-[#004c6e] to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-300 bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-500/30">
                Medical Git Feed
              </span>
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-sky-400" /> Traçabilité en temps réel
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Transmissions Médicales & Versioning
            </h1>
            <p className="text-xs text-sky-100/80">
              Historique des passages horodatés, badges de diffs biologiques et commits de soins DAR.
            </p>
          </div>

          {/* Patient Selector */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 min-w-[240px]">
            <label className="text-[11px] font-bold text-sky-200 block mb-1">
              Sélectionner le Patient :
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                setEditingPassage(null);
              }}
              className="w-full bg-white text-slate-900 font-extrabold text-xs px-3 py-2 rounded-xl outline-none cursor-pointer shadow-xs"
            >
              {DEFAULT_PATIENTS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.chambre})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Patient Info Strip */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/10 text-xs text-sky-100 font-medium">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-sky-300" />
            <span className="font-bold text-white">{activePatient.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-sky-300" />
            <span>{activeTransmissions.length} passage(s) enregistré(s)</span>
          </div>
        </div>
      </div>

      {/* Formulaire du passage courant */}
      <section className="space-y-2">
        <TransmissionForm
          patientId={selectedPatientId}
          patientName={activePatient.name}
          currentPassage={editingPassage || (activeTransmissions.length > 0 ? activeTransmissions[0] : null)}
          onSubmitPassage={handleSavePassage}
          onCancelEdit={() => setEditingPassage(null)}
        />
      </section>

      {/* Medical Feed Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-[#006591] rounded-xl font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">
                Historique des Passages (Medical Feed)
              </h2>
              <p className="text-xs text-slate-500">
                Commits de soins chronologiques avec calcul automatique des Diffs
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher cible, donnée..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0ea5e9] outline-none"
            />
          </div>
        </div>

        {/* Commit Cards Timeline */}
        {filteredTransmissions.length > 0 ? (
          <div className="space-y-4 pt-2 relative">
            {filteredTransmissions.map((tx, index) => {
              // The previous passage in time is the next item in the array (since sorted newest first)
              const previousTx = filteredTransmissions[index + 1];

              return (
                <TransmissionCard
                  key={tx.id}
                  transmission={tx}
                  previousTransmission={previousTx}
                  isLatest={index === 0}
                  onEdit={(t) => setEditingPassage(t)}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <GitCommit className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">Aucun passage enregistré pour ce patient.</p>
            <p className="text-[11px] text-slate-400">Saisissez une première transmission dans le formulaire ci-dessus.</p>
          </div>
        )}
      </section>

      {/* Voice Assistant Button for Transmission Page */}
      <PageVoiceMicButton
        pageTitle="Transmissions Médicales"
        placeholderExamples={[
          "Dictée : Glycémie 1.4g/L, tension 13/8, insuline faite",
          "Nouveau passage pour Mme Dupont",
          "Rechercher transmission glycémie"
        ]}
        onVoiceCommand={(cmd) => {
          setSearchQuery(cmd);
        }}
      />
    </div>
  );
};
