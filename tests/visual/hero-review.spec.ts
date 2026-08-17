import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

/**
 * TR-024C — REVUE VISUELLE DE « THE STAGE ».
 *
 * Ce fichier ne juge rien : il produit ce qu'il faut pour juger. Mesures
 * d'ancrage, planches isolées, superpositions de boîtes. Les décisions sont
 * consignées dans `doc/tr-024c-hero-review.md`.
 *
 * Il ne s'exécute que contre l'artefact de préproduction.
 */

const OUT = 'qa/review';

const settled = async (page: Page) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () =>
      new Promise<void>((r) => {
        const imgs = [...document.images].filter((i) => !i.complete);
        if (imgs.length === 0) return r();
        let left = imgs.length;
        for (const i of imgs) i.addEventListener('load', () => --left || r(), { once: true });
        setTimeout(r, 5000);
      }),
  );
};

const staging = async (page: Page) =>
  (await page.locator('[data-hero] [data-generated]').count()) === 6;

test.beforeAll(async () => {
  await mkdir(OUT, { recursive: true });
});

/* ================================================================== *
 * 1 · ANCRAGE — de combien chaque objet flotte-t-il au-dessus du sol ?
 * ================================================================== */

test('mesure de l’ancrage au filet de sol', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'largeur pilotée par le test');
  test.setTimeout(120_000);

  const rows: unknown[] = [];

  for (const [label, width, height] of [
    ['1920x1080', 1920, 1080],
    ['1440x900', 1440, 900],
    ['1280x800', 1280, 800],
    ['1024x768', 1024, 768],
    ['768x1024', 768, 1024],
    ['390x844', 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await settled(page);
    test.skip(!(await staging(page)), 'artefact de production');

    const shot = await page.evaluate(() => {
      const floor = document.querySelector('.hero__floor')!.getBoundingClientRect();
      return [...document.querySelectorAll<HTMLElement>('.hero__slot')]
        .filter((s) => getComputedStyle(s).display !== 'none')
        .map((slot) => {
          const fig = slot.querySelector('.product-object')!;
          const img = slot.querySelector('img')!;
          const rule = getComputedStyle(fig, '::after');
          return {
            brand: fig.getAttribute('data-object'),
            plane: slot.getAttribute('data-plane'),
            // Écart entre le bas de l'OBJET et le haut du filet de sol.
            // Positif = l'objet flotte.
            offFloor: +(floor.top - img.getBoundingClientRect().bottom).toFixed(1),
            plateBottomOffFloor: +(floor.top - slot.getBoundingClientRect().bottom).toFixed(1),
            ruleVisible: rule.content !== 'none',
          };
        });
    });

    rows.push({ viewport: label, slots: shot });
  }

  await writeFile(`${OUT}/grounding.json`, JSON.stringify(rows, null, 2), 'utf8');
  expect(rows.length).toBeGreaterThan(0);
});

/* ================================================================== *
 * 2 · PLANCHES DE REVUE
 * ================================================================== */

/** Planche E — les produits seuls, sans texte ni filigrane. */
test('planche E · composition produits seuls', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await settled(page);
  test.skip(!(await staging(page)));

  await page.addStyleTag({
    content: `.hero__content, .hero__monogram { visibility: hidden !important; }`,
  });
  await page.waitForTimeout(200);
  await page.locator('[data-hero]').screenshot({ path: `${OUT}/plate-E-produits-seuls.png` });
});

/** Planche F — boîtes englobantes, filet de sol, bases réelles. */
test('planche F · superposition des boîtes', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await settled(page);
  test.skip(!(await staging(page)));

  await page.evaluate(() => {
    const stage = document.querySelector('.hero__stage') as HTMLElement;
    const floor = document.querySelector('.hero__floor')!.getBoundingClientRect();
    const host = stage.getBoundingClientRect();

    const line = (top: number, color: string, label: string) => {
      const el = document.createElement('div');
      el.style.cssText = `position:absolute;left:0;right:0;top:${top - host.top}px;height:1px;background:${color};z-index:99`;
      const tag = document.createElement('span');
      tag.textContent = label;
      tag.style.cssText = `position:absolute;left:4px;top:-14px;font:11px monospace;color:${color}`;
      el.appendChild(tag);
      stage.appendChild(el);
    };

    for (const slot of document.querySelectorAll<HTMLElement>('.hero__slot')) {
      if (getComputedStyle(slot).display === 'none') continue;
      const img = slot.querySelector('img')!;
      const b = img.getBoundingClientRect();
      const box = document.createElement('div');
      box.style.cssText =
        `position:absolute;left:${b.left - host.left}px;top:${b.top - host.top}px;` +
        `width:${b.width}px;height:${b.height}px;outline:1px solid #34d399;z-index:98`;
      stage.appendChild(box);
      line(b.bottom, '#f59e0b', `${slot.querySelector('.product-object')!.getAttribute('data-object')} base`);
    }
    line(floor.top, '#ef4444', 'filet de sol commun');
  });

  await page.locator('[data-hero]').screenshot({ path: `${OUT}/plate-F-boites.png` });
});

/**
 * Planche G — ancrage AVANT / APRÈS la correction TR-024C, même cadrage.
 *
 * G1 restaure l'état antérieur en réinjectant le padding bas : c'est la seule
 * façon de comparer sans revenir en arrière dans le dépôt.
 */
for (const [name, css] of [
  [
    'G1-ancrage-avant',
    `.hero__slot .product-object { --po-pad-floor: clamp(0.5rem, 2.5vw, 1.5rem) !important; }`,
  ],
  ['G2-ancrage-apres', ''],
] as const) {
  test(`planche ${name}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.setViewportSize({ width: 1440, height: 900 });
    await settled(page);
    test.skip(!(await staging(page)));
    if (css) await page.addStyleTag({ content: css });
    await page.waitForTimeout(250);

    // Cadrage serré sur la zone de sol : c'est là que se joue la décision.
    const stage = await page.locator('.hero__stage').boundingBox();
    const floor = await page.locator('.hero__floor').boundingBox();
    await page.screenshot({
      path: `${OUT}/plate-${name}.png`,
      clip: {
        x: stage!.x,
        y: floor!.y - 260,
        width: stage!.width,
        height: 320,
      },
    });
  });
}

/**
 * Planche H — ancien filigrane typographique vs monogramme officiel.
 *
 * H1 reconstitue l'état antérieur : les deux capitales composées en Instrument
 * Serif, exactement les règles retirées par TR-024C. H2 est l'état courant.
 */
const OLD_WATERMARK = `
  .hero__monogram { display: none !important; }
  .hero__mark-legacy {
    position: absolute; inset-block-start: 50%; inset-inline-end: 4%;
    transform: translateY(-50%);
    font-family: var(--font-display);
    font-size: clamp(14rem, 45vh, 30rem);
    line-height: 0.8; letter-spacing: -0.06em;
    color: rgb(242 240 236 / 0.035);
    user-select: none; pointer-events: none;
  }`;

for (const [name, css] of [
  ['H1-filigrane-typographique', OLD_WATERMARK],
  ['H2-monogramme-officiel', ''],
] as const) {
  test(`planche ${name}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await settled(page);
    test.skip(!(await staging(page)));

    if (css) {
      await page.addStyleTag({ content: css });
      await page.evaluate(() => {
        const span = document.createElement('span');
        span.textContent = 'IA';
        span.className = 'hero__mark-legacy';
        span.setAttribute('aria-hidden', 'true');
        document.querySelector('.hero')!.appendChild(span);
      });
      await page.waitForTimeout(300);
    }

    await page.locator('[data-hero]').screenshot({ path: `${OUT}/plate-${name}.png` });

    /*
     * Second tirage, scène et texte masqués. Le filigrane est le seul élément
     * restant : c'est la seule façon de le mesurer, la bouteille Coca-Cola
     * occupant exactement la zone où il vit.
     */
    await page.addStyleTag({
      content: `.hero__stage, .hero__content { visibility: hidden !important; }`,
    });
    await page.waitForTimeout(200);
    await page.locator('[data-hero]').screenshot({ path: `${OUT}/plate-${name}-isole.png` });
  });
}
