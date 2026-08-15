import { expect, test, type Page } from '@playwright/test';

/**
 * PARCOURS B2B SANS COMMERCE — Discover → Select → Enquire.
 * Desktop, mobile, clavier et allemand.
 */

const selection = (page: Page) =>
  page.evaluate(() => JSON.parse(sessionStorage.getItem('ia.enquiry') ?? '[]') as string[]);

/* ================================================================== *
 * Vocabulaire — garde-fou permanent
 * ================================================================== */

const BANNED = ['cart', 'basket', 'checkout', 'buy now', 'purchase', 'order now', 'subtotal'];

for (const route of ['/drinks/', '/brands/', '/contact/', '/de/getraenke/', '/de/kontakt/']) {
  test(`aucun vocabulaire e-commerce sur ${route}`, async ({ page }) => {
    await page.goto(route);
    const text = (await page.locator('body').innerText()).toLowerCase();
    for (const word of BANNED) expect(text, `${route} · ${word}`).not.toContain(word);
    // Aucun prix affiché nulle part.
    expect(text).not.toMatch(/[€$£]\s?\d/);
  });
}

/* ================================================================== *
 * FLOW 1 — desktop complet
 * ================================================================== */

test('FLOW desktop — home → drinks → filtre → recherche → sélection → panneau → formulaire', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop');

  await page.goto('/');
  await page.locator('[data-hero] a.btn--text').click();
  await expect(page).toHaveURL(/\/drinks\/$/);

  // Filtre
  await page.locator('[data-filter="carbonated"]').click();
  await expect(page).toHaveURL(/category=carbonated/);
  await expect(page.locator('[data-brand]:not([hidden])')).toHaveCount(26);

  // Recherche
  await page.locator('[data-search-input]').fill('fanta');
  await expect(page.locator('[data-brand]:not([hidden])')).toHaveCount(1);
  await expect(page).toHaveURL(/q=fanta/);

  // Sélection
  await page.locator('[data-brand="fanta"] [data-enquiry-add]').click();
  await expect(page.locator('[data-brand="fanta"] [data-enquiry-add]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('[data-brand="fanta"] [data-enquiry-add]')).toContainText('Selected');

  // Deuxième marque
  await page.locator('[data-search-input]').fill('');
  await page.locator('[data-filter="all"]').click();
  await page.locator('[data-brand="red-bull"] [data-enquiry-add]').click();
  expect(await selection(page)).toEqual(['fanta', 'red-bull']);

  // Compteur puis panneau
  const indicator = page.locator('[data-enquiry-indicator]');
  await expect(indicator).toBeVisible();
  await expect(indicator).toContainText('2 selected');
  await indicator.click();
  await expect(page.locator('[data-enquiry-panel]')).toBeVisible();
  await expect(page.locator('[data-enquiry-list] li')).toHaveCount(2);

  // Retrait puis ré-ajout
  await page.locator('[data-enquiry-list] button').first().click();
  await expect(page.locator('[data-enquiry-list] li')).toHaveCount(1);

  // Transfert vers le formulaire
  await page.locator('[data-enquiry-panel] a.btn--primary').click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await expect(page.locator('[data-selection-chips] .chip')).toHaveCount(1);
  await expect(page.locator('[data-selection-chips] .chip')).toContainText('Red Bull');
});

/* ================================================================== *
 * Formulaire — les cinq états
 * ================================================================== */

test('formulaire — invalide : erreurs spécifiques et focus sur le premier champ', async ({ page }) => {
  await page.goto('/contact/');
  await page.locator('[data-submit]').click();

  const errors = page.locator('.field__error:not([hidden])');
  await expect(errors).toHaveCount(7);
  await expect(errors.first()).toHaveText('Enter your first name.');
  // Le focus sert à corriger ; le message est annoncé par aria-live.
  await expect(page.locator('#firstName')).toBeFocused();
  await expect(page.locator('#firstName')).toHaveAttribute('aria-invalid', 'true');
});

test('formulaire — message d’erreur lié au champ par aria-describedby', async ({ page }) => {
  await page.goto('/contact/');
  await page.fill('#email', 'pas-un-email');
  await page.locator('#email').blur();
  const described = await page.locator('#email').getAttribute('aria-describedby');
  expect(described).toBeTruthy();
  await expect(page.locator(`#${described}`)).toContainText('complete email address');
});

test('formulaire — transport non configuré : aucun envoi simulé', async ({ page }) => {
  await page.goto('/contact/');
  await page.fill('#firstName', 'Anna');
  await page.fill('#lastName', 'Weber');
  await page.fill('#company', 'Weber Getränke GmbH');
  await page.fill('#country', 'Germany');
  await page.fill('#email', 'a.weber@example.com');
  await page.fill('#message', 'Interested in the carbonated range.');
  await page.check('#consent');
  await page.locator('[data-submit]').click();

  const status = page.locator('[data-form-status]');
  await expect(status).toBeVisible();
  // FORM_UI_READY ≠ FORM_DELIVERY_READY : le site ne prétend pas avoir envoyé.
  await expect(status).toContainText('Nothing has been sent');
  await expect(status).toContainText('info@ivan-arsenov.de');
});

test('formulaire — aucun délai de réponse promis', async ({ page }) => {
  await page.goto('/contact/');
  const text = (await page.locator('body').innerText()).toLowerCase();
  expect(text).not.toMatch(/within \d+ ?(hour|day)/);
  expect(text).not.toContain('24 hours');
});

test('formulaire — six champs requis seulement', async ({ page }) => {
  await page.goto('/contact/');
  const required = await page.locator('form [required]').evaluateAll((els) =>
    els.map((e) => (e as HTMLInputElement).name),
  );
  expect(required.sort()).toEqual(
    ['company', 'consent', 'country', 'email', 'firstName', 'lastName', 'message'].sort(),
  );
});

/* ================================================================== *
 * Persistance de session
 * ================================================================== */

test('la sélection survit à la navigation', async ({ page }) => {
  await page.goto('/drinks/');
  await page.locator('[data-brand="evian"] [data-enquiry-add]').click();
  await page.goto('/brands/');
  await expect(page.locator('[data-enquiry-indicator]')).toContainText('1 selected');
  // Sur /brands/ il n'y a pas de cellule de catalogue : le bouton porte
  // lui-même le slug.
  await expect(page.locator('[data-enquiry-add="evian"]').first()).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('aucun double ajout possible', async ({ page }) => {
  await page.goto('/drinks/');
  const button = page.locator('[data-brand="evian"] [data-enquiry-add]');
  await button.click();
  await button.click();
  await button.click();
  expect(await selection(page)).toEqual(['evian']);
});

/* ================================================================== *
 * Clavier
 * ================================================================== */

test('FLOW clavier — sélection et panneau sans souris', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/drinks/');

  const button = page.locator('[data-brand="fanta"] [data-enquiry-add]');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'true');

  await page.locator('[data-enquiry-indicator]').focus();
  await page.keyboard.press('Enter');
  const panel = page.locator('[data-enquiry-panel]');
  await expect(panel).toBeVisible();

  // Le focus entre dans le panneau.
  expect(
    await page.evaluate(() => !!document.activeElement?.closest('[data-enquiry-panel]')),
  ).toBe(true);

  // Le focus y est piégé.
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(() => !!document.activeElement?.closest('[data-enquiry-panel]')),
      `échappé au Tab ${i + 1}`,
    ).toBe(true);
  }

  // Esc ferme et restaure le focus.
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(page.locator('[data-enquiry-indicator]')).toBeFocused();
});

/* ================================================================== *
 * Allemand
 * ================================================================== */

test('FLOW allemand — filtre, sélection, formulaire, sans fragment anglais', async ({ page }) => {
  await page.goto('/de/getraenke/');
  await expect(page.locator('h1')).toHaveText('Getränkesortiment entdecken');

  await page.locator('[data-filter="water"]').click();
  await expect(page).toHaveURL(/category=water/);
  await expect(page.locator('[data-brand]:not([hidden])')).toHaveCount(8);

  const button = page.locator('[data-brand="evian"] [data-enquiry-add]');
  await button.click();
  await expect(button).toContainText('Ausgewählt');
  await expect(page.locator('[data-enquiry-indicator]')).toContainText('1 ausgewählt');

  await page.goto('/de/kontakt/');
  await expect(page.locator('h1')).toHaveText('Reden wir über Geschäfte.');
  await expect(page.locator('[data-selection-chips] .chip')).toContainText('Evian');

  await page.locator('[data-submit]').click();
  await expect(page.locator('.field__error:not([hidden])').first()).toHaveText(
    'Bitte geben Sie Ihren Vornamen ein.',
  );

  // Aucune chaîne anglaise résiduelle dans l'interface allemande.
  const text = await page.locator('main').innerText();
  // « optional » n'est pas une fuite : c'est un mot allemand courant, et
  // c'est le terme retenu dans l'adaptation.
  for (const leak of ['First name', 'Last name', 'Send Business Enquiry', 'Country']) {
    expect(text, leak).not.toContain(leak);
  }
});

/* ================================================================== *
 * Mise en page
 * ================================================================== */

for (const route of ['/drinks/', '/brands/', '/contact/', '/about/']) {
  test(`aucun débordement horizontal sur ${route}`, async ({ page }) => {
    await page.goto(route);
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(scroll, route).toBeLessThanOrEqual(client + 1);
  });
}

test('le catalogue reste lisible sans JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/drinks/');
  // Les 62 marques sont rendues par le serveur.
  await expect(page.locator('[data-brand]')).toHaveCount(62);
  // Les boutons de sélection ne sont pas rendus : un bouton mort serait pire.
  await expect(page.locator('[data-enquiry-add]:not([hidden])')).toHaveCount(0);
  // Les filtres restent de vrais liens.
  await expect(page.locator('[data-filter="water"]')).toHaveAttribute(
    'href',
    '/drinks/?category=water',
  );
  await context.close();
});

test('/brands/ ne réplique pas la grille de /drinks/', async ({ page }) => {
  await page.goto('/brands/');
  // Aucun plateau : la page marques est un registre typographique.
  await expect(page.locator('.product-object')).toHaveCount(0);
  await expect(page.locator('.brands-group')).toHaveCount(5);
  await expect(page.locator('.brands-group__link').first()).toHaveAttribute(
    'href',
    /\/drinks\/\?brand=/,
  );
});
