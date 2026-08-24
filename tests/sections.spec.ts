import { expect, test } from '@playwright/test';

/** Sections éditoriales de la homepage — S3 et suivantes. */

test('S3 — les 4 familles forment un index numéroté', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('.categories__row');
  // `water` et `international` ont été retirées le 2026-08-24 après s'être
  // vidées ; `iced-tea` a été créée pour Lipton Ice Tea.
  await expect(rows).toHaveCount(4);
  await expect(rows.first().locator('.categories__name')).toHaveText('Carbonated');
  await expect(rows.last().locator('.categories__name')).toHaveText('Iced Tea');
});

test('S3 — chaque famille mène au catalogue filtré', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('.categories__link').evaluateAll((els) =>
    els.map((e) => e.getAttribute('href')),
  );
  expect(hrefs).toEqual([
    '/drinks/?category=carbonated',
    '/drinks/?category=energy-sport',
    '/drinks/?category=juice-fruit',
    '/drinks/?category=iced-tea',
  ]);
});

test('S3 — aucune revendication d’importation directe', async ({ page }) => {
  await page.goto('/');
  const text = (await page.locator('.categories__index').textContent())!;
  /*
   * L'assertion POSITIVE (`toContain('imported-style')`) a été retirée le
   * 2026-08-24 : la formulation ne vivait que dans la description de la
   * famille `international`, vidée puis supprimée. Exiger encore sa présence
   * aurait poussé à réintroduire une revendication d'importation là où le
   * site n'en fait plus aucune.
   *
   * L'assertion NÉGATIVE est le vrai garde-fou et reste en place : Ivan
   * n'ayant jamais confirmé importer en direct, le site ne doit nulle part
   * l'affirmer.
   */
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

/* ==================================================================
 * S4 — « Discover something different. » — SECTION SUPPRIMÉE le 2026-08-24.
 *
 * Sept de ses huit spécimens ont quitté le catalogue avec la réduction à 14
 * articles, et la famille `international` qui portait son propos a été vidée.
 * Les huit tests de dérive, de teinte et de collant sont partis avec elle.
 *
 * Le contrôle est CONSERVÉ et inversé : il vérifie que la section ne
 * réapparaît pas. Supprimer le test avec la section aurait laissé son retour
 * accidentel passer inaperçu.
 * ================================================================== */

test('S4 — la section Discovery est absente de la page d’accueil', async ({ page }) => {
  for (const route of ['/', '/de/']) {
    await page.goto(route);
    await expect(page.locator('[data-discovery]'), route).toHaveCount(0);
    await expect(page.locator('[data-drift-item]'), route).toHaveCount(0);
  }
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

test('la homepage compte cinq sections, dans l’ordre prévu', async ({ page }) => {
  await page.goto('/');
  const surfaces = await page.evaluate(() =>
    Array.from(document.querySelectorAll('main > section')).map(
      (el) => (el as HTMLElement).dataset.surface,
    ),
  );
  /*
   * S1 hero (ink) · S2 featured (ink) · S3 familles (paper) · S4 process
   * (paper) · S5 CTA final (ink).
   *
   * L'ancienne S4 Discovery (ink) séparait les deux surfaces claires ; sa
   * suppression le 2026-08-24 les a rendues ADJACENTES. C'est un changement
   * de rythme réel, assumé et documenté ici plutôt que masqué — la respiration
   * encre/papier/encre du milieu de page n'existe plus.
   */
  expect(surfaces).toEqual(['ink', 'ink', 'paper', 'paper', 'ink']);
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
