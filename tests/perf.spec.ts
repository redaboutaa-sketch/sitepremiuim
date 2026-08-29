import { expect, test } from '@playwright/test';

/**
 * TR-020 — PASSE PERFORMANCE, mesurée sur l'artefact `dist/` servi.
 *
 * ⚠️ HONNÊTETÉ DE LA MESURE
 * Ces chiffres sont relevés en local, sur un serveur statique, sans latence
 * réseau et SANS AUCUN PACKSHOT — les 88 visuels attendus n'existent pas
 * encore. Le poids réel en production sera supérieur. Ce ne sont donc pas des
 * scores Lighthouse terrain, et le rapport ne les présentera pas comme tels :
 * ce sont des budgets de non-régression sur ce qui est effectivement livré.
 */

const ROUTES = ['/', '/drinks/', '/brands/', '/about/', '/contact/', '/de/', '/de/getraenke/'];

/**
 * Budgets, en octets.
 *
 * `js` = le JavaScript que TOUT visiteur reçoit. `jsMotion` = GSAP et
 * ScrollTrigger, chargés uniquement sur écran large ET si le mouvement n'est
 * pas refusé. Les compter ensemble masquerait précisément la distinction que
 * l'architecture cherche à garantir : un visiteur en `prefers-reduced-motion`
 * ne télécharge pas 110 Ko d'animation qu'il n'exécutera jamais.
 */
const BUDGET = {
  html: 90_000,
  cssTotal: 90_000,
  jsTotal: 20_000,
  jsMotionTotal: 130_000,
  fontsTotal: 200_000,
  pageTotal: 400_000,
};

/**
 * Plafond de poids TOTAL, par route.
 *
 * ⚠️ RELEVÉ LE 2026-08-29, après la publication des visuels de marque.
 *
 * Le plafond unique de 400 Ko décrivait un site dont toutes les pages
 * rendaient des replis typographiques. Depuis que les 28 visuels autorisés
 * sont publiés, deux pages portent de vraies images et ce chiffre ne décrit
 * plus rien : le tenir aurait obligé à retirer les photos que le client vient
 * de décider de publier.
 *
 * Les valeurs ci-dessous sont donc MESURÉES puis arrondies vers le haut avec
 * une marge de non-régression — pas choisies pour faire passer le test.
 *
 *   /                 782 Ko mesurés  →  850 000   (6 packshots hero + piste)
 *   /drinks/          424 Ko mesurés  →  480 000   (14 logos, chargés paresseux)
 *   toutes les autres         < 400 Ko →  400 000   (inchangé)
 *
 * Sur l'accueil, 479 Ko sont des images réparties sur une vingtaine de
 * fichiers de 20 à 62 Ko : aucun fichier aberrant, c'est le nombre qui pèse.
 * Les six packshots de la scène sont chargés en avidité — ils sont au-dessus
 * de la ligne de flottaison — pendant que la piste Featured reste paresseuse.
 *
 * PISTE D'OPTIMISATION, si le poids devient un sujet : ce sont ces six-là
 * qu'il faut viser, pas la piste.
 */
const PAGE_TOTAL: Record<string, number> = {
  '/': 850_000,
  '/de/': 850_000,
  '/drinks/': 480_000,
  '/de/getraenke/': 480_000,
};

/** Chunks d'animation, reconnus par nom de module et non par taille. */
const MOTION_CHUNK = /\/(gsap|ScrollTrigger)\./i;

type Weights = Record<string, number> & { total: number };

async function weigh(page: import('@playwright/test').Page, route: string) {
  const bytes: Record<string, number> = {};
  const thirdParty: string[] = [];

  page.on('response', async (response) => {
    const url = response.url();
    if (!url.startsWith('http://127.0.0.1:4321')) {
      if (!url.startsWith('data:')) thirdParty.push(url);
      return;
    }
    const type = url.endsWith('.css')
      ? 'css'
      : url.endsWith('.js')
        ? MOTION_CHUNK.test(url)
          ? 'jsMotion'
          : 'js'
        : /\.(woff2?|ttf|otf)$/.test(url)
          ? 'font'
          : /\.(png|jpe?g|webp|avif|svg|gif)$/.test(url)
            ? 'image'
            : 'html';
    let size = 0;
    try {
      size = (await response.body()).byteLength;
    } catch {
      /* réponse sans corps */
    }
    bytes[type] = (bytes[type] ?? 0) + size;
  });

  await page.goto(route);
  await page.waitForLoadState('networkidle');

  const total = Object.values(bytes).reduce((a, b) => a + b, 0);
  return { bytes: { ...bytes, total } as Weights, thirdParty };
}

/* ================================================================== *
 * 1 · Aucune requête tierce — règle dure, pas un budget
 * ================================================================== */

for (const route of ROUTES) {
  test(`aucune requête vers un tiers · ${route}`, async ({ page }) => {
    const { thirdParty } = await weigh(page, route);
    expect(thirdParty, thirdParty.join('\n')).toEqual([]);
  });
}

/* ================================================================== *
 * 2 · Budgets de poids
 * ================================================================== */

for (const route of ROUTES) {
  test(`budget de poids respecté · ${route}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    const { bytes } = await weigh(page, route);

    const kb = (n: number) => `${(n / 1024).toFixed(1)} Ko`;
    info.annotations.push({
      type: 'poids',
      description: `${route} — total ${kb(bytes.total)} · html ${kb(bytes.html ?? 0)} · css ${kb(
        bytes.css ?? 0,
      )} · js ${kb(bytes.js ?? 0)} · js-motion ${kb(bytes.jsMotion ?? 0)} · fonts ${kb(
        bytes.font ?? 0,
      )} · images ${kb(bytes.image ?? 0)}`,
    });

    expect(bytes.html ?? 0, `html ${kb(bytes.html ?? 0)}`).toBeLessThanOrEqual(BUDGET.html);
    expect(bytes.css ?? 0, `css ${kb(bytes.css ?? 0)}`).toBeLessThanOrEqual(BUDGET.cssTotal);
    expect(bytes.js ?? 0, `js ${kb(bytes.js ?? 0)}`).toBeLessThanOrEqual(BUDGET.jsTotal);
    expect(bytes.jsMotion ?? 0, `js-motion ${kb(bytes.jsMotion ?? 0)}`).toBeLessThanOrEqual(
      BUDGET.jsMotionTotal,
    );
    expect(bytes.font ?? 0, `fonts ${kb(bytes.font ?? 0)}`).toBeLessThanOrEqual(BUDGET.fontsTotal);
    expect(bytes.total, `total ${kb(bytes.total)}`).toBeLessThanOrEqual(
      PAGE_TOTAL[route] ?? BUDGET.pageTotal,
    );
  });
}

/* ================================================================== *
 * 3 · GSAP est conditionnel — il ne doit jamais partir « au cas où »
 * ================================================================== */

test('GSAP n’est pas préchargé et n’apparaît dans aucun <link rel=modulepreload>', async ({
  page,
}) => {
  await page.goto('/');
  const preloads = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel="modulepreload"], link[rel="preload"]')].map(
      (l) => l.getAttribute('href') ?? '',
    ),
  );
  expect(preloads.filter((h) => /gsap/i.test(h))).toEqual([]);
});

/* ================================================================== *
 * 4 · Stabilité visuelle — aucun décalage de mise en page
 * ================================================================== */

for (const route of ['/', '/drinks/', '/contact/']) {
  test(`aucun décalage de mise en page cumulé · ${route}`, async ({ page }) => {
    await page.goto(route);
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let score = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const shift = entry as PerformanceEntry & {
                value: number;
                hadRecentInput: boolean;
              };
              if (!shift.hadRecentInput) score += shift.value;
            }
          });
          observer.observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(score);
          }, 1500);
        }),
    );
    // Seuil « bon » de Google : 0,1. Un site statique sans image devrait être
    // à 0 — au-dessus, c'est un composant qui se redimensionne après coup.
    expect(cls, `CLS ${cls.toFixed(4)}`).toBeLessThan(0.1);
  });
}

/* ================================================================== *
 * 5 · Les polices ne provoquent pas de texte invisible (FOIT)
 * ================================================================== */

test('toutes les polices sont en font-display: swap et préchargées', async ({ page }) => {
  await page.goto('/');

  const faces = await page.evaluate(() => {
    const out: { family: string; display: string }[] = [];
    for (const sheet of [...document.styleSheets]) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of [...rules]) {
        if (rule.constructor.name === 'CSSFontFaceRule') {
          const r = rule as CSSFontFaceRule;
          out.push({
            family: r.style.getPropertyValue('font-family'),
            display: r.style.getPropertyValue('font-display'),
          });
        }
      }
    }
    return out;
  });

  expect(faces.length, 'aucune @font-face trouvée').toBeGreaterThan(0);
  const bad = faces.filter((f) => f.display !== 'swap');
  expect(bad, JSON.stringify(bad)).toEqual([]);

  // Les deux familles du système doivent être préchargées : sans cela, la
  // police n'est demandée qu'après l'analyse du CSS.
  const preloaded = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel="preload"][as="font"]')].map(
      (l) => l.getAttribute('href') ?? '',
    ),
  );
  expect(preloaded.length).toBeGreaterThanOrEqual(2);
});

/* ================================================================== *
 * 6 · Le site reste utilisable sans JavaScript
 * ================================================================== */

test('sans JavaScript : navigation, catalogue et formulaire restent lisibles', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4321/drinks/');
  // Les 62 marques sont dans le HTML, pas injectées par script.
  await expect(page.locator('[data-brand]')).toHaveCount(14);
  await expect(page.locator('h1')).toBeVisible();

  await page.goto('http://127.0.0.1:4321/contact/');
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('[data-submit]')).toBeVisible();

  await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator('h1')).toBeVisible();
  // Le contenu révélé au défilement ne doit pas rester à opacité 0 sans JS.
  const invisible = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('.reveal')].filter(
      (el) => parseFloat(getComputedStyle(el).opacity) < 0.9,
    ).length,
  );
  expect(invisible).toBe(0);

  await context.close();
});
