import { expect, test } from '@playwright/test';
import { de } from '../src/i18n/de';
import { en } from '../src/i18n/en';

/**
 * TR-017 — ADAPTATION ALLEMANDE.
 *
 * L'allemand n'est pas une traduction de secours : c'est la langue du marché
 * d'Ivan. Ces contrôles gardent trois choses qu'une relecture humaine ne peut
 * pas surveiller à chaque commit — la parité des clés, l'absence de fuite
 * d'anglais, et la tenue du vocabulaire B2B.
 */

const DE_ROUTES = [
  '/de/',
  '/de/getraenke/',
  '/de/marken/',
  '/de/ueber-uns/',
  '/de/kontakt/',
  '/de/impressum/',
  '/de/datenschutz/',
  '/de/cookies/',
];

/** Aplatit un dictionnaire en paires chemin → valeur. */
function flatten(obj: unknown, prefix = ''): [string, string][] {
  const out: [string, string][] = [];
  if (typeof obj === 'string') return [[prefix, obj]];
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => out.push(...flatten(v, `${prefix}[${i}]`)));
    return out;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      out.push(...flatten(v, prefix ? `${prefix}.${k}` : k));
    }
  }
  return out;
}

/* ================================================================== *
 * 1 · Parité et non-recopie
 * ================================================================== */

test('EN et DE exposent exactement les mêmes clés', () => {
  const enKeys = flatten(en).map(([k]) => k).sort();
  const deKeys = flatten(de).map(([k]) => k).sort();
  expect(deKeys).toEqual(enKeys);
});

/**
 * Certaines valeurs sont légitimement identiques dans les deux langues :
 * noms propres, sigles, adresses, marqueurs typographiques. Tout le reste
 * qui reste identique est de l'anglais non adapté.
 */
const SHARED = new Set([
  'meta.siteName',
  'footer.imprint', // « Impressum » n'a pas d'équivalent anglais usuel
  'legal.imprint.title',
]);

test('aucune valeur anglaise recopiée telle quelle en allemand', () => {
  const enMap = new Map(flatten(en));
  const leaks: string[] = [];

  for (const [key, value] of flatten(de)) {
    if (SHARED.has(key)) continue;
    const source = enMap.get(key);
    if (source === undefined) continue;
    // Une valeur trop courte peut coïncider par accident (« B2B », « DE »).
    if (source.length < 12) continue;
    // Les gabarits ne comptent que par leur texte, pas par leurs jetons.
    const strip = (s: string) => s.replace(/\{[a-z]+\}/gi, '').trim();
    if (strip(source) === strip(value)) leaks.push(`${key} — « ${value.slice(0, 60)} »`);
  }

  expect(leaks, leaks.join('\n')).toEqual([]);
});

test('aucun jeton de gabarit non substitué ne subsiste', () => {
  const unresolved = flatten(de).filter(
    ([key, value]) =>
      /\{[a-z]+\}/i.test(value) &&
      !['{n}', '{total}', '{families}', '{featured}', '{privacy}'].some((t) => value.includes(t)),
  );
  expect(unresolved.map(([k]) => k)).toEqual([]);
});

/* ================================================================== *
 * 2 · Vocabulaire — la règle commerce-free vaut aussi en allemand
 *
 * Le garde-fou anglais ne protégeait rien ici : « Warenkorb » ne contient
 * pas « cart ».
 * ================================================================== */

const BANNED_DE = [
  'warenkorb',
  'einkaufswagen',
  'zur kasse',
  'kasse ',
  'jetzt kaufen',
  'kaufen sie',
  'bestellen sie',
  'zwischensumme',
  'gesamtsumme',
  'auf lager',
  'lagernd',
  'sofort lieferbar',
];

for (const route of DE_ROUTES) {
  test(`aucun vocabulaire de vente ni de disponibilité · ${route}`, async ({ page }) => {
    await page.goto(route);
    const text = (await page.locator('body').innerText()).toLowerCase();
    for (const word of BANNED_DE) expect(text, `${route} · ${word}`).not.toContain(word);
    // Aucun prix, aucun délai promis.
    expect(text).not.toMatch(/[€$£]\s?\d/);
    expect(text).not.toMatch(/innerhalb von \d+\s*(stunden|tagen|werktagen)/);
  });
}

/* ================================================================== *
 * 3 · Registre — vouvoiement professionnel constant
 * ================================================================== */

test('le site vouvoie systématiquement — aucun tutoiement', async ({ page }) => {
  const informal = /\b(du|dich|dein|deine|deinem|deinen|deiner|dir)\b/i;
  const offenders: string[] = [];

  for (const route of DE_ROUTES) {
    await page.goto(route);
    const text = await page.locator('main').innerText();
    const match = text.match(informal);
    if (match) offenders.push(`${route} — « ${match[0]} »`);
  }

  expect(offenders, offenders.join('\n')).toEqual([]);
});

/* ================================================================== *
 * 4 · Terminologie B2B arrêtée
 * ================================================================== */

test('la terminologie B2B validée est effectivement employée', async ({ page }) => {
  // Comparaison insensible à la casse : les labels sont rendus en capitales
  // par `text-transform`, et `innerText` restitue le texte RENDU.
  await page.goto('/de/kontakt/');
  const contact = (await page.locator('body').innerText()).toLowerCase();
  // « Anfrage » et « Angebot », jamais « Bestellung ».
  expect(contact).toContain('anfrage');
  expect(contact).not.toContain('bestellung');

  await page.goto('/de/getraenke/');
  const drinks = (await page.locator('body').innerText()).toLowerCase();
  expect(drinks).toContain('anfrage');
  expect(drinks).not.toContain('bestellung');
});

/* ================================================================== *
 * 5 · Slugs traduits — aucune route allemande en anglais
 * ================================================================== */

test('chaque route allemande porte un slug allemand', async ({ page }) => {
  const ENGLISH_SLUGS = ['drinks', 'brands', 'about', 'contact', 'imprint', 'privacy'];
  for (const route of DE_ROUTES) {
    for (const slug of ENGLISH_SLUGS) {
      expect(route, `${route} contient le slug anglais « ${slug} »`).not.toContain(`/${slug}/`);
    }
  }

  // Et les liens internes des pages allemandes restent dans l'espace allemand.
  for (const route of DE_ROUTES) {
    await page.goto(route);
    const strays = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>('main a[href^="/"], footer a[href^="/"]')]
        .map((a) => a.getAttribute('href') ?? '')
        .filter((h) => !h.startsWith('/de/') && h !== '/' && !h.startsWith('/#')),
    );
    // Seul le sélecteur de langue peut pointer vers l'anglais, et il est dans
    // le header.
    expect(strays, `${route} → ${strays.join(', ')}`).toEqual([]);
  }
});

/* ================================================================== *
 * 6 · Typographie allemande
 * ================================================================== */

test('l’allemand n’emploie pas de guillemets anglais', async ({ page }) => {
  const offenders: string[] = [];
  for (const route of DE_ROUTES) {
    await page.goto(route);
    const text = await page.locator('main').innerText();
    if (/[“”]/.test(text)) offenders.push(route);
  }
  expect(offenders).toEqual([]);
});
