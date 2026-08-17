# TR-026 — Packshots S4 Discovery

**État : BLOQUÉ — 6 des 8 produits de S4 n'ont aucun packshot.**
Base : `2352bd3`. Aucune intégration, aucun changement de rendu.

---

## A · État initial du dépôt

| | |
|---|---|
| `git status --short` | **vide** — arbre propre |
| `git rev-parse HEAD` | `2352bd30147cfd7bb40cfea5cf254f8993f5d613` |
| Ascendance | HEAD **est** le commit attendu |
| `npx astro check` | 0 erreur, 0 avertissement |
| `npm run qa` | **EXIT 0** — 565/565 · 826 + 233 tests |
| `npm run qa:staging` | **EXIT 0** — 565/565 · 62 tests |

Les gates étaient vertes **avant** TR-026, et le sont restées : rien n'a été
modifié.

---

## B · Inventaire réel de S4 — `S4_ASSET_INVENTORY`

Section : `src/components/home/Discovery.astro`, marquée `data-discovery`.
Séquence **codée en dur dans le composant** (`SEQUENCE`), pas dérivée d'un
marqueur du catalogue. Ordre composé pour faire alterner les familles.

**8 entrées.** Toutes demandent `usage="packshot"`, `variant="plain"`.

| # | Slug | Nom affiché | Famille | Asset résolu | Repli | Statut |
|---|---|---|---|---|---|---|
| 01 | `chupa-chups` | Chupa Chups | International Finds | **aucun** | typographique | `MISSING_PACKSHOT` |
| 02 | `guarana-antarctica` | Guaraná Antarctica | Carbonated | **aucun** | typographique | `MISSING_PACKSHOT` |
| 03 | `mountain-dew` | Mountain Dew | Carbonated | `packshot` 198 × 401 | — | `REUSE_EXISTING` |
| 04 | `hawai` | Hawai | Juice & Fruit | **aucun** | typographique | `MISSING_PACKSHOT` |
| 05 | `fernandes` | Fernandes | Carbonated | **aucun** | typographique | `MISSING_PACKSHOT` |
| 06 | `mentos` | Mentos | International Finds | **aucun** | typographique | `MISSING_PACKSHOT` |
| 07 | `bundaberg` | Bundaberg | Carbonated | `packshot` 206 × 464 | — | `REUSE_EXISTING` |
| 08 | `yummy-miami-soda` | Yummy Miami Soda | Carbonated | **aucun** | typographique | `MISSING_PACKSHOT` |

Aucun `INVALID_MAPPING`, aucun `NOT_APPLICABLE`. Provenance des deux assets
existants : `generated` / `requires_validation` / `unknown`, préproduction
seulement.

Capture de l'état actuel : `qa/screenshots/discovery/etat-actuel-1440x900.png`
— deux produits et six plateaux vides. L'écart se voit immédiatement, et c'est
exactement pourquoi une intégration partielle serait pire que rien.

### Une découverte structurelle

`usagesFor()` dans `src/lib/assets.ts` n'attribue un usage `packshot` qu'aux
marques **`featured`**. Les six marques S4 manquantes ne sont pas mises en
avant : elles n'ont donc **aucune entrée `packshot` dans le registre**, pas
même en `missing`. Le registre, qui sert aussi de liste de courses, ne réclame
pas ces six fichiers — personne ne pouvait savoir qu'ils manquaient.

C'est le premier geste de l'intégration future, et il n'a **pas** été fait ici :
ce serait un changement applicatif, que le §5 interdit tant qu'un asset manque.

---

## C · Assets réutilisés — `S4_REUSED_ASSETS`

```
S4_REUSED_ASSETS = ['mountain-dew', 'bundaberg']
```

**Un seul master par produit, vérifié à l'empreinte :**

| Marque | Fichier unique | SHA-256 (12) | Dérivés émis |
|---|---|---|---|
| mountain-dew | `src/assets/brands/mountain-dew/packshot.png` 198 × 401 | `cefb8c24042d` | 198 × 401 |
| bundaberg | `src/assets/brands/bundaberg/packshot.png` 206 × 464 | `e06d4bbd4466` | 200 × 450 · 206 × 464 |

Il n'existe **ni** `discovery/mountain-dew.png` **ni** de second master : S4 et
Featured demandent le même `usage="packshot"` et résolvent la même entrée de
registre. Un produit, un master, des dérivés différents selon l'emplacement.
**§14 satisfait, sans rien changer.**

### Recherche de réutilisation pour les six autres

Aucune réutilisation possible. Les seuls fichiers existants pour ces marques
sont des **logos** de catalogue :

| Marque | Logo disponible | Utilisable comme packshot ? |
|---|---|---|
| chupa-chups | 466 × 465 | **non** |
| guarana-antarctica | 640 × 644 | **non** |
| hawai | 640 × 640 | **non** |
| fernandes | 640 × 439 | **non** |
| mentos | 640 × 138 | **non** |
| yummy-miami-soda | 640 × 640 | **non** |

Un logo n'est pas un packshot, et la décision DA du 2026-08-16 les réserve au
catalogue, sur papier. Les employer en S4 serait un faux packshot — interdit
par le §5.

---

## D · Assets manquants — `S4_MISSING_ASSETS`

```
S4_MISSING_ASSETS = [
  'chupa-chups', 'guarana-antarctica', 'hawai',
  'fernandes', 'mentos', 'yummy-miami-soda',
]
```

**6 sur 8.** Le §5 s'applique : aucun placeholder, aucune image fabriquée,
aucun logo détourné, aucun fichier externe, aucune intégration partielle.

---

## E · Audit de résolution — la valeur de TR-025 était fausse

TR-025 annonçait « S4 ≈ 391 px CSS, DPR 3 ≈ 1173 ». **Mesuré, c'est faux comme
maximum** : 391 px est la valeur de bureau, pas le pic.

La grille S4 passe à deux colonnes au-delà de 640 px. En dessous, chaque
spécimen occupe **toute la largeur du conteneur** — et le plateau y est donc
bien plus grand que sur un écran large.

| Fenêtre | Plateau | Padding | Hauteur d'image |
|---|---|---|---|
| 320 | 280 × 373 | 8 px | 325 px |
| 375 | 335 × 447 | 9,4 px | 399 px |
| 390 | 350 × 467 | 9,8 px | 419 px |
| **430** | **390 × 520** | 10,8 px | **472 px** *(rendu mesuré : 499 px)* |
| 768 | 336 × 448 | 19,2 px | 400 px |
| 1024 | 217 × 290 | 24 px | 242 px |
| 1280 | 283 × 377 | 24 px | 329 px |
| 1440 | 329 × 439 | 24 px | 391 px |
| 1920 | 329 × 439 | 24 px | 391 px |

**Maximum réel : 499 px CSS, à 430 px de fenêtre** — soit un téléphone haut de
gamme, typiquement à DPR 3.

| Cible | Hauteur source requise |
|---|---|
| DPR 1 | **499 px** |
| DPR 2 | **998 px** |
| DPR 3 | **1 497 px** |

### Verdict pour les deux masters existants

Astro ne suragrandit pas : il plafonne les dérivés à la largeur source. Le
pipeline n'upscale donc jamais — **c'est le navigateur qui étire**.

| Marque | Source | Ratio | Couverture | / DPR 1 | / DPR 2 | / DPR 3 | Verdict |
|---|---|---|---|---|---|---|---|
| bundaberg | 206 × 464 | 0,444 | 0,866 | **93 %** | 46 % | 31 % | `PASS_WITH_RESOLUTION_WARNING` |
| mountain-dew | 198 × 401 | 0,494 | 0,963 | **80 %** | 40 % | 27 % | `PASS_WITH_RESOLUTION_WARNING` |

Conformément au §3, ce warning **ne déclenche pas** la création d'un nouveau
master : les fichiers restent tels quels, aucun agrandissement n'est appliqué
au pipeline, et ils sont visuellement acceptables sur écran large — où S4 rend
391 px, que Mountain Dew couvre à 102 % en DPR 1.

La réserve est franche et située : sur un téléphone de 430 px, Mountain Dew est
étiré au-delà de sa définition **dès DPR 1**, et à un peu plus du quart du
besoin en DPR 3. Un remplacement se justifiera le jour où des fichiers presse
existeront — pas pour faire passer une porte.

---

## F · `S4_MISSING_ASSET_REQUEST`

Six fichiers. **Un produit par fichier**, jamais une planche composite : la
planche refusée en TR-025 a montré qu'un fond peint et des halos rendent la
segmentation impossible sans reconstruction.

### Contraintes communes

| Exigence | Valeur |
|---|---|
| Format | **PNG RGBA** |
| Fond | **réellement transparent** (α = 0), pas un blanc détouré |
| Interdits | halo, lueur, ombre portée, reflet de sol, décor, éclaboussure, filigrane |
| Cadrage | produit **entier**, de face, vertical, sans inclinaison |
| Marges alpha | **≤ 0,5 %** sur les quatre bords |
| Hauteur source | **≥ 1 000 px** (minimum, couvre DPR 2) · **≥ 1 500 px** (recommandé, couvre DPR 3) |
| Ratio | **aucun ratio imposé** — celui du produit réel |
| Texte sur l'emballage | **aucune saveur, aucun volume, aucune variante, aucune contenance** que le catalogue n'établit pas |

Le ratio n'est pas contraint parce que la mise en page l'absorbe : les seize
masters existants vont de 0,29 (bouteille contour) à 0,62 (poche), et la
normalisation optique de la piste gère cet écart sans réglage par marque. Le
produit décide de sa forme, pas la maquette.

**Hauteur ≥ 1 500 px** couvre à la fois S4 (1 497 px à DPR 3) et Featured
(795 px à DPR 3) : un seul master pour les deux usages, aucun doublon.

### Les six fichiers

| Slug | Nom affiché | Famille au catalogue | Contrainte particulière |
|---|---|---|---|
| `chupa-chups` | Chupa Chups | International Finds | **Boisson uniquement.** Le catalogue porte la mention explicite « Licensed drinks only — not the confectionery ». Un visuel de sucette serait faux. |
| `mentos` | Mentos | International Finds | **Boisson uniquement.** Mention explicite : « Sodas and drinks only — not the sweets ». Aucun bonbon. |
| `guarana-antarctica` | Guaraná Antarctica | Carbonated | aucune |
| `hawai` | Hawai | Juice & Fruit | aucune |
| `fernandes` | Fernandes | Carbonated | aucune |
| `yummy-miami-soda` | Yummy Miami Soda | Carbonated | aucune |

**Type de contenant : non spécifié, volontairement.** Le catalogue n'établit ni
canette, ni bouteille, ni format pour aucune des six. Le §4 interdit d'inventer
un packaging ; la spécification s'arrête donc où s'arrête la donnée.

### Gouvernance à la livraison

Si les fichiers sont générés :

```
sourceType:    'generated'
status:        'requires_validation'
authorization: { status: 'unknown', evidence: null }
productionEligible: false
```

S'ils sont fournis par un titulaire, la provenance sera lue **dans le fichier**
— un manifeste C2PA prime sur une déclaration orale, comme en TR-024D.

---

## G · Modifications réalisées

**Aucune, hors ce document.** Pas de composant touché, pas de registre modifié,
pas d'asset ajouté, pas de test ajouté, pas de gate assouplie.

Le §5 impose l'arrêt avant intégration, et le §7 interdit d'affaiblir
`qa:artifact` — les deux sont respectés par la seule inaction.

---

## H · Effets de bord

Aucun changement n'ayant été fait, la matrice `SURFACE × ASSET_USAGE × BEFORE ×
AFTER` est l'identité :

| Surface | Usage demandé | Avant | Après |
|---|---|---|---|
| Hero | `hero` | 6 packshots (staging) | **identique** |
| Featured | `packshot` + repli `hero` | 16 visuels, 0 repli | **identique** |
| S4 Discovery | `packshot` | 2 visuels, 6 replis | **identique** |
| Final CTA | `hero` | 1 packshot (staging) | **identique** |
| `/drinks/` | `logo` | 60 logos, 0 packshot, 2 replis | **identique** |
| `/brands/` | — | texte seul | **identique** |
| Header · Footer | identité | monogramme officiel | **identique** |

---

## I à N · Non exécutés

Responsive, performance, accessibilité, tests, captures d'intégration :
**sans objet**. Il n'y a rien à intégrer, et le §5 interdit de le faire
partiellement.

Deux mesures ont malgré tout été prises, parce qu'elles conditionnent la
demande d'assets : la géométrie réelle de S4 aux neuf largeurs (§E) et le
chargement des deux packshots existants — `loading="lazy"`, `sizes` et
dimensions présents, aucun dérivé au-delà de la source.

---

## O · Fichiers modifiés

`doc/tr-026-s4-discovery.md` — ce document. **Rien d'autre.**

---

## P · Prochaine étape

À réception des six fichiers, l'intégration suit cet ordre :

1. `usagesFor()` doit attribuer un `packshot` aux marques de la séquence S4,
   pas seulement aux `featured` — sans quoi le registre continuera d'ignorer
   ces six fichiers ;
2. ingestion, recadrage strict sur la boîte alpha, entrées de registre ;
3. contrôle de translucence sur `#0A0A0B`, surface claire et damier (§10) ;
4. `qa:artifact` renforcé : S4 servi par des visuels produits en préproduction,
   zéro en production ;
5. responsive aux neuf largeurs, normalisation optique, captures.
