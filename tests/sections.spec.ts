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

/* ================================================================== *
 * S5 — Simple by design.  ·  S6 — CTA final
 * ================================================================== */

test('S5 — trois temps numérotés, sans pictogramme ni carte', async ({ page }) => {
  await page.goto('/');
  const steps = page.locator('.process__step');
  await expect(steps).toHaveCount(3);
  await expect(steps.nth(0)).toContainText('Explore');
  await expect(steps.nth(1)).toContainText('Enquire');
  await expect(steps.nth(2)).toContainText("Let's talk business");
  await expect(page.locator('.process svg, .process img')).toHaveCount(0);
});

test('S5 — aucun délai de réponse promis', async ({ page }) => {
  await page.goto('/');
  const text = (await page.locator('.process').textContent())!.toLowerCase();
  for (const banned of ['24 hour', '48 hour', 'within a day', 'same day', 'immediately']) {
    expect(text, banned).not.toContain(banned);
  }
  expect(text).not.toMatch(/\bwithin \d+\b/);
});

test('S6 — un seul CTA, primaire, vers la demande d’offre', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('[data-final-cta] a');
  await expect(links).toHaveCount(1);
  await expect(links).toHaveClass(/btn--primary/);
  await expect(links).toHaveAttribute('href', '/contact/');
});

test('S6 — le spécimen final est décoratif', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.final__object')).toHaveAttribute('aria-hidden', 'true');
});

test('la homepage compte six sections, dans l’ordre prévu', async ({ page }) => {
  await page.goto('/');
  const surfaces = await page.evaluate(() =>
    Array.from(document.querySelectorAll('main > section')).map(
      (el) => (el as HTMLElement).dataset.surface,
    ),
  );
  expect(surfaces).toEqual(['ink', 'ink', 'paper', 'ink', 'paper', 'ink']);
});

test('un seul style de CTA primaire sur toute la homepage', async ({ page }) => {
  await page.goto('/');
  // Hero + CTA final + header : le primaire ne se dilue jamais.
  const primaries = await page.locator('main a.btn--primary').count();
  expect(primaries).toBe(2);
});

test('hiérarchie de titres correcte sur la homepage complète', async ({ page }) => {
  await page.goto('/');
  const levels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('main h1, main h2, main h3')).map((el) =>
      Number(el.tagName[1]),
    ),
  );
  expect(levels[0]).toBe(1);
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i]! - levels[i - 1]!, `saut de niveau à l'index ${i}`).toBeLessThanOrEqual(1);
  }
});
