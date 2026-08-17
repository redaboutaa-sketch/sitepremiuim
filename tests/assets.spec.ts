import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';

import {
  BRAND_ASSET_BASENAMES,
  GENERATED_PACKSHOT_BASENAMES,
  IDENTITY_BASENAMES,
} from '../asset-governance.mjs';
import { DISCOVERY_BRANDS, HERO_BRANDS } from '../src/data/assets';
import { catalog } from '../src/lib/catalog';
import {
  productionEligible,
  registry,
  report,
  resolve as resolveAsset,
  stagingRenderable,
  type AssetRecord,
} from '../src/lib/assets';

/**
 * Registre d'assets — intégrité, éligibilité et détection de remplacement.
 */

const ROOT = resolve(process.cwd());
const sha256 = (buf: Buffer) => createHash('sha256').update(buf).digest('hex');

/* ================================================================== *
 * Intégrité du registre
 * ================================================================== */

test('le registre couvre chaque marque et distingue les six assets du hero', () => {
  const all = registry();
  const logos = all.filter((a) => a.usage === 'logo');
  const heroes = all.filter((a) => a.usage === 'hero');
  const packshots = all.filter((a) => a.usage === 'packshot');

  expect(logos, 'un logo attendu par marque').toHaveLength(catalog.length);
  expect(heroes, 'six assets de hero').toHaveLength(6);

  /*
   * Un packshot est attendu partout où une SURFACE en réclame un : la piste
   * Featured et la séquence S4 Discovery. Le contrat est vérifié par la liste
   * des marques, pas par un compte figé — un nombre en dur ne dit pas
   * LESQUELLES doivent être couvertes, et c'est exactement ce qui avait laissé
   * six produits de S4 hors du registre jusqu'à TR-026.
   */
  const expectedPackshots = [
    ...new Set([
      ...catalog.filter((b) => b.featured).map((b) => b.slug),
      ...DISCOVERY_BRANDS,
    ]),
  ].sort();
  expect(packshots.map((a) => a.brandSlug).sort()).toEqual(expectedPackshots);

  expect(heroes.map((a) => a.brandSlug).sort()).toEqual([...HERO_BRANDS].sort());
  for (const h of heroes) {
    expect(h.priority, `${h.brandLabel} doit être prioritaire`).toBe('hero');
  }

  // Le rang `hero` est réservé aux SIX packshots de la scène d'accueil.
  // Le logo d'une marque du hero reste un asset `featured` : sans cette
  // règle, la distinction demandée se diluerait dans 18 entrées.
  const heroPriority = all.filter((a) => a.priority === 'hero');
  expect(heroPriority, 'exactement six assets au rang hero').toHaveLength(6);
  expect(heroPriority.every((a) => a.usage === 'hero')).toBe(true);
});

test('chaque entrée porte les champs exigés par le registre', () => {
  for (const a of registry()) {
    expect(a.id, 'identifiant').toBe(`${a.brandSlug}:${a.usage}`);
    expect(a.brandLabel, `${a.id} · marque`).toBeTruthy();
    expect(a.usage, `${a.id} · usage`).toBeTruthy();
    expect(a.priority, `${a.id} · priorité`).toBeTruthy();
    expect(['validated', 'requires_validation', 'missing']).toContain(a.status);
    expect(a.authorization, `${a.id} · autorisation`).toBeTruthy();
    expect(['unknown', 'referential-use', 'granted', 'denied']).toContain(
      a.authorization.status,
    );
    // Les champs de mesure existent toujours, même nuls : leur absence
    // signalerait une entrée incomplète plutôt qu'un fichier manquant.
    expect(a).toHaveProperty('width');
    expect(a).toHaveProperty('height');
    expect(a).toHaveProperty('format');
    expect(a).toHaveProperty('bytes');
    expect(a).toHaveProperty('checksum');
    expect(a).toHaveProperty('legalNote');
  }
});

test('les identifiants sont uniques', () => {
  const ids = registry().map((a) => a.id);
  expect(new Set(ids).size, 'aucun doublon').toBe(ids.length);
});

/* ================================================================== *
 * Règles d'éligibilité
 * ================================================================== */

const base: AssetRecord = {
  id: 'x:logo',
  brandSlug: 'x',
  brandLabel: 'X',
  usage: 'logo',
  priority: 'catalogue',
  path: 'src/assets/brands/x/logo.svg',
  status: 'validated',
  source: 'Fabricant',
  authorization: { status: 'granted', evidence: 'Brand guidelines 2026' },
  width: 512,
  height: 512,
  format: 'svg',
  bytes: 4096,
  checksum: 'a'.repeat(64),
  sourceType: null,
  opticalCoverage: null,
  legalNote: null,
};

test('production : un asset validé, autorisé et empreinté est publiable', () => {
  expect(productionEligible(base)).toBe(true);
});

test('production : requires_validation n’est jamais publié', () => {
  expect(productionEligible({ ...base, status: 'requires_validation' })).toBe(false);
});

test('production : une autorisation inconnue bloque', () => {
  expect(
    productionEligible({ ...base, authorization: { status: 'unknown', evidence: null } }),
  ).toBe(false);
});

test('production : un refus bloque, même validé', () => {
  expect(
    productionEligible({ ...base, authorization: { status: 'denied', evidence: 'Refus' } }),
  ).toBe(false);
});

test('production : sans checksum, pas de publication', () => {
  expect(productionEligible({ ...base, checksum: null })).toBe(false);
});

test('staging : requires_validation est rendu', () => {
  const a = { ...base, status: 'requires_validation' as const };
  expect(stagingRenderable(a)).toBe(true);
  expect(productionEligible(a)).toBe(false);
});

test('staging : un asset absent n’est pas rendu', () => {
  expect(stagingRenderable({ ...base, path: null, status: 'missing' })).toBe(false);
});

test('staging : un refus explicite n’est jamais rendu', () => {
  expect(
    stagingRenderable({ ...base, authorization: { status: 'denied', evidence: 'Refus' } }),
  ).toBe(false);
});

test('en production, un asset non validé bascule sur le repli', () => {
  // Aucun asset de marque n’étant fourni, la résolution rend `null` partout :
  // c’est le signal de repli, pas une erreur.
  expect(resolveAsset('coca-cola', 'hero', 'production')).toBeNull();
  expect(resolveAsset('coca-cola', 'logo', 'production')).toBeNull();
});

test('aucune marque n’est retirée du site faute d’asset', () => {
  // Le contrôle porte sur l’asset, jamais sur la marque.
  const slugs = new Set(registry().map((a) => a.brandSlug));
  for (const b of catalog) {
    expect(slugs.has(b.slug), `${b.brand} doit rester au registre`).toBe(true);
  }
});

/* ================================================================== *
 * Fichiers réels — provenance et détection de remplacement
 * ================================================================== */

test('aucun hotlink : tout chemin déclaré est local', () => {
  for (const a of registry()) {
    if (a.path === null) continue;
    expect(a.path, `${a.id}`).not.toMatch(/^https?:\/\//);
    expect(a.path, `${a.id}`).not.toContain('handelsplaza');
  }
});

test('tout fichier déclaré existe et n’a pas été remplacé', () => {
  const problems: string[] = [];

  for (const a of registry()) {
    if (a.path === null) continue;

    const abs = resolve(ROOT, a.path);
    if (!existsSync(abs)) {
      problems.push(`${a.id} — fichier déclaré mais absent : ${a.path}`);
      continue;
    }

    const buf = readFileSync(abs);

    if (a.checksum !== null && sha256(buf) !== a.checksum) {
      problems.push(
        `${a.id} — le fichier a changé sans mise à jour du registre ` +
          `(attendu ${a.checksum.slice(0, 12)}…, trouvé ${sha256(buf).slice(0, 12)}…)`,
      );
    }
    if (a.bytes !== null && statSync(abs).size !== a.bytes) {
      problems.push(`${a.id} — poids différent de celui déclaré`);
    }
    const ext = extname(abs).slice(1).toLowerCase();
    if (a.format !== null && ext !== a.format && !(a.format === 'jpg' && ext === 'jpeg')) {
      problems.push(`${a.id} — format déclaré ${a.format}, fichier .${ext}`);
    }
  }

  expect(problems).toEqual([]);
});

test('tout fichier existant déclare sa provenance', () => {
  for (const a of registry()) {
    if (a.path === null) continue;
    expect(a.source, `${a.id} doit déclarer d’où vient le fichier`).toBeTruthy();
  }
});

/* ================================================================== *
 * Cohérence registre ↔ gouvernance de l'artefact
 *
 * `asset-governance.mjs` décide ce qui est RETIRÉ de `dist/` ; le registre
 * décide ce qui est AFFICHÉ. Les deux vivent dans des fichiers différents
 * parce qu'ils sont lus par des outils différents — et c'est exactement pour
 * cela qu'ils peuvent diverger sans bruit.
 *
 * Les trois tests ci-dessous font échouer la divergence des DEUX côtés : un
 * asset publiable que la liste blanche retirerait, et un asset non publiable
 * que la liste blanche laisserait passer.
 * ================================================================== */

/** Base de nom telle qu'elle apparaîtra dans `dist/_astro/`. */
const basenameOf = (path: string) => (path.split('/').pop() ?? '').split('.')[0] ?? '';

test('tout asset publiable en production figure dans la liste blanche d’identité', () => {
  const wrong = registry()
    .filter((a) => productionEligible(a) && a.path !== null)
    .filter((a) => !IDENTITY_BASENAMES.includes(basenameOf(a.path!)))
    .map((a) => `${a.id} → ${a.path}`);

  // Un asset validé absent de la liste blanche serait supprimé du build de
  // production par `pruneUnvalidatedAssets`, laissant une image cassée.
  expect(wrong, 'assets publiables que la liste blanche retirerait').toEqual([]);
});

test('aucun visuel de marque ne se glisse dans la liste blanche d’identité', () => {
  const leaks = registry()
    .filter((a) => a.path !== null && a.path.startsWith('src/assets/brands/'))
    .filter((a) => IDENTITY_BASENAMES.includes(basenameOf(a.path!)))
    .map((a) => `${a.id} → ${a.path}`);

  expect(leaks, 'visuels tiers que la liste blanche laisserait publier').toEqual([]);
});

test('les visuels de marque n’utilisent que les bases de nom déclarées', () => {
  const unknown = registry()
    .filter((a) => a.path !== null && a.path.startsWith('src/assets/brands/'))
    .filter((a) => !BRAND_ASSET_BASENAMES.includes(basenameOf(a.path!)))
    .map((a) => `${a.id} → ${a.path}`);

  expect(unknown, 'bases de nom inconnues de asset-governance.mjs').toEqual([]);
});

test('un asset généré est toujours un visuel produit, jamais de l’identité', () => {
  const generated = registry().filter((a) => a.sourceType === 'generated');
  expect(generated.length, 'le registre doit porter des assets générés').toBeGreaterThan(0);

  /*
   * La règle n'est plus « uniquement le hero » : TR-025 a ajouté dix packshots
   * Featured sous le même régime. Ce qui reste vrai, et qui compte, c'est
   * qu'un fichier fabriqué ne s'invite jamais ailleurs que sur un emplacement
   * PRODUIT — jamais sur l'identité Ivan Arsenov, jamais sur un logo de marque.
   */
  for (const a of generated) {
    expect(['hero', 'packshot'], `${a.id}`).toContain(a.usage);
    expect(a.path, `${a.id}`).toMatch(/^src\/assets\/brands\//);
    expect(GENERATED_PACKSHOT_BASENAMES, `${a.id}`).toContain(basenameOf(a.path!));
  }

  // Les six emplacements de la scène restent tous servis par un asset généré.
  const heroes = generated.filter((a) => a.usage === 'hero');
  expect(heroes.map((a) => a.brandSlug).sort()).toEqual([...HERO_BRANDS].sort());
});

test('les bases de nom générées ne recouvrent que des assets générés', () => {
  /*
   * Réciproque du test précédent. Sans elle, `GENERATED_PACKSHOT_BASENAMES`
   * pourrait un jour désigner une base sous laquelle vit aussi un fichier
   * fourni par un titulaire — et `qa:artifact` le retirerait de la production
   * en le prenant pour une image fabriquée.
   */
  const wrong = registry()
    .filter((a) => a.path !== null && GENERATED_PACKSHOT_BASENAMES.includes(basenameOf(a.path)))
    .filter((a) => a.sourceType !== 'generated')
    .map((a) => `${a.id} → sourceType ${a.sourceType}`);
  expect(wrong).toEqual([]);
});

test('un asset généré n’est jamais publiable en production', () => {
  /*
   * Règle de fond, pas contrôle de saisie : la qualité visuelle d'un fichier
   * fabriqué ne vaut pas droit d'usage. Le passer en `validated` ne doit pas
   * suffire — il faut aussi une autorisation du titulaire, qui n'existe pas.
   */
  for (const a of registry().filter((x) => x.sourceType === 'generated')) {
    expect(productionEligible(a), `${a.id} ne doit pas être publiable`).toBe(false);
    expect(a.status, `${a.id}`).toBe('requires_validation');
    expect(a.authorization.status, `${a.id}`).toBe('unknown');
    expect(a.legalNote, `${a.id} doit porter sa note juridique`).toBeTruthy();
  }
});

/* ================================================================== *
 * Rapport
 * ================================================================== */

test('génère doc/assets-registry.md', async () => {
  const r = report();
  const all = registry();

  const row = (a: AssetRecord) =>
    `| ${a.brandLabel} | \`${a.usage}\` | ${a.path ? `\`${a.path}\`` : '—'} | ` +
    `${a.status} | ${a.source ?? '—'} | ${a.authorization.status}` +
    `${a.authorization.evidence ? ` — ${a.authorization.evidence}` : ''} | ` +
    `${a.width && a.height ? `${a.width}×${a.height}` : '—'} | ${a.format ?? '—'} | ` +
    `${a.bytes ? `${(a.bytes / 1024).toFixed(1)} Ko` : '—'} | ` +
    `${a.checksum ? `\`${a.checksum.slice(0, 12)}…\`` : '—'} | ` +
    `${productionEligible(a) ? '✅' : '❌ repli'} | ${a.legalNote ?? '—'} |`;

  const header =
    '| Marque | Usage | Chemin | Statut | Provenance | Autorisation | Dimensions | ' +
    'Format | Poids | Checksum | Production | Note juridique |\n' +
    '|---|---|---|---|---|---|---|---|---|---|---|---|';

  const section = (title: string, items: AssetRecord[]) =>
    items.length === 0 ? '' : `\n### ${title}\n\n${header}\n${items.map(row).join('\n')}\n`;

  const md = `# REGISTRE D'ASSETS — IVAN ARSENOV

> **Fichier généré** par \`npm run assets:report\`. Ne pas éditer à la main :
> les informations non déductibles se saisissent dans \`src/data/assets.ts\`.

## État

| | Total | Publiables en production |
|---|---|---|
| **Hero** — conditionne la direction artistique | ${r.byPriority.hero.total} | ${r.byPriority.hero.validated} |
| **Identité** | ${r.byPriority.identity.total} | ${r.byPriority.identity.validated} |
| **Featured** | ${r.byPriority.featured.total} | ${r.byPriority.featured.validated} |
| **Catalogue** | ${r.byPriority.catalogue.total} | ${r.byPriority.catalogue.validated} |
| **Total** | ${r.total} | ${all.filter(productionEligible).length} |

Statuts — validated ${r.byStatus.validated} · requires_validation ${r.byStatus.requires_validation} · missing ${r.byStatus.missing}

**${r.substitutedInProduction.length} asset(s) sont substitués par le repli typographique en production.**
Aucune marque n'est retirée du site pour autant : seul le visuel est remplacé.

## Règles appliquées

| Environnement | \`validated\` | \`requires_validation\` | \`missing\` |
|---|---|---|---|
| **Staging** | rendu | **rendu** | repli |
| **Production** | rendu | **repli** | repli |

La production exige en outre un **checksum** et une **autorisation positivement établie**
(\`granted\` ou \`referential-use\`). Un statut \`unknown\` bloque : l'absence d'information
vaut refus, jamais accord tacite.

Aucun hotlink. Aucun asset du benchmark n'est exploitable en production.
Aucune image générée ou substituée n'est présentée comme un vrai produit.
${section('Hero — priorité absolue', all.filter((a) => a.priority === 'hero'))}${section('Identité', all.filter((a) => a.priority === 'identity'))}${section('Featured', all.filter((a) => a.priority === 'featured'))}${section('Catalogue', all.filter((a) => a.priority === 'catalogue'))}`;

  const out = resolve(ROOT, 'doc/assets-registry.md');
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, md);

  expect(existsSync(out)).toBe(true);
});
