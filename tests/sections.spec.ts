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
