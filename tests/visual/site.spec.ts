import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

/**
 * TR-021 — QA VISUELLE DU SITE RÉEL.
 *
 * `styleguide.spec.ts` garde le design system sur sa page de démonstration.
 * Celui-ci garde les MÊMES invariants sur les seize pages de production, où
 * les composants se rencontrent — c'est là que les systèmes cèdent, pas dans
 * la vitrine.
 *
 * Six passes :
 *   1. interdits d'art direction        (rayon, glassmorphism, gradient, ombre)
 *   2. grille                           (toutes les sections sur les mêmes bords)
 *   3. typographie                      (polices réellement chargées et employées)
 *   4. surfaces                         (alternance encre/papier cohérente)
 *   5. états interactifs                (survol ≠ focus ≠ repos)
 *   6. captures                         (16 routes × desktop/mobile + reduced-motion)
 */

const OUT = 'qa/screenshots';

const ROUTES = [
  ['home', '/'],
  ['drinks', '/drinks/'],
  ['brands', '/brands/'],
  ['about', '/about/'],
  ['contact', '/contact/'],
  ['imprint', '/imprint/'],
  ['privacy', '/privacy/'],
  ['cookies', '/cookies/'],
  ['de-home', '/de/'],
  ['de-drinks', '/de/getraenke/'],
  ['de-brands', '/de/marken/'],
  ['de-about', '/de/ueber-uns/'],
  ['de-contact', '/de/kontakt/'],
  ['de-imprint', '/de/impressum/'],
  ['de-privacy', '/de/datenschutz/'],
  ['de-cookies', '/de/cookies/'],
] as const;

test.beforeAll(async () => {
  await mkdir(OUT, { recursive: true });
});

const settled = async (page: Page, route: string) => {
  await page.goto(route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
};

/* ================================================================== *
 * PASSE 1 — Interdits d'art direction, sur les pages réelles
 * ================================================================== */

for (const [name, route] of ROUTES) {
  test(`passe 1 · interdits d’art direction · ${name}`, async ({ page }) => {
    await settled(page, route);

    const violations = await page.evaluate(() => {
      const found: string[] = [];
      const id = (el: Element) => `${el.tagName.toLowerCase()}.${el.className || '—'}`;

      /**
       * Un dégradé n'est pas interdit en soi — un filet qui se dissout à ses
       * extrémités en est un. Ce qui est interdit, c'est le dégradé SaaS :
       * deux teintes ou plus qui se fondent l'une dans l'autre. On teste donc
       * la polychromie, en ignorant les arrêts totalement transparents (qui
       * sont notés `rgba(0,0,0,0)` mais ne peignent rien).
       */
      const isPolychrome = (image: string): boolean => {
        const stops = image.match(/rgba?\([^)]+\)/g) ?? [];
        const hues = new Set<string>();
        for (const stop of stops) {
          const parts = stop.match(/[\d.]+/g)?.map(Number) ?? [];
          const alpha = parts.length > 3 ? parts[3]! : 1;
          if (alpha === 0) continue;
          hues.add(parts.slice(0, 3).join(','));
        }
        return hues.size > 1;
      };

      for (const el of document.querySelectorAll<HTMLElement>('body *')) {
        const cs = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        // Rien de rendu : rien à juger.
        if (box.width === 0 || box.height === 0) continue;

        /*
         * Rayon. La règle du design system n'est pas « aucune classe de la
         * liste X » — c'est « le cercle est la forme, jamais une décoration ».
         * On l'encode donc géométriquement plutôt que par noms de classes :
         * une pastille de comptage reste tolérée parce qu'elle est petite,
         * ronde et à peu près carrée, pas parce qu'elle s'appelle ainsi. Un
         * bouton aux coins arrondis échoue, quel que soit son nom.
         */
        const radius = parseFloat(cs.borderTopLeftRadius) || 0;
        if (radius > 0) {
          const short = Math.min(box.width, box.height);
          const long = Math.max(box.width, box.height);
          const isDot = short <= 32 && long <= 48 && radius >= short / 2 - 1;
          if (!isDot) found.push(`rayon ${cs.borderTopLeftRadius} — ${id(el)}`);
        }

        if (cs.backdropFilter && cs.backdropFilter !== 'none') {
          found.push(`backdrop-filter — ${id(el)}`);
        }

        if (cs.backgroundImage.includes('gradient') && isPolychrome(cs.backgroundImage)) {
          found.push(`dégradé polychrome — ${id(el)} : ${cs.backgroundImage.slice(0, 80)}`);
        }

        if (cs.boxShadow && cs.boxShadow !== 'none') found.push(`box-shadow — ${id(el)}`);
      }
      return [...new Set(found)];
    });

    expect(violations, violations.join('\n')).toEqual([]);
  });
}

/* ================================================================== *
 * PASSE 2 — Grille : toutes les sections partagent les mêmes bords
 * ================================================================== */

for (const [name, route] of ROUTES) {
  test(`passe 2 · grille alignée · ${name}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await settled(page, route);

    const edges = await page.evaluate(() =>
      [...document.querySelectorAll('main .container')].map((el) => {
        const r = el.getBoundingClientRect();
        return { left: Math.round(r.left), right: Math.round(r.right) };
      }),
    );

    expect(edges.length, 'aucun conteneur trouvé').toBeGreaterThan(0);
    const lefts = [...new Set(edges.map((e) => e.left))];
    const rights = [...new Set(edges.map((e) => e.right))];
    // Une seule valeur de chaque côté : un conteneur désaligné se voit
    // immédiatement, et personne ne sait dire pourquoi la page « respire mal ».
    expect(lefts, `bords gauches : ${lefts.join(', ')}`).toHaveLength(1);
    expect(rights, `bords droits : ${rights.join(', ')}`).toHaveLength(1);
  });
}

/* ================================================================== *
 * PASSE 3 — Typographie réellement appliquée
 * ================================================================== */

for (const [name, route] of ROUTES) {
  test(`passe 3 · typographie appliquée · ${name}`, async ({ page }) => {
    await settled(page, route);

    const check = await page.evaluate(async () => {
      const loaded = [...document.fonts]
        .filter((f) => f.status === 'loaded')
        .map((f) => f.family.replace(/['"]/g, ''));

      const h1 = document.querySelector('h1');
      const body = document.body;
      return {
        loaded: [...new Set(loaded)],
        h1Family: h1 ? getComputedStyle(h1).fontFamily : '',
        h1Rendered: h1 ? document.fonts.check(getComputedStyle(h1).font) : false,
        bodyFamily: getComputedStyle(body).fontFamily,
      };
    });

    // Les deux familles du système doivent être chargées, pas seulement
    // déclarées : une @font-face non résolue laisse Georgia à l'écran.
    expect(check.loaded, `chargées : ${check.loaded.join(', ')}`).toContain('Instrument Serif');
    expect(check.loaded).toContain('Archivo');

    // Et le h1 doit effectivement demander la display, pas la sans.
    expect(check.h1Family, `${name} h1`).toContain('Instrument Serif');
    expect(check.bodyFamily).toContain('Archivo');
  });
}

/* ================================================================== *
 * PASSE 4 — Surfaces : chaque section déclare la sienne
 * ================================================================== */

for (const [name, route] of ROUTES) {
  test(`passe 4 · surfaces déclarées · ${name}`, async ({ page }) => {
    await settled(page, route);

    const undeclared = await page.evaluate(() =>
      [...document.querySelectorAll('main > section, main > div > section')]
        .filter((el) => !el.hasAttribute('data-surface'))
        .map((el) => `${el.tagName.toLowerCase()}.${el.className || '—'}`),
    );
    // Une section sans surface hérite d'un fond indéterminé : c'est ainsi
    // qu'on obtient du texte clair sur clair au premier changement de contexte.
    expect(undeclared, undeclared.join('\n')).toEqual([]);
  });
}

/* ================================================================== *
 * PASSE 4bis — `hidden` veut dire masqué
 *
 * Trouvé par la capture pleine page : l'état vide du catalogue s'affichait
 * SOUS les 62 marques. `[hidden] { display: none }` du navigateur a une
 * spécificité nulle, et `.catalog__empty { display: grid }` la battait.
 * ================================================================== */

for (const [name, route] of ROUTES) {
  test(`passe 4bis · aucun élément [hidden] visible · ${name}`, async ({ page }) => {
    await settled(page, route);
    const shown = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[hidden]')]
        .filter((el) => getComputedStyle(el).display !== 'none')
        .map((el) => `${el.tagName.toLowerCase()}.${el.className || '—'}`),
    );
    expect(shown, shown.join('\n')).toEqual([]);
  });
}

/* ================================================================== *
 * PASSE 4ter — Un saut direct ne doit rien laisser invisible
 *
 * Trouvé par la capture pleine page. Un IntersectionObserver ne se déclenche
 * que sur un franchissement de seuil : la touche Fin, un lien d'ancre ou une
 * position restaurée font passer une section de « pas encore visible » à
 * « déjà dépassée » sans jamais croiser de seuil. Aucune entrée n'est émise
 * et la section reste à opacité 0 — du contenu perdu, pas une animation ratée.
 * ================================================================== */

for (const [name, route] of ROUTES) {
  test(`passe 4ter · saut direct en bas de page · ${name}`, async ({ page }) => {
    await settled(page, route);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);

    const stuck = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('.reveal, .reveal-mask')]
        .filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.9)
        .map((el) => `${el.tagName.toLowerCase()}.${el.className}`),
    );
    expect(stuck, stuck.join('\n')).toEqual([]);
  });
}

/* ================================================================== *
 * PASSE 5 — États interactifs distincts
 * ================================================================== */

test('passe 5 · repos, survol et focus sont trois états distincts', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await settled(page, '/');

  const cta = page.locator('.btn--primary').first();

  const snapshot = () =>
    cta.evaluate((el) => {
      const cs = getComputedStyle(el);
      return `${cs.backgroundColor}|${cs.color}|${cs.borderColor}|${cs.outlineStyle}${cs.outlineWidth}`;
    });

  // Les transitions durent 200ms : sans attente, on photographie l'état
  // intermédiaire et le test devient instable sous charge.
  const settle = () => page.waitForTimeout(400);

  await page.mouse.move(0, 0);
  await settle();
  const rest = await snapshot();

  await cta.hover();
  await settle();
  const hover = await snapshot();

  await page.mouse.move(0, 0);
  await settle();

  // Focus atteint AU CLAVIER : `:focus-visible` dépend de l'heuristique du
  // navigateur, et un focus posé par script ne le déclenche pas.
  await page.locator('body').click({ position: { x: 2, y: 2 } });
  let reached = false;
  for (let i = 0; i < 30 && !reached; i++) {
    await page.keyboard.press('Tab');
    reached = await cta.evaluate((el) => el === document.activeElement);
  }
  expect(reached, 'CTA principal jamais atteint au clavier').toBe(true);
  await settle();
  const focus = await snapshot();

  expect(hover, 'survol identique au repos').not.toBe(rest);
  expect(focus, 'focus identique au repos').not.toBe(rest);
  // Le focus n'est jamais un simple survol : c'est la règle du design system.
  expect(focus, 'focus identique au survol').not.toBe(hover);
});

test('passe 5 · un bouton désactivé reste identifiable comme un bouton', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await settled(page, '/contact/');

  const state = await page.locator('[data-submit]').evaluate((el) => {
    const btn = el as HTMLButtonElement;
    btn.disabled = true;
    const cs = getComputedStyle(btn);
    return { bg: cs.backgroundColor, color: cs.color, border: cs.borderColor, opacity: cs.opacity };
  });

  // Une opacité uniforme effacerait la bordure au point de le faire passer
  // pour du texte.
  expect(Number(state.opacity)).toBeGreaterThanOrEqual(0.9);
  expect(state.bg).not.toBe('rgba(0, 0, 0, 0)');
});

/* ================================================================== *
 * PASSE 6 — Captures
 * ================================================================== */

for (const [name, route] of ROUTES) {
  test(`passe 6 · capture · ${name}`, async ({ page }, info) => {
    await settled(page, route);
    // Descente par paliers : une capture pleine page rend TOUT le document,
    // y compris ce qui n'a jamais été à l'écran. Sans ce parcours, les
    // sections révélées au défilement seraient photographiées à opacité 0 et
    // la capture montrerait des bandes vides qui n'existent pas à l'usage.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.75;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
    });
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `${OUT}/${name}-${info.project.name}.png`,
      fullPage: true,
    });
  });
}

test('passe 6 · capture reduced-motion de l’accueil', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await settled(page, '/');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );
  await page.screenshot({ path: `${OUT}/home-reduced-motion.png`, fullPage: true });
});
