# GUIDE DES ASSETS — IVAN ARSENOV

> Ce que nous devons obtenir, dans quel ordre, et sous quelle forme exacte.
> À transmettre tel quel au client ou à son photographe.
>
> État en temps réel : `doc/assets-registry.md` (généré par `npm run assets:report`).

---

## 1. Pourquoi c'est le poste le plus déterminant du projet

La direction artistique repose sur une règle : **l'interface est achromatique, la couleur
vient des produits**. Le cadre noir et sérif est délibérément silencieux pour que les
canettes portent toute l'énergie visuelle — environ **70 % de l'impact émotionnel du site**.

Le site est livrable et présentable sans un seul packshot : chaque produit bascule alors
sur un repli typographique composé, qui n'est pas un rectangle gris. **Mais avec de vrais
visuels, le site passe de très bon à exceptionnel.** C'est le meilleur euro à investir
après le développement.

---

## 2. Ordre de priorité

### Priorité 1 — les 6 produits du hero *(bloquant pour l'effet recherché)*

**Coca-Cola · Fanta · Red Bull · Monster Energy · Pepsi · Sprite**

Ces six fichiers sont traités à part dans le registre parce que **leur qualité conditionne
directement la direction artistique**. Ils sont affichés très grand, en trois plans de
profondeur, sur fond noir. Un packshot médiocre agrandi à 800 px de haut se voit
immédiatement et ruine l'effet premium.

Exigences renforcées, voir §3.

### Priorité 2 — l'identité Ivan Arsenov

Le logo nous a été montré mais **le fichier n'a pas été transmis**. Nous ne le redessinons
pas : un tracé approximatif présenté comme l'identité serait une contrefaçon de votre
propre marque. À fournir :

| Fichier | Contenu |
|---|---|
| `monogram.svg` | Monogramme **IA** seul, vectoriel |
| `lockup.svg` | Monogramme + wordmark IVAN ARSENOV + filet, vectoriel |
| `wordmark.svg` | Wordmark seul, vectoriel |

Vectoriel **obligatoire** (SVG, ou AI/EPS que nous convertirons). Une image matricielle du
logo est inutilisable : elle serait floue sur écran haute densité et impossible à décliner
en favicon.

### Priorité 3 — les 16 marques *featured*

7UP · Bundaberg · Capri-Sun · Coca-Cola · Dr Pepper · Evian · Fanta · Monster Energy ·
Mountain Dew · Orangina · Pepsi · Powerade · Red Bull · Schweppes · SPA · Sprite

Logo **et** packshot pour chacune.

### Priorité 4 — les 46 autres marques

Logo seulement. Les packshots viendront plus tard, marque par marque.

---

## 3. Spécifications techniques

### 3.1 Packshots produits

| | Standard *(featured)* | **Hero** *(les 6)* |
|---|---|---|
| **Dimensions minimales** | 1200 px sur le côté long | **2400 px sur le côté long** |
| **Fond** | Transparent obligatoire | Transparent obligatoire |
| **Format de livraison** | PNG 24 bits avec canal alpha | PNG 24 bits avec canal alpha |
| **Détourage** | Net, sans halo blanc résiduel | Net, **au pixel**, vérifié sur fond noir |
| **Angle** | Face, produit vertical, axe droit | Face, produit vertical, axe droit |
| **Éclairage** | Homogène, reflets maîtrisés | Studio, un reflet vertical net sur le flanc |
| **Ombre** | **Aucune ombre incluse** | **Aucune ombre incluse** |
| **Marge** | 2 % de vide autour du produit | 2 % de vide autour du produit |

**Points critiques, dans l'ordre d'importance :**

1. **Fond transparent, pas blanc.** Un packshot sur fond blanc posé sur notre fond noir
   affiche un rectangle blanc. C'est l'erreur la plus fréquente et la plus visible.
2. **Aucune ombre portée dans le fichier.** Le site génère sa propre ombre, serrée et
   directionnelle, cohérente sur l'ensemble du catalogue. Une ombre incluse s'y ajoute et
   produit un double halo.
3. **Vérifier le détourage sur fond noir avant de livrer.** Un liseré blanc invisible sur
   fond blanc devient un contour lumineux sur notre fond `#0A0A0B`.
4. **Axe droit.** Les produits sont alignés sur un filet de sol commun. Une canette
   penchée de 2° casse l'alignement de toute la rangée.
5. **Même distance de prise de vue** pour tous les produits d'une même famille : les
   échelles relatives doivent rester crédibles côte à côte.

### 3.2 Logos de marque

| | Exigence |
|---|---|
| **Format** | **SVG** de préférence. À défaut PNG transparent, 1000 px de large minimum |
| **Fond** | Transparent |
| **Couleurs** | Version officielle. **Ne pas** fournir une version recolorée ou monochrome improvisée |
| **Marges** | Zone de protection incluse dans le fichier si la charte de la marque l'impose |
| **Source** | Kit presse ou espace revendeur du fabricant, de préférence |

Les logos ne sont **jamais** déformés, recolorés ni rognés par le site. Le ratio d'origine
est respecté et la zone de protection assurée par la mise en page.

### 3.3 Ce qu'il ne faut surtout pas envoyer

- ❌ Captures d'écran de sites tiers, **y compris du benchmark Handelsplaza Venlo**
- ❌ Photos de produits trouvées via une recherche d'images
- ❌ JPEG (pas de transparence — inutilisable sur fond noir)
- ❌ Fichiers de moins de 800 px sur le côté long
- ❌ Images avec ombre, reflet de sol ou fond dégradé incrustés
- ❌ Photos de rayonnage ou de palette en guise de packshot
- ❌ Images générées par IA

---

## 4. Convention de nommage

Un dossier par marque, nommé d'après le slug du catalogue :

```
src/assets/brands/<slug>/
  logo.svg          logo officiel
  packshot.png      packshot principal
  packshot-alt.png  packshot secondaire (facultatif)
  hero.png          packshot haute résolution — les 6 du hero uniquement
```

Exemples de slugs : `coca-cola`, `red-bull`, `monster-energy`, `capri-sun`, `dr-pepper`,
`7up`, `a-and-w`, `guarana-antarctica`. La liste complète figure dans
`doc/assets-registry.md`.

Identité :

```
src/assets/identity/
  monogram.svg
  lockup.svg
  wordmark.svg
```

---

## 5. Informations à fournir avec chaque fichier

Sans ces trois informations, un fichier reste en `requires_validation` et **ne sera pas
publié en production** — il sera remplacé par le repli typographique.

| Information | Pourquoi |
|---|---|
| **D'où vient le fichier** | Kit presse du fabricant, espace revendeur, shooting propre, agence… Tracé dans le registre |
| **Droit d'usage** | Autorisation écrite, conditions du kit presse, ou usage référentiel assumé en tant que distributeur réel |
| **Restriction éventuelle** | Certaines chartes interdisent le fond sombre, imposent une marge, ou proscrivent le détourage |

Le registre exige une autorisation **positivement établie**. Un statut inconnu vaut refus :
c'est délibéré, et cela protège Ivan Arsenov.

**Attention particulière aux quatre marques sous licence tierce** — Chupa Chups, Mentos,
Squid Game, Toxic Waste. Leur sensibilité juridique est supérieure à celle d'une marque de
boisson classique, parce que la licence appartient à un tiers distinct du fabricant de la
boisson. Elles font l'objet d'un suivi séparé dans le registre.

---

## 6. Comment le site se comporte selon l'état d'un asset

| Statut | Staging | Production |
|---|---|---|
| `validated` | affiché | **affiché** |
| `requires_validation` | affiché | **repli typographique** |
| `missing` | repli typographique | **repli typographique** |

Le staging affiche tout ce qui existe, afin de juger le design complet avant validation
juridique. La production n'affiche que ce qui est validé, empreinté et autorisé.

**Une marque n'est jamais retirée du site faute de visuel.** Seul le visuel est remplacé ;
la marque reste au catalogue, reste filtrable, reste ajoutable à une demande d'offre.

Le registre conserve un **checksum SHA-256** par fichier : si un fichier est remplacé sans
que le registre soit mis à jour, l'audit échoue. C'est ce qui empêche un asset non validé
de se glisser en production sous le nom d'un asset validé.

---

## 7. Récapitulatif de la demande

À transmettre à Ivan :

> **Priorité absolue** — 6 packshots haute résolution : Coca-Cola, Fanta, Red Bull,
> Monster Energy, Pepsi, Sprite. PNG transparent, 2400 px minimum, sans ombre, détourage
> vérifié sur fond noir.
>
> **Puis** — le logo Ivan Arsenov en vectoriel : monogramme seul, lock-up complet, wordmark.
>
> **Puis** — logos et packshots des 16 marques mises en avant.
>
> **Enfin** — logos des 46 autres marques.
>
> Pour chaque fichier : d'où il vient, et à quel titre nous pouvons l'utiliser.
