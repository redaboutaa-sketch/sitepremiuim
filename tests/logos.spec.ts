import { expect, test, type Page } from '@playwright/test';

/**
 * LOGOS DE MARQUE AU CATALOGUE — décision DA du 2026-08-16.
 *
 * Les logos sont autorisés SUR UNE SEULE SURFACE : le catalogue `/drinks/`,
 * qui est sur papier. Sur encre, 23 des 60 logos livrés tombent sous le seuil
 * de lisibilité — le hero, Featured et S4 restent donc en repli typographique.
 *
 * Ces tests s'adaptent au mode de build et vérifient les DEUX régimes :
 *   · `ASSET_MODE=staging`    → les logos sont rendus, et seulement au catalogue ;
 *   · production (par défaut) → aucun logo nulle part, gouvernance appliquée.
 * Un test qui n'attesterait que d'un seul des deux laisserait l'autre libre
 * de régresser en silence.
 */

const LOGO = '.product-object__img--logo';

/** Le mode se lit sur l'artefact lui-même, pas sur une variable d'environnement. */
async function stagingArtifact(page: Page): Promise<boolean> {
  await page.goto('/drinks/');
  return (await page.locator(LOGO).count()) > 0;
}

/* ================================================================== *
 * 1 · Cloisonnement des surfaces
 * ================================================================== */

for (const route of ['/', '/brands/', '/about/', '/contact/', '/de/', '/de/marken/']) {
  test(`aucun logo hors du catalogue · ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator(LOGO)).toHaveCount(0);
  });
}

test('le hero et Featured Brands restent en repli typographique', async ({ page }) => {
  await page.goto('/');
  // Le hero porte six emplacements, tous en repli.
  await expect(page.locator('[data-hero] .product-object__fallback')).not.toHaveCount(0);
  await expect(page.locator('[data-hero]').locator(LOGO)).toHaveCount(0);
  // La piste Featured également.
  await expect(page.locator('[data-track]').locator(LOGO)).toHaveCount(0);
});

/* ================================================================== *
 * 2 · Rendu au catalogue
 * ================================================================== */

test('catalogue : logos rendus en staging, aucun en production', async ({ page }) => {
  const staging = await stagingArtifact(page);
  const count = await page.locator(LOGO).count();

  if (staging) {
    // 60 logos admissibles ; A&W et Bundaberg n'en ont pas.
    expect(count).toBe(60);
  } else {
    // Aucun asset n'est `validated` : la production n'en publie aucun.
    expect(count).toBe(0);
  }
});

test('les deux marques sans logo gardent leur repli', async ({ page }) => {
  await page.goto('/drinks/');
  for (const slug of ['a-and-w', 'bundaberg']) {
    const cell = page.locator(`[data-brand="${slug}"]`);
    await expect(cell, slug).toHaveCount(1);
    await expect(cell.locator(LOGO), slug).toHaveCount(0);
    await expect(cell.locator('.product-object__fallback'), slug).toHaveCount(1);
  }
});

/* ================================================================== *
 * 3 · Aucune déformation
 * ================================================================== */

test('aucun logo n’est étiré ni recadré', async ({ page }) => {
  if (!(await stagingArtifact(page))) test.skip(true, 'artefact de production — aucun logo rendu');

  const bad = await page.locator(LOGO).evaluateAll((nodes) =>
    nodes
      .map((el) => {
        const img = el as HTMLImageElement;
        const style = getComputedStyle(img);
        const box = img.getBoundingClientRect();
        const intrinsic = img.naturalWidth / img.naturalHeight;
        const rendered = box.width / box.height;
        return {
          src: img.currentSrc.split('/').pop() ?? '',
          objectFit: style.objectFit,
          intrinsic: +intrinsic.toFixed(2),
          rendered: +rendered.toFixed(2),
          w: Math.round(box.width),
          h: Math.round(box.height),
        };
      })
      // `contain` est obligatoire ; sans lui, la boîte imposée déformerait.
      .filter((r) => r.objectFit !== 'contain' || r.w === 0 || r.h === 0),
  );
  expect(bad, JSON.stringify(bad)).toEqual([]);
});

test('chaque logo déclare ses dimensions — pas de décalage de mise en page', async ({ page }) => {
  if (!(await stagingArtifact(page))) test.skip(true, 'artefact de production');

  const missing = await page.locator(LOGO).evaluateAll((nodes) =>
    nodes
      .filter((el) => !el.getAttribute('width') || !el.getAttribute('height'))
      .map((el) => el.getAttribute('alt') ?? '?'),
  );
  expect(missing, missing.join(', ')).toEqual([]);
});

/* ================================================================== *
 * 4 · Normalisation optique
 * ================================================================== */

test('des formes très différentes ont un poids visuel comparable', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  if (!(await stagingArtifact(page))) test.skip(true, 'artefact de production');

  const areas = await page.locator(LOGO).evaluateAll((nodes) =>
    nodes.map((el) => {
      const b = el.getBoundingClientRect();
      const plate = el.closest('.product-object')!.getBoundingClientRect();
      return {
        alt: el.getAttribute('alt') ?? '',
        share: (b.width * b.height) / (plate.width * plate.height),
        ratio: b.width / b.height,
      };
    }),
  );

  expect(areas.length).toBeGreaterThan(50);

  const shares = areas.map((a) => a.share);
  const min = Math.min(...shares);
  const max = Math.max(...shares);

  /*
   * Les ratios sources vont de 0,50 à 4,65 — un écart de 9x. Sans
   * normalisation, l'écart de surface occupée suivrait le même ordre. On exige
   * qu'il reste sous 4x : deux logos de formes opposées doivent peser
   * comparablement, sans pour autant être identiques.
   */
  expect(max / min, `min ${min.toFixed(3)} max ${max.toFixed(3)}`).toBeLessThan(4);

  // Et aucun ne déborde de son plateau.
  for (const a of areas) expect(a.share, a.alt).toBeLessThanOrEqual(1);
});

/* ================================================================== *
 * 5 · Gouvernance — ce qui ne doit jamais entrer
 * ================================================================== */

test('aucun logo de marque exclue n’est rendu', async ({ page }) => {
  const EXCLUDED = [
    'arizona', 'banditos', 'dilmah', 'nescafe', 'lipton', 'fuze-tea',
    'barebells', 'chocomel', 'fristi', 'optimel', 'pinar',
    'karvan-cevitam', 'raak', 'slimpie', 'xxl-nutrition',
  ];
  for (const route of ['/drinks/', '/de/getraenke/', '/brands/']) {
    await page.goto(route);
    const html = await page.content();
    for (const slug of EXCLUDED) {
      expect(html, `${route} · ${slug}`).not.toContain(`/${slug}/logo`);
      expect(html, `${route} · ${slug}`).not.toContain(`data-brand="${slug}"`);
    }
  }
});

test('le catalogue n’a pas bougé : 62 marques, 5 familles', async ({ page }) => {
  await page.goto('/drinks/');
  await expect(page.locator('[data-brand]')).toHaveCount(62);
  const families = await page.locator('[data-category]').evaluateAll((els) => [
    ...new Set(els.map((e) => e.getAttribute('data-category'))),
  ]);
  expect(families.sort()).toEqual(
    ['carbonated', 'energy-sport', 'international', 'juice-fruit', 'water'].sort(),
  );
});

test('l’arrivée des logos n’a créé aucun SKU', async ({ page }) => {
  await page.goto('/drinks/');

  /*
   * On lit les MÉTADONNÉES VISIBLES des cellules, pas le corps entier : les
   * notes de périmètre des marques `brand-level-only` sont volontairement
   * lisibles par lecteur d'écran et contiennent la phrase « SKU précis non
   * confirmés ». Chercher le mot « SKU » dans toute la page signalerait donc
   * l'affirmation même qui garantit qu'aucun SKU n'a été inventé.
   */
  const meta = (
    await page.locator('.catalog__name, .catalog__family, .catalog__tag').allInnerTexts()
  )
    .join('\n')
    .toLowerCase();

  // Aucun volume, contenance, conditionnement ni code produit déduit d'une image.
  expect(meta).not.toMatch(/\b\d+\s?(ml|cl|l)\b/);
  expect(meta).not.toMatch(/\bpack of \d+|\b\d+\s?x\s?\d+/);
  expect(meta).not.toMatch(/\bean\b|\bsku\b/);

  // Et les notes de périmètre restent ce qu'elles étaient : des restrictions.
  const notes = await page.locator('.catalog__meta .visually-hidden').allInnerTexts();
  for (const note of notes) expect(note).not.toMatch(/\b\d+\s?(ml|cl)\b/);
});

/* ================================================================== *
 * 6 · Le texte reste la source d'information
 * ================================================================== */

test('le logo enrichit le plateau sans remplacer l’information textuelle', async ({ page }) => {
  await page.goto('/drinks/');
  const cell = page.locator('[data-brand="coca-cola"]');
  await expect(cell.locator('.catalog__name')).toHaveText('Coca-Cola');
  await expect(cell.locator('.catalog__family')).not.toBeEmpty();
  await expect(cell.locator('[data-enquiry-add]')).toHaveCount(1);

  // Le marqueur International Find survit lui aussi.
  const intl = page.locator('[data-international="true"]').first();
  await expect(intl.locator('.catalog__tag')).toHaveCount(1);
});

test('un logo n’est jamais annoncé comme un packshot', async ({ page }) => {
  if (!(await stagingArtifact(page))) test.skip(true, 'artefact de production');
  const alts = await page.locator(LOGO).evaluateAll((n) => n.map((e) => e.getAttribute('alt') ?? ''));
  for (const alt of alts) {
    expect(alt).toContain('logo');
    expect(alt).not.toContain('packshot');
  }
});
