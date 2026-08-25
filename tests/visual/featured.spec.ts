import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

/**
 * TR-025 — FEATURED BRANDS AVEC PACKSHOTS.
 *
 * Mesure la piste, puis la photographie. S'exécute contre l'artefact de
 * préproduction ; sur un build de production les quatorze emplacements rendent
 * leur repli typographique et les contrôles de visuel se sautent.
 */

const OUT = 'qa/screenshots/featured';

/**
 * Les QUATORZE articles, dans l'ordre du catalogue. TR-029 (2026-08-25) a
 * livré les packshots Mirinda et Lipton Ice Tea, les deux derniers trous.
 */
const FEATURED_WITH_PHOTO = [
  '7up',
  'capri-sun',
  'coca-cola',
  'dr-pepper',
  'fanta',
  'lipton-ice-tea',
  'mirinda',
  'monster-energy',
  'mountain-dew',
  'orangina',
  'pepsi',
  'red-bull',
  'schweppes',
  'sprite',
];

/** Les six qui réemploient leur master de scène plutôt qu'un doublon. */
const REUSED = ['coca-cola', 'fanta', 'red-bull', 'monster-energy', 'pepsi', 'sprite'];

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920] as const;

const settled = async (page: Page) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-track]').scrollIntoViewIfNeeded();
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
  await page.waitForTimeout(400);
};

const staging = async (page: Page) =>
  (await page.locator('[data-track] .product-object img').count()) === 14;

test.beforeAll(async () => {
  await mkdir(OUT, { recursive: true });
});

/* ================================================================== *
 * 1 · Ce qui est rendu
 * ================================================================== */

test('quatorze cellules, quatorze photos produit, aucun repli', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await settled(page);
  test.skip(!(await staging(page)), 'artefact de production — replis typographiques');

  const objs = await page.locator('[data-track] .product-object').evaluateAll((els) =>
    els.map((el) => ({
      brand: el.getAttribute('data-object'),
      asset: el.getAttribute('data-asset'),
      generated: el.hasAttribute('data-generated'),
      alt: el.querySelector('img')?.getAttribute('alt'),
    })),
  );

  // La piste rend bien quatorze cellules.
  await expect(page.locator('[data-track] .featured__item')).toHaveCount(14);

  /*
   * `.product-object` existe pour les QUATORZE cellules — c'est le conteneur,
   * pas le visuel. Ce qui distingue une photo produit, ce sont les attributs
   * d'audit, que `ProductObject` n'émet que sur le hero et sur les assets
   * générés. On filtre donc sur `data-object`, présent uniquement là.
   */
  const photos = objs.filter((o) => o.brand !== null);
  expect(photos).toHaveLength(14);
  expect([...photos.map((o) => o.brand!)].sort()).toEqual([...FEATURED_WITH_PHOTO].sort());

  for (const o of photos) {
    expect(o.asset, `${o.brand}`).not.toBe('logo');
    expect(o.asset, `${o.brand}`).toMatch(/^(packshot|hero)$/);
    expect(o.generated, `${o.brand} doit être marqué généré`).toBe(true);
    expect(o.alt, `${o.brand} ne doit rien affirmer`).toBe('');
  }

  /*
   * Plus aucun trou depuis TR-029, et plus aucun logo : la dérogation
   * accordée à Mirinda le 2026-08-24 est tombée avec son motif.
   */
  await expect(page.locator('[data-track] .product-object__img--logo')).toHaveCount(0);
  await expect(page.locator('[data-track] .product-object__fallback')).toHaveCount(0);

  // Les six marques de la scène réemploient leur master, sans fichier dupliqué.
  const reused = photos.filter((o) => o.asset === 'hero').map((o) => o.brand!);
  expect(reused.sort()).toEqual([...REUSED].sort());
});

test('aucun logo de marque ne s’est glissé dans la piste', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await settled(page);
  /*
   * Décision DA du 2026-08-16, rétablie sans exception par TR-029. La
   * dérogation d'un logo (Mirinda) a duré le temps qu'il lui manque une photo.
   */
  await expect(page.locator('[data-track] .product-object__img--logo')).toHaveCount(0);
});

test('les images de la piste décodent réellement', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await settled(page);
  test.skip(!(await staging(page)));

  const broken = await page.locator('[data-track] img').evaluateAll((imgs) =>
    imgs
      .map((el) => el as HTMLImageElement)
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src),
  );
  expect(broken, broken.join('\n')).toEqual([]);
});

test('aucune requête externe sur la page d’accueil', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith('http://127.0.0.1') && !url.startsWith('data:')) external.push(url);
  });
  await settled(page);
  expect(external, external.join('\n')).toEqual([]);
});

/* ================================================================== *
 * 2 · Normalisation optique et responsive
 * ================================================================== */

test('géométrie de la piste à chaque largeur', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'largeur pilotée par le test');
  test.setTimeout(180_000);

  const table: unknown[] = [];

  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await settled(page);

    const shot = await page.evaluate(() => {
      const doc = document.documentElement;
      const track = document.querySelector('[data-track-viewport]')!;
      const items = [...document.querySelectorAll<HTMLElement>('[data-track] .product-object')].map(
        (fig) => {
          const img = fig.querySelector('img');
          const plate = fig.getBoundingClientRect();
          const b = (img ?? fig).getBoundingClientRect();
          const label = fig.parentElement?.querySelector('.featured__name');
          return {
            brand: fig.getAttribute('data-object'),
            plate: [Math.round(plate.width), Math.round(plate.height)],
            img: [Math.round(b.width), Math.round(b.height)],
            // Dépassement du produit hors de son plateau : jamais toléré.
            overflow: Math.round(Math.max(0, plate.left - b.left, b.right - plate.right)),
            labelClipped: label
              ? label.scrollWidth > label.clientWidth + 1 ||
                label.scrollHeight > label.clientHeight + 1
              : false,
          };
        },
      );
      return {
        pageOverflow: doc.scrollWidth - doc.clientWidth,
        trackScrollable: track.scrollWidth > track.clientWidth,
        items,
      };
    });

    expect(shot.pageOverflow, `débordement horizontal de page à ${width}px`).toBeLessThanOrEqual(0);
    for (const it of shot.items) {
      expect(it.overflow, `${it.brand} déborde de son plateau à ${width}px`).toBe(0);
      expect(it.labelClipped, `libellé coupé pour ${it.brand} à ${width}px`).toBe(false);
    }

    table.push({ viewport: width, ...shot });
    await page.screenshot({ path: `${OUT}/viewport-${width}.png` });
  }

  await writeFile(`${OUT}/geometry.json`, JSON.stringify(table, null, 2), 'utf8');
});

test('piste défilable, sol commun, ligne de tête ondulante', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.setViewportSize({ width: 1440, height: 900 });
  await settled(page);
  test.skip(!(await staging(page)));

  const m = await page.evaluate(() => {
    const track = document.querySelector('[data-track-viewport]')!;
    /*
     * On mesure les PHOTOS PRODUIT seules. Le logo de Mirinda est dimensionné
     * par `--logo-w` / `--logo-h` (normalisation optique des logos) et n'a
     * aucune raison de partager la hauteur d'une bouteille : ce n'est pas un
     * objet posé, c'est une marque plate.
     */
    const imgs = [
      ...document.querySelectorAll(
        '[data-track] .product-object img:not(.product-object__img--logo)',
      ),
    ];
    return {
      scrollable: track.scrollWidth > track.clientWidth,
      heights: imgs.map((i) => Math.round(i.getBoundingClientRect().height)),
      widths: imgs.map((i) => Math.round(i.getBoundingClientRect().width)),
      bottoms: imgs.map((i) => Math.round(i.getBoundingClientRect().bottom)),
    };
  });

  // La piste doit rester une piste : si tout tenait à l'écran, le défilement
  // horizontal n'aurait plus d'objet et l'interaction disparaîtrait.
  expect(m.scrollable, 'la piste ne défile plus').toBe(true);

  /*
   * « LES PHOTOS TOUTES À LA MÊME TAILLE » — demande du propriétaire du site,
   * 2026-08-24. Trois règles, aucune valeur par marque.
   *
   *  1. SOL COMMUN. `align-items: flex-end` : tous les objets reposent sur la
   *     même ligne.
   *  2. LIGNE DE TÊTE DROITE. `--po-aspect` vaut `3 / 4` pour les quatorze.
   *     C'est l'inverse exact de la règle précédente : la piste ondulait sur
   *     quatre hauteurs de plateau (TR-025 §9), et cette ondulation avait pour
   *     effet direct que deux boissons voisines n'avaient pas la même taille.
   *  3. PROPORTIONS RÉELLES. `block-size: 100%` + `inline-size: auto` : chaque
   *     objet remplit la hauteur de son plateau, sa largeur suit son ratio.
   *
   * Des largeurs toutes identiques signifieraient qu'on a DÉFORMÉ les
   * produits — une canette étirée à la largeur d'une poche Capri-Sun. C'est
   * la seule chose que « à la même taille » ne doit jamais vouloir dire.
   */
  expect(m.bottoms.every((b) => b === m.bottoms[0]), `sols : ${[...new Set(m.bottoms)].join(', ')}`).toBe(true);
  expect(
    new Set(m.heights).size,
    `hauteurs — doivent être toutes égales : ${[...new Set(m.heights)].join(', ')}`,
  ).toBe(1);
  expect(
    new Set(m.widths).size,
    'largeurs uniformes = produits étirés',
  ).toBeGreaterThan(6);

  /*
   * ÉCART D'AIRE OPTIQUE — contrôle conservé de TR-025, mais son SEUIL a
   * changé de nature.
   *
   * Il servait alors à prouver que la correction par ratio avait ramené
   * l'écart de 3,01× à 1,54×. Avec un plateau unique, l'écart d'aire n'est
   * plus corrigeable : il ne reflète plus que les proportions réelles des
   * produits — une poche large couvre plus d'encre qu'une canette fine à
   * hauteur égale, et l'annuler exigerait de les déformer.
   *
   * Le plafond reste, comme alarme de régression : au-delà, c'est qu'un
   * fichier au cadrage aberrant est entré dans la piste.
   */
  const areas = m.widths.map((w, i) => w * m.heights[i]!);
  const spread = Math.max(...areas) / Math.min(...areas);
  expect(spread, `écart d’aire optique ${spread.toFixed(2)}×`).toBeLessThan(3.2);
});

/* ================================================================== *
 * 3 · Poids réellement téléchargé
 *
 * Deux chiffres, pas un : la piste vit sous la ligne de flottaison et ses
 * images de la piste sont en `loading="lazy"`. Confondre le poids initial et le
 * poids total ferait passer pour un coût de premier rendu ce qui n'arrive
 * qu'au défilement.
 * ================================================================== */

for (const [label, dpr] of [
  ['1440x900@1x', 1],
  ['1440x900@2x', 2],
] as const) {
  test(`poids des packshots · ${label}`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'desktop');
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: dpr,
    });
    const page = await ctx.newPage();
    const seen = new Map<string, number>();
    page.on('response', async (r) => {
      const url = r.url();
      if (!/\.(png|jpe?g|webp|avif)$/i.test(new URL(url).pathname)) return;
      const len = Number(r.headers()['content-length'] ?? 0);
      seen.set(url.split('/').pop()!, len || (await r.body().catch(() => Buffer.alloc(0))).length);
    });

    // 1 · haut de page, sans jamais atteindre la piste
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    const initial = [...seen.entries()].filter(([f]) => /^(hero|packshot)\./.test(f));
    const initialBytes = initial.reduce((s, [, b]) => s + b, 0);

    // 2 · après avoir amené la piste à l'écran
    await page.locator('[data-track]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    const all = [...seen.entries()].filter(([f]) => /^(hero|packshot)\./.test(f));
    const totalBytes = all.reduce((s, [, b]) => s + b, 0);
    await ctx.close();

    await writeFile(
      `${OUT}/weight-${label}.json`,
      JSON.stringify(
        {
          initialFiles: initial.length,
          initialBytes,
          totalFiles: all.length,
          totalBytes,
          rows: all.map(([file, bytes]) => ({ file, bytes })),
        },
        null,
        2,
      ),
      'utf8',
    );

    if (all.length === 0) test.skip(true, 'artefact de production');

    /*
     * Plafonds assumés : les valeurs MESURÉES, arrondies d'environ 10 %.
     *
     * Le premier chiffre n'est pas la scène seule. Les objets de la
     * piste sont bien en `loading="lazy"`, mais Chrome anticipe : à 1440×900
     * la piste entre dans sa fenêtre de préchargement, et huit visuels
     * partent avant tout défilement. C'est un comportement du navigateur, pas
     * un réglage — le constater vaut mieux que de prétendre l'inverse.
     *
     * Le second borne le coût complet de la piste : vingt-deux visuels
     * produits, dont six servis deux fois dans deux définitions différentes
     * parce que la scène et la piste ne les affichent pas à la même taille.
     * C'est le prix du réemploi, et il reste inférieur à celui d'un doublon
     * de master.
     *
     * Tout ceci ne concerne QUE la préproduction : la production ne publie
     * aucun de ces fichiers et rend quatorze replis typographiques.
     */
    expect(initialBytes, `initial ${(initialBytes / 1024).toFixed(0)} Ko`).toBeLessThan(
      (dpr === 1 ? 520 : 800) * 1024,
    );
    expect(totalBytes, `total ${(totalBytes / 1024).toFixed(0)} Ko`).toBeLessThan(
      (dpr === 1 ? 800 : 1100) * 1024,
    );
  });
}

/* ================================================================== *
 * 4 · Planches de revue
 * ================================================================== */

for (const [name, width, height] of [
  ['desktop-1440x900', 1440, 900],
  ['mobile-pixel7', 412, 915],
] as const) {
  test(`planches ${name}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'largeur pilotée par le test');
    await page.setViewportSize({ width, height });
    await settled(page);

    // 1 · la section telle qu'elle se présente à l'écran
    await page.locator('.featured').screenshot({ path: `${OUT}/${name}-section.png` });

    /*
     * Pas de capture « début / milieu / fin » : `src/scripts/track.ts` pilote
     * `scrollLeft` depuis la progression VERTICALE de la page, et la piste ne
     * se positionne donc pas par script — trois captures à trois offsets
     * sortaient rigoureusement identiques. Une capture d'élément ne rattrape
     * pas le hors-champ non plus. La vue d’ensemble des produits est
     * fournie par `planche-16-produits.png`, à hauteur optique comparable ;
     * celle-ci montre la piste telle qu'un visiteur la reçoit.
     */

    // La piste doit rester plus large que sa fenêtre : c'est ce qui fait
    // qu'elle se parcourt.
    const overflow = await page.evaluate(() => {
      const v = document.querySelector('[data-track-viewport]')!;
      return v.scrollWidth - v.clientWidth;
    });
    expect(overflow, `débordement de piste à ${width}px`).toBeGreaterThan(0);
  });
}
