/**
 * i18n — configuration de base.
 *
 * EN est la langue SOURCE ÉDITORIALE. Cela ne lui confère aucun statut canonique
 * en SEO : chaque page se canonicalise elle-même (voir `canonicalUrl`).
 */

export const LOCALES = ['en', 'de'] as const;
export type Locale = (typeof LOCALES)[number];

/** Locale servie à la racine du domaine, et cible de `x-default`. */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Origine de production. Sert à construire canonical, hreflang et sitemap.
 * Ré-exportée depuis `site.config.mjs` — jamais redéclarée ici, sous peine de
 * voir les canonicals et le sitemap diverger en silence.
 */
export { SITE_ORIGIN } from '../../site.config.mjs';

/** Attribut `lang` du document et valeur `hreflang`. */
export const HTML_LANG: Record<Locale, string> = {
  en: 'en',
  de: 'de',
};

/** Libellé du sélecteur de langue. */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
