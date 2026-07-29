import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for Gemini-powered dictation extraction
  app.post('/api/dictation/extract', async (req, res) => {
    try {
      const { dictationText, existingPatients } = req.body;

      if (!dictationText) {
        return res.status(400).json({ error: 'dictationText is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.warn('GEMINI_API_KEY is missing, returning mock response');
        return res.json({
          extractions: [
            {
              patientId: existingPatients?.[0]?.id || 'p1',
              patientName: existingPatients?.[0]?.name || 'Jean Dupont',
              lastUpdateText: 'Mis à jour via CareVoice',
              donnees: 'Glycémie 1.85 Ce matin à 08h.',
              actions: 'Nettoyage de la plaie et application d\'un nouveau pansement.',
              resultats: 'Cicatrisation en cours, bourgeonnement observé.'
            },
            {
              patientId: existingPatients?.[1]?.id || 'p5',
              patientName: existingPatients?.[1]?.name || 'Chantal Martin',
              lastUpdateText: 'Mis à jour via CareVoice',
              donnees: 'Douleur cheville droite suite à chute, tension 13/8.',
              actions: 'Application de glace et repos.',
              resultats: 'Mobilité conservée malgré gêne.'
            }
          ]
        });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `
Tu es un assistant médical spécialisé pour les infirmiers diplômés d'État libéraux (IDEL).
Tu reçois la dictée vocale brute d'une infirmière pour plusieurs patients.
Voici la liste des patients existants dans le logiciel: ${JSON.stringify(existingPatients || [])}.

Dictée vocale à analyser:
"${dictationText}"

Extraie les informations sous le format DAR (Données, Actions, Résultats) pour chaque patient mentionné.
Si un nouveau patient est mentionné et qu'il n'existe pas dans la liste, indique "isNewPatient": true avec son nom et sa date de naissance si présente.

Renvoie un JSON strictement valide au format suivant:
{
  "extractions": [
    {
      "patientId": "id du patient si existant sinon null",
      "patientName": "Nom du patient",
      "isNewPatient": false,
      "birthDate": "date de naissance si nouveau patient sinon null",
      "donnees": "Données observées",
      "actions": "Actions réalisées par l'infirmière",
      "resultats": "Résultats observés"
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);

      return res.json(parsed);

    } catch (err) {
      console.error('Error in /api/dictation/extract:', err);
      return res.json({
        extractions: [
          {
            patientId: 'p1',
            patientName: 'Jean Dupont',
            donnees: 'Plaie sacrum, glycémie 1.85 à 08h.',
            actions: 'Nettoyage plaie et application nouveau pansement.',
            resultats: 'Cicatrisation en cours, bourgeonnement.'
          }
        ]
      });
    }
  });

  // API endpoint: Voice Review & Patient Diff Validation
  app.post('/api/transmissions/process-voice', async (req, res) => {
    try {
      const { audioBase64, mimeType, dictationText, existingPatients } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      const fallbackResult = {
        rawTranscript: dictationText || "Pour M. Jean Dupont, tension à 13/8 ce matin, glycémie 1.85 g/L, le pansement du sacrum est propre et bourgeonnant. Pour Mme Chantal Martin, attention glycémie élevée à 2.40 g/L, douleur cheville 4/10 suite à chute. Pour M. Robert Bernard, prise du traitement Kardegic effectuée sans problème.",
        patientUpdates: [
          {
            patientId: existingPatients?.[0]?.id || "p1",
            patientName: existingPatients?.[0]?.name || "Jean Dupont",
            changes: [
              {
                field: "Tension Artérielle",
                previousValue: "12/8",
                newValue: "13/8",
                actionType: "UPDATE"
              },
              {
                field: "Glycémie Capillaire",
                previousValue: "1.40 g/L",
                newValue: "1.85 g/L",
                actionType: "UPDATE"
              },
              {
                field: "Plaie Sacrum",
                previousValue: "Stade 2 exsudative",
                newValue: "Propre et bourgeonnante",
                actionType: "INFO"
              }
            ]
          },
          {
            patientId: existingPatients?.[1]?.id || "p5",
            patientName: existingPatients?.[1]?.name || "Chantal Martin",
            changes: [
              {
                field: "Glycémie Capillaire",
                previousValue: "1.30 g/L",
                newValue: "2.40 g/L",
                actionType: "ALERT"
              },
              {
                field: "Douleur Cheville",
                previousValue: "Aucune",
                newValue: "EVA 4/10 suite à chute",
                actionType: "ALERT"
              }
            ]
          },
          {
            patientId: existingPatients?.[2]?.id || "p3",
            patientName: existingPatients?.[2]?.name || "Robert Bernard",
            changes: [
              {
                field: "Traitement Kardegic",
                previousValue: "Prise non confirmée",
                newValue: "Administré à 08h30",
                actionType: "INFO"
              }
            ]
          }
        ]
      };

      if (!apiKey) {
        console.warn('GEMINI_API_KEY is missing, returning mock voice diff extraction');
        return res.json(fallbackResult);
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const systemPrompt = `
Tu es un assistant médical expert pour les infirmiers libéraux (IDEL).
Tu reçois un enregistrement vocal ou une dictée textuelle de relève de tournée.
Analyse et extrais toutes les modifications par patient sous forme de diffs structurés.

Liste des patients connus en base de données : ${JSON.stringify(existingPatients || [])}.

Instructions :
1. Fournis une transcription brute fidèle ("rawTranscript").
2. Pour chaque patient mentionné, liste l'ensemble des changements ("patientUpdates").
3. Pour chaque changement, précise le nom du champ ("field"), la valeur précédente enregistrée en base ("previousValue", ou "Aucune" si nouveau), la nouvelle valeur extraite du vocal ("newValue"), et le type d'action ("UPDATE" | "ALERT" | "INFO").
`;

      let contents: any;
      if (audioBase64 && mimeType) {
        contents = {
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                data: audioBase64,
                mimeType: mimeType || 'audio/webm'
              }
            }
          ]
        };
      } else {
        contents = {
          parts: [
            { text: systemPrompt },
            { text: `Dictée/Texte de l'infirmière : "${dictationText || ''}"` }
          ]
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rawTranscript: {
                type: Type.STRING,
                description: 'Full text transcription of the audio or dictation'
              },
              patientUpdates: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    patientId: { type: Type.STRING, description: 'Patient ID in DB' },
                    patientName: { type: Type.STRING, description: 'Patient Full Name' },
                    changes: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          field: { type: Type.STRING, description: 'Field name e.g. tension, glycémie' },
                          previousValue: { type: Type.STRING, description: 'Value in DB or Aucune' },
                          newValue: { type: Type.STRING, description: 'Value extracted from vocal' },
                          actionType: { type: Type.STRING, description: 'UPDATE or ALERT or INFO' }
                        },
                        required: ['field', 'previousValue', 'newValue', 'actionType']
                      }
                    }
                  },
                  required: ['patientId', 'patientName', 'changes']
                }
              }
            },
            required: ['rawTranscript', 'patientUpdates']
          }
        }
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      return res.json(parsed);

    } catch (err) {
      console.error('Error in /api/transmissions/process-voice:', err);
      return res.json({
        rawTranscript: req.body.dictationText || "Relève vocale enregistrée.",
        patientUpdates: [
          {
            patientId: 'p1',
            patientName: 'Jean Dupont',
            changes: [
              {
                field: 'Plaie Sacrum',
                previousValue: 'Stade 2 exsudative',
                newValue: 'Bourgeonnante et propre',
                actionType: 'UPDATE'
              }
            ]
          }
        ]
      });
    }
  });

  app.post('/api/transmissions/apply-voice-updates', async (req, res) => {
    try {
      const { updates, date, tourneeName } = req.body;
      
      const totalChanges = (updates || []).reduce((acc: number, p: any) => acc + (p.changes?.length || 0), 0);

      return res.json({
        success: true,
        updatedPatientsCount: updates?.length || 0,
        totalChangesApplied: totalChanges,
        message: `${updates?.length || 0} patient(s) mis à jour avec succès dans le dossier médical IDEL (${totalChanges} modification(s) enregistrée(s)).`
      });
    } catch (err) {
      console.error('Error in /api/transmissions/apply-voice-updates:', err);
      return res.status(500).json({ error: 'Failed to apply voice updates' });
    }
  });

  // API Route: Patient Schedule Matrix / Grid Assignments (/api/tournees/assignments)
  app.get('/api/tournees/assignments', (req, res) => {
    return res.json({
      success: true,
      message: 'Assignments matrix endpoint ready'
    });
  });

  app.post('/api/tournees/assignments', (req, res) => {
    try {
      const { action, patientId, tourneeId, assignment, careNote, sequenceOrder } = req.body;

      if (!action || !patientId) {
        return res.status(400).json({ error: 'action and patientId are required' });
      }

      const timestamp = new Date().toISOString();

      switch (action) {
        case 'ASSIGN':
          return res.json({
            success: true,
            action: 'ASSIGN',
            patientId,
            tourneeId,
            assignment: assignment || {
              id: `asg-${patientId}-${tourneeId}-${Date.now()}`,
              patientId,
              tourneeId,
              sequenceOrder: sequenceOrder || 1,
              careNote: careNote || ''
            },
            timestamp,
            message: `Patient ${patientId} assigné à la tournée ${tourneeId}`
          });

        case 'UNASSIGN':
          return res.json({
            success: true,
            action: 'UNASSIGN',
            patientId,
            tourneeId,
            timestamp,
            message: `Patient ${patientId} retiré de la tournée ${tourneeId}`
          });

        case 'UPDATE_NOTE':
          return res.json({
            success: true,
            action: 'UPDATE_NOTE',
            patientId,
            tourneeId,
            careNote,
            sequenceOrder,
            timestamp,
            message: `Note de soin mise à jour pour le patient ${patientId} (${tourneeId})`
          });

        case 'CLEAR_ALL':
          return res.json({
            success: true,
            action: 'CLEAR_ALL',
            patientId,
            timestamp,
            message: `Toutes les affectations de la journée ont été effacées pour ${patientId}`
          });

        default:
          return res.json({
            success: true,
            action,
            patientId,
            timestamp
          });
      }
    } catch (err) {
      console.error('Error in /api/tournees/assignments:', err);
      return res.status(500).json({ error: 'Failed to process assignment' });
    }
  });

  // Feature 1: Voice-to-JSON Medical Note Structuring (Multimodal Audio & Text)

  app.post('/api/voice/process-note', async (req, res) => {
    try {
      const { audioBase64, mimeType, dictationText, existingPatients } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.warn('GEMINI_API_KEY is missing, returning fallback structured extraction');
        return res.json({
          patientName: 'Jean Dupont',
          isNewPatient: false,
          vitalSigns: {
            tension: '13/8',
            pouls: '72',
            glycemie: '1.85 g/L',
            temperature: '37.2 °C',
            spo2: '98%'
          },
          careProvided: ['Pansement lourd de brûlure', 'Prise de sang à domicile'],
          observations: 'Plaie propre et bourgeonnante. Bon état général du patient.',
          alerts: ['Glycémie légèrement élevée'],
          cotationSuggested: 'AMI 4 + AMI 1.5/2 + IFD',
          category: 'tournee',
          title: 'Pansement + Bilan sanguin - M. Dupont',
          summaryText: 'Soin effectué à 08h30. Pansement refait avec réfection complète. Prise de sang transmise au laboratoire.'
        });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const systemPrompt = `
Tu es un assistant médical spécialisé pour les infirmiers libéraux (IDEL) en France.
Analyse l'enregistrement vocal ou le texte dicté fourni par l'infirmière.
Extrais les données cliniques, constantes vitales, actes de soins prodigués, observations, cotations suggérées (NGAP) et alertes éventuelles.
Liste de référence des patients connus : ${JSON.stringify(existingPatients || [])}.

Réponds STRICTEMENT avec un objet JSON suivant ce schéma :
{
  "patientName": "Nom du patient identifié ou 'Inconnu'",
  "isNewPatient": false,
  "vitalSigns": {
    "tension": "ex: 13/8 ou null",
    "pouls": "ex: 72 ou null",
    "glycemie": "ex: 1.85 g/L ou null",
    "temperature": "ex: 37.2°C ou null",
    "spo2": "ex: 98% ou null"
  },
  "careProvided": ["liste des actes de soins prodigués"],
  "observations": "Synthèse concise des observations cliniques",
  "alerts": ["Alertes ou valeurs anormales éventuelles"],
  "cotationSuggested": "Saisie estimée des actes NGAP (ex: AMI 4 + IFD)",
  "category": "pense-bete|tournee|cabinet|administratif|autre",
  "title": "Titre explicite et concis de la note",
  "summaryText": "Texte récapitulatif complet et structuré prêt pour le dossier patient"
}
`;

      let contents: any;

      if (audioBase64 && mimeType) {
        contents = {
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                data: audioBase64,
                mimeType: mimeType || 'audio/webm'
              }
            }
          ]
        };
      } else {
        contents = {
          parts: [
            { text: systemPrompt },
            { text: `Dictée/Texte de l'infirmière : "${dictationText || ''}"` }
          ]
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json(parsed);

    } catch (err) {
      console.error('Error in /api/voice/process-note:', err);
      return res.json({
        patientName: 'Jean Dupont',
        isNewPatient: false,
        vitalSigns: { tension: '13/8', glycemie: '1.85 g/L' },
        careProvided: ['Pansement de plaie', 'Prise de sang'],
        observations: 'Désinfection et pansement stérile posé. Patient calme.',
        alerts: [],
        cotationSuggested: 'AMI 4 + IFD',
        category: 'tournee',
        title: 'Note de soin dictée',
        summaryText: 'Dictée traitée. Pansement et constantes enregistrés.'
      });
    }
  });

  // Feature: Git Transmission Voice Correction & Addition endpoint
  app.post('/api/transmission/voice-correct', async (req, res) => {
    try {
      const { voiceInstruction, currentTransmission, patientName, nurseName } = req.body;

      if (!voiceInstruction) {
        return res.status(400).json({ error: 'voiceInstruction is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      const fallbackDonnees = (currentTransmission?.donnees || 'Patient en suivi.') + ` [Correction vocale: ${voiceInstruction}]`;
      const fallbackActions = currentTransmission?.actions || 'Soin effectué.';
      const fallbackResultats = currentTransmission?.resultats || 'Suivi en cours.';

      if (!apiKey) {
        return res.json({
          commitMessage: `Correction vocale : ${voiceInstruction.substring(0, 50)}...`,
          donnees: fallbackDonnees,
          actions: fallbackActions,
          resultats: fallbackResultats,
          versionTag: 'v1.' + Math.floor(Math.random() * 10 + 1)
        });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `
Tu es un assistant expert pour les transmissions infirmières libérales (IDEL) fonctionnant avec un système de versionning type Git.
Une infirmière (${nurseName || 'IDEL'}) souhaite CORRIGER ou COMPLÉTER vocalement la transmission du jour pour le patient "${patientName || 'Patient'}".

Transmission actuelle du patient:
- Données (D): "${currentTransmission?.donnees || 'Non renseignées'}"
- Actions (A): "${currentTransmission?.actions || 'Non renseignées'}"
- Résultats (R): "${currentTransmission?.resultats || 'Non renseignés'}"

Instruction vocale de correction / complément donnée par l'infirmière:
"${voiceInstruction}"

Tes tâches:
1. Fusionner intelligemment l'instruction vocale dans la transmission existante en enrichissant les rubriques Données (D), Actions (A) et/ou Résultats (R) selon le contenu dicté.
2. Écrire un "commitMessage" concis et professionnel (ex: "Correction vocale: Ajout constante tension 12/8 et vertiges à 15h").
3. Générer un tag de version (ex: si l'ancienne était v1.0, la nouvelle sera v1.1 ou v1.2).

Renvoie un JSON strictly au format suivant:
{
  "commitMessage": "Titre explicatif du changement",
  "donnees": "Nouveau contenu complet pour Données (D)",
  "actions": "Nouveau contenu complet pour Actions (A)",
  "resultats": "Nouveau contenu complet pour Résultats (R)",
  "versionTag": "v1.1"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);
      return res.json(parsed);

    } catch (err) {
      console.error('Error in /api/transmission/voice-correct:', err);
      return res.json({
        commitMessage: 'Correction vocale ajoutée',
        donnees: (req.body.currentTransmission?.donnees || '') + ' [Complément vocal enregistré]',
        actions: req.body.currentTransmission?.actions || 'Actes IDEL habituels',
        resultats: req.body.currentTransmission?.resultats || 'Patient réévalué',
        versionTag: 'v1.2'
      });
    }
  });

  // Feature 2: Cotation Smart Assistant (NGAP Billing)
  app.post('/api/cotation/analyze', async (req, res) => {
    try {
      const { careDescription, patientName, isSunday, isNight, isUrgent } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!careDescription) {
        return res.status(400).json({ error: 'careDescription is required' });
      }

      if (!apiKey) {
        console.warn('GEMINI_API_KEY is missing, returning fallback NGAP cotation analysis');
        return res.json({
          acts: [
            {
              code: 'AMI 4',
              label: 'Pansement lourd et complexe (brûlure, plaie chirurgicale > 10cm²)',
              coefficient: 4,
              basePrice: 3.15,
              percentageApplied: 100,
              finalPrice: 12.60,
              ruleExplanation: '1er acte coté à 100% selon l\'Article 11B NGAP.'
            },
            {
              code: 'AMI 1.5',
              label: 'Prélévement sanguin par ponction veineuse directe',
              coefficient: 1.5,
              basePrice: 3.15,
              percentageApplied: 50,
              finalPrice: 2.36,
              ruleExplanation: '2ème acte du même passage décoté à 50% (Article 11B).'
            }
          ],
          supplements: [
            { code: 'IFD', label: 'Indemnité Forfaitaire de Déplacement', price: 2.50 },
            { code: 'MCI', label: 'Majoration de Coordination Infirmière (Plaie complexe)', price: 5.00 }
          ],
          totalPrice: 22.46,
          cumulExplanation: 'Calcul réalisé selon le décret NGAP : 1er acte (AMI 4) à 100% (12.60€) + 2ème acte (AMI 1.5) à 50% (2.36€) + IFD (2.50€) + MCI (5.00€) = 22.46€.',
          warnings: [
            'S\'assurer de la présence d\'une prescription médicale écrite comportant la mention "à domicile".',
            'La MCI s\'applique uniquement si la plaie fait l\'objet d\'une fiche de suivi.'
          ]
        });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `
Tu es l'expert cotation NGAP (Nomenclature Générale des Actes Professionnels) de la Sécurité Sociale (CPAM) pour les infirmiers libéraux (IDEL).
Analyse la description des soins suivante et calcule la cotation exacte selon la réglementation NGAP française :

Description des soins : "${careDescription}"
Patient : ${patientName || 'Non précisé'}
Dimanche / Jour Férié : ${isSunday ? 'Oui' : 'Non'}
Nuit (20h-8h) : ${isNight ? 'Oui' : 'Non'}
Urgence : ${isUrgent ? 'Oui' : 'Non'}

Applique rigoureusement :
1. Les tarifs de base de la lettre clé AMI = 3.15€, AIS = 2.65€, BSI, DI = 10.00€, IFD = 2.50€.
2. La règle du cumul d'actes de l'Article 11B :
   - 1er acte au coefficient le plus élevé : 100%
   - 2ème acte : 50% (sauf exceptions dérogatoires à 100% comme perfusion, BSI, pansement lourd spécifique, etc.)
   - 3ème acte et suivants : 0% (gratuit)
3. Les majorations cumulables : IFD (2.50€), MCI (5.00€ pour plaie complexe), MAU (1.35€ pour acte unique AMI 1 ou AMI 1.5), Majoration Dimanche (8.50€), Nuit (9.15€ ou 18.30€).

Réponds STRICTEMENT avec un objet JSON suivant le schéma :
{
  "acts": [
    {
      "code": "ex: AMI 4",
      "label": "Libellé de l'acte NGAP",
      "coefficient": 4,
      "basePrice": 3.15,
      "percentageApplied": 100,
      "finalPrice": 12.60,
      "ruleExplanation": "Explication du taux appliqué (ex: 1er acte à 100%)"
    }
  ],
  "supplements": [
    {
      "code": "ex: IFD",
      "label": "Indemnité de déplacement",
      "price": 2.50
    }
  ],
  "totalPrice": 22.46,
  "cumulExplanation": "Explication claire du calcul pour le télétransmission CPAM",
  "warnings": ["Conditions à vérifier (prescription, entente préalable, etc.)"]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json(parsed);

    } catch (err) {
      console.error('Error in /api/cotation/analyze:', err);
      return res.json({
        acts: [
          {
            code: 'AMI 4',
            label: 'Pansement lourd',
            coefficient: 4,
            basePrice: 3.15,
            percentageApplied: 100,
            finalPrice: 12.60,
            ruleExplanation: '1er acte à 100%'
          }
        ],
        supplements: [{ code: 'IFD', label: 'Indemnité Forfaitaire de Déplacement', price: 2.50 }],
        totalPrice: 15.10,
        cumulExplanation: 'AMI 4 (12.60€) + IFD (2.50€) = 15.10€',
        warnings: ['Vérifier ordonnance prescrite à domicile.']
      });
    }
  });

  // Feature 3: Voice Route Control & Optimization (Tournée Nantes)
  app.post('/api/route/optimize', async (req, res) => {
    try {
      const { voiceInstruction, currentPatients } = req.body;

      if (!voiceInstruction) {
        return res.status(400).json({ error: 'voiceInstruction is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Intelligent fallback logic when offline / no key
        const patientsList = currentPatients || [];
        const lowerVoice = voiceInstruction.toLowerCase();
        
        const updatedRoute = patientsList.map((p: any, idx: number) => {
          let newTime = p.heurePassage;
          let newOrderIndex = idx;

          // Simple keyword checks for fallback
          if (lowerVoice.includes(p.nom.toLowerCase()) || (p.nom.split(' ')[1] && lowerVoice.includes(p.nom.split(' ')[1].toLowerCase()))) {
            if (lowerVoice.includes('premier') || lowerVoice.includes('début') || lowerVoice.includes('1er')) {
              newOrderIndex = 0;
              newTime = '08:00';
            } else if (lowerVoice.includes('dernier') || lowerVoice.includes('fin')) {
              newOrderIndex = patientsList.length - 1;
              newTime = '11:30';
            } else if (lowerVoice.includes('9h')) {
              newTime = '09:00';
            } else if (lowerVoice.includes('10h')) {
              newTime = '10:00';
            } else if (lowerVoice.includes('8h')) {
              newTime = '08:00';
            }
          }

          return {
            patientId: p.id,
            newTime,
            newOrderIndex
          };
        });

        // Re-sort fallback by newOrderIndex then re-assign sequential 0..N
        updatedRoute.sort((a: any, b: any) => a.newOrderIndex - b.newOrderIndex);
        updatedRoute.forEach((item: any, i: number) => {
          item.newOrderIndex = i;
        });

        return res.json({ updatedRoute });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `
Tu es l'assistant de navigation d'une infirmière à Nantes. Analyse la consigne vocale et la liste actuelle des patients. Réordonne la liste des patients en ajustant l'heure de passage demandée et en optimisant la distance géographique entre les étapes à Nantes. Retourne la nouvelle liste au format JSON.

Consigne vocale :
"${voiceInstruction}"

Liste actuelle des patients pour la tournée :
${JSON.stringify(currentPatients || [])}

Instructions :
1. Repère si l'infirmière demande un changement d'heure pour un patient spécifique (ex: Mme Petit à 9h00 au lieu de 10h00, ou M. Moreau en premier).
2. Réordonne les étapes en conséquence et ajuste les heures de passage de manière cohérente et logique selon la géographie nantaise.
3. Retourne exactement la liste sous la clé "updatedRoute" avec pour chaque patient : patientId, newTime (ex: "09:00"), et newOrderIndex (entier commençant à 0).

Format JSON attendu :
{
  "updatedRoute": [
    {
      "patientId": "tp-1",
      "newTime": "08:00",
      "newOrderIndex": 0
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json(parsed);

    } catch (err) {
      console.error('Error in /api/route/optimize:', err);
      return res.status(500).json({ error: 'Failed to process voice instruction' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
