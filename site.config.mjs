/**
 * SOURCE DE VÉRITÉ UNIQUE — identité réseau du site.
 *
 * Ce fichier existe parce que l'origine était déclarée à HUIT endroits
 * indépendants : `astro.config.mjs` (deux fois), `src/i18n/config.ts`,
 * `public/robots.txt`, `public/.htaccess`, `src/data/company.ts` et deux
 * scripts de QA. Un simple search/replace aurait corrigé le domaine
 * aujourd'hui et laissé la divergence revenir au premier oubli.
 *
 * Il est en `.mjs` volontairement : c'est le seul format que peuvent importer
 * À LA FOIS `astro.config.mjs`, les scripts Node de QA, et les modules
 * TypeScript de `src/`. Un `.ts` obligerait les deux premiers à recopier la
 * valeur — c'est-à-dire à recréer le problème.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * DOMAINE WEB ≠ DOMAINE E-MAIL
 *
 * Les deux sont séparés ci-dessous, délibérément, et ne doivent JAMAIS être
 * dérivés l'un de l'autre. Le site est servi depuis `ivanarsenov.de` ; la
 * boîte fournie par le client est `info@ivan-arsenov.de`, avec un tiret.
 * Ce n'est pas une incohérence à corriger : une entreprise peut parfaitement
 * héberger son site sur un domaine et sa messagerie sur un autre. Tant
 * qu'Ivan n'a pas confirmé, l'adresse reste telle qu'il l'a donnée.
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Les deux domaines du client. Le site est servi depuis L'UN des deux ;
 * l'autre ne doit alors apparaître dans AUCUNE URL de l'artefact — seulement
 * dans les adresses e-mail. `qa-artifact.mjs` le vérifie fichier par fichier.
 */
export const KNOWN_APEXES = ['ivanarsenov.de', 'ivan-arsenov.de'];

/**
 * Hôte canonique servi en production.
 *
 * ✅ ARBITRÉ LE 2026-10-10 PAR LE PROPRIÉTAIRE : le domaine principal est
 * `www.ivan-arsenov.de` (AVEC tiret). `ivanarsenov.de` devient secondaire et
 * ne sert plus de contenu — il redirige intégralement vers celui-ci
 * (`scripts/build-redirect.mjs`).
 *
 * Effet de bord utile de cet arbitrage : le domaine du site et celui de la
 * messagerie coïncident enfin. `CONTACT_EMAIL` reste malgré tout écrit en
 * dur, et le contrôle « adresse déduite du domaine web » reste en place —
 * la coïncidence est constatée, pas exploitée.
 *
 * Surchargeable par la variable d'environnement `SITE_HOST` : tout en découle
 * — canonicals, hreflang, sitemap, robots, `.htaccess`, préproduction — donc
 * une seule valeur à changer, jamais huit.
 *
 *     SITE_HOST=www.ivanarsenov.de npm run build
 *
 * ⚠️ Changer d'hôte n'est PAS une opération anodine : les deux sites
 * serviraient le même contenu et se concurrenceraient à l'indexation. Décider
 * lequel est canonique AVANT d'en publier un second.
 */
export const SITE_HOST = process.env.SITE_HOST?.trim() || 'www.ivan-arsenov.de';

/** Domaine nu, sans sous-domaine. Sert aux redirections et à la doc. */
export const SITE_APEX = SITE_HOST.replace(/^www\./, '');

/**
 * L'autre domaine du client — celui depuis lequel le site n'est PAS servi.
 * Dérivé, jamais saisi : saisi, il finirait par désigner le domaine courant
 * après un changement d'hôte, et le contrôle s'inverserait en silence.
 */
export const FOREIGN_APEX = KNOWN_APEXES.find((a) => a !== SITE_APEX) ?? null;

/** Origine canonique. Toute URL absolue du site en découle. */
export const SITE_ORIGIN = `https://${SITE_HOST}`;

/**
 * Hôte de préproduction. Non indexable, exclu du sitemap public.
 * Voir `doc/deploy-hostinger.md` §10.
 */
export const STAGING_HOST = `staging.${SITE_APEX}`;

/**
 * ✅ DOMAINE DE MESSAGERIE CONFIRMÉ — 2026-08-25, par le propriétaire.
 *
 * `info@ivan-arsenov.de` (AVEC tiret) est bien la boîte destinataire, alors
 * que le site vit sur `ivanarsenov.de` (sans tiret). Les deux domaines sont
 * DIFFÉRENTS, et c'est voulu.
 *
 * L'adresse reste volontairement non dérivée de `SITE_APEX`. Ne pas
 * l'« harmoniser » : une adresse de contact fausse dans un pied de page B2B,
 * c'est une demande d'offre qui n'arrive jamais.
 */
export const CONTACT_EMAIL = 'info@ivan-arsenov.de';

/**
 * Expéditeur technique du formulaire — arbitré le 2026-08-25.
 *
 * DÉRIVÉ de `SITE_APEX`, et c'est la règle de fond : l'expéditeur doit
 * appartenir au domaine dont le SPF couvre LE SERVEUR QUI ENVOIE — or ce
 * serveur est celui du site. Écrire l'adresse en dur la rendrait fausse au
 * premier changement d'hôte, sans que rien ne proteste.
 *
 * Le destinataire, lui, n'est JAMAIS dérivé : il reste `info@ivan-arsenov.de`
 * tel que le client l'a donné.
 *
 * Relevé du 2026-08-25 :
 *   ivan-arsenov.de     → 91.184.0.200   (messagerie Hostnet — reçoit)
 *   www.ivanarsenov.de  →   2.57.91.91   (serveur web Hostinger — envoie)
 *
 * SPF lu directement dans le DNS le 2026-08-29 :
 *   TXT ivanarsenov.de    → "v=spf1 a ~all"
 *   TXT ivan-arsenov.de   → "v=spf1 a mx include:_spf.hostnet.nl -all"
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ⛔ POINT BLOQUANT OUVERT DEPUIS LE CHANGEMENT DE DOMAINE PRINCIPAL
 *   (2026-10-10 — à vérifier AVANT de compter sur le formulaire)
 *
 * L'expéditeur suit désormais le nouvel hôte : `no-reply@ivan-arsenov.de`.
 * Or la politique SPF de CE domaine se termine par `-all`, c'est-à-dire un
 * REJET DUR et non un simple filtrage. Si l'IP du serveur Hostinger qui
 * envoie n'est couverte par aucun de ses mécanismes, les demandes d'offre
 * ne partiront pas en indésirable : elles seront REFUSÉES, sans trace pour
 * le prospect ni pour Ivan.
 *
 * Ce qui décide : le mécanisme `a` résout l'enregistrement A de
 * `ivan-arsenov.de` NU (sans `www`).
 *   • s'il pointe sur le serveur web Hostinger → couvert, rien à faire ;
 *   • s'il pointe encore sur Hostnet (91.184.0.200) alors que seul `www`
 *     a été basculé → NON couvert, et le formulaire est muet.
 *
 * Ce point n'est PAS vérifiable depuis cette session : la sortie DNS y est
 * fermée (même `example.com` échoue). À contrôler sur une machine ouverte :
 *   dig +short A ivan-arsenov.de        # doit nommer l'IP qui envoie
 *   dig +short TXT ivan-arsenov.de
 * Correctif, le cas échéant : ajouter `ip4:<IP Hostinger>` au SPF
 * d'`ivan-arsenov.de`. Ne PAS remplacer `-all` par `~all` pour contourner :
 * ce serait affaiblir la protection du domaine de messagerie pour masquer
 * une IP manquante.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * ⚠️ Reste à constater `spf=pass` sur un ENVOI RÉEL. Sur un mutualisé,
 * `mail()` peut sortir par un relais d'IP différente ; le cas échéant,
 * l'en-tête `Received:` la nomme et il suffit de l'ajouter en `ip4:`.
 *
 * `enquiry.php` met déjà l'adresse du prospect en `Reply-To`, jamais en
 * `From` : répondre à une demande d'offre renvoie donc bien au prospect, et
 * cette boîte « no-reply » n'a pas besoin d'être relevée.
 */
export const SENDER_EMAIL = `no-reply@${SITE_APEX}`;
