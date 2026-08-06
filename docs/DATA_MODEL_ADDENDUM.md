# Data Model — Addendum (Journey lens + ownership)

> À faire valider par la PO avant de fusionner dans `DATA_MODEL.md` officiel. Ceci n'écrase aucune règle existante, ça ajoute une couche transversale.

## 1. Champ transversal `journeyStage`

Ajouter ce champ optionnel à `HotjarRow`, `CRMRow`, et à la structure de verbatims :

```ts
export type JourneyStage = 'before' | 'during' | 'after';
```

```ts
export type HotjarRow = {
  // ...champs existants inchangés
  journeyStage?: JourneyStage;
};

export type CRMRow = {
  // ...champs existants inchangés
  journeyStage?: JourneyStage;
};
```

**Règle d'usage :**
- Champ **optionnel**. Si absent, afficher `Unknown` dans les filtres par étape — ne jamais déduire une étape par défaut.
- Ne remplace aucun champ existant (`category`, `sentiment`, etc.), s'ajoute en complément.
- Sert uniquement de **filtre transversal** dans chaque onglet (Overview, CRM, Bugs & Info, Verbatims) — n'introduit pas de nouvel onglet.

## 2. Découpage marché

Le découpage validé est **6 marchés**, avec la Belgique scindée par langue :

```ts
export type Market = 'FR' | 'NL' | 'DE' | 'BEFR' | 'BENL' | 'DK';
```

C'est déjà la définition dans `DATA_MODEL.md` — **confirmé comme référence unique**, y compris pour de futures sources (Medallia, brand panel) qui devront recroiser leurs marchés sur ce découpage plutôt que sur un simple "BE".

## 3. Sources non fusionnées : MyCP vs Medallia

Rappel explicite de la règle de non-fusion (cohérente avec `CLAUDE.md`, "Do not mix Hotjar and MyCP scoring scales") :

- **MyCP** = source de vérité de l'onglet CSAT. Échelle 0-10, définition NPS documentée dans `CLAUDE.md`.
- **Medallia** (nouvelle source, données réelles disponibles séparément, voir `medallia_aggregated.json`) = enquête post-séjour distincte, échelle 0-10, mais **population et moment de collecte différents de MyCP**. Ne jamais l'agréger avec MyCP dans un même NPS ou une même moyenne.
- Si Medallia est intégré à terme, il doit apparaître comme **source explicitement nommée** dans chaque KPI card et chaque graphique (ex. "NPS — Medallia" vs "NPS — MyCP"), jamais comme un simple "NPS" générique.

## 4. Champ `owner_role` sur les recommandations

Étendre le type de recommandation (Overview → Top 5 Recommendations, Bugs & Info → topic-level recommendation cards) :

```ts
export type OwnerRole = 'CRM' | 'Product' | 'Design' | 'Marketing';

export type Recommendation = {
  priority: number;
  title: string;
  owner_role: OwnerRole;
  impacted_stage?: JourneyStage;
  evidence: string;
};
```

Ça permet d'afficher directement, dans l'UI, à quel métier une recommandation est adressée — cohérent avec `OWNERSHIP_MATRIX.md`.
