import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '../../site.config.mjs';

/**
 * `robots.txt` GÉNÉRÉ, plus statique.
 *
 * En dur dans `public/`, il portait sa propre copie du domaine. Au changement
 * d'origine il aurait continué à annoncer l'ancien sitemap — c'est-à-dire à
 * envoyer Google sur un hôte qui ne répond plus, sans qu'aucun test ne
 * s'en aperçoive. Il dérive désormais de la même constante que les
 * canonicals.
 *
 * `prerender` explicite : la sortie est statique, ce fichier est écrit une
 * fois au build.
 */
export const prerender = true;

const STAGING = `# PRÉPRODUCTION — ne pas indexer.
User-agent: *
Disallow: /
`;

const PRODUCTION = `# ${new URL(SITE_ORIGIN).host}
User-agent: *
Allow: /

# La page de démonstration du design system n'existe pas en production,
# mais la règle protège les environnements de préproduction.
Disallow: /styleguide/

Sitemap: ${SITE_ORIGIN}/sitemap-index.xml
`;

export const GET: APIRoute = () =>
  new Response(import.meta.env.PUBLIC_DEPLOY_TARGET === 'staging' ? STAGING : PRODUCTION, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
