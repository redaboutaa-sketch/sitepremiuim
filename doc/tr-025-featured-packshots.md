# TR-025 — Packshots Featured (10 marques)

**État : INTÉGRÉ en préproduction.** Base : `58fa401`.
Production inchangée, zéro packshot généré. Aucun déploiement.

> La **première** planche livrée a été refusée : fond peint, halos et ombres
> incrustés, aucune séparation transparente, quatre produits translucides à
> travers lesquels le fond se lisait. Le détail de ce refus est conservé au §1
> — c'est lui qui a défini ce qu'il fallait fournir.

---

## 1 · Planche refusée, puis planche retenue

| | Planche 1 (20:01) | Planche 2 (20:25) |
|---|---|---|
| Dimensions | 1536 × 1024 | 1536 × 1024 |
| Pixels transparents | **8,6 %** (vignettage des bords) | **50,0 %** |
| Alpha partiel | 40,6 % (fondu global) | **2,0 %** (antialiasing des contours) |
| Colonnes transparentes | **aucune** | **6** — 0-70, 255-347, 567-641, 847-896, 1169-1244, 1467-1535 |
| Rangées transparentes | **aucune** | **3** — 0-4, 537-540, 1006-1023 |
| Fond entre deux produits | alpha 171 sur rgb 85,89,109 | alpha 0 |
| Halo / ombre / reflet | incrustés | **aucun** |
| Verdict extraction | **REJECT** | **PASS** |

La seconde planche sépare réellement ses dix produits : cinq colonnes, deux
rangées, marges transparentes nulles sur les quatre bords de chaque objet.

**Provenance, identique pour les deux** — manifeste C2PA signé, lu dans le
fichier : `c2pa.created · gpt-image 2.0 · digitalSourceType =
trainedAlgorithmicMedia`. Images **générées**, comme les six du Hero.

---

## 2 · Mapping

Les dix marques attendues, chacune identifiée par son propre wordmark, aucune
autre. **Aucun `REQUIRES_MAPPING_CONFIRMATION`.**

| Rangée 1 | evian · orangina · powerade · capri-sun · dr-pepper |
|---|---|
| **Rangée 2** | spa · mountain-dew · schweppes · 7up · bundaberg |

**Les mentions de SKU de la planche 1 ont disparu.** Celle-ci ne porte plus
« ORANGE » (capri-sun), « MOUNTAIN BLAST » (powerade), « INDIAN TONIC »
(schweppes), « INTENSE » (spa) ni « 375 mL » (bundaberg). Ne subsistent que des
descripteurs de type appartenant aux marques elles-mêmes — « NATURAL MINERAL
WATER », « GINGER BEER », « LEMON-LIME ». Aucun volume, aucune saveur, aucune
variante n'est affirmée.

Mountain Dew apparaît sous son wordmark abrégé « mtn DEW », qui est une livrée
réelle de la marque.

---

## 3 · Extraction

Recadrage **strict sur la boîte alpha**, produit par produit. Aucun
redimensionnement, aucune retouche, aucun pixel reconstruit.

| Marque | Fichier | Ratio | Couverture | Marges | Octets |
|---|---|---|---|---|---|
| evian | 184 × 529 | 0,3478 | 0,847 | 0,0,0,0 | 266 105 |
| orangina | 219 × 455 | 0,4813 | 0,658 | 0,0,0,0 | 266 927 |
| powerade | 179 × 530 | 0,3377 | 0,825 | 0,0,0,0 | 240 852 |
| capri-sun | 272 × 437 | 0,6224 | 0,751 | 0,0,0,0 | 336 558 |
| dr-pepper | 219 × 406 | 0,5394 | 0,953 | 0,0,0,0 | 257 639 |
| spa | 179 × 465 | 0,3849 | 0,804 | 0,0,0,0 | 225 536 |
| mountain-dew | 198 × 401 | 0,4938 | 0,963 | 0,0,0,0 | 245 850 |
| schweppes | 191 × 431 | 0,4432 | 0,963 | 0,0,0,0 | 225 214 |
| 7up | 209 × 409 | 0,5110 | 0,953 | 0,0,0,0 | 249 226 |
| bundaberg | 206 × 464 | 0,4440 | 0,866 | 0,0,0,0 | 282 017 |

Les couvertures basses (orangina 0,658, capri-sun 0,751) correspondent à des
silhouettes creuses — col de bouteille, paille en diagonale — pas à une ombre
incrustée, qui aurait laissé une auréole dans la boîte.

---

## 4 · Résolution — `PASS_WITH_RESOLUTION_WARNING` pour les dix

Besoins **mesurés dans le navigateur**, pas repris d'une estimation :

| Emplacement | Plateau à 1920 | Padding | Hauteur d'image |
|---|---|---|---|
| Featured | 235 × 313 | 24 px | **265 px CSS** |
| S4 Discovery | 329 × 439 | 24 px | **391 px CSS** |

| Marque | Hauteur | Featured DPR 2 | Featured DPR 3 | S4 DPR 3 |
|---|---|---|---|---|
| powerade | 530 | **100 %** | 67 % | — |
| evian | 529 | 100 % | 67 % | — |
| bundaberg | 464 | 88 % | 58 % | **40 %** |
| spa | 465 | 88 % | 58 % | — |
| orangina | 455 | 86 % | 57 % | — |
| capri-sun | 437 | 82 % | 55 % | — |
| schweppes | 431 | 81 % | 54 % | — |
| dr-pepper | 406 | 77 % | 51 % | — |
| 7up | 409 | 77 % | 51 % | — |
| mountain-dew | 401 | 76 % | 50 % | **34 %** |

Aucun n'atteint DPR 3 ; deux atteignent DPR 2 ; tous couvrent DPR 1. Ils
remplissent donc leur rôle — juger la composition en préproduction — sans
prétendre à la définition d'un fichier presse. **Aucun agrandissement n'a été
appliqué.** Mountain Dew et Bundaberg, qui alimentent aussi S4, y sont les plus
justes : 34 % et 40 % du besoin DPR 3.

---

## 5 · Gouvernance

Les dix entrées portent, sans exception :

```
sourceType:    'generated'
status:        'requires_validation'    → préproduction uniquement
authorization: { status: 'unknown', evidence: null }
```

Aucun n'est qualifié d'officiel, de fourni par le titulaire, de fichier presse
ni de droits validés. **Aucun ne ferme B2.**

`asset-governance.mjs` connaît désormais deux bases de nom générées, `hero` et
`packshot`, et `tests/assets.spec.ts` vérifie la correspondance **dans les deux
sens** : tout asset généré est un visuel produit sous l'une de ces bases, et
toute entrée sous ces bases est bien générée.

---

## 6 · Featured — `FEATURED_COUNT = 16`

| | |
|---|---|
| Objets rendus dans la piste | **16** |
| Replis typographiques | **0** |
| Logos de marque | **0** |
| Nouveaux packshots | **10** |
| Masters Hero réemployés | **6** — coca-cola, fanta, red-bull, monster-energy, pepsi, sprite |
| Fichiers dupliqués | **0** |

Le réemploi passe par une propriété explicite, `fallbackUsage="hero"` : les six
marques de la scène n'ont pas de fichier `packshot`, et n'ont pas à en avoir un.

### Deux effets de bord, dont un corrigé

**`/drinks/` — corrigé.** Le catalogue demandait `usage="packshot"` avec repli
sur logo. Tant qu'aucun packshot n'existait, les deux formulations rendaient la
même chose ; l'arrivée des dix a fait basculer **dix cellules sur 62** de logo à
packshot, sans que personne ne le décide. Le catalogue demande désormais
`usage="logo"` — ce qu'il a toujours voulu. **Vérifié sur l'artefact : 60 logos,
0 packshot, 2 replis, exactement comme avant TR-025.**

**S4 Discovery — assumé, signalé.** Sa séquence contient mountain-dew et
bundaberg, qui ont maintenant un packshot : deux de ses huit spécimens sont
désormais des visuels produits. C'est ce que le §4 anticipait en leur fixant un
besoin de résolution supérieur. Aucune ligne de S4 n'a été touchée.

---

## 7 · Production

| Contrôle `qa:artifact` | Résultat |
|---|---|
| Aucun visuel de marque publié | ✅ |
| Aucun packshot généré déposé dans `dist/` | ✅ **0** |
| Aucun packshot hero rendu dans une page | ✅ |
| **Aucun packshot Featured rendu dans une page** | ✅ *(contrôle ajouté)* |
| Aucun `data-generated` dans le HTML | ✅ |
| Aucune référence d'image vers un fichier absent | ✅ |

En préproduction, deux contrôles nouveaux : les seize Featured sont servis par
un visuel produit, et les six marques du Hero y réemploient bien leur master.

---

## 8 · Préproduction

16 Featured résolus, bons slugs, bons produits, aucune image cassée, **aucune
requête externe**, aucun logo à la place d'un packshot. Vérifié sur l'artefact
et dans le navigateur.

---

## 9 · Normalisation optique — un défaut trouvé et corrigé

La piste attribuait la hauteur de plateau par **position** (`i % 4`). L'objet
remplit la hauteur de son plateau et sa largeur suit son ratio : un objet
étroit posé sur un plateau court est donc doublement pénalisé.

Le hasard de l'ordre avait posé les trois bouteilles les plus fines sur les
trois plateaux les plus courts. Mesure à 1440 px :

| | Avant | Après |
|---|---|---|
| evian | 58 × 168 | **83 × 240** |
| powerade | 57 × 168 | **81 × 240** |
| spa | 65 × 168 | **85 × 222** |
| pepsi | 120 × 240 | 84 × 168 |
| **Écart d'aire optique** | **3,01 ×** | **1,54 ×** |

Le plateau est désormais attribué par **ratio** : les objets les plus étroits
reçoivent les plateaux les plus hauts. Une seule règle, **aucune valeur par
marque**, et l'ondulation de la ligne de tête subsiste — elle cesse d'être
arbitraire pour devenir une conséquence des produits. Le sol reste commun, les
proportions restent réelles : les largeurs vont de 70 à 105 px, personne n'est
déformé.

Un test verrouille l'écart sous 1,9 × : c'est une alarme de régression, pas une
cible à frôler.

---

## 10 · Responsive — neuf largeurs

| Largeur | Débordement de page | Piste défilable | Écart d'aire | Produit hors plateau | Libellé coupé |
|---|---|---|---|---|---|
| 320 | 0 | ✅ | 1,46 × | 0 | non |
| 375 | 0 | ✅ | 1,47 × | 0 | non |
| 390 | 0 | ✅ | 1,46 × | 0 | non |
| 430 | 0 | ✅ | 1,49 × | 0 | non |
| 768 | 0 | ✅ | 1,57 × | 0 | non |
| 1024 | 0 | ✅ | 1,58 × | 0 | non |
| 1280 | 0 | ✅ | 1,57 × | 0 | non |
| 1440 | 0 | ✅ | 1,54 × | 0 | non |
| 1920 | 0 | ✅ | 1,53 × | 0 | non |

L'interaction n'a pas été touchée : le défilement de la piste reste piloté par
`src/scripts/track.ts`, inchangé.

---

## 11 · Poids

| Contexte | Avant le correctif `sizes` | Après |
|---|---|---|
| 1440 @1x — total | 1 008 Ko | **715 Ko** |
| 1440 @2x — total | 1 247 Ko | **992 Ko** |

`sizes` annonçait 25 vw — 360 px à 1440 — pour des objets rendus entre 70 et
105 px. `featuredSizes()` transcrit la géométrie réelle de la piste, sur le même
modèle documenté que `stageSizes()`.

**Deux chiffres, pas un.** Les seize images sont en `loading="lazy"`, mais
Chrome anticipe : à 1440 × 900 la piste entre dans sa fenêtre de préchargement
et huit visuels partent avant tout défilement. Le poids avant défilement est
donc de **462 Ko (1x)** et **715 Ko (2x)**, pour 14 fichiers. C'est un
comportement du navigateur, pas un réglage — et **cela ne concerne que la
préproduction** : la production ne publie aucun de ces fichiers.

Les six masters Hero sont servis **deux fois**, dans deux définitions
différentes, parce que la scène et la piste ne les affichent pas à la même
taille. C'est le prix du réemploi, et il reste inférieur à celui d'un doublon
de master.

---

## 12 · Portes de qualité

| Gate | Résultat |
|---|---|
| `npx astro check` | 0 erreur, 0 avertissement |
| `npm run qa` | **EXIT 0** — 565/565 · 826 + 233 tests |
| `npm run qa:staging` | **EXIT 0** — 565/565 · 62 tests |
| Packshots générés dans `dist/` production | **0** |
| Featured résolus en préproduction | **16 / 16** |

---

## 13 · Livrables

`qa/screenshots/featured/` :

- `planche-16-produits.png` — les seize masters à hauteur optique comparable
- `desktop-1440x900-section.png`, `mobile-pixel7-section.png`
- `viewport-{320,375,390,430,768,1024,1280,1440,1920}.png`
- `geometry.json` — plateau, image, débordement, libellé, par marque et par largeur
- `weight-1440x900@{1x,2x}.json`

Pas de capture « début / milieu / fin » : `src/scripts/track.ts` pilote
`scrollLeft` depuis la progression **verticale** de la page, si bien que la
piste ne se positionne pas par script — trois captures à trois offsets
sortaient rigoureusement identiques, et une capture d'élément ne rattrape pas
le hors-champ. La vue d'ensemble est fournie par la planche des seize.

---

## 14 · Ce qui reste ouvert

- **B2 — packshots officiels.** Ouvert pour les seize. Aucun fichier presse,
  aucune autorisation.
- **B11 — droits des logos de marque.** Inchangé.
- **Résolution.** Aucun des dix n'atteint DPR 3 ; Mountain Dew et Bundaberg
  sont à un tiers du besoin S4. Suffisant pour juger, insuffisant pour publier.
