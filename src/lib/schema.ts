/**
 * DONNÉES STRUCTURÉES — Schema.org.
 *
 * Uniquement ce qui est VÉRIFIABLE. Aucune note, aucun avis, aucun prix,
 * aucune offre, aucun horaire, aucune zone de livraison : rien de tout cela
 * n'a été confirmé, et une donnée structurée inventée est une donnée
 * structurée trompeuse — sanctionnée comme telle par les moteurs.
 */

import { COMPANY, addressLines } from '../data/company';
import { CATEGORIES } from '../data/categories';
import type { Locale } from '../i18n/config';
import { SITE_ORIGIN } from '../i18n/config';
import { ROUTES, type PageKey } from '../i18n/routes';

const abs = (path: string) => new URL(path, SITE_ORIGIN).href;

/** Organisation — l'entité juridique, avec son numéro de TVA vérifiable. */
export function organization() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}/#organization`,
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    url: SITE_ORIGIN,
    email: COMPANY.email,
    vatID: COMPANY.vatId,
    taxID: COMPANY.taxNumber,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      postalCode: COMPANY.address.postalCode,
      addressLocality: COMPANY.address.city,
      addressCountry: COMPANY.address.countryCode,
    },
  };
}

/**
 * WholesaleStore — sous-type de LocalBusiness adapté au négoce B2B.
 * Volontairement dépourvu d'`openingHours`, d'`aggregateRating` et de
 * `priceRange` : aucune de ces données n'existe.
 */
export function wholesaleStore(locale: Locale, description: string) {
  return {
    '@type': 'WholesaleStore',
    '@id': `${SITE_ORIGIN}/#business`,
    name: COMPANY.name,
    description,
    url: abs(ROUTES.home[locale]),
    email: COMPANY.email,
    vatID: COMPANY.vatId,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      postalCode: COMPANY.address.postalCode,
      addressLocality: COMPANY.address.city,
      addressCountry: COMPANY.address.countryCode,
    },
    parentOrganization: { '@id': `${SITE_ORIGIN}/#organization` },
  };
}

export function website(locale: Locale, name: string) {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_ORIGIN}/#website`,
    name,
    url: abs(ROUTES.home[locale]),
    inLanguage: locale,
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
  };
}

export function breadcrumb(
  locale: Locale,
  trail: Array<{ page: PageKey; name: string }>,
) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(ROUTES[item.page][locale]),
    })),
  };
}

/**
 * Catalogue — les familles de boissons, sans prix ni disponibilité.
 * `ItemList` décrit une organisation éditoriale, pas une offre commerciale.
 */
export function categoryList(locale: Locale) {
  return {
    '@type': 'ItemList',
    name: 'Soft drink categories',
    numberOfItems: CATEGORIES.length,
    itemListElement: CATEGORIES.map((category, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: category.name[locale],
      description: category.description[locale],
    })),
  };
}

export function graph(nodes: object[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}

export { addressLines };
