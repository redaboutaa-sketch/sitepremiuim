import { expect, test } from '@playwright/test';

/** Sections éditoriales de la homepage — S3 et suivantes. */

test('S3 — les 5 familles forment un index numéroté', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('.categories__row');
  await expect(rows).toHaveCount(5);
  await expect(rows.first().locator('.categories__name')).toHaveText('Carbonated');
  await expect(rows.last().locator('.categories__name')).toHaveText('International Finds');
});

test('S3 — chaque famille mène au catalogue filtré', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('.categories__link').evaluateAll((els) =>
    els.map((e) => e.getAttribute('href')),
  );
  expect(hrefs).toEqual([
    '/drinks/?category=carbonated',
    '/drinks/?category=energy-sport',
    '/drinks/?category=water',
    '/drinks/?category=juice-fruit',
    '/drinks/?category=international',
  ]);
});

test('S3 — aucune revendication d’importation directe', async ({ page }) => {
  await page.goto('/');
  const text = (await page.locator('.categories__index').textContent())!;
  // La formulation validée est « imported-style », jamais « imported ».
  expect(text).toContain('imported-style');
  expect(text).not.toMatch(/\bwe import\b|\bdirectly imported\b/i);
});

test('S3 — surface claire, sans carte ni ombre', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('[data-surface="paper"]').first();
  const bg = await section.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe('rgb(242, 240, 236)');

  const violations = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('.categories__index *')) {
      const cs = getComputedStyle(el);
      if (cs.boxShadow !== 'none') out.push(`box-shadow ${el.className}`);
      if ((parseFloat(cs.borderTopLeftRadius) || 0) > 0) out.push(`radius ${el.className}`);
    }
    return out;
  });
  expect(violations).toEqual([]);
});

test('S3 — l’index est opérable au clavier', async ({ page }) => {
  await page.goto('/');
  await page.locator('.categories__link').first().focus();
  await expect(page.locator('.categories__link').first()).toBeFocused();
});

test('S3 — version allemande adaptée, pas transposée', async ({ page }) => {
  await page.goto('/de/');
  await expect(page.locator('#categories-title')).toHaveText('Eine Kategorie. Mehr Tiefe.');
  await expect(page.locator('.categories__row').first().locator('.categories__name')).toHaveText(
    'Kohlensäurehaltig',
  );
});

/* ================================================================== *
 * S4 — Discover something different.
 * ================================================================== */

const toDiscovery = async (page: any, offset = 0) => {
  const top = await page.evaluate(
    () => document.querySelector('[data-discovery]')!.getBoundingClientRect().top + window.scrollY,
  );
  await page.evaluate((y: number) => window.scrollTo(0, y), top + offset);
  await page.waitForTimeout(600);
};

test('S4 — la séquence ne présente que des marques internationales', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('[data-drift-item]');
  await expect(items).toHaveCount(8);
  await expect(items.first()).toContainText('Chupa Chups');
});

test('S4 — le marqueur international est transversal aux familles', async ({ page }) => {
  await page.goto('/');
  const families = await page
    .locator('[data-drift-item]')
    .evaluateAll((els) => [...new Set(els.map((e) => (e as HTMLElement).dataset.family))]);
  // Si la séquence ne couvrait qu'une famille, le marqueur ferait doublon
  // avec `category` et la section perdrait son propos.
  expect(families.length).toBeGreaterThan(2);
});

test('S4 — la dérive suit le spécimen le plus proche du centre', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/');
  await toDiscovery(page, 0);
  const first = await page.evaluate(
    () => (document.querySelector('[data-discovery]') as HTMLElement).dataset.family,
  );
  await toDiscovery(page, 900);
  const later = await page.evaluate(
    () => (document.querySelector('[data-discovery]') as HTMLElement).dataset.family,
  );
  expect(first).toBeTruthy();
  expect(later, 'la teinte doit avoir changé au fil de la séquence').not.toBe(first);
});

test('S4 — en reduced-motion, la teinte est arrêtée et ne dérive pas', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await toDiscovery(page, 0);
  const a = await page.evaluate(
    () => (document.querySelector('[data-discovery]') as HTMLElement).dataset.family,
  );
  await toDiscovery(page, 900);
  const b = await page.evaluate(
    () => (document.querySelector('[data-discovery]') as HTMLElement).dataset.family,
  );
  expect(a).toBe('international');
  expect(b, 'aucune dérive sous reduced-motion').toBe(a);
});

test('S4 — la colonne de texte est collante sans épinglage JavaScript', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/');
  const position = await page
    .locator('.discovery__sticky')
    .evaluate((el) => getComputedStyle(el).position);
  expect(position).toBe('sticky');
});

test('S4 — aucun SKU inventé : seules marques et familles sont nommées', async ({ page }) => {
  await page.goto('/');
  const text = (await page.locator('[data-discovery]').textContent())!;
  // Aucun format ni contenance ne doit apparaître.
  expect(text).not.toMatch(/\d+\s?(ml|cl|l\b|oz)/i);
});
