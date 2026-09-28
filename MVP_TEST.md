# Test terrain du MVP CareVoice

## Objectif

Faire tester le parcours complet à une infirmière avec des données entièrement fictives. Ce test mesure surtout la compréhension, la vitesse et la confiance avant toute connexion à des données de santé réelles.

## Scénario conseillé — 10 à 15 minutes

1. Ouvrir **Tournées** et affecter un patient au matin, au soir ou au cabinet.
2. Modifier son ordre de passage et sa consigne.
3. Ouvrir un dossier patient et retrouver le soin, l’adresse fictive, la fréquence et le point d’attention.
4. Lancer la transmission simulée, corriger une rubrique DAR, confirmer la relecture et valider.
5. Vérifier la nouvelle transmission dans le dossier puis dans **Transmissions**.
6. Ajouter un patient fictif et une note de cabinet.
7. Ouvrir **Équipe**, ajouter une garde et confirmer une demande en attente.
8. Utiliser **Réinitialiser la démo** pour revenir à l’état initial.

## Questions à poser après le test

- À quel moment avez-vous hésité ?
- Quelle information manquait juste avant un soin ?
- La différence entre tournée, planning et équipe est-elle claire ?
- Les trois rubriques DAR correspondent-elles à votre pratique ?
- Qu’auriez-vous peur de valider par erreur ?
- Quelle action vous ferait réellement gagner du temps ?

## Périmètre de cette version

- Données et identités fictives situées dans les quartiers de Nantes.
- Simulation de dictée sans accès au microphone.
- Modifications conservées dans l’onglet avec `sessionStorage`.
- Aucun compte, aucune donnée distante et aucun secret nécessaires pour le test.
- Réinitialisation complète disponible dans le pied de page.

## Étape suivante

Après validation du parcours par plusieurs infirmières, connecter Supabase Auth et les tables protégées par RLS, puis brancher l’API serveur de chiffrement. Ne pas utiliser de données réelles avant cette étape et la revue de sécurité associée.
