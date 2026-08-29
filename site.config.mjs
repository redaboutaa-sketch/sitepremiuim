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
 * ⚠️ SENDER_SPF_REQUIRES_CONFIRMATION — la confirmation du 2026-08-25 portait
 * sur le DESTINATAIRE, pas sur l'expéditeur.
 *
 * Cette adresse est celle que le serveur web présentera en `From:`. Or les
 * deux domaines sont hébergés SÉPARÉMENT — relevé le 2026-08-25 :
 *   ivan-arsenov.de     → 91.184.0.200   (messagerie)
 *   www.ivanarsenov.de  →   2.57.91.91   (serveur web qui enverra)
 *
 * Si le SPF de `ivan-arsenov.de` n'autorise pas 2.57.91.91, les messages du
 * formulaire partiront avec un `From:` que le domaine ne cautionne pas : ils
 * seront classés indésirables ou rejetés. Le formulaire annoncera pourtant un
 * envoi réussi, puisque la remise au serveur, elle, aura fonctionné.
 *
 * À vérifier auprès de l'hébergeur de messagerie AVANT la mise en production.
 * Deux issues acceptables : ajouter le serveur web au SPF, ou faire porter le
 * `sender` par le domaine du SITE (`no-reply@ivanarsenov.de`), dont le SPF est
 * sous le contrôle du même hébergeur que le formulaire.
 */
export const SENDER_EMAIL = 'no-reply@ivan-arsenov.de';
