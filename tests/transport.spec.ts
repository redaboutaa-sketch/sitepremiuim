import { expect, test, type Page, type Route } from '@playwright/test';

/**
 * CONTRAT DE DISPONIBILITÉ DU TRANSPORT (TR-020).
 *
 * Ces tests vérifient la SONDE, pas la livraison. Aucun d'entre eux ne peut
 * établir `FORM_DELIVERY_READY` : ils démontrent seulement que le front
 * interprète correctement le contrat, que le défaut est fermé, et qu'un
 * endpoint POST parfaitement fonctionnel n'est jamais déclaré indisponible
 * pour un motif de méthode.
 */

const FIELDS = {
  '#firstName': 'Anna',
  '#lastName': 'Weber',
  '#company': 'Weber Getränke GmbH',
  '#country': 'Germany',
  '#email': 'a.weber@example.com',
  '#message': 'Interested in the carbonated range.',
};

async function fillAndSubmit(page: Page) {
  for (const [selector, value] of Object.entries(FIELDS)) await page.fill(selector, value);
  await page.check('#consent');
  await page.locator('[data-submit]').click();
}

/** Journalise toutes les requêtes vers l'endpoint et applique un scénario. */
function stubEndpoint(page: Page, handler: (route: Route) => Promise<void> | void) {
  const seen: { method: string; url: string }[] = [];
  page.route('**/api/enquiry.php*', async (route) => {
    const request = route.request();
    seen.push({ method: request.method(), url: request.url() });
    await handler(route);
  });
  return seen;
}

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

/* ================================================================== *
 * Forme de la sonde
 * ================================================================== */

test('la sonde est un GET ?probe=1 — jamais un HEAD', async ({ page }) => {
  await page.goto('/contact/');
  const seen = stubEndpoint(page, (route) => route.fulfill(json({ delivery: 'not-ready' })));

  await fillAndSubmit(page);
  await expect(page.locator('[data-form-status]')).toBeVisible();

  expect(seen.length).toBeGreaterThan(0);
  const probe = seen[0];
  expect(probe?.method).toBe('GET');
  expect(probe?.url).toContain('probe=1');
  expect(seen.some((r) => r.method === 'HEAD')).toBe(false);
});

/* ================================================================== *
 * Le cas que le contrat existe pour corriger
 * ================================================================== */

test('un endpoint qui refuse HEAD (405) reste disponible s’il répond ready en GET', async ({
  page,
}) => {
  await page.goto('/contact/');
  const seen = stubEndpoint(page, (route) => {
    const request = route.request();
    // Un endpoint POST a parfaitement le droit de rejeter HEAD.
    if (request.method() === 'HEAD') return route.fulfill({ status: 405 });
    if (request.url().includes('probe=1')) return route.fulfill(json({ delivery: 'ready' }));
    return route.fulfill({ status: 200, body: 'ok' });
  });

  await fillAndSubmit(page);

  // La soumission POST a bien eu lieu : la sonde n'a pas produit de faux négatif.
  await expect
    .poll(() => seen.filter((r) => r.method === 'POST').length)
    .toBeGreaterThan(0);
  await expect(page.locator('[data-form-status]')).toContainText('has been received');
});

/* ================================================================== *
 * Défaut fermé — toute ambiguïté vaut indisponible
 * ================================================================== */

const CLOSED: { name: string; fulfil: (route: Route) => Promise<void> | void }[] = [
  {
    name: 'delivery: not-ready',
    fulfil: (route) => route.fulfill(json({ delivery: 'not-ready' })),
  },
  {
    name: 'JSON illisible',
    fulfil: (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '<html>' }),
  },
  {
    name: 'clé absente',
    fulfil: (route) => route.fulfill(json({ status: 'ok' })),
  },
  {
    name: 'valeur inattendue',
    fulfil: (route) => route.fulfill(json({ delivery: 'maybe' })),
  },
  {
    name: '404 — fichier jamais déposé',
    fulfil: (route) => route.fulfill({ status: 404 }),
  },
  {
    name: '503 — présent mais non configuré',
    fulfil: (route) => route.fulfill({ status: 503 }),
  },
  {
    name: 'panne réseau',
    fulfil: (route) => route.abort('failed'),
  },
];

for (const scenario of CLOSED) {
  test(`indisponible : ${scenario.name} — aucun envoi annoncé`, async ({ page }) => {
    await page.goto('/contact/');
    const seen = stubEndpoint(page, scenario.fulfil);

    await fillAndSubmit(page);

    const status = page.locator('[data-form-status]');
    await expect(status).toBeVisible();
    await expect(status).toContainText('Nothing has been sent');
    await expect(status).toContainText('info@ivan-arsenov.de');
    // Le point capital : aucune donnée n'est partie, et rien n'est prétendu.
    expect(seen.some((r) => r.method === 'POST')).toBe(false);
    await expect(status).not.toContainText('has been received');
  });
}

/* ================================================================== *
 * Chemin nominal
 * ================================================================== */

test('disponible : ready → POST réel, sélection jointe et vidée', async ({ page }) => {
  await page.goto('/drinks/');
  await page.locator('[data-brand="mirinda"] [data-enquiry-add]').click();
  await page.goto('/contact/');

  let posted: string | null = null;
  stubEndpoint(page, (route) => {
    const request = route.request();
    if (request.url().includes('probe=1')) return route.fulfill(json({ delivery: 'ready' }));
    posted = request.postData();
    return route.fulfill({ status: 200, body: 'ok' });
  });

  await fillAndSubmit(page);

  await expect(page.locator('[data-form-status]')).toContainText('has been received');
  expect(posted).toContain('mirinda');
  expect(posted).toContain('a.weber@example.com');
  // La sélection est repartie de zéro : elle a été transmise, elle n'a plus
  // à vivre dans la session.
  expect(
    await page.evaluate(() => JSON.parse(sessionStorage.getItem('ia.enquiry') ?? '[]') as string[]),
  ).toEqual([]);
});

test('erreur serveur après une sonde ready — les données saisies sont conservées', async ({
  page,
}) => {
  await page.goto('/contact/');
  stubEndpoint(page, (route) => {
    const request = route.request();
    if (request.url().includes('probe=1')) return route.fulfill(json({ delivery: 'ready' }));
    return route.fulfill({ status: 502 });
  });

  await fillAndSubmit(page);

  const status = page.locator('[data-form-status]');
  await expect(status).toContainText('could not be sent');
  // On n'efface jamais le travail de l'utilisateur sur un échec de transport.
  await expect(page.locator('#message')).toHaveValue(FIELDS['#message']);
  await expect(page.locator('#company')).toHaveValue(FIELDS['#company']);
});

/* ================================================================== *
 * Le modèle serveur honore le contrat qu'il définit
 * ================================================================== */

test('le modèle PHP implémente bien la sonde GET et refuse le reste', async () => {
  const fs = await import('node:fs/promises');
  const source = await fs.readFile('deploy/enquiry.php.example', 'utf8');

  expect(source).toContain("$_GET['probe']");
  expect(source).toContain("'delivery' => $ready ? 'ready' : 'not-ready'");
  // Un endpoint non configuré refuse explicitement plutôt que de répondre 200
  // sans rien envoyer.
  expect(source).toContain('http_response_code(503)');
  expect(source).toContain("$_SERVER['REQUEST_METHOD'] !== 'POST'");
  // L'adresse du prospect ne doit jamais usurper le domaine expéditeur.
  expect(source).toContain("'Reply-To: ' . $email");
  expect(source).toContain("'From: ' . $config['sender']");
  expect(source).not.toContain("'From: ' . $email");
});
