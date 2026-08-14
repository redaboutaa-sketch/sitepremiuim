# PLAN D'IMPLÉMENTATION — IVAN ARSENOV

> Décomposition en tracer bullets indépendants et testables.
> Chaque TR est implémenté, vérifié visuellement, corrigé et validé **avant** le suivant.
> Aucun patch monolithique.

**Version** 2.0 — mise à jour après réception de la source de vérité contenu (2026-08-14)
**Statut** — en attente de validation SPEC CHECK

**Documents liés** — `doc/prd.md` · `doc/catalog.md` · `doc/content-architecture.md` · `doc/design-direction.md`

---

## Stack retenue

| Couche | Choix | Justification |
|---|---|---|
| Framework | **Astro 5** | Compile en HTML statique pur → Hostinger sans runtime Node. N'impose aucune esthétique. i18n natif avec slugs traduits. Zéro JS par défaut |
| Langage | **TypeScript** strict | Catalogue typé via Content Collections : une donnée hors périmètre casse le build, pas la page |
| Styles | **CSS natif** (cascade layers + custom properties) | Aucun framework utilitaire. Tailwind/shadcn produiraient le rendu générique explicitement proscrit |
| UI | **Composants Astro** | Pas de React : inutile ici, et coût de performance net |
| Interactions | **TypeScript vanilla** | Filtres, enquiry list, formulaire, menu — tous réalisables sans framework |
| Animation | **GSAP 3.15 + ScrollTrigger** | Hero et piste horizontale uniquement. Le reste en CSS + IntersectionObserver |
| Transitions | **View Transitions** natives (Astro) | Effet premium, coût quasi nul, dégradation propre |
| Images | **`astro:assets`** | AVIF/WebP, tailles responsives, dimensions déclarées → CLS 0 |
| Polices | **Auto-hébergées, sous-jeu** | Performance + aucune requête tierce → aucune bannière cookie |
| Formulaire | **Endpoint PHP durci** | Seule option serveur en hébergement statique Hostinger |
| QA | **Playwright + Chromium** | Captures multi-breakpoints, erreurs console, audit clavier et contrastes |

### Écartées, et pourquoi

| Technologie | Décision | Motif |
|---|---|---|
| **Three.js** | ❌ | Une scène 3D crédible exigerait des modèles 3D sous licence de canettes et bouteilles, qui n'existent pas — nous n'avons même pas encore les packshots 2D. Le résultat serait faux et lourd. La composition 2D multi-plans produit l'effet recherché pour une fraction du poids. **Réévaluable si de vrais assets 3D sont fournis** |
| **React Bits / Magic UI** | ❌ | Taillées pour Tailwind/shadcn. Les employer produirait le look générique que le brief interdit |
| **Tailwind CSS** | ❌ | Pousse vers les solutions par défaut ; incompatible avec une direction distinctive |
| **Lenis / smooth scroll** | ❌ | Détourne le scroll natif, dégrade l'accessibilité et l'INP |
| **CMS** | ❌ v1 | Non demandé. Le catalogue vit en fichiers de données versionnés |

---

## Tracer bullets

---

### TR-001 — Fondation technique
**Dépend de** — · **Couvre** US-012, US-018, US-019

Astro 5 + TS strict · i18n **EN racine / DE `/de/` avec slugs traduits**
(`/drinks/` ↔ `/de/getraenke/`, `/brands/` ↔ `/de/marken/`, `/about/` ↔ `/de/ueber-uns/`,
`/contact/` ↔ `/de/kontakt/`, `/imprint/` ↔ `/de/impressum/`, `/privacy/` ↔ `/de/datenschutz/`)
· `astro:assets` · sitemap · scripts build/preview/QA · `.gitignore`

**Acceptation** — `npm run build` produit un `dist/` statique · zéro erreur TS · les 16 routes résolvent · aucun secret versionné
**Validation** — build + `npx serve dist` + inspection de l'arborescence

---

### TR-002 — Design system
**Dépend de** TR-001 · **Couvre** US-014, US-017, US-018

Traduction de `doc/design-direction.md` en fondations CSS : tokens · échelle typographique fluide ·
grille · primitives de mouvement + bloc global `prefers-reduced-motion` · Instrument Serif +
Archivo auto-hébergées et sous-jeu · **6 paires de signaux chromatiques par famille** ·
page de style interne (`noindex`, retirée du build de production)

**Acceptation** — tous les contrastes vérifiés par script · aucune valeur codée en dur hors tokens · `prefers-reduced-motion` neutralise tout mouvement · **zéro requête réseau externe**
**Validation** — page de style capturée aux 4 breakpoints + script de contraste automatisé

---

### TR-003 — Modèle de données et catalogue
**Dépend de** TR-001 · **Couvre** US-002, US-003, US-004, US-005 · **Source** `doc/catalog.md`

Schémas Zod pour marques, familles et produits — 18 champs (`brand`, `productName`,
`category`, `subcategory`, `variant`, `flavour`, `country`, `packageType`, `volume`,
`image`, `logo`, `featured`, `internationalFind`, `specialEdition`, `availabilityStatus`,
`assetStatus`, `searchTerms`, `scopeNote`) · saisie des **66 marques** · 6 familles
(la 6ᵉ conditionnée à D4) · marqueur `internationalFind` **transversal aux familles**

**Contrôles au build — bloquants**
1. Champ inconnu = `null`, jamais une valeur plausible inventée
2. `null` → **aucun rendu** (ni « N/A », ni « — »)
3. `availabilityStatus: 'TBC'` → aucune mention de disponibilité
4. Une marque de la **liste d'exclusions** (Amstel, Bavaria, Heineken, Banditos, Dilmah, Nescafé, Lipton, Fuze Tea, Arizona) fait **échouer le build**
5. `slug` en doublon → build en échec
6. Marques à périmètre partiel → `scopeNote` obligatoire

**Acceptation** — les 6 contrôles passent · aucune marque hors périmètre · aucun SKU, format ou pays inventé
**Validation** — build + tests unitaires sur les règles de validation

---

### TR-004 — Pipeline d'assets et registre de validation
**Dépend de** TR-003 · **Couvre** US-017, US-018 · **Traite R1, R2, R7**

Arborescence `src/assets/brands/<slug>/` (`logo.svg`, `product-main.webp`, `product-alt.webp`) ·
composant `ProductObject` à ratio fixe : visuel réel s'il existe → traitement uniforme
(détouré, ombre portée, ancrage au filet) ; sinon → **repli typographique composé**
(index + marque + famille + signal), dessiné pour être présentable — jamais un rectangle gris ·
`doc/assets-guide.md` (spécifications à transmettre au client) ·
`npm run audit:assets` → rapport de statut par marque

**Règle `ASSET_REQUIRES_VALIDATION`** — utilisable en développement et staging,
**fait échouer le build de production**. Les marques sous licence tierce (Squid Game,
Chupa Chups, Mentos, Toxic Waste) sont suivies dans un registre distinct.

**Acceptation** — aucun hotlink vers le benchmark · aucune composition graphique reprise du benchmark · une page mêlant assets réels et replis reste cohérente · aucun décalage de mise en page
**Validation** — capture comparative 100 % / 0 % / mixte + rapport d'audit

---

### TR-005 — Shell : header, navigation, footer
**Dépend de** TR-002 · **Couvre** US-007, US-008, US-011, US-012, US-013, US-014

Header transparent au repos, dense au scroll · nav `Drinks · Brands · About · Contact` ·
CTA `Request a Quote` permanent · sélecteur `EN | DE` conservant la page équivalente ·
menu mobile plein écran avec piégeage du focus · footer complet (positionnement court,
navigation, legal, contact, adresse, USt-IdNr) · **mention de non-affiliation** · lien d'évitement

**Acceptation** — navigation clavier complète · focus piégé et restauré sur le menu mobile · changement de langue sans perte de page · CTA visible à tous les breakpoints · cibles ≥ 44 px
**Validation** — parcours clavier intégral + captures 4 breakpoints

---

### TR-006 — Hero `THE STAGE` · S1
**Dépend de** TR-002, TR-004, TR-005 · **Couvre** US-001, US-013, US-017, US-018, US-020

Composition statique HTML/CSS **d'abord**, animation ajoutée par-dessus · 3 plans de
profondeur (Coca-Cola, Fanta, Red Bull, Monster, Pepsi, Sprite) · monogramme IA en
filigrane 4 % · *mask reveal* du H1 par mots · GSAP + ScrollTrigger différés, chargés
uniquement si mouvement autorisé et pointeur fin · parallaxe pointeur **amortie ≤ 14 px** ·
dérive `--signal` · variante mobile distincte (2 plans, pas d'épinglage) ·
**les 3 variantes de H1 implémentées derrière un commutateur** pour arbitrage D11

**Acceptation** — H1 et CTA lisibles sans JS · composition finale immédiate et **belle à l'arrêt** en reduced-motion · aucun débordement à 320 px · LCP < 2,5 s · zéro erreur console · aucun saut de mise en page · **ni gaming, ni nightclub** : aucun néon, aucun glow
**Validation** — captures desktop/mobile · test JS désactivé · test reduced-motion · mesure LCP · captures comparées des 3 H1

---

### TR-007 — Home S2 · Featured Brands
**Dépend de** TR-006, TR-003, TR-004 · **Couvre** US-002, US-005, US-017

Eyebrow `GLOBAL ICONS · INTERNATIONAL FAVOURITES` · H2 *Brands people already know.
Flavours they may not.* · **piste horizontale cinématique** avec produits surdimensionnés,
sur les 16 marques *featured*

**Acceptation** — **interdit** : grille de 50 logos · l'épinglage ne piège jamais le scroll · sortie propre en fin de piste · opérable au clavier · repli en grille statique en reduced-motion · **aucune animation JS sur des dizaines de logos** (CSS/GPU) · libellés « Featured Brands » / « Discover the Selection » uniquement
**Validation** — scroll manuel desktop et mobile + reduced-motion + clavier + profil de performance

---

### TR-008 — Home S3 · One category. Deeper focus.
**Dépend de** TR-007 · **Couvre** US-001, US-003, US-006

Section **off-white**, rupture éditoriale calme, sans image produit · H2 + copy de
positionnement · index numéroté des 5 familles avec leurs descriptions et leurs signaux ·
chaque famille mène au catalogue filtré

**Acceptation** — aucune affirmation non vérifiée · la formulation « imported-style » conservée telle quelle (**aucune revendication d'importation directe**) · les 5 familles atteignables en un clic · révélations neutralisées en reduced-motion
**Validation** — captures + relecture de conformité §1.3 du PRD

---

### TR-009 — Home S4 · International Discovery
**Dépend de** TR-008 · **Couvre** US-002, US-017

Retour au noir · eyebrow `BEYOND THE USUAL` · H2 *Discover something different.* ·
galerie des marques portant `internationalFind` · **la dérive chromatique de l'environnement
suit la famille affichée** — c'est ici que l'effet prend tout son sens

**Acceptation** — **aucun SKU spécifique fabriqué** : la section présente des marques et des univers, pas des références précises · aucune marque sous licence non validée n'est publiée · rythme visuel distinct de S2
**Validation** — captures + contrôle croisé avec le registre d'assets

---

### TR-010 — Home S5 + S6 · Process et CTA final
**Dépend de** TR-009 · **Couvre** US-006, US-008, US-010

S5 off-white, purement typographique : H2 *Simple by design.* + `01 Explore · 02 Enquire ·
03 Let's talk business` · S6 noir, CTA pleine page, un seul produit très grand

**Acceptation** — **aucun délai de réponse promis** · aucune donnée inventée · un seul style de CTA primaire sur la page · les zones manquantes portent `[À FOURNIR — client]`
**Validation** — relecture éditoriale + audit de la hiérarchie des CTA

---

### TR-011 — Enquiry List · `Add to Enquiry`
**Dépend de** TR-005, TR-003 · **Couvre** US-009, US-021 · **Spéc.** `content-architecture.md` §9

Mécanisme transverse · bouton bascule sur cartes marque et produit (`aria-pressed`) ·
visible au survol **et au focus clavier**, toujours visible sur tactile · compteur discret
dans le header (desktop) · barre inférieure conditionnelle (mobile) · panneau latéral avec
retrait unitaire, `Clear all`, CTA `Request Quote` · persistance **`sessionStorage`** ·
notice souple à 25 éléments

**Acceptation** — piégeage du focus, `Esc`, focus restauré · **lexique strictement non e-commerce** (jamais *cart*, *basket*, *order*, *checkout*, *buy*) · aucun sélecteur de quantité, aucun prix, aucun total · **sans JS les boutons ne sont pas rendus et la conversion reste intacte** · stockage documenté dans la page Cookies comme strictement nécessaire
**Validation** — parcours complet clavier et tactile · test sans JS · test de persistance inter-pages

---

### TR-012 — Page Our Drinks
**Dépend de** TR-003, TR-004, TR-011 · **Couvre** US-003, US-004, US-009

H1 *Explore Our Drinks* · catalogue sur off-white · recherche instantanée +
filtres `All · Carbonated · Energy & Sport · Water · Juice & Fruit · International`
(+ Concentrates si D4) · état synchronisé avec l'URL · filtres en colonne desktop,
tiroir mobile · `Add to Enquiry` sur chaque carte · état vide utile

**Acceptation** — filtrage < 100 ms, CLS 0 · URL partageable, retour navigateur fonctionnel · nombre de résultats en `aria-live` · intégralement clavier · **catalogue complet rendu au build → lisible sans JS** · **aucun prix** · aucune mention de disponibilité
**Validation** — test de filtres · audit clavier · test sans JS · captures 4 breakpoints

---

### TR-013 — Page Brands
**Dépend de** TR-012 · **Couvre** US-005, US-009

H1 *Brands for every kind of refreshment.* · traitement **éditorial** des 66 marques ·
chaque marque → `/drinks/?brand=<slug>` + `Add to Enquiry` · pas de page de marque
individuelle en v1 (D15)

**Acceptation** — **interdit** : la grille 4 colonnes du concurrent · aucun logo `requires_validation` en production · ratios et zones de protection respectés · aucune marque exclue
**Validation** — revue visuelle + contrôle croisé avec le registre d'assets

---

### TR-014 — Page About
**Dépend de** TR-005 · **Couvre** US-006, US-007

H1 *Focused on soft drinks. Built for business.* · corps de texte fourni par le client,
repris **tel quel** · identité juridique complète

**Acceptation** — **aucun storytelling fabriqué** (ni « founded from a passion », ni « after 20 years ») · chaque affirmation traçable à une information fournie
**Validation** — relecture ligne à ligne contre §1.3 du PRD

---

### TR-015 — Page Contact / Business Enquiry
**Dépend de** TR-005, TR-011 · **Couvre** US-008, US-009, US-010, US-011, US-016 · **CRITIQUE**

H1 *Let's talk business.* · 11 champs, **6 obligatoires** · labels visibles persistants ·
pré-remplissage depuis l'enquiry list en puces retirables + texte libre · validation au
`blur` et à la soumission, jamais pendant la frappe · états chargement / succès / erreur
dessinés · endpoint PHP : validation serveur, assainissement, honeypot, contrôle
d'horodatage, limitation de débit, en-têtes durcis, `Reply-To` acheteur ·
consentement RGPD non pré-coché · **configuration hors dépôt**

**Acceptation** — double soumission impossible · saisie conservée en cas d'erreur · succès annoncé et focusé · aucun secret dans le front-end · erreurs traduites EN/DE · **soumission fonctionnelle sans JS** (POST classique + page de confirmation) · aucun délai de réponse promis
**Validation** — parcours nominal · erreur réseau · erreur de validation · clavier · sans JS · revue de sécurité du PHP

---

### TR-016 — Pages légales
**Dépend de** TR-005 · **Couvre** US-007, US-016

`/imprint/` (§5 DDG, données réelles) · `/privacy/` (traitement du formulaire) ·
`/cookies/` (documente l'absence de cookies non essentiels et le `sessionStorage`
strictement nécessaire de l'enquiry list) · Terms non créée tant qu'Ivan ne fournit rien (D16)

**Acceptation** — mentions obligatoires complètes · atteignables depuis chaque page · **`LEGAL_CONTENT_REQUIRES_VALIDATION` porté visiblement dans le code et le rapport de livraison** · **aucun document du benchmark copié** · revue juridique signalée comme obligatoire avant production
**Validation** — liste de conformité + note explicite au client

---

### TR-017 — Adaptation allemande
**Dépend de** TR-006 → TR-016 · **Couvre** US-012

Parité intégrale, messages d'erreur et métadonnées inclus · **adaptation professionnelle,
pas traduction mot-à-mot** · H1/H2 réécrits pour sonner juste en allemand commercial ·
terminologie *Großhandel · Anfrage · Angebot · Sortiment*

**Acceptation** — aucune clé manquante (vérification au build) · aucune chaîne littérale résiduelle · les 8 pages EN ont leur équivalent DE · slugs traduits résolvant correctement
**Validation** — script de comparaison des clés + revue visuelle de toutes les pages DE

---

### TR-018 — SEO technique
**Dépend de** TR-017 · **Couvre** US-015

`title`/`description` rédigés par page et par langue · canonical · OG/Twitter avec image
dédiée · `hreflang` réciproques + `x-default` → EN · `Organization`, `WholesaleStore`,
`BreadcrumbList`, `WebSite` · sitemap bilingue · robots.txt ·
thèmes : *B2B soft drinks supplier · soft drink wholesaler · international soft drinks ·
energy drinks wholesale · soft drinks for professional buyers · international beverage brands*

**Acceptation** — JSON-LD valide · aucun doublon de `title`/`description` · hiérarchie de titres correcte · **aucun bourrage de mots-clés** · **aucun marché géographique inventé** (D10 en attente)
**Validation** — extraction et validation du JSON-LD · audit des métadonnées sur tout le `dist/`

---

### TR-019 — Passe responsive
**Dépend de** TR-018 · **Couvre** US-013, US-017

Revue et correction à 320 / 375 / 430 / 768 / 1024 / 1280 / 1440 / 1920 px ·
réévaluation de l'ordre, de la densité, de la typographie et des cibles — pas un redimensionnement

**Acceptation** — zéro débordement horizontal · aucun texte < 14 px · cibles ≥ 44 px · le design paraît intentionnel à chaque breakpoint
**Validation** — captures Playwright de toutes les pages à tous les breakpoints + détection automatisée de débordement

---

### TR-020 — Passe accessibilité et performance
**Dépend de** TR-019 · **Couvre** US-014, US-018, US-020

Audit clavier complet · contrastes en conditions réelles · structure sémantique ·
optimisation des images · budget JS · préchargement des polices ·
**vérification `prefers-reduced-motion` section par section sur l'ensemble du site**

**Acceptation** — WCAG 2.2 AA sur les parcours critiques · LCP < 2,5 s · CLS < 0,1 · INP < 200 ms · zéro erreur console · aucune animation continue hors viewport
**Validation** — audit automatisé + parcours clavier manuel de bout en bout + mesure des Core Web Vitals

---

### TR-021 — QA visuelle · 6 passes
**Dépend de** TR-020 · **Couvre** toutes

PASS 1 structure · PASS 2 design · PASS 3 finition · PASS 4 responsive ·
PASS 5 conversion · PASS 6 performance/accessibilité.
Chaque anomalie corrigée puis recapturée. **Arbitrage D11 (H1) sur pièces.**

**Acceptation** — chaque critère de chaque US validé · aucun élément cassé · aucun lien mort · aucun contenu fictif résiduel
**Validation** — rapport de QA avec captures avant/après

---

### TR-022 — Build et déploiement Hostinger
**Dépend de** TR-021 · **Couvre** US-019

Build de production (échoue si un asset `requires_validation` subsiste) ·
`.htaccess` : HTTPS forcé, canonicalisation www, cache, compression, pages d'erreur,
en-têtes de sécurité · `doc/deploy-hostinger.md` : upload, PHP du formulaire, SPF/DKIM,
liste de contrôle post-déploiement

**Acceptation** — `dist/` auto-suffisant, aucune dépendance Node en production · procédure exécutable sans assistance · aucun secret dans le dépôt
**Validation** — vérification de l'intégrité du build servi localement

> **Rappel** — le MCP Hostinger n'existe pas dans cet environnement : je ne peux ni détecter
> les serveurs, ni téléverser, ni piloter un déploiement. Livrable = build prêt à déployer
> + procédure. Après votre upload, je valide le site public au navigateur (assets, pages,
> HTTPS, mobile, navigation, animations, formulaire, erreurs réseau).

---

## Ordre d'exécution

```
TR-001 ─┬─ TR-002 ─┬─ TR-005 ─┬─ TR-006 ── TR-007 ── TR-008 ── TR-009 ── TR-010
        │          │          │
        └─ TR-003 ─┴─ TR-004 ─┼─ TR-011 ── TR-012 ── TR-013
                              ├─ TR-014
                              ├─ TR-015
                              └─ TR-016
                                    │
   TR-017 ── TR-018 ── TR-019 ── TR-020 ── TR-021 ── TR-022
```

## Definition of Done

- [ ] Toutes les US **P0** satisfaites, tous leurs critères validés
- [ ] Build sans erreur ni avertissement TypeScript
- [ ] Les 6 contrôles bloquants du catalogue passent
- [ ] Aucune marque exclue présente dans les données, le balisage ou les mots-clés
- [ ] Aucune mention de stock, de disponibilité, de quantité ou de prix
- [ ] Aucun SKU, format, contenance ou pays inventé
- [ ] Aucune erreur console significative
- [ ] Desktop, laptop, tablette et mobile validés visuellement
- [ ] Navigation, CTA, enquiry list et formulaire testés de bout en bout
- [ ] États chargement / vide / erreur / succès traités
- [ ] WCAG 2.2 AA vérifié sur les parcours critiques
- [ ] `prefers-reduced-motion` respecté sur l'ensemble du site, hero inclus
- [ ] Site fonctionnel et composé sans JavaScript
- [ ] Parité EN/DE complète, adaptation allemande professionnelle
- [ ] SEO technique, sitemap et robots.txt en place
- [ ] Core Web Vitals dans les cibles
- [ ] Aucun asset `ASSET_REQUIRES_VALIDATION` dans le build de production
- [ ] `LEGAL_CONTENT_REQUIRES_VALIDATION` remonté au client
- [ ] Aucun secret exposé
- [ ] Aucun débordement horizontal, aucun lien mort
- [ ] Le design paraît intentionnel à chaque breakpoint
- [ ] Build de déploiement et procédure livrés
