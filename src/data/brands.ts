/**
 * Catalogue de marques — 14 entrées publiables.
 *
 * ⚠️ RÉDUCTION DU 2026-08-24 — décision du propriétaire du site.
 * Le catalogue passait de 62 marques à la liste fermée de 14 articles
 * demandée par le client. Les 49 autres entrées ont été SUPPRIMÉES, pas
 * commentées : une entrée commentée finit par être décommentée par erreur.
 * L'état complet à 62 marques est conservé et restaurable —
 * branche `backup/catalogue-62-brands-full`, commit 5966e32.
 * Voir doc/tr-028-catalogue-reduction.md §2 pour la liste des retraits.
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
  /**
   * Décision de DESIGN — jamais une donnée de vente. Depuis la réduction du
   * 2026-08-24, les 14 entrées du catalogue sont mises en avant.
   */
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


/**
 * LES 14 ARTICLES RETENUS — liste FERMÉE arrêtée par le propriétaire du site
 * le 2026-08-24. Ajouter une marque ici est une décision commerciale, pas une
 * décision technique : elle doit venir du client.
 *
 * `featured` vaut `true` sur les 14. Ce n'est plus une sélection : à 14
 * articles, mettre « 12 des 14 » en avant sur la page d'accueil reviendrait à
 * cacher deux références sans qu'aucune règle ne le justifie.
 */
export const BRANDS: BrandRecord[] = [
  // ── A · CARBONATED SOFT DRINKS — 10 ──────────────────────────────────
  b('7up', '7UP', 'carbonated', { featured: true, searchTerms: ['seven up', '7 up'] }),
  b('coca-cola', 'Coca-Cola', 'carbonated', {
    featured: true,
    searchTerms: ['coke', 'coca cola'],
  }),
  b('dr-pepper', 'Dr Pepper', 'carbonated', { featured: true, intl: true }),
  b('fanta', 'Fanta', 'carbonated', { featured: true, intl: true }),
  b('mirinda', 'Mirinda', 'carbonated', { featured: true }),
  b('mountain-dew', 'Mountain Dew', 'carbonated', {
    featured: true,
    intl: true,
    searchTerms: ['mtn dew'],
  }),
  b('orangina', 'Orangina', 'carbonated', { featured: true }),
  b('pepsi', 'Pepsi', 'carbonated', { featured: true, intl: true }),
  b('schweppes', 'Schweppes', 'carbonated', { featured: true }),
  b('sprite', 'Sprite', 'carbonated', { featured: true }),

  // ── B · ENERGY · SPORT · FUNCTIONAL — 2 ──────────────────────────────
  b('monster-energy', 'Monster Energy', 'energy-sport', {
    featured: true,
    searchTerms: ['monster'],
  }),
  b('red-bull', 'Red Bull', 'energy-sport', { featured: true, searchTerms: ['redbull'] }),

  // ── C · JUICES · FRUIT · TROPICAL — 1 ────────────────────────────────
  b('capri-sun', 'Capri-Sun', 'juice-fruit', { featured: true, searchTerms: ['caprisun'] }),

  // ── D · ICED TEA — 1 ─────────────────────────────────────────────────
  //
  // ⚠️ Entrée créée le 2026-08-24 sur demande du propriétaire. « Lipton »
  // figurait jusque-là dans `exclusions.ts` en « Thé — hors périmètre
  // absolu ». L'exclusion de la marque a été levée, mais la restriction de
  // périmètre est CONSERVÉE ici : le catalogue publie les thés glacés prêts à
  // boire, jamais le thé en sachet ni les infusions. Sans cette `scopeNote`,
  // la levée de l'exclusion aurait ouvert la marque entière.
  b('lipton-ice-tea', 'Lipton Ice Tea', 'iced-tea', {
    featured: true,
    brandLevelOnly: {
      en: 'Ready-to-drink iced teas only — not the tea range. Specific SKUs not confirmed.',
      de: 'Nur trinkfertige Eistees — kein Teesortiment. Konkrete Artikel nicht bestätigt.',
    },
    searchTerms: ['lipton', 'ice tea', 'icetea', 'eistee'],
  }),
];
