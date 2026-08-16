/**
 * PIPELINE D'ASSETS
 *
 * Dérive le registre complet du catalogue, puis décide — par environnement —
 * si un asset est publiable ou s'il faut basculer sur le repli typographique.
 *
 * Le contrôle porte sur L'ASSET, jamais sur le build entier : une marque n'est
 * jamais retirée du site parce que son visuel n'est pas validé. Seul le visuel
 * l'est, et la marque reste au catalogue avec son repli.
 */

import { ASSET_OVERRIDES, HERO_BRANDS, STANDALONE_ASSETS } from '../data/assets';
import type {
  AssetPriority,
  AssetRecord,
  AssetStatus,
  AssetUsage,
} from '../data/assets';
import { catalog, type Brand } from './catalog';

export type { AssetRecord, AssetStatus, AssetUsage, AssetPriority };
export { HERO_BRANDS };

/**
 * Mode de rendu.
 *  · `staging`    — les assets `requires_validation` sont rendus, afin de
 *                   juger le design complet avant validation juridique ;
 *  · `production` — seuls les assets `validated` sont publiés.
 */
export type AssetMode = 'staging' | 'production';

export function currentMode(): AssetMode {
  return process.env.ASSET_MODE === 'staging' ? 'staging' : 'production';
}

const heroSet = new Set<string>(HERO_BRANDS);

/** Racine de rangement d'une marque. Aucun fichier ailleurs. */
export const assetDir = (slug: string) => `src/assets/brands/${slug}`;

/** Convention de nommage — voir doc/assets-guide.md. */
export const expectedFilename = (usage: AssetUsage): string =>
  ({
    logo: 'logo.svg',
    packshot: 'packshot.png',
    'packshot-alt': 'packshot-alt.png',
    hero: 'hero.png',
    monogram: 'monogram.svg',
    lockup: 'lockup.svg',
    wordmark: 'wordmark.svg',
    favicon: 'favicon.svg',
    og: 'og.png',
  })[usage];

/** Usages attendus pour une marque, selon son rang. */
function usagesFor(brand: Brand): AssetUsage[] {
  const usages: AssetUsage[] = ['logo'];
  if (brand.featured) usages.push('packshot');
  if (heroSet.has(brand.slug)) usages.push('hero');
  return usages;
}

/**
 * Priorité d'un asset NON-hero.
 *
 * Le rang `hero` est réservé aux six packshots de la scène d'accueil — et à
 * eux seuls. Le logo d'une marque du hero reste un logo de marque featured :
 * agréger les trois usages sous « hero » diluerait précisément la distinction
 * qu'on cherche à établir.
 */
function priorityFor(brand: Brand): AssetPriority {
  return brand.featured ? 'featured' : 'catalogue';
}

function blank(brand: Brand, usage: AssetUsage): AssetRecord {
  return {
    id: `${brand.slug}:${usage}`,
    brandSlug: brand.slug,
    brandLabel: brand.brand,
    usage,
    priority: usage === 'hero' ? 'hero' : priorityFor(brand),
    path: null,
    status: 'missing',
    source: null,
    // Par défaut inconnu : l'autorisation doit être POSITIVEMENT établie,
    // jamais supposée. Un statut inconnu bloque la production.
    authorization: { status: 'unknown', evidence: null },
    width: null,
    height: null,
    format: null,
    bytes: null,
    checksum: null,
    opticalCoverage: null,
    // EN : langue source éditoriale du projet, forme de référence du registre.
    legalNote: brand.skuPolicy === 'brand-level-only' ? (brand.scopeNote?.en ?? null) : null,
  };
}

/** Registre complet : squelette dérivé du catalogue + surcharges manuelles. */
export function registry(): AssetRecord[] {
  const out: AssetRecord[] = [...STANDALONE_ASSETS];

  for (const brand of catalog) {
    for (const usage of usagesFor(brand)) {
      const base = blank(brand, usage);
      const override = ASSET_OVERRIDES[base.id];
      out.push(override ? { ...base, ...override } : base);
    }
  }

  return out;
}

/* ------------------------------------------------------------------ *
 * Éligibilité
 * ------------------------------------------------------------------ */

/**
 * Un asset n'est publiable en production que si TOUTES ces conditions
 * sont réunies. L'absence d'information vaut refus.
 */
export function productionEligible(a: AssetRecord): boolean {
  return (
    a.status === 'validated' &&
    a.path !== null &&
    a.checksum !== null &&
    (a.authorization.status === 'granted' || a.authorization.status === 'referential-use')
  );
}

/** En staging, tout fichier existant est rendu, sauf refus explicite. */
export function stagingRenderable(a: AssetRecord): boolean {
  return a.path !== null && a.status !== 'missing' && a.authorization.status !== 'denied';
}

export function renderable(a: AssetRecord, mode: AssetMode = currentMode()): boolean {
  return mode === 'staging' ? stagingRenderable(a) : productionEligible(a);
}

/**
 * Résout l'asset à afficher.
 * `null` signifie : basculer sur le repli typographique — la marque reste
 * affichée, seul son visuel est remplacé.
 */
export function resolve(
  brandSlug: string,
  usage: AssetUsage,
  mode: AssetMode = currentMode(),
): AssetRecord | null {
  const found = registry().find((a) => a.id === `${brandSlug}:${usage}`);
  if (!found) return null;
  return renderable(found, mode) ? found : null;
}

/* ------------------------------------------------------------------ *
 * Rapport
 * ------------------------------------------------------------------ */

export interface AssetReport {
  total: number;
  byStatus: Record<AssetStatus, number>;
  byPriority: Record<AssetPriority, { total: number; validated: number }>;
  /** Assets substitués par le repli en production. */
  substitutedInProduction: AssetRecord[];
  /** Fichiers existants dont l'autorisation n'est pas établie. */
  authorizationUnknown: AssetRecord[];
  hero: AssetRecord[];
}

export function report(): AssetReport {
  const all = registry();

  const byStatus: Record<AssetStatus, number> = {
    validated: 0,
    requires_validation: 0,
    missing: 0,
  };
  const byPriority: AssetReport['byPriority'] = {
    hero: { total: 0, validated: 0 },
    identity: { total: 0, validated: 0 },
    featured: { total: 0, validated: 0 },
    catalogue: { total: 0, validated: 0 },
  };

  for (const a of all) {
    byStatus[a.status]++;
    byPriority[a.priority].total++;
    if (productionEligible(a)) byPriority[a.priority].validated++;
  }

  return {
    total: all.length,
    byStatus,
    byPriority,
    substitutedInProduction: all.filter((a) => !productionEligible(a)),
    authorizationUnknown: all.filter(
      (a) => a.path !== null && a.authorization.status === 'unknown',
    ),
    hero: all.filter((a) => a.usage === 'hero'),
  };
}
