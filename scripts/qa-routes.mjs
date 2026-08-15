/**
 * QA — intégrité du routage et de la canonicalisation.
 *
 * Vérifie sur le `dist/` produit :
 *   1. les 16 routes existent ;
 *   2. chaque page porte une canonical AUTO-RÉFÉRENTE (jamais DE → EN) ;
 *   3. les hreflang sont réciproques et complets (en, de, x-default) ;
 *   4. `lang` du document correspond à la locale de la route.
 *
 * Exécution : npm run build && npm run qa:routes
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { SITE_ORIGIN as ORIGIN } from '../site.config.mjs';

const DIST = resolve(process.cwd(), 'dist');

const ROUTES = {
  home: { en: '/', de: '/de/' },
  drinks: { en: '/drinks/', de: '/de/getraenke/' },
  brands: { en: '/brands/', de: '/de/marken/' },
  about: { en: '/about/', de: '/de/ueber-uns/' },
  contact: { en: '/contact/', de: '/de/kontakt/' },
  imprint: { en: '/imprint/', de: '/de/impressum/' },
  privacy: { en: '/privacy/', de: '/de/datenschutz/' },
  cookies: { en: '/cookies/', de: '/de/cookies/' },
};

const LOCALES = ['en', 'de'];

const failures = [];
const checks = { routes: 0, canonical: 0, hreflang: 0, lang: 0 };

function fail(page, route, message) {
  failures.push(`${page} ${route} — ${message}`);
}

function attr(html, regex) {
  const m = html.match(regex);
  return m ? m[1] : null;
}

function allAttrs(html, regex) {
  return [...html.matchAll(regex)].map((m) => ({ hreflang: m[1], href: m[2] }));
}

for (const [page, byLocale] of Object.entries(ROUTES)) {
  for (const locale of LOCALES) {
    const route = byLocale[locale];
    const file = join(DIST, route, 'index.html');

    // 1 — la route existe
    if (!existsSync(file)) {
      fail(page, route, 'fichier manquant dans dist/');
      continue;
    }
    checks.routes++;

    const html = await readFile(file, 'utf8');
    const expected = new URL(route, ORIGIN).href;

    // 2 — canonical auto-référente
    const canonical = attr(html, /<link\s+rel="canonical"\s+href="([^"]+)"/);
    if (canonical !== expected) {
      fail(page, route, `canonical="${canonical}" attendu "${expected}"`);
    } else {
      checks.canonical++;
    }

    // 3 — hreflang réciproques et complets
    const alts = allAttrs(html, /<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g);
    const byHreflang = Object.fromEntries(alts.map((a) => [a.hreflang, a.href]));
    let hreflangOk = true;

    for (const l of LOCALES) {
      const want = new URL(byLocale[l], ORIGIN).href;
      if (byHreflang[l] !== want) {
        fail(page, route, `hreflang="${l}" = "${byHreflang[l]}" attendu "${want}"`);
        hreflangOk = false;
      }
    }
    const wantDefault = new URL(byLocale.en, ORIGIN).href;
    if (byHreflang['x-default'] !== wantDefault) {
      fail(page, route, `x-default = "${byHreflang['x-default']}" attendu "${wantDefault}"`);
      hreflangOk = false;
    }
    // la page doit se déclarer elle-même
    if (byHreflang[locale] !== expected) {
      fail(page, route, 'la page ne se déclare pas elle-même dans ses hreflang');
      hreflangOk = false;
    }
    if (hreflangOk) checks.hreflang++;

    // 4 — lang du document
    const lang = attr(html, /<html[^>]*\slang="([^"]+)"/);
    if (lang !== locale) {
      fail(page, route, `<html lang="${lang}"> attendu "${locale}"`);
    } else {
      checks.lang++;
    }
  }
}

const total = Object.keys(ROUTES).length * LOCALES.length;

console.log('\nQA ROUTES — dist/\n');
console.log(`  routes présentes        ${checks.routes}/${total}`);
console.log(`  canonical auto-référente ${checks.canonical}/${total}`);
console.log(`  hreflang réciproques     ${checks.hreflang}/${total}`);
console.log(`  <html lang> correct      ${checks.lang}/${total}`);

if (failures.length > 0) {
  console.error(`\n  ${failures.length} ÉCHEC(S)\n`);
  for (const f of failures) console.error(`    ✗ ${f}`);
  console.error('');
  process.exit(1);
}

console.log('\n  PASS — aucune anomalie\n');
