# CareVoice — démonstration pour infirmiers

Cette version est préparée dans `C:\Users\Vincent\Documents\ChatGPT\Carevoice`, à partir du projet `C:\Users\Vincent\Documents\code\carevoice`. Le projet d’origine est conservé.

## Lancer la présentation

Depuis ce dossier : `rtk proxy node apps/web/node_modules/next/dist/bin/next dev apps/web --port 3100 --hostname 127.0.0.1`.

Ouvrir http://127.0.0.1:3100. Sur cette machine, les dépendances existantes sont réutilisées par des jonctions de dossiers. Pour déplacer le projet, installer les dépendances avec Bun sur la machine cible.

## Parcours de trois minutes

1. Présenter la tournée du mardi 15 septembre 2026 et ses six patients fictifs.
2. Ouvrir Jeanne Morel : dernier passage, point d’attention et continuité des soins.
3. Cliquer sur « Transmettre ce passage », puis « Lancer la simulation ».
4. Passer à la relecture ou attendre douze secondes. Modifier une phrase dans Données / Actions / Résultats.
5. Cocher la confirmation de relecture puis valider. Ouvrir le dossier mis à jour.
6. Revenir à la tournée : le patient est marqué « Transmis ». Essayer la recherche et le filtre « À transmettre ».
7. Utiliser « Réinitialiser la démo » en bas de page avant une nouvelle présentation.

## Modules repris de Caretone

- **Planning** : tournées du matin et du soir, horaires impératifs, durée estimée et ajout d'un passage fictif.
- **Trajet** : ordre des visites, schéma d'itinéraire et optimisation simulée avec conservation des horaires impératifs.
- **Professionnels** : annuaire des médecins, pharmacies et partenaires avec patients partagés.
- **Cotations** : actes du jour, statuts, montants indicatifs et création d'un brouillon.
- **Messagerie** : conversations de coordination et envoi local d'un message fictif.
- **Notes** : filtres, notes épinglées, création d'un pense-bête et lien vers un patient.
- **Paramètres** : rappels, options de validation vocale et préférences d'affichage.
- **Mobilité** : navigation inférieure et bouton de dictée flottant sur petit écran.

Ces modules sont accessibles depuis la barre latérale. Leurs actions restent locales à la démonstration et ne communiquent avec aucun tiers.

## Périmètre

- Six identités fictives avec observations, récit et suivi cohérents entre les pages.
- Simulation de dictée et de structuration : aucun microphone ni modèle IA utilisé.
- Les modifications validées restent dans le stockage de session du navigateur, dans cet onglet. Aucun dossier n’est envoyé au backend.
- Les observations illustrent la traçabilité et ne constituent pas des recommandations de soins.
- Le parcours démo fonctionne sans clé API ni accès Supabase.

## Questions pour les participants

- Quelles informations vous manquent avant un passage ?
- La présentation Données / Actions / Résultats correspond-elle à votre pratique ?
- À quel moment de la tournée utiliseriez-vous la dictée ?
- Que voudriez-vous absolument vérifier avant de valider ?
