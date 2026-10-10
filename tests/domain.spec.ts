import { expect, test } from '@playwright/test';
import {
  CONTACT_EMAIL,
  FOREIGN_APEX,
  KNOWN_APEXES,
  SITE_APEX,
  SITE_HOST,
  SITE_ORIGIN,
} from '../site.config.mjs';

/**
 * MIGRATION DE DOMAINE — garde-fous permanents.
 *
 * Deux choses sont verrouillées ici, et elles tirent dans des directions
 * opposées :
 *   1. plus aucune URL sur l'ancien domaine du site ;
 *   2. l'adresse e-mail du client reste EXACTEMENT ce qu'il a donné.
 *
 * Le second point est le piège. Le client possède DEUX domaines et son
 * adresse de contact vit sur `ivan-arsenov.de` quel que soit l'hôte du site :
 * un nettoyage zélé de « l'autre » domaine effacerait l'adresse de contact,
 * c'est-à-dire le canal par lequel arrivent les demandes d'offre.
 *
 * ⚠️ 2026-10-10 — l'hôte est devenu PARAMÉTRABLE (`SITE_HOST=…`), le client
 * pouvant servir le site depuis l'un ou l'autre de ses domaines. Ces tests
 * ne codent donc plus « ivanarsenov.de » en dur : ils vérifient la COHÉRENCE
 * de la configuration, quelle que soit la valeur retenue. Un test qui échoue
 * parce qu'une valeur légitime a changé ne testait pas ce qu'il annonçait.
 */

const LEGACY_HOST = FOREIGN_APEX!;

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

test('la configuration d’hôte est cohérente avec elle-même', () => {
  expect(KNOWN_APEXES).toContain(SITE_APEX);
  expect(SITE_HOST).toBe(`www.${SITE_APEX}`);
  expect(SITE_ORIGIN).toBe(`https://${SITE_HOST}`);
});

test('l’autre domaine est dérivé, et distinct de celui qui est servi', () => {
  // Saisi en dur, il désignerait le domaine COURANT après un changement
  // d'hôte, et tous les contrôles qui s'appuient dessus s'inverseraient.
  expect(FOREIGN_APEX).not.toBeNull();
  expect(FOREIGN_APEX).not.toBe(SITE_APEX);
  expect(KNOWN_APEXES).toContain(FOREIGN_APEX!);
});

/**
 * Le point capital : l'adresse e-mail est celle que le CLIENT a donnée, et
 * elle n'est jamais recalculée à partir du domaine web.
 *
 * ⚠️ 2026-10-10 — le test comparait à `@${SITE_APEX}` et exigeait que
 * l'adresse soit sur l'AUTRE domaine. C'était vrai tant que le site vivait
 * sur `ivanarsenov.de`. Bâti pour `ivan-arsenov.de`, les deux coïncident
 * LÉGITIMEMENT, et le test rejetait la bonne adresse.
 *
 * Ce qui compte n'a jamais été que les domaines diffèrent : c'est que
 * l'adresse soit littéralement celle du client, quel que soit l'hôte.
 */
test('l’adresse e-mail est celle du client, jamais recalculée', () => {
  expect(CONTACT_EMAIL).toBe('info@ivan-arsenov.de');
  expect(CONTACT_EMAIL.split('@')[1]).toBe('ivan-arsenov.de');
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

test('aucune adresse déduite du domaine web n’apparaît nulle part', async ({ page }) => {
  const derived = `info@${SITE_APEX}`;
  /*
   * Quand le site est servi depuis le domaine de messagerie du client,
   * l'adresse « déduite » EST son adresse réelle. Il n'y a alors rien à
   * interdire — et l'interdire reviendrait à bannir la bonne adresse.
   */
  test.skip(derived === CONTACT_EMAIL, 'le domaine du site est celui de l’adresse client');

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
