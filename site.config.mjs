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

/** Hôte canonique servi en production. */
export const SITE_HOST = 'www.ivanarsenov.de';

/** Domaine nu, sans sous-domaine. Sert aux redirections et à la doc. */
export const SITE_APEX = 'ivanarsenov.de';

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
 * Porté par le domaine du SITE, et non par celui de la messagerie. C'est le
 * seul des deux dont l'enregistrement SPF dépend du même hébergeur que ce
 * formulaire, donc le seul directement modifiable. Le destinataire, lui, reste
 * sur `ivan-arsenov.de` : les deux domaines cohabitent, chacun dans son rôle.
 *
 * Relevé du 2026-08-25 :
 *   ivan-arsenov.de     → 91.184.0.200   (messagerie — reçoit)
 *   www.ivanarsenov.de  →   2.57.91.91   (serveur web — envoie)
 *
 * ⚠️ CE CHOIX NE SUFFIT PAS À LUI SEUL. Il rend le SPF modifiable ; il ne le
 * configure pas. Il reste à publier, sur `ivanarsenov.de`, un enregistrement
 * SPF autorisant le serveur d'envoi Hostinger. Sans lui, SPF renvoie « none »
 * — neutre, pas conforme — et une partie des destinataires classera les
 * messages en indésirable.
 *
 * `enquiry.php` met déjà l'adresse du prospect en `Reply-To`, jamais en
 * `From` : répondre à une demande d'offre renvoie donc bien au prospect, et
 * cette boîte « no-reply » n'a pas besoin d'être relevée.
 */
export const SENDER_EMAIL = 'no-reply@ivanarsenov.de';
