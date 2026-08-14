import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

/**
 * QA visuelle du design system.
 *
 * Capture la page /styleguide/ en desktop, mobile et reduced-motion, et
 * contrôle par le même passage les invariants non négociables du TR-002 :
 * aucun rayon systématique, aucun glassmorphism, aucun gradient SaaS,
 * aucune police distante, aucun débordement horizontal.
 */

const OUT = 'qa/screenshots';

test.beforeAll(async () => {
  await mkdir(OUT, { recursive: true });
});

test('capture desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop uniquement');
  await page.goto('/styleguide/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${OUT}/styleguide-desktop.png`, fullPage: true });
});

test('capture mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile uniquement');
  await page.goto('/styleguide/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${OUT}/styleguide-mobile.png`, fullPage: true });
});

test('capture reduced-motion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop uniquement');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/styleguide/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // La bascule de la page doit refléter la préférence système.
  await expect(page.locator('.sg__rm-on')).toBeVisible();
  await expect(page.locator('.sg__rm-off')).toBeHidden();

  // Les éléments à révéler sont dans leur état final, jamais masqués.
  const revealOpacity = await page
    .locator('.reveal-mask > *')
    .first()
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(revealOpacity).toBe('1');

  await page.screenshot({ path: `${OUT}/styleguide-reduced-motion.png`, fullPage: true });
});

test('aucune police chargée depuis un CDN', async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith(baseURL!) && !r.url().startsWith('data:')) external.push(r.url());
  });

  await page.goto('/styleguide/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  expect(external, 'requêtes vers un tiers').toEqual([]);

  // Les polices effectivement utilisées viennent bien du domaine.
  const fontRequests = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((e) => e.name.includes('.woff2'))
      .map((e) => e.name),
  );
  expect(fontRequests.length, 'au moins une police locale chargée').toBeGreaterThan(0);
  for (const url of fontRequests) {
    expect(url, 'police servie depuis le domaine').toContain('/fonts/');
  }
});

test('invariants du design system', async ({ page }) => {
  await page.goto('/styleguide/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const violations = await page.evaluate(() => {
    const found: string[] = [];
    const els = Array.from(document.querySelectorAll<HTMLElement>('body *'));

    for (const el of els) {
      const cs = getComputedStyle(el);

      // Rayon systématique : seule la pastille de comptage a le droit d'être ronde.
      const radius = parseFloat(cs.borderTopLeftRadius) || 0;
      if (radius > 0 && !el.classList.contains('count-pill')) {
        found.push(`border-radius ${cs.borderTopLeftRadius} sur ${el.className || el.tagName}`);
      }

      // Glassmorphism.
      if (cs.backdropFilter && cs.backdropFilter !== 'none') {
        found.push(`backdrop-filter sur ${el.className || el.tagName}`);
      }

      // Gradient SaaS : les seuls dégradés tolérés sont les voiles de signal
      // du repli produit, à très faible opacité.
      const bg = cs.backgroundImage;
      if (bg.includes('gradient') && !el.classList.contains('product-object__fallback')) {
        found.push(`gradient sur ${el.className || el.tagName}`);
      }

      // Ombre portée diffuse sur une boîte (les drop-shadow de packshot sont
      // des filtres, pas des box-shadow — ils ne sont pas concernés).
      if (cs.boxShadow && cs.boxShadow !== 'none') {
        found.push(`box-shadow sur ${el.className || el.tagName}`);
      }
    }
    return found;
  });

  expect(violations, 'violations du design system').toEqual([]);
});

test('aucun débordement horizontal', async ({ page }) => {
  await page.goto('/styleguide/', { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(overflow.scroll, 'largeur de défilement').toBeLessThanOrEqual(overflow.client + 1);
});
