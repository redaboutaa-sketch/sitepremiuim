/**
 * GOUVERNANCE DES ASSETS — AU NIVEAU DE L'ARTEFACT
 *
 * `src/data/assets.ts` décide ce qui est AFFICHÉ. Ce fichier décide ce qui est
 * DÉPOSÉ. Les deux questions sont distinctes : `import.meta.glob({ eager: true })`
 * émet tout ce qui correspond au motif, indépendamment du rendu. Un fichier
 * présent dans `dist/_astro/` est publiquement téléchargeable même si aucune
 * page ne l'affiche — donc publié, au sens qui compte juridiquement.
 *
 * Ce module existe en `.mjs` pour une raison précise : c'est le seul format
 * importable à la fois par `astro.config.mjs`, par les scripts d'audit Node et
 * par les modules TypeScript. Sans lui, la règle serait réécrite dans chacun
 * des trois — et il suffirait d'en oublier un.
 *
 * ── LA RÈGLE EST UNE LISTE BLANCHE, PAS UNE LISTE NOIRE ────────────────────
 *
 * Une liste noire doit être mise à jour à chaque nouveau type d'asset ; la
 * première fois qu'on l'oublie, un visuel tiers part en production sans que
 * rien ne proteste. Une liste blanche échoue dans l'autre sens : un fichier
 * inattendu est retiré et signalé. C'est la seule asymétrie acceptable ici.
 *
 * En production, les SEULES images autorisées dans l'artefact sont celles de
 * l'identité Ivan Arsenov — fournies par le client pour son propre site, sans
 * titulaire extérieur à consulter. Tout le reste est un visuel appartenant à
 * un tiers et attend une validation qui n'a pas eu lieu.
 *
 * La cohérence entre cette liste et le registre TypeScript n'est pas supposée :
 * `tests/assets.spec.ts` la vérifie dans les deux sens.
 */

/**
 * Bases de nom des fichiers d'identité, telles qu'elles apparaissent dans
 * `dist/_astro/`. Astro nomme ses dérivés `<base>.<hash>_<hash>.<ext>` : le
 * dossier d'origine disparaît, seule la base subsiste.
 *
 * Les suffixes `-light` / `-dark` désignent DEUX TRACÉS DISTINCTS fournis par
 * le client, pas deux rendus d'un même fichier.
 */
export const IDENTITY_BASENAMES = [
  'lockup-light',
  'lockup-dark',
  'monogram-light',
  'monogram-dark',
  'wordmark-light',
  'wordmark-dark',
  'favicon',
  'favicon-32',
  'favicon-48',
  'favicon-512',
  'apple-touch-icon',
];

/**
 * Bases de nom des visuels de MARQUE TIERCE — ceux du catalogue.
 *
 * Aucun n'est validé, aucun ne peut donc atteindre la production. La liste
 * sert aux messages d'audit et au test de cohérence avec le registre ; la
 * décision de retrait, elle, ne s'appuie PAS dessus (voir `isBrandVisual`).
 */
export const BRAND_ASSET_BASENAMES = ['logo', 'packshot', 'packshot-alt', 'hero'];

/**
 * Bases de nom des packshots GÉNÉRÉS — scène d'accueil (TR-024A/B/D) et
 * Featured (TR-025).
 *
 * Isolées parce que leur régime est plus strict que « non validé » : ce ne
 * sont pas des fichiers officiels en attente d'accord, ce sont des images
 * FABRIQUÉES. Elles ne ferment pas le blocage B2 et ne deviendront jamais
 * publiables par simple changement de statut.
 *
 * Un nom de fichier ne prouve évidemment aucune provenance. Cette liste ne
 * la déduit pas : elle énumère les bases sous lesquelles des fichiers générés
 * ont été rangés, et `tests/assets.spec.ts` vérifie que le registre et cette
 * liste disent la même chose — dans les deux sens.
 */
export const GENERATED_PACKSHOT_BASENAMES = ['hero', 'packshot'];

const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif)$/i;

/**
 * Base de nom d'un fichier émis.
 *
 * `hero.O1bAPWFf_Ki9Jz.webp` → `hero`
 * `monogram-light.y8BWbJn6_1kA4s0.webp` → `monogram-light`
 * `favicon.ico` → `favicon`
 *
 * On coupe au premier point : les hachages d'Astro n'en contiennent jamais.
 */
export function emittedBasename(file) {
  const name = file.split('/').pop() ?? file;
  return name.split('.')[0] ?? '';
}

export const isImageFile = (file) => IMAGE_EXT.test(file);

/**
 * Le fichier est-il un visuel appartenant à un tiers ?
 *
 * Défini par exclusion de l'identité, jamais par énumération des marques :
 * c'est ce qui fait que le contrôle couvre aussi les types d'assets qui
 * n'existent pas encore.
 */
export function isBrandVisual(file) {
  return isImageFile(file) && !IDENTITY_BASENAMES.includes(emittedBasename(file));
}

/** Le fichier est-il l'un des packshots générés de la scène ? */
export function isGeneratedPackshot(file) {
  return isImageFile(file) && GENERATED_PACKSHOT_BASENAMES.includes(emittedBasename(file));
}
