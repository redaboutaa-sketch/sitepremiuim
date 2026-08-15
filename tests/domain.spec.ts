import { expect, test } from '@playwright/test';
import { CONTACT_EMAIL, SITE_APEX, SITE_HOST, SITE_ORIGIN } from '../site.config.mjs';

/**
 * MIGRATION DE DOMAINE — garde-fous permanents.
 *
 * Deux choses sont verrouillées ici, et elles tirent dans des directions
 * opposées :
 *   1. plus aucune URL sur l'ancien domaine du site ;
 *   2. l'adresse e-mail du client reste EXACTEMENT ce qu'il a donné.
 *
 * Le second point est le piège. Le domaine web est `ivanarsenov.de`, la
 * messagerie est sur `ivan-arsenov.de` : un nettoyage zélé de l'ancien
 * domaine effacerait l'adresse de contact, c'est-à-dire le canal par lequel
 * arrivent les demandes d'offre.
 */

const LEGACY_HOST = 'ivan-arsenov.de';

const ROUTES = [
  '/',
  '/drinks/',
  '/brands/',
  '/about/',
  '/contact/',
  '/imprint/',
  '/privacy/',
  '/cookies/',
  '/de/',
  '/de/getraenke/',
  '/de/marken/',
  '/de/ueber-uns/',
  '/de/kontakt/',
  '/de/impressum/',
  '/de/datenschutz/',
  '/de/cookies/',
];

/* ================================================================== *
 * 1 · Source de vérité unique
 * ================================================================== */

test('le nouveau domaine ne porte pas de tiret', () => {
  expect(SITE_APEX).toBe('ivanarsenov.de');
  expect(SITE_HOST).toBe(`www.${SITE_APEX}`);
  expect(SITE_ORIGIN).toBe(`https://${SITE_HOST}`);
  expect(SITE_APEX).not.toContain('-');
});

/**
 * Le point capital de tout ce changement : l'adresse e-mail n'est PAS dérivée
 * du domaine web. Si un jour quelqu'un « harmonise » les deux, ce test tombe.
 */
test('l’adresse e-mail n’est pas dérivée du domaine web', () => {
  expect(CONTACT_EMAIL).toBe('info@ivan-arsenov.de');
  expect(CONTACT_EMAIL).not.toContain(`@${SITE_APEX}`);
  expect(CONTACT_EMAIL.split('@')[1]).toBe(LEGACY_HOST);
});

/* ================================================================== *
 * 2 · Aucune URL périmée dans les pages rendues
 * ================================================================== */

for (const route of ROUTES) {
  test(`aucune URL sur l’ancien domaine · ${route}`, async ({ page }) => {
    await page.goto(route);

    const stale = await page.evaluate((legacy) => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('[href], [src], [content]')) {
        for (const attribute of ['href', 'src', 'content']) {
          const value = el.getAttribute(attribute);
          if (!value || !value.includes(legacy)) continue;
          // Une adresse e-mail est légitime ; une URL ne l'est pas.
          if (value.startsWith('mailto:')) continue;
          out.push(`${attribute}="${value}"`);
        }
      }
      return out;
    }, LEGACY_HOST);

    expect(stale, stale.join('\n')).toEqual([]);
  });
}

/* ================================================================== *
 * 3 · Canonical, hreflang, OpenGraph — tous sur le nouvel hôte
 * ================================================================== */

for (const route of ROUTES) {
  test(`canonical, hreflang et OpenGraph sur le nouvel hôte · ${route}`, async ({ page }) => {
    await page.goto(route);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe(`${SITE_ORIGIN}${route}`);

    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    expect(ogUrl).toBe(`${SITE_ORIGIN}${route}`);

    const alternates = await page
      .locator('link[rel="alternate"]')
      .evaluateAll((links) => links.map((l) => l.getAttribute('href') ?? ''));
    expect(alternates.length).toBe(3);
    for (const href of alternates) expect(href.startsWith(SITE_ORIGIN)).toBe(true);
  });
}

/* ================================================================== *
 * 4 · L'adresse de contact est toujours là où elle doit être
 * ================================================================== */

test('l’adresse de contact reste cliquable et inchangée', async ({ page }) => {
  for (const route of ['/', '/contact/', '/de/kontakt/', '/imprint/']) {
    await page.goto(route);
    await expect(
      page.locator(`a[href="mailto:${CONTACT_EMAIL}"]`).first(),
      `${route} — mailto absent`,
    ).toHaveCount(1);
  }
});

test('aucune adresse déduite du nouveau domaine n’apparaît nulle part', async ({ page }) => {
  const derived = `info@${SITE_APEX}`;
  for (const route of ROUTES) {
    await page.goto(route);
    const source = await page.content();
    expect(source, `${route} contient une adresse jamais confirmée`).not.toContain(derived);
  }
});

/* ================================================================== *
 * 5 · JSON-LD
 * ================================================================== */

test('les URLs du JSON-LD suivent le nouveau domaine, l’e-mail ne suit pas', async ({ page }) => {
  await page.goto('/');
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  expect(raw).toBeTruthy();
  const graph = JSON.stringify(JSON.parse(raw!));

  expect(graph).toContain(SITE_ORIGIN);
  // Les seules occurrences de l'ancien domaine autorisées sont des e-mails.
  for (const match of graph.matchAll(new RegExp(`.{0,12}${LEGACY_HOST.replace('.', '\\.')}`, 'g'))) {
    expect(match[0], `occurrence non-e-mail : ${match[0]}`).toMatch(/@[\w.-]*$|@[\w.-]*ivan-arsenov\.de/);
  }
});
