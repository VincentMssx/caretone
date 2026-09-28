# Déployer le MVP CareVoice

## Vercel

Créer un projet Vercel depuis ce dépôt avec ces réglages :

- **Root Directory** : `apps/web`
- **Framework** : Next.js
- **Install Command** : repris automatiquement depuis `apps/web/vercel.json`
- **Build Command** : `bun run build`
- **Output Directory** : laisser la valeur Next.js par défaut (`.next`)

Pour un test avec des données fictives, définir uniquement :

```text
NEXT_PUBLIC_DEMO_MODE=true
```

Les données créées dans cette version sont conservées dans `sessionStorage`. Elles restent dans l’onglet du navigateur et disparaissent lorsque l’utilisatrice réinitialise la démo ou ferme la session.

## Supabase

Supabase est préparé pour l’étape suivante, quand le test local est validé :

1. Créer un projet Supabase hébergé dans une région adaptée au projet.
2. Appliquer `supabase/migrations/0001_initial_schema.sql`, puis `0002_cabinet_mvp.sql`.
3. Configurer Supabase Auth pour les membres du cabinet.
4. Ajouter dans Vercel `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Ajouter `SUPABASE_SERVICE_ROLE_KEY` et `ENCRYPTION_SECRET_KEY` uniquement aux fonctions serveur.
6. Passer `NEXT_PUBLIC_DEMO_MODE=false` après implémentation et validation de la persistance distante.

La clé `service_role` et la clé de chiffrement ne doivent jamais être exposées dans une variable `NEXT_PUBLIC_*` ni dans le navigateur. Les politiques RLS de la migration isolent chaque cabinet et refusent l’accès anonyme.

## Avant un test avec des données réelles

Ce MVP est volontairement limité aux données fictives. Avant toute donnée de santé réelle, il faut au minimum : authentification forte, hébergement et contrats adaptés aux données de santé, analyse RGPD, journal d’audit, sauvegardes, gestion des habilitations, procédure d’incident, tests RLS automatisés et revue indépendante de sécurité.
