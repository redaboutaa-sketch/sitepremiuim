/**
 * Catalogue de marques — 62 entrées publiables.
 *
 * ⚠️ REFERENCE_CATALOG ≠ CONFIRMED_CURRENT_STOCK
 * Ces données décrivent l'assortiment CIBLE d'Ivan Arsenov, pas son stock réel.
 * Aucune disponibilité, aucune quantité, aucun prix n'est porté par ce fichier.
 *
 * ⚠️ AUCUNE DONNÉE INVENTÉE
 * `country`, `volume`, `packageType` et `productName` restent `null` partout :
 * nous ne disposons d'aucune donnée vérifiée sur les SKU réellement distribués.
 * Ne JAMAIS remplir ces champs « parce que c'est probable » — un format 330 ml
 * ou un pays d'origine plausible reste une invention.
 *
 * Source de vérité : doc/catalog.md §2 et §3
 */

import type { CategorySlug } from './categories';

export type SkuPolicy = 'full' | 'brand-level-only';
export type AssetStatus = 'validated' | 'requires_validation' | 'missing';
export type Availability = 'TBC';

export interface BrandRecord {
  slug: string;
  brand: string;
  category: CategorySlug;
  /** Nom du produit — `null` tant qu'aucun SKU n'est confirmé. */
  productName: string | null;
  subcategory: string | null;
  variant: string | null;
  flavour: string | null;
  country: string | null;
  packageType: string | null;
  volume: string | null;
  image: string | null;
  logo: string | null;
  /** Décision de DESIGN — jamais une donnée de vente. 16 marques. */
  featured: boolean;
  /** Marqueur TRANSVERSAL aux familles : une Fanta internationale reste Carbonated. */
  internationalFind: boolean;
  specialEdition: boolean;
  availabilityStatus: Availability;
  assetStatus: AssetStatus;
  skuPolicy: SkuPolicy;
  searchTerms: string[];
  /**
   * Restriction de périmètre. Obligatoire si `skuPolicy` vaut
   * `brand-level-only`.
   *
   * LOCALISÉE — cette note est PUBLIÉE : le catalogue la rend dans un élément
   * réservé aux lecteurs d'écran. Une note rédigée dans une seule langue
   * s'adresserait donc en français à un visiteur anglophone ou germanophone,
   * précisément sur le point le plus sensible du catalogue — ce que la marque
   * couvre et ce qu'elle ne couvre pas.
   */
  scopeNote: { en: string; de: string } | null;
}

interface Options {
  featured?: boolean;
  intl?: boolean;
  special?: boolean;
  brandLevelOnly?: { en: string; de: string };
  searchTerms?: string[];
}

/** Fabrique une entrée en n'exigeant que ce qui est réellement connu. */
function b(
  slug: string,
  brand: string,
  category: CategorySlug,
  o: Options = {},
): BrandRecord {
  return {
    slug,
    brand,
    category,
    productName: null,
    subcategory: null,
    variant: null,
    flavour: null,
    country: null,
    packageType: null,
    volume: null,
    image: null,
    logo: null,
    featured: o.featured ?? false,
    internationalFind: o.intl ?? false,
    specialEdition: o.special ?? false,
    availabilityStatus: 'TBC',
    // Aucun asset de marque n'a encore été fourni ni validé (décision D8).
    assetStatus: 'missing',
    skuPolicy: o.brandLevelOnly ? 'brand-level-only' : 'full',
    searchTerms: o.searchTerms ?? [],
    scopeNote: o.brandLevelOnly ?? null,
  };
}

export const BRANDS: BrandRecord[] = [
  // ── A · CARBONATED SOFT DRINKS — 26 ──────────────────────────────────
  b('7up', '7UP', 'carbonated', { featured: true, searchTerms: ['seven up', '7 up'] }),
  b('a-and-w', 'A&W', 'carbonated', {
    brandLevelOnly: {
      en: 'Root beer is a non-alcoholic soft drink, not a beer. Specific SKUs not confirmed.',
      de: 'Root Beer ist ein alkoholfreies Erfrischungsgetränk, kein Bier. Konkrete Artikel nicht bestätigt.',
    },
    searchTerms: ['a and w', 'aw', 'root beer'],
  }),
  b('big-red', 'Big Red', 'carbonated'),
  b('bundaberg', 'Bundaberg', 'carbonated', {
    featured: true,
    intl: true,
    brandLevelOnly: {
      en: 'Non-alcoholic references only. Specific SKUs not confirmed.',
      de: 'Ausschließlich alkoholfreie Artikel. Konkrete Artikel nicht bestätigt.',
    },
  }),
  b('canada-dry', 'Canada Dry', 'carbonated'),
  b('coca-cola', 'Coca-Cola', 'carbonated', {
    featured: true,
    searchTerms: ['coke', 'coca cola'],
  }),
  b('dr-foots', 'Dr Foots', 'carbonated'),
  b('dr-pepper', 'Dr Pepper', 'carbonated', { featured: true, intl: true }),
  b('fanta', 'Fanta', 'carbonated', { featured: true, intl: true }),
  b('fernandes', 'Fernandes', 'carbonated', { intl: true }),
  b('guarana-antarctica', 'Guaraná Antarctica', 'carbonated', {
    intl: true,
    searchTerms: ['guarana'],
  }),
  b('krombacher-spezi', 'Krombacher Spezi', 'carbonated', {
    brandLevelOnly: {
      en: 'Spezi and soft drinks only — never Krombacher beers. Specific SKUs not confirmed.',
      de: 'Nur Spezi und Erfrischungsgetränke — keine Krombacher Biere. Konkrete Artikel nicht bestätigt.',
    },
    searchTerms: ['spezi'],
  }),
  b('mirinda', 'Mirinda', 'carbonated'),
  b('mountain-dew', 'Mountain Dew', 'carbonated', {
    featured: true,
    intl: true,
    searchTerms: ['mtn dew'],
  }),
  b('oasis', 'Oasis', 'carbonated'),
  b('orangina', 'Orangina', 'carbonated', { featured: true }),
  b('pariba', 'Pariba', 'carbonated'),
  b('pepsi', 'Pepsi', 'carbonated', { featured: true, intl: true }),
  b('poms', 'Poms', 'carbonated'),
  b('rivella', 'Rivella', 'carbonated'),
  b('royal-club', 'Royal Club', 'carbonated'),
  b('schweppes', 'Schweppes', 'carbonated', { featured: true }),
  b('sisi', 'Sisi', 'carbonated'),
  b('sprite', 'Sprite', 'carbonated', { featured: true }),
  b('sunkist', 'Sunkist', 'carbonated'),
  b('yummy-miami-soda', 'Yummy Miami Soda', 'carbonated', {
    intl: true,
    searchTerms: ['yummy miami'],
  }),

  // ── B · ENERGY · SPORT · FUNCTIONAL — 11 ─────────────────────────────
  b('28-black', '28 Black', 'energy-sport', { searchTerms: ['28black'] }),
  b('aa-drink', 'AA Drink', 'energy-sport'),
  b('aquarius', 'Aquarius', 'energy-sport'),
  b('bomba', 'Bomba', 'energy-sport'),
  b('freego', 'Freego', 'energy-sport'),
  b('monster-energy', 'Monster Energy', 'energy-sport', {
    featured: true,
    searchTerms: ['monster'],
  }),
  b('o2life', 'O2Life', 'energy-sport', { searchTerms: ['o2 life'] }),
  b('powerade', 'Powerade', 'energy-sport', { featured: true }),
  b('red-bull', 'Red Bull', 'energy-sport', { featured: true, searchTerms: ['redbull'] }),
  b('slammers-energy', 'Slammers Energy', 'energy-sport', { searchTerms: ['slammers'] }),
  b('vitamin-well', 'Vitamin Well', 'energy-sport'),

  // ── C · WATER · MINERAL · FLAVOURED — 8 ──────────────────────────────
  b('bar-le-duc', 'Bar-le-Duc', 'water'),
  b('chaudfontaine', 'Chaudfontaine', 'water'),
  b('evian', 'Evian', 'water', { featured: true }),
  b('feel-so-good', 'Feel So Good', 'water'),
  b('kizilay', 'Kızılay', 'water', { searchTerms: ['kizilay'] }),
  b('lacroix', 'LaCroix', 'water', { searchTerms: ['la croix'] }),
  b('sourcy', 'Sourcy', 'water'),
  b('spa', 'SPA', 'water', { featured: true }),

  // ── D · JUICES · FRUIT · TROPICAL — 13 ───────────────────────────────
  b('tropical-aloe-vera', 'Tropical Aloe Vera', 'juice-fruit', { searchTerms: ['aloe vera'] }),
  b('capri-sun', 'Capri-Sun', 'juice-fruit', { featured: true, searchTerms: ['caprisun'] }),
  b('charlies', "Charlie's", 'juice-fruit', { searchTerms: ['charlies'] }),
  b('coco-rico', 'Coco Rico', 'juice-fruit'),
  b('dubbelfrisss', 'DubbelFrisss', 'juice-fruit', { searchTerms: ['dubbel frisss'] }),
  b('grace', 'Grace', 'juice-fruit'),
  b('hawai', 'Hawai', 'juice-fruit', { intl: true }),
  b('hawaiian-punch', 'Hawaiian Punch', 'juice-fruit'),
  b('hero', 'Hero', 'juice-fruit', {
    brandLevelOnly: {
      en: 'Drinks and juices only — not the jams or food range. Specific SKUs not confirmed.',
      de: 'Nur Getränke und Säfte — keine Konfitüren oder Lebensmittel. Konkrete Artikel nicht bestätigt.',
    },
  }),
  b('maaza', 'Maaza', 'juice-fruit'),
  b('okf', 'OKF', 'juice-fruit'),
  b('rauch', 'Rauch', 'juice-fruit'),
  b('taksi', 'Taksi', 'juice-fruit'),

  // ── F · INTERNATIONAL · NOVELTY · LICENSED — 4 ───────────────────────
  // Licences tierces : sensibilité juridique supérieure aux marques de
  // boissons classiques. Registre d'assets distinct (risque R7).
  b('chupa-chups', 'Chupa Chups', 'international', {
    intl: true,
    special: true,
    brandLevelOnly: {
      en: 'Licensed drinks only — not the confectionery.',
      de: 'Nur Lizenzgetränke — keine Süßwaren.',
    },
  }),
  b('mentos', 'Mentos', 'international', {
    intl: true,
    special: true,
    brandLevelOnly: {
      en: 'Sodas and drinks only — not the sweets.',
      de: 'Nur Limonaden und Getränke — keine Bonbons.',
    },
  }),
  b('squid-game', 'Squid Game', 'international', {
    intl: true,
    special: true,
    brandLevelOnly: {
      en: 'Licensed drinks only.',
      de: 'Nur Lizenzgetränke.',
    },
  }),
  b('toxic-waste', 'Toxic Waste', 'international', {
    intl: true,
    special: true,
    brandLevelOnly: {
      en: 'Licensed drinks only — not the sweets.',
      de: 'Nur Lizenzgetränke — keine Bonbons.',
    },
  }),
];
