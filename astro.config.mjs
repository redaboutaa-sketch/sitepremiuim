// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
    styleguideRoute(),
    sitemap({
      // hreflang est porté par le <head> de chaque page (voir BaseHead.astro).
      // Les alternates XML seront ajoutés en TR-018.
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],

  vite: {
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
