import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

/**
 * TR-026B — S4 DISCOVERY AVEC PACKSHOTS.
 *
 * Mesure la séquence, puis la photographie. S'exécute contre l'artefact de
 * préproduction ; sur un build de production les huit emplacements rendent
 * leur repli typographique et les contrôles de visuel se sautent.
 */

const OUT = 'qa/screenshots/discovery';

/** La séquence S4, dans son ordre exact. */
const SEQUENCE = [
  'chupa-chups',
  'guarana-antarctica',
  'mountain-dew',
  'hawai',
  'fernandes',
  'mentos',
  'bundaberg',
  'yummy-miami-soda',
];

/** Les deux qui réemploient le master livré pour Featured (TR-025). */
const REUSED = ['mountain-dew', 'bundaberg'];

const WIDTHS = [320, 390, 430, 768, 1024, 1280, 1440, 1728, 1920] as const;

const settled = async (page: Page) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-discovery]').scrollIntoViewIfNeeded();
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
  await page.waitForTimeout(500);
};

const staging = async (page: Page) =>
  (await page.locator('[data-discovery] .product-object img').count()) === 8;

test.beforeAll(async () => {
  await mkdir(OUT, { recursive: true });
});

/* ================================================================== *
 * 1 · Contrat de rendu
 * ================================================================== */

test('huit spécimens, huit visuels produits, dans l’ordre de la séquence', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await settled(page);
  test.skip(!(await staging(page)), 'artefact de production — replis typographiques');

  const objs = await page.locator('[data-discovery] .product-object').evaluateAll((els) =>
    els.map((el) => ({
      brand: el.getAttribute('data-object'),
      asset: el.getAttribute('data-asset'),
      generated: el.hasAttribute('data-generated'),
      alt: el.querySelector('img')?.getAttribute('alt'),
    })),
  );

  // L'ORDRE compte : la séquence alterne les familles pour rendre la dérive
  // chromatique perceptible. Un tri alphabétique la supprimerait.
  expect(objs.map((o) => o.brand)).toEqual(SEQUENCE);
  await expect(page.locator('[data-discovery] .product-object__fallback')).toHaveCount(0);
  await expect(page.locator('[data-discovery] .product-object__img--logo')).toHaveCount(0);

  for (const o of objs) {
    expect(o.asset, `${o.brand}`).toBe('packshot');
    expect(o.generated, `${o.brand} doit être marqué généré`).toBe(true);
    // Un visuel fabriqué n'atteste rien : il ne doit rien annoncer non plus.
    expect(o.alt, `${o.brand} ne doit rien affirmer`).toBe('');
  }
});

test('Mountain Dew et Bundaberg réemploient le master de Featured', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.setViewportSize({ width: 1440, height: 900 });
  await settled(page);
  test.skip(!(await staging(page)));
  // La piste Featured est ailleurs sur la page et ses images sont différées :
  // sans l'amener à l'écran, `currentSrc` y est vide et le test accuse à tort.
  await page.locator('[data-track]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);

  /*
   * Le contrat n'est PAS « le même fichier servi » — S4 et Featured n'affichent
   * pas à la même taille et prennent donc des dérivés différents, ce qui est
   * voulu. Le contrat est « le même MASTER » : un seul fichier source, dont
   * tous les dérivés partagent le hachage de source posé par Astro.
   */
  const srcHash = (f: string) => f.split('.')[1]?.split('_')[0] ?? '';
  const collect = (sel: string) =>
    page
      .locator(sel)
      .evaluateAll((els) =>
        els.map((el) => ({
          brand: el.getAttribute('data-object'),
          file: (el.querySelector('img') as HTMLImageElement | null)?.currentSrc.split('/').pop(),
        })),
      );

  const disc = await collect('[data-discovery] .product-object');
  const feat = await collect('[data-track] .product-object');

  for (const slug of REUSED) {
    const d = disc.find((o) => o.brand === slug);
    const f = feat.find((o) => o.brand === slug);
    expect(d?.file, `${slug} absent de S4`).toBeTruthy();
    expect(f?.file, `${slug} absent de Featured`).toBeTruthy();
    expect(srcHash(d!.file!), `${slug} : masters différents entre S4 et Featured`).toBe(
      srcHash(f!.file!),
    );
  }
});

test('les huit images décodent réellement', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await settled(page);
  test.skip(!(await staging(page)));

  const broken = await page.locator('[data-discovery] img').evaluateAll((imgs) =>
    imgs
      .map((el) => el as HTMLImageElement)
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src),
  );
  expect(broken, broken.join('\n')).toEqual([]);
});

test('dimensions déclarées, chargement différé, aucun étirement', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.setViewportSize({ width: 1440, height: 900 });
  await settled(page);
  test.skip(!(await staging(page)));

  const m = await page.locator('[data-discovery] img').evaluateAll((imgs) =>
    imgs.map((el) => {
      const i = el as HTMLImageElement;
      const b = i.getBoundingClientRect();
      return {
        brand: i.closest('.product-object')?.getAttribute('data-object'),
        hasDims: Boolean(i.getAttribute('width') && i.getAttribute('height')),
        loading: i.getAttribute('loading'),
        fit: getComputedStyle(i).objectFit,
        intrinsic: i.naturalWidth / i.naturalHeight,
        rendered: b.width / b.height,
      };
    }),
  );

  for (const i of m) {
    // Dimensions déclarées : le ratio est connu avant décodage, donc pas de CLS.
    expect(i.hasDims, `${i.brand} sans width/height`).toBe(true);
    // S4 vit sous la ligne de flottaison : rien n'y justifie un chargement immédiat.
    expect(i.loading, `${i.brand}`).toBe('lazy');
    expect(i.fit, `${i.brand}`).toBe('contain');
    // Aucun étirement : le ratio rendu suit le ratio intrinsèque.
    expect(Math.abs(i.intrinsic - i.rendered), `${i.brand} déformé`).toBeLessThan(0.02);
  }
});

test('aucune requête externe', async ({ page }) => {
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

test('géométrie de la séquence à chaque largeur', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'largeur pilotée par le test');
  test.setTimeout(180_000);

  const table: unknown[] = [];

  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await settled(page);

    const shot = await page.evaluate(() => {
      const doc = document.documentElement;
      const items = [...document.querySelectorAll<HTMLElement>('.discovery__item')].map((li) => {
        const fig = li.querySelector('.product-object')!;
        const img = li.querySelector('img');
        const plate = fig.getBoundingClientRect();
        const b = (img ?? fig).getBoundingClientRect();
        const name = li.querySelector('.discovery__name');
        return {
          brand: fig.getAttribute('data-object'),
          plate: [Math.round(plate.width), Math.round(plate.height)],
          img: [Math.round(b.width), Math.round(b.height)],
          // Débordement du produit hors de son plateau : jamais toléré.
          overflow: Math.round(Math.max(0, plate.left - b.left, b.right - plate.right)),
          nameClipped: name
            ? name.scrollWidth > name.clientWidth + 1 ||
              name.scrollHeight > name.clientHeight + 1
            : false,
        };
      });
      return { pageOverflow: doc.scrollWidth - doc.clientWidth, items };
    });

    expect(shot.pageOverflow, `débordement horizontal à ${width}px`).toBeLessThanOrEqual(0);
    for (const it of shot.items) {
      expect(it.overflow, `${it.brand} déborde de son plateau à ${width}px`).toBe(0);
      expect(it.nameClipped, `libellé coupé pour ${it.brand} à ${width}px`).toBe(false);
    }

    table.push({ viewport: width, ...shot });
    await page.screenshot({ path: `${OUT}/viewport-${width}.png` });
  }

  await writeFile(`${OUT}/geometry.json`, JSON.stringify(table, null, 2), 'utf8');
});

test('normalisation optique : hauteurs égales, largeurs libres', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.setViewportSize({ width: 1440, height: 900 });
  await settled(page);
  test.skip(!(await staging(page)));

  const m = await page.locator('[data-discovery] .product-object img').evaluateAll((imgs) =>
    imgs.map((i) => {
      const b = i.getBoundingClientRect();
      return { w: Math.round(b.width), h: Math.round(b.height) };
    }),
  );

  /*
   * La séquence S4 n'ondule pas : tous ses plateaux ont le même ratio, et
   * `block-size: 100%` donne donc à chaque objet la même hauteur. La largeur,
   * elle, suit le ratio du fichier — c'est ce qui distingue une canette d'une
   * bouteille sans qu'aucune valeur par marque n'existe.
   */
  expect(new Set(m.map((x) => x.h)).size, `hauteurs : ${[...new Set(m.map((x) => x.h))]}`).toBe(1);
  expect(new Set(m.map((x) => x.w)).size, 'les largeurs ne doivent pas être uniformes').toBeGreaterThan(3);

  /*
   * ÉCART D'AIRE OPTIQUE — mesuré à 1,99 ×, et c'est le bon chiffre.
   *
   * Les hauteurs étant égales, l'écart vaut exactement max(ratio)/min(ratio) :
   * 0,4938 pour la canette Mountain Dew contre 0,2469 pour la bouteille Hawai.
   * Une canette trapue EST deux fois plus large qu'une bouteille élancée de
   * même hauteur — l'égaliser reviendrait à nier la forme des contenants.
   *
   * On ne reprend pas ici le classement par ratio de la piste Featured : là-bas
   * les objets se touchent sur un sol commun et la hauteur de plateau varie
   * déjà, ce qui donne prise à la correction. Ici, chaque spécimen occupe sa
   * propre cellule, avec son filet et sa légende, et tous les plateaux
   * partagent un ratio unique — il n'y a ni juxtaposition ni levier.
   *
   * Le plafond borne la DÉRIVE, pas la diversité : au-delà, c'est qu'un
   * nouveau master aux proportions extrêmes est entré sans qu'on le décide.
   */
  const areas = m.map((x) => x.w * x.h);
  const spread = Math.max(...areas) / Math.min(...areas);
  expect(spread, `écart d’aire optique ${spread.toFixed(2)}×`).toBeLessThan(2.1);
});

/* ================================================================== *
 * 3 · Poids réellement téléchargé
 * ================================================================== */

for (const [label, width, dpr] of [
  ['390@1x', 390, 1],
  ['430@3x', 430, 3],
  ['1440@1x', 1440, 1],
  ['1440@2x', 1440, 2],
  ['1920@1x', 1920, 1],
] as const) {
  test(`poids des packshots S4 · ${label}`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'desktop');
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
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

    // Haut de page, sans jamais atteindre S4 : ce que coûte le premier rendu.
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(700);
    const beforeBytes = [...seen.values()].reduce((s, b) => s + b, 0);
    const beforeFiles = seen.size;

    /*
     * Puis S4 parcourue en entier. `scrollIntoViewIfNeeded()` n'amène que le
     * HAUT de la section : sous 640 px la grille passe à une colonne et S4
     * dépasse 4 000 px de haut, si bien que ses derniers spécimens restent
     * différés — ce qui est le comportement voulu, mais fausse la mesure.
     */
    await page.evaluate(async () => {
      const s = document.querySelector('[data-discovery]')!.getBoundingClientRect();
      const top = s.top + window.scrollY;
      for (let y = top - window.innerHeight; y < top + s.height; y += window.innerHeight * 0.7) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 220));
      }
    });
    await page.waitForTimeout(1800);
    const s4Files = await page
      .locator('[data-discovery] img')
      .evaluateAll((imgs) =>
        imgs.map((el) => (el as HTMLImageElement).currentSrc.split('/').pop()!),
      );
    await ctx.close();

    const s4 = [...seen.entries()].filter(([f]) => s4Files.includes(f));
    const s4Bytes = s4.reduce((s, [, b]) => s + b, 0);
    const totalBytes = [...seen.values()].reduce((s, b) => s + b, 0);

    await writeFile(
      `${OUT}/weight-${label}.json`,
      JSON.stringify(
        {
          beforeFiles,
          beforeBytes,
          s4Files: s4.length,
          s4Bytes,
          totalFiles: seen.size,
          totalBytes,
          biggest: [...seen.entries()].sort((a, b) => b[1] - a[1])[0],
          rows: s4.map(([file, bytes]) => ({ file, bytes })),
        },
        null,
        2,
      ),
      'utf8',
    );

    if (s4.length === 0) test.skip(true, 'artefact de production');
    /*
     * On compte les fichiers DISTINCTS, pas les emplacements : deux spécimens
     * peuvent légitimement retomber sur le même dérivé, et exiger huit entrées
     * ferait échouer un comportement correct. Ce qui doit être vrai, c'est que
     * chaque fichier demandé par S4 a bien été téléchargé.
     */
    const wanted = new Set(s4Files);
    expect([...wanted].filter((f) => !seen.has(f)), 'dérivé S4 jamais téléchargé').toEqual([]);
    expect(wanted.size, 'S4 doit demander au moins sept dérivés distincts').toBeGreaterThanOrEqual(7);
    /*
     * Plafond assumé, mesuré puis arrondi. S4 est la section la plus grande du
     * site — jusqu'à 499 px CSS de haut par spécimen sur un téléphone — et elle
     * est intégralement sous la ligne de flottaison. Ce chiffre ne concerne que
     * la préproduction : la production ne publie aucun de ces fichiers.
     */
    expect(s4Bytes, `S4 ${(s4Bytes / 1024).toFixed(0)} Ko`).toBeLessThan(900 * 1024);
  });
}

/* ================================================================== *
 * 4 · Planches de revue
 * ================================================================== */

for (const [name, width, height] of [
  ['A-desktop-1920', 1920, 1080],
  ['B-desktop-1440', 1440, 900],
  ['C-tablet-768', 768, 1024],
  ['D-mobile-430', 430, 932],
  ['E-mobile-390', 390, 844],
] as const) {
  test(`planche ${name}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'largeur pilotée par le test');
    await page.setViewportSize({ width, height });
    await settled(page);
    await page.locator('[data-discovery]').screenshot({ path: `${OUT}/plate-${name}.png` });
  });
}
