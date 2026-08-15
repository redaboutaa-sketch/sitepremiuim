import { expect, test } from '@playwright/test';

import { BRANDS } from '../src/data/brands';
import { CATEGORY_SLUGS } from '../src/data/categories';
import { EXCLUSIONS } from '../src/data/exclusions';
import {
  brandLevelOnly,
  catalog,
  catalogStats,
  collectIssues,
  featuredBrands,
  internationalFinds,
} from '../src/lib/catalog';

/**
 * Tests unitaires du catalogue — aucun navigateur requis.
 *
 * Deux volets :
 *   A. le catalogue réel est conforme ;
 *   B. chacun des 4 contrôles bloquants REJETTE effectivement une entrée
 *      fautive. Un garde-fou qu'on ne teste pas est un garde-fou supposé.
 */

const VALID = {
  slug: 'test-brand',
  brand: 'Test Brand',
  category: 'carbonated',
  productName: null,
  subcategory: null,
  variant: null,
  flavour: null,
  country: null,
  packageType: null,
  volume: null,
  image: null,
  logo: null,
  featured: false,
  internationalFind: false,
  specialEdition: false,
  availabilityStatus: 'TBC',
  assetStatus: 'missing',
  skuPolicy: 'full',
  searchTerms: [],
  scopeNote: null,
};

/* ================================================================== *
 * A — le catalogue réel
 * ================================================================== */

test('le catalogue réel est valide', () => {
  expect(collectIssues(BRANDS)).toEqual([]);
});

test('62 marques publiables réparties en 5 familles', () => {
  const stats = catalogStats();
  expect(stats.total).toBe(62);
  expect(stats.byCategory).toEqual({
    carbonated: 26,
    'energy-sport': 11,
    water: 8,
    'juice-fruit': 13,
    international: 4,
  });
  expect(CATEGORY_SLUGS).toHaveLength(5);
});

test('16 marques featured, conformes à la liste approuvée', () => {
  const slugs = featuredBrands().map((b) => b.slug).sort();
  expect(slugs).toEqual(
    [
      '7up', 'bundaberg', 'capri-sun', 'coca-cola', 'dr-pepper', 'evian',
      'fanta', 'monster-energy', 'mountain-dew', 'orangina', 'pepsi',
      'powerade', 'red-bull', 'schweppes', 'spa', 'sprite',
    ].sort(),
  );
});

test('internationalFind est transversal aux familles', () => {
  const families = new Set(internationalFinds().map((b) => b.category));
  // S'il ne couvrait qu'une famille, le marqueur ferait doublon avec `category`.
  expect(families.size).toBeGreaterThan(1);
  expect(families.has('carbonated')).toBe(true);
  expect(families.has('international')).toBe(true);
  // Une Fanta internationale reste rangée dans Carbonated.
  const fanta = catalog.find((b) => b.slug === 'fanta');
  expect(fanta?.category).toBe('carbonated');
  expect(fanta?.internationalFind).toBe(true);
});

test('les 4 marques brand-level-only ne portent aucun SKU', () => {
  const restricted = brandLevelOnly();
  expect(restricted.map((b) => b.slug).sort()).toEqual([
    'a-and-w', 'bundaberg', 'chupa-chups', 'hero', 'krombacher-spezi', 'mentos',
    'squid-game', 'toxic-waste',
  ].sort());
  for (const b of restricted) {
    expect(b.productName, `${b.brand} ne doit porter aucun SKU`).toBeNull();
    expect(b.scopeNote, `${b.brand} doit documenter sa restriction`).not.toBeNull();
  }
});

test('aucune donnée inventée : SKU, format, contenance et pays restent nuls', () => {
  for (const b of catalog) {
    expect(b.productName, `${b.brand}.productName`).toBeNull();
    expect(b.volume, `${b.brand}.volume`).toBeNull();
    expect(b.packageType, `${b.brand}.packageType`).toBeNull();
    expect(b.country, `${b.brand}.country`).toBeNull();
  }
});

test('aucune disponibilité affichable', () => {
  for (const b of catalog) {
    expect(b.availabilityStatus, `${b.brand}`).toBe('TBC');
  }
});

test('aucune marque exclue ne figure au catalogue', () => {
  const slugs = new Set(catalog.map((b) => b.slug));
  for (const e of EXCLUSIONS) {
    expect(slugs.has(e.slug), `${e.label} (${e.reason}) ne doit pas être publiée`).toBe(false);
  }
});

/* ================================================================== *
 * B — les 4 contrôles bloquants rejettent bien
 * ================================================================== */

test('CONTRÔLE 1 — une marque exclue est rejetée', () => {
  const issues = collectIssues([{ ...VALID, slug: 'heineken', brand: 'Heineken' }]);
  expect(issues).toHaveLength(1);
  expect(issues[0]).toContain('marque exclue');
  expect(issues[0]).toContain('Alcool');
});

test('CONTRÔLE 1 bis — Arizona et les dairy sont rejetées', () => {
  for (const slug of ['arizona', 'chocomel', 'karvan-cevitam', 'xxl-nutrition']) {
    const issues = collectIssues([{ ...VALID, slug }]);
    expect(issues.join(' '), slug).toContain('marque exclue');
  }
});

test('CONTRÔLE 2 — un slug en doublon est rejeté', () => {
  const issues = collectIssues([VALID, { ...VALID, brand: 'Autre' }]);
  expect(issues).toHaveLength(1);
  expect(issues[0]).toContain('doublon');
});

test('CONTRÔLE 3 — un productName sur une marque brand-level-only est rejeté', () => {
  const issues = collectIssues([
    {
      ...VALID,
      slug: 'a-and-w',
      brand: 'A&W',
      skuPolicy: 'brand-level-only',
      scopeNote: 'Root Beer uniquement.',
      productName: 'A&W Root Beer 355ml',
    },
  ]);
  expect(issues).toHaveLength(1);
  expect(issues[0]).toContain('brand-level-only');
  expect(issues[0]).toContain('D7');
});

test('CONTRÔLE 4 — une famille hors des 5 autorisées est rejetée', () => {
  for (const category of ['concentrates', 'iced-tea', 'dairy', 'coffee']) {
    const issues = collectIssues([{ ...VALID, category }]);
    expect(issues.length, category).toBeGreaterThan(0);
    expect(issues.join(' '), category).toContain('category');
  }
});

test('une disponibilité autre que TBC est rejetée', () => {
  for (const status of ['in-stock', 'available', 'limited']) {
    const issues = collectIssues([{ ...VALID, availabilityStatus: status }]);
    expect(issues.length, status).toBeGreaterThan(0);
  }
});

test('une restriction non documentée est rejetée', () => {
  const issues = collectIssues([{ ...VALID, skuPolicy: 'brand-level-only', scopeNote: null }]);
  expect(issues.join(' ')).toContain('ne documente pas sa restriction');
});

test('une entrée valide ne produit aucune anomalie', () => {
  expect(collectIssues([VALID])).toEqual([]);
});
