# PLAN D'IMPLÉMENTATION — IVAN ARSENOV

> Décomposition en tracer bullets indépendants et testables.
> Chaque TR est implémenté, vérifié et validé **avant** de passer au suivant.
> Aucun patch monolithique.

**Statut global** — en attente de validation SPEC CHECK.

---

## Stack retenue

| Couche | Choix | Justification |
|---|---|---|
| Framework | **Astro 5** | Compile en HTML statique pur → compatible Hostinger sans runtime Node. N'impose aucune esthétique : le CSS reste entièrement sur mesure. i18n natif. Zéro JS par défaut |
| Langage | **TypeScript** | Typage des données catalogue via Content Collections — un produit mal saisi casse le build, pas la page |
| Styles | **CSS natif** (couches + propriétés personnalisées) | Aucun framework utilitaire. Tailwind/shadcn produiraient exactement le rendu générique proscrit par le brief |
| UI | **Composants Astro** | Pas de React : inutile ici, et c'est un coût de performance net |
| Interactions | **TypeScript vanilla** | Filtres, sélection, formulaire, menu — tous réalisables sans framework |
| Animation | **GSAP 3.15 + ScrollTrigger** | Uniquement pour le hero et la séquence horizontale épinglée. Le reste en CSS + IntersectionObserver |
| Transitions de page | **View Transitions** (natif Astro) | Effet premium, coût quasi nul, dégradation propre |
| Images | **`astro:assets`** | AVIF/WebP, tailles responsives, dimensions déclarées → CLS 0 |
| Polices | **Auto-hébergées, sous-jeu** | Aucune requête externe → performance + conformité RGPD |
| Formulaire | **Endpoint PHP durci** sur Hostinger | Seule option serveur disponible en hébergement statique Hostinger |
| QA | **Playwright + Chromium** | Captures multi-points de rupture, erreurs console, audit clavier et contrastes |

### Écartées, et pourquoi

| Technologie | Décision | Motif |
|---|---|---|
| **Three.js** | ❌ Non utilisée | Une scène 3D crédible exigerait des modèles 3D de canettes et bouteilles sous licence, qui n'existent pas. Le résultat serait faux et coûteux. La composition 2D multi-plans produit le même effet avec une fraction du poids. Décision réévaluable si de vrais assets 3D sont fournis |
| **React Bits / Magic UI** | ❌ Non utilisées | Bibliothèques taillées pour Tailwind/shadcn. Le brief interdit explicitement l'assemblage shadcn. Les employer produirait le look générique à éviter |
| **Lenis / smooth scroll** | ❌ Non utilisée | Détourne le scroll natif, dégrade l'accessibilité et l'INP. Le scroll natif est plus rapide et plus respectueux |
| **Tailwind CSS** | ❌ Non utilisée | Pousse vers des solutions par défaut. Le CSS sur mesure est la condition d'un design distinctif |
| **CMS** | ❌ Non utilisée en v1 | Non demandé. Le catalogue vit en fichiers de données versionnés |

---

## Tracer bullets

Dépendances notées `→`. Les TR sans dépendance commune peuvent être menés en parallèle.

---

### TR-001 — Fondation technique
**Dépend de** — aucune · **Couvre** US-012, US-018, US-019

**Objectif** — Un projet Astro qui compile en statique, avec routage bilingue et outillage de qualité.

**Fichiers** — `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.editorconfig`, `src/i18n/`, `README.md`

**Contenu** — Astro 5 + TS strict · i18n EN racine / DE sur `/de/` · `astro:assets` · sitemap · scripts build/preview/QA · `.gitignore` couvrant `node_modules`, `dist`, `.env`

**Acceptation** — `npm run build` produit un `dist/` statique · aucune erreur TS · routage bilingue fonctionnel · aucun secret versionné
**Validation** — build + `npx serve dist` + inspection de l'arborescence de sortie

---

### TR-002 — Design system
**Dépend de** TR-001 · **Couvre** US-014, US-017, US-018

**Objectif** — Traduire `doc/design-direction.md` en fondations CSS, et rien de plus.

**Fichiers** — `src/styles/tokens.css`, `reset.css`, `typography.css`, `layout.css`, `motion.css`, `src/pages/_styleguide.astro`

**Contenu** — Tous les tokens du §2 · échelle typographique fluide · grille et conteneurs · primitives de mouvement + bloc global `prefers-reduced-motion` · polices auto-hébergées sous-jeu · page de style interne (non indexée, retirée du build final)

**Acceptation** — tous les contrastes du §2.1 vérifiés par script · aucune valeur codée en dur hors tokens · `prefers-reduced-motion` neutralise tout mouvement · aucune requête réseau externe
**Validation** — page de style capturée aux 4 points de rupture + script de contraste automatisé

---

### TR-003 — Modèle de données catalogue
**Dépend de** TR-001 · **Couvre** US-002, US-003, US-004, US-005

**Objectif** — Structurer marques, familles et produits en données typées et validées.

**Fichiers** — `src/content.config.ts`, `src/data/brands/`, `src/data/categories/`, `src/data/products/`, `src/lib/catalog.ts`

**Contenu** — Schémas Zod : marque (nom, slug, pays d'origine, statut de validation des droits, asset logo), famille (nom, slug, `--signal`, index, descriptions EN/DE), produit (nom, marque, famille, format, contenance, origine, visuel, statut) · **champ `status: 'confirmed' | 'pending'`** — seuls les `confirmed` sont publiés · 15 marques confirmées par le client saisies en premier

**Acceptation** — build en échec si une donnée est invalide · aucune donnée `pending` ne sort dans `dist/` · aucune marque hors périmètre · aucun champ inventé
**Validation** — build + test de filtrage sur les données de sortie

---

### TR-004 — Pipeline d'assets produits
**Dépend de** TR-003 · **Couvre** US-017, US-018 · **Traite le risque R1**

**Objectif** — Permettre au design de fonctionner **sans** visuels produits, et d'accueillir les vrais sans refonte.

**Fichiers** — `src/components/media/ProductObject.astro`, `BrandMark.astro`, `src/assets/products/`, `doc/assets-guide.md`

**Contenu** — Composant à ratio fixe : si un visuel existe → traitement uniforme (fond détouré, ombre portée, ancrage au filet) ; sinon → **repli typographique composé** (index + nom + famille + teinte `--signal`), volontairement dessiné pour être présentable, jamais un rectangle gris · guide de spécification des assets à transmettre au client (format, fond, résolution, marge)

**Acceptation** — une page mêlant visuels réels et replis reste visuellement cohérente · aucun décalage de mise en page · aucun asset repris du site concurrent
**Validation** — capture comparative 100 % assets / 0 % asset / mixte

---

### TR-005 — Shell : header, navigation, footer
**Dépend de** TR-002 · **Couvre** US-008, US-011, US-012, US-013, US-014

**Objectif** — Le cadre persistant, incluant l'ancrage permanent du CTA principal.

**Fichiers** — `src/layouts/Base.astro`, `src/components/shell/Header.astro`, `Nav.astro`, `LangSwitch.astro`, `Footer.astro`, `MobileNav.astro`, `SkipLink.astro`

**Contenu** — Header transparent au repos, dense au scroll · CTA `Request a Quote` toujours visible · sélecteur EN/DE conservant la page équivalente · menu mobile plein écran avec piégeage du focus · footer portant identité juridique, TVA, contact, liens légaux · lien d'évitement

**Acceptation** — navigation complète au clavier · piégeage et restauration du focus corrects sur le menu mobile · changement de langue sans perte de page · CTA visible sur tous les points de rupture · cibles tactiles ≥ 44 px
**Validation** — parcours clavier intégral + captures des 4 points de rupture

---

### TR-006 — Hero
**Dépend de** TR-002, TR-004, TR-005 · **Couvre** US-001, US-013, US-017, US-018

**Objectif** — Implémenter `THE STAGE` conformément au §3 de la direction artistique.

**Fichiers** — `src/components/home/Hero.astro`, `src/scripts/hero.ts`, `src/styles/hero.css`

**Contenu** — Composition statique HTML/CSS d'abord, animation ajoutée par-dessus · GSAP + ScrollTrigger chargés en différé, uniquement si mouvement autorisé et pointeur fin · parallaxe pointeur amorti ≤ 14 px · dérive `--signal` · variante mobile distincte

**Acceptation** — H1 et CTA lisibles sans JS · statique et composé sous `prefers-reduced-motion` · aucun débordement à 320 px · LCP < 2,5 s · aucune erreur console · pas de saut de mise en page à l'entrée
**Validation** — captures desktop/mobile · test JS désactivé · test reduced-motion · mesure LCP

---

### TR-007 — Homepage : positionnement et familles
**Dépend de** TR-006 · **Couvre** US-001, US-002, US-003, US-006

**Fichiers** — `src/components/home/Positioning.astro`, `Categories.astro`

**Contenu** — Déclaration éditoriale de positionnement (composition asymétrique, aucune icône) · index des familles en filets numérotés, chacune menant au catalogue filtré, chacune portant sa `--signal`

**Acceptation** — aucune affirmation non vérifiée · toutes les familles atteignables en un clic · révélations au scroll neutralisées en reduced-motion
**Validation** — captures + relecture de conformité §1.3 du PRD

---

### TR-008 — Homepage : brand wall et showcase
**Dépend de** TR-007, TR-003 · **Couvre** US-002, US-005, US-017

**Fichiers** — `src/components/home/BrandWall.astro`, `ProductShowcase.astro`, `src/scripts/showcase.ts`

**Contenu** — Mur de marques en grille de filets (§4) · séquence horizontale épinglée, unique sur le site, chaque famille imposant sa `--signal` · sur mobile, défilement horizontal natif à points d'ancrage sans épinglage

**Acceptation** — l'épinglage ne piège jamais le scroll · sortie propre en fin de séquence · fonctionnel au clavier · désactivé en reduced-motion (repli en grille statique) · aucune marque hors périmètre
**Validation** — test de scroll manuel desktop et mobile + reduced-motion + clavier

---

### TR-009 — Homepage : différenciation, process, CTA final
**Dépend de** TR-007 · **Couvre** US-006, US-008, US-010

**Fichiers** — `src/components/home/WhyUs.astro`, `Process.astro`, `CtaBlock.astro`

**Contenu** — Quatre piliers en bénéfices concrets, sans chiffres · parcours en trois temps `Select → Enquire → Offer` (lever l'inquiétude du tunnel e-commerce) · bloc CTA final pleine largeur

**Acceptation** — zéro donnée inventée · les zones manquantes portent `[À FOURNIR — client]` · un seul style de CTA primaire sur la page
**Validation** — relecture éditoriale + audit visuel de la hiérarchie des CTA

---

### TR-010 — Page Our Drinks et filtres
**Dépend de** TR-003, TR-004, TR-005 · **Couvre** US-003, US-004, US-009

**Fichiers** — `src/pages/drinks/index.astro`, `src/components/catalog/`, `src/scripts/filters.ts`

**Contenu** — Catalogue sur `--paper` · filtres cumulables (famille, marque) + recherche instantanée · état synchronisé avec l'URL · filtres en colonne desktop, en tiroir mobile · ajout à la sélection · état vide utile

**Acceptation** — filtrage < 100 ms, CLS 0 · URL partageable et restaurée au retour navigateur · nombre de résultats annoncé en `aria-live` · intégralement clavier · le catalogue reste lisible sans JS (liste complète rendue au build)
**Validation** — test de filtres · audit clavier · test JS désactivé · captures 4 points de rupture

---

### TR-011 — Page Brands
**Dépend de** TR-008, TR-010 · **Couvre** US-005, US-009

**Fichiers** — `src/pages/brands/index.astro`

**Contenu** — Présentation premium des marques confirmées · chaque marque mène au catalogue filtré · ajout à la sélection · pas de pages de marque individuelles en v1 (décision §5 du PRD — risque de contenu pauvre)

**Acceptation** — aucun logo au statut de droits non validé n'est publié · ratios et zones de protection respectés · aucune marque hors périmètre
**Validation** — revue visuelle + contrôle croisé avec le registre des statuts d'assets

---

### TR-012 — About
**Dépend de** TR-005 · **Couvre** US-006, US-007

**Fichiers** — `src/pages/about.astro`

**Contenu** — Présentation courte et factuelle · spécialisation, approche, identité juridique complète · **aucun récit fictif, aucune date, aucun effectif, aucun historique inventé** · zones `[À FOURNIR — client]` explicites

**Acceptation** — chaque affirmation est traçable à une information fournie par le client
**Validation** — relecture ligne à ligne contre §1.3 du PRD

---

### TR-013 — Business Enquiry
**Dépend de** TR-005, TR-010 · **Couvre** US-008, US-009, US-010, US-011, US-016 · **CRITIQUE**

**Fichiers** — `src/pages/enquiry.astro`, `src/components/form/`, `src/scripts/enquiry.ts`, `public/api/enquiry.php`, `doc/form-setup.md`

**Contenu** — Formulaire complet (§US-008) · labels visibles persistants · obligatoires réduits au minimum · pré-remplissage depuis la sélection, éditable · validation au `blur` et à la soumission, jamais pendant la frappe · états chargement / succès / erreur dessinés · endpoint PHP : validation serveur, assainissement, honeypot, contrôle d'horodatage, limitation de débit, en-têtes durcis, `Reply-To` acheteur · consentement RGPD non pré-coché · **configuration hors dépôt**

**Acceptation** — double soumission impossible · saisie conservée en cas d'erreur · succès annoncé et focusé · aucun secret dans le front-end · toutes les erreurs traduites EN/DE · soumission fonctionnelle sans JS (POST classique + page de confirmation)
**Validation** — parcours nominal · parcours erreur réseau · parcours erreur de validation · test clavier · test sans JS · revue de sécurité du PHP

---

### TR-014 — Pages légales
**Dépend de** TR-005 · **Couvre** US-007, US-016

**Fichiers** — `src/pages/impressum.astro`, `privacy.astro`, `terms.astro` (+ équivalents DE)

**Contenu** — Impressum conforme §5 DDG avec les données réelles fournies · politique de confidentialité couvrant le traitement du formulaire · pas de politique cookies si aucun cookie non essentiel n'est posé (objectif) · CGV uniquement si le client les fournit

**Acceptation** — mentions obligatoires complètes · atteignables depuis chaque page · **révision par un juriste signalée comme requise avant mise en production**
**Validation** — contrôle par liste de conformité + note explicite au client

---

### TR-015 — Traduction allemande complète
**Dépend de** TR-006 à TR-014 · **Couvre** US-012

**Fichiers** — `src/i18n/en.ts`, `src/i18n/de.ts`, routes `/de/`

**Contenu** — Parité intégrale, messages d'erreur et métadonnées inclus · terminologie B2B allemande correcte (*Großhandel*, *Anfrage*, *Angebot*) · aucun texte codé en dur

**Acceptation** — aucune clé manquante (vérification au build) · aucune chaîne littérale résiduelle · toutes les pages EN ont leur équivalent DE
**Validation** — script de comparaison des clés + revue visuelle des pages DE

---

### TR-016 — SEO technique
**Dépend de** TR-015 · **Couvre** US-015

**Fichiers** — `src/components/seo/Meta.astro`, `src/lib/schema.ts`, `public/robots.txt`, sitemap généré

**Contenu** — `title`/`description` rédigés par page et par langue · canonical · OG/Twitter avec image dédiée · `hreflang` réciproques + `x-default` · `Organization`, `WholesaleStore`, `BreadcrumbList`, `WebSite` · sitemap bilingue · robots.txt

**Acceptation** — données structurées valides · aucun doublon de `title` ou de `description` · hiérarchie de titres correcte sur chaque page · aucun bourrage de mots-clés
**Validation** — extraction et validation du JSON-LD · audit des métadonnées sur l'ensemble du `dist/`

---

### TR-017 — Passe responsive
**Dépend de** TR-006 à TR-015 · **Couvre** US-013, US-017

**Contenu** — Revue et correction à 320 / 375 / 430 / 768 / 1024 / 1280 / 1440 / 1920 px · réévaluation de l'ordre, de la densité, de la typographie et des cibles tactiles — pas un redimensionnement

**Acceptation** — zéro débordement horizontal · aucun texte < 14 px · cibles ≥ 44 px · le design paraît intentionnel à chaque point de rupture
**Validation** — captures Playwright de toutes les pages à tous les points de rupture + détection automatisée de débordement

---

### TR-018 — Passe accessibilité et performance
**Dépend de** TR-017 · **Couvre** US-014, US-018

**Contenu** — Audit clavier complet · vérification des contrastes en conditions réelles · contrôle de la structure sémantique · optimisation des images · budget JS · préchargement des polices · vérification `prefers-reduced-motion` sur l'ensemble du site

**Acceptation** — WCAG 2.2 AA sur les parcours critiques · LCP < 2,5 s · CLS < 0,1 · INP < 200 ms · aucune erreur console
**Validation** — audit automatisé + parcours clavier manuel de bout en bout + mesure des Core Web Vitals

---

### TR-019 — QA visuelle (6 passes)
**Dépend de** TR-018 · **Couvre** toutes

**Contenu** — PASS 1 structure · PASS 2 design · PASS 3 finition · PASS 4 responsive · PASS 5 conversion · PASS 6 performance/accessibilité. Chaque anomalie est corrigée, puis recapturée.

**Acceptation** — chaque critère de chaque US validé · aucun élément visiblement cassé · aucun lien mort · aucun contenu fictif résiduel
**Validation** — rapport de QA avec captures avant/après

---

### TR-020 — Préparation du déploiement Hostinger
**Dépend de** TR-019 · **Couvre** US-019

**Fichiers** — `doc/deploy-hostinger.md`, `public/.htaccess`

**Contenu** — Build de production · `.htaccess` : HTTPS forcé, canonicalisation www, en-têtes de cache, compression, pages d'erreur, en-têtes de sécurité · procédure d'upload pas à pas · configuration du PHP du formulaire · vérification SPF/DKIM · liste de contrôle post-déploiement

**Acceptation** — `dist/` auto-suffisant, aucune dépendance à Node en production · procédure exécutable sans assistance · aucun secret dans le dépôt
**Validation** — vérification de l'intégrité du build servi localement

> **Note** — le MCP Hostinger n'est pas disponible dans cet environnement : je ne peux
> ni détecter les serveurs, ni téléverser, ni piloter un déploiement. Le livrable est un
> build prêt à déployer accompagné de sa procédure. Après votre upload, je peux valider
> le site public via navigateur (assets, pages, HTTPS, mobile, erreurs réseau, formulaire).

---

## Ordre d'exécution

```
TR-001 ─┬─ TR-002 ─┬─ TR-005 ─┬─ TR-006 ── TR-007 ─┬─ TR-008 ─┐
        │          │          │                    └─ TR-009 ─┤
        └─ TR-003 ─┴─ TR-004 ─┤                               │
                              ├─ TR-010 ── TR-011 ────────────┤
                              ├─ TR-012 ──────────────────────┤
                              ├─ TR-013 ──────────────────────┤
                              └─ TR-014 ──────────────────────┤
                                                              │
        TR-015 ── TR-016 ── TR-017 ── TR-018 ── TR-019 ── TR-020
```

## Definition of Done

Le projet est terminé lorsque **tous** les points ci-dessous sont vérifiés :

- [ ] Toutes les US **P0** satisfaites, tous leurs critères d'acceptation validés
- [ ] Build sans erreur ni avertissement TypeScript
- [ ] Aucune erreur console significative
- [ ] Desktop, laptop, tablette et mobile validés visuellement
- [ ] Navigation, CTA et formulaire testés de bout en bout
- [ ] États chargement / vide / erreur / succès traités
- [ ] WCAG 2.2 AA vérifié sur les parcours critiques
- [ ] `prefers-reduced-motion` respecté sur l'ensemble du site
- [ ] Parité EN/DE complète
- [ ] SEO technique, sitemap et robots.txt en place
- [ ] Core Web Vitals dans les cibles
- [ ] Aucun contenu fictif ou trompeur
- [ ] Aucun secret exposé
- [ ] Aucun débordement horizontal
- [ ] Aucun lien mort
- [ ] Le design paraît intentionnel à chaque point de rupture
- [ ] Build de déploiement et procédure livrés
