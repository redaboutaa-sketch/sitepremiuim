# TR-024D — Remplacement du packshot Pepsi

**État : BLOQUÉ — le fichier de remplacement n'existe pas et ne peut pas être fabriqué ici.**
Base : `b770fba9099d9f296d99a38ba7910625e96e6ef8` (TR-024C).
Aucune modification du dépôt. Aucun commit. Aucun déploiement.

---

## 1 · Le défaut est confirmé, et par une source interne

TR-024C signalait que le packshot Pepsi généré porte la livrée 2008-2023.
La confirmation ne vient pas d'une mémoire : **le logo Pepsi fourni par le
client lui-même** (`src/assets/brands/pepsi/logo.webp`, archive « photos
ivan.zip » du 2026-08-16) porte l'identité **courante**.

| | Packshot généré, en préproduction | Logo fourni par le client |
|---|---|---|
| Wordmark | `pepsi` bas-de-casse, **sous** le globe | `PEPSI` capitales, **dans** le globe |
| Globe | sans cerne | cerne noir épais |
| Époque | 2008 – 2023 | 2023 → |

Planche : `qa/review/pepsi-identite-comparaison.png`.

Les deux visuels du même produit, dans le même dépôt, ne montrent pas la même
marque. Ce n'est pas un défaut de rendu : c'est une inexactitude factuelle sur
un produit du catalogue, devant un lecteur — un grossiste en boissons — qui la
repère immédiatement.

---

## 2 · Pourquoi le remplacement ne peut pas être fait ici

Trois voies existent. Les trois sont fermées, et aucune ne l'est par commodité.

**Générer une nouvelle image.** Cette session ne dispose d'aucun outil de
génération d'images — vérifié, pas supposé. Et quand bien même : les six
packshots actuels ne sont tolérés que parce qu'ils sont marqués `generated`,
`requires_validation`, autorisation `unknown`, et confinés à la préproduction.
En produire un septième ne réglerait pas le problème d'exactitude, il le
déplacerait : une canette fabriquée par un modèle n'atteste pas plus l'identité
2023 qu'elle n'attestait la 2008.

**Télécharger une image de presse.** Ce serait introduire un visuel tiers sans
autorisation dans un dépôt dont toute la gouvernance d'assets existe pour
l'interdire — la même gouvernance que ce TR demande explicitement de ne pas
modifier. Le statut de droits resterait `unknown` : rien de gagné, une règle
cassée.

**Repeindre la canette existante.** Redessiner le globe et le wordmark revient
à reconstruire les pixels du produit et à redessiner le logo d'un titulaire.
Les deux ont été interdits nommément en TR-024A et TR-004.

Il n'existe donc pas de chemin honnête entre l'état actuel et un packshot Pepsi
à l'identité courante **sans un fichier venu de l'extérieur**.

---

## 3 · Ce qu'il faut fournir

Un seul fichier. Les contraintes ci-dessous sont **mesurées sur l'asset
actuel**, pas souhaitées : elles décrivent ce qu'il faut égaler pour que la
composition approuvée en TR-024C reste identique.

### Contenu

- canette Pepsi de face, **identité 2023** (`PEPSI` en capitales dans le globe,
  cerne noir) — celle du logo déjà fourni par le client ;
- portrait, canette entière, verticale, sans inclinaison ;
- **fond transparent réel** (canal alpha), pas un blanc détouré ;
- **aucune ombre incrustée**, aucun reflet de sol, aucune éclaboussure, aucune
  lueur, aucun filigrane, aucun texte promotionnel ajouté ;
- rien d'autre dans le cadre.

### Géométrie — ce qui garde la scène intacte

| Contrainte | Valeur mesurée sur l'asset actuel | Tolérance |
|---|---|---|
| Ratio largeur / hauteur | **0,4495** (227 × 505) | **0,45 ± 0,03** |
| Marge transparente sur les 4 bords | 0,0 % | ≤ 0,5 % |
| Couverture opaque dans la boîte englobante | 0,962 | ≥ 0,93 (au-delà, une ombre est incrustée) |
| Largeur source | 227 px | **≥ 400 px** recommandé |

L'emplacement impose la HAUTEUR ; la largeur suit le ratio du fichier. Donc :

- dans la bande 0,45 ± 0,03, la largeur rendue bouge de moins de 5 px à 1920 —
  la composition est visuellement inchangée ;
- une canette 330 ml trapue (ratio ≈ 0,574) serait rendue **29 % plus large**
  (99 px au lieu de 77) : la silhouette du plan arrière changerait, et les cinq
  autres objets — tous élancés — perdraient leur cohérence de format.

**Le format élancé n'est donc pas une préférence : c'est ce qui préserve à la
fois la géométrie approuvée et la cohérence de la rangée.**

### Baseline à reproduire après remplacement

| Fenêtre | Pepsi rendu | Source servie |
|---|---|---|
| 1920 | 77 × 172 px | 71 × 158 |
| 1440 | 76 × 169 px | 69 × 153 |
| 1280 | 67 × 148 px | 59 × 133 |
| 1024 | 52 × 116 px | 45 × 100 |
| 768 | 40 × 90 px | 42 × 93 |
| ≤ 430 | masqué (plan arrière) | — |

---

## 4 · Procédure de remplacement — deux gestes

1. Déposer le fichier en `src/assets/brands/pepsi/hero.png`.
2. Mettre à jour la seule entrée `'pepsi:hero'` de `src/data/assets.ts` :
   `width`, `height`, `bytes`, `checksum`, `opticalCoverage`, `source`.
   `status`, `sourceType`, `authorization` et `legalNote` **ne changent pas** —
   l'asset reste `generated` / `requires_validation` / `unknown`, réservé à la
   préproduction.

Puis `astro check`, `npm run qa`, `npm run qa:staging`.

Les garde-fous nécessaires existent déjà et n'ont pas besoin d'être ajoutés :

- `tests/assets.spec.ts` refuse un fichier dont le poids, les dimensions, le
  format ou l'empreinte ne correspondent pas au registre ;
- `tests/visual/stage.spec.ts` mesure la géométrie sur neuf largeurs et
  l'occultation sur cinq — un ratio hors bande s'y verrait ;
- `qa:artifact` vérifie que la production n'en dépose ni n'en rend aucun.

---

## 5 · État actuel, inchangé

| Contrôle | Résultat |
|---|---|
| Arbre de travail | **propre** — aucune modification |
| Composition du Hero | inchangée (TR-024C) |
| Position, échelle, plan de Pepsi | inchangés |
| Packshots générés dans l'artefact de production | **0** |
| Identité Pepsi courante visible en préproduction | **non** — c'est le blocage |

Aucun commit : il n'y a rien à committer.

---

## 6 · Décision demandée

Le packshot actuel reste en place et reste marqué
`REPLACE_BEFORE_CLIENT_REVIEW`. Deux options, au choix du client :

**A — fournir le fichier.** La voie propre. Le remplacement prend deux gestes
et les portes de qualité existantes le valident.

**B — montrer les planches en l'état, en le disant.** Pepsi est au plan
arrière, flouté à 4 px, à 30 % d'opacité, rendu à 77 px de large : la livrée
n'y est pas lisible à l'écran. Elle l'est en revanche sur les gros plans de
`qa/review/`. Si les planches sont montrées, le point doit être signalé
d'avance — pas découvert par le client.

Une troisième option existe techniquement — retirer le packshot Pepsi pour que
l'emplacement retombe sur son repli typographique — mais elle change la
composition que TR-024C vient d'approuver : le repli occupe toute la largeur du
plateau (220 px au lieu de 77). Elle n'est donc pas proposée sans instruction
explicite.
