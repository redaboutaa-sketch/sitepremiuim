/**
 * QA NAVIGATEUR AUTONOME — exécution réelle sous la CSP de production.
 *
 * Ferme le point B14. Les 759 tests fonctionnels ont tourné derrière un
 * serveur statique SANS en-têtes de sécurité : le site n'avait donc jamais
 * été exécuté sous sa propre Content-Security-Policy. Si celle-ci bloquait le
 * script d'amorçage ou les modules, l'enquiry list serait morte sans qu'aucun
 * contrôle d'en-têtes ne le voie.
 *
 * C'est le SEUL contrôle qui exécute le site sous ses propres en-têtes : la
 * suite Playwright locale sert `dist/` derrière un serveur statique nu, donc
 * sans CSP. Une politique trop stricte ne s'y verrait jamais.
 *
 *   npm run qa:csp -- https://staging.ivanarsenov.de
 *
 * Une variante autonome — sans dépôt ni package.json, pour un serveur qui n'a
 * que Node — se génère en remplaçant l'import par `from 'playwright'`.
 *
 * Sortie : PASS/FAIL par contrôle, code 1 si un contrôle bloquant échoue.
 */

import { chromium } from '@playwright/test';

const BASE = (process.argv[2] ?? '').replace(/\/$/, '');
if (!BASE) {
  console.error('usage : node qa-csp.mjs <url>');
  process.exit(2);
}

const results = [];
let failed = 0;

function check(label, ok, detail = '') {
  results.push({ label, ok, detail });
  if (!ok) failed++;
}
const section = (t) => results.push({ section: t });

/** Journalise tout ce que la page se plaint de ne pas pouvoir faire. */
function watch(page, sink) {
  page.on('console', (m) => {
    if (m.type() === 'error') sink.push(`console: ${m.text().slice(0, 160)}`);
  });
  page.on('pageerror', (e) => sink.push(`exception: ${String(e).slice(0, 160)}`));
  page.on('requestfailed', (r) => {
    const err = r.failure()?.errorText ?? '';
    // Les annulations de navigation ne sont pas des échecs de ressource.
    if (!/ERR_ABORTED/.test(err)) sink.push(`requête: ${r.url().slice(-70)} — ${err}`);
  });
}

/* Permet d'utiliser un Chromium déjà présent sur la machine :
     CHROMIUM_PATH=/usr/bin/chromium node qa-csp.mjs <url> */
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);

/* ================================================================== *
 * 1 · Le JavaScript s'exécute-t-il sous la CSP réelle ?
 * ================================================================== */

section('1 · Exécution sous CSP');

{
  const page = await browser.newPage();
  const problems = [];
  watch(page, problems);

  // Les violations CSP émettent un événement dédié, pas seulement une ligne
  // de console : on l'écoute explicitement.
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      window.__csp.push(`${e.violatedDirective} ← ${e.blockedURI}`);
    });
  });

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  /*
   * `data-js` est posé par le script INLINE d'amorçage. Son absence est la
   * signature exacte d'une CSP qui refuse l'inline : c'est le canari.
   */
  const hasJs = await page.evaluate(() => document.documentElement.hasAttribute('data-js'));
  check('le script inline d’amorçage s’exécute (data-js posé)', hasJs);

  const violations = await page.evaluate(() => window.__csp ?? []);
  check('aucune violation CSP', violations.length === 0, violations.join(' · '));

  check('aucune erreur console ni ressource en échec', problems.length === 0, problems.join(' · '));

  // Les modules externes doivent avoir été chargés et exécutés.
  const moduleRan = await page.evaluate(
    () => document.querySelector('[data-enquiry-indicator]') !== null,
  );
  check('les modules ES sont chargés', moduleRan);

  await page.close();
}

/* ================================================================== *
 * 2 · Parcours B2B complet, sur le site réel
 * ================================================================== */

section('2 · Parcours B2B');

{
  const page = await browser.newPage();
  const problems = [];
  watch(page, problems);

  await page.goto(`${BASE}/drinks/`, { waitUntil: 'networkidle' });

  const cells = await page.locator('[data-brand]').count();
  check('62 marques rendues au catalogue', cells === 62, String(cells));

  const logos = await page.locator('.product-object__img--logo').count();
  check('logos servis et rendus', logos > 0, `${logos} logos`);

  // Les images doivent réellement se décoder — un 200 ne suffit pas.
  const broken = await page.locator('.product-object__img--logo').evaluateAll((imgs) =>
    imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
  );
  check('aucun logo cassé au décodage', broken === 0, `${broken} cassés`);

  // Ajout de deux marques.
  const buttons = page.locator('[data-enquiry-add]:not([hidden])');
  check('boutons Add to Enquiry révélés par JS', (await buttons.count()) > 0);
  await buttons.nth(0).click();
  await buttons.nth(1).click();

  const stored = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('ia.enquiry') ?? '[]'),
  );
  check('la sélection est persistée en sessionStorage', stored.length === 2, JSON.stringify(stored));

  const indicator = await page.locator('[data-enquiry-indicator]').innerText();
  check('le compteur reflète la sélection', /2/.test(indicator), indicator.trim());

  // Survie à la navigation, puis préremplissage du formulaire.
  await page.goto(`${BASE}/contact/`, { waitUntil: 'networkidle' });
  const chips = await page.locator('[data-selection-chips] li').count();
  check('les marques arrivent préremplies sur /contact/', chips === 2, `${chips} chips`);

  const kept = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('ia.enquiry') ?? '[]'),
  );
  check('la sélection survit à la navigation', kept.length === 2);

  check('aucune erreur console pendant le parcours', problems.length === 0, problems.join(' · '));
  await page.close();
}

/* ================================================================== *
 * 3 · Formulaire — transport indisponible, annoncé honnêtement
 * ================================================================== */

section('3 · Formulaire');

{
  const page = await browser.newPage();
  await page.goto(`${BASE}/contact/`, { waitUntil: 'networkidle' });

  for (const [sel, val] of [
    ['#firstName', 'Anna'], ['#lastName', 'Weber'], ['#company', 'Weber Getränke GmbH'],
    ['#country', 'Germany'], ['#email', 'a.weber@example.com'],
    ['#message', 'QA de préproduction — ne pas traiter.'],
  ]) await page.fill(sel, val);
  await page.check('#consent');
  await page.locator('[data-submit]').click();

  const status = page.locator('[data-form-status]');
  await status.waitFor({ state: 'visible', timeout: 15000 });
  const text = await status.innerText();

  check('le site n’annonce AUCUN envoi', !/has been received|received your/i.test(text), text.slice(0, 90));
  check('il dit explicitement que rien n’a été envoyé', /nothing has been sent/i.test(text));
  check('il propose l’adresse directe', /info@ivan-arsenov\.de/.test(text));

  await page.close();
}

/* ================================================================== *
 * 4 · Mobile
 * ================================================================== */

section('4 · Mobile (Pixel 7)');

{
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const problems = [];
  watch(page, problems);

  for (const route of ['/', '/drinks/', '/de/getraenke/']) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    const o = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    check(
      `aucun débordement horizontal · ${route}`,
      o.scroll <= o.client,
      o.scroll <= o.client ? '' : `défile sur ${o.scroll}px pour ${o.client}px visibles`,
    );
  }

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const toggle = page.locator('[data-menu-toggle]');
  check('menu mobile présent', (await toggle.count()) === 1);
  await toggle.click();
  const nav = page.locator('#mobile-nav');
  check('le menu mobile s’ouvre', await nav.isVisible());

  check('aucune erreur console sur mobile', problems.length === 0, problems.join(' · '));
  await ctx.close();
}

await browser.close();

/* ------------------------------------------------------------------ */

console.log(`\nQA NAVIGATEUR — ${BASE}\n`);
let passed = 0;
for (const r of results) {
  if (r.section) { console.log(`\n  ${r.section}`); continue; }
  if (r.ok) { passed++; console.log(`    ✓ ${r.label}${r.detail ? ` — ${r.detail}` : ''}`); }
  else console.log(`    ✗ FAIL ${r.label}${r.detail ? ` — ${r.detail}` : ''}`);
}
const total = results.filter((r) => !r.section).length;
console.log(`\n  ${passed}/${total} contrôles passés · ${failed} échec(s)\n`);
process.exit(failed > 0 ? 1 : 0);
