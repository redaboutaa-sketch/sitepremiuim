import { expect, test } from '@playwright/test';

import { BRANDS } from '../src/data/brands';
import { CATEGORY_SLUGS } from '../src/data/categories';
import { EXCLUSIONS } from '../src/data/exclusions';
import {
  allBrands,
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

/*
 * RÉDUCTION DU 2026-08-24 — le catalogue passe de 62 marques en 5 familles à
 * la liste fermée de 14 articles arrêtée par le propriétaire du site.
 * Les chiffres attendus ci-dessous ont donc changé ; l'état à 62 marques reste
 * vérifiable sur `backup/catalogue-62-brands-full`.
 */
test('14 marques publiables réparties en 4 familles', () => {
  const stats = catalogStats();
  expect(stats.total).toBe(14);
  expect(stats.byCategory).toEqual({
    carbonated: 10,
    'energy-sport': 2,
    'juice-fruit': 1,
    'iced-tea': 1,
  });
  expect(CATEGORY_SLUGS).toHaveLength(4);
});

test('la liste des 14 articles est exactement celle demandée par le client', () => {
  // Liste FERMÉE. Un ajout ici doit venir du client, pas d'un refactor.
  expect(allBrands().map((b) => b.slug).sort()).toEqual(
    [
      '7up', 'capri-sun', 'coca-cola', 'dr-pepper', 'fanta', 'lipton-ice-tea',
      'mirinda', 'monster-energy', 'mountain-dew', 'orangina', 'pepsi',
      'red-bull', 'schweppes', 'sprite',
    ].sort(),
  );
});

test('les 14 marques sont mises en avant', () => {
  // À 14 articles, « featured » ne sélectionne plus rien : il couvre tout.
  expect(featuredBrands()).toHaveLength(14);
  expect(featuredBrands().map((b) => b.slug).sort()).toEqual(
    allBrands().map((b) => b.slug).sort(),
  );
});

test('internationalFind reste indépendant de la famille', () => {
  const intl = internationalFinds();
  expect(intl.length).toBeGreaterThan(0);
  /*
   * Le marqueur ne couvre plus qu'une famille depuis la réduction : la
   * famille `international`, qui portait les quatre autres marques marquées,
   * a été vidée. Ce n'est PAS une régression du modèle — le marqueur reste
   * transversal par construction, il ne fait que ne plus le démontrer.
   *
   * Ce qui se vérifie toujours, et qui est le vrai propos du marqueur : une
   * marque marquée « trouvaille internationale » garde sa famille d'origine
   * au lieu d'être déplacée dans une famille fourre-tout.
   */
  const fanta = catalog.find((b) => b.slug === 'fanta');
  expect(fanta?.category).toBe('carbonated');
  expect(fanta?.internationalFind).toBe(true);
  // Et le marqueur ne recouvre pas sa famille : tous les Carbonated ne le sont pas.
  const carbonated = catalog.filter((b) => b.category === 'carbonated');
  expect(carbonated.some((b) => !b.internationalFind)).toBe(true);
});

test('les marques brand-level-only ne portent aucun SKU', () => {
  const restricted = brandLevelOnly();
  /*
   * Une seule survit à la réduction. Lipton Ice Tea EST la raison pour
   * laquelle ce contrôle doit rester : la marque a été retirée de la liste
   * d'exclusions le 2026-08-24, et c'est cette `scopeNote` — thés glacés
   * prêts à boire, jamais le thé en sachet — qui tient désormais le périmètre
   * à sa place.
   */
  expect(restricted.map((b) => b.slug).sort()).toEqual(['lipton-ice-tea']);
  for (const b of restricted) {
    expect(b.productName, `${b.brand} ne doit porter aucun SKU`).toBeNull();
    expect(b.scopeNote, `${b.brand} doit documenter sa restriction`).not.toBeNull();
    // La note est PUBLIÉE : les deux langues sont exigées, non vides.
    expect(b.scopeNote!.en.length, `${b.brand} — note EN`).toBeGreaterThan(0);
    expect(b.scopeNote!.de.length, `${b.brand} — note DE`).toBeGreaterThan(0);
    expect(b.scopeNote!.de, `${b.brand} — DE identique à EN`).not.toBe(b.scopeNote!.en);
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
      scopeNote: { en: 'Root beer only.', de: 'Nur Root Beer.' },
      productName: 'A&W Root Beer 355ml',
    },
  ]);
  expect(issues).toHaveLength(1);
  expect(issues[0]).toContain('brand-level-only');
  expect(issues[0]).toContain('D7');
});

test('CONTRÔLE 4 — une famille hors des 4 autorisées est rejetée', () => {
  /*
   * `iced-tea` a QUITTÉ cette liste le 2026-08-24 : c'est devenu une famille
   * valide avec Lipton Ice Tea. `water` et `international` l'ont rejointe en
   * sens inverse — elles ont été retirées des familles autorisées après
   * s'être vidées, et doivent donc être rejetées comme les autres.
   */
  for (const category of ['concentrates', 'water', 'international', 'dairy', 'coffee']) {
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
