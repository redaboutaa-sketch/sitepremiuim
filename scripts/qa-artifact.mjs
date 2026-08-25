/**
 * GATE 3 — AUDIT DE L'ARTEFACT DE PRODUCTION.
 *
 * Ce script n'ouvre AUCUN fichier source. Il n'inspecte que `dist/`, c'est-à-
 * dire exactement ce qui sera téléversé chez Hostinger. La distinction est le
 * point de tout l'exercice : un code source correct qui produit un artefact
 * incorrect reste un site incorrect, et seule cette lecture-là peut le voir.
 *
 * Exécution : node scripts/qa-artifact.mjs
 * Sortie    : rapport lisible + code 1 si un contrôle BLOQUANT échoue.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

import {
  emittedBasename,
  isBrandVisual,
  isGeneratedPackshot,
  isImageFile,
} from '../asset-governance.mjs';
import { CONTACT_EMAIL, SITE_HOST, SITE_ORIGIN, STAGING_HOST } from '../site.config.mjs';

/**
 * Les six marques de la scène d'accueil, dans l'ordre du catalogue.
 * Doit rester alignée sur `HERO_BRANDS` (src/data/assets.ts) — `tests/assets.spec.ts`
 * vérifie la correspondance, elle n'est pas supposée ici.
 */
const HERO_SLUGS = ['coca-cola', 'fanta', 'red-bull', 'monster-energy', 'pepsi', 'sprite'];

/**
 * S4 Discovery a été SUPPRIMÉE le 2026-08-24 avec la réduction du catalogue à
 * 14 articles : sept de ses huit spécimens ont quitté le catalogue. La liste
 * reste ici, vide, en miroir de `DISCOVERY_BRANDS` (src/data/assets.ts) —
 * `tests/assets.spec.ts` vérifie la correspondance.
 */
const DISCOVERY_SLUGS = [];

/**
 * Les quatorze articles de la piste Featured, dans l'ordre d'exposition de
 * `FeaturedBrands.astro`. Depuis la réduction, Featured expose le catalogue
 * entier.
 */
const FEATURED_SLUGS = [
  'coca-cola', 'red-bull', 'fanta', 'capri-sun', 'pepsi', 'monster-energy',
  'orangina', 'lipton-ice-tea', 'sprite', 'mirinda', 'dr-pepper',
  'mountain-dew', 'schweppes', '7up',
];

/**
 * Les articles sans photo produit. VIDE depuis TR-029 (2026-08-25) : les
 * packshots Mirinda et Lipton Ice Tea ont été livrés et intégrés, et les
 * quatorze cellules de la piste portent désormais un visuel produit.
 *
 * La liste reste déclarée : la piste est le seul endroit du site où un trou
 * se voit immédiatement, et c'est ici qu'on veut le nommer s'il revient.
 */
const FEATURED_WITHOUT_PACKSHOT = [];

const DIST = resolve(process.cwd(), 'dist');
const SITE = SITE_ORIGIN;

/**
 * Ancien domaine, conservé comme motif de recherche.
 *
 * Il ne doit plus apparaître nulle part dans l'artefact SAUF dans les
 * adresses e-mail : le domaine de messagerie du client est bien
 * `ivan-arsenov.de`, avec tiret, et diffère volontairement de celui du site.
 * Un contrôle qui interdirait le motif partout effacerait l'adresse de
 * contact — c'est-à-dire les demandes d'offre.
 */
const LEGACY_HOST = 'ivan-arsenov.de';

/** Cible auditée. `staging` inverse les attentes d'indexabilité. */
const TARGET = process.env.DEPLOY_TARGET === 'staging' ? 'staging' : 'production';

const ROUTES = [
  ['home', 'index.html', 'en', '/'],
  ['drinks', 'drinks/index.html', 'en', '/drinks/'],
  ['brands', 'brands/index.html', 'en', '/brands/'],
  ['about', 'about/index.html', 'en', '/about/'],
  ['contact', 'contact/index.html', 'en', '/contact/'],
  ['imprint', 'imprint/index.html', 'en', '/imprint/'],
  ['privacy', 'privacy/index.html', 'en', '/privacy/'],
  ['cookies', 'cookies/index.html', 'en', '/cookies/'],
  ['de-home', 'de/index.html', 'de', '/de/'],
  ['de-drinks', 'de/getraenke/index.html', 'de', '/de/getraenke/'],
  ['de-brands', 'de/marken/index.html', 'de', '/de/marken/'],
  ['de-about', 'de/ueber-uns/index.html', 'de', '/de/ueber-uns/'],
  ['de-contact', 'de/kontakt/index.html', 'de', '/de/kontakt/'],
  ['de-imprint', 'de/impressum/index.html', 'de', '/de/impressum/'],
  ['de-privacy', 'de/datenschutz/index.html', 'de', '/de/datenschutz/'],
  ['de-cookies', 'de/cookies/index.html', 'de', '/de/cookies/'],
];

/* ------------------------------------------------------------------ *
 * Journal
 * ------------------------------------------------------------------ */

const results = [];
let blocking = 0;

/** @param {'BLOCK'|'WARN'} severity */
function check(severity, label, ok, detail = '') {
  results.push({ severity, label, ok, detail });
  if (!ok && severity === 'BLOCK') blocking++;
}

const section = (title) => results.push({ section: title });

/* ------------------------------------------------------------------ *
 * Lecture de l'artefact
 * ------------------------------------------------------------------ */

async function exists(path) {
  try {
    await stat(join(DIST, path));
    return true;
  } catch {
    return false;
  }
}

async function walk(dir = DIST) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(relative(DIST, full));
  }
  return out;
}

const html = new Map();
for (const [, file] of ROUTES) {
  if (await exists(file)) html.set(file, await readFile(join(DIST, file), 'utf8'));
}

const files = await walk();

/* ================================================================== *
 * 1 · Complétude
 * ================================================================== */

section('1 · Complétude de l’artefact');

for (const [name, file] of ROUTES) {
  check('BLOCK', `page présente · ${name}`, html.has(file), file);
}

/*
 * Astro traite la 404 à part : malgré `format: 'directory'`, elle sort en
 * `404.html` à la racine. On vérifie donc le nom RÉEL du fichier produit, et
 * que `.htaccess` pointe bien dessus — c'est précisément le genre d'écart
 * entre intention et artefact que cet audit existe pour attraper.
 */
check('BLOCK', '404 générée (404.html à la racine)', await exists('404.html'));
check('BLOCK', 'robots.txt', await exists('robots.txt'));
check('BLOCK', 'sitemap-index.xml', await exists('sitemap-index.xml'));
check('BLOCK', '.htaccess embarqué', await exists('.htaccess'));

/*
 * Le styleguide n'est pas retiré après coup : il est injecté par un plugin
 * conditionné à `dev` ou `STYLEGUIDE=1`, donc structurellement absent d'un
 * build de production. On le vérifie sur l'artefact, pas sur l'intention.
 */
check(
  'BLOCK',
  'page /styleguide/ ABSENTE du build',
  !files.some((f) => f.includes('styleguide')),
  files.filter((f) => f.includes('styleguide')).join(', '),
);

/* ================================================================== *
 * 2 · Canonicalisation et hreflang
 * ================================================================== */

section('2 · Canonicalisation et hreflang');

const PAIR = {
  '/': '/de/',
  '/drinks/': '/de/getraenke/',
  '/brands/': '/de/marken/',
  '/about/': '/de/ueber-uns/',
  '/contact/': '/de/kontakt/',
  '/imprint/': '/de/impressum/',
  '/privacy/': '/de/datenschutz/',
  '/cookies/': '/de/cookies/',
};
const EN_OF = Object.fromEntries(Object.entries(PAIR).map(([en, de]) => [de, en]));

for (const [name, file, locale, path] of ROUTES) {
  const doc = html.get(file);
  if (!doc) continue;

  const canonical = doc.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
  // Règle SPEC CHECK Δ1 : la canonical est TOUJOURS auto-référente. Une page
  // allemande qui canonicalise vers l'anglais se retire elle-même de l'index
  // allemand — l'inverse exact du but recherché.
  check('BLOCK', `canonical auto-référente · ${name}`, canonical === `${SITE}${path}`, canonical);

  check('BLOCK', `lang="${locale}" · ${name}`, new RegExp(`<html[^>]+lang="${locale}"`).test(doc));

  const alts = [...doc.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(
    (m) => [m[1], m[2]],
  );
  const map = Object.fromEntries(alts);
  const enPath = locale === 'en' ? path : EN_OF[path];
  const dePath = locale === 'en' ? PAIR[path] : path;

  check('BLOCK', `hreflang en · ${name}`, map.en === `${SITE}${enPath}`, map.en);
  check('BLOCK', `hreflang de · ${name}`, map.de === `${SITE}${dePath}`, map.de);
  check('BLOCK', `x-default → EN · ${name}`, map['x-default'] === `${SITE}${enPath}`, map['x-default']);
}

/* ================================================================== *
 * 3 · Véracité — aucune affirmation non vérifiable
 * ================================================================== */

section('3 · Véracité du contenu publié');

/**
 * Ces motifs sont cherchés dans le HTML LIVRÉ, pas dans les sources : c'est
 * la seule lecture qui prouve qu'aucune affirmation inventée n'a été
 * introduite en cours de route, par un composant ou par une traduction.
 */
const FORBIDDEN = [
  [/\bin stock\b/i, 'disponibilité affirmée (EN)'],
  [/\bauf lager\b/i, 'disponibilité affirmée (DE)'],
  [/\bsofort lieferbar\b/i, 'disponibilité affirmée (DE)'],
  [/\bISO ?\d{4}/i, 'certification non établie'],
  [/\bIFS\b|\bBRC\b|\bHACCP\b/, 'certification non établie'],
  [/\b\d+\s*(years?|Jahre)\s+(of\s+)?(experience|Erfahrung)/i, 'ancienneté chiffrée'],
  [/\b\d+\+?\s*(satisfied\s+)?(clients?|customers?|Kunden)\b/i, 'nombre de clients'],
  [/\bwithin\s+\d+\s*(hours?|days?)/i, 'délai promis (EN)'],
  [/\binnerhalb von\s+\d+\s*(Stunden|Tagen)/i, 'délai promis (DE)'],
  [/\b(24|48)\s?h\b/i, 'délai promis'],
  [/\bfree\s+(shipping|delivery)\b/i, 'condition commerciale inventée'],
  [/\bmarket\s+leader\b|\bMarktführer\b/i, 'position de marché non établie'],
  [/\bcertified\b|\bzertifiziert\b/i, 'certification non établie'],
  [/[€$£]\s?\d/, 'prix affiché'],
  [/\bcart\b|\bWarenkorb\b|\bcheckout\b|\bzur Kasse\b/i, 'vocabulaire e-commerce'],
];

for (const [name, file] of ROUTES) {
  const doc = html.get(file);
  if (!doc) continue;
  // On ne teste que le texte rendu, pas les attributs ni le JSON-LD.
  const text = doc
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ');

  for (const [pattern, why] of FORBIDDEN) {
    const hit = text.match(pattern);
    check('BLOCK', `${why} absent · ${name}`, hit === null, hit ? `« ${hit[0]} »` : '');
  }
}

/* ================================================================== *
 * 3bis · Migration de domaine — aucune URL périmée survivante
 * ================================================================== */

section('3bis · Migration de domaine');

/**
 * On cherche l'ancien hôte dans TOUT l'artefact, fichier par fichier, y
 * compris le XML, le texte et la configuration Apache — pas seulement le
 * HTML. Chaque occurrence doit être une adresse e-mail, et rien d'autre.
 */
const TEXTUAL = /\.(html|xml|txt|json|js|css|svg)$/i;

for (const file of [...files, '.htaccess'].filter((f) => TEXTUAL.test(f) || f === '.htaccess')) {
  let content;
  try {
    content = await readFile(join(DIST, file), 'utf8');
  } catch {
    continue;
  }
  if (!content.includes(LEGACY_HOST)) continue;

  /*
   * Chaque occurrence est isolée avec les 24 caractères qui la précèdent.
   * Une occurrence légitime est immédiatement précédée d'un « @ » (adresse
   * e-mail) ; tout le reste est une URL restée sur l'ancien domaine.
   */
  const bad = [...content.matchAll(new RegExp(`.{0,24}${LEGACY_HOST.replace('.', '\\.')}`, 'g'))]
    .map((m) => m[0])
    .filter((occurrence) => !/@[\w.-]*$/.test(occurrence.slice(0, -LEGACY_HOST.length)));

  check(
    'BLOCK',
    `aucune URL sur l'ancien domaine · ${file}`,
    bad.length === 0,
    bad.map((b) => `« …${b} »`).join(' · '),
  );
}

/** L'hôte canonique doit apparaître, sinon la migration n'a rien produit. */
const home = html.get('index.html') ?? '';
check('BLOCK', 'le nouvel hôte est bien présent dans le HTML', home.includes(SITE_HOST), SITE_HOST);

/**
 * DOMAINE WEB ≠ DOMAINE E-MAIL — vérifié dans les deux sens.
 * L'adresse de contact doit être PRÉSENTE et INCHANGÉE ; l'adresse dérivée
 * du nouveau domaine ne doit exister nulle part, car personne ne l'a
 * confirmée.
 */
const derivedEmail = `info@${SITE_HOST.replace(/^www\./, '')}`;
for (const [name, file] of ROUTES) {
  const doc = html.get(file);
  if (!doc) continue;
  check(
    'BLOCK',
    `adresse e-mail client préservée · ${name}`,
    doc.includes(CONTACT_EMAIL),
    CONTACT_EMAIL,
  );
  check(
    'BLOCK',
    `aucune adresse e-mail déduite du domaine web · ${name}`,
    !doc.includes(derivedEmail),
    derivedEmail,
  );
}

/* ================================================================== *
 * 3ter · Indexabilité conforme à la cible du build
 *
 * Un staging indexé fait concurrence au site réel sur ses propres mots-clés,
 * et il est trop tard quand on s'en aperçoit. L'exclusion est donc posée
 * trois fois — balise, en-tête HTTP, robots.txt — et vérifiée trois fois.
 * ================================================================== */

section(`3ter · Indexabilité (cible : ${TARGET})`);

const expectRobots = TARGET === 'staging' ? 'noindex, nofollow' : 'index, follow';

for (const [name, file] of ROUTES) {
  const doc = html.get(file);
  if (!doc) continue;
  const robots = doc.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '';
  check('BLOCK', `meta robots « ${expectRobots} » · ${name}`, robots === expectRobots, robots);
}

if (await exists('robots.txt')) {
  const txt = await readFile(join(DIST, 'robots.txt'), 'utf8');
  if (TARGET === 'staging') {
    check('BLOCK', 'robots.txt interdit tout le site', /Disallow:\s*\/\s*$/m.test(txt));
    check('BLOCK', 'aucun sitemap annoncé en préproduction', !txt.includes('Sitemap:'));
  } else {
    check('BLOCK', 'robots.txt autorise l’exploration', /Allow:\s*\//.test(txt));
    check('BLOCK', 'robots.txt annonce le sitemap', txt.includes(`${SITE_ORIGIN}/sitemap-index.xml`));
  }
}

if (await exists('.htaccess')) {
  const conf = await readFile(join(DIST, '.htaccess'), 'utf8');
  const hasHeader = /X-Robots-Tag "noindex, nofollow"/.test(conf);
  check(
    'BLOCK',
    TARGET === 'staging'
      ? 'en-tête X-Robots-Tag noindex présent'
      : 'aucun X-Robots-Tag noindex global en production',
    TARGET === 'staging' ? hasHeader : !hasHeader,
  );
}

/* ================================================================== *
 * 4 · Données structurées
 * ================================================================== */

section('4 · Données structurées');

for (const [name, file] of ROUTES) {
  const doc = html.get(file);
  if (!doc) continue;
  const raw = doc.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  check('BLOCK', `JSON-LD présent · ${name}`, Boolean(raw));
  if (!raw) continue;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    check('BLOCK', `JSON-LD valide · ${name}`, false, String(error));
    continue;
  }
  check('BLOCK', `JSON-LD valide · ${name}`, true);

  const flat = JSON.stringify(parsed);
  // Balisage inventé = fausse déclaration. Rien de tout cela n'est établi.
  for (const key of ['aggregateRating', 'review', 'priceRange', 'openingHours', 'offers']) {
    check('BLOCK', `aucun ${key} inventé · ${name}`, !flat.includes(key));
  }
}

/* ================================================================== *
 * 5 · Assets — aucun visuel non autorisé publié
 * ================================================================== */

section('5 · Assets');

const images = files.filter((f) => /\.(png|jpe?g|webp|avif|gif)$/i.test(f));

/*
 * L'attente dépend de la cible, et c'est tout l'intérêt d'avoir deux artefacts.
 *
 *  · PRODUCTION — aucun visuel de marque, sans exception : aucun asset n'est
 *    `validated`, donc rien ne doit être ni affiché NI même déposé. Un fichier
 *    présent mais non affiché reste publiquement téléchargeable.
 *  · PRÉPRODUCTION — les assets `requires_validation` sont précisément ce
 *    qu'on vient y regarder. Ils sont donc attendus, mais uniquement sous la
 *    forme autorisée par la décision DA : des LOGOS, jamais des packshots.
 */
/*
 * L'IDENTITÉ DU CLIENT N'EST PAS UNE MARQUE TIERCE.
 *
 * Le logo Ivan Arsenov est fourni par le client pour son propre site : aucun
 * titulaire extérieur n'a de droit à confirmer, il est donc `validated` et
 * DOIT être publié en production. Les 60 logos du catalogue appartiennent à
 * des tiers, ne sont pas validés, et ne doivent jamais l'être.
 *
 * Confondre les deux ferait échouer le build sur la présence de l'identité
 * légitime — ou, pire, laisserait passer une marque tierce en la prenant pour
 * de l'identité.
 */
const brandImages = images.filter(isBrandVisual);

check(
  'BLOCK',
  'identité officielle publiée dans les deux cibles',
  images.some((f) => /(^|\/)(lockup|monogram)-/.test(f)),
  'le logo du client doit être présent en production comme en préproduction',
);

/*
 * Occurrences d'objets produit dans TOUT le HTML, lues depuis les `data-*`
 * posés par ProductObject. On ne devine pas le contenu d'un emplacement à
 * partir d'un nom de fichier haché : l'artefact le déclare lui-même.
 */
const OBJECT = /data-object="([a-z0-9-]+)" data-usage="([a-z-]+)" data-asset="([a-z-]+)"/g;
const objects = [];
for (const [name, file] of ROUTES) {
  const doc = html.get(file);
  if (!doc) continue;
  for (const m of doc.matchAll(OBJECT)) {
    objects.push({ page: name, brand: m[1], usage: m[2], asset: m[3] });
  }
}

const heroRendered = objects.filter((o) => o.usage === 'hero' && o.asset === 'hero');
const generatedFiles = images.filter(isGeneratedPackshot);

if (TARGET === 'staging') {
  /*
   * PRÉPRODUCTION — les six packshots GÉNÉRÉS sont précisément ce qu'on vient
   * y regarder (TR-024B). On vérifie qu'il y a exactement ceux-là, sur les
   * bonnes marques : un septième produit, ou un slug inattendu, signalerait
   * qu'un fichier a été rangé sous la mauvaise marque.
   */
  const heroSlugs = [...new Set(heroRendered.map((o) => o.brand))].sort();
  check(
    'BLOCK',
    'préproduction : les six packshots hero sont rendus, sur les bonnes marques',
    heroSlugs.length === 6 && heroSlugs.join(',') === [...HERO_SLUGS].sort().join(','),
    `attendu ${[...HERO_SLUGS].sort().join(', ')} — obtenu ${heroSlugs.join(', ') || 'aucun'}`,
  );

  const stage = objects.filter((o) => o.page === 'home' && o.usage === 'hero');
  check(
    'BLOCK',
    'préproduction : la scène d’accueil compte six emplacements + le CTA final',
    stage.length === 7 && stage.every((o) => o.asset === 'hero'),
    `${stage.length} emplacements « hero » sur la page d’accueil`,
  );

  const home = html.get('index.html') ?? '';

  /*
   * S4 Discovery a été retirée de la page d'accueil le 2026-08-24. Le contrôle
   * est conservé et INVERSÉ : il vérifie désormais que la section ne
   * réapparaît pas. Supprimer le contrôle avec la section aurait laissé son
   * retour accidentel passer inaperçu.
   */
  check(
    'BLOCK',
    'S4 Discovery est absente de la page d’accueil',
    !home.includes('data-discovery'),
  );

  /*
   * La piste Featured. Quatorze articles — le catalogue entier depuis la
   * réduction du 2026-08-24.
   *
   * Découpe sur la PISTE, pas sur la page : le CTA final rend lui aussi des
   * objets produit. Compter sur toute la page ferait échouer un contrôle qui,
   * lui, serait juste.
   */
  const trackStart = home.indexOf('data-track');
  const trackHtml =
    trackStart >= 0 ? home.slice(trackStart, home.indexOf('</section>', trackStart)) : '';
  const featured = [...trackHtml.matchAll(OBJECT)].map((m) => ({
    brand: m[1],
    usage: m[2],
    asset: m[3],
  }));
  /*
   * On découpe la piste PAR CELLULE, et non sur les attributs d'audit.
   *
   * `ProductObject` n'émet `data-object` que sur le hero et sur les assets
   * générés (le coût en octets sur toutes les cellules avait fait sauter le
   * budget HTML de /drinks/). Compter les `data-object` ne voyait donc que les
   * douze cellules à photo générée, et déclarait « 12 objets » sur une piste
   * qui en rend bien quatorze. Le marqueur de cellule, lui, est toujours là.
   */
  const cells = trackHtml
    .split('<li class="featured__item"')
    .slice(1)
    .map((chunk) => ({
      brand: /featured__link" href="[^"]*brand=([a-z0-9-]+)"/.exec(chunk)?.[1] ?? '?',
      fallback: chunk.includes('product-object__fallback'),
      logo: chunk.includes('product-object__img--logo'),
    }));

  check(
    'BLOCK',
    'préproduction : la piste Featured rend les quatorze articles, dans l’ordre',
    cells.map((c) => c.brand).join(',') === FEATURED_SLUGS.join(','),
    `${cells.length} cellules — ${cells.map((c) => c.brand).join(', ') || 'aucune'}`,
  );

  /*
   * Douze des quatorze portent une photo produit. Les deux autres sont
   * NOMMÉMENT connus : la liste est fermée, donc un troisième trou est une
   * régression, pas une tolérance.
   */
  const noPhoto = cells.filter((c) => c.fallback || c.logo).map((c) => c.brand).sort();
  check(
    'BLOCK',
    'préproduction : les quatorze Featured sont servis par une photo produit',
    cells.length - noPhoto.length === 14,
    `${cells.length - noPhoto.length} photos produit sur ${cells.length} cellules`,
  );
  check(
    'BLOCK',
    'préproduction : aucun article sans photo produit dans la piste',
    noPhoto.join(',') === [...FEATURED_WITHOUT_PACKSHOT].sort().join(','),
    `sans photo : ${noPhoto.join(', ') || 'aucun'}`,
  );
  /*
   * AUCUN LOGO dans la piste — décision DA du 2026-08-16, rétablie sans
   * exception par TR-029. La dérogation d'un seul logo (Mirinda) est tombée
   * avec son motif : la marque a désormais un packshot.
   */
  check(
    'BLOCK',
    'préproduction : aucun logo de marque dans la piste Featured',
    cells.every((c) => !c.logo),
    `logos : ${cells.filter((c) => c.logo).map((c) => c.brand).join(', ') || 'aucun'}`,
  );
  const reused = featured.filter((o) => o.asset === 'hero').map((o) => o.brand).sort();
  check(
    'BLOCK',
    'préproduction : les six marques du hero réemploient leur master',
    reused.join(',') === [...HERO_SLUGS].sort().join(','),
    `réemployés : ${reused.join(', ') || 'aucun'}`,
  );

  const otherBrandFiles = brandImages.filter(
    (f) => !isGeneratedPackshot(f) && emittedBasename(f) !== 'logo',
  );
  check(
    'BLOCK',
    'préproduction : hors packshots hero, seuls des logos sont publiés',
    otherBrandFiles.length === 0,
    otherBrandFiles.join(', '),
  );

  check(
    'WARN',
    `préproduction : ${generatedFiles.length} dérivés de packshots GÉNÉRÉS déposés`,
    true,
    'assets fabriqués — ne ferment pas le blocage B2',
  );
  check('WARN', `préproduction : ${brandImages.length} visuels de marque déposés`, true);
} else {
  /*
   * PRODUCTION — séparation stricte (TR-024B §3). Les quatre conditions sont
   * contrôlées séparément parce qu'elles échouent séparément : un fichier peut
   * être déposé sans être rendu, et rendu sans être déposé (référence morte).
   */
  check(
    'BLOCK',
    'production : aucun visuel de marque publié (aucun n’est validé)',
    brandImages.length === 0,
    brandImages.slice(0, 6).join(', ') +
      (brandImages.length > 6 ? ` … +${brandImages.length - 6}` : ''),
  );

  check(
    'BLOCK',
    'production : aucun packshot GÉNÉRÉ déposé dans l’artefact',
    generatedFiles.length === 0,
    generatedFiles.join(', '),
  );

  check(
    'BLOCK',
    'production : aucun packshot GÉNÉRÉ rendu dans une page',
    heroRendered.length === 0,
    heroRendered.map((o) => `${o.page}:${o.brand}`).join(', '),
  );

  /*
   * TR-025 — même exigence pour les dix packshots Featured. Contrôlée à part
   * de l'exigence hero : un usage peut fuir sans l'autre.
   */
  const packshotRendered = objects.filter(
    (o) => o.usage === 'packshot' && (o.asset === 'packshot' || o.asset === 'hero'),
  );
  check(
    'BLOCK',
    'production : aucun packshot Featured ni S4 rendu dans une page',
    packshotRendered.length === 0,
    packshotRendered.map((o) => `${o.page}:${o.brand}`).join(', '),
  );

  /*
   * Contrôle par SLUG, en plus du contrôle par usage : un jour où un
   * emplacement oublierait ses attributs d'audit, le compte par usage
   * tomberait à zéro et passerait — celui-ci, non.
   */
  const leaked = [...DISCOVERY_SLUGS, ...HERO_SLUGS].filter((slug) =>
    [...html.values()].some((doc) => doc.includes(`data-object="${slug}" data-usage="packshot"`)),
  );
  check(
    'BLOCK',
    'production : aucune marque S4 ou hero ne rend de packshot',
    leaked.length === 0,
    leaked.join(', '),
  );

  check(
    'BLOCK',
    'production : aucun attribut data-generated dans le HTML',
    ![...html.values()].some((doc) => doc.includes('data-generated')),
  );

  /*
   * Référence morte : un `src` ou un `srcset` pointant vers un fichier retiré
   * du build produirait une image cassée. Le contrôle vaut aussi bien pour ce
   * que le nettoyage a supprimé que pour ce qu'il aurait dû supprimer.
   */
  const emitted = new Set(files.filter(isImageFile).map((f) => f.split('/').pop()));
  const missing = new Set();
  for (const doc of html.values()) {
    for (const m of doc.matchAll(/\/_astro\/([\w.-]+\.(?:png|jpe?g|webp|avif|gif))/g)) {
      if (!emitted.has(m[1])) missing.add(m[1]);
    }
  }
  check(
    'BLOCK',
    'production : aucune référence d’image vers un fichier absent',
    missing.size === 0,
    [...missing].join(', '),
  );

  /*
   * Les six emplacements de la scène doivent conserver leur repli
   * typographique : la production ne montre pas moins que prévu, elle montre
   * autre chose. Un emplacement vide serait une régression silencieuse.
   */
  const fallbacks = objects.filter(
    (o) => o.page === 'home' && o.usage === 'hero' && o.asset === 'fallback',
  );
  check(
    'BLOCK',
    'production : les emplacements hero gardent leur repli typographique',
    fallbacks.length === 7,
    `${fallbacks.length} replis (6 scène + 1 CTA final attendus)`,
  );
}

const svgs = files.filter((f) => f.endsWith('.svg'));
check('WARN', 'SVG embarqués', true, svgs.join(', ') || 'aucun');

for (const [name, file] of ROUTES) {
  const doc = html.get(file);
  if (!doc) continue;
  const remote = [...doc.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => !u.startsWith(SITE));
  check('BLOCK', `aucune ressource distante · ${name}`, remote.length === 0, remote.join(', '));
}

/* ================================================================== *
 * 6 · Sitemap
 * ================================================================== */

section('6 · Sitemap');

const sitemapFile = files.find((f) => /^sitemap-\d+\.xml$/.test(f));
check('BLOCK', 'fichier sitemap-N.xml', Boolean(sitemapFile), sitemapFile ?? '');

if (sitemapFile) {
  const xml = await readFile(join(DIST, sitemapFile), 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const links = (xml.match(/<xhtml:link/g) ?? []).length;

  check('BLOCK', '16 URLs au sitemap', urls.length === 16, String(urls.length));
  // 16 routes × 3 déclarations (en, de, x-default).
  check('BLOCK', '48 alternates xhtml', links === 48, String(links));
  check('BLOCK', 'styleguide hors sitemap', !urls.some((u) => u.includes('styleguide')));
  check('BLOCK', '404 hors sitemap', !urls.some((u) => u.includes('/404')));
}

/* ================================================================== *
 * 7 · Configuration serveur livrée
 * ================================================================== */

section('7 · Configuration serveur');

if (await exists('.htaccess')) {
  const conf = await readFile(join(DIST, '.htaccess'), 'utf8');

  check('BLOCK', 'aucun placeholder non substitué', !conf.includes('{{'));

  /*
   * LE contrôle que ce refactor existe pour rendre possible : l'hôte vers
   * lequel Apache redirige DOIT être celui vers lequel pointent les
   * canonicals. Deux fichiers portant chacun leur copie du domaine pouvaient
   * diverger en silence — et un site qui redirige ailleurs que sa canonical
   * se dédouble dans l'index.
   */
  const redirectHost = conf.match(/RewriteRule \^\(\.\*\)\$ https:\/\/([^/]+)\//)?.[1] ?? '';
  const expectedHost = TARGET === 'staging' ? STAGING_HOST : SITE_HOST;
  check('BLOCK', 'redirection HTTPS déclarée', redirectHost !== '');
  check(
    'BLOCK',
    'hôte de redirection identique à l’hôte attendu',
    redirectHost === expectedHost,
    `redirect → ${redirectHost} · attendu → ${expectedHost}`,
  );
  const errorDoc = conf.match(/ErrorDocument 404\s+(\S+)/)?.[1] ?? '';
  check('BLOCK', 'ErrorDocument 404 déclaré', errorDoc !== '');
  // Le chemin déclaré doit exister DANS l'artefact, pas seulement être écrit.
  check(
    'BLOCK',
    'ErrorDocument 404 pointe sur un fichier réellement produit',
    errorDoc !== '' && (await exists(errorDoc.replace(/^\//, ''))),
    errorDoc,
  );
  check('BLOCK', 'Content-Security-Policy', /Content-Security-Policy/.test(conf));
  check('BLOCK', 'form-action verrouillé', /form-action 'self'/.test(conf));
  check('BLOCK', 'config.local.php non servie', /<Files "config\.local\.php">/.test(conf));
  check('WARN', 'compression déclarée', /mod_deflate/.test(conf));
  check('WARN', 'cache long sur assets empreintés', /immutable/.test(conf));
}

/* ================================================================== *
 * 8 · Transport du formulaire
 * ================================================================== */

section('8 · Transport du formulaire');

const contact = html.get('contact/index.html') ?? '';
check('BLOCK', 'formulaire pointe sur /api/enquiry.php', contact.includes('action="/api/enquiry.php"'));
check('BLOCK', 'endpoint PHP NON déployé dans dist/', !files.some((f) => f.endsWith('.php')));
check(
  'BLOCK',
  'aucune promesse d’envoi dans le HTML livré',
  !/your enquiry has been sent|wurde gesendet/i.test(contact),
);

/* ------------------------------------------------------------------ *
 * Rapport
 * ------------------------------------------------------------------ */

console.log('\nAUDIT DE L’ARTEFACT — dist/\n');

let passed = 0;
let warned = 0;

for (const row of results) {
  if (row.section) {
    console.log(`\n  ${row.section}`);
    continue;
  }
  if (row.ok) {
    passed++;
    continue;
  }
  if (row.severity === 'WARN') warned++;
  const mark = row.severity === 'BLOCK' ? '✗ BLOQUANT' : '! ';
  console.log(`    ${mark} ${row.label}${row.detail ? ` — ${row.detail}` : ''}`);
}

const total = results.filter((r) => !r.section).length;
console.log(`\n  ${passed}/${total} contrôles passés · ${blocking} bloquant(s) · ${warned} avertissement(s)`);
console.log(`  ${files.length} fichiers dans dist/\n`);

process.exit(blocking > 0 ? 1 : 0);
