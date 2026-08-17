# TR-024C — Revue visuelle de « THE STAGE » et porte de composition

**Portée : Hero uniquement. Aucun déploiement. Aucune image générée.**
Base : `e551a1c1dddede4eef76ba3ca6f75f558ee7543b` (TR-024B).

---

## 1 · Lecture du Hero réel, neuf largeurs

| Largeur | Hiérarchie | Occultation | Ancrage | Verdict de lecture |
|---|---|---|---|---|
| 1920 | Coca-Cola nettement dominant ; Fanta / Red Bull équilibrés à gauche du sujet ; trio arrière étagé sur trois hauteurs | aucune (max relevé 0 %) | corrigé, voir §2 | conforme |
| 1440 | idem, cadrage plus serré, le débordement à droite du sujet se lit mieux | aucune | corrigé | conforme |
| 1280 | la profondeur reste lisible, le flou du plan arrière fait son travail | aucune | corrigé | conforme |
| 1024 | objets à 38–82 px : le trio arrière devient une suggestion, ce qui est l'intention | aucune | corrigé | conforme |
| 768 | composition desktop conservée, six objets présents, aucun débordement | aucune | corrigé | conforme |
| 430 / 390 / 375 | rangée de trois posée sous le texte, plan arrière masqué | sans objet | corrigé | conforme |
| 320 | rangée sous la ligne de flottaison ; le texte passe en premier, comme voulu | sans objet | corrigé | conforme |

Relation au H1, au CTA et au header : la scène commence à 44 % de la largeur et
le contenu s'arrête à 46 % — aucune superposition à aucune largeur. Le header
reste au-dessus d'une zone vide ; aucun objet ne le touche.

Zones vides : la moitié haute de la scène reste ouverte à toutes les largeurs
desktop. C'est le blanc éditorial de la direction artistique, pas un trou.

Bruit visuel : nul. Aucune lueur, aucun halo, aucun néon. Une seule ombre
portée, serrée et directionnelle, par objet.

---

## 2 · Ancrage — SHELF_DECISION

### Ce qui a été mesuré

Le plateau touchait bien le filet de sol, mais son padding bas laissait l'objet
suspendu — et cette hauteur est multipliée par l'échelle du plan :

| Plan | Écart objet ↔ sol, AVANT |
|---|---|
| médian (Fanta, Red Bull) | **23,0 px** |
| avant (Coca-Cola) | **30,7 px** |
| mobile (tous) | 8,8 px |

La scène affichait donc **trois lignes de sol** là où la direction artistique en
décrit une, et l'ombre portée tombait dans le vide avant de rencontrer un second
filet plus bas. Défaut visible sur les planches A, C et G1 ; invisible jusqu'ici
parce que les replis typographiques occupent tout leur plateau.

Second défaut trouvé au passage : le filet de signal de chaque objet était figé
à `--sp-5` (24 px) alors que le padding, lui, suit la largeur. Sous 960 px
l'objet débordait par le bas de son propre ancrage.

### Décision : **ALIGN_TO_COMMON_FLOOR**

Une seule déclaration, aucune valeur par produit :

```css
/* components.css — le padding bas devient pilotable */
--po-pad: clamp(var(--sp-2), 2.5vw, var(--sp-5));
padding-block-end: var(--po-pad-floor, var(--po-pad));
.product-object::after { inset-block-end: var(--po-pad-floor, var(--po-pad)); }

/* Hero.astro — la scène le ramène à zéro, uniquement là où un objet existe */
.hero__slot :global(.product-object:has(.product-object__img)) { --po-pad-floor: 0px; }
```

Le `:has()` limite l'effet aux plateaux qui contiennent réellement un objet :
**en production, les six emplacements rendent leur repli typographique et
gardent exactement la composition validée.**

Après : écart objet ↔ sol = **−1 px** sur les plans médian et avant, à toutes
les largeurs. Les géométries de plan (échelles 0,64 / 1 / 1,32, flou, opacité,
coordonnées x et y) sont inchangées — hormis la correction Pepsi de TR-024B.

Contrôles rejoués : occultation à cinq largeurs, géométrie et débordement à
neuf largeurs, poids réseau. Tous verts.

---

## 3 · Effet de bord du CTA final — FINAL_CTA_DECISION

`FinalCta.astro` demande `usage="hero"` pour Coca-Cola. Son propre commentaire
dit pourquoi : *« Un seul objet, très grand, débordant à droite : le même
cadrage que le plan avant du hero. La page se referme comme elle s'est
ouverte. »*

Le packshot **réalise** cette intention au lieu de la contredire : la planche I
montre un spécimen unique, net, posé sur son filet, en écho exact au plan avant.
La page ouvre et referme sur le même objet.

### Décision : **DESIRED_REUSE**

Aucune correction architecturale. Séparer `FinalCta` du système Hero
détruirait la rime qui justifie la section.

---

## 4 · Filigrane — B15_DECISION

### Comparaison à armes égales

La première comparaison était faussée : la variante injectée provenait du
dérivé 2× du header (~60 px de haut), agrandi six fois. Reprise depuis la source
native `monogram-light.webp` (600 × 491), à opacité identique — planches H1 / H2.

| | Filigrane typographique | Monogramme officiel |
|---|---|---|
| Forme | deux capitales séparées, composées en Instrument Serif | la ligature dessinée, avec le délié qui passe sous le A |
| Reconnaissance | évoque la marque | **est** la marque |
| Netteté à 3,5 % | nette | nette |
| Rime avec le header | de famille | exacte |

Le tracé officiel est le seul des deux qui soit identifiable comme la marque.

### Décision : **REPLACE — B15 CLOSED**

| Condition | État |
|---|---|
| Asset officiel utilisé | ✅ `monogram-light.webp`, via le registre (`SiteMark`) |
| Opacité conforme à la DA | ✅ 0,035 — plafond de test 0,06 |
| Hors arbre d'accessibilité | ✅ `alt=""`, `pointer-events: none` |
| Aucun CLS mesurable | ✅ **CLS = 0,00000** (dimensions posées par `<Image>`) |
| Reduced-motion inchangé | ✅ le `scale(1.04)` de parallaxe reste conditionné à `desktop + mouvement autorisé` |
| QA verte | ✅ voir §7 |
| Aucun autre changement d'identité | ✅ header, footer, favicon intacts |

Poids : **12,4 Ko**, densité simple. La source native ferait 34,8 Ko ; à 3,5 %
d'opacité l'amplitude maximale du filigrane est de 8/255, et l'écart mesuré
entre une source de 320 px et la source native de 600 px est de **3/255 au pire
pixel**, 0,027/255 en moyenne. Personne ne peut le voir. `SiteMark` a donc reçu
une propriété `densities`, documentée par cette mesure.

Si le fichier venait à disparaître, `SiteMark` repasserait au repli
typographique plutôt qu'à un vide — le garde-fou reste, il change de sens.

---

## 5 · Qualité des packshots générés

Inspection à résolution native (planches `qa/review/label-*.png`,
`tops.png`, `bases.png`). **Aucun de ces fichiers n'est autorisé en production.**

| Marque | Constat | Statut |
|---|---|---|
| **coca-cola** | Script spencérien correct, ® présent, « ORIGINAL TASTE » bien approché, bouteille contour à cannelures justes, condensation non répétée, base verre et capsule couronne correctes. Réserve mineure : les bords de la bande rouge sont plus droits que la courbure de la bouteille. | `VISUALLY_ACCEPTABLE_FOR_STAGING` |
| **fanta** | Wordmark correct (script bleu cerné de blanc, feuille, « ORANGE »), base pétaloïde correcte pour un PET gazeux. Défauts : point sombre au centre de la tranche d'orange, quartiers irréguliers ; aucune arête d'étiquette visible — le décor semble imprimé sur le corps. Invisible à 74 px. | `VISUALLY_ACCEPTABLE_FOR_STAGING` |
| **red-bull** | Wordmark, ®, « ENERGY DRINK » et « Vitalizes body and mind® » corrects et bien placés ; deux taureaux sur le soleil jaune. Défauts : glyphes fantômes (« 0 ») dans le bleu bas de canette, pattes des taureaux légèrement fondues, convergence imprécise des quadrants. Invisible à 88 px. | `VISUALLY_ACCEPTABLE_FOR_STAGING` |
| **monster-energy** | Griffe verte correcte, « TAURINE + GINSENG » correct en haut de canette. Défaut : le wordmark se lit « MØNSTER » — O barré, S malformé. Rendu à 60 px, plan arrière, 30 % d'opacité et 4 px de flou : strictement illisible. | `VISUALLY_ACCEPTABLE_FOR_STAGING` |
| **pepsi** | Globe et wordmark bas-de-casse bien formés — mais c'est la **livrée 2008-2023, remplacée mondialement en 2023**. Ce n'est pas un défaut de rendu, c'est une inexactitude factuelle sur un produit du catalogue. Un grossiste en boissons est exactement le lecteur qui la repère. | **`REPLACE_BEFORE_CLIENT_REVIEW`** |
| **sprite** | Wordmark correct, « LEMON-LIME » et « NATURAL FLAVOURS » lisibles et justes, fruit plausible. Livrée canette verte : refondue en 2022 sur plusieurs marchés, mais toujours largement en circulation sous cette forme. | `VISUALLY_ACCEPTABLE_FOR_STAGING` |

Perspective, réflexions et condensation : cohérentes entre les six, prise de vue
à hauteur d'œil, aucune duplication de gouttes détectée, toutes les bases sont
plates et alignables sur un sol commun.

---

## 6 · Performance

| Contexte | TR-024B | TR-024C | Écart |
|---|---|---|---|
| Packshots · 1920 @1x | 130 Ko | **130 Ko** | 0 |
| Packshots · 390 @1x | 130 Ko | **130 Ko** | 0 |
| Packshots · 1440 @2x | 306 Ko | **306 Ko** | 0 |
| Filigrane (production ET préproduction) | 0 Ko | **+12,4 Ko** | nouveau |

Aucune régression. L'ajout du filigrane est le seul poste nouveau ; il est
assumé, mesuré, et compressé au plus bas que la mesure autorise. Les budgets de
`tests/perf.spec.ts` restent tenus sur les huit routes.

---

## 7 · Portes de qualité

| Gate | Résultat |
|---|---|
| `npx astro check` | 0 erreur, 0 avertissement |
| `npm run qa` | **EXIT 0** — 564/564 · 824 + 227 tests |
| `npm run qa:staging` | **EXIT 0** — 563/563 · 51 tests |
| Packshots générés dans `dist/` de production | **0** |

Trois tests portaient l'état antérieur et ont été mis à jour, pas contournés :
`hero.spec.ts` mesure désormais `opacity` et non l'alpha d'une couleur de texte ;
`shell.spec.ts` attendait explicitement un filigrane provisoire et vérifie
maintenant qu'il n'en reste aucun ; `identity.spec.ts` interdisait toute image
d'identité dans le hero et contrôle désormais les propriétés du filigrane, CLS
compris.

---

## 8 · Livrables

`qa/screenshots/stage/` — planches A à E, neuf largeurs, géométrie et poids.
`qa/review/` :

- `plate-E-produits-seuls.png` — composition sans texte ni filigrane
- `plate-F-boites.png` — boîtes englobantes, bases, filet de sol
- `plate-G1-ancrage-avant.png` / `plate-G2-ancrage-apres.png`
- `plate-H1-filigrane-typographique.png` / `plate-H2-monogramme-officiel.png`
- `grounding.json` — écart objet ↔ sol, six largeurs
- `label-*.png`, `packshot-*.png`, `tops.png`, `bases.png` — inspection qualité

---

## 9 · Ce qui reste ouvert

- **B2 — packshots officiels.** Toujours ouvert. Les six fichiers restent
  générés, sans autorisation, et ne sortent pas de la préproduction.
- **B11 — droits des logos de marque.** Inchangé.
- **Pepsi — livrée obsolète.** À remplacer avant de montrer les planches au
  client. Ne bloque pas le jugement de composition : l'objet est au plan
  arrière, flouté, à 30 % d'opacité.
- **B15 — clos par ce TR.**
