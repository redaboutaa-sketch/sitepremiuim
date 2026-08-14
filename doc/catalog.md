# CATALOGUE DE RÉFÉRENCE — IVAN ARSENOV

> **Source de vérité du catalogue.** Toute donnée saisie dans `src/data/` doit provenir
> de ce document. Fourni par le client le 2026-08-14, extrait de l'assortiment benchmark.
>
> ## ⚠️ Statut du catalogue
>
> Ce document est un **`REFERENCE_CATALOG`** — l'assortiment *cible* d'Ivan Arsenov.
> Ce n'est **PAS** un `CONFIRMED_CURRENT_STOCK`.
>
> **Interdictions absolues à l'affichage** : « In Stock » · « Available Now » ·
> toute quantité · toute disponibilité · tout délai · tout prix.
> Le champ `availabilityStatus` reste `TBC` tant qu'Ivan n'a rien confirmé,
> et **n'est pas rendu** dans l'interface tant qu'il vaut `TBC`.

---

## 1. Taxonomie

Cinq familles principales + une famille conditionnelle.

| # | Famille | Slug | Description (EN, source client) | Signal |
|---|---|---|---|---|
| 01 | **Carbonated** | `carbonated` | Colas, lemonades and sparkling soft drinks. | Rouge cola |
| 02 | **Energy & Sport** | `energy-sport` | Energy, performance and functional beverages. | Turquoise |
| 03 | **Water** | `water` | Still, sparkling and flavoured water. | Bleu glacier |
| 04 | **Juice & Fruit** | `juice-fruit` | Fruit drinks, juices and tropical flavours. | Ambre |
| 05 | **International Finds** | `international` | Regional variants, special flavours and distinctive imported-style products. | Magenta |
| 06 | **Concentrates & Syrups** ⏸ | `concentrates` | *Conditionnelle — décision D3.* | Graphite (neutre) |

### 1.1 « International Finds » est **transversal**, pas seulement une famille

Point d'architecture important. La section *International Discovery* (§18 du brief client)
illustre l'international avec **Mountain Dew, Dr Pepper, Fanta, Pepsi variants, Bundaberg,
Guaraná Antarctica, Fernandes, Hawai, Yummy Miami** — qui appartiennent tous à d'autres familles.

Le modèle de données traite donc l'international sur **deux axes** :

- **`category`** — la famille d'appartenance principale, unique (Carbonated, Energy & Sport…)
- **`internationalFind: boolean`** — un marqueur transversal, indépendant de la famille

Une même référence peut ainsi apparaître dans *Carbonated* **et** dans *International Finds*
sans duplication de données. La famille 05 est la vue filtrée sur ce marqueur, complétée par
les marques nativement « novelty / licensed » qui n'ont pas d'autre famille naturelle.

### 1.2 Famille 06 — Concentrates & Syrups

Conditionnée à la décision **D3**. Si retenue :
- **jamais** visuellement dominante ;
- **absente** de la homepage et de la navigation principale ;
- présente uniquement comme filtre supplémentaire sur `/drinks/` ;
- signal chromatique volontairement neutre (graphite), pour qu'elle ne capte pas l'attention.

Le cœur du site reste les boissons prêtes à boire.

---

## 2. Inventaire — 66 marques

Légende du champ `assetStatus` :
`ASSET_REQUIRES_VALIDATION` = utilisable en conception/staging uniquement, **jamais en production**.

### A — Carbonated Soft Drinks · 26 marques

| Marque | Slug | Featured | Note de périmètre |
|---|---|---|---|
| 7UP | `7up` | ★ | |
| A&W | `a-and-w` | | **Root Beer = soft drink non alcoolisée.** Ne pas confondre avec une bière |
| Big Red | `big-red` | | |
| Bundaberg | `bundaberg` | ★ | **Références non alcoolisées uniquement** |
| Canada Dry | `canada-dry` | | |
| Coca-Cola | `coca-cola` | ★ | |
| Dr Foots | `dr-foots` | | |
| Dr Pepper | `dr-pepper` | ★ | |
| Fanta | `fanta` | ★ | |
| Fernandes | `fernandes` | | Marqueur international |
| Guaraná Antarctica | `guarana-antarctica` | | Marqueur international |
| Krombacher Spezi | `krombacher-spezi` | | ⚠️ **Spezi / soft drinks uniquement — jamais les bières Krombacher** |
| Mirinda | `mirinda` | | |
| Mountain Dew | `mountain-dew` | ★ | Marqueur international |
| Oasis | `oasis` | | |
| Orangina | `orangina` | ★ | |
| Pariba | `pariba` | | |
| Pepsi | `pepsi` | ★ | Marqueur international (variants) |
| Poms | `poms` | | |
| Rivella | `rivella` | | |
| Royal Club | `royal-club` | | |
| Schweppes | `schweppes` | ★ | |
| Sisi | `sisi` | | |
| Sprite | `sprite` | ★ | |
| Sunkist | `sunkist` | | |
| Yummy Miami Soda | `yummy-miami-soda` | | Marqueur international |

### B — Energy · Sport · Functional · 12 marques

| Marque | Slug | Featured | Note de périmètre |
|---|---|---|---|
| 28 Black | `28-black` | | |
| AA Drink | `aa-drink` | | |
| Aquarius | `aquarius` | | |
| Bomba | `bomba` | | |
| Freego | `freego` | | |
| Monster Energy | `monster-energy` | ★ | |
| O2Life | `o2life` | | |
| Powerade | `powerade` | ★ | |
| Red Bull | `red-bull` | ★ | |
| Slammers Energy | `slammers-energy` | | |
| Vitamin Well | `vitamin-well` | | |
| XXL Nutrition | `xxl-nutrition` | | ⚠️ **Boissons prêtes à boire uniquement — aucun complément alimentaire.** SKU à préciser (décision D6) |

### C — Water · Mineral · Flavoured · 8 marques

| Marque | Slug | Featured |
|---|---|---|
| Bar-le-Duc | `bar-le-duc` | |
| Chaudfontaine | `chaudfontaine` | |
| Evian | `evian` | ★ |
| Feel So Good | `feel-so-good` | |
| Kızılay | `kizilay` | |
| LaCroix | `lacroix` | |
| Sourcy | `sourcy` | |
| SPA | `spa` | ★ |

### D — Juices · Fruit · Tropical · 13 marques

| Marque | Slug | Featured | Note de périmètre |
|---|---|---|---|
| Tropical Aloe Vera | `tropical-aloe-vera` | | |
| Capri-Sun | `capri-sun` | ★ | |
| Charlie's | `charlies` | | |
| Coco Rico | `coco-rico` | | |
| DubbelFrisss | `dubbelfrisss` | | |
| Grace | `grace` | | |
| Hawai | `hawai` | | Marqueur international |
| Hawaiian Punch | `hawaiian-punch` | | |
| Hero | `hero` | | ⚠️ **Boissons et jus uniquement** — pas les confitures ni l'alimentaire |
| Maaza | `maaza` | | |
| OKF | `okf` | | |
| Rauch | `rauch` | | |
| Taksi | `taksi` | | |

### E — Concentrates & Syrups · 3 marques ⏸ *(conditionnel — décision D3)*

| Marque | Slug |
|---|---|
| Karvan Cévitam | `karvan-cevitam` |
| RAAK | `raak` |
| Slimpie | `slimpie` |

### F — International · Novelty · Licensed · 4 marques

| Marque | Slug | Note de périmètre |
|---|---|---|
| Chupa Chups | `chupa-chups` | ⚠️ **Boissons sous licence uniquement — pas les confiseries** |
| Mentos | `mentos` | ⚠️ **Sodas et boissons uniquement — pas les bonbons** |
| Squid Game | `squid-game` | ⚠️ **Boissons sous licence uniquement** |
| Toxic Waste | `toxic-waste` | ⚠️ **Boissons sous licence uniquement — pas les bonbons** |

> Ces quatre marques portent le positionnement *hard-to-find / trending flavours*.
> Fort potentiel visuel, mais **droits de licence à vérifier avec une attention particulière** —
> les marques sous licence tierce (Squid Game notamment) sont plus sensibles que les marques
> de boissons classiques.

---

## 3. Marques prioritaires — 16 « Featured »

Coca-Cola · Pepsi · Red Bull · Monster Energy · Fanta · Sprite · Dr Pepper · Schweppes ·
7UP · Mountain Dew · Capri-Sun · Evian · SPA · Powerade · Orangina · Bundaberg

> ⚠️ **Cette hiérarchie est une décision de DESIGN, pas une donnée commerciale.**
>
> Libellés autorisés : **« Featured Brands »**, **« Discover the Selection »**.
> **Interdit** : « Our best-selling brands », « Top sellers », « Most popular »,
> ou toute formulation impliquant un volume de vente réel.

Les 50 autres marques servent à démontrer la **profondeur internationale** du catalogue.

---

## 4. Exclusions — ne jamais intégrer

| Marque | Motif |
|---|---|
| Amstel | Alcool |
| Bavaria | Alcool |
| Heineken | Alcool |
| Banditos | Alcool |
| Dilmah | Thé |
| Nescafé | Café |
| Lipton | Thé |
| Fuze Tea | Thé |
| **Arizona** | **Exclue par défaut** — marque très fortement associée aux iced teas. Réintégrable uniquement sur validation explicite d'un SKU non-thé (décision D4) |

Aucune de ces marques ne doit apparaître dans les données, les assets, le balisage,
les mots-clés ou les traductions.

**Règle générale** : la présence d'une marque sur le benchmark ne vaut **pas** autorisation.
En cas d'ambiguïté sur une marque ou un SKU → ne pas intégrer, et lever une décision client.

---

## 5. Décision en attente — Boissons lactées / protéinées

**`DECISION REQUIRED — Include Dairy / Protein Drinks? YES / NO`**

Marques concernées : **Barebells · Chocomel · Fristi · Optimel · Pınar**

Non alcoolisées, mais hors d'une définition stricte de « Soft Drinks ».

**Recommandation client : NON** — pour préserver un positionnement parfaitement net :
*100 % Soft Drinks*.

**Ma recommandation : NON également.** L'argument de vente n°1 du site est la
**spécialisation**. Ajouter le lacté brouille précisément ce qui différencie Ivan Arsenov
d'un grossiste généraliste. Cinq marques supplémentaires ne compensent pas la dilution
du positionnement. *Réversible sans coût : c'est un ajout de données, pas une refonte.*

---

## 6. Modèle de données

Champs par référence (marque et produit). **Aucun champ n'est inventé.**

| Champ | Type | Requis | Règle |
|---|---|---|---|
| `brand` | string | ✅ | |
| `slug` | string | ✅ | Généré, unique |
| `productName` | string \| null | | `null` tant qu'aucun SKU n'est confirmé |
| `category` | enum | ✅ | Famille unique parmi les 5 (+1 conditionnelle) |
| `subcategory` | string \| null | | |
| `variant` | string \| null | | |
| `flavour` | string \| null | | |
| `country` | string \| null | | **Jamais déduit** d'une supposition |
| `packageType` | enum \| null | | can · bottle-pet · bottle-glass · pouch · carton |
| `volume` | string \| null | | **Jamais inventé** (pas de « 330 ml » par défaut) |
| `image` | asset \| null | | |
| `logo` | asset \| null | | |
| `featured` | boolean | ✅ | 16 marques — décision de design |
| `internationalFind` | boolean | ✅ | Marqueur transversal |
| `specialEdition` | boolean | ✅ | |
| `availabilityStatus` | enum | ✅ | Défaut `TBC` — **non rendu** tant qu'il vaut `TBC` |
| `assetStatus` | enum | ✅ | `validated` · `requires_validation` · `missing` |
| `searchTerms` | string[] | | Alias et graphies alternatives |
| `scopeNote` | string \| null | | Restriction de périmètre (ex. « non-alcoholic SKUs only ») |

### Règles de validation appliquées au build

1. Un champ inconnu vaut `null` — **jamais** une valeur plausible inventée.
2. Un champ `null` **ne produit aucun rendu** — ni « N/A », ni « — », ni libellé vide.
3. `availabilityStatus: 'TBC'` → aucune mention de disponibilité affichée.
4. Toute marque de la liste d'exclusions (§4) fait **échouer le build**.
5. `assetStatus: 'requires_validation'` → autorisé en développement et staging,
   **fait échouer le build de production**.
6. Un `slug` en doublon fait échouer le build.
