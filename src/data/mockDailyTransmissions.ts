import { DailyGlobalTransmission, TransmissionStatus, AlertSeverity } from '../types/transmission';

export const INITIAL_MOCK_DAILY_TRANSMISSIONS: Record<string, DailyGlobalTransmission> = {
  '2026-07-27': {
    id: 'dtx-2026-07-27',
    date: '2026-07-27',
    tourneeId: 'tournee-matin-nantes',
    status: TransmissionStatus.DRAFT,
    authorId: 'nurse-1',
    authorName: 'Julie R. (IDEL Titulaire)',
    authorRole: 'Infirmière Libérale',
    summaryNote: `📋 SYNTHÈSE GLOBALE DE LA TOURNÉE DU MATIN :

1. Mme Dupont Jeanne :
   - Glycémie 1.4 g/L à 09h15 (recontrôlée post-collation).
   - Injection Novorapid 6 UI réalisée. Pansement orteil gauche refait, aspect très propre et sans surinfection.

2. M. Martin Bernard :
   - Plainte d'essoufflement modéré à l'effort au lever. Tension 14/8 mmHg, pouls 72.
   - Traitement cardiaque Kardegic + Tahor administré à 09h00. Repos au fauteuil conseillé.

3. M. Bernard Pierre :
   - Bilan sanguin de contrôle INR effectué à jeun à 08h15, tube transmis au laboratoire à 09h30.
   - Résultat INR reçu à 12h00 : 2.8 (dans la cible). Prochain passage prévu demain matin.

4. Consignes pour la tournée du Soir :
   - Recontrôler la tension artérielle de M. Martin Bernard à 18h00.
   - Prévoir le renouvellement de l'ordonnance d'insuline pour Mme Dupont auprès du Dr Morel.`,
    voiceNoteUrl: 'demo-voice-note-2026-07-27.mp3',
    voiceNoteDuration: 84, // 1 min 24 sec
    alerts: [
      {
        id: 'alt-101',
        dailyTransmissionId: 'dtx-2026-07-27',
        patientId: 'p1',
        patientName: 'Jean Dupont',
        severity: AlertSeverity.HIGH,
        description: 'Glycémie matinale à 2.1 g/L avec sueurs au réveil -> Injection de 6 UI Novorapid effectuée & recontrôlée à 1.4 g/L.',
        createdAt: '2026-07-27T08:35:00Z'
      },
      {
        id: 'alt-102',
        dailyTransmissionId: 'dtx-2026-07-27',
        patientId: 'p2',
        patientName: 'Marie Lefebvre',
        severity: AlertSeverity.MEDIUM,
        description: 'Essoufflement modéré au lever, TA 14/8 mmHg. Repos au fauteuil préconisé. Surveillance ce soir.',
        createdAt: '2026-07-27T09:10:00Z'
      }
    ],
    createdAt: '2026-07-27T08:00:00Z',
    updatedAt: '2026-07-27T12:30:00Z'
  },
  '2026-07-26': {
    id: 'dtx-2026-07-26',
    date: '2026-07-26',
    tourneeId: 'tournee-dimanche',
    status: TransmissionStatus.SUBMITTED,
    authorId: 'nurse-2',
    authorName: 'Marc T. (IDEL Remplaçant)',
    authorRole: 'Infirmier Remplaçant',
    summaryNote: ` Tournée de dimanche calme et fluide. Tous les soins du matin et du soir ont été dispensés à l'heure. Pansements lourds effectués chez M. Bernard avec très bonne tolérance.`,
    voiceNoteUrl: 'demo-voice-note-2026-07-26.mp3',
    voiceNoteDuration: 45,
    alerts: [
      {
        id: 'alt-201',
        dailyTransmissionId: 'dtx-2026-07-26',
        patientId: 'p3',
        patientName: 'Pierre Bernard',
        severity: AlertSeverity.CRITICAL,
        description: 'Pic hypertensif à 17/10 mmHg au réveil. Dr Morel informé, repos 30 min prescrit.',
        createdAt: '2026-07-26T08:20:00Z'
      }
    ],
    createdAt: '2026-07-26T08:00:00Z',
    updatedAt: '2026-07-26T19:45:00Z'
  }
};

const STORAGE_KEY = 'caretone_daily_global_transmissions_v2';

export function getStoredDailyTransmissions(): Record<string, DailyGlobalTransmission> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse daily transmissions from localStorage', e);
  }
  return INITIAL_MOCK_DAILY_TRANSMISSIONS;
}

export function saveDailyTransmission(tx: DailyGlobalTransmission): Record<string, DailyGlobalTransmission> {
  const currentMap = getStoredDailyTransmissions();
  const updatedMap = {
    ...currentMap,
    [tx.date]: tx
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMap));
  } catch (e) {
    console.error('Failed to save daily transmission to localStorage', e);
  }

  return updatedMap;
}

export function createEmptyDailyTransmission(dateStr: string, authorName = 'Julie R. (IDEL Titulaire)'): DailyGlobalTransmission {
  return {
    id: `dtx-${dateStr}-${Date.now()}`,
    date: dateStr,
    status: TransmissionStatus.DRAFT,
    authorId: 'nurse-current',
    authorName,
    authorRole: 'Infirmière Libérale',
    summaryNote: '',
    alerts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
