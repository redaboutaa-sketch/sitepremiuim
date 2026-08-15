import { expect, test, type Page } from '@playwright/test';

/**
 * TR-019 — PASSE RESPONSIVE.
 *
 * Balayage systématique viewport × route sur l'artefact `dist/`.
 * Le test ne se contente pas de « ça ne casse pas » : il vérifie les trois
 * défauts qui trahissent un site fait à la va-vite —
 *   1. le débordement horizontal (la page se déplace latéralement) ;
 *   2. le texte qui sort de sa boîte ou passe sous une taille lisible ;
 *   3. les cibles tactiles trop petites au doigt.
 *
 * L'allemand est testé en priorité sur les points étroits : c'est la langue
 * qui produit les mots les plus longs (« Geschäftsanfrage », « Datenschutz-
 * erklärung ») et donc la première à déborder.
 */

/* Un seul projet suffit : le viewport est piloté test par test. */
test.describe.configure({ mode: 'parallel' });

const VIEWPORTS = [
  { name: '320 · petit mobile', width: 320, height: 640 },
  { name: '360 · mobile courant', width: 360, height: 780 },
  { name: '390 · iPhone', width: 390, height: 844 },
  { name: '414 · grand mobile', width: 414, height: 896 },
  { name: '600 · phablette', width: 600, height: 900 },
  { name: '768 · tablette portrait', width: 768, height: 1024 },
  { name: '834 · tablette', width: 834, height: 1112 },
  { name: '1024 · tablette paysage', width: 1024, height: 768 },
  { name: '1280 · laptop', width: 1280, height: 800 },
  { name: '1440 · desktop', width: 1440, height: 900 },
  { name: '1920 · grand écran', width: 1920, height: 1080 },
];

const ROUTES = [
  '/',
  '/drinks/',
  '/brands/',
  '/about/',
  '/contact/',
  '/imprint/',
  '/privacy/',
  '/cookies/',
  '/de/',
  '/de/getraenke/',
  '/de/marken/',
  '/de/ueber-uns/',
  '/de/kontakt/',
  '/de/impressum/',
  '/de/datenschutz/',
  '/de/cookies/',
];

/** Largeur de défilement du document vs largeur du viewport. */
const overflow = (page: Page) =>
  page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));

/**
 * Éléments dont la boîte dépasse le bord droit du viewport.
 * On remonte le coupable exact — un test qui dit seulement « ça déborde de
 * 19px » fait perdre une heure.
 */
const culprits = (page: Page, width: number) =>
  page.evaluate((vw) => {
    const out: string[] = [];
    for (const el of document.body.querySelectorAll<HTMLElement>('*')) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      // Un élément volontairement hors-champ (panneau fermé, off-screen
      // accessible) n'est pas un débordement de mise en page.
      const style = getComputedStyle(el);
      if (style.position === 'fixed' || style.visibility === 'hidden') continue;
      if (rect.right > vw + 1 || rect.left < -1) {
        out.push(
          `${el.tagName.toLowerCase()}.${el.className || '—'} → left ${Math.round(
            rect.left,
          )} right ${Math.round(rect.right)}`,
        );
      }
      if (out.length >= 6) break;
    }
    return out;
  }, width);

/* ================================================================== *
 * 1 · Aucun débordement horizontal — 176 combinaisons
 * ================================================================== */

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name}`, () => {
    for (const route of ROUTES) {
      test(`aucun débordement horizontal · ${route}`, async ({ page }, info) => {
        test.skip(info.project.name !== 'desktop', 'viewport piloté par le test');
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);

        const { scroll, client } = await overflow(page);
        if (scroll > client) {
          const found = await culprits(page, vp.width);
          expect(
            scroll,
            `${route} @ ${vp.width}px déborde de ${scroll - client}px\n${found.join('\n')}`,
          ).toBeLessThanOrEqual(client);
        }
        expect(scroll).toBeLessThanOrEqual(client);
      });
    }
  });
}

/* ================================================================== *
 * 2 · Bascule de navigation
 * ================================================================== */

test('la navigation bascule mobile ↔ desktop au même point dans les deux langues', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop');

  for (const route of ['/', '/de/']) {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto(route);
    await expect(page.locator('[data-menu-toggle]'), `${route} @900`).toBeVisible();
    await expect(page.locator('.header__nav'), `${route} @900`).toBeHidden();

    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(page.locator('[data-menu-toggle]'), `${route} @1024`).toBeHidden();
    await expect(page.locator('.header__nav'), `${route} @1024`).toBeVisible();
  }
});

/* ================================================================== *
 * 3 · Cibles tactiles — au point le plus étroit
 * ================================================================== */

/**
 * On mesure la cible EFFECTIVE, pas le contrôle nu : une case à cocher de
 * 24px enveloppée dans un `<label>` de 300px se vise avec le pouce sur toute
 * la ligne. Mesurer l'`<input>` seul produirait un faux positif.
 *
 * Deux exemptions, celles de la SC 2.5.8, et elles sont explicites :
 *   - les liens EN LIGNE dans une phrase (les agrandir casserait
 *     l'interlignage du paragraphe) ;
 *   - les sous-arbres `aria-hidden` ou détourés — le piège à robots, que
 *     `getBoundingClientRect` mesure encore alors qu'aucun humain ne le voit.
 */
test('toutes les cibles interactives font au moins 44px au doigt', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');

  const failures: string[] = [];

  for (const route of ['/', '/drinks/', '/brands/', '/contact/', '/de/kontakt/']) {
    await page.goto(route);
    const small = await page.evaluate(() => {
      const out: string[] = [];
      const nodes = document.querySelectorAll<HTMLElement>(
        'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      for (const el of nodes) {
        if (el.closest('[aria-hidden="true"]')) continue;
        if (getComputedStyle(el).visibility === 'hidden') continue;

        // Lien en ligne dans un bloc de texte — exemption 2.5.8.
        if (el.tagName === 'A' && el.classList.contains('link-inline')) continue;

        // Cible effective : le label qui enveloppe le contrôle, s'il existe.
        const label = el.closest('label');
        const target = label ?? el;

        const rect = target.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        if (rect.height < 44 || rect.width < 24) {
          out.push(
            `${el.tagName.toLowerCase()}.${el.className || '—'} "${(el.textContent ?? '')
              .trim()
              .slice(0, 24)}" → ${Math.round(rect.width)}×${Math.round(rect.height)}`,
          );
        }
      }
      return out;
    });
    for (const item of small) failures.push(`${route} · ${item}`);
  }

  expect(failures, failures.join('\n')).toEqual([]);
});

/** La case de consentement doit malgré tout atteindre le minimum 2.5.8 seule. */
test('la case de consentement atteint 24px sans compter son label', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');
  await page.goto('/contact/');
  const box = await page.locator('#consent').boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(24);
  expect(box!.height).toBeGreaterThanOrEqual(24);
  // Et la cible réelle — le label entier — est confortable.
  const label = await page.locator('.contact__check').boundingBox();
  expect(label!.height).toBeGreaterThanOrEqual(44);
});

/* ================================================================== *
 * 4 · Lisibilité — plancher typographique sur mobile
 * ================================================================== */

/**
 * Les WCAG n'imposent AUCUNE taille de police minimale. 12px est donc un
 * standard interne, pas une conformité : c'est le plancher sous lequel les
 * micro-capitales espacées de ce système cessent d'être confortables au
 * pouce. Le corps de texte, lui, est très au-dessus.
 */
const FLOOR_PX = 12;

for (const route of ['/', '/drinks/', '/brands/', '/contact/', '/de/getraenke/']) {
  test(`aucun texte sous ${FLOOR_PX}px sur mobile · ${route}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile');
    await page.goto(route);

    const tooSmall = await page.evaluate((floor) => {
      const out: string[] = [];
      for (const el of document.body.querySelectorAll<HTMLElement>(
        'p, li, td, dd, dt, a, span, button, label, h1, h2, h3',
      )) {
        const text = (el.textContent ?? '').trim();
        if (text === '') continue;
        if (el.children.length > 0) continue; // on ne mesure que les feuilles
        if (el.closest('[aria-hidden="true"]')) continue;
        const style = getComputedStyle(el);
        if (style.visibility === 'hidden') continue;
        const size = parseFloat(style.fontSize);
        if (size < floor) {
          out.push(`${el.tagName.toLowerCase()} ${size}px — "${text.slice(0, 40)}"`);
        }
      }
      return [...new Set(out)];
    }, FLOOR_PX);

    expect(tooSmall, tooSmall.join('\n')).toEqual([]);
  });
}

/* ================================================================== *
 * 5 · Le formulaire reste utilisable à 320px
 * ================================================================== */

test('formulaire utilisable à 320px — champs pleine largeur, rien de rogné', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/de/kontakt/');

  const inputs = page.locator('form .field__input');
  const count = await inputs.count();
  expect(count).toBeGreaterThan(8);

  for (let i = 0; i < count; i++) {
    const box = await inputs.nth(i).boundingBox();
    expect(box, `champ ${i}`).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(321);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }

  // Le bouton d'envoi n'est jamais coupé.
  const submit = await page.locator('[data-submit]').boundingBox();
  expect(submit!.x + submit!.width).toBeLessThanOrEqual(321);
});

/* ================================================================== *
 * 6 · Le zoom à 200 % ne casse pas la lecture (WCAG 1.4.4)
 * ================================================================== */

test('zoom 200 % à 1280px — aucun défilement horizontal', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');

  for (const route of ['/', '/drinks/', '/de/kontakt/']) {
    // 200 % de zoom à 1280 équivaut à une largeur CSS de 640.
    await page.setViewportSize({ width: 640, height: 512 });
    await page.goto(route);
    const { scroll, client } = await overflow(page);
    expect(scroll, `${route} @200%`).toBeLessThanOrEqual(client);
  }
});
