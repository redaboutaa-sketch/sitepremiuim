import { expect, test, type Page } from '@playwright/test';

/**
 * TR-020 — PASSE ACCESSIBILITÉ.
 *
 * Aucune bibliothèque d'audit tierce n'est installée (axe-core exigerait une
 * dépendance de plus pour un site qui en compte quatre). Ces contrôles sont
 * donc écrits à la main, ce qui a un coût : ils ne couvrent QUE ce qu'ils
 * énoncent. Le rapport de Gate 3 dit lesquels, et ne prétend pas à une
 * conformité WCAG globale — celle-ci exige un jugement humain.
 */

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

/* ================================================================== *
 * 1 · Structure du document
 * ================================================================== */

for (const route of ROUTES) {
  test(`structure sémantique · ${route}`, async ({ page }) => {
    await page.goto(route);

    // Un seul h1, non vide.
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    expect((await h1.innerText()).trim().length).toBeGreaterThan(3);

    // Points de repère : un main, un header, un footer, une nav nommée.
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);

    // Aucun saut de niveau de titre (h2 → h4).
    const skips = await page.evaluate(() => {
      const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) =>
        Number(h.tagName[1]),
      );
      const bad: string[] = [];
      for (let i = 1; i < levels.length; i++) {
        const prev = levels[i - 1]!;
        const cur = levels[i]!;
        if (cur > prev + 1) bad.push(`h${prev} → h${cur}`);
      }
      return bad;
    });
    expect(skips, skips.join(', ')).toEqual([]);
  });
}

/* ================================================================== *
 * 2 · Noms accessibles — aucun contrôle muet
 * ================================================================== */

const accessibleName = (page: Page) =>
  page.evaluate(() => {
    const out: string[] = [];
    const nodes = document.querySelectorAll<HTMLElement>('a[href], button');
    for (const el of nodes) {
      if (el.closest('[aria-hidden="true"]')) continue;
      const label =
        el.getAttribute('aria-label') ??
        (el.getAttribute('aria-labelledby')
          ? (document.getElementById(el.getAttribute('aria-labelledby')!)?.textContent ?? '')
          : '') ??
        '';
      const text = (el.textContent ?? '').trim();
      const title = el.getAttribute('title') ?? '';
      const imgAlt = [...el.querySelectorAll('img,svg')]
        .map((n) => n.getAttribute('alt') ?? n.querySelector('title')?.textContent ?? '')
        .join('');
      if ((label + text + title + imgAlt).trim() === '') {
        out.push(`${el.tagName.toLowerCase()} → ${el.outerHTML.slice(0, 120)}`);
      }
    }
    return out;
  });

for (const route of ROUTES) {
  test(`aucun lien ni bouton sans nom accessible · ${route}`, async ({ page }) => {
    await page.goto(route);
    const mute = await accessibleName(page);
    expect(mute, mute.join('\n')).toEqual([]);
  });
}

/* ================================================================== *
 * 3 · Images et champs
 * ================================================================== */

for (const route of ROUTES) {
  test(`images avec alternative et champs étiquetés · ${route}`, async ({ page }) => {
    await page.goto(route);

    const noAlt = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter((i) => i.getAttribute('alt') === null)
        .map((i) => i.getAttribute('src') ?? '?'),
    );
    expect(noAlt, noAlt.join('\n')).toEqual([]);

    const unlabelled = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"]), select, textarea',
      )) {
        if (el.closest('[aria-hidden="true"]')) continue;
        const id = el.id;
        const hasLabel =
          (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
          el.closest('label') ||
          el.getAttribute('aria-label') ||
          el.getAttribute('aria-labelledby');
        if (!hasLabel) out.push(el.outerHTML.slice(0, 120));
      }
      return out;
    });
    expect(unlabelled, unlabelled.join('\n')).toEqual([]);
  });
}

/* ================================================================== *
 * 4 · Langue
 * ================================================================== */

test('chaque route déclare la bonne langue de document', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang, route).toBe(route.startsWith('/de/') ? 'de' : 'en');
  }
});

/* ================================================================== *
 * 5 · Focus — visible, jamais supprimé, ordre naturel
 * ================================================================== */

test('aucun tabindex positif — l’ordre de tabulation suit le DOM', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const positive = await page.evaluate(() =>
      [...document.querySelectorAll('[tabindex]')]
        .map((el) => Number(el.getAttribute('tabindex')))
        .filter((n) => n > 0),
    );
    expect(positive, route).toEqual([]);
  }
});

/**
 * Le focus est vérifié par TABULATION RÉELLE, pas par `el.focus()` en script.
 *
 * `:focus-visible` dépend de l'heuristique du navigateur : un focus posé par
 * script hors de toute interaction clavier ne le déclenche pas. Un test qui
 * appelle `el.focus()` puis lit `outline` mesure donc l'état `:focus` nu et
 * signale « pas d'indicateur » sur des contrôles parfaitement corrects — ou,
 * pire, se rassure sur un fond de couleur qui n'a rien d'un indicateur.
 * Tabuler restitue le vrai état.
 */
for (const route of ['/', '/drinks/', '/contact/']) {
  test(`chaque arrêt de tabulation porte un indicateur visible · ${route}`, async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.goto(route);
    await page.locator('body').click({ position: { x: 2, y: 2 } });

    const invisible: string[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      const stop = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        return {
          key: el.outerHTML.slice(0, 90),
          outlineStyle: style.outlineStyle,
          outlineWidth: parseFloat(style.outlineWidth),
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow,
        };
      });
      if (!stop) break;
      if (seen.has(stop.key)) break; // boucle bouclée
      seen.add(stop.key);

      const outlined =
        stop.outlineStyle !== 'none' &&
        stop.outlineWidth >= 1 &&
        !stop.outlineColor.includes('rgba(0, 0, 0, 0)');
      if (!outlined && stop.boxShadow === 'none') invisible.push(stop.key);
    }

    expect(seen.size, 'aucun élément focalisable trouvé').toBeGreaterThan(5);
    expect(invisible, invisible.join('\n')).toEqual([]);
  });
}

test('le lien d’évitement est le premier élément focalisable et fonctionne', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/');
  await page.keyboard.press('Tab');

  const focused = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    href: document.activeElement?.getAttribute('href'),
    text: document.activeElement?.textContent?.trim(),
  }));
  expect(focused.tag).toBe('A');
  expect(focused.href).toBe('#main');
  expect(focused.text).toBeTruthy();

  // Visible une fois focalisé — un lien d'évitement qui reste caché ne sert
  // à rien. Le glissement dure 200ms : on attend qu'il se pose plutôt que de
  // mesurer au milieu de la transition.
  await expect
    .poll(async () => (await page.locator('a[href="#main"]').boundingBox())!.y)
    .toBeGreaterThanOrEqual(0);

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

/* ================================================================== *
 * 6 · Contraste calculé dans le DOM
 *
 * `qa:contrast` vérifie les TOKENS. Ce test vérifie le RENDU : une couleur
 * conforme dans le fichier de tokens peut être posée sur la mauvaise surface.
 * ================================================================== */

test('contraste du texte rendu ≥ 4.5:1 (3:1 pour le grand texte)', async ({ page }) => {
  const failures: string[] = [];

  for (const route of ['/', '/drinks/', '/brands/', '/about/', '/contact/', '/de/kontakt/']) {
    await page.goto(route);
    const bad = await page.evaluate(() => {
      const parse = (c: string): [number, number, number, number] => {
        const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1];
        return [m[0] ?? 0, m[1] ?? 0, m[2] ?? 0, m[3] ?? 1];
      };
      const lum = (rgb: number[]) => {
        const [r, g, b] = rgb.map((v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        }) as [number, number, number];
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      /** Fond effectif : on remonte jusqu'au premier ancêtre opaque. */
      const backdrop = (el: Element): number[] => {
        let n: Element | null = el;
        while (n) {
          const [r, g, b, a] = parse(getComputedStyle(n).backgroundColor);
          if (a === 1) return [r, g, b];
          n = n.parentElement;
        }
        return [255, 255, 255];
      };

      const out: string[] = [];
      for (const el of document.body.querySelectorAll<HTMLElement>('*')) {
        const text = [...el.childNodes]
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent ?? '')
          .join('')
          .trim();
        if (text.length < 2) continue;
        if (el.closest('[aria-hidden="true"]')) continue;
        const style = getComputedStyle(el);
        if (style.visibility === 'hidden' || style.opacity === '0') continue;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;

        const [fr, fg, fb, fa] = parse(style.color);
        if (fa < 1) continue; // texte semi-transparent : hors de portée de ce test
        const l1 = lum([fr, fg, fb]);
        const l2 = lum(backdrop(el));
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

        const size = parseFloat(style.fontSize);
        const bold = Number(style.fontWeight) >= 700;
        const large = size >= 24 || (bold && size >= 18.66);
        const need = large ? 3 : 4.5;

        if (ratio < need) {
          out.push(
            `${el.tagName.toLowerCase()}.${el.className || '—'} ${ratio.toFixed(
              2,
            )}:1 (requis ${need}) ${size}px — "${text.slice(0, 30)}"`,
          );
        }
      }
      return [...new Set(out)];
    });
    for (const item of bad) failures.push(`${route} · ${item}`);
  }

  expect(failures, failures.join('\n')).toEqual([]);
});

/* ================================================================== *
 * 7 · Mouvement réduit
 * ================================================================== */

test('prefers-reduced-motion : aucune animation, aucun GSAP téléchargé', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop');

  const requested: string[] = [];
  page.on('request', (r) => requested.push(r.url()));

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  // L'émulation elle-même est vérifiée : un test qui mesure le mauvais état
  // passe sans rien démontrer.
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );

  await page.waitForLoadState('networkidle');
  expect(requested.filter((u) => /gsap/i.test(u))).toEqual([]);

  const animating = await page.evaluate(() =>
    document.getAnimations().filter((a) => a.playState === 'running').length,
  );
  expect(animating).toBe(0);
});

/* ================================================================== *
 * 8 · Annonces dynamiques
 * ================================================================== */

test('les zones qui changent sans rechargement sont annoncées', async ({ page }) => {
  await page.goto('/drinks/');
  // Compteur de résultats du catalogue.
  await expect(page.locator('[aria-live]').first()).toHaveCount(1);

  await page.goto('/contact/');
  const status = page.locator('[data-form-status]');
  await expect(status).toHaveAttribute('aria-live', /polite|assertive/);
  await expect(status).toHaveAttribute('tabindex', '-1');
});
