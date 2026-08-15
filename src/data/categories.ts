/**
 * Familles de boissons — 5, pas 6.
 *
 * Concentrates & Syrups est exclue de la V1 (décision D4 du 2026-08-14) :
 * ni famille, ni filtre, ni données, ni assets.
 *
 * Source de vérité : doc/catalog.md §1
 */

export const CATEGORY_SLUGS = [
  'carbonated',
  'energy-sport',
  'water',
  'juice-fruit',
  'international',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface CategoryRecord {
  index: string;
  slug: CategorySlug;
  /** Libellés et descriptions repris tels quels du copy deck client (EN canonique). */
  name: { en: string; de: string };
  description: { en: string; de: string };
}

export const CATEGORIES: CategoryRecord[] = [
  {
    index: '01',
    slug: 'carbonated',
    name: { en: 'Carbonated', de: 'Kohlensäurehaltig' },
    description: {
      en: 'Colas, lemonades and sparkling soft drinks.',
      de: 'Colas, Limonaden und kohlensäurehaltige Erfrischungsgetränke.',
    },
  },
  {
    index: '02',
    slug: 'energy-sport',
    name: { en: 'Energy & Sport', de: 'Energy & Sport' },
    description: {
      en: 'Energy, performance and functional beverages.',
      de: 'Energy-, Sport- und funktionale Getränke.',
    },
  },
  {
    index: '03',
    slug: 'water',
    name: { en: 'Water', de: 'Wasser' },
    description: {
      en: 'Still, sparkling and flavoured water.',
      de: 'Stilles Wasser, Sprudel und aromatisiertes Wasser.',
    },
  },
  {
    index: '04',
    slug: 'juice-fruit',
    name: { en: 'Juice & Fruit', de: 'Saft & Frucht' },
    description: {
      en: 'Fruit drinks, juices and tropical flavours.',
      de: 'Fruchtgetränke, Säfte und tropische Geschmacksrichtungen.',
    },
  },
  {
    index: '05',
    slug: 'international',
    name: { en: 'International Finds', de: 'Internationale Entdeckungen' },
    description: {
      // « imported-style » est volontaire : aucune revendication d'importation
      // directe tant qu'Ivan ne l'a pas confirmée.
      en: 'Regional variants, special flavours and distinctive imported-style products.',
      de: 'Regionale Varianten, besondere Geschmacksrichtungen und importtypische Produkte.',
    },
  },
];
