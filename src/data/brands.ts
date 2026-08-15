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
  /** Restriction de périmètre. Obligatoire si `skuPolicy` vaut `brand-level-only`. */
  scopeNote: string | null;
}

interface Options {
  featured?: boolean;
  intl?: boolean;
  special?: boolean;
  brandLevelOnly?: string;
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
    brandLevelOnly:
      'Root Beer = soft drink non alcoolisée, à ne pas confondre avec une bière. SKU précis non confirmés.',
    searchTerms: ['a and w', 'aw', 'root beer'],
  }),
  b('big-red', 'Big Red', 'carbonated'),
  b('bundaberg', 'Bundaberg', 'carbonated', {
    featured: true,
    intl: true,
    brandLevelOnly: 'Références non alcoolisées uniquement. SKU précis non confirmés.',
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
    brandLevelOnly:
      'Spezi et soft drinks uniquement — jamais les bières Krombacher. SKU précis non confirmés.',
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
    brandLevelOnly:
      'Boissons et jus uniquement — pas les confitures ni l’alimentaire. SKU précis non confirmés.',
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
    brandLevelOnly: 'Boissons sous licence uniquement — pas les confiseries.',
  }),
  b('mentos', 'Mentos', 'international', {
    intl: true,
    special: true,
    brandLevelOnly: 'Sodas et boissons uniquement — pas les bonbons.',
  }),
  b('squid-game', 'Squid Game', 'international', {
    intl: true,
    special: true,
    brandLevelOnly: 'Boissons sous licence uniquement.',
  }),
  b('toxic-waste', 'Toxic Waste', 'international', {
    intl: true,
    special: true,
    brandLevelOnly: 'Boissons sous licence uniquement — pas les bonbons.',
  }),
];
