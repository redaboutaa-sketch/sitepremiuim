/**
 * REGISTRE D'ASSETS
 *
 * Le registre est à la fois le contrôle qualité et la liste de courses :
 * il énumère TOUS les fichiers attendus, y compris ceux qui n'existent pas
 * encore, avec leur statut et leur provenance.
 *
 * Règles non négociables :
 *   · aucun hotlink — tout fichier est servi depuis notre domaine ;
 *   · aucun asset du benchmark n'est exploitable en production ;
 *   · `requires_validation` est rendu en staging, JAMAIS en production ;
 *   · en production, un asset non validé bascule sur le repli typographique ;
 *   · aucune image générée ou substituée n'est présentée comme un vrai produit.
 *
 * Le squelette est dérivé du catalogue (voir src/lib/assets.ts) : ajouter une
 * marque crée automatiquement ses entrées attendues. Ce fichier ne porte que
 * les informations qui ne peuvent PAS être déduites — provenance, autorisation,
 * mesures du fichier réel, note juridique.
 */

/** Ce à quoi sert le fichier. Conditionne les exigences techniques. */
export type AssetUsage =
  // Marques du catalogue
  | 'logo'
  | 'packshot'
  | 'packshot-alt'
  | 'hero'
  // Identité Ivan Arsenov — trois fichiers vectoriels DISTINCTS, pas un seul.
  // Le monogramme, le lock-up et le wordmark ont des usages différents dans
  // la mise en page et ne peuvent pas se déduire l'un de l'autre.
  | 'monogram'
  | 'lockup'
  | 'wordmark'
  | 'favicon'
  | 'og';

export type AssetStatus = 'validated' | 'requires_validation' | 'missing';

/**
 * Niveau de priorité d'obtention.
 * `hero` est isolé : la qualité de ces six fichiers conditionne directement
 * la direction artistique de la homepage.
 */
export type AssetPriority = 'hero' | 'identity' | 'featured' | 'catalogue';

export type AuthorizationStatus =
  /** Aucune information — statut par défaut, bloque la production. */
  | 'unknown'
  /** Fourni par le client, qui assume l'usage référentiel de distributeur (D2). */
  | 'referential-use'
  /** Autorisation écrite du titulaire, référencée dans `evidence`. */
  | 'granted'
  /** Refus ou restriction connue — l'asset ne doit jamais être publié. */
  | 'denied';

export interface AssetAuthorization {
  status: AuthorizationStatus;
  /** Référence de la preuve : e-mail, contrat, page de brand guidelines, date. */
  evidence: string | null;
}

export interface AssetRecord {
  /** Clé stable `<brandSlug>:<usage>`. */
  id: string;
  brandSlug: string;
  brandLabel: string;
  usage: AssetUsage;
  priority: AssetPriority;

  /** Chemin LOCAL dans le dépôt. `null` tant que le fichier n'existe pas. */
  path: string | null;

  status: AssetStatus;

  /** D'où vient le fichier. Obligatoire dès qu'un fichier existe. */
  source: string | null;

  authorization: AssetAuthorization;

  /** Mesures du fichier réel — renseignées par `npm run assets:scan`. */
  width: number | null;
  height: number | null;
  format: 'svg' | 'webp' | 'avif' | 'png' | 'jpg' | null;
  bytes: number | null;

  /**
   * SHA-256 du fichier. Permet de détecter un remplacement silencieux :
   * si le fichier change sans que le registre soit mis à jour, l'audit échoue.
   */
  checksum: string | null;

  legalNote: string | null;
}

/**
 * Les six produits mis en scène dans le hero (doc/design-direction.md §3).
 * Traités à part : ce sont les seuls assets dont la qualité photographique
 * conditionne la direction artistique elle-même.
 */
export const HERO_BRANDS = [
  'coca-cola',
  'fanta',
  'red-bull',
  'monster-energy',
  'pepsi',
  'sprite',
] as const;

/**
 * Informations non déductibles, saisies à la main.
 * Clé : `<brandSlug>:<usage>`.
 *
 * ÉTAT AU 2026-08-15 — aucun fichier de marque n'a encore été fourni.
 * Le registre est donc entièrement en `missing`, à l'exception de l'identité
 * Ivan Arsenov ci-dessous.
 */
export const ASSET_OVERRIDES: Record<string, Partial<AssetRecord>> = {
  // ÉTAT AU 2026-08-15 — aucun fichier de marque tierce n'a encore été fourni.
  // Les surcharges se saisissent ici au fur et à mesure des livraisons.
};

/**
 * Assets qui ne dépendent pas d'une marque du catalogue.
 * Le favicon actuel est un placeholder assumé, tracé comme tel.
 */
/**
 * Identité Ivan Arsenov — TROIS fichiers vectoriels distincts.
 *
 * Le logo a été présenté par le client le 2026-08-15 : monogramme IA en sérif
 * haute tension avec liaison en arc sous le A, wordmark IVAN ARSENOV en
 * capitales espacées, filet de soulignement.
 *
 * Le FICHIER n'a pas été versé au dépôt. Aucun des trois n'est redessiné :
 * un tracé approximatif présenté comme l'identité serait une contrefaçon de
 * la marque du client lui-même. Ils restent `missing` jusqu'à réception.
 */
const IDENTITY_FILES: Array<{ usage: AssetUsage; label: string; note: string }> = [
  {
    usage: 'monogram',
    label: 'Ivan Arsenov — monogramme IA',
    note: 'Monogramme seul. Sert le filigrane du hero et dérive le favicon.',
  },
  {
    usage: 'lockup',
    label: 'Ivan Arsenov — lock-up complet',
    note: 'Monogramme + wordmark + filet. Sert le footer et les métadonnées sociales.',
  },
  {
    usage: 'wordmark',
    label: 'Ivan Arsenov — wordmark',
    note: 'Wordmark seul. Sert la marque du header, où la hauteur est contrainte.',
  },
];

function identityAssets(): AssetRecord[] {
  return IDENTITY_FILES.map(({ usage, label, note }) => ({
    id: `ivan-arsenov:${usage}`,
    brandSlug: 'ivan-arsenov',
    brandLabel: label,
    usage,
    priority: 'identity' as const,
    path: null,
    status: 'missing' as const,
    source: 'Client — visuel présenté en conversation le 2026-08-15, fichier non transmis',
    authorization: { status: 'granted' as const, evidence: 'Identité propre du client' },
    width: null,
    height: null,
    format: null,
    bytes: null,
    checksum: null,
    legalNote: `${note} Vectoriel SVG exigé — une version matricielle serait inutilisable.`,
  }));
}

export const STANDALONE_ASSETS: AssetRecord[] = [
  ...identityAssets(),
  {
    id: 'ivan-arsenov:favicon',
    brandSlug: 'ivan-arsenov',
    brandLabel: 'Ivan Arsenov — favicon',
    usage: 'favicon',
    priority: 'identity',
    path: 'public/favicon.svg',
    // PLACEHOLDER assumé : lettres « IA » composées dans une sérif système.
    // Ce n'est PAS le monogramme officiel et il ne doit jamais être présenté
    // comme tel. À dériver du monogramme dès réception du vectoriel.
    status: 'requires_validation',
    source: 'Placeholder composé en interne — TR-001',
    authorization: { status: 'granted', evidence: 'Composition interne, aucune marque tierce' },
    width: 32,
    height: 32,
    format: 'svg',
    bytes: null,
    checksum: null,
    legalNote:
      'Placeholder interne, à ne pas confondre avec le monogramme officiel. ' +
      'À remplacer dès réception du vectoriel (décision D8).',
  },
];
