# TR-024B — Intégration des six packshots dans « THE STAGE »

**Portée : PRÉPRODUCTION UNIQUEMENT. Aucun déploiement.**
Cible du build : `npm run build:staging` (`DEPLOY_TARGET=staging ASSET_MODE=staging`).

---

## 1. Ce qui a été intégré

Six fichiers, extraits en TR-024A depuis deux planches composites **générées**,
rangés sous `src/assets/brands/<slug>/hero.png` :

| Marque | Fichier source | Poids | Ratio | Couverture opaque | SHA-256 (12) |
|---|---|---|---|---|---|
| Coca-Cola | 443 × 1517 | 1 780 Ko | 0,292 | 0,794 | `bb899aaffac4` |
| Fanta | 272 × 900 | 648 Ko | 0,302 | 0,818 | `bb1d98895e25` |
| Red Bull | 214 × 594 | 389 Ko | 0,360 | 0,976 | `57dd7fb06d9d` |
| Monster Energy | 227 × 595 | 356 Ko | 0,382 | 0,964 | `7af5ab88498d` |
| Pepsi | 227 × 505 | 340 Ko | 0,450 | 0,962 | `809ac64a5d00` |
| Sprite | 229 × 505 | 349 Ko | 0,454 | 0,961 | `c6b023cdea0a` |

Les six sont détourés au pixel près : marge transparente mesurée à 0,0–0,2 %
sur les quatre bords. Aucun recadrage, aucun ré-échantillonnage, aucune
retouche n'a été appliquée à l'ingestion.

### Régime dans le registre

```
status:        requires_validation     → rendu en préproduction, JAMAIS en production
sourceType:    generated               → visuel FABRIQUÉ, pas fourni par le titulaire
authorization: { status: 'unknown' }   → aucune autorisation établie
```

**Ces fichiers ne ferment pas le blocage B2.** Ils répondent à une seule
question — « la composition tient-elle avec de vrais volumes ? » — et à aucune
autre. La production exige un fichier presse ou une autorisation écrite.

---

## 2. Séparation production / préproduction (§3)

Quatre conditions, contrôlées **séparément** par `qa:artifact`, parce qu'elles
échouent séparément :

| Contrôle | Production | Préproduction |
|---|---|---|
| Packshots générés rendus dans une page | 0 | 6 (+ 1 au CTA final) |
| Dérivés `hero.*` déposés dans `dist/` | 0 | 13 |
| Attribut `data-generated` dans le HTML | absent | présent |
| Références d'image vers un fichier absent | 0 | — |
| Emplacements hero en repli typographique | 7 | 0 |

Le mécanisme de retrait a été **généralisé**. `pruneUnvalidatedAssets()` ne
connaissait que le motif `logo.*` : les dérivés `hero.*` seraient passés au
travers sans qu'aucun contrôle ne bronche. Il fonctionne désormais sur une
**liste blanche d'identité** (`asset-governance.mjs`) — tout ce qui n'est pas
un fichier d'identité Ivan Arsenov est un visuel tiers, et est retiré.

Une liste noire doit être étendue à chaque nouveau type d'asset ; la première
fois qu'on l'oublie, un visuel tiers part en production. Une liste blanche
échoue dans l'autre sens.

Le retrait reste **vérifié** : si l'un de ces fichiers est réellement référencé
par une page de production, le build échoue au lieu de supprimer un fichier
utilisé. La recherche couvre désormais HTML, CSS **et** JS.

La cohérence entre `asset-governance.mjs` et le registre TypeScript n'est pas
supposée : `tests/assets.spec.ts` la vérifie dans les deux sens (un asset
publiable que la liste blanche retirerait ; un visuel tiers qu'elle laisserait
passer).

**Vérifié :** build de production → 66 visuels retirés, `dist/` ne contient que
6 fichiers d'image, tous d'identité. `qa:artifact` : 564/564.

---

## 3. Échelle optique (§5)

### Mesure d'abord

Les six sources ont été mesurées avant toute décision : boîte englobante
opaque, marges, couverture. Résultat — **aucune marge parasite** (0,0–0,2 %) :
il n'y a donc **pas** de correction de recadrage à appliquer. Le cas que
`opticalSize()` traite pour les logos du catalogue ne se présente pas ici.

### Le modèle géométrique, transcrit et non réglé

`src/lib/optical.ts` → `stageSizes()`. Aucun nombre magique : chaque valeur est
la transcription d'une règle CSS existante.

```
hauteurPlateau = largeurEmplacement × 4/3      (aspect-ratio: 3 / 4)
hauteurImage   = hauteurPlateau − 2 × padding  (padding: clamp(8px, 2.5vw, 24px))
largeurImage   = hauteurImage × ratioSource
largeurVue     = largeurImage × échelleDuPlan  (transform: scale())
```

Confronté aux géométries relevées sur les neuf largeurs : **écart maximal 1 px**.

Seule exception documentée — la rangée mobile (< 768 px) est disposée en
flexbox ; sa largeur n'a pas de forme fermée exprimable dans `sizes`. Les deux
coefficients sont **mesurés** sur 320/375/390/430 px puis **majorés de 6 %** :
un `sizes` sous-évalué servirait une image floue, ce qui est pire que quelques
kilo-octets.

### Une seule correction de composition (§14), décidée sur les planches

**Pepsi, `x` : 70 % → 52 %.**

Motif relevé sur les planches A et C : avec de vrais volumes, Pepsi
disparaissait **entièrement** derrière la bouteille Coca-Cola. Le défaut
n'existait pas avec les replis typographiques, qui occupent toute la largeur de
leur plateau (220 px) ; un packshot ajusté par la hauteur n'en occupe que 71,
et l'objet du plan avant le recouvrait complètement.

Aucune autre coordonnée, aucune échelle de plan, aucun flou, aucune opacité,
aucune animation n'a été touchée. Le filigrane typographique « IA » (B15) est
intact.

Un contrôle d'occultation a été ajouté à `tests/visual/stage.spec.ts` : il
mesure, à cinq largeurs, la part de chaque objet recouverte par les plans plus
proches, et échoue au-delà de 60 %. Le défaut ne peut plus revenir en silence.

---

## 4. Deux correctifs de fond révélés par l'intégration

Ni l'un ni l'autre n'est un choix esthétique : les deux sont des dépendances
cachées que seule l'arrivée de vraies images a rendues visibles.

**a) `.product-object__img` : `max-block-size: 100%` → `block-size: 100%`.**
Avec la seule borne haute, une variante de `srcset` plus petite que le plateau
se posait à sa taille **intrinsèque**, et l'objet rétrécissait. La composition
dépendait donc de la variante choisie par le navigateur, c'est-à-dire de la
densité d'écran du visiteur. Désormais la géométrie est fixe et seule la
**netteté** dépend de la variante — le contrat normal d'un `srcset`.

**b) `.hero__stage` sur mobile : `inline-size: 100%`.**
`.hero` est en `align-items: center` : sans largeur explicite, la rangée se
dimensionnait sur le **contenu** de ses emplacements. Sa largeur dépendait donc
de la taille intrinsèque des images servies, et ne s'alignait plus sur le filet
de sol, lui posé sur `--margin`. Ce correctif s'applique aussi à la production,
où la rangée était dimensionnée par le texte des replis.

---

## 5. Responsive (§8)

Neuf largeurs mesurées, géométrie complète dans
`qa/screenshots/stage/geometry.json`. **Aucun débordement horizontal à aucune
largeur.**

Largeur d'affichage de chaque objet (px CSS) :

| Fenêtre | Sprite | Monster | Pepsi | Fanta | Red Bull | Coca-Cola |
|---|---|---|---|---|---|---|
| 1920 | 71 | 60 | 71 | 74 | 88 | 125 |
| 1440 | 70 | 59 | 69 | 72 | 87 | 122 |
| 1280 | 60 | 51 | 60 | 63 | 75 | 107 |
| 1024 | 46 | 38 | 45 | 47 | 57 | 82 |
| 768 | 35 | 30 | 35 | 37 | 44 | 62 |
| 430 | *masqué* | *masqué* | *masqué* | 37 | 45 | 51 |
| 390 | *masqué* | *masqué* | *masqué* | 33 | 40 | 45 |
| 375 | *masqué* | *masqué* | *masqué* | 32 | 38 | 43 |
| 320 | *masqué* | *masqué* | *masqué* | 26 | 31 | 36 |

Le plan arrière disparaît sous 768 px — comportement déjà en place, non modifié.

---

## 6. Performance (§9)

Mesure **réseau**, pas taille sur disque : un `srcset` dépose treize variantes,
le navigateur en prend six.

| Contexte | Avant | Après | Écart |
|---|---|---|---|
| 1920 × 1080, 1 dppx | 490 Ko | **130 Ko** | −73 % |
| 390 × 844, 1 dppx | 285 Ko | **130 Ko** | −54 % |
| 1440 × 900, **2 dppx** | ≈ 980 Ko (estimé) | **306 Ko** | −69 % |

Deux causes traitées :

1. **`sizes` décrivait l'emplacement, pas l'image.** 220 px annoncés pour un
   objet rendu à 71. Corrigé par `stageSizes()` (§3).
2. **L'échelle de variantes était hors sujet.** `[200, 400, 800]` servait des
   sources que rien ne pouvait afficher — la plus grande largeur d'affichage
   relevée est 125 px. Remplacée par `[128, 192, 288, 384]`, qui couvre 125 px
   à 3 pixels d'écran par point.

Le spécimen du CTA final passe de `25vw` à 128 px, et demande explicitement la
plus petite variante sous 1024 px, où il est en `display: none` — le navigateur
le télécharge quand même.

**LCP :** les six objets de la scène restent en `loading="eager"`. Le spécimen
du CTA final, sous la ligne de flottaison, reste en `lazy`. La règle n'est pas
« eager partout », c'est « eager là où c'est vu » — vérifié par test.

**Réserve assumée :** 306 Ko à 2 dppx reste lourd pour un hero. La cause est la
source elle-même — des rendus générés, bruités, avec canal alpha, dont le PNG
Coca-Cola pèse 1,78 Mo pour 443 × 1517. Des fichiers presse propres pèseraient
une fraction de cela. Ce point ne se traite pas dans le code.

---

## 7. Accessibilité (§10)

**Décision : les six packshots — et le spécimen du CTA final — sont
DÉCORATIFS.** Deux barrières, posées indépendamment :

1. Leurs conteneurs (`.hero__stage`, `.final__object`) portent déjà
   `aria-hidden="true"`. Inchangé.
2. `ProductObject` pose `alt=""` dès que `sourceType === 'generated'`.

Le raisonnement du point 2 : un visuel fabriqué par un modèle **n'atteste rien**
sur un produit réel — ni son conditionnement, ni son étiquette, ni son existence
au catalogue du titulaire. Annoncer « Coca-Cola — packshot » à un lecteur
d'écran affirmerait quelque chose que le fichier n'établit pas, et le ferait
auprès des seuls utilisateurs qui ne peuvent pas juger l'image par eux-mêmes.

Rien n'est perdu : le nom des marques est porté par le catalogue, qui est du
texte.

---

## 8. Portes de qualité

| Gate | Résultat |
|---|---|
| `npx astro check` | 0 erreur, 0 avertissement |
| `npm run qa` (production) | EXIT 0 |
| `npm run qa:artifact` (production) | 564/564 · 0 bloquant |
| `DEPLOY_TARGET=staging … qa-artifact` | 563/563 · 0 bloquant |
| `npm run qa:staging` | EXIT 0 |

---

## 9. Livrables

- `qa/screenshots/stage/viewport-*.png` — 9 largeurs
- `qa/screenshots/stage/plate-A…E-*.png` — 5 planches de lecture
- `qa/screenshots/stage/geometry.json` — géométrie mesurée, 9 largeurs
- `qa/screenshots/stage/weight-*.json` — poids réseau relevé, 3 contextes
- `doc/assets-registry.md` — registre régénéré

---

## 10. Ce qui reste ouvert

- **B2 — packshots officiels.** *Non refermé.* Ces six fichiers sont générés et
  sans autorisation. Ils servent à juger une composition, pas à publier.
- **B11 — droits des logos de marque.** Inchangé.
- **Observation, non corrigée :** les objets reposent sur leur propre filet de
  signal, situé ~25 px au-dessus du filet de sol commun. Cela se lit comme un
  bord d'étagère et paraît volontaire ; le corriger dépasserait l'unique passe
  de correction que TR-024B autorise. À trancher au revu visuel.
- **Effet de bord signalé :** le CTA final (`FinalCta.astro`) demande déjà
  `usage="hero"` pour Coca-Cola. Il affiche donc lui aussi un packshot en
  préproduction — planche E. Ce n'est pas une extension de portée décidée ici,
  c'est le même asset dans son usage déclaré.
