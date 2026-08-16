/**
 * CATALOGUE — schéma, validation et accesseurs.
 *
 * La validation s'exécute à l'import du module. Toute page qui touche au
 * catalogue le charge, donc une donnée invalide FAIT ÉCHOUER LE BUILD —
 * elle ne peut pas atteindre une page.
 *
 * Quatre contrôles bloquants (doc/catalog.md §6) :
 *   1. aucune entrée publiable ne porte un slug de la liste d'exclusions ;
 *   2. aucun slug en doublon ;
 *   3. aucun `productName` sur une marque `brand-level-only` ;
 *   4. aucune `category` hors des 5 familles autorisées.
 */

import { z } from 'zod';

import { BRANDS, type BrandRecord } from '../data/brands';
import { CATEGORIES, CATEGORY_SLUGS, type CategorySlug } from '../data/categories';
import { EXCLUDED_SLUGS, exclusionFor } from '../data/exclusions';

/* ------------------------------------------------------------------ *
 * Schéma
 * ------------------------------------------------------------------ */

export const brandSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, 'slug en minuscules, chiffres et tirets uniquement'),
    brand: z.string().min(1),

    // CONTRÔLE 4 — famille hors des 5 autorisées.
    category: z.enum(CATEGORY_SLUGS),

    productName: z.string().min(1).nullable(),
    subcategory: z.string().min(1).nullable(),
    variant: z.string().min(1).nullable(),
    flavour: z.string().min(1).nullable(),
    country: z.string().min(1).nullable(),
    packageType: z
      .enum(['can', 'bottle-pet', 'bottle-glass', 'pouch', 'carton'])
      .nullable(),
    volume: z.string().min(1).nullable(),
    image: z.string().min(1).nullable(),
    logo: z.string().min(1).nullable(),

    featured: z.boolean(),
    internationalFind: z.boolean(),
    specialEdition: z.boolean(),

    // Aucune autre valeur n'est acceptée tant qu'Ivan n'a rien confirmé :
    // le champ ne peut pas exprimer une disponibilité qui n'existe pas.
    availabilityStatus: z.literal('TBC'),

    assetStatus: z.enum(['validated', 'requires_validation', 'missing']),
    skuPolicy: z.enum(['full', 'brand-level-only']),
    searchTerms: z.array(z.string().min(1)),
    /*
     * Les DEUX langues sont exigées, non vides. Une note de périmètre publiée
     * dans une seule langue laisserait la moitié des visiteurs sans
     * l'information la plus sensible du catalogue — ce que la marque couvre
     * et ce qu'elle ne couvre pas.
     */
    scopeNote: z
      .object({ en: z.string().min(1), de: z.string().min(1) })
      .nullable(),
  })
  .superRefine((entry, ctx) => {
    // CONTRÔLE 1 — marque exclue.
    if (EXCLUDED_SLUGS.has(entry.slug)) {
      const reason = exclusionFor(entry.slug)?.reason ?? 'hors périmètre';
      ctx.addIssue({
        code: 'custom',
        path: ['slug'],
        message: `marque exclue du catalogue publiable : « ${entry.brand} » — ${reason}`,
      });
    }

    // CONTRÔLE 3 — SKU sur une marque restreinte au niveau marque.
    if (entry.skuPolicy === 'brand-level-only' && entry.productName !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['productName'],
        message:
          `« ${entry.brand} » est brand-level-only : aucun productName tant que ` +
          `les SKU admis ne sont pas confirmés (décision D7)`,
      });
    }

    // Une restriction de périmètre doit être documentée, sinon elle se perd.
    if (entry.skuPolicy === 'brand-level-only' && entry.scopeNote === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['scopeNote'],
        message: `« ${entry.brand} » est brand-level-only mais ne documente pas sa restriction`,
      });
    }
  });

export type Brand = z.infer<typeof brandSchema>;

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

export class CatalogValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Catalogue invalide — ${issues.length} anomalie(s) :\n  · ${issues.join('\n  · ')}`);
    this.name = 'CatalogValidationError';
    this.issues = issues;
  }
}

/**
 * Valide un jeu d'entrées et retourne la liste des anomalies.
 * Exposée pour être testable indépendamment des données réelles.
 */
export function collectIssues(entries: readonly unknown[]): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  entries.forEach((raw, i) => {
    const result = brandSchema.safeParse(raw);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const where = issue.path.length ? issue.path.join('.') : '(racine)';
        issues.push(`entrée ${i} · ${where} : ${issue.message}`);
      }
      return;
    }

    // CONTRÔLE 2 — doublon de slug. Cross-entrée, donc hors du schéma.
    if (seen.has(result.data.slug)) {
      issues.push(`entrée ${i} · slug : doublon « ${result.data.slug} »`);
    }
    seen.add(result.data.slug);
  });

  return issues;
}

function validate(entries: readonly unknown[]): Brand[] {
  const issues = collectIssues(entries);
  if (issues.length > 0) throw new CatalogValidationError(issues);
  return entries.map((e) => brandSchema.parse(e));
}

/** Catalogue validé. L'import échoue si une donnée viole une règle. */
export const catalog: Brand[] = validate(BRANDS satisfies BrandRecord[]);

/* ------------------------------------------------------------------ *
 * Accesseurs
 * ------------------------------------------------------------------ */

export { CATEGORIES, CATEGORY_SLUGS };
export type { CategorySlug };

/** Ordre alphabétique insensible à la casse et aux diacritiques. */
const byName = (a: Brand, z_: Brand) =>
  a.brand.localeCompare(z_.brand, 'en', { sensitivity: 'base' });

export const allBrands = (): Brand[] => [...catalog].sort(byName);

/** Les 16 marques mises en avant — décision de DESIGN, jamais de vente. */
export const featuredBrands = (): Brand[] => catalog.filter((b) => b.featured).sort(byName);

export const brandsInCategory = (category: CategorySlug): Brand[] =>
  catalog.filter((b) => b.category === category).sort(byName);

/**
 * Marqueur transversal : une Fanta internationale reste Carbonated et
 * apparaît ici aussi, sans duplication de données.
 */
export const internationalFinds = (): Brand[] =>
  catalog.filter((b) => b.internationalFind).sort(byName);

export const brandBySlug = (slug: string): Brand | undefined =>
  catalog.find((b) => b.slug === slug);

/** Marques dont seul le niveau marque est publiable (décision D7). */
export const brandLevelOnly = (): Brand[] =>
  catalog.filter((b) => b.skuPolicy === 'brand-level-only').sort(byName);

export const categoryBySlug = (slug: CategorySlug) =>
  CATEGORIES.find((c) => c.slug === slug);

/** Index de recherche — marque + alias, normalisé sans diacritiques. */
export function searchIndex(brand: Brand): string {
  return [brand.brand, ...brand.searchTerms]
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export const catalogStats = () => ({
  total: catalog.length,
  featured: catalog.filter((b) => b.featured).length,
  international: catalog.filter((b) => b.internationalFind).length,
  brandLevelOnly: catalog.filter((b) => b.skuPolicy === 'brand-level-only').length,
  byCategory: Object.fromEntries(
    CATEGORY_SLUGS.map((c) => [c, catalog.filter((b) => b.category === c).length]),
  ) as Record<CategorySlug, number>,
});
