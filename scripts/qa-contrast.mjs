/**
 * QA — contrastes WCAG 2.2.
 *
 * Lit les valeurs DIRECTEMENT dans src/styles/tokens.css : le script ne peut
 * pas diverger du design system, puisqu'il n'en recopie aucune valeur.
 *
 * Seuils appliqués :
 *   - texte normal          ≥ 4.5:1  (AA)
 *   - texte large / UI      ≥ 3.0:1  (AA)
 *
 * Exécution : npm run qa:contrast
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const css = await readFile(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

/** Extrait la valeur d'une custom property, première occurrence. */
function token(name) {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`));
  if (!m) throw new Error(`token --${name} introuvable dans tokens.css`);
  return m[1];
}

function toRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Luminance relative, WCAG 2.x. */
function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function level(r) {
  if (r >= 7) return 'AAA';
  if (r >= 4.5) return 'AA';
  if (r >= 3) return 'AA-large';
  return 'FAIL';
}

const INK = token('ink-900');
const PAPER = token('paper');
const PAPER_ALT = token('paper-alt');

/** [libellé, premier plan, arrière-plan, seuil requis] */
const PAIRS = [
  ['text-primary / ink-900', token('text-primary'), INK, 4.5],
  ['text-secondary / ink-900', token('text-secondary'), INK, 4.5],
  ['text-muted / ink-900  (plancher)', token('text-muted'), INK, 4.5],
  ['text-on-paper / paper', token('text-on-paper'), PAPER, 4.5],
  ['text-on-paper-sec / paper', token('text-on-paper-sec'), PAPER, 4.5],
  ['text-on-paper-muted / paper', token('text-on-paper-muted'), PAPER, 4.5],

  /*
   * Il existe DEUX surfaces claires. Ne vérifier que `paper` laissait passer
   * du texte conforme dans ce fichier et non conforme à l'écran : le plateau
   * de repli typographique pose le gris atténué sur `paper-alt`, où il
   * tombait à 4,14:1. Toute couleur pouvant atterrir sur l'une ou l'autre est
   * désormais vérifiée sur les deux.
   */
  ['text-on-paper / paper-alt', token('text-on-paper'), PAPER_ALT, 4.5],
  ['text-on-paper-sec / paper-alt', token('text-on-paper-sec'), PAPER_ALT, 4.5],
  ['text-on-paper-muted / paper-alt  (plancher)', token('text-on-paper-muted'), PAPER_ALT, 4.5],

  // Variantes texte des signaux sur surface CLAIRE — le second jeu, assombri.
  ['signal-carbonated-on-paper / paper-alt', token('signal-carbonated-on-paper'), PAPER_ALT, 4.5],
  ['signal-energy-on-paper / paper-alt', token('signal-energy-on-paper'), PAPER_ALT, 4.5],
  ['signal-water-on-paper / paper-alt', token('signal-water-on-paper'), PAPER_ALT, 4.5],
  ['signal-juice-on-paper / paper-alt', token('signal-juice-on-paper'), PAPER_ALT, 4.5],
  [
    'signal-international-on-paper / paper-alt',
    token('signal-international-on-paper'),
    PAPER_ALT,
    4.5,
  ],

  // Variantes texte des signaux — seules autorisées pour du texte coloré.
  ['signal-carbonated-text / ink-900', token('signal-carbonated-text'), INK, 4.5],
  ['signal-energy-text / ink-900', token('signal-energy-text'), INK, 4.5],
  ['signal-water-text / ink-900', token('signal-water-text'), INK, 4.5],
  ['signal-juice-text / ink-900', token('signal-juice-text'), INK, 4.5],
  ['signal-international-text / ink-900', token('signal-international-text'), INK, 4.5],

  // Signaux graphiques — non textuels, seuil composant d'interface.
  ['signal-carbonated / ink-900  (graphique)', token('signal-carbonated'), INK, 3],
  ['signal-energy / ink-900  (graphique)', token('signal-energy'), INK, 3],
  ['signal-water / ink-900  (graphique)', token('signal-water'), INK, 3],
  ['signal-juice / ink-900  (graphique)', token('signal-juice'), INK, 3],
  ['signal-international / ink-900  (graphique)', token('signal-international'), INK, 3],

  // CTA primaire — inversion de valeur.
  ['ink-900 sur paper  (CTA primaire)', INK, PAPER, 4.5],
  ['paper sur ink-900  (focus ring)', PAPER, INK, 3],
];

console.log('\nQA CONTRASTES — src/styles/tokens.css\n');

let failed = 0;

for (const [label, fg, bg, min] of PAIRS) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  const mark = ok ? '✓' : '✗';
  console.log(
    `  ${mark} ${label.padEnd(42)} ${r.toFixed(2).padStart(6)}:1  ` +
      `${level(r).padEnd(9)} (requis ${min})`,
  );
}

console.log('');

if (failed > 0) {
  console.error(`  ${failed} PAIRE(S) SOUS LE SEUIL\n`);
  process.exit(1);
}

console.log(`  PASS — ${PAIRS.length} paires vérifiées, toutes au-dessus du seuil\n`);
