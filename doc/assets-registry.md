# REGISTRE D'ASSETS — IVAN ARSENOV

> **Fichier généré** par `npm run assets:report`. Ne pas éditer à la main :
> les informations non déductibles se saisissent dans `src/data/assets.ts`.

## État

| | Total | Publiables en production |
|---|---|---|
| **Hero** — conditionne la direction artistique | 6 | 0 |
| **Identité** | 4 | 0 |
| **Featured** | 32 | 0 |
| **Catalogue** | 46 | 0 |
| **Total** | 88 | 0 |

Statuts — validated 0 · requires_validation 1 · missing 87

**88 asset(s) sont substitués par le repli typographique en production.**
Aucune marque n'est retirée du site pour autant : seul le visuel est remplacé.

## Règles appliquées

| Environnement | `validated` | `requires_validation` | `missing` |
|---|---|---|---|
| **Staging** | rendu | **rendu** | repli |
| **Production** | rendu | **repli** | repli |

La production exige en outre un **checksum** et une **autorisation positivement établie**
(`granted` ou `referential-use`). Un statut `unknown` bloque : l'absence d'information
vaut refus, jamais accord tacite.

Aucun hotlink. Aucun asset du benchmark n'est exploitable en production.
Aucune image générée ou substituée n'est présentée comme un vrai produit.

### Hero — priorité absolue

| Marque | Usage | Chemin | Statut | Provenance | Autorisation | Dimensions | Format | Poids | Checksum | Production | Note juridique |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Coca-Cola | `hero` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Fanta | `hero` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Pepsi | `hero` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Sprite | `hero` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Monster Energy | `hero` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Red Bull | `hero` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |

### Identité

| Marque | Usage | Chemin | Statut | Provenance | Autorisation | Dimensions | Format | Poids | Checksum | Production | Note juridique |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Ivan Arsenov — monogramme IA | `monogram` | — | missing | Client — visuel présenté en conversation le 2026-08-15, fichier non transmis | granted — Identité propre du client | — | — | — | — | ❌ repli | Monogramme seul. Sert le filigrane du hero et dérive le favicon. Vectoriel SVG exigé — une version matricielle serait inutilisable. |
| Ivan Arsenov — lock-up complet | `lockup` | — | missing | Client — visuel présenté en conversation le 2026-08-15, fichier non transmis | granted — Identité propre du client | — | — | — | — | ❌ repli | Monogramme + wordmark + filet. Sert le footer et les métadonnées sociales. Vectoriel SVG exigé — une version matricielle serait inutilisable. |
| Ivan Arsenov — wordmark | `wordmark` | — | missing | Client — visuel présenté en conversation le 2026-08-15, fichier non transmis | granted — Identité propre du client | — | — | — | — | ❌ repli | Wordmark seul. Sert la marque du header, où la hauteur est contrainte. Vectoriel SVG exigé — une version matricielle serait inutilisable. |
| Ivan Arsenov — favicon | `favicon` | `public/favicon.svg` | requires_validation | Placeholder composé en interne — TR-001 | granted — Composition interne, aucune marque tierce | 32×32 | svg | — | — | ❌ repli | Placeholder interne, à ne pas confondre avec le monogramme officiel. À remplacer dès réception du vectoriel (décision D8). |

### Featured

| Marque | Usage | Chemin | Statut | Provenance | Autorisation | Dimensions | Format | Poids | Checksum | Production | Note juridique |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 7UP | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| 7UP | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Bundaberg | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | Références non alcoolisées uniquement. SKU précis non confirmés. |
| Bundaberg | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | Références non alcoolisées uniquement. SKU précis non confirmés. |
| Coca-Cola | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Coca-Cola | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Dr Pepper | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Dr Pepper | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Fanta | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Fanta | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Mountain Dew | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Mountain Dew | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Orangina | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Orangina | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Pepsi | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Pepsi | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Schweppes | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Schweppes | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Sprite | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Sprite | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Monster Energy | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Monster Energy | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Powerade | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Powerade | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Red Bull | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Red Bull | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Evian | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Evian | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| SPA | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| SPA | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Capri-Sun | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Capri-Sun | `packshot` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |

### Catalogue

| Marque | Usage | Chemin | Statut | Provenance | Autorisation | Dimensions | Format | Poids | Checksum | Production | Note juridique |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A&W | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | Root Beer = soft drink non alcoolisée, à ne pas confondre avec une bière. SKU précis non confirmés. |
| Big Red | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Canada Dry | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Dr Foots | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Fernandes | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Guaraná Antarctica | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Krombacher Spezi | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | Spezi et soft drinks uniquement — jamais les bières Krombacher. SKU précis non confirmés. |
| Mirinda | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Oasis | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Pariba | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Poms | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Rivella | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Royal Club | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Sisi | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Sunkist | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Yummy Miami Soda | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| 28 Black | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| AA Drink | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Aquarius | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Bomba | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Freego | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| O2Life | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Slammers Energy | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Vitamin Well | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Bar-le-Duc | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Chaudfontaine | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Feel So Good | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Kızılay | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| LaCroix | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Sourcy | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Tropical Aloe Vera | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Charlie's | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Coco Rico | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| DubbelFrisss | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Grace | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Hawai | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Hawaiian Punch | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Hero | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | Boissons et jus uniquement — pas les confitures ni l’alimentaire. SKU précis non confirmés. |
| Maaza | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| OKF | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Rauch | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Taksi | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | — |
| Chupa Chups | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | Boissons sous licence uniquement — pas les confiseries. |
| Mentos | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | Sodas et boissons uniquement — pas les bonbons. |
| Squid Game | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | Boissons sous licence uniquement. |
| Toxic Waste | `logo` | — | missing | — | unknown | — | — | — | — | ❌ repli | Boissons sous licence uniquement — pas les bonbons. |
