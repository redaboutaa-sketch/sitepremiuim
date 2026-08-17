# TR-026B — Packshots S4 Discovery

**État : INTÉGRÉ en préproduction. S4 = 8/8.**
Base : `6b8f471`. Production à zéro packshot généré. Aucun déploiement.

---

## 1 · Pre-flight

| | |
|---|---|
| `git status --short` | **vide** |
| `git rev-parse HEAD` | `6b8f4717af9e00b8496572b40d24ec3318acef14` |
| `npm install` | 0 changement, 0 vulnérabilité |
| `astro check` | 0 erreur, 0 avertissement |
| `npm run qa` | **EXIT 0** — 565/565 |
| `npm run qa:staging` | **EXIT 0** — 565/565 |

---

## 2 · Audit pixel des masters

**Deux fichiers livrés**, portant chacun les six mêmes marques avec des
contenants différents. Aucune hypothèse n'a été tirée de l'aperçu : tout ci-
dessous est lu dans les pixels.

| | `a.png` (23_19_17) | `b.png` (23_19_16) |
|---|---|---|
| Dimensions | 1536 × 1024 | 1536 × 1024 |
| Alpha min / max | 0 / **254** | 0 / **254** |
| α = 0 | 28,1 % | 43,2 % |
| α partiel | 71,85 % | 56,84 % |
| α = 255 | **0,0 %** | **0,0 %** |
| Coins | tous α = 0 | tous α = 0 |
| Provenance C2PA | `gpt-image 2.0` · `trainedAlgorithmicMedia` | idem |

### Le pourcentage d'alpha partiel n'était pas ce qu'il semblait

71,85 % d'alpha partiel ressemble à la signature du voile global qui avait fait
rejeter la première planche de TR-025. L'histogramme dit autre chose :

```
a.png   α 0      28,15 %      ← le fond, réellement transparent
        α 1–63    5,06 %      ← bords antialiasés
        α 64–190  0,55 %
        α 191–250 4,92 %      ← verre et PET translucides
        α 251–253 61,32 %     ← les corps de produit
        α 254      0,01 %
```

Le maximum à 254 est un voile uniforme d'un à deux points — 99,2 % d'opacité,
sans effet perceptible — et il **n'empêche pas la séparation**. La coupe à
mi-hauteur le confirme, six blocs opaques séparés par du vide :

```
|.#########+.#########.+#########.##########.######### ##########|
```

Avec un seuil à α > 8, les deux planches se découpent en **six colonnes
franches**, sans chevauchement, sans halo, sans ombre portée, sans reflet,
sans fond peint.

### Choix de la planche — un critère mesurable

| | `a.png` hauteurs | `b.png` hauteurs |
|---|---|---|
| par produit | 722 · 724 · **980** · 924 · 849 · 722 | 652 · 562 · 594 · 609 · 614 · 829 |

**`a.png` retenue** : 15 à 30 % de définition en plus sur chaque produit, pour
un besoin S4 mesuré à 499 px CSS. Le catalogue n'établissant aucun type de
contenant pour ces six marques, le choix porte sur la **définition**, pas sur
une affirmation de conditionnement.

Verdict par produit : **EXTRACTABLE ×6**, aucun `REJECT`.

---

## 3 · Mapping

Les six marques attendues, chacune identifiée par son wordmark, **aucune
autre**. Ordre de la planche = ordre attendu.

### Les deux contraintes métier sont respectées

| Marque | Le catalogue impose | Le visuel montre | |
|---|---|---|---|
| **chupa-chups** | « Licensed drinks only — not the confectionery » | une **canette**, mention « SPARKLING DRINK » | ✅ |
| **mentos** | « Sodas and drinks only — not the sweets » | une **bouteille PET**, mention « DRINK » | ✅ |

Ni sucette, ni bonbon.

### Une mention à signaler

`chupa-chups` porte **« SPARKLING DRINK »** sur la canette. Le catalogue classe
cette marque en *International Finds*, pas en *Carbonated* : le visuel affirme
donc une carbonatation que la donnée n'établit pas. C'est mineur et lisible
seulement de près, mais c'est signalé plutôt que passé sous silence.

Aucune autre mention hors-donnée : aucun volume, aucune contenance, aucune
saveur, aucune variante. « Guaraná Antarctica » avec drapeau brésilien,
« SODA » dans « Yummy Miami Soda » et « DRINK » sur mentos font partie des
marques elles-mêmes.

---

## 4 · Extraction

Recadrage strict sur la boîte alpha. Aucun redimensionnement, aucun sharpen,
aucune reconstruction, aucune retouche de packaging.

| Marque | Dimensions | Ratio | Couverture | Marges G,D,H,B | Octets |
|---|---|---|---|---|---|
| chupa-chups | 237 × 722 | 0,3283 | 0,963 | 0,0,0,0 | 521 394 |
| guarana-antarctica | 245 × 724 | 0,3384 | 0,960 | 0,0,0,0 | 520 885 |
| hawai | 242 × 980 | 0,2469 | 0,841 | 0,0,0,0 | 642 883 |
| fernandes | 241 × 924 | 0,2608 | 0,815 | 0,0,0,0 | 654 586 |
| mentos | 240 × 849 | 0,2827 | 0,859 | 0,0,0,0 | 575 180 |
| yummy-miami-soda | 239 × 722 | 0,3310 | 0,964 | 0,0,0,0 | 547 104 |

Les couvertures basses (hawai 0,841, fernandes 0,815) correspondent à des cols
de bouteille, pas à une ombre : une ombre incrustée laisserait une auréole sous
le produit, absente ici.

### Translucence (§10) — contrôle sur trois fonds

Trois contenants translucides — Hawai (PET), Fernandes (verre), mentos (PET).
Vérifiés sur `#0A0A0B`, sur papier `#F2F0EC` et sur damier serré :

- **aucun halo clair**, aucune frange colorée, aucun rectangle résiduel ;
- **aucune contamination** : le fond de la page se lit à travers les cols, ce
  qui est le comportement d'un vrai contenant translucide ;
- aucune couleur de fond ancienne piégée dans le verre ou le PET.

Planches : `qa/review/s4-nouveaux-sur-ink.png`, `…-sur-papier.png`,
`…-damier.png`.

---

## 5 · Résolution

Besoin S4 mesuré en TR-026 et **reconfirmé** ici : la grille passe à une
colonne sous 640 px et le plateau y est le plus grand — **499 px CSS au
maximum, à 430 px de fenêtre**.

| Marque | Hauteur | / DPR 1 (499) | / DPR 2 (998) | / DPR 3 (1497) | Verdict |
|---|---|---|---|---|---|
| hawai | 980 | **196 %** | 98 % | 65 % | `PASS_WITH_RESOLUTION_WARNING` |
| fernandes | 924 | 185 % | 93 % | 62 % | `PASS_WITH_RESOLUTION_WARNING` |
| mentos | 849 | 170 % | 85 % | 57 % | `PASS_WITH_RESOLUTION_WARNING` |
| guarana-antarctica | 724 | 145 % | 73 % | 48 % | `PASS_WITH_RESOLUTION_WARNING` |
| chupa-chups | 722 | 145 % | 72 % | 48 % | `PASS_WITH_RESOLUTION_WARNING` |
| yummy-miami-soda | 722 | 145 % | 72 % | 48 % | `PASS_WITH_RESOLUTION_WARNING` |
| **bundaberg** *(réemploi)* | 464 | 93 % | 46 % | 31 % | `PASS_WITH_RESOLUTION_WARNING` |
| **mountain-dew** *(réemploi)* | 401 | 80 % | 40 % | 27 % | `PASS_WITH_RESOLUTION_WARNING` |

Aucun `REJECT`, aucun agrandissement. Les six nouveaux couvrent DPR 1 très
largement et DPR 2 de 72 à 98 %. Les deux réemployés restent les moins définis
du lot — c'est visible sur la planche F, où ils sont légèrement plus doux — et
c'est le prix assumé du non-doublon.

---

## 6 · Gouvernance

Les six entrées portent, sans exception :

```
sourceType:    'generated'
status:        'requires_validation'
authorization: { status: 'unknown', evidence: null }
```

Aucune n'est qualifiée d'officielle, de fournie par le titulaire, de fichier
presse ni de droits validés. **Aucune ne ferme B2.**

---

## 7 · Registre — la lacune de TR-026 est corrigée

`usagesFor()` n'accordait un usage `packshot` qu'aux marques **`featured`**.
Les six marques S4 non mises en avant n'avaient donc **aucune entrée**, pas même
en `missing` : le registre, qui sert aussi de liste de courses, ne réclamait pas
ces fichiers.

Corrigé à la source :

- `DISCOVERY_BRANDS` déclaré dans `src/data/assets.ts`, **à côté de
  `HERO_BRANDS`** — même précédent, même raison ;
- `Discovery.astro` lit cette liste au lieu de porter sa propre copie : une
  séquence, une source ;
- `usagesFor()` accorde un `packshot` à toute marque `featured` **ou** membre
  de la séquence S4.

Le test correspondant n'affirme plus un nombre figé (« 16 packshots ») mais la
**liste des marques attendues** : un compte en dur ne dit pas *lesquelles*
doivent être couvertes, et c'est exactement ce qui avait laissé six produits
hors du registre.

---

## 8 · Réutilisation Mountain Dew et Bundaberg

**Un seul master par produit**, vérifié :

| Marque | Fichier unique | Utilisé par |
|---|---|---|
| mountain-dew | `src/assets/brands/mountain-dew/packshot.png` | Featured **et** S4 |
| bundaberg | `src/assets/brands/bundaberg/packshot.png` | Featured **et** S4 |

Aucun `discovery/*.png`, aucun second master, aucune copie physique. Un test
compare le **hachage de source** des dérivés servis dans les deux surfaces :
les fichiers servis diffèrent — S4 affiche plus grand — mais ils descendent du
même master. C'est le contrat correct : un master, plusieurs dérivés.

---

## 9 · Matrice des surfaces

| Surface | Usage demandé | Avant | Après | |
|---|---|---|---|---|
| Hero THE STAGE | `hero` | 6 objets, 0 repli | 6 objets, 0 repli | **inchangé** |
| Featured | `packshot` + repli `hero` | 16 objets, 0 repli | 16 objets, 0 repli | **inchangé** |
| **S4 Discovery** | `packshot` | 2 objets, 6 replis | **8 objets, 0 repli** | **changement attendu** |
| Final CTA | `hero` | 1 objet | 1 objet | **inchangé** |
| `/drinks/` | `logo` | 60 logos · 0 packshot · 2 replis | **60 · 0 · 2** | **inchangé** |
| `/brands/` | — | 3 images (identité) | 3 images | **inchangé** |
| Header · Footer | identité | monogramme officiel | idem | **inchangé** |

L'effet de bord de TR-025 sur `/drinks/` **ne s'est pas reproduit** : le
catalogue demande `usage="logo"` explicitement depuis ce TR, et les six
nouveaux packshots ne l'atteignent pas. Aucune donnée de catalogue n'a été
modifiée pour faire passer un test.

---

## 10 · Normalisation optique

Aucune valeur par marque, aucune classe `.product--foo`. La règle est celle
déjà en place : `block-size: 100%` sur l'image, `inline-size: auto`,
`object-fit: contain`. Tous les plateaux S4 partagent un même ratio, donc
**hauteurs égales, largeurs libres**.

Mesuré à 1440 px :

| Marque | Rendu | Aire |
|---|---|---|
| hawai | 97 × 391 | 37 927 |
| fernandes | 102 × 391 | 39 882 |
| mentos | 111 × 391 | 43 401 |
| chupa-chups | 128 × 391 | 50 048 |
| yummy-miami-soda | 129 × 391 | 50 439 |
| guarana-antarctica | 132 × 391 | 51 612 |
| bundaberg | 174 × 391 | 68 034 |
| mountain-dew | 193 × 391 | 75 463 |

**Écart d'aire : 1,99 ×**, stable de 320 à 1920 px. Il vaut exactement
`max(ratio)/min(ratio)` = 0,4938 / 0,2469 : une canette trapue **est** deux
fois plus large qu'une bouteille élancée de même hauteur. L'égaliser reviendrait
à nier la forme des contenants — ce que le §9 interdit.

Le classement par ratio appliqué à Featured n'est **pas** repris ici, et c'est
délibéré : là-bas les objets se touchent sur un sol commun et la hauteur de
plateau varie déjà, ce qui donne prise à la correction. Ici chaque spécimen
occupe sa propre cellule, avec son filet et sa légende, et tous les plateaux
partagent un ratio unique — ni juxtaposition, ni levier. Un test borne la
dérive à 2,1 × : il surveille l'arrivée d'un master aux proportions extrêmes,
pas la diversité.

---

## 11 · Responsive — neuf largeurs

| Largeur | Débordement | Produit hors plateau | Libellé coupé | Écart d'aire |
|---|---|---|---|---|
| 320 · 390 · 430 | 0 | 0 | non | 2,00 · 2,01 · 2,00 × |
| 768 · 1024 · 1280 | 0 | 0 | non | 2,00 · 1,98 · 2,00 × |
| 1440 · 1728 · 1920 | 0 | 0 | non | 1,99 · 1,99 · 1,99 × |

Aucune déformation : le ratio rendu suit le ratio intrinsèque à moins de 0,02
près sur les huit. `object-fit: contain` vérifié. Dimensions `width`/`height`
présentes sur les huit → aucun décalage de mise en page. L'ordre DOM, le CTA et
le comportement de défilement sont intacts.

---

## 12 · Performance

| Contexte | Avant S4 | S4 | Total page | Plus gros fichier |
|---|---|---|---|---|
| 390 @1x | 421 Ko / 16 | **404 Ko / 8** | 825 Ko | hero coca-cola 62 Ko |
| 430 @3x | 606 Ko / 17 | **490 Ko / 8** | 1 096 Ko | hero pepsi 113 Ko |
| 1440 @1x | 480 Ko / 18 | **490 Ko / 8** | 1 188 Ko | packshot 77 Ko |
| 1440 @2x | 742 Ko / 18 | **490 Ko / 8** | 1 436 Ko | hero coca-cola 118 Ko |
| 1920 @1x | 518 Ko / 19 | **490 Ko / 8** | 1 188 Ko | packshot 77 Ko |

Les huit visuels S4 sont en `loading="lazy"` — vérifié par test, pas supposé —
et n'entrent donc pas dans le premier rendu. Aucun `preload`, aucun dérivé
au-delà de la source : Astro plafonne à la largeur du master. La stratégie de
performance du site n'a pas été modifiée.

**Ces chiffres ne concernent que la préproduction.** La production ne publie
aucun de ces fichiers.

---

## 13 · Accessibilité

Les huit visuels sont **décoratifs** : `alt=""`. Le nom de la marque et sa
famille sont déjà portés en texte immédiatement sous chaque spécimen, dans le
même lien — l'image n'ajoute aucune information au contenu accessible.

Aucune image n'est annoncée comme officielle, ni comme photographie de produit.
`ProductObject` vide l'`alt` dès que `sourceType === 'generated'` : un visuel
fabriqué n'atteste rien, et ne doit rien affirmer auprès des seuls utilisateurs
qui ne peuvent pas le juger par eux-mêmes.

---

## 14 · QA

| Gate | Résultat |
|---|---|
| `astro check` | 0 erreur, 0 avertissement |
| `npm run qa` | **EXIT 0** — 566/566 · 826 + 241 tests |
| `npm run qa:staging` | **EXIT 0** — 568/568 · 80 tests |

**PRODUCTION**

```
PRODUCTION_GENERATED_PACKSHOTS = 0
0 requires_validation rendu · 0 déposé dans dist/ · 0 référence morte
```

Trois contrôles ajoutés, aucun assoupli :
- production : aucun packshot Featured **ni S4** rendu ;
- production : aucune marque S4 ou hero ne rend de packshot — contrôle **par
  slug**, en plus du contrôle par usage, pour qu'un emplacement qui perdrait ses
  attributs d'audit ne passe pas inaperçu ;
- préproduction : les huit spécimens servis, dans l'ordre exact de la séquence,
  sans repli ni logo.

**STAGING**

```
S4_STAGING_PACKSHOTS = 8
  6 nouveaux assets générés
  2 masters réemployés (mountain-dew, bundaberg)
  0 doublon · 0 surface non voulue

FEATURED_COUNT = 16 · FEATURED_FALLBACKS = 0
```

---

## 15 · Captures

`qa/screenshots/discovery/` :
`plate-A-desktop-1920` · `plate-B-desktop-1440` · `plate-C-tablet-768` ·
`plate-D-mobile-430` · `plate-E-mobile-390` · `planche-F-8-produits-papier` ·
`viewport-{320,390,430,768,1024,1280,1440,1728,1920}` · `geometry.json` ·
`weight-*.json`

`qa/review/` : `s4-plate-a-damier` · `s4-plate-b-damier` ·
`s4-nouveaux-sur-ink` · `s4-nouveaux-sur-papier` · `s4-nouveaux-damier`

---

## 16 · Anomalies relevées

1. **`chupa-chups` affiche « SPARKLING DRINK »** alors que le catalogue le
   classe en *International Finds* et non en *Carbonated* (§3).
2. **Deux planches livrées** pour les mêmes six marques, avec des contenants
   différents. Le catalogue n'en établissant aucun, la seconde n'a pas été
   utilisée ; le choix repose sur la définition, et il est réversible.
3. **Les deux masters réemployés sont les moins définis du lot** — 401 et
   464 px contre 722 à 980. Visible de près sur la planche F.

---

## 17 · Blocages ouverts

- **B2 — packshots officiels.** Ouvert pour les vingt-deux visuels produits du
  site. Aucun fichier presse, aucune autorisation.
- **B11 — droits des logos de marque.** Inchangé.
- **Résolution.** Aucun asset n'atteint DPR 3 en S4 ; Mountain Dew n'atteint
  pas DPR 1 à 430 px. Suffisant pour juger, insuffisant pour publier.
