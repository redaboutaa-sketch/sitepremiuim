# PRD — IVAN ARSENOV · International Soft Drinks (B2B)

> Source de vérité fonctionnelle du projet. Toute décision d'implémentation doit
> pouvoir être rattachée à une User Story de ce document.

**Version** 1.0 — en attente de validation SPEC CHECK
**Dernière mise à jour** 2026-08-14

---

## 1. Contexte

| | |
|---|---|
| **Entreprise** | Ivan Arsenov Iliev — *IVAN ARSENOV* |
| **Adresse** | Zwischenbrücken 8, 27793 Wildeshausen, Allemagne |
| **E-mail** | info@ivan-arsenov.de — ⚠️ `EMAIL_DOMAIN_REQUIRES_CONFIRMATION` |
| **Domaine web** | www.ivanarsenov.de — **sans tiret** |
| **USt-IdNr** | DE464097303 |
| **St.-Nr.** | 68/120/14293 |
| **Secteur** | Négoce / grossiste B2B |
| ⚠️ **Domaine web ≠ domaine e-mail** | Le site est servi depuis `ivanarsenov.de` (sans tiret), la messagerie fournie par le client est sur `ivan-arsenov.de` (avec tiret). Ce n'est **pas** une incohérence à corriger : les deux sont maintenus séparément dans `site.config.mjs` et ne doivent jamais être dérivés l'un de l'autre. L'adresse ne bougera qu'après confirmation explicite d'Ivan. |
| **Activité** | Fourniture de boissons **non alcoolisées** internationales à des acheteurs professionnels |
| **Cible** | Acheteurs B2B : détaillants, supermarchés, grossistes secondaires, cash & carry, distributeurs export, horeca, stations-service, magasins spécialisés « international food » |
| **Zone** | Base Allemagne — vocation commerciale internationale (UE prioritaire) |
| **Objectif du site** | Générer des **demandes d'offre commerciale B2B qualifiées** |
| **Conversion principale** | `REQUEST A QUOTE` / *Business Enquiry* |
| **Conversion secondaire** | `Explore Our Drinks` (exploration catalogue) — ne doit jamais concurrencer le CTA principal |
| **Langues** | **EN** (canonique, racine) + **DE** (`/de/`, slugs traduits) — confirmé par le client le 2026-08-14 |
| **Benchmark métier** | Handelsplaza Venlo — assortiment, modèle B2B, logique d'enquiry. **Jamais une référence de design** |
| **Hébergement** | Hostinger — déploiement manuel, build statique |

### 1.1 Périmètre

**IN SCOPE — boissons non alcoolisées uniquement**
Carbonated soft drinks · Colas · Lemonades · Energy drinks · Sport drinks · Eaux ·
Eaux aromatisées · Boissons fruitées · Jus · Boissons tropicales · Boissons fonctionnelles ·
Sodas internationaux · Variantes régionales · Saveurs spéciales ·
Boissons *novelty* / sous licence · Concentrates & syrups *(conditionnel — décision D3)*.

**OUT OF SCOPE — à ne créer sous aucune forme**
Alcohol · Beer · Wine · Spirits · Chips · Snacks · Candy en tant que produit alimentaire ·
Coffee · Tea · Transport · Logistics service · News · Blog.

Aucune page, aucun composant, aucune donnée, aucun lien de navigation, aucun mot-clé
ne doit exister pour ces catégories.

**Règle de périmètre par marque** — la présence d'une marque sur le benchmark ne vaut
**pas** autorisation. Certaines marques ne sont admises que pour une partie de leur gamme
(A&W, Bundaberg, Krombacher Spezi, Hero → `brand-level-only` ; Chupa Chups, Mentos,
Squid Game, Toxic Waste → boissons sous licence uniquement). En cas d'ambiguïté sur une
marque ou un SKU → **ne pas intégrer**, et lever une décision client.
Inventaire complet et exclusions : `doc/catalog.md`.

### 1.2 Positionnement

> **Le spécialiste, pas le généraliste.**

Quatre piliers, validés par le client :

1. **Spécialisation exclusive soft drinks** — l'expertise naît du focus, pas du volume de catalogue.
2. **Marques internationales** — grandes marques mondiales, variantes internationales, saveurs rares, références tendances.
3. **Relation B2B directe** — pas de tunnel e-commerce. `Découvrir → identifier → demander une offre`.
4. **Image premium** — professionnel, fiable, international, contemporain, structuré.

### 1.3 Règle de véracité (contrainte bloquante)

Le site **ne doit contenir aucune affirmation commerciale non vérifiée**.

Interdits tant qu'ils ne sont pas explicitement confirmés par écrit par le client :
années d'expérience · quantité de stock · nombre de références · nombre de clients ·
nombre de pays livrés · volumes · nombre de palettes · volume annuel ·
délais de livraison · délai de réponse · prix les plus bas · superlatifs concurrentiels
(« leader », « meilleur prix d'Europe ») · exclusivités · partenariats officiels ·
statut de distributeur agréé · certifications · flotte propre · entrepôt ·
témoignages · logos clients · importation directe.

### `REFERENCE_CATALOG` ≠ `CONFIRMED_CURRENT_STOCK`

Le catalogue de `doc/catalog.md` décrit l'assortiment **cible**, pas le stock réel.

**Interdits à l'affichage** : « In Stock » · « Available Now » · toute quantité disponible ·
toute mention de disponibilité, tant qu'Ivan n'a pas fourni la donnée.
Le champ `availabilityStatus` vaut `TBC` par défaut et **n'est pas rendu** dans ce cas.

Formulations autorisées pour la hiérarchisation des marques : **« Featured Brands »**,
**« Discover the Selection »**. Interdites : « Our best-selling brands », « Top sellers »,
« Most popular » — la sélection des 16 marques prioritaires est une **décision de design**,
pas une donnée commerciale.

Toute zone de contenu manquante est marquée `[À FOURNIR — client]` dans le code et
listée dans le rapport de livraison. **Aucun contenu fictif de remplissage.**

Éléments de confiance **réellement disponibles** et donc utilisables :
identité juridique complète, numéro de TVA intracommunautaire vérifiable (VIES),
adresse physique, spécialisation déclarée, assortiment présenté.

---

## 2. User Stories

Priorités : **P0** = bloquant pour la mise en ligne · **P1** = attendu pour un livrable premium · **P2** = amélioration.

---

### US-001 — Comprendre immédiatement de quoi il s'agit
**P0**

En tant qu'acheteur professionnel arrivant sur la homepage, je veux comprendre en moins de
cinq secondes qu'Ivan Arsenov est un fournisseur B2B spécialisé en boissons non alcoolisées
internationales, afin de décider si je poursuis ma visite.

**Valeur business** — Un acheteur qui ne comprend pas l'offre repart. C'est le premier filtre de qualification.

**Critères d'acceptation**
- Le H1 énonce l'activité et la spécialisation, sans slogan creux ni métaphore.
- La nature **B2B** est explicite au-dessus de la ligne de flottaison (mention « wholesale » / « B2B » / « trade »).
- Le CTA principal est visible sans scroll sur desktop **et** sur mobile 375 px.
- Aucune information critique ne dépend d'une animation pour être lisible : le contenu du hero est intégralement lisible avec JavaScript désactivé et avec `prefers-reduced-motion: reduce`.
- Test : un lecteur externe non briefé décrit correctement l'activité après 5 s d'exposition.

---

### US-002 — Évaluer la pertinence de l'assortiment
**P0**

En tant qu'acheteur, je veux voir rapidement quelles marques et quelles familles de produits
sont disponibles, afin de juger si le fournisseur couvre mes besoins.

**Valeur business** — La reconnaissance de marque est le principal déclencheur de confiance dans le négoce de boissons.

**Critères d'acceptation**
- Des marques identifiables apparaissent sur la homepage sans scroll profond (< 1,5 écran).
- Les familles de produits sont présentées de manière exhaustive et navigables en un clic.
- Chaque famille mène vers le catalogue filtré correspondant.
- Aucune marque hors périmètre (alcool, snack, café, thé sec) n'est présentée.

---

### US-003 — Explorer le catalogue par famille de boissons
**P0**

En tant qu'acheteur, je veux parcourir l'assortiment organisé par famille, afin de découvrir
des références que je ne cherchais pas explicitement.

**Valeur business** — L'exploration augmente le panier de la demande d'offre.

**Critères d'acceptation**
- Page `Our Drinks` listant l'ensemble des références saisies.
- Familles : Carbonated Soft Drinks · Energy Drinks · Water · Juices & Fruit Drinks · Iced Tea & RTD · Functional Drinks · International & Special Editions *(liste finale conditionnée à l'assortiment réel)*.
- Chaque produit affiche au minimum : nom, marque, famille, format/conditionnement s'il est connu.
- Les champs non renseignés ne s'affichent pas (pas de « N/A », pas de valeur inventée).
- Le catalogue reste utilisable et lisible avec 20 comme avec 400 références.

---

### US-004 — Retrouver une marque ou une référence précise
**P1**

En tant qu'acheteur ayant un besoin identifié, je veux filtrer ou chercher directement,
afin de vérifier une disponibilité en quelques secondes.

**Valeur business** — L'acheteur pressé qui ne trouve pas en 15 s va chez un concurrent.

**Critères d'acceptation**
- Filtres cumulables : famille, marque, (origine et format si les données existent).
- Recherche textuelle instantanée sur nom et marque, sans rechargement.
- L'état des filtres est reflété dans l'URL (partageable, indexable, retour navigateur fonctionnel).
- Un état « aucun résultat » utile, proposant de réinitialiser **et** de faire une demande d'offre.
- Filtrage < 100 ms perçu ; aucun décalage de mise en page pendant le filtrage (CLS 0).
- Entièrement opérable au clavier ; le nombre de résultats est annoncé aux lecteurs d'écran (`aria-live`).

---

### US-005 — Percevoir l'étendue des marques
**P1**

En tant qu'acheteur, je veux une vue d'ensemble des marques distribuées, afin de mesurer
la capacité de sourcing du fournisseur.

**Critères d'acceptation**
- Page `Brands` présentant les marques confirmées.
- Chaque marque mène vers le catalogue filtré sur cette marque.
- La présentation ne dégrade pas les identités de marque (pas de déformation, pas de recoloration, ratios respectés, zone de protection respectée).
- Aucune marque hors périmètre.
- Aucun logo dont les droits d'usage n'ont pas été validés (voir §4 Risques).

---

### US-006 — Comprendre pourquoi choisir Ivan Arsenov
**P0**

En tant qu'acheteur sollicité par de nombreux grossistes, je veux comprendre ce qui distingue
Ivan Arsenov, afin de justifier de le contacter plutôt qu'un autre.

**Critères d'acceptation**
- Les quatre piliers de positionnement (§1.2) sont exprimés en bénéfices concrets pour l'acheteur, pas en adjectifs.
- Aucune donnée chiffrée non vérifiée.
- Formulations courtes, vocabulaire du métier, aucune grandiloquence.

---

### US-007 — Vérifier la légitimité de l'entreprise
**P0**

En tant qu'acheteur B2B envisageant une transaction internationale, je veux vérifier
l'existence juridique réelle du fournisseur, afin de réduire mon risque.

**Valeur business** — Dans le négoce transfrontalier, la vérifiabilité juridique est un
critère de sélection de premier ordre, en particulier pour l'autoliquidation de TVA.

**Critères d'acceptation**
- Raison sociale, adresse complète, e-mail, USt-IdNr et St.-Nr. accessibles en deux clics maximum depuis n'importe quelle page.
- Impressum conforme au droit allemand (§5 DDG).
- Le numéro de TVA est affiché de façon lisible et copiable (vérifiable via VIES).
- Aucun label, badge ou certification non fourni par le client.

---

### US-008 — Demander une offre commerciale · **CONVERSION PRINCIPALE**
**P0**

En tant qu'acheteur intéressé, je veux transmettre une demande d'offre structurée,
afin d'obtenir un prix sur les références qui m'intéressent.

**Valeur business** — C'est l'unique objectif de conversion du site. Tout le reste y conduit.

**Critères d'acceptation**
- Le CTA principal `Request a Quote` est présent et visuellement dominant dans : header, hero, page catalogue, page marques, section commerciale, CTA final, footer.
- Un seul style de CTA primaire sur tout le site ; le CTA secondaire est nettement subordonné (pas de deux boutons de poids égal).
- Champs : First Name, Last Name, Company, Country, E-mail, Phone, VAT Number, Products/Brands of interest, Expected volume, Message.
- Champs **obligatoires** limités à : First Name, Last Name, Company, Country, E-mail, Message. Tout le reste est facultatif et explicitement marqué comme tel.
- Chaque champ possède un `<label>` visible et persistant (pas de placeholder en guise de label).
- Validation côté client **non bloquante** : les erreurs apparaissent au `blur` et à la soumission, jamais pendant la frappe initiale.
- Messages d'erreur spécifiques, en langage humain, liés au champ (`aria-describedby`), et le focus va au premier champ en erreur.
- Validation et assainissement côté serveur ; aucune confiance accordée au client.
- Protection anti-spam sans CAPTCHA : honeypot + horodatage + limitation de débit.
- Aucun secret, aucune clé, aucune adresse technique exposée dans le front-end.
- Fonctionne sur Hostinger en hébergement statique + PHP.

---

### US-009 — Pré-sélectionner des produits avant la demande
**P1**

En tant qu'acheteur ayant repéré plusieurs références pendant ma navigation, je veux les
joindre à ma demande sans les recopier, afin de gagner du temps et d'être précis.

**Valeur business** — Une demande précise est qualifiée : elle raccourcit le cycle commercial
et augmente le taux de réponse.

**Critères d'acceptation**
- Depuis le catalogue et la page marques, on peut ajouter une marque ou un produit à une sélection.
- La sélection persiste pendant la navigation (`sessionStorage`) et se pré-remplit dans le formulaire.
- Un indicateur discret et permanent montre le nombre d'éléments sélectionnés et mène au formulaire.
- La sélection est éditable dans le formulaire (retrait unitaire) et modifiable en texte libre.
- La fonctionnalité est strictement optionnelle : le formulaire reste pleinement utilisable sans elle, et sans JavaScript.
- Aucun vocabulaire e-commerce (« panier », « ajouter au panier », « commander ») — c'est une liste d'intérêt, pas un achat.

---

### US-010 — Être rassuré après l'envoi
**P0**

En tant qu'acheteur venant d'envoyer une demande, je veux une confirmation explicite et
savoir ce qui se passe ensuite, afin de ne pas douter ni renvoyer le formulaire.

**Critères d'acceptation**
- État de chargement pendant l'envoi ; double soumission impossible.
- Confirmation de succès claire, sur la page, rappelant l'e-mail saisi et le délai de réponse annoncé `[À FOURNIR — client : délai de réponse à confirmer]`.
- État d'erreur explicite avec recours immédiat (adresse e-mail directe), et **conservation des données saisies**.
- La confirmation est annoncée aux technologies d'assistance et reçoit le focus.
- Une confirmation par e-mail à l'acheteur est prévue si le client la souhaite (décision §5).

---

### US-011 — Contacter directement, sans formulaire
**P1**

En tant qu'acheteur qui préfère le contact direct, je veux une adresse e-mail cliquable
et un téléphone, afin de contacter l'entreprise par mon canal habituel.

**Critères d'acceptation**
- `info@ivan-arsenov.de` cliquable (`mailto:`) dans le footer et sur la page contact.
- Téléphone cliquable (`tel:`) si fourni — `[À FOURNIR — client : numéro de téléphone commercial]`.
- Ces contacts ne concurrencent pas visuellement le CTA principal.

---

### US-012 — Consulter le site dans ma langue
**P1**

En tant qu'acheteur allemand ou international, je veux le site en allemand ou en anglais,
afin de comprendre l'offre sans friction.

**Critères d'acceptation**
- Parité **totale** EN/DE : aucune page, aucune section, aucun message d'erreur non traduit.
- L'anglais est la langue **canonique** de rédaction ; l'allemand est une **adaptation professionnelle**, pas une traduction mot-à-mot (`Request a Quote` → `Angebot anfragen`, `Explore Our Drinks` → `Getränkesortiment entdecken`).
- Les H1/H2 sont **réécrits** pour sonner juste en allemand commercial, pas transposés littéralement.
- Terminologie B2B allemande correcte : *Großhandel · Anfrage · Angebot · Sortiment*.
- Sélecteur de langue accessible depuis toutes les pages, indiquant la langue courante.
- Le changement de langue conserve la page équivalente (pas de retour à l'accueil).
- URLs distinctes et statiques, **slugs traduits** : `/drinks/` ↔ `/de/getraenke/`.
- `hreflang` réciproques + `x-default` ; `<html lang>` correct.
- Aucun texte codé en dur hors des fichiers de traduction.

---

### US-013 — Utiliser le site sur mobile en conditions réelles
**P0**

En tant qu'acheteur consultant depuis un salon professionnel ou un entrepôt, je veux une
expérience mobile pensée pour le mobile, afin de pouvoir explorer et envoyer une demande.

**Critères d'acceptation**
- Conception spécifique à 320–767 px : ordre des blocs, densité, typographie, navigation et images réévalués — pas un simple redimensionnement.
- Zéro débordement horizontal à 320, 360, 390 et 430 px.
- Cibles tactiles ≥ 44 × 44 px, espacées d'au moins 8 px.
- Le CTA principal reste atteignable sans chasse au scroll.
- Le formulaire utilise les bons types de clavier (`email`, `tel`) et l'autocomplétion (`autocomplete`).
- Les séquences animées lourdes sont remplacées sur mobile par des équivalents statiques ou allégés.

---

### US-014 — Accéder au site avec un clavier ou un lecteur d'écran
**P0**

En tant qu'utilisateur naviguant au clavier ou avec un lecteur d'écran, je veux accéder à
l'intégralité du contenu et de la conversion, afin de ne pas être exclu.

**Critères d'acceptation** — cible **WCAG 2.2 AA**
- Structure sémantique : un seul `<h1>` par page, hiérarchie de titres sans saut, repères `header`/`nav`/`main`/`footer`.
- Contraste ≥ 4,5:1 pour le texte, ≥ 3:1 pour le texte large et les éléments d'interface.
- Focus visible, à fort contraste, sur **tous** les éléments interactifs — jamais supprimé.
- Lien d'évitement vers le contenu principal.
- Navigation, filtres, sélection, menu mobile et formulaire intégralement opérables au clavier, dans un ordre logique.
- `alt` pertinent sur les images informatives ; `alt=""` sur le décoratif.
- ARIA employé uniquement là où le HTML natif ne suffit pas.
- `prefers-reduced-motion: reduce` respecté partout : aucun mouvement automatique, aucun parallaxe, aucun défilement détourné.

---

### US-015 — Trouver Ivan Arsenov via une recherche
**P1**

En tant qu'acheteur cherchant un fournisseur, je veux trouver le site via un moteur de
recherche, afin de découvrir l'entreprise sans la connaître.

**Critères d'acceptation**
- `title` et `meta description` uniques, rédigés, par page et par langue.
- **Canonical auto-référente sur chaque page, dans les deux langues.** Une page DE canonicalise vers elle-même, **jamais** vers son équivalent EN — l'anglais est la langue source éditoriale, ce qui ne lui confère aucun statut canonique en SEO. Canonicaliser DE → EN désindexerait la version allemande.
- Les variantes sont reliées **uniquement** par `hreflang` réciproques : chaque page déclare `en`, `de` et elle-même. `x-default` → EN.
- OpenGraph et Twitter Card complets avec image dédiée.
- `sitemap.xml` incluant les deux langues ; `robots.txt` valide.
- Données structurées Schema.org : `Organization` + `WholesaleStore` (ou `LocalBusiness` selon arbitrage), `BreadcrumbList`, `WebSite`.
- URLs propres, en minuscules, sans paramètre superflu.
- Aucun bourrage de mots-clés ; le texte est écrit pour un acheteur, pas pour un robot.

---

### US-016 — Conformité légale allemande et RGPD
**P0**

En tant qu'exploitant du site, je veux être conforme au droit allemand et au RGPD,
afin d'éviter mise en demeure (*Abmahnung*) et sanction.

**Critères d'acceptation**
- Impressum conforme §5 DDG, atteignable depuis chaque page.
- Politique de confidentialité couvrant le traitement des données du formulaire (finalité, base légale, durée, droits, responsable).
- **Fait technique vérifiable, sans conclusion juridique** : polices auto-hébergées, aucune ressource externe, aucun tracker, aucun cookie tiers, aucun identifiant publicitaire dans la configuration livrée.
- La page Cookies **décrit** l'usage technique du stockage (dont le `sessionStorage` de l'enquiry list) et **ne conclut pas** sur le régime de consentement applicable. Toute qualification — exemption, obligation de bannière, base légale — relève de `LEGAL_CONTENT_REQUIRES_VALIDATION` (D9) et doit être arrêtée par le conseil juridique d'Ivan Arsenov.
- Aucune donnée personnelle transmise à un tiers hors UE par la configuration livrée.
- Case de consentement explicite, non pré-cochée, sur le formulaire, renvoyant à la politique de confidentialité.
- Transport chiffré (HTTPS) exigé en production.

---

### US-017 — Ressentir une marque premium
**P1**

En tant que visiteur, je veux percevoir dès les premières secondes une qualité supérieure
à celle des sites de grossistes habituels, afin d'associer Ivan Arsenov au haut de gamme.

**Valeur business** — La qualité perçue du site est un substitut de la qualité perçue du
partenaire commercial. C'est le différenciateur explicitement demandé par le client.

**Critères d'acceptation**
- Le hero produit un effet mémorable sans recourir aux clichés interdits (gradient SaaS, glassmorphism, glow, entrepôt en photo de stock, grille de logos plate, image à droite).
- Cohérence stricte de la typographie, de l'espacement et du mouvement sur toutes les pages.
- Le mouvement sert la compréhension et la hiérarchie ; il ne se substitue jamais au contenu.
- Chaque état interactif (hover, focus, actif, chargement, vide, erreur, succès) est dessiné — aucun état par défaut du navigateur.
- Le design paraît intentionnel à chaque point de rupture, mobile compris.

---

### US-018 — Charger vite, même en 4G
**P1**

En tant qu'acheteur en déplacement, je veux un site rapide, afin de ne pas abandonner.

**Critères d'acceptation** — mesuré au build et en conditions simulées
- LCP < 2,5 s · CLS < 0,1 · INP < 200 ms.
- Images en AVIF/WebP, dimensionnées, responsives, `width`/`height` déclarés, `lazy` hors premier écran.
- Polices auto-hébergées, sous-jeu de caractères, `preload` de la police critique, `font-display: swap`, aucune requête externe.
- JavaScript chargé uniquement sur les pages qui en ont besoin, en différé.
- Aucune erreur console significative.
- Le site reste lisible et navigable si le JavaScript échoue.

---

### US-019 — Livrer et déployer sans surprise
**P1**

En tant que responsable du site, je veux un livrable déployable manuellement sur Hostinger,
afin de mettre en ligne sans dépendre du prestataire.

**Critères d'acceptation**
- `npm run build` produit un dossier statique auto-suffisant, uploadable dans `public_html`.
- Aucune dépendance à un runtime Node en production.
- Procédure de déploiement documentée pas à pas (upload, PHP du formulaire, HTTPS, redirection www, cache).
- Aucun secret versionné ; la configuration sensible du formulaire est isolée hors dépôt.

---

### US-020 — Rester pleinement utilisable sans animation
**P0**

En tant qu'utilisateur sensible au mouvement, ou dont le système réduit les animations,
je veux une expérience complète et esthétique sans mouvement, afin de ne subir ni inconfort
ni perte de contenu.

**Valeur business** — Le site repose fortement sur le mouvement. Si la version réduite est
un repli dégradé, une part des visiteurs voit un site médiocre. Ce n'est pas acceptable
pour un livrable premium.

**Critères d'acceptation**
- Sous `prefers-reduced-motion: reduce` : aucun parallaxe, aucun épinglage, aucun mouvement automatique, aucun défilement cinématique, aucune rotation.
- Le hero s'affiche dans sa **composition finale, immédiatement** — et cette composition est **dessinée pour être belle à l'arrêt**, pas subie comme un repli.
- Aucun contenu, aucune information, aucun CTA n'est perdu ou rendu inaccessible.
- Les transitions de page sont neutralisées.
- Le site reste entièrement fonctionnel et composé **sans JavaScript** : hero, navigation, catalogue et formulaire opérationnels.
- `Add to Enquiry` disparaît proprement sans JS ; le formulaire reste utilisable via son champ de texte libre.
- Vérifié section par section, sur l'ensemble des pages, en TR-018.

---

### US-021 — Sélectionner des produits pendant l'exploration
**P1** · *complète US-009 — spécification UX détaillée en `doc/content-architecture.md` §9*

En tant qu'acheteur explorant le catalogue, je veux constituer une liste des références qui
m'intéressent au fil de ma navigation, afin d'envoyer une demande précise sans rien recopier.

**Critères d'acceptation**
- `+ Add to Enquiry` sur les cartes marque et produit ; bascule avec `aria-pressed` ; retrait par re-clic.
- Visible au survol **et au focus clavier** sur desktop ; toujours visible sur tactile.
- Compteur discret dans le header (desktop) ; barre inférieure apparaissant uniquement si `count > 0` (mobile).
- Panneau latéral : liste, retrait unitaire, `Clear all`, CTA `Request Quote` ; piégeage du focus, `Esc`, focus restauré.
- La sélection pré-remplit *Products / Brands of Interest* sous forme de puces retirables + texte libre éditable.
- Persistance en `sessionStorage` — jamais `localStorage`. Stockage **limité à la session de navigation**, sans intention de persistance entre sessions ; ne contient que des identifiants de marques et produits choisis par l'utilisateur ; n'est transmis à aucun serveur avant l'envoi du formulaire. **Aucune qualification juridique n'est portée par le produit** (voir US-016).
- **Lexique strictement non e-commerce** : jamais *cart*, *basket*, *order*, *checkout*, *buy*. Aucun sélecteur de quantité, aucun prix, aucun total.
- Amélioration progressive : sans JS, la fonctionnalité disparaît sans casser la conversion.

---

## 3. Hors périmètre v1

Explicitement exclus, à ne pas implémenter : e-commerce, prix publics, comptes clients,
suivi de commande, News, Blog, Transport, Chips & Snacks, Coffee, Tea, CMS,
pages de marque individuelles (voir §5), langues autres que EN/DE.

## 4. Risques

| # | Risque | Impact | Traitement |
|---|---|---|---|
| R1 | **Aucun visuel produit ne peut être fourni légalement pour l'instant** | **Critique** — toute la direction artistique repose sur les produits comme source de couleur | Système de « slots » d'assets : le design fonctionne dès la v1 avec un traitement typographique/silhouette, et accepte les vrais visuels en remplacement direct sans refonte |
| R2 | Droits d'usage des logos et visuels de marque (Coca-Cola, Red Bull…) | Élevé — juridique | L'usage référentiel par un distributeur réel est généralement admis, mais **doit être validé par le client / son conseil** avant mise en production. Aucun asset de marque n'est repris du site concurrent |
| R3 | **`REFERENCE_CATALOG` ≠ stock réel** — les 62 marques décrivent l'assortiment cible, pas la disponibilité d'Ivan | Élevé | Aucune mention de stock, de disponibilité ni de quantité. `availabilityStatus: TBC` par défaut et non rendu. Le catalogue sert à démontrer l'assortiment cible, ce qui est légitime, à condition de ne rien affirmer |
| R7 | **Marques sous licence tierce** (Squid Game, Chupa Chups, Mentos, Toxic Waste) — sensibilité supérieure aux marques de boissons classiques | Moyen | Traitées à part dans le registre d'assets, validation distincte requise avant production |
| R8 | **Marques à périmètre partiel** — A&W, Bundaberg, Krombacher Spezi, Hero : seule une partie de la gamme est dans le scope | Moyen | `skuPolicy: 'brand-level-only'` appliqué par le schéma : toute saisie d'un `productName` sur ces marques **fait échouer la validation du catalogue**. XXL Nutrition retirée jusqu'à confirmation (D6) |
| R4 | Aucun témoignage, référence client ni chiffre vérifiable | Moyen — conversion | Aucune preuve sociale fabriquée. La crédibilité repose sur l'identité juridique vérifiable. Gap documenté et remonté au client |
| R5 | Envoi d'e-mail depuis Hostinger (délivrabilité, SPF/DKIM) | Moyen | Envoi depuis un expéditeur du domaine avec `Reply-To` acheteur ; vérification SPF/DKIM documentée dans la procédure de déploiement |
| R6 | Pas de téléphone commercial fourni | Faible | Le canal e-mail suffit à la v1 ; champ prévu, à activer dès réception |

## 5. Décisions client

### Tranchées

| | Décision | Arbitrage |
|---|---|---|
| **D1** | Langues | ✅ **EN source éditoriale + DE** — confirmé le 2026-08-14. Canonical auto-référente dans les deux langues |
| **D2** | Marques tierces | ✅ **Usage référentiel assumé** en tant que distributeur réel + mention de non-affiliation en footer |
| **D3** | Dairy / Protein Drinks | ✅ **NON** — Barebells, Chocomel, Fristi, Optimel, Pınar non intégrées. Positionnement 100 % Soft Drinks préservé |
| **D4** | Concentrates & Syrups | ✅ **NON en V1** — Karvan Cévitam, RAAK, Slimpie exclues. **Cinq familles, pas six** |
| **D5** | Arizona | ✅ **EXCLUE** — non réintégrable en V1 |
| **D6** | XXL Nutrition | ✅ **RETIRÉE** jusqu'à confirmation de la liste des SKU prêts à boire |
| **D7** | **8 marques `brand-level-only`** — publiées au niveau marque uniquement, aucun SKU affiché tant que les références admises ne sont pas confirmées. Contrainte appliquée par le schéma | ✅ **Périmètre partiel de gamme** (2026-08-14) : A&W · Bundaberg · Krombacher Spezi · Hero. **Licence tierce** (extension approuvée le 2026-08-15) : Chupa Chups · Mentos · Squid Game · Toxic Waste — afficher un SKU non confirmé y reviendrait à présenter une confiserie comme une boisson |

> ⛔ **Décomptes périmés depuis le 2026-08-24.** Le catalogue a été réduit de 62
> marques à 14 articles sur décision du propriétaire, et les familles sont
> passées de 5 à 4. Voir `doc/tr-028-catalogue-reduction.md`. Restauration :
> branche `backup/catalogue-62-brands-full`, commit `5966e32`.

**Catalogue V1 : 62 marques publiables** — 26 Carbonated · 11 Energy & Sport · 8 Water · 13 Juice & Fruit · 4 International.

### En attente — bloquantes pour la production

| | Décision | Recommandation |
|---|---|---|
| **D8** | **Assets produits** — logos officiels et packshots détourés | Prioriser les 6 du hero + les 16 marques *featured*. Voir `doc/assets-guide.md` (TR-004) |
| **D9** | **Contenu légal** — `LEGAL_CONTENT_REQUIRES_VALIDATION`. Impressum, Privacy et Cookies doivent être adaptés à l'entité allemande | **Revue juridique obligatoire avant mise en production.** Ne jamais copier les documents du benchmark |
| **D10** | **SEO** — formulations finales et ciblage géographique | À valider avant publication ; aucun marché inventé |

### En attente — non bloquantes

| | Décision | Défaut appliqué |
|---|---|---|
| **D11** | **H1 du hero** | ✅ **Tranchée** — variante A : *« Soft drinks without borders. »* |
| **D12** | **Téléphone commercial** | Non publié tant qu'il n'est pas fourni |
| **D13** | **Délai de réponse** | **Aucun délai promis** — le processus s'arrête à « Let's talk business » |
| **D14** | **Accusé de réception automatique** à l'acheteur | Non implémenté par défaut ; ajout simple si souhaité |
| **D15** | **Pages de marque individuelles** | Écartées en v1 (contenu insuffisant → pages pauvres). Fort potentiel SEO en v2 |
| **D16** | **Terms & Conditions** | Page non créée tant qu'Ivan ne fournit pas de CGV |
| **D17** | **Analytics** | Aucune — donc **aucune bannière cookie**. Activable sur demande avec une solution respectueuse de la vie privée |
