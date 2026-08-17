# TR-025 — Packshots Featured (10 marques)

**État : BLOQUÉ — la planche n'est pas exploitable.**
Base : `b14968e`. Aucune modification du dépôt, aucun packshot intégré.

---

## 1 · Audit de la planche

Un seul fichier fourni : `ChatGPT Image 17 août 2026, 20_01_43.png`.

| | |
|---|---|
| Dimensions | **1536 × 1024** |
| Format | PNG, canal alpha présent |
| Profil ICC | absent |
| Produits détectés | **10**, grille 5 × 2 |
| Couture des rangées | y = 558 (détectée par minimum d'énergie de gradient) |
| Chevauchements | **aucun** — les produits ne se touchent pas |

### L'alpha ne sépare rien

| Mesure | Valeur |
|---|---|
| Pixels transparents (α ≤ 16) | **8,6 %** — uniquement le vignettage des bords extérieurs |
| Pixels opaques | **91,4 %** |
| Pixels en alpha partiel | **40,6 %** — un fondu global, pas des contours |
| Colonnes entièrement transparentes | **AUCUNE** |
| Rangées entièrement transparentes | **AUCUNE** |

Échantillons du fond, **entre** deux produits :

| Position | Alpha | RGB |
|---|---|---|
| entre evian et orangina | **171** | 85, 89, 109 |
| entre powerade et capri-sun | 66 | 34, 79, 121 |
| entre 7up et bundaberg | 49 | 43, 81, 18 |
| haut de planche | **250** | 94, 99, 102 |
| couture des rangées | **248** | 0, 90, 167 |

Il n'y a **aucune séparation transparente entre les produits**. Ce qui les
entoure n'est pas du vide : c'est un fond peint, coloré différemment derrière
chaque produit (gris-bleu derrière evian, orangé derrière orangina, vert
derrière mountain dew…), avec un halo et une ombre portée incrustés.

### Résolution disponible par produit

Étendue estimée par énergie de gradient à l'intérieur de chaque cellule — les
produits portent des arêtes nettes, le halo est lisse. C'est le seul signal
disponible, l'alpha n'en donnant aucun.

| Marque | Cellule | Étendue | Ratio | Pixels disponibles |
|---|---|---|---|---|
| evian | 0–306 | 79–269 | 0,382 | **191 × 500** |
| orangina | 307–613 | 348–565 | 0,492 | **218 × 443** |
| powerade | 614–921 | 640–921 | 0,600 | **282 × 470** |
| capri-sun | 922–1228 | 922–1228 | 0,773 | **307 × 397** |
| dr-pepper | 1229–1535 | 1229–1458 | 0,528 | **230 × 436** |
| spa | 0–306 | 75–246 | 0,388 | **172 × 443** |
| mountain-dew | 307–613 | 365–562 | 0,489 | **198 × 405** |
| schweppes | 614–921 | 657–854 | 0,474 | **198 × 418** |
| 7up | 922–1228 | 949–1155 | 0,534 | **207 × 388** |
| bundaberg | 1229–1535 | 1247–1448 | 0,465 | **202 × 434** |

### Provenance

Manifeste C2PA signé, embarqué dans le fichier :

```
c2pa.created · softwareAgent { name: gpt-image, version: 2.0 }
digitalSourceType: …/newscodes/digitalsourcetype/trainedAlgorithmicMedia
```

Image **générée**, comme les six du Hero. Cohérent avec le régime demandé au §5.

---

## 2 · Mapping — conforme, sans ambiguïté

Les dix marques attendues sont présentes, identifiées par leur propre
wordmark, et **aucune autre**. Ordre de lecture :

| Rangée 1 | evian · orangina · powerade · capri-sun · dr-pepper |
|---|---|
| **Rangée 2** | spa · mountain-dew · schweppes · 7up · bundaberg |

Aucun `REQUIRES_MAPPING_CONFIRMATION`.

### Réserve : des mentions de SKU sont peintes sur les emballages

Ce point est indépendant de l'extraction et survivrait à une nouvelle planche.

| Marque | Texte visible sur l'emballage généré |
|---|---|
| capri-sun | « ORANGE » |
| powerade | « MOUNTAIN BLAST » |
| schweppes | « INDIAN TONIC · Tonic Water » |
| spa | « INTENSE » |
| **bundaberg** | « GINGER BEER · **375 mL** » |

Le catalogue ne confirme ni saveur, ni variante, ni volume — c'est une règle
posée au départ (« Aucun enrichissement de SKU non confirmé »). Un packshot
qui affiche « 375 mL » énonce un format que rien n'établit, et le fait à
l'écran, en clair. Une planche de remplacement devrait être demandée **sans
mention de saveur ni de volume**, ou ces mentions devront être confirmées par
le client avant publication.

---

## 3 · Extraction — **REJECT**

L'extraction demandée au §3 n'est pas réalisable sans reconstruction. Trois
obstacles, cumulatifs.

**a) Il n'y a pas d'alpha à découper.** Alpha 245–252 sur le produit comme sur
le fond. Le seul alpha faible est le vignettage des bords de planche. Un
remplissage par diffusion depuis les bords — la méthode employée pour les 60
logos du catalogue — ne peut pas fonctionner : le fond n'est ni uniforme, ni
d'une seule couleur, et il change derrière chaque produit.

**b) Halo et ombres sont incrustés.** Chaque produit est cerné d'un halo peint
qui épouse sa silhouette, posé sur une surface réfléchissante avec ombre et
reflet. Découper au ras du produit conserve le halo sur son pourtour — c'est
exactement le « glow » que le §3 interdit d'ajouter.

**c) Quatre produits sur dix sont translucides.** Evian et Spa sont des PET
transparents remplis d'eau, Orangina est du verre, Capri-Sun une poche
métallisée. **Le fond se lit à travers** : le bord gauche du verre d'Orangina
mesure 122, 90, 92 (teinté par le fond chaud à sa gauche) et son bord droit
4, 6, 71 (teinté par le fond bleu à sa droite). Isoler ces produits laisse le
halo coloré *à l'intérieur* de la silhouette — ou impose d'inventer ce qui
devrait s'y trouver.

Les deux issues sont interdites : conserver le halo, c'est ajouter un effet ;
le remplacer, c'est inventer des pixels. Le §3 tranche : **REJECT**.

Preuve : `qa/review/featured-plate-preuve.png` — le damier de transparence
n'apparaît nulle part sur les produits ni autour d'eux.

---

## 4 · Résolution — **REJECT** pour les dix, indépendamment

Besoins **mesurés dans le navigateur**, pas estimés :

| Emplacement | Plateau à 1920 | Padding | Hauteur d'image |
|---|---|---|---|
| Featured | 235 × 313 | 24 px | **265 px CSS** |
| S4 Discovery | 329 × 439 | 24 px | **391 px CSS** |

Le packshot est ajusté par la hauteur : c'est elle qui commande.

| Cible | Hauteur source requise |
|---|---|
| Featured · DPR 2 | 530 px |
| Featured · DPR 3 | **795 px** |
| S4 · DPR 2 (mountain-dew, bundaberg) | 782 px |
| S4 · DPR 3 (mountain-dew, bundaberg) | **1173 px** |

Hauteurs disponibles : **388 à 500 px**.

| Marque | Dispo | / Featured DPR2 | / Featured DPR3 | Verdict |
|---|---|---|---|---|
| evian | 500 | 94 % | 63 % | REJECT |
| powerade | 470 | 89 % | 59 % | REJECT |
| orangina | 443 | 84 % | 56 % | REJECT |
| spa | 443 | 84 % | 56 % | REJECT |
| dr-pepper | 436 | 82 % | 55 % | REJECT |
| bundaberg | 434 | 82 % | 55 % · **37 % du besoin S4** | REJECT |
| schweppes | 418 | 79 % | 53 % | REJECT |
| mountain-dew | 405 | 76 % | 51 % · **35 % du besoin S4** | REJECT |
| capri-sun | 397 | 75 % | 50 % | REJECT |
| 7up | 388 | 73 % | 49 % | REJECT |

**Aucun des dix n'atteint le besoin DPR 2**, et aucun n'atteint la moitié du
besoin DPR 3 pour Mountain Dew et Bundaberg. Conformément au §4, aucun
agrandissement n'a été appliqué pour faire passer le contrôle.

---

## 5 à 13 · Non exécutés

Intégration, gouvernance, Featured à 16, gates production/préproduction,
normalisation optique, responsive et revue visuelle **n'ont pas été
exécutés** : le §3 impose l'arrêt avant intégration, et l'audit du §1 est
justement l'étape qui devait précéder toute intégration.

Le Hero, le CTA final, S4, `/drinks/`, `/brands/`, le header, le footer, B15,
`SITE_HOST`, les canonicals, les hreflang, le DNS et le formulaire n'ont pas
été touchés. `FEATURED_COUNT` reste à 16 marques, servies par leur repli
typographique sauf les six du Hero en préproduction.

---

## 6 · Ce qu'il faut fournir pour débloquer

Une planche composite ne convient pas : le fond peint et les halos rendent la
segmentation impossible sans reconstruction. Il faut **dix fichiers séparés**.

Pour chacun :

- **un produit par fichier**, PNG RGBA ;
- **fond réellement transparent** (α = 0), pas un blanc ni un dégradé ;
- **aucun halo, aucune ombre portée, aucun reflet de sol, aucune éclaboussure,
  aucune lueur** — rien d'autre que le produit ;
- produit de face, entier, vertical, sans inclinaison ;
- marge transparente ≤ 0,5 % sur les quatre bords ;
- **hauteur minimale 800 px** — et **1200 px pour mountain-dew et bundaberg**,
  qui apparaissent aussi en S4 ;
- **aucune mention de saveur ni de volume** sur l'emballage, sauf confirmation
  écrite du client (voir §2).

Contrôle d'acceptation, sur chaque fichier : hauteur ≥ 800 px (1200 pour les
deux cités), couverture opaque ≥ 0,93 dans la boîte englobante — au-delà d'une
ombre incrustée la valeur s'effondre —, marges transparentes nulles, et alpha
strictement à 0 hors du produit.

À réception, l'intégration suit le chemin déjà éprouvé en TR-024B/D : recadrage
strict sur la boîte alpha, entrée de registre par marque en
`sourceType: generated` / `requires_validation` / `unknown`, préproduction
uniquement, production à zéro packshot généré.

---

## 7 · État

| | |
|---|---|
| Arbre de travail | propre, hors ce document |
| Commit | `b14968e`, inchangé |
| Packshots intégrés | **0** |
| Production | 0 packshot généré, inchangé |
| B2 | ouvert |
