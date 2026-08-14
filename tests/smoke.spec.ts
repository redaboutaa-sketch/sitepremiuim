import { expect, test } from '@playwright/test';

/**
 * Smoke test des 16 routes.
 *
 * Vérifie sur l'artefact statique servi :
 *   - réponse 200 ;
 *   - un et un seul <h1> ;
 *   - aucune erreur console ;
 *   - aucune requête réseau échouée ;
 *   - aucune ressource externe (exigence performance + RGPD : le site ne doit
 *     émettre AUCUNE requête vers un tiers).
 */

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

for (const route of ROUTES) {
  test(`route ${route} se charge proprement`, async ({ page, baseURL }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    const externalRequests: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('requestfailed', (req) => {
      failedRequests.push(`${req.url()} — ${req.failure()?.errorText}`);
    });
    page.on('request', (req) => {
      if (!req.url().startsWith(baseURL!) && !req.url().startsWith('data:')) {
        externalRequests.push(req.url());
      }
    });

    const response = await page.goto(route, { waitUntil: 'networkidle' });

    expect(response?.status(), `statut HTTP de ${route}`).toBe(200);
    await expect(page.locator('h1'), `un seul <h1> sur ${route}`).toHaveCount(1);

    expect(consoleErrors, `erreurs console sur ${route}`).toEqual([]);
    expect(failedRequests, `requêtes échouées sur ${route}`).toEqual([]);
    expect(externalRequests, `requêtes externes sur ${route}`).toEqual([]);
  });
}

test('la locale du document suit la route', async ({ page }) => {
  await page.goto('/drinks/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.goto('/de/getraenke/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});
