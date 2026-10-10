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
 * Surchargeable par la variable d'environnement `SITE_HOST` : le client
 * possède deux domaines et peut vouloir servir le site depuis l'un ou
 * l'autre. Tout en découle — canonicals, hreflang, sitemap, robots,
 * `.htaccess`, préproduction — donc une seule valeur à changer, jamais huit.
 *
 *     SITE_HOST=www.ivan-arsenov.de npm run build
 *
 * ⚠️ Changer d'hôte n'est PAS une opération anodine : les deux sites
 * serviraient le même contenu et se concurrenceraient à l'indexation. Décider
 * lequel est canonique AVANT d'en publier un second.
 */
export const SITE_HOST = process.env.SITE_HOST?.trim() || 'www.ivanarsenov.de';

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
 *   ivan-arsenov.de     → 91.184.0.200   (messagerie — reçoit)
 *   www.ivanarsenov.de  →   2.57.91.91   (serveur web — envoie)
 *
 * ✅ SPF PUBLIÉ ET VÉRIFIÉ le 2026-08-29, lu directement dans le DNS :
 *   TXT ivanarsenov.de → "v=spf1 a ~all"   (1 enregistrement, 1 segment,
 *   13 octets — pas de guillemet littéral, pas de doublon)
 * Le mécanisme `a` désigne 2.57.91.91, soit exactement le serveur qui envoie.
 *
 * Ce que la vérification a confirmé au passage : `ivan-arsenov.de` publie
 * `v=spf1 a mx include:_spf.hostnet.nl -all`. Sa messagerie est chez Hostnet
 * et sa politique est un REJET DUR. Le serveur web Hostinger n'y figure pas —
 * un expéditeur sur ce domaine aurait donc été rejeté, pas seulement filtré.
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
