export type DAR = { donnees: string; actions: string; resultats: string };
export type Patient = {
  id: string;
  name: string;
  initials: string;
  age: number;
  time: string;
  sector: string;
  address: string;
  district: string;
  phone: string;
  coordinates: [number, number];
  doctor: string;
  frequency: string;
  warnings: string[];
  care: string;
  context: string;
  attention: string;
  followup: string;
  previous: DAR;
  draft: DAR;
  dictation: string;
};
export const patients: Patient[] = [
  {
    id: '1',
    name: 'Jeanne Morel',
    initials: 'JM',
    age: 78,
    time: '07:30',
    sector: 'Quartier des Tilleuls',
    address: '18 rue des Hauts-Pavés, 44000 Nantes',
    district: 'Hauts-Pavés · Saint-Félix',
    phone: '02 55 99 01 01',
    coordinates: [47.2248, -1.5682],
    doctor: 'Dr Claire Moreau',
    frequency: 'Tous les matins',
    warnings: ['Allergie déclarée : latex'],
    care: 'Pansement de jambe',
    context: 'Suivi d’une plaie de la jambe gauche · Passage quotidien',
    attention: 'Douleur à documenter à chaque passage',
    followup: 'Comparer le confort au prochain soin.',
    previous: {
      donnees: 'Pansement légèrement souillé. Douleur exprimée à 3/10 pendant le soin.',
      actions: 'Pansement refait selon la prescription. Installation confortable.',
      resultats: 'Soin toléré. Douleur exprimée à 1/10 au repos en fin de visite.',
    },
    draft: {
      donnees:
        'Pansement légèrement souillé. Douleur à 2/10 pendant le soin. Pas de rougeur autour de la plaie observée.',
      actions: 'Pansement refait selon la prescription. Patiente réinstallée au fauteuil.',
      resultats: 'Patiente confortable à la fin du passage. Douleur à 1/10 au repos.',
    },
    dictation:
      'Chez Madame Morel, le pansement était légèrement souillé. Douleur deux sur dix pendant le soin, pas de rougeur autour de la plaie. J’ai refait le pansement selon la prescription et réinstallé Madame au fauteuil. Elle est confortable, douleur un sur dix au repos.',
  },
  {
    id: '2',
    name: 'André Bernard',
    initials: 'AB',
    age: 71,
    time: '08:00',
    sector: 'Quartier des Tilleuls',
    address: '31 boulevard Robert-Schuman, 44300 Nantes',
    district: 'Breil · Barberie',
    phone: '02 55 99 01 02',
    coordinates: [47.2384, -1.568],
    doctor: 'Dr Claire Moreau',
    frequency: 'Matin et soir',
    warnings: ['Diabète · repas à contextualiser'],
    care: 'Suivi du diabète',
    context: 'Diabète de type 2 · Suivi matin et soir',
    attention: 'Tracer les mesures et le contexte du repas',
    followup: 'Relève du soir : consulter les observations du matin.',
    previous: {
      donnees:
        'Patient dit avoir pris son dîner. Glycémie mesurée à 1,42 g/L avant le soin du soir.',
      actions: 'Mesure tracée dans le dossier. Vérification du carnet avec le patient.',
      resultats: 'Patient participe à la lecture de son carnet.',
    },
    draft: {
      donnees: 'Glycémie à jeun mesurée à 1,18 g/L. Patient indique avoir bien dormi.',
      actions: 'Mesure consignée. Relecture du carnet de suivi avec le patient.',
      resultats: 'Patient reformule les éléments à noter dans son carnet. Petit-déjeuner préparé.',
    },
    dictation:
      'Monsieur Bernard a bien dormi. Glycémie à jeun un virgule dix-huit gramme par litre. J’ai consigné la mesure et relu son carnet avec lui. Il reformule les éléments à noter et son petit-déjeuner est préparé.',
  },
  {
    id: '3',
    name: 'Nadia Benali',
    initials: 'NB',
    age: 56,
    time: '08:40',
    sector: 'Centre-ville',
    address: '9 rue des Olivettes, 44000 Nantes',
    district: 'Madeleine · Champ-de-Mars',
    phone: '02 55 99 01 03',
    coordinates: [47.211, -1.5481],
    doctor: 'Dr Malik Rahmani',
    frequency: 'Tous les jours pendant 15 jours',
    warnings: ['Risque de chute · béquilles'],
    care: 'Surveillance post-opératoire',
    context: 'Retour à domicile après chirurgie du genou · Passage quotidien',
    attention: 'Compte rendu de sortie à récupérer',
    followup: 'Confirmer la réception du compte rendu avec le cabinet.',
    previous: {
      donnees: 'Patiente de retour à domicile. Se déplace avec ses béquilles. Dit être fatiguée.',
      actions: 'Accueil et recueil des informations de sortie. Demande du compte rendu au cabinet.',
      resultats: 'Patiente installée. Compte rendu de sortie encore attendu.',
    },
    draft: {
      donnees:
        'Pansement propre et sec. Douleur rapportée à 2/10 au repos. Patiente se déplace avec ses béquilles.',
      actions:
        'Surveillance du pansement. Échange sur le déroulement de la nuit et les déplacements.',
      resultats: 'Patiente dit avoir mieux dormi. Compte rendu de sortie toujours attendu.',
    },
    dictation:
      'Madame Benali : pansement propre et sec, douleur deux sur dix au repos. Elle se déplace avec ses béquilles. J’ai surveillé le pansement et échangé avec elle sur sa nuit et ses déplacements. Elle a mieux dormi. Nous attendons toujours le compte rendu de sortie.',
  },
  {
    id: '4',
    name: 'Lucien Petit',
    initials: 'LP',
    age: 84,
    time: '09:15',
    sector: 'Centre-ville',
    address: '6 rue de la Juiverie, 44000 Nantes',
    district: 'Bouffay',
    phone: '02 55 99 01 04',
    coordinates: [47.2161, -1.5521],
    doctor: 'Dr Élodie Perrin',
    frequency: 'Tous les matins',
    warnings: ['Fatigabilité en fin de soin'],
    care: 'Aide à la toilette',
    context: 'Accompagnement au maintien à domicile · Passage quotidien',
    attention: 'Préserver les habitudes et l’autonomie',
    followup: 'Préférence exprimée : commencer par la toilette au lavabo.',
    previous: {
      donnees: 'Patient souhaite participer à sa toilette. Fatigue en fin de soin.',
      actions: 'Aide partielle à la toilette avec pauses. Habillage accompagné.',
      resultats: 'Patient satisfait de sa participation. Installé dans son fauteuil.',
    },
    draft: {
      donnees: 'Patient souhaite effectuer seul la toilette du visage. Dit avoir bien dormi.',
      actions: 'Aide partielle à la toilette et à l’habillage, au rythme du patient.',
      resultats: 'Toilette du visage réalisée seul. Patient installé confortablement au fauteuil.',
    },
    dictation:
      'Monsieur Petit a bien dormi et souhaite faire seul la toilette du visage. Aide partielle pour le reste de la toilette et l’habillage, à son rythme. Il a fait la toilette du visage seul et est maintenant installé confortablement au fauteuil.',
  },
  {
    id: '5',
    name: 'Hélène Rousseau',
    initials: 'HR',
    age: 69,
    time: '09:50',
    sector: 'Les Jardins',
    address: '22 place Émile-Zola, 44100 Nantes',
    district: 'Zola',
    phone: '02 55 99 01 05',
    coordinates: [47.2124, -1.5889],
    doctor: 'Dr Claire Moreau',
    frequency: 'Chaque mardi',
    warnings: ['Ordonnance à vérifier avant préparation'],
    care: 'Préparation du pilulier',
    context: 'Accompagnement de la prise des traitements · Passage hebdomadaire',
    attention: 'Vérifier la disponibilité de l’ordonnance actualisée',
    followup: 'Prochain passage prévu mardi prochain.',
    previous: {
      donnees: 'Ordonnance disponible au domicile. Pilulier de la semaine précédente présenté.',
      actions: 'Préparation du pilulier selon l’ordonnance. Vérification avec la patiente.',
      resultats: 'Patiente identifie les compartiments du matin et du soir.',
    },
    draft: {
      donnees: 'Ordonnance actualisée présentée par la patiente. Boîtes disponibles au domicile.',
      actions: 'Pilulier préparé selon l’ordonnance. Repères matin et soir revus avec la patiente.',
      resultats: 'Patiente repère les compartiments. Pilulier rangé à l’emplacement habituel.',
    },
    dictation:
      'Madame Rousseau m’a présenté son ordonnance actualisée. Les boîtes sont disponibles. Pilulier préparé selon l’ordonnance, repères matin et soir revus ensemble. Elle repère les compartiments et le pilulier est rangé à sa place habituelle.',
  },
  {
    id: '6',
    name: 'Paul Garnier',
    initials: 'PG',
    age: 76,
    time: '10:20',
    sector: 'Les Jardins',
    address: '15 boulevard Jules-Verne, 44300 Nantes',
    district: 'Doulon · Bottière',
    phone: '02 55 99 01 06',
    coordinates: [47.235, -1.5196],
    doctor: 'Dr Antoine Le Goff',
    frequency: 'Lundi, mercredi et vendredi',
    warnings: [],
    care: 'Surveillance à domicile',
    context: 'Suivi des paramètres et du vécu à domicile · Trois passages par semaine',
    attention: 'Noter les mesures avec leur unité',
    followup: 'Poursuivre la traçabilité au prochain passage.',
    previous: {
      donnees: 'Pression artérielle mesurée à 132/78 mmHg après repos. Patient dit se sentir bien.',
      actions: 'Paramètres consignés. Échange sur le quotidien à domicile.',
      resultats: 'Patient ne rapporte pas de gêne pendant la visite.',
    },
    draft: {
      donnees: 'Pression artérielle à 130/80 mmHg après repos. Patient ne rapporte pas de gêne.',
      actions: 'Mesure tracée dans le dossier. Échange sur le sommeil et les activités.',
      resultats: 'Patient dit avoir conservé sa promenade habituelle.',
    },
    dictation:
      'Monsieur Garnier, pression artérielle cent trente sur quatre-vingts après repos. Pas de gêne rapportée. Mesure tracée, échange sur le sommeil et les activités. Il dit avoir conservé sa promenade habituelle.',
  },
  {
    id: '7',
    name: 'Monique Leroux',
    initials: 'ML',
    age: 82,
    time: '10:50',
    sector: 'Île de Nantes',
    address: '27 boulevard de la Prairie-au-Duc, 44200 Nantes',
    district: 'Île de Nantes',
    phone: '02 55 99 01 07',
    coordinates: [47.2048, -1.5612],
    doctor: 'Dr Élodie Perrin',
    frequency: 'Tous les jours',
    warnings: ['Anticoagulant · surveiller les saignements'],
    care: 'Injection sous-cutanée',
    context: 'Traitement anticoagulant après hospitalisation · Passage quotidien',
    attention: 'Alterner les sites d’injection et tracer les ecchymoses',
    followup: 'Contrôle biologique prévu vendredi matin.',
    previous: {
      donnees: 'Ecchymose ancienne au site abdominal droit, sans douleur spontanée.',
      actions: 'Injection réalisée au site abdominal gauche. Surveillance cutanée.',
      resultats: 'Injection bien tolérée. Aucun saignement observé.',
    },
    draft: {
      donnees: 'Peau intacte au site prévu. Ecchymose ancienne en régression.',
      actions: 'Injection sous-cutanée réalisée selon la prescription, côté droit.',
      resultats: 'Soin bien toléré, absence de saignement après compression douce.',
    },
    dictation:
      'Chez Madame Leroux, la peau est intacte et l’ancienne ecchymose régresse. Injection sous-cutanée réalisée selon la prescription côté droit. Soin bien toléré, sans saignement après compression douce.',
  },
  {
    id: '8',
    name: 'René Dubois',
    initials: 'RD',
    age: 73,
    time: '11:20',
    sector: 'Chantenay',
    address: '44 rue de la Convention, 44100 Nantes',
    district: 'Bellevue · Chantenay',
    phone: '02 55 99 01 08',
    coordinates: [47.2047, -1.5906],
    doctor: 'Dr Antoine Le Goff',
    frequency: 'Deux fois par semaine',
    warnings: ['Oxygène à domicile'],
    care: 'Surveillance respiratoire',
    context: 'BPCO stabilisée · Surveillance bihebdomadaire à domicile',
    attention: 'Mesurer la saturation après cinq minutes de repos',
    followup: 'Prévenir le médecin si SpO₂ inférieure au seuil prescrit.',
    previous: {
      donnees: 'SpO₂ à 94 % au repos. Pas de dyspnée inhabituelle rapportée.',
      actions: 'Paramètres mesurés et technique respiratoire revue.',
      resultats: 'Patient réalise correctement les exercices respiratoires.',
    },
    draft: {
      donnees: 'SpO₂ à 95 % après cinq minutes de repos. Toux habituelle, sans aggravation.',
      actions: 'Surveillance respiratoire et rappel des signes devant faire appeler le cabinet.',
      resultats: 'Patient reformule les signes d’alerte. État habituel pendant la visite.',
    },
    dictation:
      'Monsieur Dubois, saturation à quatre-vingt-quinze pour cent après cinq minutes de repos. Toux habituelle sans aggravation. Surveillance réalisée et signes d’alerte revus. Il les reformule correctement.',
  },
  {
    id: '9',
    name: 'Colette Marchand',
    initials: 'CM',
    age: 88,
    time: '17:15',
    sector: 'Saint-Donatien',
    address: '13 rue Desaix, 44000 Nantes',
    district: 'Malakoff · Saint-Donatien',
    phone: '02 55 99 01 09',
    coordinates: [47.226, -1.5421],
    doctor: 'Dr Élodie Perrin',
    frequency: 'Tous les soirs',
    warnings: ['Troubles de mémoire légers'],
    care: 'Aide à la prise du traitement',
    context: 'Sécurisation de la prise médicamenteuse · Passage du soir',
    attention: 'Vérifier le pilulier et noter tout oubli',
    followup: 'Prévenir la fille référente en cas de refus répété.',
    previous: {
      donnees: 'Pilulier du soir intact. Patiente reconnaît le moment de la prise.',
      actions: 'Accompagnement de la prise selon le pilulier préparé.',
      resultats: 'Traitement pris en présence de l’infirmière.',
    },
    draft: {
      donnees: 'Patiente calme. Compartiment du soir intact à l’arrivée.',
      actions: 'Lecture des repères et accompagnement de la prise du traitement préparé.',
      resultats: 'Prise effectuée sans difficulté. Verre d’eau laissé à portée.',
    },
    dictation:
      'Madame Marchand est calme. Le compartiment du soir était intact. Lecture des repères et accompagnement de la prise. Traitement pris sans difficulté, verre d’eau laissé à portée.',
  },
  {
    id: '10',
    name: 'Fatou Diallo',
    initials: 'FD',
    age: 64,
    time: '18:00',
    sector: 'Nantes Nord',
    address: '8 route de la Chapelle-sur-Erdre, 44300 Nantes',
    district: 'Nantes Nord',
    phone: '02 55 99 01 10',
    coordinates: [47.2591, -1.5637],
    doctor: 'Dr Claire Moreau',
    frequency: 'Lundi, mercredi et vendredi soir',
    warnings: ['Fistule artério-veineuse bras gauche'],
    care: 'Surveillance après dialyse',
    context: 'Retour de séance de dialyse · Surveillance clinique au domicile',
    attention: 'Ne pas prendre la tension au bras gauche',
    followup: 'Tracer poids, tension et tolérance du retour.',
    previous: {
      donnees: 'Retour de dialyse, fatigue habituelle. Tension 118/72 mmHg au bras droit.',
      actions: 'Surveillance des paramètres et du point de ponction.',
      resultats: 'Absence de saignement. Patiente installée au repos.',
    },
    draft: {
      donnees: 'Patiente fatiguée mais orientée. Tension 116/70 mmHg au bras droit.',
      actions: 'Contrôle du pansement de fistule et surveillance des paramètres.',
      resultats: 'Pansement sec. Collation prise, patiente installée confortablement.',
    },
    dictation:
      'Madame Diallo revient de dialyse, fatiguée mais bien orientée. Tension cent seize sur soixante-dix au bras droit. Pansement de fistule sec, paramètres surveillés. Collation prise et patiente installée confortablement.',
  },
];
export type SavedRecord = DAR & { id: string; patientId: string; savedAt: string };
export const STORAGE_KEY = 'carevoice-demo-records-v1';
export function readRecords(): SavedRecord[] {
  const raw: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (r): r is SavedRecord =>
      r &&
      ['id', 'patientId', 'savedAt', 'donnees', 'actions', 'resultats'].every(
        (k) => typeof r[k] === 'string',
      ),
  );
}
