/**
 * i18n — table de routage.
 *
 * Source unique des chemins. Les slugs allemands sont traduits (SEO local).
 * Aucun chemin ne doit être écrit en dur ailleurs dans le projet : toute
 * référence passe par `path()`.
 */

import { DEFAULT_LOCALE, LOCALES, SITE_ORIGIN, type Locale } from './config';

export const PAGES = [
  'home',
  'drinks',
  'brands',
  'about',
  'contact',
  'imprint',
  'privacy',
  'cookies',
] as const;

export type PageKey = (typeof PAGES)[number];

/**
 * Chemins par page et par locale. Trailing slash systématique
 * (cohérent avec `trailingSlash: 'always'` dans astro.config).
 */
export const ROUTES: Record<PageKey, Record<Locale, string>> = {
  home: { en: '/', de: '/de/' },
  drinks: { en: '/drinks/', de: '/de/getraenke/' },
  brands: { en: '/brands/', de: '/de/marken/' },
  about: { en: '/about/', de: '/de/ueber-uns/' },
  contact: { en: '/contact/', de: '/de/kontakt/' },
  imprint: { en: '/imprint/', de: '/de/impressum/' },
  privacy: { en: '/privacy/', de: '/de/datenschutz/' },
  cookies: { en: '/cookies/', de: '/de/cookies/' },
};

/** Chemin absolu (relatif au domaine) d'une page dans une locale. */
export function path(page: PageKey, locale: Locale): string {
  return ROUTES[page][locale];
}

/** URL absolue d'une page dans une locale. */
export function url(page: PageKey, locale: Locale): string {
  return new URL(ROUTES[page][locale], SITE_ORIGIN).href;
}

/**
 * URL canonique d'une page — TOUJOURS auto-référente.
 *
 * Une page DE se canonicalise vers elle-même, jamais vers son équivalent EN :
 * canonicaliser DE → EN désindexerait la version allemande.
 */
export function canonicalUrl(page: PageKey, locale: Locale): string {
  return url(page, locale);
}

export interface Alternate {
  hreflang: string;
  href: string;
}

/**
 * Alternates `hreflang` d'une page.
 *
 * Réciprocité complète : chaque page déclare toutes les locales — y compris
 * la sienne — puis `x-default` vers la locale par défaut.
 */
export function alternates(page: PageKey): Alternate[] {
  const list: Alternate[] = LOCALES.map((locale) => ({
    hreflang: locale,
    href: url(page, locale),
  }));
  list.push({ hreflang: 'x-default', href: url(page, DEFAULT_LOCALE) });
  return list;
}

/** Toutes les routes du site, à plat. Utilisé par la QA et le sitemap. */
export function allRoutes(): Array<{ page: PageKey; locale: Locale; path: string }> {
  const out: Array<{ page: PageKey; locale: Locale; path: string }> = [];
  for (const page of PAGES) {
    for (const locale of LOCALES) {
      out.push({ page, locale, path: ROUTES[page][locale] });
    }
  }
  return out;
}
