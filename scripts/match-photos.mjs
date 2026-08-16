/**
 * APPARIEMENT CONTRÔLÉ — fichiers d'archive → catalogue publiable.
 *
 * Ce script ne DÉCIDE rien et n'écrit dans aucune donnée de catalogue. Il
 * rapproche, et range tout ce qui n'est pas une correspondance certaine dans
 * une liste à confirmer humainement.
 *
 * Le catalogue lui est fourni en JSON, produit par le TypeScript réel — pas
 * ré-analysé à coups d'expressions régulières : une lecture approximative des
 * sources donnerait un décompte faux, donc un audit faux.
 *
 *   node scripts/match-photos.mjs <dossier-png> <catalogue.json>
 */
import { readdirSync, readFileSync } from 'node:fs';

const [, , DIR, CATALOGUE] = process.argv;
const { brands, exclusions } = JSON.parse(readFileSync(CATALOGUE, 'utf8'));

/** Normalisation pour comparer un nom de fichier à un nom de marque. */
const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\.png$/, '')
    .replace(/^logo[-_ ]*/, '')
    .replace(/[^a-z0-9]/g, '');

/**
 * ALIAS EXPLICITES — chacun est une décision, jamais une déduction.
 * Le nom de fichier diffère du nom de marque pour une raison identifiable :
 * abréviation commerciale, orthographe raccourcie, ou nom partiel.
 * Tout ce qui n'est pas ici et ne correspond pas exactement part en
 * REQUIRES_MAPPING_CONFIRMATION.
 */
const ALIASES = {
  aloevera: 'tropical-aloe-vera',   // « Aloe-Vera.png » → Tropical Aloe Vera
  guarana: 'guarana-antarctica',    // « Guarana.png »   → Guaraná Antarctica
  monster: 'monster-energy',        // « Monster.png »   → Monster Energy
  slammers: 'slammers-energy',      // « Slammers.png »  → Slammers Energy
  yummymiami: 'yummy-miami-soda',   // « Logo-Yummy-Miami.png » → Yummy Miami Soda
  drfoots: 'dr-foots',              // « Dr.Foots_.png » → Dr Foots
  drpepper: 'dr-pepper',            // « Dr.Pepper.png » → Dr Pepper
};

const bySlug = new Map(brands.map((b) => [b.slug, b]));
const byNormBrand = new Map(brands.map((b) => [norm(b.brand), b]));
const byNormSlug = new Map(brands.map((b) => [norm(b.slug), b]));

const exBySlug = new Map(exclusions.map((e) => [e.slug, e]));
const exByLabel = new Map(exclusions.map((e) => [norm(e.label), e]));
const exByNormSlug = new Map(exclusions.map((e) => [norm(e.slug), e]));

const files = readdirSync(DIR).filter((f) => /\.png$/i.test(f)).sort();

const matched = [];
const excluded = [];
const unsure = [];

for (const file of files) {
  const key = norm(file);
  const alias = ALIASES[key];

  // 1. Exclusions D'ABORD : une marque exclue ne doit jamais pouvoir être
  //    appariée à une entrée publiable par coïncidence de normalisation.
  const ex = exBySlug.get(alias ?? key) ?? exByNormSlug.get(key) ?? exByLabel.get(key);
  if (ex) {
    excluded.push({ file, slug: ex.slug, label: ex.label, reason: ex.reason });
    continue;
  }

  const brand = alias ? bySlug.get(alias) : (byNormSlug.get(key) ?? byNormBrand.get(key));
  if (brand) {
    matched.push({
      file,
      slug: brand.slug,
      brand: brand.brand,
      category: brand.category,
      featured: brand.featured,
      skuPolicy: brand.skuPolicy,
      via: alias ? 'alias' : 'direct',
    });
    continue;
  }

  unsure.push({ file, normalised: key });
}

const withImage = new Set(matched.map((m) => m.slug));

console.log(
  JSON.stringify(
    {
      totals: {
        png: files.length,
        cataloguePublishable: brands.length,
        exclusions: exclusions.length,
        MATCHED_PUBLISHABLE: matched.length,
        EXCLUDED_BY_SCOPE: excluded.length,
        REQUIRES_MAPPING_CONFIRMATION: unsure.length,
        NO_IMAGE_AVAILABLE: brands.length - withImage.size,
      },
      MATCHED_PUBLISHABLE: matched,
      EXCLUDED_BY_SCOPE: excluded,
      REQUIRES_MAPPING_CONFIRMATION: unsure,
      NO_IMAGE_AVAILABLE: brands
        .filter((b) => !withImage.has(b.slug))
        .map((b) => ({ slug: b.slug, brand: b.brand, category: b.category, featured: b.featured })),
    },
    null,
    2,
  ),
);
