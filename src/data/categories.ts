/**
 * Familles de boissons — 4.
 *
 * Concentrates & Syrups est exclue de la V1 (décision D4 du 2026-08-14) :
 * ni famille, ni filtre, ni données, ni assets.
 *
 * RÉDUCTION DU 2026-08-24 (décision du propriétaire) — le catalogue passe de
 * 62 à 14 articles. Deux familles se sont VIDÉES et sont donc retirées : une
 * famille sans marque produit un filtre qui ne filtre rien et une section qui
 * ne montre rien.
 *   · `water`          — Evian, SPA, Chaudfontaine… tous retirés.
 *   · `international`  — Chupa Chups, Mentos, Squid Game, Toxic Waste retirés.
 * Le marqueur TRANSVERSAL `internationalFind` survit à la disparition de la
 * famille : il qualifie une variante (une Fanta importée reste Carbonated) et
 * n'a jamais dépendu de la famille `international`.
 *
 * `iced-tea` est ajoutée le 2026-08-24 pour accueillir Lipton Ice Tea. Aucune
 * des familles existantes ne décrit un thé glacé : le ranger dans
 * `juice-fruit` (« Fruit drinks, juices and tropical flavours ») aurait publié
 * une classification fausse. Voir doc/tr-028-catalogue-reduction.md.
 *
 * Source de vérité : doc/catalog.md §1
 */

export const CATEGORY_SLUGS = [
  'carbonated',
  'energy-sport',
  'juice-fruit',
  'iced-tea',
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
    slug: 'juice-fruit',
    name: { en: 'Juice & Fruit', de: 'Saft & Frucht' },
    description: {
      en: 'Fruit drinks, juices and tropical flavours.',
      de: 'Fruchtgetränke, Säfte und tropische Geschmacksrichtungen.',
    },
  },
  {
    index: '04',
    slug: 'iced-tea',
    name: { en: 'Iced Tea', de: 'Eistee' },
    description: {
      // Strictement descriptif. Aucune revendication de gamme, d'origine ni
      // de format : aucun SKU Lipton n'est confirmé.
      en: 'Ready-to-drink iced teas.',
      de: 'Trinkfertige Eistees.',
    },
  },
];
