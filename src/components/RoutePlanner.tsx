import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  TourneePatient, 
  StatutTournee, 
  TourneeColumn,
  getStoredTourneePatients, 
  saveStoredTourneePatients,
  getStoredTourneeColumns
} from '../data/mockPatients';
import { VoiceRouteControl } from './VoiceRouteControl';
import { 
  MapPin, 
  Navigation, 
  Sun, 
  Moon, 
  Clock, 
  Stethoscope, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  List,
  Map as MapIcon,
  Home,
  Building2,
  Edit2,
  Check,
  Zap,
  Route
} from 'lucide-react';

// Helper component to auto-recenter map bounds when points change
const MapBoundsHandler: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [positions, map]);

  return null;
};

// Custom start departure marker
const createStartIcon = () => {
  return L.divIcon({
    className: 'custom-start-marker',
    html: `
      <div style="
        background-color: #16a34a;
        color: white;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      ">
        🚩
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
};

// Custom numbered badge marker icon for Leaflet
const createNumberedIcon = (number: number, isSelected = false) => {
  const bgColor = isSelected ? '#0ea5e9' : '#006591';
  return L.divIcon({
    className: 'custom-numbered-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s ease;
      ">
        ${number}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
};

export interface DepartureAddress {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

const DEPARTURE_PRESETS: DepartureAddress[] = [
  {
    name: 'Cabinet IDEL Graslin',
    address: '10 Rue Jean-Jacques Rousseau, 44000 Nantes',
    lat: 47.2140,
    lng: -1.5580
  },
  {
    name: 'Domicile Infirmière (Île de Nantes)',
    address: '15 Boulevard Boffrand, 44200 Nantes',
    lat: 47.2050,
    lng: -1.5510
  },
  {
    name: 'CHU de Nantes (Ricordeau)',
    address: '1 Place Alexis-Ricordeau, 44000 Nantes',
    lat: 47.2114,
    lng: -1.5539
  }
];

interface RoutePlannerProps {
  onSuccessToast?: (msg: string) => void;
  onNavigateToTourneeManager: () => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  onSuccessToast,
  onNavigateToTourneeManager
}) => {
  const [allPatients, setAllPatients] = useState<TourneePatient[]>([]);
  const [tourneeColumns, setTourneeColumns] = useState<TourneeColumn[]>([]);
  const [activeTour, setActiveTour] = useState<string>('MATIN');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Departure address state
  const [departure, setDeparture] = useState<DepartureAddress>(() => {
    const saved = localStorage.getItem('caretone_departure_address');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEPARTURE_PRESETS[0];
  });
  const [isEditingDeparture, setIsEditingDeparture] = useState(false);
  const [customAddressInput, setCustomAddressInput] = useState(departure.address);

  useEffect(() => {
    const loaded = getStoredTourneePatients();
    setAllPatients(loaded);
    const cols = getStoredTourneeColumns();
    setTourneeColumns(cols);
    
    // Set default activeTour if current activeTour is not in columns
    const activeCols = cols.filter(c => c.id !== 'UNASSIGNED');
    if (activeCols.length > 0 && !activeCols.some(c => c.id === activeTour)) {
      setActiveTour(activeCols[0].id);
    }
  }, []);

  const savePatients = (updated: TourneePatient[]) => {
    setAllPatients(updated);
    saveStoredTourneePatients(updated);
  };

  const handleSelectPresetDeparture = (preset: DepartureAddress) => {
    setDeparture(preset);
    setCustomAddressInput(preset.address);
    localStorage.setItem('caretone_departure_address', JSON.stringify(preset));
    setIsEditingDeparture(false);
    if (onSuccessToast) {
      onSuccessToast(`Adresse de départ définie sur : ${preset.name}`);
    }
  };

  const handleSaveCustomDeparture = () => {
    if (!customAddressInput.trim()) return;
    const newDep: DepartureAddress = {
      name: 'Adresse Personnalisée',
      address: customAddressInput,
      lat: departure.lat,
      lng: departure.lng
    };
    setDeparture(newDep);
    localStorage.setItem('caretone_departure_address', JSON.stringify(newDep));
    setIsEditingDeparture(false);
    if (onSuccessToast) {
      onSuccessToast(`Adresse de départ enregistrée !`);
    }
  };

  // Get current tour patients sorted by orderIndex
  const currentTourPatients = allPatients
    .filter(p => p.statutTournee === activeTour)
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  // Coordinates array including departure point at index 0
  const positions: [number, number][] = [
    [departure.lat, departure.lng],
    ...currentTourPatients.map(p => [p.lat, p.lng] as [number, number])
  ];

  // Open multi-stop route in Google Maps starting from Departure
  const handleOpenGoogleMapsRoute = () => {
    if (currentTourPatients.length === 0) return;
    const waypointsStr = [
      `${departure.lat},${departure.lng}`,
      ...currentTourPatients.map(p => `${p.lat},${p.lng}`)
    ].join('/');

    const googleMapsUrl = `https://www.google.com/maps/dir/${waypointsStr}`;
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    if (onSuccessToast) {
      onSuccessToast(`Itinéraire complet avec départ ouvert dans Google Maps !`);
    }
  };

  // Move patient up or down in the timeline
  const handleMovePatient = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentTourPatients.length) return;

    const listCopy = [...currentTourPatients];
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;

    const updatedList = listCopy.map((item, idx) => ({
      ...item,
      orderIndex: idx
    }));

    const otherPatients = allPatients.filter(p => p.statutTournee !== activeTour);
    const finalAll = [...otherPatients, ...updatedList];
    savePatients(finalAll);

    if (onSuccessToast) {
      onSuccessToast(`Ordre de passage réordonné.`);
    }
  };

  // Distance calculation helper (Haversine formula in km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Recalculate shortest route from Departure point through all patients
  // while strictly maintaining mandatory time constraints for fixed-time patients
  const handleOptimizeShortestRoute = () => {
    if (currentTourPatients.length <= 1) {
      if (onSuccessToast) onSuccessToast("Au moins 2 patients sont nécessaires pour optimiser le trajet.");
      return;
    }

    // Separate patients with fixed mandatory time slots vs flexible patients
    const fixedPatients = currentTourPatients
      .filter(p => p.hasFixedTime && p.heurePassage && p.heurePassage.trim() !== '' && p.heurePassage !== 'Flexible')
      .sort((a, b) => (a.heurePassage || '').localeCompare(b.heurePassage || ''));

    const flexiblePatients = currentTourPatients.filter(
      p => !p.hasFixedTime || !p.heurePassage || p.heurePassage.trim() === '' || p.heurePassage === 'Flexible'
    );

    let finalOrderedSequence: TourneePatient[] = [];

    if (fixedPatients.length > 0) {
      // Start with fixed constraint patients as ordered backbone anchors
      finalOrderedSequence = [...fixedPatients];

      // Insert each flexible patient into the position that minimizes overall added route distance
      flexiblePatients.forEach(flexP => {
        let bestInsertionIndex = 0;
        let minAddedDistance = Infinity;

        for (let i = 0; i <= finalOrderedSequence.length; i++) {
          const candidateSeq = [
            ...finalOrderedSequence.slice(0, i),
            flexP,
            ...finalOrderedSequence.slice(i)
          ];

          let pathDist = 0;
          let prevLat = departure.lat;
          let prevLng = departure.lng;

          for (const stop of candidateSeq) {
            pathDist += calculateDistance(prevLat, prevLng, stop.lat, stop.lng);
            prevLat = stop.lat;
            prevLng = stop.lng;
          }

          if (pathDist < minAddedDistance) {
            minAddedDistance = pathDist;
            bestInsertionIndex = i;
          }
        }

        finalOrderedSequence.splice(bestInsertionIndex, 0, flexP);
      });
    } else {
      // Nearest neighbor search if all patients are flexible
      let unvisited = [...flexiblePatients];
      let currentLat = departure.lat;
      let currentLng = departure.lng;

      while (unvisited.length > 0) {
        let nearestIdx = 0;
        let minDistance = Infinity;

        for (let i = 0; i < unvisited.length; i++) {
          const dist = calculateDistance(currentLat, currentLng, unvisited[i].lat, unvisited[i].lng);
          if (dist < minDistance) {
            minDistance = dist;
            nearestIdx = i;
          }
        }

        const nextPatient = unvisited[nearestIdx];
        finalOrderedSequence.push(nextPatient);
        currentLat = nextPatient.lat;
        currentLng = nextPatient.lng;
        unvisited.splice(nearestIdx, 1);
      }
    }

    // Assign optimized orderIndex and compute precise passage time estimates
    const baseStartHour = activeTour === 'SOIR' ? 16 : 8;
    let currentMinutes = baseStartHour * 60;
    let prevLat = departure.lat;
    let prevLng = departure.lng;

    const reordered = finalOrderedSequence.map((item, idx) => {
      const travelDistKm = calculateDistance(prevLat, prevLng, item.lat, item.lng);
      const travelTimeMin = Math.max(3, Math.round(travelDistKm * 2) + 2);

      if (idx > 0) {
        currentMinutes += travelTimeMin;
      }

      const h = Math.floor(currentMinutes / 60);
      const m = Math.round(currentMinutes % 60);
      const estimatedTimeFormatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      const careDuration = item.estimatedDurationMinutes || 15;
      currentMinutes += careDuration;

      prevLat = item.lat;
      prevLng = item.lng;

      return {
        ...item,
        orderIndex: idx,
        heurePassage: item.hasFixedTime && item.heurePassage ? item.heurePassage : estimatedTimeFormatted
      };
    });

    const otherPatients = allPatients.filter(p => p.statutTournee !== activeTour);
    const finalAll = [...otherPatients, ...reordered];
    savePatients(finalAll);

    if (onSuccessToast) {
      if (fixedPatients.length > 0) {
        onSuccessToast(`⚡ Trajet le plus court recalculé ! ${fixedPatients.length} horaire(s) impératif(s) conservé(s) + insertion optimale des soins flexibles.`);
      } else {
        onSuccessToast(`⚡ Trajet le plus court recalculé pour tous les soins flexibles !`);
      }
    }
  };

  // Handle updates from voice control
  const handleVoiceRouteUpdate = (
    updatedRoute: Array<{ patientId: string; newTime: string; newOrderIndex: number }>
  ) => {
    const patientMap = new Map<string, TourneePatient>(allPatients.map(p => [p.id, p]));

    updatedRoute.forEach(item => {
      const p = patientMap.get(item.patientId);
      if (p) {
        patientMap.set(item.patientId, {
          ...p,
          heurePassage: item.newTime || p.heurePassage,
          orderIndex: item.newOrderIndex
        });
      }
    });

    const updatedAllArray: TourneePatient[] = Array.from(patientMap.values());
    savePatients(updatedAllArray);
  };

  const nantesCenter: [number, number] = [47.2183, -1.5536];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative min-h-screen pb-24">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#006591]/10 text-[#006591] text-[11px] font-extrabold uppercase rounded-md tracking-wider">
              Navigation IDEL Nantes
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">CareTone</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Carte & Planificateur d'Itinéraire</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculez votre itinéraire optimal au départ de votre cabinet ou domicile.
          </p>
        </div>

        {/* Tour selector & Google Maps Action */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOptimizeShortestRoute}
            disabled={currentTourPatients.length <= 1}
            title="Calcule l'ordre de passage optimal (TSP) pour minimer les kilomètres à partir de l'adresse de départ tout en respectant les horaires impératifs"
            className="flex items-center gap-2 bg-gradient-to-r from-[#0ea5e9] to-[#006591] hover:from-[#0284c7] hover:to-[#004c6e] disabled:opacity-50 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer border border-sky-400/30"
          >
            <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Recalculer Trajet le plus court</span>
          </button>

          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 flex-wrap">
            {tourneeColumns
              .filter(col => col.id !== 'UNASSIGNED')
              .map(col => {
                const isActive = activeTour === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => setActiveTour(col.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#006591] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {col.id === 'MATIN' ? (
                      <Sun className="w-3.5 h-3.5" />
                    ) : col.id === 'SOIR' ? (
                      <Moon className="w-3.5 h-3.5" />
                    ) : (
                      <Route className="w-3.5 h-3.5" />
                    )}
                    <span>{col.title}</span>
                  </button>
                );
              })}
          </div>

          <button
            onClick={onNavigateToTourneeManager}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Organiser les Tournées</span>
          </button>

          <button
            onClick={handleOpenGoogleMapsRoute}
            disabled={currentTourPatients.length === 0}
            className="flex items-center gap-2 bg-[#006591] hover:bg-[#004d70] disabled:bg-slate-300 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-sky-300" />
            <span>Ouvrir dans Google Maps</span>
            <ExternalLink className="w-3 h-3 text-sky-200" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Timeline list, Right Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Departure Address Box & Timeline list of stops */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
          
          {/* Departure Address Section */}
          <div className="bg-emerald-50/70 border-2 border-emerald-200 p-4 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  🚩
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Adresse de Départ du Trajet
                  </h3>
                  <p className="text-[11px] text-emerald-700 font-semibold">{departure.name}</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditingDeparture(!isEditingDeparture)}
                className="p-1.5 bg-white hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Modifier</span>
              </button>
            </div>

            {isEditingDeparture ? (
              <div className="space-y-2 pt-2 border-t border-emerald-200">
                <p className="text-[10px] font-bold text-emerald-800 uppercase">Choisir un point de départ :</p>
                <div className="flex flex-col gap-1">
                  {DEPARTURE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPresetDeparture(p)}
                      className={`text-left p-2 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                        departure.name === p.name
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold block">{p.name}</span>
                        <span className="text-[10px] opacity-80">{p.address}</span>
                      </div>
                      {departure.name === p.name && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase mb-1">Ou saisir une adresse personnalisée :</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAddressInput}
                      onChange={e => setCustomAddressInput(e.target.value)}
                      placeholder="Ex: 5 Rue Jeanne d'Arc, 44000 Nantes"
                      className="flex-1 p-2 bg-white border border-emerald-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleSaveCustomDeparture}
                      className="px-3 py-2 bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer hover:bg-emerald-800"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-emerald-200/80">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800 leading-snug">{departure.address}</span>
              </div>
            )}
          </div>

          {/* Timeline Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <List className="w-4 h-4 text-[#006591]" />
                <span>Ordre des Passages</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                {currentTourPatients.length} patient(s) dans {tourneeColumns.find(c => c.id === activeTour)?.title || 'la tournée'}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-sky-50 text-[#006591] font-bold text-xs rounded-lg">
              {tourneeColumns.find(c => c.id === activeTour)?.title || 'Tournée'}
            </span>
          </div>

          {currentTourPatients.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 gap-2">
              <MapIcon className="w-8 h-8 opacity-40 text-slate-400" />
              <p className="text-xs font-semibold">Aucun patient affecté à cette tournée.</p>
              <button
                onClick={onNavigateToTourneeManager}
                className="mt-2 text-xs text-[#006591] hover:underline font-bold cursor-pointer"
              >
                Affecter des patients via le Gestionnaire de Tournées →
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {currentTourPatients.map((patient, index) => {
                const isSelected = selectedPatientId === patient.id;

                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex items-start gap-3 ${
                      isSelected
                        ? 'bg-sky-50/80 border-[#0ea5e9] ring-2 ring-sky-200 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Number Badge */}
                    <div className="w-7 h-7 rounded-full bg-[#006591] text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5 shadow-xs">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {patient.nom}
                        </span>
                        <span className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[11px] border shadow-2xs ${
                          patient.hasFixedTime && patient.heurePassage
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-sky-50 text-[#006591] border-sky-200'
                        }`}>
                          <Clock className="w-3 h-3 shrink-0" />
                          {patient.hasFixedTime && patient.heurePassage ? (
                            <span>🎯 Fixe : {patient.heurePassage}</span>
                          ) : patient.heurePassage ? (
                            <span>🕒 Estimé ~{patient.heurePassage}</span>
                          ) : (
                            <span>Passage Flexible</span>
                          )}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{patient.adresse}</span>
                      </p>

                      <p className="text-[11px] text-sky-800 bg-sky-100/70 inline-block px-2 py-0.5 rounded-md font-medium mt-1.5">
                        {patient.typeSoin}
                      </p>
                    </div>

                    {/* Up / Down Controls */}
                    <div className="flex flex-col gap-1 shrink-0 ml-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleMovePatient(index, 'up');
                        }}
                        disabled={index === 0}
                        title="Monter cette étape"
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-200/60 rounded cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleMovePatient(index, 'down');
                        }}
                        disabled={index === currentTourPatients.length - 1}
                        title="Descendre cette étape"
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-200/60 rounded cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: OpenStreetMap Leaflet Map */}
        <div className="lg:col-span-7 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs h-[360px] sm:h-[480px] lg:h-[650px] flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/80 rounded-t-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <MapIcon className="w-4 h-4 text-[#006591]" />
              <span>Carte des Parcours Nantes</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Départ 🚩 + {currentTourPatients.length} étape(s)
            </span>
          </div>

          <div className="flex-1 relative w-full h-full rounded-b-xl overflow-hidden z-0">
            <MapContainer
              center={nantesCenter}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Adjust map bounds dynamically */}
              <MapBoundsHandler positions={positions} />

              {/* Start Departure Marker */}
              <Marker
                position={[departure.lat, departure.lng]}
                icon={createStartIcon()}
              >
                <Popup>
                  <div className="p-1 text-xs space-y-1">
                    <p className="font-extrabold text-emerald-800">🚩 DÉPART DE LA TOURNÉE</p>
                    <p className="font-bold text-slate-900">{departure.name}</p>
                    <p className="text-slate-600">{departure.address}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Polyline path starting from Departure */}
              {positions.length > 1 && (
                <Polyline
                  positions={positions}
                  pathOptions={{
                    color: '#006591',
                    weight: 4,
                    dashArray: '8, 8',
                    opacity: 0.8
                  }}
                />
              )}

              {/* Render Numbered Markers for Patients */}
              {currentTourPatients.map((patient, index) => {
                const isSelected = selectedPatientId === patient.id;

                return (
                  <Marker
                    key={patient.id}
                    position={[patient.lat, patient.lng]}
                    icon={createNumberedIcon(index + 1, isSelected)}
                    eventHandlers={{
                      click: () => setSelectedPatientId(patient.id)
                    }}
                  >
                    <Popup className="custom-leaflet-popup">
                      <div className="p-1 space-y-2 max-w-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                          <span className="font-extrabold text-slate-900 text-sm">
                            #{index + 1} {patient.nom}
                          </span>
                          <span className="text-xs font-bold text-[#006591] bg-sky-50 px-2 py-0.5 rounded">
                            {patient.heurePassage}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-tight">
                          {patient.adresse}
                        </p>

                        <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          <Stethoscope className="w-3.5 h-3.5 text-[#006591]" />
                          <span className="font-semibold">{patient.typeSoin}</span>
                        </div>

                        <button
                          onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&origin=${departure.lat},${departure.lng}&destination=${patient.lat},${patient.lng}`;
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          className="w-full mt-1 bg-[#006591] hover:bg-[#004d70] text-white py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5 text-sky-300" />
                          <span>Naviguer depuis le départ</span>
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Voice Route Control Floating FAB */}
      <VoiceRouteControl
        currentPatients={currentTourPatients}
        onRouteUpdated={handleVoiceRouteUpdate}
        onSuccessToast={onSuccessToast}
      />
    </div>
  );
};
