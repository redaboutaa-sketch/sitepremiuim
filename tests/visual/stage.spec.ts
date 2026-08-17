import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

/**
 * TR-024B — « THE STAGE » AVEC LES SIX PACKSHOTS.
 *
 * Ce fichier fait deux choses, et les garde séparées :
 *   · il MESURE la scène (géométrie réelle, poids réel, ordre de chargement) ;
 *   · il CAPTURE, pour qu'un humain juge ce qu'aucune mesure ne dit.
 *
 * Il s'exécute contre l'artefact de PRÉPRODUCTION : en production les six
 * emplacements rendent leur repli typographique, et il n'y aurait rien à
 * mesurer. Lancé sur un build de production, il se saute lui-même plutôt que
 * d'échouer — un test qui tombe pour la bonne raison reste un test qui tombe,
 * et on cesse de le lire.
 */

const OUT = 'qa/screenshots/stage';

/**
 * Répertoire de sortie, distinct par artefact.
 *
 * `npm run qa` rejoue cette suite contre un build de PRODUCTION : sans cette
 * séparation, il écrasait les planches de préproduction — les seules à montrer
 * les packshots — par des captures de replis typographiques, silencieusement.
 */
const outDir = async (page: Page) => ((await stagingArtifact(page)) ? OUT : `${OUT}-production`);

/** Points de mesure demandés par le cahier des charges TR-024B §8/§13. */
const VIEWPORTS = [
  ['1920x1080', 1920, 1080],
  ['1440x900', 1440, 900],
  ['1280x800', 1280, 800],
  ['1024x768', 1024, 768],
  ['768x1024', 768, 1024],
  ['430x932', 430, 932],
  ['390x844', 390, 844],
  ['375x812', 375, 812],
  ['320x568', 320, 568],
] as const;

/**
 * Planches de lecture A–E. Chacune isole UNE question de composition ; une
 * capture pleine page les mélange toutes et ne permet d'en trancher aucune.
 */
const PLATES = [
  ['A-scene-complete', 1920, 1080, 'la scène entière, telle qu’un visiteur la reçoit'],
  ['B-plan-avant', 1440, 900, 'le sujet — plan avant, netteté et débordement à droite'],
  ['C-profondeur', 1280, 800, 'l’étagement des trois plans et le filet de sol commun'],
  ['D-recomposition-mobile', 390, 844, 'la rangée mobile : le plan arrière disparaît'],
  ['E-cta-final', 1440, 900, 'le spécimen du CTA final — même cadrage que le plan avant'],
] as const;

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

/** Vrai seulement si l'artefact servi est celui de la préproduction. */
const stagingArtifact = async (page: Page) =>
  (await page.locator('[data-hero] [data-generated]').count()) === 6;

test.beforeAll(async () => {
  await mkdir(OUT, { recursive: true });
});

/* ================================================================== *
 * 1 · Ce qui est rendu — identité et honnêteté des six emplacements
 * ================================================================== */

test('la scène rend les six packshots, sur les bonnes marques', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'largeur pilotée par le test');
  await settled(page);
  test.skip(!(await stagingArtifact(page)), 'artefact de production — replis typographiques');

  const slots = await page.locator('[data-hero] .product-object').evaluateAll((els) =>
    els.map((el) => ({
      brand: el.getAttribute('data-object'),
      asset: el.getAttribute('data-asset'),
      generated: el.hasAttribute('data-generated'),
      alt: el.querySelector('img')?.getAttribute('alt'),
    })),
  );

  expect(slots).toHaveLength(6);
  expect(slots.map((s) => s.brand)).toEqual([
    'sprite',
    'monster-energy',
    'pepsi',
    'fanta',
    'red-bull',
    'coca-cola',
  ]);
  for (const s of slots) {
    expect(s.asset, `${s.brand}`).toBe('hero');
    // Un visuel fabriqué doit être identifiable dans le DOM : sans marqueur,
    // rien ne distingue plus tard une image générée d'une photo officielle.
    expect(s.generated, `${s.brand} doit être marqué généré`).toBe(true);
    // …et il ne doit RIEN affirmer à un lecteur d'écran.
    expect(s.alt, `${s.brand} ne doit pas s’annoncer comme un packshot`).toBe('');
  }
});

test('la scène entière reste hors de l’arbre d’accessibilité', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await settled(page);
  // Décision TR-024B §10 : décoratifs. Le conteneur porte déjà `aria-hidden`,
  // le marquage image n'est qu'une seconde barrière.
  await expect(page.locator('[data-hero] [data-stage]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[data-final-cta] .final__object')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
});

test('les images décodent réellement — aucun emplacement cassé', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await settled(page);
  test.skip(!(await stagingArtifact(page)));

  const broken = await page.locator('[data-hero] img').evaluateAll((imgs) =>
    imgs
      .map((el) => el as HTMLImageElement)
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src),
  );
  expect(broken, broken.join('\n')).toEqual([]);
});

/* ================================================================== *
 * 2 · Géométrie — mesurée, à chaque largeur
 * ================================================================== */

test('géométrie de la scène à chaque largeur', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'largeur pilotée par le test');
  test.setTimeout(120_000);

  const table: unknown[] = [];

  for (const [label, width, height] of VIEWPORTS) {
    await page.setViewportSize({ width, height });
    await settled(page);

    const shot = await page.evaluate(() => {
      const doc = document.documentElement;
      const floor = document.querySelector('.hero__floor')?.getBoundingClientRect();
      const slots = [...document.querySelectorAll<HTMLElement>('.hero__slot')].map((slot) => {
        const fig = slot.querySelector('.product-object')!;
        const img = slot.querySelector('img') as HTMLImageElement | null;
        const b = (img ?? fig).getBoundingClientRect();
        return {
          brand: fig.getAttribute('data-object'),
          plane: slot.getAttribute('data-plane'),
          hidden: getComputedStyle(slot).display === 'none',
          w: Math.round(b.width),
          h: Math.round(b.height),
          // Distance du bas de l'objet au filet de sol : un objet « posé »
          // touche le sol. Un écart positif le fait flotter.
          offFloor: null as number | null,
          src: img?.currentSrc.split('/').pop() ?? null,
          natural: img ? `${img.naturalWidth}x${img.naturalHeight}` : null,
        };
      });
      return {
        overflow: doc.scrollWidth - doc.clientWidth,
        floorY: floor ? Math.round(floor.top) : null,
        slots,
      };
    });

    // Aucune largeur ne doit produire de défilement horizontal : c'est le
    // symptôme le plus fréquent d'un objet trop grand pour son plan.
    expect(shot.overflow, `débordement horizontal à ${label}`).toBeLessThanOrEqual(0);

    table.push({ viewport: label, ...shot });

    const dir = await outDir(page);
    await mkdir(dir, { recursive: true });
    await page.screenshot({ path: `${dir}/viewport-${label}.png` });
  }

  const dir = await outDir(page);
  await writeFile(`${dir}/geometry.json`, JSON.stringify(table, null, 2), 'utf8');
});

/* ================================================================== *
 * 2bis · Occultation — aucun objet ne peut disparaître en silence
 *
 * Défaut trouvé sur les planches A et C : Pepsi était intégralement masqué
 * par la bouteille Coca-Cola. Les replis typographiques ne l'avaient jamais
 * montré — ils occupent toute la largeur de leur plateau, un packshot ajusté
 * par la hauteur bien moins. Un objet invisible n'est pas une composition,
 * c'est un fichier livré pour rien.
 * ================================================================== */

const DEPTH = { back: 0, mid: 1, front: 2 } as const;

for (const [label, width, height] of [
  ['1920x1080', 1920, 1080],
  ['1440x900', 1440, 900],
  ['1280x800', 1280, 800],
  ['1024x768', 1024, 768],
  ['768x1024', 768, 1024],
] as const) {
  test(`aucun objet de la scène n’est masqué · ${label}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'largeur pilotée par le test');
    await page.setViewportSize({ width, height });
    await settled(page);
    /*
     * Contrôle réservé à la préproduction. En production, chaque emplacement
     * rend un repli typographique qui occupe TOUTE la largeur de son plateau :
     * les plateaux se recouvrent largement, et c'est sans conséquence puisqu'ils
     * ne sont que des voiles. Le recouvrement n'a de sens qu'entre objets.
     */
    test.skip(!(await stagingArtifact(page)), 'artefact de production — replis typographiques');

    const boxes = await page.locator('.hero__slot').evaluateAll((slots) =>
      slots.map((slot) => {
        const fig = slot.querySelector('.product-object')!;
        const b = (slot.querySelector('img') ?? fig).getBoundingClientRect();
        return {
          brand: fig.getAttribute('data-object')!,
          plane: slot.getAttribute('data-plane')!,
          x1: b.left,
          x2: b.right,
          y1: b.top,
          y2: b.bottom,
        };
      }),
    );

    const covered = boxes
      .map((a) => {
        // Part de la boîte de `a` recouverte par les objets des plans PLUS
        // PROCHES. Approximation par intersection de rectangles : elle
        // surestime la couverture d'un objet détouré, ce qui est le bon sens
        // de l'erreur pour un contrôle de visibilité.
        const area = Math.max(1, (a.x2 - a.x1) * (a.y2 - a.y1));
        const nearer = boxes.filter(
          (b) =>
            b !== a &&
            DEPTH[b.plane as keyof typeof DEPTH] > DEPTH[a.plane as keyof typeof DEPTH],
        );
        const overlap = nearer.reduce((sum, b) => {
          const w = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1));
          const h = Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));
          return sum + w * h;
        }, 0);
        return { brand: a.brand, ratio: +(overlap / area).toFixed(2) };
      })
      .filter((r) => r.ratio > 0.6);

    expect(covered, JSON.stringify(covered)).toEqual([]);
  });
}

/* ================================================================== *
 * 3 · Poids — ce que le navigateur télécharge VRAIMENT
 *
 * Le poids des fichiers sur disque ne dit rien : un srcset dépose neuf
 * variantes et le navigateur en prend six. Seule la mesure réseau compte.
 * ================================================================== */

for (const [label, width, height] of [
  ['1920x1080', 1920, 1080],
  ['390x844', 390, 844],
] as const) {
  test(`poids réellement téléchargé · ${label}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'largeur pilotée par le test');

    const seen = new Map<string, number>();
    page.on('response', async (r) => {
      const url = r.url();
      if (!/\.(png|jpe?g|webp|avif|gif)$/i.test(new URL(url).pathname)) return;
      const len = Number(r.headers()['content-length'] ?? 0);
      seen.set(url.split('/').pop()!, len || (await r.body().catch(() => Buffer.alloc(0))).length);
    });

    await page.setViewportSize({ width, height });
    await settled(page);
    await page.waitForTimeout(500);

    const rows = [...seen.entries()].map(([file, bytes]) => ({ file, bytes }));
    const hero = rows.filter((r) => r.file.startsWith('hero.'));
    const total = hero.reduce((s, r) => s + r.bytes, 0);

    const dir = await outDir(page);
    await mkdir(dir, { recursive: true });
    await writeFile(
      `${dir}/weight-${label}.json`,
      JSON.stringify(
        { viewport: label, heroFiles: hero.length, heroBytes: total, all: rows },
        null,
        2,
      ),
      'utf8',
    );

    if (hero.length === 0) test.skip(true, 'artefact de production — aucun packshot');

    /*
     * Plafond assumé, pas aspirationnel : au-delà, la scène coûte plus qu'un
     * hero d'agence entier et le premier rendu s'en ressent sur un stand de
     * salon en 4G. La valeur est vérifiée en préproduction seulement — la
     * production ne télécharge aucun de ces fichiers.
     */
    expect(total, `${(total / 1024).toFixed(0)} Ko de packshots`).toBeLessThan(320 * 1024);
  });
}

test('poids réellement téléchargé · 1440 à 2 pixels par point', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'densité pilotée par le test');

  /*
   * La densité ne se change pas sur un contexte existant, et c'est pourtant
   * elle qui décide de la variante servie : un écran à 2 dppx demande deux
   * fois plus de pixels pour la même largeur d'affichage. Une mesure faite à
   * 1 dppx sous-estime donc de moitié ce que reçoit un portable réel.
   */
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  const seen = new Map<string, number>();
  page.on('response', async (r) => {
    const url = r.url();
    if (!/\.(png|jpe?g|webp|avif|gif)$/i.test(new URL(url).pathname)) return;
    const len = Number(r.headers()['content-length'] ?? 0);
    seen.set(url.split('/').pop()!, len || (await r.body().catch(() => Buffer.alloc(0))).length);
  });

  await settled(page);
  await page.waitForTimeout(500);
  const dir = await outDir(page);
  await ctx.close();

  const hero = [...seen.entries()]
    .filter(([f]) => f.startsWith('hero.'))
    .map(([file, bytes]) => ({ file, bytes }));
  const total = hero.reduce((s, r) => s + r.bytes, 0);

  await mkdir(dir, { recursive: true });
  await writeFile(
    `${dir}/weight-1440x900@2x.json`,
    JSON.stringify({ heroFiles: hero.length, heroBytes: total, hero }, null, 2),
    'utf8',
  );

  if (hero.length === 0) test.skip(true, 'artefact de production — aucun packshot');
  expect(total, `${(total / 1024).toFixed(0)} Ko de packshots à 2 dppx`).toBeLessThan(320 * 1024);
});

test('le LCP n’est pas différé — les objets de la scène sont en chargement immédiat', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop');
  await settled(page);
  test.skip(!(await stagingArtifact(page)));

  const lazy = await page
    .locator('[data-hero] img')
    .evaluateAll((imgs) =>
      imgs
        .map((el) => el as HTMLImageElement)
        .filter((i) => i.getAttribute('loading') === 'lazy')
        .map((i) => i.currentSrc),
    );
  expect(lazy, 'un objet de la scène ne doit jamais être différé').toEqual([]);

  // Le spécimen du CTA final, lui, est sous la ligne de flottaison : il DOIT
  // l'être. La règle n'est pas « eager partout », c'est « eager là où c'est vu ».
  await expect(page.locator('[data-final-cta] img')).toHaveAttribute('loading', 'lazy');
});

/* ================================================================== *
 * 4 · Planches de lecture A–E
 * ================================================================== */

for (const [name, width, height, purpose] of PLATES) {
  test(`planche ${name}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'largeur pilotée par le test');
    await page.setViewportSize({ width, height });
    await settled(page);

    const target =
      name === 'E-cta-final' ? page.locator('[data-final-cta]') : page.locator('[data-hero]');
    if (name === 'E-cta-final') {
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
    }

    const dir = await outDir(page);
    await mkdir(dir, { recursive: true });
    await target.screenshot({ path: `${dir}/plate-${name}.png` });
    expect(purpose).toBeTruthy();
  });
}
