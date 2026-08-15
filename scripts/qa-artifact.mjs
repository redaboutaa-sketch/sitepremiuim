/**
 * GATE 3 — AUDIT DE L'ARTEFACT DE PRODUCTION.
 *
 * Ce script n'ouvre AUCUN fichier source. Il n'inspecte que `dist/`, c'est-à-
 * dire exactement ce qui sera téléversé chez Hostinger. La distinction est le
 * point de tout l'exercice : un code source correct qui produit un artefact
 * incorrect reste un site incorrect, et seule cette lecture-là peut le voir.
 *
 * Exécution : node scripts/qa-artifact.mjs
 * Sortie    : rapport lisible + code 1 si un contrôle BLOQUANT échoue.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
const SITE = 'https://www.ivan-arsenov.de';

const ROUTES = [
  ['home', 'index.html', 'en', '/'],
  ['drinks', 'drinks/index.html', 'en', '/drinks/'],
  ['brands', 'brands/index.html', 'en', '/brands/'],
  ['about', 'about/index.html', 'en', '/about/'],
  ['contact', 'contact/index.html', 'en', '/contact/'],
  ['imprint', 'imprint/index.html', 'en', '/imprint/'],
  ['privacy', 'privacy/index.html', 'en', '/privacy/'],
  ['cookies', 'cookies/index.html', 'en', '/cookies/'],
  ['de-home', 'de/index.html', 'de', '/de/'],
  ['de-drinks', 'de/getraenke/index.html', 'de', '/de/getraenke/'],
  ['de-brands', 'de/marken/index.html', 'de', '/de/marken/'],
  ['de-about', 'de/ueber-uns/index.html', 'de', '/de/ueber-uns/'],
  ['de-contact', 'de/kontakt/index.html', 'de', '/de/kontakt/'],
  ['de-imprint', 'de/impressum/index.html', 'de', '/de/impressum/'],
  ['de-privacy', 'de/datenschutz/index.html', 'de', '/de/datenschutz/'],
  ['de-cookies', 'de/cookies/index.html', 'de', '/de/cookies/'],
];

/* ------------------------------------------------------------------ *
 * Journal
 * ------------------------------------------------------------------ */

const results = [];
let blocking = 0;

/** @param {'BLOCK'|'WARN'} severity */
function check(severity, label, ok, detail = '') {
  results.push({ severity, label, ok, detail });
  if (!ok && severity === 'BLOCK') blocking++;
}

const section = (title) => results.push({ section: title });

/* ------------------------------------------------------------------ *
 * Lecture de l'artefact
 * ------------------------------------------------------------------ */

async function exists(path) {
  try {
    await stat(join(DIST, path));
    return true;
  } catch {
    return false;
  }
}

async function walk(dir = DIST) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(relative(DIST, full));
  }
  return out;
}

const html = new Map();
for (const [, file] of ROUTES) {
  if (await exists(file)) html.set(file, await readFile(join(DIST, file), 'utf8'));
}

const files = await walk();

/* ================================================================== *
 * 1 · Complétude
 * ================================================================== */

section('1 · Complétude de l’artefact');

for (const [name, file] of ROUTES) {
  check('BLOCK', `page présente · ${name}`, html.has(file), file);
}

/*
 * Astro traite la 404 à part : malgré `format: 'directory'`, elle sort en
 * `404.html` à la racine. On vérifie donc le nom RÉEL du fichier produit, et
 * que `.htaccess` pointe bien dessus — c'est précisément le genre d'écart
 * entre intention et artefact que cet audit existe pour attraper.
 */
check('BLOCK', '404 générée (404.html à la racine)', await exists('404.html'));
check('BLOCK', 'robots.txt', await exists('robots.txt'));
check('BLOCK', 'sitemap-index.xml', await exists('sitemap-index.xml'));
check('BLOCK', '.htaccess embarqué', await exists('.htaccess'));

/*
 * Le styleguide n'est pas retiré après coup : il est injecté par un plugin
 * conditionné à `dev` ou `STYLEGUIDE=1`, donc structurellement absent d'un
 * build de production. On le vérifie sur l'artefact, pas sur l'intention.
 */
check(
  'BLOCK',
  'page /styleguide/ ABSENTE du build',
  !files.some((f) => f.includes('styleguide')),
  files.filter((f) => f.includes('styleguide')).join(', '),
);

/* ================================================================== *
 * 2 · Canonicalisation et hreflang
 * ================================================================== */

section('2 · Canonicalisation et hreflang');

const PAIR = {
  '/': '/de/',
  '/drinks/': '/de/getraenke/',
  '/brands/': '/de/marken/',
  '/about/': '/de/ueber-uns/',
  '/contact/': '/de/kontakt/',
  '/imprint/': '/de/impressum/',
  '/privacy/': '/de/datenschutz/',
  '/cookies/': '/de/cookies/',
};
const EN_OF = Object.fromEntries(Object.entries(PAIR).map(([en, de]) => [de, en]));

for (const [name, file, locale, path] of ROUTES) {
  const doc = html.get(file);
  if (!doc) continue;

  const canonical = doc.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
  // Règle SPEC CHECK Δ1 : la canonical est TOUJOURS auto-référente. Une page
  // allemande qui canonicalise vers l'anglais se retire elle-même de l'index
  // allemand — l'inverse exact du but recherché.
  check('BLOCK', `canonical auto-référente · ${name}`, canonical === `${SITE}${path}`, canonical);

  check('BLOCK', `lang="${locale}" · ${name}`, new RegExp(`<html[^>]+lang="${locale}"`).test(doc));

  const alts = [...doc.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(
    (m) => [m[1], m[2]],
  );
  const map = Object.fromEntries(alts);
  const enPath = locale === 'en' ? path : EN_OF[path];
  const dePath = locale === 'en' ? PAIR[path] : path;

  check('BLOCK', `hreflang en · ${name}`, map.en === `${SITE}${enPath}`, map.en);
  check('BLOCK', `hreflang de · ${name}`, map.de === `${SITE}${dePath}`, map.de);
  check('BLOCK', `x-default → EN · ${name}`, map['x-default'] === `${SITE}${enPath}`, map['x-default']);
}

/* ================================================================== *
 * 3 · Véracité — aucune affirmation non vérifiable
 * ================================================================== */

section('3 · Véracité du contenu publié');

/**
 * Ces motifs sont cherchés dans le HTML LIVRÉ, pas dans les sources : c'est
 * la seule lecture qui prouve qu'aucune affirmation inventée n'a été
 * introduite en cours de route, par un composant ou par une traduction.
 */
const FORBIDDEN = [
  [/\bin stock\b/i, 'disponibilité affirmée (EN)'],
  [/\bauf lager\b/i, 'disponibilité affirmée (DE)'],
  [/\bsofort lieferbar\b/i, 'disponibilité affirmée (DE)'],
  [/\bISO ?\d{4}/i, 'certification non établie'],
  [/\bIFS\b|\bBRC\b|\bHACCP\b/, 'certification non établie'],
  [/\b\d+\s*(years?|Jahre)\s+(of\s+)?(experience|Erfahrung)/i, 'ancienneté chiffrée'],
  [/\b\d+\+?\s*(satisfied\s+)?(clients?|customers?|Kunden)\b/i, 'nombre de clients'],
  [/\bwithin\s+\d+\s*(hours?|days?)/i, 'délai promis (EN)'],
  [/\binnerhalb von\s+\d+\s*(Stunden|Tagen)/i, 'délai promis (DE)'],
  [/\b(24|48)\s?h\b/i, 'délai promis'],
  [/\bfree\s+(shipping|delivery)\b/i, 'condition commerciale inventée'],
  [/\bmarket\s+leader\b|\bMarktführer\b/i, 'position de marché non établie'],
  [/\bcertified\b|\bzertifiziert\b/i, 'certification non établie'],
  [/[€$£]\s?\d/, 'prix affiché'],
  [/\bcart\b|\bWarenkorb\b|\bcheckout\b|\bzur Kasse\b/i, 'vocabulaire e-commerce'],
];

for (const [name, file] of ROUTES) {
  const doc = html.get(file);
  if (!doc) continue;
  // On ne teste que le texte rendu, pas les attributs ni le JSON-LD.
  const text = doc
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ');

  for (const [pattern, why] of FORBIDDEN) {
    const hit = text.match(pattern);
    check('BLOCK', `${why} absent · ${name}`, hit === null, hit ? `« ${hit[0]} »` : '');
  }
}

/* ================================================================== *
 * 4 · Données structurées
 * ================================================================== */

section('4 · Données structurées');

for (const [name, file] of ROUTES) {
  const doc = html.get(file);
  if (!doc) continue;
  const raw = doc.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  check('BLOCK', `JSON-LD présent · ${name}`, Boolean(raw));
  if (!raw) continue;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    check('BLOCK', `JSON-LD valide · ${name}`, false, String(error));
    continue;
  }
  check('BLOCK', `JSON-LD valide · ${name}`, true);

  const flat = JSON.stringify(parsed);
  // Balisage inventé = fausse déclaration. Rien de tout cela n'est établi.
  for (const key of ['aggregateRating', 'review', 'priceRange', 'openingHours', 'offers']) {
    check('BLOCK', `aucun ${key} inventé · ${name}`, !flat.includes(key));
  }
}

/* ================================================================== *
 * 5 · Assets — aucun visuel non autorisé publié
 * ================================================================== */

section('5 · Assets');

const images = files.filter((f) => /\.(png|jpe?g|webp|avif|gif)$/i.test(f));
check(
  'BLOCK',
  'aucun packshot produit publié (aucun n’est validé)',
  images.length === 0,
  images.join(', '),
);

const svgs = files.filter((f) => f.endsWith('.svg'));
check('WARN', 'SVG embarqués', true, svgs.join(', ') || 'aucun');

for (const [name, file] of ROUTES) {
  const doc = html.get(file);
  if (!doc) continue;
  const remote = [...doc.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => !u.startsWith(SITE));
  check('BLOCK', `aucune ressource distante · ${name}`, remote.length === 0, remote.join(', '));
}

/* ================================================================== *
 * 6 · Sitemap
 * ================================================================== */

section('6 · Sitemap');

const sitemapFile = files.find((f) => /^sitemap-\d+\.xml$/.test(f));
check('BLOCK', 'fichier sitemap-N.xml', Boolean(sitemapFile), sitemapFile ?? '');

if (sitemapFile) {
  const xml = await readFile(join(DIST, sitemapFile), 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const links = (xml.match(/<xhtml:link/g) ?? []).length;

  check('BLOCK', '16 URLs au sitemap', urls.length === 16, String(urls.length));
  // 16 routes × 3 déclarations (en, de, x-default).
  check('BLOCK', '48 alternates xhtml', links === 48, String(links));
  check('BLOCK', 'styleguide hors sitemap', !urls.some((u) => u.includes('styleguide')));
  check('BLOCK', '404 hors sitemap', !urls.some((u) => u.includes('/404')));
}

/* ================================================================== *
 * 7 · Configuration serveur livrée
 * ================================================================== */

section('7 · Configuration serveur');

if (await exists('.htaccess')) {
  const conf = await readFile(join(DIST, '.htaccess'), 'utf8');
  check('BLOCK', 'redirection HTTPS + www', /RewriteRule.*https:\/\/www\./.test(conf));
  const errorDoc = conf.match(/ErrorDocument 404\s+(\S+)/)?.[1] ?? '';
  check('BLOCK', 'ErrorDocument 404 déclaré', errorDoc !== '');
  // Le chemin déclaré doit exister DANS l'artefact, pas seulement être écrit.
  check(
    'BLOCK',
    'ErrorDocument 404 pointe sur un fichier réellement produit',
    errorDoc !== '' && (await exists(errorDoc.replace(/^\//, ''))),
    errorDoc,
  );
  check('BLOCK', 'Content-Security-Policy', /Content-Security-Policy/.test(conf));
  check('BLOCK', 'form-action verrouillé', /form-action 'self'/.test(conf));
  check('BLOCK', 'config.local.php non servie', /<Files "config\.local\.php">/.test(conf));
  check('WARN', 'compression déclarée', /mod_deflate/.test(conf));
  check('WARN', 'cache long sur assets empreintés', /immutable/.test(conf));
}

/* ================================================================== *
 * 8 · Transport du formulaire
 * ================================================================== */

section('8 · Transport du formulaire');

const contact = html.get('contact/index.html') ?? '';
check('BLOCK', 'formulaire pointe sur /api/enquiry.php', contact.includes('action="/api/enquiry.php"'));
check('BLOCK', 'endpoint PHP NON déployé dans dist/', !files.some((f) => f.endsWith('.php')));
check(
  'BLOCK',
  'aucune promesse d’envoi dans le HTML livré',
  !/your enquiry has been sent|wurde gesendet/i.test(contact),
);

/* ------------------------------------------------------------------ *
 * Rapport
 * ------------------------------------------------------------------ */

console.log('\nAUDIT DE L’ARTEFACT — dist/\n');

let passed = 0;
let warned = 0;

for (const row of results) {
  if (row.section) {
    console.log(`\n  ${row.section}`);
    continue;
  }
  if (row.ok) {
    passed++;
    continue;
  }
  if (row.severity === 'WARN') warned++;
  const mark = row.severity === 'BLOCK' ? '✗ BLOQUANT' : '! ';
  console.log(`    ${mark} ${row.label}${row.detail ? ` — ${row.detail}` : ''}`);
}

const total = results.filter((r) => !r.section).length;
console.log(`\n  ${passed}/${total} contrôles passés · ${blocking} bloquant(s) · ${warned} avertissement(s)`);
console.log(`  ${files.length} fichiers dans dist/\n`);

process.exit(blocking > 0 ? 1 : 0);
