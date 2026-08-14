# CONTENT ARCHITECTURE — IVAN ARSENOV

> Architecture de contenu et *copy deck*. Source de vérité rédactionnelle.
> L'anglais est la **langue canonique** ; l'allemand en est une adaptation professionnelle,
> jamais une traduction mot-à-mot.

---

## 1. Sitemap

8 pages × 2 langues = **16 routes statiques**.

| EN (canonique) | DE | Rôle |
|---|---|---|
| `/` | `/de/` | Homepage — expérience éditoriale, conversion |
| `/drinks/` | `/de/getraenke/` | Catalogue + recherche + filtres |
| `/brands/` | `/de/marken/` | Répertoire éditorial des marques |
| `/about/` | `/de/ueber-uns/` | Crédibilité, identité |
| `/contact/` | `/de/kontakt/` | **Business Enquiry — conversion principale** |
| `/imprint/` | `/de/impressum/` | Obligation légale allemande §5 DDG |
| `/privacy/` | `/de/datenschutz/` | RGPD |
| `/cookies/` | `/de/cookies/` | Politique de stockage |

**Slugs allemands traduits** — meilleur SEO local, et cohérent avec une entité allemande.
`hreflang` réciproques + `x-default` → EN.

**Navigation principale** — `Drinks · Brands · About · Contact` + CTA `Request a Quote` + sélecteur `EN | DE`.
Pas de pages de marque individuelles en v1 (contenu insuffisant → pages pauvres).
Chaque marque deep-linke vers `/drinks/?brand=<slug>`.

---

## 2. Homepage — section par section

Parcours psychologique : *Qu'est-ce que c'est → Pour qui → Que proposez-vous →
Pourquoi vous → Qu'y a-t-il de spécial → Comment ça marche → Prochaine action.*

Chaque section possède **son propre rythme visuel** — aucun composant répété d'une section à l'autre.

---

### S1 · HERO — `THE STAGE`

| | |
|---|---|
| Eyebrow | `B2B SOFT DRINKS · INTERNATIONAL SELECTION` |
| H1 | *(3 variantes à départager visuellement — voir §3)* |
| Support | From global icons to distinctive international flavours, Ivan Arsenov brings together a focused selection of non-alcoholic beverages for professional buyers. |
| CTA 1 | **Request a Quote** |
| CTA 2 | Explore Our Drinks *(lien souligné, jamais un bouton)* |

L'eyebrow porte la qualification **B2B** au-dessus de la ligne de flottaison — c'est lui qui
satisfait US-001, ce qui libère le H1 de toute obligation explicative et lui permet d'être court.

Fond noir · composition produits multi-plans · le monogramme IA en filigrane.

---

### S2 · FEATURED BRANDS

| | |
|---|---|
| Eyebrow | `GLOBAL ICONS · INTERNATIONAL FAVOURITES` |
| H2 | **Brands people already know. Flavours they may not.** |
| Copy | Explore recognised names alongside international variants, distinctive flavours and emerging beverage formats — all within one focused soft-drinks portfolio. |

Mise en scène des 16 marques prioritaires. **Interdit** : grille WordPress de 50 logos.
Traitement : *cinematic horizontal track* + produits surdimensionnés.

*Placée en position 2 délibérément* : la reconnaissance de marque est le déclencheur de
confiance n°1 du négoce de boissons. L'acheteur doit voir Coca-Cola et Red Bull avant
qu'on lui explique quoi que ce soit.

---

### S3 · ONE CATEGORY. DEEPER FOCUS.

| | |
|---|---|
| H2 | **One category. Deeper focus.** |
| Copy | Ivan Arsenov is focused on non-alcoholic beverages. No unrelated product catalogue — just a dedicated selection of soft drinks for professional buyers. |

Puis l'index des 5 familles, chacune avec sa description et son signal chromatique :

| | Famille | Description |
|---|---|---|
| 01 | **Carbonated** | Colas, lemonades and sparkling soft drinks. |
| 02 | **Energy & Sport** | Energy, performance and functional beverages. |
| 03 | **Water** | Still, sparkling and flavoured water. |
| 04 | **Juice & Fruit** | Fruit drinks, juices and tropical flavours. |
| 05 | **International Finds** | Regional variants, special flavours and distinctive imported-style products. |

⚠️ *Ne jamais prétendre importer directement tant que ce n'est pas confirmé —
la formulation « imported-style » est volontaire et doit être conservée telle quelle.*

---

### S4 · INTERNATIONAL DISCOVERY

| | |
|---|---|
| Eyebrow | `BEYOND THE USUAL` |
| H2 | **Discover something different.** |
| Copy | Familiar brands can look very different around the world. Explore regional favourites, unusual flavours and distinctive soft drinks designed to bring something new to the shelf. |

Section la plus visuelle du site après le hero. Illustrée par les marques portant
`internationalFind` : Mountain Dew · Dr Pepper · Fanta · Pepsi · Chupa Chups · Mentos ·
Bundaberg · Guaraná Antarctica · Fernandes · Hawai · Yummy Miami Soda.

⚠️ **Aucun SKU spécifique n'est fabriqué** sans asset ou donnée vérifiée : la section
présente des marques et des univers, pas des références précises.

---

### S5 · B2B PROCESS

| | |
|---|---|
| H2 | **Simple by design.** |
| 01 | **Explore** — Browse the drinks and brands relevant to your business. |
| 02 | **Enquire** — Select the products you are interested in and send us your requirements. |
| 03 | **Let's talk business** — Ivan Arsenov will review your enquiry and continue the conversation directly with you. |

⚠️ **Aucun délai de réponse promis** tant qu'Ivan ne l'a pas confirmé.

Rôle : lever la crainte n°1 de l'acheteur B2B — *« est-ce encore un tunnel e-commerce ? »*

---

### S6 · CTA FINAL

| | |
|---|---|
| Eyebrow | `LET'S TALK DRINKS` |
| H2 | **Looking for the right products for your business?** |
| Copy | Tell us what you're looking for and start a direct B2B conversation with Ivan Arsenov. |
| CTA | **Request a Quote** |

Grand moment visuel avant le footer.

**Six sections. Aucune de plus.** Pas de bloc « nos valeurs », pas de carrousel, pas de
faux chiffres clés, pas de témoignages inventés.

---

## 3. H1 du hero — trois variantes à départager

Le choix se fait **après comparaison visuelle**, au rendu réel, dans Instrument Serif à
`clamp(3.5rem, 9vw, 8.5rem)`. Décision avant TR-019.

| | Variante | Analyse |
|---|---|---|
| **A** | **Soft drinks without borders.** | 4 mots, casse magnifiquement sur 2 lignes en display XL. « without borders » porte l'international sans le dire platement. L'eyebrow assure déjà la qualification B2B. **Recommandation** |
| **B** | The world of soft drinks. One focused B2B partner. | Le plus explicite, mais deux phrases affaiblissent l'impact typographique et forcent une taille réduite |
| **C** | Global drinks. Distinctive flavours. Built for business. | Bon rythme ternaire, mais « Built for business » est la formule la plus générique des trois |

Les trois seront implémentées derrière un commutateur dans la page de style interne,
capturées côte à côte, et arbitrées sur pièces.

---

## 4. Page — Our Drinks

| | |
|---|---|
| H1 | **Explore Our Drinks** |
| Intro | A focused selection of non-alcoholic beverages — from recognised global brands to distinctive international flavours. |

Recherche + filtres + catalogue.
Filtres : `All · Carbonated · Energy & Sport · Water · Juice & Fruit · International`
*(+ Concentrates & Syrups si décision D3 = oui)*

**Aucun prix public en v1.** Chaque élément mène à `Add to Enquiry` ou `Request Quote`.

---

## 5. Page — Brands

| | |
|---|---|
| H1 | **Brands for every kind of refreshment.** |
| Intro | Discover global names, regional favourites and distinctive beverage brands across our focused soft-drinks selection. |

Traitement éditorial. **Interdit** : la grille 4 colonnes du concurrent.
Chaque marque → `/drinks/?brand=<slug>` + `Add to Enquiry`.

---

## 6. Page — About

| | |
|---|---|
| Eyebrow | `ABOUT IVAN ARSENOV` |
| H1 | **Focused on soft drinks. Built for business.** |
| Body | Ivan Arsenov is a B2B trading business based in Wildeshausen, Germany, focused on non-alcoholic beverages.<br><br>The portfolio brings together internationally recognised names, regional favourites and distinctive drink concepts for professional buyers.<br><br>Our approach is intentionally focused: understand what you are looking for, identify the relevant products and build the commercial conversation around your requirements. |

⚠️ **Aucun storytelling fabriqué.** Pas de « Founded from a childhood passion… »,
pas de « After 20 years in the beverage industry… ». Ces informations n'existent pas.

Identité juridique complète affichée en bas de page.

---

## 7. Page — Contact / Business Enquiry

| | |
|---|---|
| H1 | **Let's talk business.** |
| Intro | Looking for specific brands, flavours or beverage categories? Tell us what you need and we'll continue the conversation directly. |
| CTA | **Send Business Enquiry** |

**Champs** — `*` = obligatoire

| Champ | Type | Requis |
|---|---|---|
| First Name | text | ✅ |
| Last Name | text | ✅ |
| Company Name | text | ✅ |
| Country | select | ✅ |
| VAT Number | text | |
| Email | email | ✅ |
| Phone | tel | |
| Products / Brands of Interest | liste + texte libre | |
| Estimated Quantity / Volume | text | |
| Message | textarea | ✅ |
| Consentement RGPD | checkbox non pré-cochée | ✅ |

Si l'utilisateur arrive depuis `Add to Enquiry`, la sélection **pré-remplit automatiquement**
le champ *Products / Brands of Interest*, sous forme de puces retirables + zone de texte libre.

**Coordonnées affichées**
```
Ivan Arsenov Iliev
Zwischenbrücken 8
27793 Wildeshausen
Germany
info@ivan-arsenov.de
```

---

## 8. Footer

Logo Ivan Arsenov · positionnement court `B2B Soft Drinks · International Selection`

| Bloc | Contenu |
|---|---|
| Navigation | Drinks · Brands · About · Contact |
| Legal | Imprint · Privacy · Cookies |
| Contact | info@ivan-arsenov.de |
| Adresse | Zwischenbrücken 8 · 27793 Wildeshausen · Germany |
| Fiscal | USt-IdNr: DE464097303 |

**Mention de non-affiliation** (décision client du 2026-08-14, usage référentiel assumé) :

> All trademarks, brand names and logos are the property of their respective owners.
> Their use on this website is purely referential and indicates the products available
> through Ivan Arsenov. No affiliation, sponsorship or endorsement is implied.

---

## 9. `Add to Enquiry` — spécification UX

Fonctionnalité stratégique : elle transforme la navigation en demande qualifiée,
**sans faire du site une boutique**.

### Parcours
`Discover → Select → Enquire`

### Déclencheur
Bouton `+ Add to Enquiry` sur chaque carte marque et carte produit
(pages Drinks, Brands, section Featured Brands).
Desktop : apparaît au survol et **toujours au focus clavier**. Tactile : toujours visible.

### États
| État | Rendu |
|---|---|
| Repos | `+ Add to Enquiry` |
| Ajouté | `✓ Added` — bascule (`aria-pressed`), re-clic = retrait |
| Limite atteinte | Notice discrète à 25 éléments, pas de blocage brutal |

### Persistance
`sessionStorage` — **pas** `localStorage`. Deux raisons : pas de liste périmée d'une
session à l'autre, et empreinte de vie privée minimale. Stockage strictement nécessaire à
un service explicitement demandé par l'utilisateur → **exempté de consentement ePrivacy**.
Documenté dans la page Cookies.

### Indicateur
- **Desktop** — compteur discret dans le header, adjacent au CTA : `3 selected`
- **Mobile** — barre inférieure fine, **apparaissant uniquement si count > 0** :
  `3 selected` + `Request Quote`

### Panneau
Clic sur l'indicateur → panneau latéral : liste des éléments, retrait unitaire,
`Clear all`, et CTA `Request Quote`.
Clavier : piégeage du focus, `Esc` ferme, focus restauré sur le déclencheur.

### Transfert vers le formulaire
`Request Quote` → `/contact/` avec la sélection injectée dans *Products / Brands of Interest*,
sous forme de puces retirables, doublée d'une zone de texte libre éditable.

### Discipline lexicale
✅ *Add to Enquiry · selected · Request Quote · Enquiry list*
❌ *cart · basket · order · checkout · add to cart · buy*
Aucun sélecteur de quantité. Aucun prix. Aucun total.

### Dégradation
Sans JavaScript, les boutons `Add to Enquiry` **ne sont pas rendus** : le formulaire reste
intégralement utilisable via son champ de texte libre. La fonctionnalité est une
amélioration progressive, jamais un prérequis à la conversion.

---

## 10. Ton de marque

**Court · assuré · premium · international · commercial · précis.**

| ❌ Proscrit | ✅ Attendu |
|---|---|
| Empowering your beverage journey. | Soft drinks without borders. |
| Redefining refreshment excellence. | One category. Deeper focus. |
| Unlock limitless possibilities. | Discover something different. |
| | Let's talk business. |

Ni jargon corporate, ni remplissage, ni langage de vente agressif.

---

## 11. Stratégie EN / DE

L'anglais est **canonique**. L'allemand est une **adaptation professionnelle**.

| EN | DE |
|---|---|
| Request a Quote | **Angebot anfragen** |
| Explore Our Drinks | **Getränkesortiment entdecken** |
| Add to Enquiry | **Zur Anfrage hinzufügen** |
| Send Business Enquiry | **Geschäftsanfrage senden** |
| Brands | **Marken** |
| Drinks | **Getränke** |
| Featured Brands | **Ausgewählte Marken** |
| Imprint | **Impressum** |

Les H1 et H2 sont **réécrits**, pas traduits. Exemple : *« One category. Deeper focus. »*
ne devient pas *« Eine Kategorie. Tieferer Fokus. »* — l'adaptation doit sonner juste en
allemand commercial. Formulations définitives arrêtées en TR-015.

Terminologie B2B : *Großhandel · Anfrage · Angebot · Sortiment · Fachhändler*.

---

## 12. Orientation SEO

Thèmes préparés, **sans invention de marché géographique** :
`B2B soft drinks supplier` · `soft drink wholesaler` · `international soft drinks` ·
`energy drinks wholesale` · `soft drinks for professional buyers` · `international beverage brands`

⚠️ Formulations finales et **ciblage géographique à valider avant publication** (décision D10).
Aucun bourrage de mots-clés — le texte est écrit pour un acheteur, pas pour un robot.
