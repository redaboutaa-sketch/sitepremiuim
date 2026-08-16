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

**Cinq familles. Pas de sixième.** *Concentrates & Syrups* est **exclue de la V1**
(décision D4 = NON, 2026-08-14). Ni famille, ni filtre, ni données, ni assets.

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

### 1.2 Concentrates & Syrups — exclue de la V1

**Décision D4 = NON** (2026-08-14). Karvan Cévitam, RAAK et Slimpie ne sont ni saisies,
ni filtrables, ni illustrées. Le catalogue V1 est intégralement composé de boissons
prêtes à boire. Réintégrable ultérieurement par ajout de données, sans refonte.

---

## 2. Inventaire — 62 marques publiables

**26** Carbonated · **11** Energy & Sport · **8** Water · **13** Juice & Fruit · **4** International

*(Après application des décisions du 2026-08-14 : −3 Concentrates & Syrups, −1 XXL Nutrition,
Dairy/Protein et Arizona non intégrées.)*

### 2.1 Marques **brand-level-only** — décision D7, étendue le 2026-08-15

Ces **huit** marques sont publiées **au niveau marque uniquement**. Aucun SKU, aucune
variante, aucun format n'est affiché tant que les références précises admises ne sont pas
confirmées par Ivan. Le champ `productName` reste `null` et n'est **pas rendu**.

Deux motifs distincts mènent à la même règle.

**a — Périmètre partiel de gamme** *(décision initiale, 2026-08-14)*
Une partie seulement de la gamme de la marque est dans le scope.

| Marque | Restriction |
|---|---|
| **A&W** | Root Beer = soft drink non alcoolisée. SKU précis non confirmés |
| **Bundaberg** | Références non alcoolisées uniquement. SKU précis non confirmés |
| **Krombacher Spezi** | Spezi / soft drinks uniquement — **jamais les bières Krombacher**. SKU précis non confirmés |
| **Hero** | Boissons et jus uniquement — pas les confitures ni l'alimentaire. SKU précis non confirmés |

**b — Licence tierce** *(extension approuvée par le client le 2026-08-15)*
Ces marques n'existent au catalogue que par leurs déclinaisons boissons sous licence.
Afficher un SKU non confirmé y reviendrait à présenter **une confiserie ou un produit
dérivé comme une boisson**. Elles restent `brand-level-only` **jusqu'à validation d'un
SKU boisson précis**.

| Marque | Restriction |
|---|---|
| **Chupa Chups** | Boissons sous licence uniquement — pas les confiseries |
| **Mentos** | Sodas et boissons uniquement — pas les bonbons |
| **Squid Game** | Boissons sous licence uniquement |
| **Toxic Waste** | Boissons sous licence uniquement — pas les bonbons |

Le schéma marque ces huit entrées `skuPolicy: 'brand-level-only'`. Deux contrôles en
découlent, tous deux bloquants : saisir un `productName` sur l'une d'elles **fait échouer
la validation du catalogue**, et laisser sa `scopeNote` nulle la fait échouer également —
une restriction non documentée se perd.

---

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

### B — Energy · Sport · Functional · 11 marques

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

> **XXL Nutrition — RETIRÉE de la V1** (décision D6, 2026-08-14).
> La marque n'est ni saisie, ni affichée, tant que la liste précise de ses SKU
> prêts à boire n'est pas confirmée. Aucun complément alimentaire ne peut figurer
> au catalogue. Réintégration = ajout de données une fois les SKU fournis.

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

### E — Concentrates & Syrups — ❌ **EXCLUE DE LA V1** (décision D4)

Karvan Cévitam · RAAK · Slimpie — non saisies, non filtrables, non illustrées.

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
| **Arizona** | ❌ **EXCLUE** — décision D5 confirmée le 2026-08-14. Marque trop fortement associée aux iced teas. Non réintégrable en V1 |
| **Barebells · Chocomel · Fristi · Optimel · Pınar** | ❌ **EXCLUES** — décision D3 = NON (2026-08-14). Boissons lactées / protéinées hors d'une définition stricte de « Soft Drinks » |
| **Karvan Cévitam · RAAK · Slimpie** | ❌ **EXCLUES** — décision D4 = NON (2026-08-14). Concentrates & Syrups hors V1 |
| **XXL Nutrition** | ⏸ **RETIRÉE** — décision D6 (2026-08-14). En attente de la liste des SKU prêts à boire |

Aucune de ces marques ne doit apparaître dans les données, les assets, le balisage,
les mots-clés ou les traductions.

**Règle générale** : la présence d'une marque sur le benchmark ne vaut **pas** autorisation.
En cas d'ambiguïté sur une marque ou un SKU → ne pas intégrer, et lever une décision client.

---

## 5. Décision tranchée — Boissons lactées / protéinées

**`DECISION REQUIRED — Include Dairy / Protein Drinks?` → ✅ NON** (2026-08-14)

**Barebells · Chocomel · Fristi · Optimel · Pınar** ne sont pas intégrées.

Le positionnement reste **100 % Soft Drinks**. Réversible ultérieurement par simple
ajout de données, sans refonte.

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
| `skuPolicy` | enum | ✅ | `full` · `brand-level-only` (A&W, Bundaberg, Krombacher Spezi, Hero) |
| `searchTerms` | string[] | | Alias et graphies alternatives |
| `scopeNote` | `{ en, de }` \| null | | Restriction de périmètre, **dans les deux langues** — la note est publiée, lue par les lecteurs d'écran |

### Règles de validation

**Portée du contrôle** — toutes les règles ci-dessous s'appliquent au **schéma de données
publiable** (`src/data/**` validé par Zod au build), et **non** à une recherche de chaînes
dans le dépôt. Le nom « Heineken » peut légitimement apparaître dans `doc/catalog.md`,
dans un commentaire ou dans un test : ce qui est interdit, c'est qu'une entrée de catalogue
**publiable** le porte. Le contrôle s'exécute sur les entrées validées, pas sur des fichiers.

| # | Règle | Portée | Sanction |
|---|---|---|---|
| 1 | Un champ inconnu vaut `null` — jamais une valeur plausible inventée | Saisie | Revue |
| 2 | Un champ `null` **ne produit aucun rendu** — ni « N/A », ni « — », ni libellé vide | Rendu | Test |
| 3 | `availabilityStatus: 'TBC'` → aucune mention de disponibilité rendue | Rendu | Test |
| 4 | **Aucune entrée publiable ne peut porter un `slug` figurant dans la liste d'exclusions** (§4) | Schéma | **Build en échec** |
| 5 | `slug` en doublon | Schéma | **Build en échec** |
| 6 | `skuPolicy: 'brand-level-only'` + `productName` non nul | Schéma | **Build en échec** |
| 7 | `category` hors des 5 familles autorisées | Schéma | **Build en échec** |

### Règle d'asset — `assetStatus: 'requires_validation'`

Le contrôle porte sur **l'asset**, pas sur le build entier.

| Environnement | Comportement |
|---|---|
| **Développement / staging** | L'asset est **rendu normalement**. Aucun blocage — le staging doit permettre de juger le design complet |
| **Production** | L'asset **n'est pas publié**. L'entrée bascule automatiquement sur le **repli typographique composé** (TR-004) et reste présente au catalogue |

La marque n'est donc jamais retirée du site : seul son visuel non validé l'est. Le build de
production **réussit**, et `npm run audit:assets` rapporte la liste des assets substitués
afin qu'ils soient traités. Cette liste figure dans le rapport de livraison.
