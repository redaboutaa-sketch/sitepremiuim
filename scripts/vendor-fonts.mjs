/**
 * Vendorisation des polices.
 *
 * Télécharge Instrument Serif et Archivo depuis Google Fonts UNE SEULE FOIS,
 * les écrit dans `public/fonts/` et génère `src/styles/fonts.css` avec des
 * chemins locaux.
 *
 * Le site en production n'émet AUCUNE requête vers Google : c'est une exigence
 * de performance et une exigence RGPD (l'appel à fonts.gstatic.com transmet
 * l'IP du visiteur à un tiers).
 *
 * Les deux familles sont sous SIL Open Font License 1.1 — l'auto-hébergement
 * est expressément autorisé.
 *
 * Exécution : node scripts/vendor-fonts.mjs   (uniquement quand les polices changent)
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const FONT_DIR = resolve(process.cwd(), 'public/fonts');
const CSS_OUT = resolve(process.cwd(), 'src/styles/fonts.css');

/**
 * Sous-jeux conservés : latin (base) et latin-ext.
 * latin-ext est nécessaire — l'allemand y puise certains caractères, et le
 * catalogue contient des marques comme Kızılay (ı) ou Guaraná (á).
 * Tout le reste (cyrillique, grec, vietnamien) est écarté : poids inutile.
 */
const KEEP_SUBSETS = new Set(['latin', 'latin-ext']);

const FAMILIES = [
  {
    name: 'Instrument Serif',
    slug: 'instrument-serif',
    query: 'Instrument+Serif:ital@0;1',
  },
  {
    // Axes wdth + wght : la largeur variable sert les labels en petites
    // capitales étirées, signature typographique du site.
    name: 'Archivo',
    slug: 'archivo',
    query: 'Archivo:wdth,wght@62..125,400..700',
  },
];

/** Découpe la CSS Google en blocs @font-face annotés de leur sous-jeu. */
function parseFaces(css) {
  const faces = [];
  const re = /\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const [, subset, body] = m;
    const get = (prop) => {
      const mm = body.match(new RegExp(`${prop}:\\s*([^;]+);`));
      return mm ? mm[1].trim() : null;
    };
    const urlMatch = body.match(/url\(([^)]+)\)/);
    faces.push({
      subset,
      url: urlMatch ? urlMatch[1] : null,
      style: get('font-style') ?? 'normal',
      weight: get('font-weight') ?? '400',
      stretch: get('font-stretch'),
      unicodeRange: get('unicode-range'),
    });
  }
  return faces;
}

await mkdir(FONT_DIR, { recursive: true });

const blocks = [];
let downloaded = 0;
let skipped = 0;

for (const family of FAMILIES) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family.query}&display=swap`;
  const res = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`CSS ${family.name}: HTTP ${res.status}`);
  const css = await res.text();

  for (const face of parseFaces(css)) {
    if (!KEEP_SUBSETS.has(face.subset) || !face.url) {
      skipped++;
      continue;
    }

    const italic = face.style === 'italic';
    const filename = `${family.slug}-${face.subset}${italic ? '-italic' : ''}.woff2`;

    const bin = await fetch(face.url, { headers: { 'User-Agent': UA } });
    if (!bin.ok) throw new Error(`Fichier ${filename}: HTTP ${bin.status}`);
    const buf = Buffer.from(await bin.arrayBuffer());
    await writeFile(resolve(FONT_DIR, filename), buf);
    downloaded++;

    blocks.push(
      [
        `/* ${family.name} — ${face.subset}${italic ? ' italic' : ''} */`,
        `@font-face {`,
        `  font-family: '${family.name}';`,
        `  font-style: ${face.style};`,
        `  font-weight: ${face.weight};`,
        face.stretch ? `  font-stretch: ${face.stretch};` : null,
        `  font-display: swap;`,
        `  src: url('/fonts/${filename}') format('woff2');`,
        `  unicode-range: ${face.unicodeRange};`,
        `}`,
      ]
        .filter(Boolean)
        .join('\n'),
    );

    console.log(`  ✓ ${filename}  ${(buf.length / 1024).toFixed(1)} KB`);
  }
}

const header = `/*
 * GÉNÉRÉ PAR scripts/vendor-fonts.mjs — NE PAS ÉDITER À LA MAIN.
 *
 * Polices auto-hébergées. Le site n'émet aucune requête vers un CDN :
 * exigence de performance et de protection des données (aucune IP visiteur
 * transmise à un tiers).
 *
 * Instrument Serif et Archivo — SIL Open Font License 1.1.
 */

`;

await writeFile(CSS_OUT, header + blocks.join('\n\n') + '\n');

console.log(`\n  ${downloaded} fichier(s) écrits, ${skipped} sous-jeu(x) écarté(s)`);
console.log(`  CSS → src/styles/fonts.css\n`);
