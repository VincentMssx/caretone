# CareVoice — System Design & UI/UX Guidelines (Stitch Specification)

Ce document `design.md` sert de référence de style, d'architecture UI/UX et de spécification visuelle pour la refonte et l'harmonisation de l'application **CareVoice** (Cabinet Infirmiers Libéraux IDEL).

---

## 1. Philosophie & Directives Générales

CareVoice est une application médicale d'urgence et de suivi de tournée pour les infirmiers diplômés d'État libéraux (IDEL).
Le design doit respecter 4 principes fondamentaux :

1. **Mobile-First & Usabilité en Mobilité** : 90 % des usages se font en voiture, en marchant ou au chevet du patient. Les zones d'interaction tactiles doivent mesurer au minimum **44×44px**.
2. **Medical-Grade Clarity** : Lisibilité immédiate des données constantes (Tension, Glycémie, Température) avec contraste élevé (WCAG AA minimum).
3. **Traçabilité Inspirée de Git (Medical Feed)** : Chaque soin/transmission est présenté sous forme de *commit horodaté*, avec badges de comparaison automatique (Diff Badges).
4. **Ergonomie Vocale** : L'assistant vocal est omniprésent via un bouton flottant intelligent (`PageVoiceMicButton`) accessible en bas de chaque écran sans gêner la navigation.

---

## 2. Palette de Couleurs (Medical Palette)

### Couleurs Principales (Brand & Identity)
* **Primary IDEL Blue** : `#006591` (Utilisé pour la navigation principale, les headers, les cartes actives et les boutons primaires)
* **Primary Light Sky** : `#0ea5e9` (Accents, icônes d'action, états hover, gradients)
* **Medical Dark Blue** : `#004c6e` (Fond des bannières supérieures, états actifs foncés)

### Couleurs Sémantiques & Constantes
* **Alerte / Augmentation (Tension ↑ / Hyperglycémie)** :
  * Background : `bg-red-50`
  * Border : `border-red-200`
  * Text : `text-red-800` (`#991b1b`)
* **Normal / Baisse (Glycémie Normalisée / Cicatrisation ↓)** :
  * Background : `bg-emerald-50`
  * Border : `border-emerald-200`
  * Text : `text-emerald-800` (`#065f46`)
* **Information / Nouveauté (Nouveau Soin / Cible)** :
  * Background : `bg-purple-50`
  * Border : `border-purple-200`
  * Text : `text-purple-800` (`#6b21a8`)
* **Warning / Édition (Modification v2)** :
  * Background : `bg-amber-50`
  * Border : `border-amber-200`
  * Text : `text-amber-800` (`#92400e`)

### Neutres & Fond de Page
* **Canvas Background** : `bg-slate-50/90` (`#f8fafc`)
* **Card Surface** : `bg-white` (`#ffffff`) avec bordure `border-slate-200/80` et ombre douce `shadow-xs` / `shadow-sm`
* **Texte Principal** : `text-slate-800` (`#1e293b`)
* **Texte Secondaire** : `text-slate-500` (`#64748b`)

---

## 3. Typographie & Rhythme Visuel

* **Font Family** : Inter / Plus Jakarta Sans (`font-sans`)
* **Titres principaux** : `text-xl md:text-2xl font-black text-white` ou `text-[#006591]`
* **Titres de cartes** : `text-sm sm:text-base font-bold text-slate-800`
* **Badges & Tags** : `text-[10px]` ou `text-[11px] font-extrabold uppercase tracking-wider`
* **Corps de texte** : `text-xs md:text-sm font-medium leading-relaxed`

---

## 4. Composants Clés & Layouts

### A. Navigation Inférieure Mobile (Fixed Bottom Bar)
Positionnée en fixe en bas sur smartphone (`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md`).
Contient 5 accès rapides direct :
1. **Accueil** (`LayoutDashboard`)
2. **Patients** (`Users`)
3. **Trajet** (`Map`)
4. **Transmission** (`Mic` / `GitCommit`)
5. **Messagerie** (`Mail`)
6. **Menu** (`Menu` — tiroir latéral)

### B. Bouton Assistant Vocal Flottant (`PageVoiceMicButton`)
* Placement : `fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40`
* Gradient : `from-[#0ea5e9] to-[#006591]`
* Forme : Bouton arrondi (`rounded-2xl`) avec ombre portée prononcée (`shadow-xl`) et micro animé (`animate-pulse`).
* Interaction : Ouvre un modal avec guidage contextuel par page et exemples de dictées.

### C. Carte de Transmission Git (`TransmissionCard`)
* Noeud de timeline vertical (`absolute left-2.5 top-0 bottom-0 w-0.5 bg-slate-200`).
* Puce de commit interactive (`w-5 h-5 rounded-full bg-[#006591]`).
* Badge de versioning (`v1` original, `v2 - modifiée à 09:15`).
* Section **Diffs Clés** : puces visuelles montrant l'évolution des constantes biologiques (`Tension 15/9 (↑)`, `Glycémie 1.4 g/L (↓)`).
* Bloc accordéon avec découpage **D** (Données / Ciel bleu), **A** (Actions / Émeraude), **R** (Résultats / Violet).

---

## 5. Intégration & Spécifications Stitch

Pour régénérer ou enrichir les composants UI avec un outil de génération comme **Stitch**, voici le prompt de référence à fournir :

```text
Create a responsive, high-density React + Tailwind CSS healthcare component for an IDEL nursing app named CareVoice.
- Theme: Medical Navy Blue (#006591), Sky Blue (#0ea5e9), clean white cards on slate-50 background.
- Typography: Plus Jakarta Sans / Inter.
- Mobile Layout: Mobile-first bottom navigation bar (fixed, blurred background), large touch targets (min 44px).
- Components: Glassmorphism headers, git-like medical feed cards with diff badges (red increase, green decrease, purple new), structured DAR (Data, Action, Result) grid, and a floating voice dictation widget with speech recognition state.
```

---

## 6. Structure des Fichiers du Design System

* `src/types/transmission.ts` : Modèle de données typé (Constantes, DiffBadge, DarTransmission).
* `src/utils/diffCalculators.ts` : Moteur de comparaison visuelle des constantes entre passages.
* `src/components/TransmissionForm.tsx` : Saisie guidée DAR + Dictée vocale directe.
* `src/components/TransmissionCard.tsx` : Carte de suivi médical style Commit Git.
* `src/pages/TransmissionPage.tsx` : Fil d'actualité médical (Medical Feed).
* `src/components/PageVoiceMicButton.tsx` : Bouton micro intelligent contextuel.

---
*Fichier généré le 26 Juillet 2026 pour le projet CareVoice.*
