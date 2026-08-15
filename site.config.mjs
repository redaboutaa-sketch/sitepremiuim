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
 * ⚠️ EMAIL_DOMAIN_REQUIRES_CONFIRMATION
 *
 * Adresse telle que fournie par le client, sur `ivan-arsenov.de` (avec
 * tiret) — soit un domaine DIFFÉRENT de celui du site. Volontairement non
 * dérivée de `SITE_APEX`.
 *
 * Ne pas modifier sans confirmation explicite d'Ivan. Une adresse de contact
 * fausse dans un pied de page B2B, c'est une demande d'offre qui n'arrive
 * jamais — le coût d'une supposition ici est direct.
 */
export const CONTACT_EMAIL = 'info@ivan-arsenov.de';

/** Expéditeur technique du formulaire — même réserve que ci-dessus. */
export const SENDER_EMAIL = 'no-reply@ivan-arsenov.de';
