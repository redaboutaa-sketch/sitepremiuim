import { expect, test, type Page } from '@playwright/test';

/**
 * SHELL — header, navigation, sélecteur de langue, menu mobile, footer.
 *
 * Gate strict : chaque exigence du TR-005 est vérifiée dans un vrai
 * navigateur, sur l'artefact statique servi.
 */

const isMobile = (page: Page) => page.viewportSize()!.width < 1024;

/* ================================================================== *
 * Header et navigation
 * ================================================================== */

test('le header porte la marque, la navigation et le CTA', async ({ page }, info) => {
  await page.goto('/');

  await expect(page.locator('header')).toBeVisible();
  // Le lien de marque porte désormais le logo officiel, et son nom accessible
  // est explicite sur la destination.
  await expect(page.locator('header a[aria-label="Ivan Arsenov — Home"]')).toBeVisible();

  if (info.project.name === 'desktop') {
    const nav = page.locator('header nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
    await expect(nav.locator('a')).toHaveCount(4);
    await expect(page.locator('header a.header__cta')).toBeVisible();
    await expect(page.locator('header a.header__cta')).toHaveText('Request a Quote');
  } else {
    // Sur mobile le CTA vit dans le panneau : le header reste dégagé.
    await expect(page.locator('header .header__toggle')).toBeVisible();
  }
});

test('le CTA du header mène à la page de demande', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'CTA inline en desktop');
  await page.goto('/');
  await page.locator('header a.header__cta').click();
  await expect(page).toHaveURL(/\/contact\/$/);
});

test('la page courante est signalée dans la navigation', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/drinks/');
  await expect(page.locator('header a[aria-current="page"]')).toHaveText('Drinks');
});

test('le header se densifie au défilement, et reste dense sans JS', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/drinks/');

  const header = page.locator('[data-header]');
  await expect(header).not.toHaveAttribute('data-scrolled', /.*/);

  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(header).toHaveAttribute('data-scrolled', '');

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).not.toHaveAttribute('data-scrolled', /.*/);
});

/* ================================================================== *
 * Sélecteur de langue — équivalence sémantique des routes
 * ================================================================== */

const EQUIVALENTS: Array<[string, string]> = [
  ['/', '/de/'],
  ['/drinks/', '/de/getraenke/'],
  ['/brands/', '/de/marken/'],
  ['/about/', '/de/ueber-uns/'],
  ['/contact/', '/de/kontakt/'],
  ['/imprint/', '/de/impressum/'],
  ['/privacy/', '/de/datenschutz/'],
  ['/cookies/', '/de/cookies/'],
];

for (const [en, de] of EQUIVALENTS) {
  test(`le sélecteur mène de ${en} à ${de} et retour`, async ({ page }) => {
    await page.goto(en);
    // Le premier sélecteur du document : header en desktop, panneau en mobile.
    await page.locator('.lang__link[hreflang="de"]').first().click();
    await expect(page, `${en} doit mener à ${de}, pas à /de/`).toHaveURL(
      new RegExp(`${de.replace(/\//g, '\\/')}$`),
    );

    await page.locator('.lang__link[hreflang="en"]').first().click();
    await expect(page).toHaveURL(new RegExp(`${en.replace(/\//g, '\\/')}$`));
  });
}

test('la langue courante est signalée', async ({ page }) => {
  await page.goto('/de/getraenke/');
  await expect(page.locator('.lang__link[aria-current="true"]').first()).toHaveText('DE');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});

/* ================================================================== *
 * Menu mobile
 * ================================================================== */

test.describe('menu mobile', () => {
  // `testInfo` n'est pas passé au callback de skip d'un describe : on filtre
  // par test, où la signature (fixtures, testInfo) est disponible.
  test.beforeEach(async ({ }, info) => {
    test.skip(info.project.name !== 'mobile', 'mobile uniquement');
  });

  test('ouverture, fermeture et état ARIA', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-menu-toggle]');
    const panel = page.locator('[data-mobile-nav]');

    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(panel).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('Esc ferme le menu et restaure le focus sur le déclencheur', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-menu-toggle]');

    await toggle.click();
    await expect(page.locator('[data-mobile-nav]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-mobile-nav]')).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('le focus entre dans le panneau à l’ouverture', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu-toggle]').click();

    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
    // Le focus doit être DANS le panneau, pas resté sur le bouton.
    expect(await focused.evaluate((el) => !!el.closest('[data-mobile-nav]'))).toBe(true);
  });

  test('le focus est piégé dans le panneau', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu-toggle]').click();

    // Un cycle complet de Tab ne doit jamais atteindre le contenu principal.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const escaped = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return false;
        return !el.closest('[data-mobile-nav]') && !el.hasAttribute('data-menu-toggle');
      });
      expect(escaped, `le focus s’est échappé au Tab n°${i + 1}`).toBe(false);
    }
  });

  test('l’arrière-plan est inerte et le défilement bloqué', async ({ page }) => {
    await page.goto('/drinks/');
    await page.evaluate(() => window.scrollTo(0, 300));

    await page.locator('[data-menu-toggle]').click();

    await expect(page.locator('#main')).toHaveAttribute('inert', '');
    await expect(page.locator('[data-footer]')).toHaveAttribute('inert', '');
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');

    // Le défilement est restitué à l’identique après fermeture.
    await page.keyboard.press('Escape');
    await expect(page.locator('#main')).not.toHaveAttribute('inert', /.*/);
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(250);
  });

  test('naviguer depuis le menu ne laisse pas le défilement bloqué', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu-toggle]').click();
    await page.locator('[data-mobile-nav] a[href="/brands/"]').click();

    await expect(page).toHaveURL(/\/brands\/$/);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
  });

  test('aucun contrôle du menu ne dépend du survol', async ({ page }) => {
    await page.goto('/');
    // Ouverture au CLAVIER seul, sans jamais survoler quoi que ce soit.
    await page.keyboard.press('Tab'); // lien d’évitement
    const opened = await page.evaluate(() => {
      const t = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
      t?.focus();
      t?.click();
      return document.querySelector('[data-mobile-nav]')?.hasAttribute('hidden') === false;
    });
    expect(opened).toBe(true);
  });

  test('le menu ouvert ne déborde pas horizontalement', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu-toggle]').click();
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(scroll).toBeLessThanOrEqual(client + 1);
  });
});

/* ================================================================== *
 * Footer
 * ================================================================== */

test('le footer porte l’identité juridique vérifiable', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('[data-footer]');

  await expect(footer).toContainText('Ivan Arsenov Iliev');
  await expect(footer).toContainText('Zwischenbrücken 8');
  await expect(footer).toContainText('27793 Wildeshausen');
  await expect(footer).toContainText('Germany');
  await expect(footer).toContainText('DE464097303');
  await expect(footer.locator('a[href="mailto:info@ivan-arsenov.de"]')).toBeVisible();
});

test('le footer porte la mention de non-affiliation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-footer]')).toContainText('No affiliation');
});

test('aucun numéro de téléphone inventé', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-footer] a[href^="tel:"]')).toHaveCount(0);
});

test('les liens légaux mènent aux bonnes pages', async ({ page }) => {
  await page.goto('/');
  for (const [label, href] of [
    ['Imprint', '/imprint/'],
    ['Privacy', '/privacy/'],
    ['Cookies', '/cookies/'],
  ] as const) {
    await expect(page.locator(`[data-footer] a[href="${href}"]`), label).toHaveCount(1);
  }
});

/* ================================================================== *
 * Identité provisoire
 * ================================================================== */

test('la marque du site n’est plus provisoire', async ({ page }) => {
  await page.goto('/');

  /*
   * L'identité officielle a été livrée le 2026-08-17 : le header et le footer
   * ne doivent plus porter AUCUN marqueur provisoire. Le garde-fou reste en
   * place — il détecterait une régression où un asset cesserait de se résoudre
   * et repasserait au repli typographique sans que personne ne le voie.
   */
  await expect(page.locator('.header__mark [data-mark-provisional]')).toHaveCount(0);
  await expect(page.locator('footer [data-mark-provisional]')).toHaveCount(0);

  /*
   * Reste le filigrane « IA » du hero, encore composé en typographie. Le hero
   * est gelé par décision : ce test l'ATTEND explicitement, pour qu'il soit
   * remplacé sciemment et non oublié.
   */
  const watermark = page.locator('[data-hero] [data-mark-provisional]');
  await expect(watermark).toHaveCount(1);
  await expect(watermark).toHaveAttribute('data-mark-provisional', /filigrane/);
});

/* ================================================================== *
 * Accessibilité transverse
 * ================================================================== */

test('le lien d’évitement mène au contenu principal', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.locator('.skip-link');
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute('href', '#main');
});

test('toutes les cibles interactives du shell font au moins 44px', async ({ page }) => {
  await page.goto('/');
  const small = await page.evaluate(() => {
    const out: string[] = [];
    const scope = [
      ...document.querySelectorAll('header a, header button'),
      ...document.querySelectorAll('[data-footer] a'),
    ];
    for (const el of scope) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.height < 44) out.push(`${el.textContent?.trim().slice(0, 30)} — ${Math.round(r.height)}px`);
    }
    return out;
  });
  expect(small).toEqual([]);
});

test('aucun débordement horizontal sur les pages du shell', async ({ page }) => {
  for (const route of ['/', '/drinks/', '/de/', '/de/kontakt/']) {
    await page.goto(route);
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(scroll, route).toBeLessThanOrEqual(client + 1);
  }
});
