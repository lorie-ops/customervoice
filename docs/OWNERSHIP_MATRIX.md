# Customer Voice Dashboard — Matrice d'ownership multi-métiers

## Objectif

Ce document répond à la question : **qui utilise quoi, qui décide quoi, et qui doit valider les règles de calcul de chaque onglet ?** Il permet à des chefs de projet CRM, Produit, Design et Marketing de savoir immédiatement où est leur périmètre dans l'outil, sans devoir tout lire.

---

## Vue d'ensemble par onglet

| Onglet | Owner métier principal | Contributeurs | Fréquence d'usage attendue |
|---|---|---|---|
| **Overview** | Marketing (vue transverse, reporting direction) | CRM, Produit | Hebdomadaire / mensuel (reporting) |
| **CRM** | CRM | Marketing (campagnes) | Quotidien / hebdomadaire (pilotage opérationnel) |
| **CSAT** | Marketing / Insight client | Produit (pour les items techniques dans les verbatims) | Mensuel (reporting satisfaction) |
| **Bugs & Info** | Produit | Design (UX des zones de friction), CRM (remontées clients) | Hebdomadaire (priorisation backlog) |
| **Verbatims** | Tous (outil d'exploration transverse) | — | À la demande (investigation ponctuelle) |

---

## Détail par rôle

### 🟦 Chef de projet CRM
**Ce qu'il/elle vient chercher :** le pouls quotidien de la relation client, les signaux négatifs à traiter en priorité, et un plan d'action clair.

- **Onglet principal : CRM**
  - KPIs 7 jours (volume, taux positif/négatif)
  - Market Health Snapshot pour arbitrer les priorités par marché
  - Action Plan (P1/P2) — **il/elle est responsable de la mise à jour de cette section**
- **Utilise aussi :**
  - Verbatims (filtre source = CRM) pour creuser un signal négatif avant de monter une action
  - Overview → Key Movements pour voir si ses actions CRM ont un effet visible période à période
- **Ce qu'il/elle doit valider dans les règles de calcul :** la définition de `sentiment` (positive/negative/neutral) et les campagnes suivies dans le filtre CRM

### 🟩 Chef de projet Produit
**Ce qu'il/elle vient chercher :** les frictions techniques et fonctionnelles à prioriser dans le backlog produit.

- **Onglet principal : Bugs & Info**
  - Top 5 Technical Issues
  - Missing Information par topic (Activity Schedule, Check-in, Pricing, Cottage, Cancellation Policy, Contact, Loyalty)
  - Recommandations par topic — **base de discussion pour le backlog produit**
- **Utilise aussi :**
  - Verbatims (filtre catégorie = Bug/Technical Error, Missing Information) pour la reproduction de bugs
  - CSAT → Theme Deep Dive pour croiser satisfaction et friction produit
- **Ce qu'il/elle doit valider dans les règles de calcul :** la taxonomie des `Category` (le proposer d'étendre la liste si un nouveau type de bug apparaît)

### 🟪 Design lead
**Ce qu'il/elle vient chercher :** ne pas avoir de rôle "propriétaire de données" à proprement parler, mais garantir que l'outil reste lisible et cohérent visuellement à mesure qu'il grandit.

- **N'est pas propriétaire d'un onglet**, mais **valide en transverse :**
  - La cohérence des couleurs (vert = positif, rouge = négatif/bug, orange = info manquante, violet = MyCP) sur les 5 onglets
  - La lisibilité des graphiques (pas de surcharge, cf. règle "Keep charts readable and not overly dense")
  - Les états vides (`Non applicable`, `Unknown`, `To verify`) — s'assurer qu'ils sont traités comme un vrai état design, pas juste un texte par défaut
  - La cohérence du header global et de la navigation par onglets
- **Point de vigilance actuel :** aucune review design formelle n'est prévue dans le backlog (`BACKLOG.md`). À ajouter comme étape de validation avant chaque fin de phase.

### 🟧 Chef de projet Marketing
**Ce qu'il/elle vient chercher :** une vue de synthèse pour le reporting direction et le suivi de marque/expérience globale.

- **Onglet principal : Overview**
  - KPI cards Web / MyCP / CRM / Post-stay
  - Theme Distribution Period A vs B (pour les présentations de comité)
  - Top 5 Recommendations (vue exécutive)
- **Utilise aussi :**
  - CSAT → Monthly Report Slide Format directement exportable pour un comité
  - CRM → Market Health Snapshot pour du reporting par marché
- **Ce qu'il/elle doit valider dans les règles de calcul :** les presets de période (7d/30d/90d/vs LY) utilisés pour les comparaisons de comité, et la future intégration de Medallia/Brand panel dans l'Overview

---

## Ce que ça implique pour la suite du projet

1. **Le Backlog (`BACKLOG.md`) doit gagner une colonne "owner"** par tâche, pour que chaque rôle sache quand son onglet arrive dans le planning (actuellement Phase 2 = Overview/Marketing, Phase 3 = CSAT/Marketing, Phase 4 = CRM/CRM, Phase 5 = Bugs&Info/Produit).
2. **Chaque onglet doit avoir un "responsable des règles de calcul"** identifié avant le Phase 6 (connexion aux vrais fichiers) — sinon le risque est de connecter des vraies données sans que le bon métier ait validé la formule derrière.
3. **Le Design lead doit être consulté à la fin de chaque phase**, pas seulement au Phase 0 — proposition : ajouter un ticket "Design review" à la fin de chaque phase du `BACKLOG.md`.
