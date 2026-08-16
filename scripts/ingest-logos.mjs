/**
 * INGESTION DES LOGOS DE MARQUE.
 *
 * Transforme les PNG fournis par le client en assets web, SANS jamais toucher
 * au catalogue : une image ne crée pas une marque, et une marque absente du
 * catalogue publiable voit son fichier ignoré.
 *
 *   node scripts/ingest-logos.mjs <dossier-source> <match.json>
 *
 * Traitement, dans cet ordre :
 *   1. détourage du fond blanc uniforme par remplissage depuis les bords
 *      (un blanc INTÉRIEUR n'est jamais atteint, donc jamais effacé) ;
 *   2. rognage des marges devenues transparentes ;
 *   3. export WebP (rendu) + PNG (source détourée, archivée).
 *
 * Le produit n'est ni étiré, ni recadré, ni recoloré. Le ratio est conservé.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { detour } from './lib-detour.mjs';

const [, , SRC, MATCH] = process.argv;
const matched = JSON.parse(readFileSync(MATCH, 'utf8')).MATCHED_PUBLISHABLE;

/** Largeur de rendu. Les sources font 1080px : on ne sur-échantillonne jamais. */
const TARGET_WIDTH = 640;

const registry = [];

for (const entry of matched) {
  const dir = `src/assets/brands/${entry.slug}`;
  mkdirSync(dir, { recursive: true });

  const { buffer } = await detour(`${SRC}/${entry.file}`);
  const trimmed = await sharp(buffer).trim({ threshold: 1 }).toBuffer();
  const meta = await sharp(trimmed).metadata();

  // Jamais d'agrandissement : `withoutEnlargement` protège la netteté.
  const resized = await sharp(trimmed)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .toBuffer();
  const outMeta = await sharp(resized).metadata();

  const webp = await sharp(resized).webp({ quality: 92, effort: 6 }).toBuffer();
  const png = await sharp(resized).png({ compressionLevel: 9 }).toBuffer();

  const useWebp = webp.length <= png.length;
  const bytes = useWebp ? webp : png;
  const ext = useWebp ? 'webp' : 'png';
  const path = `${dir}/logo.${ext}`;
  writeFileSync(path, bytes);

  registry.push({
    id: `${entry.slug}:logo`,
    slug: entry.slug,
    brand: entry.brand,
    path,
    width: outMeta.width,
    height: outMeta.height,
    format: ext,
    bytes: bytes.length,
    checksum: createHash('sha256').update(bytes).digest('hex'),
    sourceFile: entry.file,
    sourceWidth: meta.width,
    sourceHeight: meta.height,
  });
}

writeFileSync('scripts/.logos-ingested.json', JSON.stringify(registry, null, 2));
console.log(`${registry.length} logos ingérés`);
console.log(`poids total : ${(registry.reduce((a, r) => a + r.bytes, 0) / 1024).toFixed(0)} Ko`);
console.log(`webp : ${registry.filter((r) => r.format === 'webp').length} · png : ${registry.filter((r) => r.format === 'png').length}`);
