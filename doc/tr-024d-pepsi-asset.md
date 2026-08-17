# TR-024D — Remplacement du packshot Pepsi

**État : FAIT.** Base : `b770fba` (TR-024C). Préproduction uniquement, aucun déploiement.
Un seul fichier remplacé. Aucune modification de la composition.

---

## 1 · Le défaut, confirmé par une source interne

TR-024C signalait que le packshot Pepsi portait la livrée 2008-2023. La
confirmation n'est pas venue d'une mémoire : **le logo Pepsi fourni par le
client lui-même** (`src/assets/brands/pepsi/logo.webp`, archive « photos
ivan.zip ») porte l'identité **courante**. Deux visuels du même produit, dans
le même dépôt, ne montraient pas la même marque.

Planche : `qa/review/pepsi-identite-comparaison.png`.

---

## 2 · Provenance — ce que dit le fichier lui-même

À la question posée avant intégration, la réponse donnée était « photo
officielle du titulaire ». **Le fichier dit autre chose.**

Il embarque un manifeste **C2PA** signé, lu à l'ingestion :

```
c2pa.actions.v2
  action            : c2pa.created
  when              : 2026-08-17T00:00:00Z
  softwareAgent     : { name: gpt-image, version: 2.0 }
  digitalSourceType : http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia
```

`trainedAlgorithmicMedia` est le code IPTC des contenus **intégralement produits
par un modèle génératif**. Le manifeste contient également l'icône de l'agent
émetteur.

Le registre enregistre donc `sourceType: 'generated'`, conformément à la
consigne initiale de TR-024D et **contrairement à la réponse de provenance**.
C'est exactement ce pour quoi ce champ existe : une déclaration orale ne
l'emporte pas sur une provenance signée embarquée dans le fichier.

### Conséquences

- `authorization: { status: 'unknown', evidence: null }` — inchangé ;
- `status: 'requires_validation'` — préproduction uniquement, inchangé ;
- **B2 reste ouvert.** Cet asset corrige une inexactitude d'identité ; il ne
  crée aucun droit d'usage ;
- les trois garde-fous que j'avais annoncé devoir ajuster si l'asset était
  `supplied` **n'ont pas eu à bouger** : les six packshots du hero restent tous
  `generated`, le modèle tient tel quel.

---

## 3 · Traitement du fichier

| Étape | Détail |
|---|---|
| Source | `ChatGPT Image 17 août 2026, 18_38_05.png` — 1536 × 1024, **alpha réel** |
| Fond | **déjà transparent** — aucun détourage nécessaire (mon évaluation « fond blanc », faite sur l'aperçu de la conversation, était fausse : c'est le fond du visualiseur) |
| Opération | **recadrage strict sur la boîte alpha** (528, 35 → 480 × 961) |
| Non fait | aucun redimensionnement, aucune retouche, aucun pixel du produit reconstruit, aucune recompression du contenu |

Contrôles du fichier retenu :

| Critère | Exigé (§3 du rapport précédent) | Mesuré | Verdict |
|---|---|---|---|
| Identité Pepsi 2023 | requise | `PEPSI` capitales dans le globe, cerne noir | ✅ |
| Alpha réel, fond transparent | requis | oui, alpha partiel 0,52 % | ✅ |
| Marges transparentes | ≤ 0,5 % | **0 px sur les 4 bords** | ✅ |
| Couverture opaque | ≥ 0,93 | **0,951** — aucune ombre incrustée | ✅ |
| Largeur source | ≥ 400 px | **480 px** | ✅ |
| Éclaboussure / lueur / filigrane / texte ajouté | aucun | aucun | ✅ |
| Ratio | 0,45 ± 0,03 | **0,4995** | ⚠️ **hors bande, +0,02** |

### La seule dérogation, et son effet mesuré

L'emplacement impose la HAUTEUR ; la largeur suit le ratio du fichier. Un ratio
de 0,4995 au lieu de 0,4495 élargit donc l'objet de **11 %** :

| Fenêtre | Hauteur avant → après | Largeur avant → après |
|---|---|---|
| 1920 | 172 → **172** | 77 → **86** |
| 1440 | 169 → **169** | 76 → **84** |
| 1280 | 148 → **148** | 67 → **74** |
| 1024 | 116 → **116** | 52 → **58** |
| 768 | 90 → **90** | 40 → **45** |
| ≤ 430 | masqué → masqué | plan arrière masqué |

**Hauteur, position, plan, échelle, opacité et flou : identiques à l'unité près
à toutes les largeurs.** Seule la silhouette s'élargit de 9 px au maximum, sur
un objet de plan arrière rendu à 30 % d'opacité et flouté à 4 px.

Ce n'est pas une décision de composition : c'est la proportion réelle de la
canette livrée. Le contrôle d'occultation, rejoué sur cinq largeurs, reste vert
— aucun objet n'est masqué à plus de 60 %.

---

## 4 · Performance

| Contexte | TR-024C | TR-024D |
|---|---|---|
| Packshots · 1920 @1x | 130 Ko | **127 Ko** |
| Packshots · 390 @1x | 130 Ko | **127 Ko** |
| Packshots · 1440 @2x | 306 Ko | **299 Ko** |

Légère baisse : la nouvelle canette, plus uniforme, se compresse mieux que
l'ancienne. Aucune régression.

---

## 5 · Portes de qualité

| Gate | Résultat |
|---|---|
| `npx astro check` | 0 erreur, 0 avertissement |
| `npm run qa` | **EXIT 0** — 564/564 · 824 + 227 tests |
| `npm run qa:staging` | **EXIT 0** — 563/563 · 51 tests |
| Packshots générés dans l'artefact de production | **0** |
| Identité Pepsi courante visible en préproduction | **oui** |
| Régression à 320 / 390 / 768 / 1440 / 1920 | **aucune** |

Aucun test n'a eu à être modifié : `tests/assets.spec.ts` a validé le nouveau
poids, les nouvelles dimensions et la nouvelle empreinte contre le registre
mis à jour, et `tests/visual/stage.spec.ts` a mesuré la géométrie sur neuf
largeurs et l'occultation sur cinq.

---

## 6 · Qualité du nouveau visuel

Inspection à résolution native (`qa/review/pepsi-nouveau-*.png`) :

- **étiquette** : globe 2023 correct — rouge / bande blanche / bleu, cerne noir,
  `PEPSI` en capitales bien formées et correctement approchées ;
- **haut** : jonc supérieur argenté correct, vue à hauteur d'œil sans languette
  visible — cohérent avec les cinq autres objets ;
- **bas** : culot plat, jonc argenté correct, découpe alpha nette — l'objet se
  pose sans halo sur le filet de sol ;
- **condensation** : plausible, non répétée ;
- aucun artefact typographique, aucun détail d'emballage impossible, aucun
  reflet aberrant relevé.

Statut : `VISUALLY_ACCEPTABLE_FOR_STAGING`. **Jamais autorisé en production.**

---

## 7 · Ce qui reste ouvert

- **B2 — packshots officiels.** Toujours ouvert, pour Pepsi comme pour les cinq
  autres. Six visuels générés, sans autorisation, confinés à la préproduction.
- **B11 — droits des logos de marque.** Inchangé.
- **Point de vigilance, sans action demandée.** Le nouveau fichier est
  identifiable comme généré uniquement parce qu'il transporte un manifeste
  C2PA. Un fichier sans manifeste ne serait distinguable d'une photographie par
  aucun moyen automatique. C'est la déclaration de provenance à la livraison qui
  reste la seule garantie — et elle n'a pas concordé cette fois-ci.
