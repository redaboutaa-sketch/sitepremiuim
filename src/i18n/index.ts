/**
 * i18n — point d'entrée unique.
 *
 * Usage dans un composant Astro :
 *   import { useI18n } from '@/i18n';
 *   const { t, locale, path } = useI18n(Astro.currentLocale);
 */

import { DEFAULT_LOCALE, HTML_LANG, LOCALE_LABEL, LOCALES, isLocale, type Locale } from './config';
import { de } from './de';
import { en, type Dictionary } from './en';
import { alternates, canonicalUrl, path as routePath, type PageKey } from './routes';

const DICTIONARIES: Record<Locale, Dictionary> = { en, de };

export interface I18n {
  locale: Locale;
  t: Dictionary;
  /** Chemin d'une page dans la locale courante. */
  path: (page: PageKey) => string;
  /** Chemin d'une page dans une autre locale — pour le sélecteur de langue. */
  pathIn: (page: PageKey, locale: Locale) => string;
  canonical: (page: PageKey) => string;
  alternates: typeof alternates;
  htmlLang: string;
}

/**
 * Résout la locale et retourne le dictionnaire correspondant.
 * Une valeur inconnue retombe silencieusement sur la locale par défaut plutôt
 * que de casser le rendu — le routage garantit déjà une locale valide.
 */
export function useI18n(input: string | undefined): I18n {
  const locale: Locale = input && isLocale(input) ? input : DEFAULT_LOCALE;

  return {
    locale,
    t: DICTIONARIES[locale],
    path: (page) => routePath(page, locale),
    pathIn: (page, target) => routePath(page, target),
    canonical: (page) => canonicalUrl(page, locale),
    alternates,
    htmlLang: HTML_LANG[locale],
  };
}

export { DEFAULT_LOCALE, LOCALES, LOCALE_LABEL, isLocale };
export type { Locale, Dictionary, PageKey };
