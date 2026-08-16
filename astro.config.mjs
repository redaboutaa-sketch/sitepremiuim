// @ts-check
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { SITE_HOST, SITE_ORIGIN, STAGING_HOST } from './site.config.mjs';

/**
 * Cible du build. `staging` produit un artefact NON INDEXABLE servi depuis
 * `staging.<apex>`, avec sa propre canonicalisation d'hôte.
 */
const TARGET = process.env.DEPLOY_TARGET === 'staging' ? 'staging' : 'production';
const HOST = TARGET === 'staging' ? STAGING_HOST : SITE_HOST;

/**
 * STRATÉGIE DE CANONICALISATION EN PRÉPRODUCTION — décision explicite.
 *
 * Les URL absolues restent celles de la PRODUCTION, y compris sur le build de
 * préproduction. C'est intentionnel et sûr uniquement parce que la
 * préproduction est rendue non indexable par trois moyens cumulés :
 *   - `X-Robots-Tag: noindex, nofollow` sur toutes les réponses (.htaccess) ;
 *   - `<meta name="robots" content="noindex, nofollow">` dans le <head> ;
 *   - `robots.txt` en `Disallow: /`.
 * Aucune URL de préproduction ne peut donc entrer dans l'index, et les
 * canonicals n'ont jamais l'occasion d'être interprétées.
 *
 * L'alternative — canonicals auto-référentes sur l'hôte de préproduction —
 * obligerait à faire dépendre `src/i18n/config.ts` d'une variable
 * d'environnement, donc à la faire entrer dans les bundles client. On
 * échangerait un risque théorique contre un risque réel.
 */
const SITE = SITE_ORIGIN;

/**
 * Paires de routes EN/DE. Doit rester alignée sur `src/i18n/routes.ts` —
 * un test du build vérifie la correspondance.
 */
const ROUTE_PAIRS = [
  { en: '/', de: '/de/' },
  { en: '/drinks/', de: '/de/getraenke/' },
  { en: '/brands/', de: '/de/marken/' },
  { en: '/about/', de: '/de/ueber-uns/' },
  { en: '/contact/', de: '/de/kontakt/' },
  { en: '/imprint/', de: '/de/impressum/' },
  { en: '/privacy/', de: '/de/datenschutz/' },
  { en: '/cookies/', de: '/de/cookies/' },
];

/**
 * La page de démonstration du design system vit hors de `src/pages/` et n'est
 * injectée qu'en développement ou quand STYLEGUIDE=1 (staging).
 *
 * Conséquence : elle est structurellement ABSENTE du build de production —
 * pas retirée après coup, jamais générée.
 */
function styleguideRoute() {
  return {
    name: 'ivan-arsenov:styleguide',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, logger }) => {
        const enabled = command === 'dev' || process.env.STYLEGUIDE === '1';
        if (!enabled) return;
        injectRoute({
          pattern: '/styleguide',
          entrypoint: './src/dev/styleguide.astro',
        });
        logger.info('design system exposé sur /styleguide/ (hors production)');
      },
    },
  };
}

/**
 * Écrit `dist/.htaccess` depuis `deploy/htaccess.template`, hôte injecté.
 *
 * Le fichier était statique dans `public/` et portait sa propre copie du
 * domaine : la redirection pouvait donc désigner un autre hôte que les
 * canonicals sans qu'aucun contrôle ne le voie. Il est désormais dérivé de la
 * même constante, et l'audit de l'artefact vérifie la concordance.
 */
function htaccess() {
  return {
    name: 'ivan-arsenov:htaccess',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const template = await readFile(
          fileURLToPath(new URL('./deploy/htaccess.template', import.meta.url)),
          'utf8',
        );

        const stagingBlock =
          TARGET === 'staging'
            ? `
# ── PRÉPRODUCTION ────────────────────────────────────────────────────────
# Cet artefact N'EST PAS destiné au public. L'exclusion est posée trois fois
# — en-tête, balise et robots.txt — parce qu'un seul de ces moyens suffit à
# être oublié, et qu'un staging indexé fait concurrence au site réel.
<IfModule mod_headers.c>
  Header always set X-Robots-Tag "noindex, nofollow"
</IfModule>
`
            : '';

        const out = template
          .replaceAll('{{HOST}}', HOST)
          .replaceAll('{{TARGET}}', TARGET)
          .replace('{{STAGING_BLOCK}}', stagingBlock)
          .replace('{{STAGING_ROBOTS}}', '');

        if (out.includes('{{')) throw new Error('.htaccess : placeholder non substitué');

        await writeFile(new URL('.htaccess', dir), out, 'utf8');
        logger.info(`.htaccess généré pour ${HOST} (${TARGET})`);
      },
    },
  };
}

/**
 * Retire de `dist/` les assets NON VALIDÉS que le bundler a émis sans que
 * personne ne les affiche.
 *
 * `import.meta.glob({ eager: true })` importe TOUT ce qui correspond au motif,
 * indépendamment de ce qui est réellement rendu. Un fichier de marque en
 * attente de validation se retrouvait donc écrit dans `dist/_astro/` — donc
 * publiquement téléchargeable — alors que la production ne l'affiche jamais.
 * C'est précisément le risque que la gouvernance d'assets existe pour écarter :
 * l'exposition compte autant que l'affichage.
 *
 * Le nettoyage est VÉRIFIÉ, pas aveugle : si l'un de ces fichiers est
 * réellement référencé par une page, le build échoue. Cela voudrait dire
 * qu'un asset non validé est affiché en production, et il faut alors le
 * savoir bruyamment plutôt que supprimer un fichier utilisé.
 */
function pruneUnvalidatedAssets() {
  return {
    name: 'ivan-arsenov:prune-unvalidated',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (process.env.ASSET_MODE === 'staging') return;

        const root = fileURLToPath(dir);
        const emitted = await readdir(join(root, '_astro')).catch(() => []);
        const suspects = emitted.filter((f) => /^logo\.[^.]+\.(webp|png|avif|jpg)$/.test(f));
        if (suspects.length === 0) return;

        // Concaténation de tout le HTML produit : une référence, où qu'elle soit.
        const html = [];
        const walk = async (d) => {
          for (const entry of await readdir(d, { withFileTypes: true })) {
            const full = join(d, entry.name);
            if (entry.isDirectory()) await walk(full);
            else if (entry.name.endsWith('.html')) html.push(await readFile(full, 'utf8'));
          }
        };
        await walk(root);
        const haystack = html.join('\n');

        const referenced = suspects.filter((f) => haystack.includes(f));
        if (referenced.length > 0) {
          throw new Error(
            `Assets non validés RÉFÉRENCÉS dans une page de production : ${referenced.join(', ')}`,
          );
        }

        for (const f of suspects) await rm(join(root, '_astro', f));
        logger.info(`${suspects.length} assets non validés retirés du build de production`);
      },
    },
  };
}

/**
 * Sortie 100 % statique : `dist/` est uploadable tel quel dans `public_html`
 * chez Hostinger, sans runtime Node.
 *
 * `trailingSlash: 'always'` + `format: 'directory'` produisent des
 * `<route>/index.html`, ce que sert nativement Apache.
 */
export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',

  build: {
    format: 'directory',
    // Un seul fichier CSS par page plutôt qu'une cascade de <link> :
    // moins de requêtes, meilleur LCP sur mobile.
    inlineStylesheets: 'auto',
  },

  // i18n géré par la table de routage `src/i18n/routes.ts` : les slugs
  // allemands sont traduits (/de/getraenke/), ce que le routage automatique
  // par préfixe ne permet pas d'exprimer.
  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },

  integrations: [
    styleguideRoute(),
    htaccess(),
    pruneUnvalidatedAssets(),
    sitemap({
      filter: (page) => !page.includes('/styleguide') && !page.includes('/404'),
      /*
       * Alternates XML en complément des hreflang du <head>. Les slugs
       * allemands étant traduits, le mappage automatique par préfixe de
       * @astrojs/sitemap produirait de FAUSSES correspondances : on le fait
       * à la main depuis la table de routage, seule source de vérité.
       */
      serialize(item) {
        const path = new URL(item.url).pathname;
        const pair = ROUTE_PAIRS.find((p) => p.en === path || p.de === path);
        if (!pair) return item;
        item.links = [
          { lang: 'en', url: new URL(pair.en, SITE).href },
          { lang: 'de', url: new URL(pair.de, SITE).href },
          { lang: 'x-default', url: new URL(pair.en, SITE).href },
        ];
        return item;
      },
    }),
  ],

  vite: {
    /*
     * Exposé via `import.meta.env` plutôt que `process.env` : les modules de
     * `src/` finissent aussi dans les bundles client, où `process` n'existe
     * pas. Vite substitue la valeur à la compilation, dans les deux cibles.
     */
    define: {
      'import.meta.env.PUBLIC_DEPLOY_TARGET': JSON.stringify(TARGET),
    },
    build: {
      /*
       * Vite précharge par défaut les chunks d'import dynamique. GSAP partait
       * donc chez TOUS les visiteurs, y compris ceux qui refusent le
       * mouvement et n'exécuteront jamais ce code. Le site n'ayant presque
       * pas de JavaScript, le préchargement n'apporte rien et coûte 60 Ko.
       */
      modulePreload: false,
    },
  },

  devToolbar: { enabled: false },
});
