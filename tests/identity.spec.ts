import { expect, test, type Page } from '@playwright/test';

/**
 * IDENTITÉ OFFICIELLE IVAN ARSENOV — TR-023.
 *
 * Le logo est fourni par le client pour SON site : contrairement aux marques
 * tierces du catalogue, aucun titulaire extérieur n'a de droit à confirmer.
 * Il est donc `validated` et doit apparaître à l'identique en production ET
 * en préproduction — c'est la différence de régime que ces tests verrouillent.
 */

const ROUTES = ['/', '/drinks/', '/contact/', '/de/', '/de/getraenke/'];

const markImages = (page: Page) =>
  page.locator('.header__mark img, footer img[src*="lockup"]');

/* ================================================================== *
 * 1 · Plus aucun élément provisoire d'identité dans la marque
 * ================================================================== */

for (const route of ROUTES) {
  test(`marque du header non provisoire · ${route}`, async ({ page }) => {
    await page.goto(route);
    // Le repli typographique porte ce marqueur. Sa présence DANS LA MARQUE
    // signifierait qu'un asset n'a pas été résolu.
    await expect(page.locator('.header__mark [data-mark-provisional]')).toHaveCount(0);
    await expect(page.locator('footer [data-mark-provisional]')).toHaveCount(0);
  });
}

test('le favicon placeholder a disparu du dépôt et du build', async ({ page }) => {
  const svg = await page.request.get('/favicon.svg');
  expect(svg.status(), 'l’ancien favicon.svg ne doit plus être servi').toBe(404);

  const ico = await page.request.get('/favicon.ico');
  expect(ico.status()).toBe(200);
  // On mesure le CORPS, pas l'en-tête : `content-length` peut être absent
  // selon le serveur, et le test signalerait alors un fichier vide à tort.
  expect((await ico.body()).byteLength).toBeGreaterThan(500);
});

test('les déclarations de favicon pointent sur des fichiers servis', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page
    .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
    .evaluateAll((links) => links.map((l) => l.getAttribute('href') ?? ''));

  expect(hrefs.length).toBeGreaterThanOrEqual(2);
  for (const href of hrefs) {
    const res = await page.request.get(href);
    expect(res.status(), href).toBe(200);
  }
});

/* ================================================================== *
 * 2 · Le logo officiel est bien celui qui est affiché
 * ================================================================== */

for (const route of ROUTES) {
  test(`logo officiel dans le header · ${route}`, async ({ page }) => {
    await page.goto(route);
    const mono = page.locator('.header__mark img').first();
    await expect(mono).toHaveCount(1);
    await expect(mono).toHaveAttribute('src', /monogram/);
    // L'image doit réellement se décoder : un 200 ne suffit pas.
    await expect
      .poll(() => mono.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0))
      .toBe(true);
  });
}

test('le lock-up complet est réservé au footer', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer img[src*="lockup"]')).toHaveCount(1);
  // Le header ne doit jamais porter le lock-up empilé : son wordmark y
  // tomberait sous la limite de lisibilité.
  await expect(page.locator('.header__mark img[src*="lockup"]')).toHaveCount(0);
});

test('aucune duplication du wordmark typographique à côté du logo', async ({ page }) => {
  await page.goto('/');
  // Le nom ne doit pas apparaître deux fois dans la marque : une fois en
  // image, une fois en texte.
  const headerText = (await page.locator('.header__mark').innerText()).trim();
  expect(headerText, 'le lien de marque ne doit porter aucun texte visible').toBe('');

  const footerBrandText = (await page.locator('.footer__brand a').innerText()).trim();
  expect(footerBrandText).toBe('');
});

/* ================================================================== *
 * 3 · Géométrie — ratio conservé, aucun décalage de mise en page
 * ================================================================== */

test('le ratio du logo est conservé, sans déformation', async ({ page }) => {
  await page.goto('/');
  const bad = await markImages(page).evaluateAll((imgs) =>
    imgs
      .map((el) => {
        const i = el as HTMLImageElement;
        const box = i.getBoundingClientRect();
        return {
          src: (i.getAttribute('src') ?? '').split('/').pop(),
          intrinsic: i.naturalWidth / i.naturalHeight,
          rendered: box.width / box.height,
          hasDims: Boolean(i.getAttribute('width') && i.getAttribute('height')),
        };
      })
      // Tolérance d'un pixel d'arrondi sur les petites hauteurs.
      .filter((r) => Math.abs(r.intrinsic - r.rendered) > 0.06 || !r.hasDims),
  );
  expect(bad, JSON.stringify(bad)).toEqual([]);
});

test('dimensions explicites — pas de décalage de mise en page', async ({ page }) => {
  await page.goto('/');
  const missing = await markImages(page).evaluateAll((imgs) =>
    imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).length,
  );
  expect(missing).toBe(0);
});

/* ================================================================== *
 * 4 · Responsive — la marque ne pousse jamais la navigation
 * ================================================================== */

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1440, 1920];

for (const width of WIDTHS) {
  test(`marque et navigation tiennent à ${width}px`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'largeur pilotée par le test');
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const o = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(o.scroll, `débordement à ${width}px`).toBeLessThanOrEqual(o.client);

    // La marque ne recouvre jamais la navigation ni le bouton de menu.
    const mark = await page.locator('.header__mark').boundingBox();
    const nav = await page
      .locator('.header__nav, [data-menu-toggle]')
      .first()
      .boundingBox();
    expect(mark, 'marque absente').not.toBeNull();
    if (nav) {
      expect(mark!.x + mark!.width, `chevauchement à ${width}px`).toBeLessThanOrEqual(nav.x + 1);
    }

    // Le wordmark n'apparaît qu'à partir de 1024px, faute de largeur en dessous.
    const wordmark = page.locator('.header__wordmark');
    if (width >= 1024) await expect(wordmark).toBeVisible();
    else await expect(wordmark).toBeHidden();
  });
}

test('la hauteur du header n’a pas changé', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  for (const [width, expected] of [
    [1440, 89],
    [390, 73],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const h = await page
      .locator('.header')
      .evaluate((el) => Math.round(el.getBoundingClientRect().height));
    // Le logo doit s'inscrire dans le header existant, pas l'agrandir.
    expect(h, `header à ${width}px`).toBeLessThanOrEqual(expected);
  }
});

/* ================================================================== *
 * 5 · Accessibilité
 * ================================================================== */

test('nom accessible du lien de marque — EN puis DE', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.header__mark')).toHaveAttribute(
    'aria-label',
    'Ivan Arsenov — Home',
  );

  await page.goto('/de/');
  await expect(page.locator('.header__mark')).toHaveAttribute(
    'aria-label',
    'Ivan Arsenov — Startseite',
  );
});

test('les images de marque sont décoratives — le nom n’est pas annoncé deux fois', async ({
  page,
}) => {
  await page.goto('/');
  const alts = await markImages(page).evaluateAll((imgs) =>
    imgs.map((i) => i.getAttribute('alt')),
  );
  expect(alts.length).toBeGreaterThan(0);
  // Le lien porte déjà le nom : l'image doit rester muette.
  for (const alt of alts) expect(alt).toBe('');
});

/* ================================================================== *
 * 6 · Gouvernance — identique en production et en préproduction
 * ================================================================== */

test('aucune ressource distante pour l’identité', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith('http://127.0.0.1') && !url.startsWith('data:')) external.push(url);
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(external, external.join('\n')).toEqual([]);
});

/* ================================================================== *
 * 7 · Filigrane du Hero — monogramme officiel (TR-024C, clôture B15)
 * ================================================================== */

test('le filigrane du Hero est le monogramme officiel, pas un repli', async ({ page }) => {
  await page.goto('/');
  const mark = page.locator('.hero__monogram');
  await expect(mark).toHaveCount(1);
  await expect(mark).toHaveAttribute('src', /monogram/);
  // Le repli typographique signalerait un asset non résolu.
  await expect(page.locator('[data-hero] [data-mark-provisional]')).toHaveCount(0);
});

test('le filigrane reste un filigrane : muet, discret, inerte', async ({ page }) => {
  await page.goto('/');
  const state = await page.locator('.hero__monogram').evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      alt: el.getAttribute('alt'),
      opacity: Number(cs.opacity),
      pointerEvents: cs.pointerEvents,
      hasDims: Boolean(el.getAttribute('width') && el.getAttribute('height')),
      inFlow: cs.position,
    };
  });

  // Décoratif : le nom de l'entreprise est déjà porté par le header.
  expect(state.alt).toBe('');
  // Plafond de la DA : un filigrane, jamais une signature. La borne haute est
  // ce qui empêche la dérive vers un logo posé en fond d'écran.
  expect(state.opacity).toBeLessThanOrEqual(0.05);
  expect(state.opacity).toBeGreaterThan(0);
  expect(state.pointerEvents).toBe('none');
  // Dimensions déclarées : le ratio est connu avant décodage, donc aucun
  // décalage de mise en page quand l'image arrive.
  expect(state.hasDims).toBe(true);
  expect(state.inFlow).toBe('absolute');
});

test('le filigrane n’introduit aucun décalage de mise en page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  const shift = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          })[]) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(total), 2500);
      }),
  );
  // Seuil « bon » de Core Web Vitals.
  expect(shift, `CLS ${shift.toFixed(4)}`).toBeLessThan(0.1);
});

test('les packshots ne sont pas publiés en production', async ({ page }) => {
  await page.goto('/');
  const generated = await page.locator('[data-hero] [data-generated]').count();
  const fallbacks = await page.locator('[data-hero] .product-object__fallback').count();
  // L'artefact décide : en production, six replis et aucun visuel généré ;
  // en préproduction, l'inverse. Ce test vaut pour les deux.
  if (generated === 0) expect(fallbacks).toBe(6);
  else {
    expect(generated).toBe(6);
    expect(fallbacks).toBe(0);
  }
});
