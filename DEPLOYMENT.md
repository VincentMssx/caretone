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
# Accès privé par invitation

CareVoice peut rester en mode démonstration public tant que `AUTH_ENABLED=false`.
Pour activer les accès réels :

1. Créer ou relier un projet Supabase.
2. Exécuter, dans l’ordre, les migrations `0001`, `0002` et `0003` du dossier `supabase/migrations`.
3. Dans Supabase Auth, ajouter `https://caretone.vercel.app/auth/callback` aux URL de redirection autorisées.
4. Désactiver les inscriptions publiques dans Supabase Auth. Les comptes sont créés exclusivement par l’API d’invitation.
5. Ajouter les variables suivantes dans Vercel, pour Production, Preview et Development :

```env
NEXT_PUBLIC_SUPABASE_URL=https://<projet>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<cle-publique>
SUPABASE_SERVICE_ROLE_KEY=<cle-serveur>
ADMIN_EMAILS=<adresse-de-l-administrateur>
AUTH_ENABLED=true
NEXT_PUBLIC_DEMO_MODE=false
```

6. Redéployer. La première connexion de l’adresse listée dans `ADMIN_EMAILS` crée le cabinet et son rôle propriétaire lorsqu’elle ouvre `/admin/acces`.

La clé `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais être préfixée par `NEXT_PUBLIC_`.
