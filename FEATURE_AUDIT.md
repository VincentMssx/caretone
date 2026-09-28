# Audit fonctionnel Caretone → CareVoice MVP

| Fonction Caretone | Implémentation CareVoice |
|---|---|
| Accueil et priorités de tournée | Tableau de bord, progression des transmissions et alerte de continuité |
| Patients et dossier | Recherche, filtres, ajout fictif, archivage de tournée, contexte, alertes et historique DAR |
| Médecins et professionnels | Répertoire, coordonnées fictives et patients suivis |
| Gestion des tournées | Matrice matin/soir/cabinet, ordre, consigne, recherche et filtres |
| Planning quotidien | Horaires, durées, contraintes et ajout de passage |
| Planning de l’équipe | Gardes par infirmière, demandes en attente, confirmation et charge hebdomadaire |
| Préparation du trajet | Ordre de passage et optimisation simulée |
| Transmission vocale | Scénario simulé, génération DAR, correction, confirmation et validation |
| Historique des transmissions | Fil global, constantes, versions et ouverture du dossier |
| Saisie manuelle d’un soin | Patient, type de soin, heure, constantes et observation |
| Cotations | Liste, statuts et ajout d’un brouillon |
| Messagerie | Conversations fictives et envoi local |
| Notes | Recherche, catégories, épinglage et ajout local |
| Paramètres | Rappels, dictée, affichage et remise à zéro de la démo |

Les interactions de test sont conservées uniquement dans l’onglet. La migration `0002_cabinet_mvp.sql` prépare la persistance multi-cabinet pour l’étape Supabase, sans l’activer dans ce MVP fictif.
