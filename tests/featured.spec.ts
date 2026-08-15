import { expect, test } from '@playwright/test';

/** S2 — Featured Brands. */

const scrollToSection = async (page: any) => {
  const top = await page.evaluate(
    () => document.querySelector('[data-featured]')!.getBoundingClientRect().top + window.scrollY,
  );
  await page.evaluate((y: number) => window.scrollTo(0, y), top);
  await page.waitForTimeout(400);
};

test('les 16 marques featured sont présentes, dans l’ordre composé', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('[data-track] .featured__item');
  await expect(items).toHaveCount(16);
  await expect(items.first().locator('.featured__name')).toHaveText('Coca-Cola');
});

test('chaque marque mène au catalogue filtré', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('[data-track] .featured__link').first();
  await expect(first).toHaveAttribute('href', '/drinks/?brand=coca-cola');
});

test('aucun libellé impliquant un volume de vente', async ({ page }) => {
  await page.goto('/');
  const text = (await page.locator('[data-featured]').textContent())!.toLowerCase();
  for (const banned of ['best-selling', 'best seller', 'top seller', 'most popular', 'bestseller']) {
    expect(text, banned).not.toContain(banned);
  }
});

test('le nom de marque n’apparaît qu’une fois par élément', async ({ page }) => {
  await page.goto('/');
  const occurrences = await page.locator('[data-track] .featured__item').first().evaluate((el) => {
    const matches = (el.textContent ?? '').match(/Coca-Cola/g);
    return matches ? matches.length : 0;
  });
  expect(occurrences, 'le repli doit rester muet, le nom vit à l’extérieur').toBe(1);
});

test('la piste est atteignable et défilable au clavier', async ({ page }) => {
  await page.goto('/');
  await scrollToSection(page);
  await page.locator('[data-track]').focus();
  await expect(page.locator('[data-track]')).toBeFocused();

  const before = await page.evaluate(
    () => document.querySelector('[data-track-viewport]')!.scrollLeft,
  );
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  const after = await page.evaluate(
    () => document.querySelector('[data-track-viewport]')!.scrollLeft,
  );
  expect(after, 'les flèches doivent déplacer la piste').not.toBe(before);
});

test('la piste avance avec le défilement puis rend la main à l’utilisateur', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'pilotage desktop uniquement');
  await page.goto('/');
  await scrollToSection(page);

  const start = await page.evaluate(
    () => document.querySelector('[data-track-viewport]')!.scrollLeft,
  );
  expect(start, 'la première marque est visible au début de la section').toBeLessThan(40);

  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(500);
  const driven = await page.evaluate(
    () => document.querySelector('[data-track-viewport]')!.scrollLeft,
  );
  expect(driven, 'la piste doit avoir avancé').toBeGreaterThan(start + 100);

  // L'utilisateur prend la main : le pilotage s'arrête définitivement.
  await page.locator('[data-track-viewport]').dispatchEvent('pointerdown');
  await expect(page.locator('[data-track-viewport]')).toHaveAttribute('data-track-released', '');
});

test('en reduced-motion, la piste reste manuelle', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await scrollToSection(page);
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(500);
  const left = await page.evaluate(
    () => document.querySelector('[data-track-viewport]')!.scrollLeft,
  );
  expect(left, 'aucun pilotage automatique').toBe(0);
});

test('les révélations de section s’activent', async ({ page }) => {
  await page.goto('/');
  await scrollToSection(page);
  await page.waitForTimeout(500);
  const opacity = await page
    .locator('[data-featured] .reveal')
    .first()
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity, 'le titre de section doit être visible').toBe('1');
});

test('aucun débordement horizontal du document', async ({ page }) => {
  await page.goto('/');
  await scrollToSection(page);
  const { scroll, client } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(scroll).toBeLessThanOrEqual(client + 1);
});

test('aucune carte : ni ombre, ni rayon dans la piste', async ({ page }) => {
  await page.goto('/');
  const violations = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('[data-featured] *')) {
      const cs = getComputedStyle(el);
      if (cs.boxShadow !== 'none') out.push(`box-shadow ${el.className}`);
      if ((parseFloat(cs.borderTopLeftRadius) || 0) > 0) out.push(`radius ${el.className}`);
    }
    return out;
  });
  expect(violations).toEqual([]);
});
