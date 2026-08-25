# TR-030 — LOGO LIPTON ICE TEA · DEUXIÈME LIVRAISON, ACCEPTÉE

**Date** : 2026-08-25
**Livraison** : `logo.zip` — un fichier, `logo.svg`, 6 519 octets,
SHA-256 `bb8033a6797a4def7534802381f471e1bad3a69746cfb91804a1186bb136fff5`
**Cible** : préproduction. **Aucun déploiement production.**

---

## 1. Ce que ça change

TR-029 avait **refusé** le logo Lipton fourni dans la planche de packshots : son
manifeste C2PA le donnait pour généré par `gpt-image`, c'est-à-dire une marque
figurative **redessinée**. Le refus tenait à la règle en vigueur depuis TR-004 —
« ne crée ni ne redessine aucun logo pour combler l'absence ».

Cette deuxième livraison est d'une **autre nature**, et c'est mesurable. Elle est
acceptée.

Lipton Ice Tea était la dernière des quatorze marques sans logo. **Le catalogue
`/drinks/` n'a plus aucune cellule en repli typographique.**

---

## 2. Audit du fichier

| Contrôle | Résultat |
| --- | --- |
| Format | SVG **vectoriel pur** — 9 `<path>`, 1 `<svg>` |
| Raster embarqué | **aucun** — pas d'`<image>`, pas d'URI `data:` |
| `<text>` | **aucun** — le lettrage « Lipton » est en tracés convertis |
| `<script>` / `<style>` | **aucun** |
| Référence externe | **aucune** (`xlink:href` absent) |
| Couleurs | 3 aplats exacts — `#FCDA00`, `#BE0D30`, blanc |
| Symbole ® | présent, correctement posé |
| Métadonnées générateur | **aucune** |

Un lettrage en tracés convertis et des aplats de charte exacts sont ce que
produit un kit de marque, pas un export approximatif.

### 2.1 Ce que je ne peux PAS établir

**Un SVG ne porte pas de manifeste C2PA**, et ce fichier n'a aucune métadonnée
de générateur. Sa provenance ne se démontre donc **pas depuis le fichier**,
contrairement à la planche PNG de TR-029 dont le manifeste signé disait
`gpt-image 2.0` / `trainedAlgorithmicMedia`.

Ce qui est vérifiable, c'est que **rien dedans n'indique une fabrication** et que
ses caractéristiques sont celles d'un fichier de marque authentique. C'est une
absence de contre-indication, pas une preuve d'origine — et la distinction est
volontairement inscrite au registre.

**L'autorisation reste non confirmée.** Le logo est enregistré
`authorization: 'referential-use'` avec la mention « droits de production NON
confirmés », exactement comme les treize autres logos du catalogue.
**Le blocage B11 n'est pas fermé.**

---

## 3. Format — pourquoi le SVG n'est pas conservé sous `src/assets/`

Le logo est **rastérisé en WebP 640 px**, comme les treize autres. Deux raisons,
toutes deux vérifiées dans le code et non supposées :

1. Le glob de `ProductObject.astro` couvre
   `{png,jpg,jpeg,webp,avif}` — **pas `.svg`**. Un SVG déposé là ne serait
   simplement jamais résolu.
2. Plus grave : `isImageFile()` dans `asset-governance.mjs` teste
   `/\.(png|jpe?g|webp|avif|gif)$/i` — **`.svg` non plus**. Un SVG de marque
   tierce **échapperait donc à l'élagage de production** et partirait chez
   l'hébergeur, alors que la règle est que la production ne publie **aucun**
   visuel de marque non validé.

C'est le genre de trou que la liste blanche est censée fermer. Ici elle le ferme
dans l'autre sens : le format non prévu est écarté plutôt que laissé passer.

Le dépôt n'a d'ailleurs **aucun master vectoriel** — même l'identité Ivan Arsenov
est en raster. La rastérisation est la convention établie, pas une exception.

Le SHA-256 du SVG source est inscrit au registre pour que le master reste
identifiable. **Il vaut la peine d'être archivé hors dépôt** : c'est la meilleure
source disponible pour toute réimpression ou tout écran très dense.

### 3.1 Fichier produit

| | |
| --- | --- |
| chemin | `src/assets/brands/lipton-ice-tea/logo.webp` |
| dimensions | 640 × 648 |
| octets | 31 444 |
| SHA-256 | `4f8afbee11cc9d61800df15c4914397fa81bf5e86269b7b19df0283be86fe9b7` |
| couverture optique | 0,766 |

Rastérisé à densité 2400 puis réduit à 640 px. **Aucune retouche, aucun
recadrage, aucune recoloration.**

---

## 4. Lisibilité et équilibre optique

| Surface | Pixels atteignant 3:1 |
| --- | --- |
| Encre (`#0A0A0B`) | **98 %** |
| Papier (`#F2F0EC`) | **26 %** |

Les 26 % sur papier sont dans la même bande que plusieurs logos déjà au
catalogue (Mirinda 27 %, 28 Black 20 %, 7UP 37 %) et la note du registre le
signale comme pour eux.

**C'est une mesure par pixel, pas un verdict de lisibilité.** L'identité Lipton
est majoritairement jaune et blanche — seul le bandeau rouge franchit le seuil
sur surface claire. Le disque jaune plein, lui, se lit parfaitement : contrôle
visuel fait sur la cellule réelle du catalogue.

Part du plateau occupée, les quatorze logos après normalisation optique :

```
Pepsi              8,0 %      Mirinda           10,2 %
Lipton Ice Tea     8,2 %      7UP               11,2 %
Dr Pepper          8,3 %      Schweppes         12,8 %
Fanta              8,7 %      Red Bull          13,6 %
Orangina           8,9 %      Capri-Sun         13,9 %
                              Coca-Cola         15,1 %
                              Monster Energy    15,3 %
                              Mountain Dew      15,3 %
                              Sprite            15,3 %

écart min/max : 1,91×   (plafond du test : 4×)
```

Lipton s'insère dans le peloton sans traitement particulier — la normalisation
optique l'absorbe comme les autres.

---

## 5. QA

| Porte | Résultat |
| --- | --- |
| `npm run check` | 0 erreur · 0 avertissement |
| `npm run qa` | **EXIT 0** · 566/566 · 1 092 tests |
| `npm run qa:staging` | **EXIT 0** · 569/569 · 62 tests visuels |

Production : **28 visuels de marque non validés élagués, 0 publié.**

### Contrôles modifiés

- le catalogue rend **14** logos en préproduction (au lieu de 13) ;
- le contrôle « la marque sans logo garde son repli » est **inversé** : il exige
  désormais **zéro** repli dans les cellules du catalogue. Il est conservé
  plutôt que supprimé — c'est là qu'un repli réapparaîtrait si un logo était
  retiré, et c'est là qu'on veut le voir ;
- le contrôle d'équilibre optique porte sur **14** formes.

---

## 6. Blocages

| # | Blocage | État |
| --- | --- | --- |
| **B2** | Packshots officiels — 24 visuels générés, aucun droit confirmé | **ouvert** |
| **B11** | Droits sur les logos de marque — **14 logos, aucune autorisation écrite** | **ouvert** |
| B1 | Acheminement du formulaire | ouvert |
| B3 | Mentions légales | ouvert |
| B5 | Domaine e-mail — `info@ivan-arsenov.de` à confirmer | ouvert |

Le catalogue est désormais **complet visuellement** : 14 photos produit,
14 logos, zéro repli. Il ne reste plus de trou d'asset — il ne reste que des
**droits à confirmer**.
