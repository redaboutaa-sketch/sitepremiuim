// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Sortie 100 % statique : `dist/` est uploadable tel quel dans `public_html`
 * chez Hostinger, sans runtime Node.
 *
 * `trailingSlash: 'always'` + `format: 'directory'` produisent des
 * `<route>/index.html`, ce que sert nativement Apache.
 */
export default defineConfig({
  site: 'https://www.ivan-arsenov.de',
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
    sitemap({
      // hreflang est porté par le <head> de chaque page (voir BaseHead.astro).
      // Les alternates XML seront ajoutés en TR-018.
      filter: (page) => !page.includes('/_styleguide'),
    }),
  ],

  devToolbar: { enabled: false },
});
