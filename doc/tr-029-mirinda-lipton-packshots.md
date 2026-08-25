# TR-029 — PACKSHOTS MIRINDA ET LIPTON ICE TEA · LOGO LIPTON REFUSÉ

**Date** : 2026-08-25
**Livraison** : `ChatGPT_Image_25_ao_t_2026_10_34_39.zip` — une planche PNG,
1536 × 1024, 1 738 789 octets,
SHA-256 `1c5f621cf08a8455e190256a2356ba7cea407e6310c1786fe87ea1ad3b111f65`
**Cible** : préproduction. **Aucun déploiement production.**

---

## 1. Ce qui a été demandé, ce qui a été livré

Demande : « les packshots **officiels** Mirinda et Lipton Ice Tea, plus un logo
pour Lipton » — les trois trous laissés ouverts par TR-028.

La planche contient bien trois éléments : une canette Mirinda Orange, une
bouteille Lipton Lemon Ice Tea, et un logo Lipton.

**Deux sont intégrés. Le troisième est refusé.**

---

## 2. Provenance — le fichier contredit la déclaration

Les fichiers sont annoncés « officiels ». Le manifeste **C2PA signé** embarqué
dans le PNG (chunk `caBX`, 21 824 octets) dit autre chose :

| Champ C2PA | Valeur lue dans le fichier |
| --- | --- |
| action | `c2pa.created` |
| `softwareAgent` | **`gpt-image`**, version **`2.0`** |
| `digitalSourceType` | **`trainedAlgorithmicMedia`** |
| `claim_generator_info` | `OpenAI Media Service API` |
| autres actions | `c2pa.converted`, `c2pa.watermarked.unbound` |
| `when` | `2026-08-25T00:00:00Z` |

C'est la même situation qu'en TR-024D, et elle se tranche de la même façon :
**c'est le fichier qui fait foi, pas la déclaration qui l'accompagne.** Les
deux packshots sont donc enregistrés `sourceType: 'generated'`, avec
`authorization: { status: 'unknown' }`, et ne sont marqués nulle part comme
officiels, presse, fournis par le titulaire ou validés.

**Conséquence directe : le blocage B2 reste OUVERT.** Ces fichiers habillent la
préproduction ; ils ne donnent aucun droit. La production continue de publier
**zéro packshot généré**.

---

## 3. Extraction — mesurée avant d'être décidée

La planche **n'a aucun canal alpha** (3 canaux). Son fond en damier de
transparence est **peint** : deux tons proches (244 et 254, soit 10 niveaux
d'écart) et de période irrégulière — les transitions relevées sur une ligne
tombent à x = 1, 4, 9, 13, 14, 17, 19, 21, 22, 32… là où un vrai damier alpha
bascule à pas fixe.

Quatre mesures ont conditionné l'acceptation.

### 3.1 Le détourage ne perce aucun produit

Une diffusion depuis les bords sépare fond et produits. Testée à **cinq
seuils** (235, 240, 244, 248, 252), avec des sondes plantées au cœur des plages
blanches : bandeau blanc de Mirinda, texte « LEMON ICE TEA », lettres blanches
du logo, cercle jaune.

**Aucune fuite, à aucun seuil.** Ces plages sont enfermées par des contours plus
sombres, le détourage ne les atteint pas. C'était la condition bloquante : une
fuite aurait percé des trous dans les produits, et les refermer aurait été une
reconstruction — donc un rejet.

### 3.2 Aucun halo cuit

Luminance moyenne du fond, par distance à l'objet :

| Objet | 1–8 px | 9–20 px | 21–40 px | 60–110 px |
| --- | --- | --- | --- | --- |
| Mirinda | 248,3 | 248,5 | 248,6 | 248,5 |
| Lipton | 248,0 | 248,5 | 248,4 | 248,5 |

Moins d'un niveau d'écart entre le contact et le champ lointain : **il n'y a pas
de lueur**. Un halo aurait laissé un liseré clair sur encre.

### 3.3 Une ombre portée cuite — retirée par soustraction seule

Les deux objets portaient une ombre grise débordant latéralement de leur base.
Invisible sur fond blanc, franchement sale sur l'encre du site.

Elle est **séparable par la saturation**, avec une marge large :

| Zone | saturation moyenne | luminance moyenne |
| --- | --- | --- |
| Mirinda — ombre | **0,026** / **0,012** | 153 |
| Mirinda — base | **0,949** | 103 |
| Lipton — ombre | **0,119** | 194 |
| Lipton — pieds PET | **0,911** | 64 |

Retrait par **soustraction seule** : diffusion depuis l'extérieur du bas de la
vignette, sur les seuls pixels à la fois désaturés (< 0,18) et clairs (> 135).
1 825 px retirés sur Mirinda, 3 256 sur Lipton.

Contrainte volontaire : la diffusion part de l'**extérieur**. Un pixel gris
enfermé dans le produit n'est pas de l'ombre, et le percer ferait un trou.

Bases contrôlées à l'œil sur encre après retrait : **jonc métallique de la
canette et pieds PET de la bouteille intacts.**

### 3.4 Un bug d'extraction, attrapé au contrôle visuel

Ma première passe appliquait le dégradé d'alpha en testant la luminance de
**chaque** pixel. Résultat : les plages blanches *intérieures* — bandeau
Mirinda, texte « LEMON », lettres du logo — devenaient transparentes et
laissaient passer l'encre. Sur fond blanc, invisible ; sur encre, béant.

Corrigé : le dégradé ne s'applique qu'au **liseré anticrénelé**, c'est-à-dire
aux seuls pixels d'objet qui touchent le fond. Liseré final : 983 px sur
Mirinda, 925 px sur Lipton.

C'est le contrôle sur la surface RÉELLE qui l'a vu, pas la mesure.

### 3.5 Fichiers produits

| | Mirinda | Lipton Ice Tea |
| --- | --- | --- |
| dimensions | 359 × 717 | 303 × 969 |
| ratio | 0,501 | 0,313 |
| couverture alpha | 96,4 % | 84,5 % |
| octets | 687 708 | 774 345 |
| SHA-256 | `3f6d68bd…3d863ff` | `6f865f1f…9bc4dd3` |
| couverture DPR 2 / DPR 3 | 100 % / 100 % | 100 % / 100 % |

**Aucun pixel de produit n'a été reconstruit, repeint, interpolé ni
redimensionné.**

---

## 4. ⛔ Le logo Lipton est REFUSÉ

> ✅ **SUITE — 2026-08-25, plus tard le même jour.** Une SECONDE livraison
> (`logo.zip`) a apporté un **SVG vectoriel pur**, d'une tout autre nature que
> le logo généré refusé ci-dessous. Elle a été auditée et **acceptée** :
> voir `doc/tr-030-logo-lipton.md`. Le refus documenté ici porte sur la
> première livraison uniquement, et reste la raison pour laquelle une seconde
> a été demandée.

Le troisième élément de la planche est un logo Lipton — cercle jaune, bandeau
rouge, lettrage blanc.

**Il n'est pas intégré, et il ne le sera pas sous cette forme.**

La règle en vigueur depuis TR-004 est sans exception :

> « Ne crée ni ne redessine aucun logo pour combler l'absence. »

Le manifeste C2PA de ce fichier dit `gpt-image 2.0` /
`trainedAlgorithmicMedia`. Ce logo n'est donc pas le fichier du titulaire : c'est
**une marque figurative redessinée par un modèle**. Un packshot généré est un
visuel d'habillage qu'on isole en préproduction et qu'on jette en production ;
une identité de marque approximée est autre chose — c'est l'élément le plus
sensible juridiquement du catalogue, et le seul dont la ressemblance
*approximative* est en elle-même le problème.

L'écart n'est pas théorique : le lettrage, la géométrie du cercle et la forme du
bandeau d'un logo généré ne coïncident pas au pixel avec la charte du titulaire,
et rien dans le fichier ne permet de le vérifier.

**Ce que ça change concrètement** : Lipton Ice Tea a désormais une photo produit
(piste Featured, page d'accueil) mais **toujours aucun logo**. Elle rend donc le
repli typographique au catalogue `/drinks/`, aux côtés des 13 autres marques qui
affichent le leur.

**Ce qui débloquerait la situation** : le fichier officiel, demandé au titulaire
ou récupéré depuis son kit presse / sa brand guideline. Rien d'autre.

Un contrôle garde ce refus : `tests/logos.spec.ts` exige **exactement 13** logos
au catalogue. Le compte passerait à 14 le jour où quelqu'un intégrerait quand
même celui-ci.

---

## 5. Effet de bord bienvenu — une dérogation qui tombe

TR-028 avait assoupli d'exactement un la **décision DA du 2026-08-16** (« un
logo n'a droit qu'au catalogue, sur surface claire ») : Mirinda, qui n'avait
qu'un logo, occupait un plateau de la piste Featured pour ne pas y laisser un
trou.

Mirinda a maintenant un packshot. **Le motif a disparu, la dérogation a été
retirée** — `allowLogo` est parti de `FeaturedBrands.astro`, et la décision DA
s'applique de nouveau sans exception. Une exception qu'on laisse traîner après
la disparition de son motif finit par passer pour la règle.

---

## 6. Résultat mesuré sur la piste

À 1440 × 900, préproduction :

```
MARQUE            PLATEAU     IMAGE RENDUE
Coca-Cola         216×288     70×240
Red Bull          216×288     86×240
Fanta             216×288     73×240
Capri-Sun         216×288     150×240
Pepsi             216×288     120×240
Monster Energy    216×288     92×240
Orangina          216×288     115×240
Lipton Ice Tea    216×288     75×240      ← nouveau
Sprite            216×288     109×240
Mirinda           216×288     120×240     ← nouveau
Dr Pepper         216×288     129×240
Mountain Dew      216×288     119×240
Schweppes         216×288     106×240
7UP               216×288     123×240

14 cellules · 1 taille de plateau · 1 hauteur de photo
```

**Zéro repli, zéro logo, zéro trou.** La demande du propriétaire — « que les
photos des boissons soient toutes à la même taille » — est désormais satisfaite
sur les quatorze, et non plus sur douze.

Les largeurs restent proportionnelles au produit réel (70 à 150 px) : les forcer
égales reviendrait à étirer les canettes.

---

## 7. QA

| Porte | Résultat |
| --- | --- |
| `npm run check` | 0 erreur · 0 avertissement |
| `npm run qa` | **EXIT 0** · 566/566 · 1 094 tests |
| `npm run qa:staging` | **EXIT 0** · 569/569 · 62 tests visuels |

Production : **0 packshot généré publié**, inchangé.

### Contrôles modifiés

- la piste rend **14** photos produit (au lieu de 12) ;
- `FEATURED_WITHOUT_PACKSHOT` est **vide** — la liste reste déclarée, car la
  piste est l'endroit où un trou se voit le plus vite ;
- **aucun logo** dans la piste Featured, sans exception (contrôle rétabli) ;
- **13** logos au catalogue — le garde-fou du refus du logo Lipton.

---

## 8. Blocages

| # | Blocage | État |
| --- | --- | --- |
| **B2** | Packshots officiels — **24** visuels générés désormais, aucun droit confirmé | **ouvert** |
| **B11** | Droits sur les logos de marque · le logo Lipton manquant a été livré depuis (TR-030) | **ouvert** |
| B1 | Acheminement du formulaire | ouvert |
| B3 | Mentions légales | ouvert |
| B5 | Domaine e-mail — `info@ivan-arsenov.de` à confirmer | ouvert |

`TR027_FINDING_001` reste ouvert et non corrigé.
