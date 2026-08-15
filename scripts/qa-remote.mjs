/**
 * QA D'UN ENVIRONNEMENT DISTANT — préproduction ou production.
 *
 * Interroge un site RÉELLEMENT EN LIGNE. C'est la seule chose qu'un audit de
 * `dist/` ne peut pas faire : un artefact correct mal déployé — `.htaccess`
 * non monté, mauvais répertoire, certificat absent, redirection en boucle —
 * reste un site cassé, et rien dans le dépôt ne le montrera.
 *
 * Aucun navigateur, aucune dépendance : Node seul. Exécutable depuis
 * n'importe quel poste ayant accès au site.
 *
 *   node scripts/qa-remote.mjs https://staging.ivanarsenov.de
 *   node scripts/qa-remote.mjs https://staging.ivanarsenov.de --expect=staging
 *
 * `--expect=staging`   attend noindex, Disallow: /, aucun sitemap
 * `--expect=production` attend index/follow et le sitemap annoncé
 *
 * Sortie : rapport PASS/FAIL, code 1 si un contrôle BLOQUANT échoue.
 */

import { SITE_ORIGIN } from '../site.config.mjs';

const [, , rawBase, ...flags] = process.argv;

if (!rawBase) {
  console.error('usage : node scripts/qa-remote.mjs <url> [--expect=staging|production]');
  process.exit(2);
}

const BASE = rawBase.replace(/\/$/, '');
const EXPECT = (flags.find((f) => f.startsWith('--expect='))?.split('=')[1] ?? 'staging').trim();
const STAGING = EXPECT === 'staging';

/** Les canonicals visent la production, y compris en préproduction (décision documentée). */
const CANONICAL_ORIGIN = SITE_ORIGIN;

const ROUTES = [
  ['home', '/', 'en'],
  ['drinks', '/drinks/', 'en'],
  ['brands', '/brands/', 'en'],
  ['about', '/about/', 'en'],
  ['contact', '/contact/', 'en'],
  ['imprint', '/imprint/', 'en'],
  ['privacy', '/privacy/', 'en'],
  ['cookies', '/cookies/', 'en'],
  ['de-home', '/de/', 'de'],
  ['de-drinks', '/de/getraenke/', 'de'],
  ['de-brands', '/de/marken/', 'de'],
  ['de-about', '/de/ueber-uns/', 'de'],
  ['de-contact', '/de/kontakt/', 'de'],
  ['de-imprint', '/de/impressum/', 'de'],
  ['de-privacy', '/de/datenschutz/', 'de'],
  ['de-cookies', '/de/cookies/', 'de'],
];

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

/* ------------------------------------------------------------------ */

const results = [];
let blocking = 0;

function check(severity, label, ok, detail = '') {
  results.push({ severity, label, ok, detail });
  if (!ok && severity === 'BLOCK') blocking++;
}
const section = (title) => results.push({ section: title });

/** GET sans suivre les redirections — on veut VOIR la chaîne. */
async function fetchRaw(url, method = 'GET') {
  const started = Date.now();
  try {
    const response = await fetch(url, { method, redirect: 'manual' });
    const body = method === 'GET' ? await response.text() : '';
    return { response, body, ms: Date.now() - started, error: null };
  } catch (error) {
    return { response: null, body: '', ms: Date.now() - started, error };
  }
}

/* ================================================================== *
 * 1 · Joignabilité et HTTPS
 * ================================================================== */

section('1 · Joignabilité et HTTPS');

const root = await fetchRaw(`${BASE}/`);
if (root.error) {
  check('BLOCK', 'le site répond', false, String(root.error.cause?.code ?? root.error.message));
  report();
  process.exit(1);
}
check('BLOCK', 'le site répond', true, `HTTP ${root.response.status} en ${root.ms} ms`);
check('BLOCK', 'accueil en 200', root.response.status === 200, String(root.response.status));
check('BLOCK', 'servi en HTTPS', BASE.startsWith('https://'), BASE);

/** Chaîne de redirection depuis le HTTP nu — doit tenir en UN saut. */
const insecure = `${BASE.replace(/^https:/, 'http:')}/drinks/`;
const hop1 = await fetchRaw(insecure);
if (!hop1.error && hop1.response.status >= 300 && hop1.response.status < 400) {
  const to = hop1.response.headers.get('location') ?? '';
  const hop2 = await fetchRaw(to);
  const twoHops = !hop2.error && hop2.response.status >= 300 && hop2.response.status < 400;
  check('BLOCK', 'redirection HTTP→HTTPS en un seul saut', !twoHops, `${insecure} → ${to}`);
  check('BLOCK', 'la redirection préserve le chemin', to.endsWith('/drinks/'), to);
  check('WARN', 'redirection permanente (301)', hop1.response.status === 301, String(hop1.response.status));
} else {
  check('WARN', 'redirection HTTP→HTTPS observée', false, `statut ${hop1.response?.status ?? 'n/a'}`);
}

/** Une boucle se manifeste par une redirection vers soi-même. */
const selfLoop = await fetchRaw(`${BASE}/`);
const loc = selfLoop.response?.headers.get('location') ?? '';
check('BLOCK', 'aucune boucle de redirection', !loc.startsWith(BASE) || loc === '', loc);

/* ================================================================== *
 * 2 · Les 16 routes
 * ================================================================== */

section('2 · Routes');

const pages = new Map();
let totalBytes = 0;
let slowest = { route: '', ms: 0 };

for (const [name, path] of ROUTES) {
  const { response, body, ms, error } = await fetchRaw(`${BASE}${path}`);
  if (error || !response) {
    check('BLOCK', `route servie · ${name}`, false, String(error?.message ?? 'aucune réponse'));
    continue;
  }
  check('BLOCK', `route servie en 200 · ${name}`, response.status === 200, `${response.status} · ${ms} ms`);
  if (response.status === 200) {
    pages.set(path, { body, response, ms });
    totalBytes += Buffer.byteLength(body);
    if (ms > slowest.ms) slowest = { route: path, ms };
  }
}

/** Sans slash final, Apache doit rediriger — pas servir deux URLs. */
const noSlash = await fetchRaw(`${BASE}/drinks`);
check(
  'WARN',
  'l’URL sans slash final redirige',
  !noSlash.error && noSlash.response.status >= 300 && noSlash.response.status < 400,
  `statut ${noSlash.response?.status ?? 'n/a'}`,
);

/* ================================================================== *
 * 3 · Indexabilité — conforme à la cible déclarée
 * ================================================================== */

section(`3 · Indexabilité (attendu : ${EXPECT})`);

const expectedRobots = STAGING ? 'noindex, nofollow' : 'index, follow';

for (const [name, path] of ROUTES) {
  const page = pages.get(path);
  if (!page) continue;
  const meta = page.body.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '';
  check('BLOCK', `meta robots « ${expectedRobots} » · ${name}`, meta === expectedRobots, meta);
}

/* L'en-tête HTTP est le contrôle qui prouve que `.htaccess` est réellement
   monté — une balise correcte dans un artefact non appliqué ne prouve rien. */
const xRobots = pages.get('/')?.response.headers.get('x-robots-tag') ?? '';
check(
  'BLOCK',
  STAGING ? 'en-tête X-Robots-Tag noindex' : 'aucun X-Robots-Tag noindex global',
  STAGING ? /noindex/i.test(xRobots) : !/noindex/i.test(xRobots),
  xRobots || '(absent)',
);

const robotsTxt = await fetchRaw(`${BASE}/robots.txt`);
check('BLOCK', 'robots.txt servi', robotsTxt.response?.status === 200, String(robotsTxt.response?.status));
if (robotsTxt.response?.status === 200) {
  if (STAGING) {
    check('BLOCK', 'robots.txt interdit tout le site', /^\s*Disallow:\s*\/\s*$/m.test(robotsTxt.body));
    check('BLOCK', 'aucun sitemap annoncé', !robotsTxt.body.includes('Sitemap:'));
  } else {
    check('BLOCK', 'robots.txt annonce le sitemap', robotsTxt.body.includes('Sitemap:'));
  }
}

/* ================================================================== *
 * 4 · Canonical et hreflang
 * ================================================================== */

section('4 · Canonical et hreflang');

for (const [name, path, locale] of ROUTES) {
  const page = pages.get(path);
  if (!page) continue;

  const canonical = page.body.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
  check(
    'BLOCK',
    `canonical auto-référente (origine production) · ${name}`,
    canonical === `${CANONICAL_ORIGIN}${path}`,
    canonical,
  );

  check('BLOCK', `lang="${locale}" · ${name}`, new RegExp(`<html[^>]+lang="${locale}"`).test(page.body));

  const alts = Object.fromEntries(
    [...page.body.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );
  const enPath = locale === 'en' ? path : EN_OF[path];
  const dePath = locale === 'en' ? PAIR[path] : path;
  check('BLOCK', `hreflang en · ${name}`, alts.en === `${CANONICAL_ORIGIN}${enPath}`, alts.en);
  check('BLOCK', `hreflang de · ${name}`, alts.de === `${CANONICAL_ORIGIN}${dePath}`, alts.de);
  check('BLOCK', `x-default → EN · ${name}`, alts['x-default'] === `${CANONICAL_ORIGIN}${enPath}`);
}

/* ================================================================== *
 * 5 · Véracité du contenu servi
 * ================================================================== */

section('5 · Véracité');

const FORBIDDEN = [
  [/\bin stock\b/i, 'disponibilité affirmée (EN)'],
  [/\bauf lager\b/i, 'disponibilité affirmée (DE)'],
  [/\bISO ?\d{4}/i, 'certification non établie'],
  [/\bwithin\s+\d+\s*(hours?|days?)/i, 'délai promis'],
  [/[€$£]\s?\d/, 'prix affiché'],
  [/\bcart\b|\bWarenkorb\b|\bcheckout\b/i, 'vocabulaire e-commerce'],
];

for (const [name, path] of ROUTES) {
  const page = pages.get(path);
  if (!page) continue;
  const text = page.body
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  for (const [pattern, why] of FORBIDDEN) {
    const hit = text.match(pattern);
    check('BLOCK', `${why} absent · ${name}`, hit === null, hit ? `« ${hit[0]} »` : '');
  }
}

/** Domaine web ≠ domaine e-mail — vérifié sur ce qui est réellement servi. */
const home = pages.get('/')?.body ?? '';
check('BLOCK', 'adresse de contact préservée', home.includes('info@ivan-arsenov.de'));
check('BLOCK', 'aucune adresse déduite du domaine web', !home.includes('info@ivanarsenov.de'));

for (const [name, path] of ROUTES) {
  const page = pages.get(path);
  if (!page) continue;
  const stale = [...page.body.matchAll(/.{0,20}ivan-arsenov\.de/g)]
    .map((m) => m[0])
    .filter((o) => !/@[\w.-]*$/.test(o.slice(0, -'ivan-arsenov.de'.length)));
  check('BLOCK', `aucune URL sur l’ancien domaine · ${name}`, stale.length === 0, stale.join(' · '));
}

/* ================================================================== *
 * 6 · Ressources et en-têtes
 * ================================================================== */

section('6 · Ressources et en-têtes');

const headers = pages.get('/')?.response.headers;
check('BLOCK', 'Content-Security-Policy', Boolean(headers?.get('content-security-policy')));
check('BLOCK', 'X-Content-Type-Options: nosniff', headers?.get('x-content-type-options') === 'nosniff');
check('WARN', 'Referrer-Policy', Boolean(headers?.get('referrer-policy')));
check('WARN', 'HTML non mis en cache durablement', /max-age=0|no-cache/.test(headers?.get('cache-control') ?? ''));

/** Les assets référencés doivent réellement exister : un 404 sur une police
    ou une feuille de style signe un déploiement partiel. */
const assets = [...(pages.get('/')?.body ?? '').matchAll(/(?:href|src)="(\/[^"]+\.(?:css|js|woff2|svg))"/g)]
  .map((m) => m[1])
  .filter((v, i, a) => a.indexOf(v) === i)
  .slice(0, 12);

for (const asset of assets) {
  const { response, error } = await fetchRaw(`${BASE}${asset}`, 'HEAD');
  check('BLOCK', `asset servi · ${asset}`, !error && response.status === 200, String(response?.status));
}

const fontHeaders = assets.find((a) => a.endsWith('.woff2'));
if (fontHeaders) {
  const { response } = await fetchRaw(`${BASE}${fontHeaders}`, 'HEAD');
  check('WARN', 'cache long sur les polices', /immutable|max-age=31536000/.test(response?.headers.get('cache-control') ?? ''));
}

const compressed = await fetch(`${BASE}/drinks/`, { headers: { 'Accept-Encoding': 'gzip, br' } }).catch(() => null);
check('WARN', 'compression active', Boolean(compressed?.headers.get('content-encoding')), compressed?.headers.get('content-encoding') ?? '(absente)');

/* ================================================================== *
 * 7 · Ce qui ne doit pas être là
 * ================================================================== */

section('7 · Surface exposée');

for (const [label, path, expected] of [
  ['styleguide absent', '/styleguide/', 404],
  ['page 404 fonctionnelle', '/nexistepas-xyz/', 404],
  ['config du formulaire non servie', '/api/config.local.php', [403, 404]],
]) {
  const { response, error } = await fetchRaw(`${BASE}${path}`);
  const codes = Array.isArray(expected) ? expected : [expected];
  check('BLOCK', label, !error && codes.includes(response.status), `statut ${response?.status ?? 'n/a'}`);
}

/* Le formulaire ne doit jamais prétendre avoir envoyé quoi que ce soit. */
const contact = pages.get('/contact/')?.body ?? '';
check('BLOCK', 'formulaire présent', contact.includes('action="/api/enquiry.php"'));

const probe = await fetchRaw(`${BASE}/api/enquiry.php?probe=1`);
const delivery = probe.error ? 'injoignable' : (() => {
  try {
    return JSON.parse(probe.body).delivery ?? `HTTP ${probe.response.status}`;
  } catch {
    return `HTTP ${probe.response.status}`;
  }
})();
check('WARN', `sonde de transport → ${delivery}`, true, 'FORM_DELIVERY_READY exige un envoi E2E réel');

/* ================================================================== *
 * 8 · Performance observée
 * ================================================================== */

section('8 · Performance observée');

const avg = Math.round([...pages.values()].reduce((a, p) => a + p.ms, 0) / (pages.size || 1));
check('WARN', `temps de réponse moyen ${avg} ms`, avg < 1500, `plus lente : ${slowest.route} à ${slowest.ms} ms`);
check('WARN', `HTML cumulé ${(totalBytes / 1024).toFixed(0)} Ko sur ${pages.size} pages`, true);

/* ------------------------------------------------------------------ */

function report() {
  console.log(`\nQA DISTANTE — ${BASE}  (attendu : ${EXPECT})\n`);
  let passed = 0;
  let warned = 0;
  for (const row of results) {
    if (row.section) {
      console.log(`\n  ${row.section}`);
      continue;
    }
    if (row.ok) {
      passed++;
      if (row.severity === 'WARN' && row.detail) console.log(`    · ${row.label} — ${row.detail}`);
      continue;
    }
    if (row.severity === 'WARN') warned++;
    console.log(
      `    ${row.severity === 'BLOCK' ? '✗ FAIL' : '! WARN'} ${row.label}${row.detail ? ` — ${row.detail}` : ''}`,
    );
  }
  const total = results.filter((r) => !r.section).length;
  console.log(`\n  ${passed}/${total} contrôles passés · ${blocking} bloquant(s) · ${warned} avertissement(s)\n`);
}

report();
process.exit(blocking > 0 ? 1 : 0);
