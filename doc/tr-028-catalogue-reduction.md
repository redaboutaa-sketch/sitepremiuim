# TR-028 — RÉDUCTION DU CATALOGUE À 14 ARTICLES

**Date** : 2026-08-24
**Demandeur** : propriétaire du site (via l'intégrateur)
**Portée** : catalogue, familles, page d'accueil, assets, QA
**Cible** : préproduction. **Aucun déploiement production.**

---

## 0. Sauvegarde — à lire avant toute restauration

L'état antérieur est conservé **intégralement** et reste restaurable.

| Élément | Valeur |
| --- | --- |
| Branche de sauvegarde | `backup/catalogue-62-brands-full` |
| Commit | `5966e32fcf670fc3d4ad5020bc7f5684cce587c8` |
| Poussée sur `origin` | ✅ oui |
| Tag local | `backup/catalogue-62-brands` (non poussé — voir ci-dessous) |

Le tag annoté a été créé localement mais **son push a été refusé par le
serveur (HTTP 403)** : le jeton de cette session n'autorise pas la création de
tags. La branche, elle, est bien sur `origin` et porte exactement le même
commit — la sauvegarde est donc effective. Si un tag est souhaité, il doit être
créé depuis un poste disposant des droits :

```
git fetch origin backup/catalogue-62-brands-full
git tag -a backup/catalogue-62-brands 5966e32 -m "Catalogue 62 marques"
git push origin refs/tags/backup/catalogue-62-brands
```

Contenu de la sauvegarde : 62 marques, 5 familles, 16 marques mises en avant,
8 spécimens S4 Discovery, 22 packshots générés, 60 logos de marque, QA à
566/566 (production) et 568/568 (préproduction).

**Pour restaurer une marque retirée**, il faut ramener ensemble : son entrée
dans `src/data/brands.ts`, son dossier `src/assets/brands/<slug>/`, et ses
entrées `ASSET_OVERRIDES` dans `src/data/assets.ts`. Les trois sont
indissociables — le build échoue si un asset est référencé sans être validé.

---

## 1. La demande

> « le client (propriétaire du site) ne veut que cette liste d'article dans son
> site : Coca-Cola – Fanta – Sprite – Pepsi – 7UP – Schweppes – Red Bull –
> Monster – Dr Pepper – Mirinda – Mountain Dew – Lipton Ice Tea – Capri-Sun –
> Orangina. […] Il demande également que les photos des boissons soient tous à
> la même taille »

Deux demandes distinctes, traitées en §2 et §4.

---

## 2. Ce qui a été retiré

**49 des 62 marques** ont été supprimées. Treize des quatorze demandées
existaient déjà ; la quatorzième, Lipton Ice Tea, a dû être créée (§3).

Retirées :

| Famille | Marques retirées |
| --- | --- |
| Carbonated (26 → 10) | A&W, Big Red, Bundaberg, Canada Dry, Dr Foots, Fernandes, Guaraná Antarctica, Krombacher Spezi, Oasis, Pariba, Poms, Rivella, Royal Club, Sisi, Sunkist, Yummy Miami Soda |
| Energy · Sport (11 → 2) | 28 Black, AA Drink, Aquarius, Bomba, Freego, O2Life, Powerade, Slammers Energy, Vitamin Well |
| Water (8 → 0) | Bar-le-Duc, Chaudfontaine, Evian, Feel So Good, Kızılay, LaCroix, Sourcy, SPA |
| Juice · Fruit (13 → 1) | Tropical Aloe Vera, Charlie's, Coco Rico, DubbelFrisss, Grace, Hawai, Hawaiian Punch, Hero, Maaza, OKF, Rauch, Taksi |
| International (4 → 0) | Chupa Chups, Mentos, Squid Game, Toxic Waste |

Les entrées ont été **supprimées, pas commentées** : une entrée commentée finit
par être décommentée par erreur, et la sauvegarde couvre déjà le besoin.

### 2.1 Conséquences structurelles subies, non choisies

Trois effets découlent mécaniquement de la liste des 14. Ils ne sont pas des
décisions de design.

- **Deux familles se sont vidées.** `water` (0 marque) et `international`
  (0 marque) ont été retirées de `CATEGORY_SLUGS`. Une famille sans marque
  produit un filtre qui ne filtre rien et une section qui ne montre rien.
  Le marqueur **transversal** `internationalFind` survit à la disparition de
  la famille du même nom — il qualifie une variante, pas un rangement, et
  reste porté par Dr Pepper, Fanta, Mountain Dew et Pepsi.

- **S4 « Discovery » a été supprimée.** Sept de ses huit spécimens ont quitté
  le catalogue ; seul Mountain Dew restait, déjà présent en Featured. La
  section, son composant, son spec visuel et ses libellés EN/DE ont été
  retirés. `DISCOVERY_BRANDS` reste **déclarée et vide** plutôt que supprimée :
  TR-026 avait montré qu'une liste absente rend des assets manquants
  invisibles à la QA.

- **« Featured » ne sélectionne plus rien.** À 14 articles, mettre « 12 des
  14 » en avant cacherait deux références sans qu'aucune règle ne le
  justifie. Les 14 sont donc `featured: true`, et la piste d'accueil expose le
  catalogue entier.

---

## 3. Lipton Ice Tea — levée d'exclusion

**Lipton était explicitement interdite par le dépôt.**

- `src/data/exclusions.ts` la portait en « **Thé — hors périmètre absolu** » ;
- le **contrôle bloquant n° 1** du schéma Zod rejette toute entrée publiable
  portant un slug de la liste d'exclusions ;
- la décision **D5** (2026-08-14) avait exclu Arizona précisément comme
  « marque trop fortement associée aux iced teas, **non réintégrable en V1** ».

La réintégration a été **explicitement arbitrée par le propriétaire du site**.
Elle a été appliquée de la façon la plus étroite possible :

1. **Levée nominative.** Seule `lipton` quitte la liste d'exclusions. Dilmah,
   Nescafé, Fuze Tea et Arizona y restent.
2. **Le périmètre est déplacé, pas supprimé.** L'entrée est
   `skuPolicy: 'brand-level-only'` avec une `scopeNote` publiée en EN et DE :
   *« Ready-to-drink iced teas only — not the tea range. »* C'est le mécanisme
   déjà utilisé par Krombacher Spezi pour la bière et par Hero pour les
   confitures. Sans elle, la levée aurait ouvert la marque entière.
3. **Nouvelle famille `iced-tea`.** Aucune des familles restantes ne décrit un
   thé glacé. Ranger Lipton dans `juice-fruit` (« Fruit drinks, juices and
   tropical flavours ») aurait **publié une classification fausse**.

### 3.1 La revendication « soft drinks » n'a pas été affaiblie

Un thé glacé prêt à boire est un *soft drink* au sens du négoce de boissons ;
l'exclusion d'origine visait le thé en tant que catégorie chaude / en sachet
(Dilmah, Nescafé). `familiesValue` passe donc de « Five, soft drinks only » à
« **Four**, soft drinks only » — le nombre change, la revendication non.

### 3.2 ⚠️ Lipton Ice Tea n'a **aucun fichier**

Ni photo, ni logo. La marque étant exclue jusqu'ici, aucun visuel n'a jamais
été livré par le client. Elle s'affiche donc avec le **repli typographique**.

**Aucun logo ne sera dessiné ni généré pour combler ce vide.** Il se ferme par
une livraison du client (blocage B2). Un contrôle QA bloquant vérifie
explicitement que Lipton reste sur le repli typographique : si elle passait au
logo sans livraison, c'est qu'un logo aurait été fabriqué.

---

## 4. « Les photos toutes à la même taille »

### 4.1 Ce qui a changé

La piste Featured utilisait **quatre hauteurs de plateau**, attribuées par
ratio (TR-025 §9). L'ondulation de la ligne de tête était une conséquence
assumée des proportions réelles des produits — et l'effet direct était que deux
boissons voisines ne s'affichaient **pas à la même taille**. C'est ce que le
client a vu.

Un **plateau unique** est désormais posé : `3 / 4` pour les quatorze. C'est le
plus haut des quatre ; un plateau plus court aurait rapetissé les produits les
plus élancés (Coca-Cola sort à 443 × 1517, ratio 0,29) sans rien gagner
ailleurs.

Le catalogue `/drinks/` et le CTA final utilisaient déjà ce même `3 / 4` par
défaut. **Toutes les grilles produit du site partagent donc maintenant un seul
et même plateau**, et chaque produit occupe 100 % de sa hauteur utile
(`block-size: 100%`, acquis en TR-025).

### 4.2 Ce qui reste variable — et pourquoi il le faut

La **largeur rendue** de chaque produit continue de suivre son ratio réel. Une
canette Red Bull est plus étroite qu'une poche Capri-Sun.
`object-fit: contain` les met à la même hauteur dans le même plateau **sans
jamais les déformer**. Forcer aussi la largeur reviendrait à étirer les
produits — interdit, et immédiatement visible sur une canette.

Autrement dit : **même emplacement, même hauteur, aucune déformation**. C'est
la seule lecture de « à la même taille » qui n'abîme pas les produits.

### 4.3 Le hero est resté inchangé

Arbitrage du propriétaire : l'uniformisation porte sur les **grilles**. La
scène d'accueil garde sa composition en profondeur sur trois plans à six
échelles, validée en TR-006 puis TR-024C.

### 4.4 Effet de bord assumé : Mirinda

Mirinda a un logo officiel mais **pas de photo produit**. Sur décision du
propriétaire, elle s'affiche avec son logo, **dans un plateau de même taille
que les autres**, plutôt que de laisser un trou dans une piste de quatorze.

Le logo n'est pas rendu comme une photo : il garde sa normalisation optique,
n'a pas d'ombre portée et n'a pas de filet de sol — un logo est une marque
plate, pas un objet posé. Le registre continue de le distinguer (`isLogo`).

Ceci déroge à la **décision DA du 2026-08-16**, qui réservait le repli logo au
catalogue sur surface claire, au motif que 23 des 60 logos livrés tombaient
sous le seuil de lisibilité sur encre. La dérogation est étroite et vérifiée :
le registre note Mirinda « peu lisible sur **papier** (27 %) » — la piste
Featured est sur **encre**, surface pour laquelle il n'est pas signalé.

---

## 5. Signal de la famille `iced-tea`

Les teintes `water` (205°) et `international` (337°) ont été retirées avec
leurs familles. Une teinte a été calculée pour `iced-tea`, sous les mêmes
contraintes que les signaux existants — **vert feuille, 105°**, le plus grand
intervalle libre du cercle (le voisin le plus proche, `energy` à 175°, est à
70°).

| Token | Valeur | Contraste mesuré | Seuil | Bande des existants |
| --- | --- | --- | --- | --- |
| `--signal-tea` | `#4aae29` | 6,95:1 / ink-900 | ≥ 3 (graphique) | — |
| `--signal-tea-text` | `#69d345` | 10,37:1 / ink-900 | ≥ 4,5 | 7,21 – 11,95:1 |
| `--signal-tea-on-paper` | `#31741b` | 4,58:1 / paper-alt | ≥ 4,5 | 4,61 – 4,68:1 |

Mesures reproductibles par `npm run qa:contrast`, qui contrôle désormais ces
trois valeurs comme les autres.

---

## 6. Résultats QA

| Suite | Résultat |
| --- | --- |
| `npm run check` | 0 erreur · 0 avertissement |
| `npm run qa:artifact` (production) | **566/566** · 0 bloquant · 0 avertissement |
| `qa-artifact` (préproduction) | **569/569** · 0 bloquant · 0 avertissement |
| `npm run qa:contrast` | inclut les trois nouveaux tokens |

Production : **0 packshot généré publié**, comme depuis TR-024B. Le build a
retiré 25 visuels de marque non validés.

### 6.1 Contrôles ajoutés

- S4 Discovery est **absente** de la page d'accueil (contrôle inversé, conservé
  pour détecter un retour accidentel) ;
- la piste Featured rend les **quatorze** articles, **dans l'ordre** ;
- **douze** des quatorze portent une photo produit ;
- **seuls** Mirinda et Lipton Ice Tea en sont dépourvus — la liste étant
  fermée, un troisième trou est une régression, pas une tolérance ;
- Mirinda tombe sur son **logo**, Lipton Ice Tea sur le **repli
  typographique**.

Le contrôle de la piste s'appuie désormais sur le marqueur de **cellule** et
non sur les attributs d'audit : `ProductObject` n'émet `data-object` que sur le
hero et sur les assets générés, si bien que compter les `data-object` ne voyait
que douze cellules sur quatorze.

---

## 7. Blocages — état inchangé

La réduction n'en ferme aucun et n'en ouvre aucun de nouveau.

| # | Blocage | État |
| --- | --- | --- |
| B2 | Packshots officiels — 12 visuels générés, droits non confirmés ; **+ Mirinda et Lipton Ice Tea sans photo** | ouvert |
| B11 | Droits sur les logos de marque (13 restants) | ouvert |
| B1 | Acheminement du formulaire | ouvert |
| B3 | Mentions légales | ouvert |
| B5 | Domaine e-mail — `info@ivan-arsenov.de` à confirmer | ouvert |

`TR027_FINDING_001` (collision du libellé allemand « Kohlensäurehaltig » en
Featured, 320–768 px) **reste ouvert et non corrigé** — hors périmètre de ce TR.
