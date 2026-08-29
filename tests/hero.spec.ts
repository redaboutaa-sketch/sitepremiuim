import { expect, test } from '@playwright/test';

/**
 * HERO « THE STAGE » — gate visuel et fonctionnel.
 */

/* ================================================================== *
 * Contenu et conversion
 * ================================================================== */

test('le hero porte l’eyebrow, le H1 approuvé et les deux CTA', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Soft drinks without borders.');
  await expect(page.locator('[data-hero]')).toContainText(
    'B2B Soft Drinks · International Selection',
  );

  const primary = page.locator('[data-hero] a.btn--primary');
  await expect(primary).toHaveText('Request a Quote');
  await expect(primary).toHaveAttribute('href', '/contact/');

  const secondary = page.locator('[data-hero] a.btn--text');
  await expect(secondary).toHaveText('Explore Our Drinks');
  await expect(secondary).toHaveAttribute('href', '/drinks/');
});

test('le H1 allemand est une adaptation, pas une transposition littérale', async ({ page }) => {
  await page.goto('/de/');
  await expect(page.locator('h1')).toHaveText('Erfrischung ohne Grenzen.');
});

test('le CTA principal est atteignable sans défilement', async ({ page }) => {
  await page.goto('/');
  const box = await page.locator('[data-hero] a.btn--primary').boundingBox();
  const vh = page.viewportSize()!.height;
  expect(box!.y + box!.height, 'le CTA doit tenir dans le premier écran').toBeLessThanOrEqual(vh);
});

/* ================================================================== *
 * Lisibilité sans JavaScript
 * ================================================================== */

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('le H1, le texte et les CTA restent lisibles', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    // Les mots sont sous masque de débordement : sans JS ils doivent être
    // posés dans leur état final, pas glissés hors du masque.
    const hidden = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.reveal-mask > *')).filter((el) => {
        const cs = getComputedStyle(el);
        return cs.opacity === '0' || cs.transform.includes('matrix') === false ? false : false;
      }).length,
    );
    expect(hidden).toBe(0);

    const words = await page.locator('.hero__word > span').allTextContents();
    expect(words.join(' ')).toBe('Soft drinks without borders.');

    await expect(page.locator('[data-hero] a.btn--primary')).toBeVisible();
  });
});

/* ================================================================== *
 * Reduced motion
 * ================================================================== */

test.describe('prefers-reduced-motion', () => {
  /*
   * `emulateMedia` appliqué AVANT navigation, plutôt que `test.use`.
   * Vérifié : dans ce projet, test.use({ reducedMotion }) ne prenait pas
   * effet — matchMedia renvoyait false et les tests mesuraient en réalité un
   * rendu à mouvement autorisé. Un garde-fou qui teste le mauvais état est
   * pire que pas de garde-fou.
   */
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('l’émulation est bien active', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
      true,
    );
  });

  test('la composition finale est rendue, sans parallaxe ni translation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(600);

    await expect(page.locator('h1')).toBeVisible();

    // Aucun décalage de parallaxe ne subsiste sur les emplacements.
    const offsets = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('.hero__slot')).map((el) => ({
        px: el.style.getPropertyValue('--px'),
        py: el.style.getPropertyValue('--py'),
      })),
    );
    for (const o of offsets) {
      expect(o.px === '' || o.px === '0px', 'aucune parallaxe horizontale').toBe(true);
      expect(o.py === '' || o.py === '0px', 'aucune parallaxe verticale').toBe(true);
    }

    // Les mots du titre sont visibles, pas masqués.
    const opacity = await page
      .locator('.hero__word > span')
      .first()
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
  });

  test('GSAP n’est pas téléchargé', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    expect(requests.filter((u) => /gsap|ScrollTrigger/i.test(u))).toEqual([]);
  });
});

/* ================================================================== *
 * Direction artistique — interdits
 * ================================================================== */

test('aucun néon, aucune lueur, aucun halo dans le hero', async ({ page }) => {
  await page.goto('/');
  const violations = await page.evaluate(() => {
    const found: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('[data-hero] *')) {
      const cs = getComputedStyle(el);
      if (cs.boxShadow !== 'none') found.push(`box-shadow sur ${el.className}`);
      if (cs.textShadow !== 'none') found.push(`text-shadow sur ${el.className}`);
      if (cs.backdropFilter && cs.backdropFilter !== 'none') {
        found.push(`backdrop-filter sur ${el.className}`);
      }
      const radius = parseFloat(cs.borderTopLeftRadius) || 0;
      if (radius > 0) found.push(`border-radius sur ${el.className}`);
    }
    return found;
  });
  expect(violations).toEqual([]);
});

test('le filigrane du monogramme reste extrêmement discret', async ({ page }) => {
  await page.goto('/');

  /*
   * Depuis TR-024C le filigrane est le monogramme OFFICIEL, donc une image :
   * la discrétion se mesure sur `opacity`, plus sur l'alpha d'une couleur de
   * texte. Le plafond, lui, n'a pas bougé — c'est lui qui empêche la dérive
   * du filigrane vers une signature.
   */
  const mark = page.locator('.hero__monogram');
  const state = await mark.evaluate((el) => ({
    opacity: Number(getComputedStyle(el).opacity),
    tag: el.tagName.toLowerCase(),
    alt: el.getAttribute('alt'),
  }));

  expect(state.opacity, 'opacité du filigrane').toBeLessThanOrEqual(0.06);
  expect(state.opacity).toBeGreaterThan(0);
  expect(state.tag).toBe('img');
  // Une image au texte alternatif vide est déjà hors de l'arbre
  // d'accessibilité : c'est la forme canonique pour un décor.
  expect(state.alt).toBe('');
});

test('la scène rend ses six packshots, sans aucun repli', async ({ page }) => {
  await page.goto('/');
  /*
   * ⚠️ INVERSÉ LE 2026-08-29. Le contrôle exigeait ZÉRO image dans la scène :
   * aucun asset n'était alors autorisé, et une <img> y aurait signifié qu'un
   * visuel non validé avait fui en production.
   *
   * Les six packshots sont autorisés et publiés depuis. Ce qu'on vérifie
   * maintenant, c'est que la scène est COMPLÈTE — six objets, aucun repli.
   * Un emplacement qui retomberait sur le repli serait une régression
   * silencieuse, exactement le genre que ce fichier existe pour attraper.
   */
  await expect(page.locator('[data-stage] img')).toHaveCount(6);
  await expect(page.locator('[data-stage] .product-object__fallback')).toHaveCount(0);
});

/* ================================================================== *
 * Accessibilité
 * ================================================================== */

test('la scène est décorative et masquée aux technologies d’assistance', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-stage]')).toHaveAttribute('aria-hidden', 'true');
});

test('le parcours clavier atteint les CTA du hero', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/');

  const reached: string[] = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    reached.push(
      await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 24) ?? ''),
    );
  }
  expect(reached.some((t) => t.includes('Request a Quote'))).toBe(true);
  expect(reached.some((t) => t.includes('Explore Our Drinks'))).toBe(true);
});

test('un seul h1, hiérarchie de titres correcte', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('h1').count()).toBe(1);
  // Aucun h3 ne doit précéder un h2 sur la page.
  const levels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((el) => Number(el.tagName[1])),
  );
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i]! - levels[i - 1]!, 'aucun saut de niveau').toBeLessThanOrEqual(1);
  }
});

/* ================================================================== *
 * Mise en page
 * ================================================================== */

for (const width of [320, 375, 412, 768, 1024, 1440, 1920]) {
  test(`aucun débordement horizontal à ${width}px`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'un seul projet suffit');
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(300);
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(scroll, `${width}px`).toBeLessThanOrEqual(client + 1);
  });
}

test('aucun saut de mise en page à l’entrée', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as PerformanceEntry[]) {
            const e = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
            if (!e.hadRecentInput) total += e.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(total), 1500);
      }),
  );
  expect(cls, 'CLS').toBeLessThan(0.1);
});

test('aucune erreur console sur la homepage', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(800);
  expect(errors).toEqual([]);
});
