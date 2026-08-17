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
  format: 'svg' | 'webp' | 'avif' | 'png' | 'jpg' | 'ico' | null;
  bytes: number | null;

  /**
   * SHA-256 du fichier. Permet de détecter un remplacement silencieux :
   * si le fichier change sans que le registre soit mis à jour, l'audit échoue.
   */
  checksum: string | null;

  /**
   * Origine du fichier.
   *
   * `generated` isole les visuels PRODUITS PAR UN MODÈLE ou reconstruits. Un
   * packshot généré ressemble à un packshot officiel — c'est précisément le
   * problème. Sans ce champ, rien dans la donnée ne distingue une photographie
   * fournie par le titulaire d'une image fabriquée, et la promotion en
   * production ne reposerait plus que sur la mémoire de qui la fait.
   *
   * Un asset `generated` ne peut JAMAIS atteindre `validated` sans une
   * décision humaine explicite ET une autorisation du titulaire : sa qualité
   * visuelle ne vaut pas droit d'usage.
   */
  sourceType: 'supplied' | 'generated' | 'internal' | null;

  /**
   * Part de pixels opaques dans la boîte englobante, 0 a 1.
   *
   * Sert la NORMALISATION OPTIQUE du catalogue : deux logos de meme surface
   * geometrique n'ont pas le meme poids visuel si l'un est un aplat plein et
   * l'autre un lettrage aere. Sans cette mesure, un rectangle plein ecrase
   * ses voisins a taille CSS egale.
   */
  opticalCoverage: number | null;

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
  /*
   * ── HERO « THE STAGE » — six packshots GÉNÉRÉS, préproduction seulement ──
   *
   * Extraits en TR-024A d'une planche composite produite par un modèle. Ils
   * existent pour une raison précise : la composition du hero n'avait jamais
   * été jugée qu'avec des replis typographiques, donc jamais avec de vrais
   * volumes. Ils répondent à cette question, et à aucune autre.
   */
  'coca-cola:hero': {
    path: 'src/assets/brands/coca-cola/hero.png',
    /*
     * `requires_validation` : rendu en préproduction, JAMAIS en production.
     * C'est le mécanisme existant, et il suffit — inutile d'inventer un
     * statut parallèle.
     */
    status: 'requires_validation',
    sourceType: 'generated',
    source: 'Extraction TR-024A depuis une planche composite GÉNÉRÉE (archive « ChatGPT Image 17 août 2026 »)',
    /*
     * `unknown`, et cela ne bougera pas sans document. Ces visuels
     * représentent des produits de marques tierces sans provenance établie
     * auprès des titulaires. Leur qualité technique est bonne ; elle ne vaut
     * pas autorisation.
     */
    authorization: { status: 'unknown', evidence: null },
    width: 443,
    height: 1517,
    format: 'png',
    bytes: 1822872,
    checksum: 'bb899aaffac4f5a66ec9486d5c1938be95b2351c341d78dc60ae28c96bd9bcfd',
    opticalCoverage: 0.794,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Sert exclusivement à juger ' +
      'la composition de THE STAGE en préproduction. Ne ferme pas B2 : la ' +
      'production exige un fichier presse ou une autorisation écrite.',
  },
  'fanta:hero': {
    path: 'src/assets/brands/fanta/hero.png',
    /*
     * `requires_validation` : rendu en préproduction, JAMAIS en production.
     * C'est le mécanisme existant, et il suffit — inutile d'inventer un
     * statut parallèle.
     */
    status: 'requires_validation',
    sourceType: 'generated',
    source: 'Extraction TR-024A depuis une planche composite GÉNÉRÉE (archive « ChatGPT Image 17 août 2026 »)',
    /*
     * `unknown`, et cela ne bougera pas sans document. Ces visuels
     * représentent des produits de marques tierces sans provenance établie
     * auprès des titulaires. Leur qualité technique est bonne ; elle ne vaut
     * pas autorisation.
     */
    authorization: { status: 'unknown', evidence: null },
    width: 272,
    height: 900,
    format: 'png',
    bytes: 663992,
    checksum: 'bb1d98895e252cfc2d82fe4b2a29bbe2ce16cbde82cf28e32977f636bc2926be',
    opticalCoverage: 0.818,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Sert exclusivement à juger ' +
      'la composition de THE STAGE en préproduction. Ne ferme pas B2 : la ' +
      'production exige un fichier presse ou une autorisation écrite.',
  },
  'red-bull:hero': {
    path: 'src/assets/brands/red-bull/hero.png',
    /*
     * `requires_validation` : rendu en préproduction, JAMAIS en production.
     * C'est le mécanisme existant, et il suffit — inutile d'inventer un
     * statut parallèle.
     */
    status: 'requires_validation',
    sourceType: 'generated',
    source: 'Extraction TR-024A depuis une planche composite GÉNÉRÉE (archive « ChatGPT Image 17 août 2026 »)',
    /*
     * `unknown`, et cela ne bougera pas sans document. Ces visuels
     * représentent des produits de marques tierces sans provenance établie
     * auprès des titulaires. Leur qualité technique est bonne ; elle ne vaut
     * pas autorisation.
     */
    authorization: { status: 'unknown', evidence: null },
    width: 214,
    height: 594,
    format: 'png',
    bytes: 398199,
    checksum: '57dd7fb06d9d2e8c1e007a61e4dbe59b489b177a107927911c2cf334732aabc2',
    opticalCoverage: 0.976,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Sert exclusivement à juger ' +
      'la composition de THE STAGE en préproduction. Ne ferme pas B2 : la ' +
      'production exige un fichier presse ou une autorisation écrite.',
  },
  'monster-energy:hero': {
    path: 'src/assets/brands/monster-energy/hero.png',
    /*
     * `requires_validation` : rendu en préproduction, JAMAIS en production.
     * C'est le mécanisme existant, et il suffit — inutile d'inventer un
     * statut parallèle.
     */
    status: 'requires_validation',
    sourceType: 'generated',
    source: 'Extraction TR-024A depuis une planche composite GÉNÉRÉE (archive « ChatGPT Image 17 août 2026 »)',
    /*
     * `unknown`, et cela ne bougera pas sans document. Ces visuels
     * représentent des produits de marques tierces sans provenance établie
     * auprès des titulaires. Leur qualité technique est bonne ; elle ne vaut
     * pas autorisation.
     */
    authorization: { status: 'unknown', evidence: null },
    width: 227,
    height: 595,
    format: 'png',
    bytes: 364912,
    checksum: '7af5ab88498d31487607f15f0e3c0e40f65f774d03a329c841ee43692c76fff6',
    opticalCoverage: 0.964,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Sert exclusivement à juger ' +
      'la composition de THE STAGE en préproduction. Ne ferme pas B2 : la ' +
      'production exige un fichier presse ou une autorisation écrite.',
  },
  'pepsi:hero': {
    path: 'src/assets/brands/pepsi/hero.png',
    /*
     * `requires_validation` : rendu en préproduction, JAMAIS en production.
     * C'est le mécanisme existant, et il suffit — inutile d'inventer un
     * statut parallèle.
     */
    status: 'requires_validation',
    /*
     * TR-024D — REMPLACEMENT. L'asset précédent portait la livrée Pepsi
     * 2008-2023, alors que le logo fourni par le client porte l'identité
     * courante. Le fichier a donc été remplacé, et lui seul : position, plan,
     * échelle et géométrie de la scène sont inchangés.
     *
     * `generated`, malgré une déclaration de provenance contraire à la
     * livraison. Le fichier porte un manifeste C2PA signé qui dit exactement
     * ceci :
     *     c2pa.created · softwareAgent { name: gpt-image, version: 2.0 }
     *     digitalSourceType: …/newscodes/digitalsourcetype/trainedAlgorithmicMedia
     * `trainedAlgorithmicMedia` est le code IPTC des contenus intégralement
     * produits par un modèle génératif. C'est précisément ce que ce champ
     * existe pour enregistrer, et une déclaration orale ne l'emporte pas sur
     * une provenance signée embarquée dans le fichier.
     */
    sourceType: 'generated',
    source:
        'Archive « ChatGPT Image 17 août 2026, 18_38_05 » (TR-024D). Recadrage ' +
        'STRICT sur la boîte alpha (1536×1024 → 480×961), sans redimensionnement ' +
        'ni retouche. Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
        'digitalSourceType = trainedAlgorithmicMedia.',
    /*
     * `unknown`, et cela ne bougera pas sans document. Ces visuels
     * représentent des produits de marques tierces sans provenance établie
     * auprès des titulaires. Leur qualité technique est bonne ; elle ne vaut
     * pas autorisation.
     */
    authorization: { status: 'unknown', evidence: null },
    width: 480,
    height: 961,
    format: 'png',
    bytes: 1220273,
    checksum: '3ec46717ff256f5d00e0e7d76b3cb4cc89b200c98134bb0e07cc98b198910430',
    opticalCoverage: 0.951,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire — provenance établie par le ' +
      'manifeste C2PA embarqué, pas par déduction. Livrée Pepsi 2023 correcte, ' +
      'ce qui corrige l’inexactitude relevée en TR-024C, mais ne change RIEN au ' +
      'régime : préproduction uniquement. Ne ferme pas B2 : la production exige ' +
      'un fichier presse ou une autorisation écrite.',
  },
  'sprite:hero': {
    path: 'src/assets/brands/sprite/hero.png',
    /*
     * `requires_validation` : rendu en préproduction, JAMAIS en production.
     * C'est le mécanisme existant, et il suffit — inutile d'inventer un
     * statut parallèle.
     */
    status: 'requires_validation',
    sourceType: 'generated',
    source: 'Extraction TR-024A depuis une planche composite GÉNÉRÉE (archive « ChatGPT Image 17 août 2026 »)',
    /*
     * `unknown`, et cela ne bougera pas sans document. Ces visuels
     * représentent des produits de marques tierces sans provenance établie
     * auprès des titulaires. Leur qualité technique est bonne ; elle ne vaut
     * pas autorisation.
     */
    authorization: { status: 'unknown', evidence: null },
    width: 229,
    height: 505,
    format: 'png',
    bytes: 357577,
    checksum: 'c6b023cdea0a18d69ca7bb72d9af786094d0be8818601b354d3673a6cbbf2cbc',
    opticalCoverage: 0.961,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Sert exclusivement à juger ' +
      'la composition de THE STAGE en préproduction. Ne ferme pas B2 : la ' +
      'production exige un fichier presse ou une autorisation écrite.',
  },


  /*
   * TR-025 — PACKSHOTS FEATURED, dix marques.
   *
   * Extraits d'une planche composite GÉNÉRÉE, par recadrage strict sur la
   * boîte alpha : aucun redimensionnement, aucune retouche, aucun pixel du
   * produit reconstruit. La première planche livrée a été REFUSÉE — fond peint,
   * halos et ombres incrustés, aucune séparation transparente (voir
   * doc/tr-025-featured-packshots.md). Celle-ci porte une transparence réelle
   * sur 50 % de sa surface et une marge nulle sur les quatre bords de chaque
   * produit.
   *
   * Même régime que les six du Hero, sans exception : `generated`,
   * `requires_validation`, autorisation `unknown`, préproduction UNIQUEMENT.
   * Aucun de ces fichiers ne ferme B2.
   *
   * RÉSOLUTION — aucun n'atteint le besoin DPR 3. Hauteur d'image mesurée dans
   * le navigateur : 265 px CSS en Featured (donc 795 px à DPR 3), 391 px CSS en
   * S4 Discovery (1173 px à DPR 3). Les hauteurs livrées vont de 401 à 530 px :
   * elles couvrent DPR 1 partout, DPR 2 de 76 à 100 % en Featured. Aucun
   * agrandissement n'a été appliqué pour faire passer un contrôle — la note de
   * chaque entrée porte le chiffre réel.
   */

  'evian:packshot': {
    path: 'src/assets/brands/evian/packshot.png',
    status: 'requires_validation',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'unknown', evidence: null },
    width: 184,
    height: 529,
    format: 'png',
    bytes: 266105,
    checksum: 'c7766952c2f45b3e063ec87d055d08bd71b97864930483ce84c98a8609e6d34b',
    opticalCoverage: 0.847,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Préproduction uniquement. ' +
      'Résolution : 100 % du besoin DPR 2 et 67 % du besoin DPR 3 en Featured. ' +
      'Ne ferme pas B2 : la production exige un fichier presse ou une autorisation écrite.',
  },
  'orangina:packshot': {
    path: 'src/assets/brands/orangina/packshot.png',
    status: 'requires_validation',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'unknown', evidence: null },
    width: 219,
    height: 455,
    format: 'png',
    bytes: 266927,
    checksum: '040a4da9aed6ac20e87f240c5e58bf41d5a341cd9bae29632c407a76b17a1ce3',
    opticalCoverage: 0.658,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Préproduction uniquement. ' +
      'Résolution : 86 % du besoin DPR 2 et 57 % du besoin DPR 3 en Featured. ' +
      'Ne ferme pas B2 : la production exige un fichier presse ou une autorisation écrite.',
  },
  'powerade:packshot': {
    path: 'src/assets/brands/powerade/packshot.png',
    status: 'requires_validation',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'unknown', evidence: null },
    width: 179,
    height: 530,
    format: 'png',
    bytes: 240852,
    checksum: '4fd130740dc6447b40f20c361840b7fd941cbe3a70b3c28f9f0ae71b5d480b7e',
    opticalCoverage: 0.825,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Préproduction uniquement. ' +
      'Résolution : 100 % du besoin DPR 2 et 67 % du besoin DPR 3 en Featured. ' +
      'Ne ferme pas B2 : la production exige un fichier presse ou une autorisation écrite.',
  },
  'capri-sun:packshot': {
    path: 'src/assets/brands/capri-sun/packshot.png',
    status: 'requires_validation',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'unknown', evidence: null },
    width: 272,
    height: 437,
    format: 'png',
    bytes: 336558,
    checksum: 'cf141f706ee2be8ae14b1cda245791b13fd37ce6cff07cc48f445b4ded391280',
    opticalCoverage: 0.751,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Préproduction uniquement. ' +
      'Résolution : 82 % du besoin DPR 2 et 55 % du besoin DPR 3 en Featured. ' +
      'Ne ferme pas B2 : la production exige un fichier presse ou une autorisation écrite.',
  },
  'dr-pepper:packshot': {
    path: 'src/assets/brands/dr-pepper/packshot.png',
    status: 'requires_validation',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'unknown', evidence: null },
    width: 219,
    height: 406,
    format: 'png',
    bytes: 257639,
    checksum: '54ff259dc2a9cf326c2e8ba167bdb71ce0502489dacee02b73acf10a53b36b62',
    opticalCoverage: 0.953,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Préproduction uniquement. ' +
      'Résolution : 77 % du besoin DPR 2 et 51 % du besoin DPR 3 en Featured. ' +
      'Ne ferme pas B2 : la production exige un fichier presse ou une autorisation écrite.',
  },
  'spa:packshot': {
    path: 'src/assets/brands/spa/packshot.png',
    status: 'requires_validation',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'unknown', evidence: null },
    width: 179,
    height: 465,
    format: 'png',
    bytes: 225536,
    checksum: '3954dc6393ea5b734870b0b758fe0db52cba5281244a164e8686eda867151a28',
    opticalCoverage: 0.804,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Préproduction uniquement. ' +
      'Résolution : 88 % du besoin DPR 2 et 58 % du besoin DPR 3 en Featured. ' +
      'Ne ferme pas B2 : la production exige un fichier presse ou une autorisation écrite.',
  },
  'mountain-dew:packshot': {
    path: 'src/assets/brands/mountain-dew/packshot.png',
    status: 'requires_validation',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'unknown', evidence: null },
    width: 198,
    height: 401,
    format: 'png',
    bytes: 245850,
    checksum: 'cefb8c24042dbb96afe3c5d053d6395efdff55602c7f0221f78c3fe2f004648a',
    opticalCoverage: 0.963,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Préproduction uniquement. ' +
      'Résolution : 76 % du besoin DPR 2 et 50 % du besoin DPR 3 en Featured. Aussi rendu en S4 Discovery, dont le besoin est plus élevé : 51 % de DPR 2 et 34 % de DPR 3. ' +
      'Ne ferme pas B2 : la production exige un fichier presse ou une autorisation écrite.',
  },
  'schweppes:packshot': {
    path: 'src/assets/brands/schweppes/packshot.png',
    status: 'requires_validation',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'unknown', evidence: null },
    width: 191,
    height: 431,
    format: 'png',
    bytes: 225214,
    checksum: 'd537cec9583d95f44cc9ef86d3cab01b2421b5645f9cfbfebb62781e5b5df244',
    opticalCoverage: 0.963,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Préproduction uniquement. ' +
      'Résolution : 81 % du besoin DPR 2 et 54 % du besoin DPR 3 en Featured. ' +
      'Ne ferme pas B2 : la production exige un fichier presse ou une autorisation écrite.',
  },
  '7up:packshot': {
    path: 'src/assets/brands/7up/packshot.png',
    status: 'requires_validation',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'unknown', evidence: null },
    width: 209,
    height: 409,
    format: 'png',
    bytes: 249226,
    checksum: '497a75a256ff7aed134543289a8c654e6bbcff839cb6bc22bcf8cfb8c5b07143',
    opticalCoverage: 0.953,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Préproduction uniquement. ' +
      'Résolution : 77 % du besoin DPR 2 et 51 % du besoin DPR 3 en Featured. ' +
      'Ne ferme pas B2 : la production exige un fichier presse ou une autorisation écrite.',
  },
  'bundaberg:packshot': {
    path: 'src/assets/brands/bundaberg/packshot.png',
    status: 'requires_validation',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'unknown', evidence: null },
    width: 206,
    height: 464,
    format: 'png',
    bytes: 282017,
    checksum: 'e06d4bbd4466008083400872385e7ca74e3dfaaa175d6a980515afe58a07308c',
    opticalCoverage: 0.866,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire. Préproduction uniquement. ' +
      'Résolution : 88 % du besoin DPR 2 et 58 % du besoin DPR 3 en Featured. Aussi rendu en S4 Discovery, dont le besoin est plus élevé : 59 % de DPR 2 et 40 % de DPR 3. ' +
      'Ne ferme pas B2 : la production exige un fichier presse ou une autorisation écrite.',
  },
  /*
   * LIVRAISON DU 2026-08-16 — archive « photos ivan.zip ».
   *
   * 75 PNG reçus, 60 retenus. Ce sont des LOGOS DE MARQUE : 1080x1080 sur
   * fond blanc plein, aucun canal alpha utile. Ce ne sont PAS les packshots
   * décrits dans doc/assets-guide.md, et le registre ne les fait donc pas
   * passer pour tels — l'usage reste `logo`, jamais `packshot` ni `hero`.
   *
   * Traitement appliqué : detourage du fond blanc par remplissage depuis les
   * bords (un blanc INTERIEUR n'est jamais atteint, donc jamais efface),
   * rognage des marges devenues transparentes, export WebP. Aucun etirement,
   * aucun recadrage du sujet, ratio conserve.
   *
   * Statut `requires_validation` : la fourniture d'un fichier par le client
   * n'emporte pas cession des droits du titulaire de la marque. Rendu en
   * staging, repli typographique en production, tant qu'Ivan n'a pas confirme.
   */
  '28-black:logo': {
    path: 'src/assets/brands/28-black/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (28-Black.png, 842×841 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 639,
    format: 'webp',
    bytes: 81734,
    checksum: '2be2614fe74c848a82688573140c61d8422fb8ba08a0464f5563a1c388d15f4c',
    sourceType: null,
    opticalCoverage: 0.222,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (20%).",
  },
  '7up:logo': {
    path: 'src/assets/brands/7up/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (7-up.png, 345×415 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 345,
    height: 415,
    format: 'webp',
    bytes: 23430,
    checksum: 'de0d54a69d4c5b7a7bedc4bba1ae163b15119e5c24ebfd165332b150ca6651aa',
    sourceType: null,
    opticalCoverage: 0.56,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (37%).",
  },
  'aa-drink:logo': {
    path: 'src/assets/brands/aa-drink/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (AA-Drink.png, 473×350 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 473,
    height: 350,
    format: 'webp',
    bytes: 28378,
    checksum: '160dff9b38dd5909ac8a6a91bf42f3ba3149f49bb86fdbc65209f3b81a07dbba',
    sourceType: null,
    opticalCoverage: 0.414,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (35%).",
  },
  'aquarius:logo': {
    path: 'src/assets/brands/aquarius/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-Aquarius.png, 840×597 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 455,
    format: 'webp',
    bytes: 43690,
    checksum: '5087b2033c6e51ee9515b4c498ddca74870cc6af60d98240f64b46e7d81ce958',
    sourceType: null,
    opticalCoverage: 0.231,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (25% des pixels ≥3:1).",
  },
  'bar-le-duc:logo': {
    path: 'src/assets/brands/bar-le-duc/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (BAR-LE-DUC.png, 864×594 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 440,
    format: 'webp',
    bytes: 8180,
    checksum: '36597632a813d7d3c1c6846f96591ec83397ffe652d8ccca6e5a11e0d3e2c20c',
    sourceType: null,
    opticalCoverage: 1,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ fond plein propre à la marque — rend un bloc coloré, pas une forme détourée · peu lisible sur papier (0%).",
  },
  'big-red:logo': {
    path: 'src/assets/brands/big-red/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (big-red.png, 448×461 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 448,
    height: 461,
    format: 'webp',
    bytes: 39090,
    checksum: 'dfa9b2316b40f377012a7c207b08fc86dafc95ce4a884deff2f75ae7277a7e98',
    sourceType: null,
    opticalCoverage: 0.584,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (53% des pixels ≥3:1) · peu lisible sur papier (52%).",
  },
  'bomba:logo': {
    path: 'src/assets/brands/bomba/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Bomba.png, 837×839 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 642,
    format: 'webp',
    bytes: 33172,
    checksum: '5e66df85d0415d408a9b6f7705c9095c2eec5d4e11ca155695e680a4d565b924',
    sourceType: null,
    opticalCoverage: 0.783,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (29%).",
  },
  'canada-dry:logo': {
    path: 'src/assets/brands/canada-dry/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Canada-Dry.png, 537×505 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 537,
    height: 505,
    format: 'webp',
    bytes: 36012,
    checksum: '6313e299cd18639af4c4ce7caf92ace190537690a32d8ba7e3c5ef81ba51fdea',
    sourceType: null,
    opticalCoverage: 0.689,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (33%).",
  },
  'capri-sun:logo': {
    path: 'src/assets/brands/capri-sun/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Capri-Sun.png, 716×236 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 211,
    format: 'webp',
    bytes: 38798,
    checksum: '1d887bdf07acd51b9c242e9e2a8ea5377380d4b97592aeb721beca28715ce787',
    sourceType: null,
    opticalCoverage: 0.452,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (39%) · très horizontal (ratio 3.03).",
  },
  'charlies:logo': {
    path: 'src/assets/brands/charlies/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Charlies.png, 795×270 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 217,
    format: 'webp',
    bytes: 41990,
    checksum: '61f5f77103938afa794a8f03d14de33c71486ee017045a94d5cbe1041b5f55b1',
    sourceType: null,
    opticalCoverage: 0.437,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (43% des pixels ≥3:1) · très horizontal (ratio 2.94).",
  },
  'chaudfontaine:logo': {
    path: 'src/assets/brands/chaudfontaine/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Chaudfontaine.png, 834×207 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 159,
    format: 'webp',
    bytes: 10728,
    checksum: '346b10b10ec309fa141abe4f1a9fdf4f3dfa7d86b35b5dcf549909bb4453109a',
    sourceType: null,
    opticalCoverage: 1,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ fond plein propre à la marque — rend un bloc coloré, pas une forme détourée · peu lisible sur encre (22% des pixels ≥3:1) · très horizontal (ratio 4.03).",
  },
  'chupa-chups:logo': {
    path: 'src/assets/brands/chupa-chups/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Chupa-Chups.png, 466×465 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 466,
    height: 465,
    format: 'webp',
    bytes: 38998,
    checksum: '0d3b0b24051084f6b90395126ebc599f9367972db76b78551f01c4104a7aad62',
    sourceType: null,
    opticalCoverage: 0.789,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (30%).",
  },
  'coca-cola:logo': {
    path: 'src/assets/brands/coca-cola/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Coca-Cola.png, 620×203 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 620,
    height: 203,
    format: 'webp',
    bytes: 29842,
    checksum: '28d763db10bd7c5448f66860aad62e43d7f062dce637a21346c8da34a2840d78',
    sourceType: null,
    opticalCoverage: 0.416,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ très horizontal (ratio 3.05).",
  },
  'coco-rico:logo': {
    path: 'src/assets/brands/coco-rico/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-Coco-Rico.png, 620×785 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 620,
    height: 785,
    format: 'webp',
    bytes: 61186,
    checksum: '43c9231a2541e462e349b39871ab566b96b93b173b3e3a3be92054f14df2e220',
    sourceType: null,
    opticalCoverage: 0.664,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (21%).",
  },
  'dr-foots:logo': {
    path: 'src/assets/brands/dr-foots/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Dr.Foots_.png, 864×581 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 430,
    format: 'webp',
    bytes: 51544,
    checksum: '5052fa832a5fd86271d814a23e2c533bdfd3383680bf653f68ee847cdd6311e9',
    sourceType: null,
    opticalCoverage: 0.981,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ fond plein propre à la marque — rend un bloc coloré, pas une forme détourée · peu lisible sur papier (45%).",
  },
  'dr-pepper:logo': {
    path: 'src/assets/brands/dr-pepper/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Dr.Pepper.png, 642×377 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 376,
    format: 'webp',
    bytes: 45910,
    checksum: 'a97a067f1ac8787f34cd112ea68bacf95375c063e31b5dfde2cc51bb60bbaf95',
    sourceType: null,
    opticalCoverage: 0.754,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (57%).",
  },
  'dubbelfrisss:logo': {
    path: 'src/assets/brands/dubbelfrisss/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Dubbel-Frisss.png, 434×590 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 434,
    height: 590,
    format: 'webp',
    bytes: 25550,
    checksum: 'ac06d9c1851d9d0ca7a1233c8575bd11fea4ee982d958128edcd8a4918d031d9',
    sourceType: null,
    opticalCoverage: 0.503,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (42%).",
  },
  'evian:logo': {
    path: 'src/assets/brands/evian/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Evian.png, 864×476 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 353,
    format: 'webp',
    bytes: 36056,
    checksum: 'a7d97bad2a19ad4786b0f04977875eee7efbf9590abce36c703828c24a63659e',
    sourceType: null,
    opticalCoverage: 0.329,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit.",
  },
  'fanta:logo': {
    path: 'src/assets/brands/fanta/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Fanta.png, 864×663 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 491,
    format: 'webp',
    bytes: 35046,
    checksum: '919fead12e4bc932cf75e4f14a90fcddf9f946453dd2d096d73f835b0891daf6',
    sourceType: null,
    opticalCoverage: 0.722,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (52% des pixels ≥3:1) · peu lisible sur papier (51%).",
  },
  'feel-so-good:logo': {
    path: 'src/assets/brands/feel-so-good/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-Feel-So-Good.png, 864×236 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 175,
    format: 'webp',
    bytes: 13114,
    checksum: 'd8a314f20f07db2524a0894cd5c9ef0c68d44e53633659ae3bbdea24f6cfba31',
    sourceType: null,
    opticalCoverage: 1,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ fond plein propre à la marque — rend un bloc coloré, pas une forme détourée · peu lisible sur encre (43% des pixels ≥3:1) · très horizontal (ratio 3.66).",
  },
  'fernandes:logo': {
    path: 'src/assets/brands/fernandes/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Fernandes.png, 718×493 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 439,
    format: 'webp',
    bytes: 33878,
    checksum: 'db621a4f180df391597b64d57de84a58b8eff05fdd094086d0fb9fcf35d0ff50',
    sourceType: null,
    opticalCoverage: 0.553,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (36%).",
  },
  'freego:logo': {
    path: 'src/assets/brands/freego/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-Freego.png, 786×488 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 397,
    format: 'webp',
    bytes: 118218,
    checksum: 'a4cbd506ff1412782c63201426f00ec8b18b3e7efafe272555758f6cb846dab0',
    sourceType: null,
    opticalCoverage: 0.318,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (34% des pixels ≥3:1).",
  },
  'grace:logo': {
    path: 'src/assets/brands/grace/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Grace.png, 864×445 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 330,
    format: 'webp',
    bytes: 44778,
    checksum: '2d43d7d61f06d922ed270f71ded6342f295e4617f080e4999998707eba8beb73',
    sourceType: null,
    opticalCoverage: 0.729,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (22%).",
  },
  'guarana-antarctica:logo': {
    path: 'src/assets/brands/guarana-antarctica/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Guarana.png, 828×833 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 644,
    format: 'webp',
    bytes: 81104,
    checksum: '952e20f91e8b0311334ce0cd59583108d4294046ea011a5ccf07c5aa40bb62d3',
    sourceType: null,
    opticalCoverage: 0.51,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit.",
  },
  'hawai:logo': {
    path: 'src/assets/brands/hawai/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-Hawai.png, 864×864 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 640,
    format: 'webp',
    bytes: 10136,
    checksum: '36d578e959bd88b80bbb7258895aab2ac3af2b3911b6566865d61bbdc31c7746',
    sourceType: null,
    opticalCoverage: 1,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ fond plein propre à la marque — rend un bloc coloré, pas une forme détourée · peu lisible sur papier (0%).",
  },
  'hawaiian-punch:logo': {
    path: 'src/assets/brands/hawaiian-punch/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Hawaiian-Punch.png, 738×446 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 387,
    format: 'webp',
    bytes: 41508,
    checksum: '3435bcbfb1b8ea0548a874f18cf36640d731581dc8e26109a065f7ce2fcbb933',
    sourceType: null,
    opticalCoverage: 0.567,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (59% des pixels ≥3:1) · peu lisible sur papier (42%).",
  },
  'hero:logo': {
    path: 'src/assets/brands/hero/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Hero.png, 864×372 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 276,
    format: 'webp',
    bytes: 38664,
    checksum: 'bff0b867044dfe55ec7f69f29e315d7f08b3cc9335009bf67f3f4a6b13e9f728',
    sourceType: null,
    opticalCoverage: 0.487,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (25% des pixels ≥3:1).",
  },
  'kizilay:logo': {
    path: 'src/assets/brands/kizilay/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-Kizilay.png, 500×780 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 500,
    height: 780,
    format: 'webp',
    bytes: 21526,
    checksum: '4b9cc2544ecf2b3574cc06c5a11b2befec13283ddc3708e3d78e74037d70cecc',
    sourceType: null,
    opticalCoverage: 0.346,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ très vertical (ratio 0.64).",
  },
  'krombacher-spezi:logo': {
    path: 'src/assets/brands/krombacher-spezi/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Krombacher-Spezi.png, 844×426 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 323,
    format: 'webp',
    bytes: 36146,
    checksum: 'cd115f232c92b5999fcff10c97d5f59d26dde236afdfd2271b29a8de67c28eaf',
    sourceType: null,
    opticalCoverage: 0.411,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (35% des pixels ≥3:1).",
  },
  'lacroix:logo': {
    path: 'src/assets/brands/lacroix/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (La-Croix.png, 665×322 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 310,
    format: 'webp',
    bytes: 64688,
    checksum: '909d550d103a27581c82047fd4e4efc7b3f94116a07a74ee65ecb1bae60186dd',
    sourceType: null,
    opticalCoverage: 0.274,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (49% des pixels ≥3:1).",
  },
  'maaza:logo': {
    path: 'src/assets/brands/maaza/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-Maaza.png, 830×266 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 205,
    format: 'webp',
    bytes: 35292,
    checksum: '76c6764f7d386caa069f96030578fae32d5e505957d2d7a91d1d02f12a0c7b95',
    sourceType: null,
    opticalCoverage: 0.568,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ très horizontal (ratio 3.12).",
  },
  'mentos:logo': {
    path: 'src/assets/brands/mentos/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Mentos.png, 655×141 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 138,
    format: 'webp',
    bytes: 29942,
    checksum: '02a801aa8d462d6004602e2d575571d066938f7c85eb4957a63350b4b6c25375',
    sourceType: null,
    opticalCoverage: 0.617,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (47% des pixels ≥3:1) · très horizontal (ratio 4.65).",
  },
  'mirinda:logo': {
    path: 'src/assets/brands/mirinda/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Mirinda.png, 473×494 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 473,
    height: 494,
    format: 'webp',
    bytes: 49050,
    checksum: '207391ed28979176b25d98b30fa30ddf9bf5a7ebc24a82a115f8348b35cd623d',
    sourceType: null,
    opticalCoverage: 0.615,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (27%).",
  },
  'monster-energy:logo': {
    path: 'src/assets/brands/monster-energy/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Monster.png, 858×308 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 230,
    format: 'webp',
    bytes: 43910,
    checksum: '549796e4180c1a0271195911e29a79e45502d7a94cf96482c64b0615f20193a8',
    sourceType: null,
    opticalCoverage: 0.294,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (58% des pixels ≥3:1) · peu lisible sur papier (47%) · très horizontal (ratio 2.79).",
  },
  'mountain-dew:logo': {
    path: 'src/assets/brands/mountain-dew/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Mountain-Dew.png, 863×597 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 443,
    format: 'webp',
    bytes: 47780,
    checksum: '11ae51239dc3691c628f96d3391671b970c733de7d4b27f80e773f5e618a869a',
    sourceType: null,
    opticalCoverage: 0.35,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (55%).",
  },
  'o2life:logo': {
    path: 'src/assets/brands/o2life/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-O2Life.png, 864×864 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 640,
    format: 'webp',
    bytes: 10270,
    checksum: '00312d771659abc0ae70b15fa7dcccc933585afccd83ff8a512fa09c4600e981',
    sourceType: null,
    opticalCoverage: 1,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ fond plein propre à la marque — rend un bloc coloré, pas une forme détourée.",
  },
  'oasis:logo': {
    path: 'src/assets/brands/oasis/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Oasis.png, 488×381 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 488,
    height: 381,
    format: 'webp',
    bytes: 29994,
    checksum: '2037c9d524a4ed3fa522645cc39bb8e9cfe1f3a964aaa90e470fdf0e039ad63e',
    sourceType: null,
    opticalCoverage: 0.591,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (59%).",
  },
  'okf:logo': {
    path: 'src/assets/brands/okf/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-OKF.png, 854×319 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 239,
    format: 'webp',
    bytes: 29596,
    checksum: 'aa925e2c1f83b14c05458bd32a736f164cdcf502acd0b8a771b3cb32caa2cedd',
    sourceType: null,
    opticalCoverage: 0.801,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ très horizontal (ratio 2.68).",
  },
  'orangina:logo': {
    path: 'src/assets/brands/orangina/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Orangina.png, 864×374 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 277,
    format: 'webp',
    bytes: 33970,
    checksum: '62e59943034233ea41ee90038b821eb78202dc3cc42a7f8288001e1ad43bf377',
    sourceType: null,
    opticalCoverage: 0.708,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (39%).",
  },
  'pariba:logo': {
    path: 'src/assets/brands/pariba/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Pariba.png, 864×466 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 345,
    format: 'webp',
    bytes: 59390,
    checksum: 'e9089b6b1a2d62f214b4985dc9cb3411d934273e5d9bfda9216296be9943e61c',
    sourceType: null,
    opticalCoverage: 0.383,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (33% des pixels ≥3:1).",
  },
  'pepsi:logo': {
    path: 'src/assets/brands/pepsi/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Pepsi.png, 797×798 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 641,
    format: 'webp',
    bytes: 34568,
    checksum: '9a54571ba35c1e3c08341b39c4bdb9011ee8f4f8336e19fec187e3d115f06633',
    sourceType: null,
    opticalCoverage: 0.784,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit.",
  },
  'poms:logo': {
    path: 'src/assets/brands/poms/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-Poms.png, 577×578 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 577,
    height: 578,
    format: 'webp',
    bytes: 25800,
    checksum: 'ca0ce19445f279cacdaf2bfec1cd92075f37b0b26537c9afaf4e5f3304a59f7a',
    sourceType: null,
    opticalCoverage: 0.789,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (21% des pixels ≥3:1).",
  },
  'powerade:logo': {
    path: 'src/assets/brands/powerade/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Powerade.png, 807×268 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 213,
    format: 'webp',
    bytes: 16448,
    checksum: '8b2b6c70c18dff69179386aca42f19079232ab603c51ec9cdf1222550c8159e6',
    sourceType: null,
    opticalCoverage: 0.533,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (18% des pixels ≥3:1) · très horizontal (ratio 3.01).",
  },
  'rauch:logo': {
    path: 'src/assets/brands/rauch/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-Rauch.png, 807×337 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 267,
    format: 'webp',
    bytes: 27784,
    checksum: '43aaf0b7ac6ef26f7165b92036a0813dffe2be786552e91d97c40e98498bf671',
    sourceType: null,
    opticalCoverage: 0.789,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (29%).",
  },
  'red-bull:logo': {
    path: 'src/assets/brands/red-bull/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Red-Bull.png, 864×490 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 363,
    format: 'webp',
    bytes: 37338,
    checksum: 'b96f5c6ad290e79b7e6e264247ff70997fe049ea9bbdf93e2a29602b65cfd894',
    sourceType: null,
    opticalCoverage: 0.459,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit.",
  },
  'rivella:logo': {
    path: 'src/assets/brands/rivella/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Rivella.png, 634×475 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 634,
    height: 475,
    format: 'webp',
    bytes: 19922,
    checksum: '7208279a785827a038e56edb00a3632a9d3b3d30ea6dfa72996d6ca41594294d',
    sourceType: null,
    opticalCoverage: 0.751,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit.",
  },
  'royal-club:logo': {
    path: 'src/assets/brands/royal-club/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Royal-Club.png, 848×843 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 636,
    format: 'webp',
    bytes: 42472,
    checksum: 'fc014aab59010553b35b59dabff0fb3ad9096e3c94fcb528d405a325c084dd1c',
    sourceType: null,
    opticalCoverage: 0.788,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (34% des pixels ≥3:1).",
  },
  'schweppes:logo': {
    path: 'src/assets/brands/schweppes/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Schweppes.png, 864×751 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 556,
    format: 'webp',
    bytes: 38284,
    checksum: 'eacef33015339d1b746f0f96cb6ba7eed8ade2403d71cd7ec95a44080b771f5e',
    sourceType: null,
    opticalCoverage: 0.488,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (29%).",
  },
  'sisi:logo': {
    path: 'src/assets/brands/sisi/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Sisi.png, 860×585 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 435,
    format: 'webp',
    bytes: 35160,
    checksum: 'b83dd3b6c15bf0b1f18e873fca4886a16337067c456576543575b036b22014cc',
    sourceType: null,
    opticalCoverage: 0.665,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (52% des pixels ≥3:1) · peu lisible sur papier (51%).",
  },
  'slammers-energy:logo': {
    path: 'src/assets/brands/slammers-energy/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Slammers.png, 578×190 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 578,
    height: 190,
    format: 'webp',
    bytes: 16668,
    checksum: 'ad1f748e1ca6de55481e104b96026d2eddb2264f284c24e82c59c6970451c282',
    sourceType: null,
    opticalCoverage: 0.284,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (35% des pixels ≥3:1) · très horizontal (ratio 3.04).",
  },
  'sourcy:logo': {
    path: 'src/assets/brands/sourcy/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Sourcy.png, 864×397 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 294,
    format: 'webp',
    bytes: 35270,
    checksum: '1c89fae1de80fdd903ab1aed52609d0f22c20759296d2764d468bd2c5f5dae88',
    sourceType: null,
    opticalCoverage: 0.261,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (33% des pixels ≥3:1).",
  },
  'spa:logo': {
    path: 'src/assets/brands/spa/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (SPA.png, 862×597 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 443,
    format: 'webp',
    bytes: 54304,
    checksum: 'c1964c143bf8b9030dfdda50610142afaafc27b1bffb746722a39461821e4100',
    sourceType: null,
    opticalCoverage: 0.428,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (45% des pixels ≥3:1) · peu lisible sur papier (56%).",
  },
  'sprite:logo': {
    path: 'src/assets/brands/sprite/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Sprite.png, 862×621 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 461,
    format: 'webp',
    bytes: 26788,
    checksum: '854cbe192c34294f86963f3967b45546841ca2bd41e07f3ffcab045b9ccfbdc3',
    sourceType: null,
    opticalCoverage: 0.278,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit.",
  },
  'squid-game:logo': {
    path: 'src/assets/brands/squid-game/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-Squid-Game.png, 864×448 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 332,
    format: 'webp',
    bytes: 22816,
    checksum: 'eaa90402e8d1bfdbb73997e366c05b4f0401f9fc07edd7fddcab0aecd4fe6c18',
    sourceType: null,
    opticalCoverage: 0.238,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (29% des pixels ≥3:1).",
  },
  'sunkist:logo': {
    path: 'src/assets/brands/sunkist/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Sunkist.png, 702×686 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 625,
    format: 'webp',
    bytes: 72626,
    checksum: 'b9346447239654812950d7911eb51d40581439645e195745c60e8aaf2afc25fe',
    sourceType: null,
    opticalCoverage: 0.604,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (30%).",
  },
  'taksi:logo': {
    path: 'src/assets/brands/taksi/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Taksi.png, 320×646 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 320,
    height: 646,
    format: 'webp',
    bytes: 14542,
    checksum: '269fce18368b80e1739d61d75fb01a9a20fe2676069371c992643a7689156c81',
    sourceType: null,
    opticalCoverage: 0.596,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (27%) · très vertical (ratio 0.5).",
  },
  'toxic-waste:logo': {
    path: 'src/assets/brands/toxic-waste/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-Toxic-Waste.png, 765×691 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 578,
    format: 'webp',
    bytes: 79772,
    checksum: '16535834b0bc86ff19754085ceb0bdae2e3196dec1c9a82a0b20b3a93eb013c5',
    sourceType: null,
    opticalCoverage: 0.474,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (38%).",
  },
  'tropical-aloe-vera:logo': {
    path: 'src/assets/brands/tropical-aloe-vera/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Aloe-Vera.png, 858×309 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 230,
    format: 'webp',
    bytes: 32104,
    checksum: 'e19b862ab84352c311f8d5741bb0311e963282227eecf273b1e85c5b3c594e76',
    sourceType: null,
    opticalCoverage: 0.572,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (44% des pixels ≥3:1) · peu lisible sur papier (59%) · très horizontal (ratio 2.78).",
  },
  'vitamin-well:logo': {
    path: 'src/assets/brands/vitamin-well/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Vitamin-Well.png, 844×338 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 256,
    format: 'webp',
    bytes: 25684,
    checksum: 'b96ef19fee7140f7b4e16b1f2ec421f2e19d6fec6bd8e4cecb20a2a7c95cb463',
    sourceType: null,
    opticalCoverage: 0.444,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit.",
  },
  'yummy-miami-soda:logo': {
    path: 'src/assets/brands/yummy-miami-soda/logo.webp',
    status: 'requires_validation',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Logo-Yummy-Miami.png, 859×859 sur fond blanc)',
    authorization: { status: 'referential-use', evidence: 'Fourni par le client · usage référentiel de distributeur (D2) · droits de production NON confirmés' },
    width: 640,
    height: 640,
    format: 'webp',
    bytes: 30742,
    checksum: '3177c2f48061ce33506b1197abb6326bbe6a9ad26f2e20dfad7b0ea10729c597',
    sourceType: null,
    opticalCoverage: 0.784,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (5%).",
  },
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
/**
 * Identité Ivan Arsenov — LIVRÉE le 2026-08-17.
 *
 * Trois usages, deux tracés chacun. Le tracé sombre sert les surfaces claires,
 * le tracé clair les surfaces encre : ce sont DEUX dessins distincts fournis
 * par le client, pas une inversion calculée.
 *
 * Rien n'a été redessiné. Le monogramme et le lock-up sont les fichiers
 * fournis, ré-encodés pour le web. Le wordmark est un RECADRAGE STRICT du
 * lock-up (bande 1123-1304 du fichier 2400x1452), isolé pour permettre la
 * composition horizontale du header — la seule disposition qui garde le nom
 * lisible sans agrandir le header.
 *
 * Format matriciel assumé : le tracé est un sérif à empattements fins avec une
 * courbe traversant le monogramme. Une vectorisation automatique en abîmerait
 * les déliés, et une approximation présentée comme le logo officiel serait une
 * contrefaçon de la marque du client. WebP haute résolution à transparence
 * réelle, tant que le vectoriel source n'est pas fourni.
 */
const IDENTITY_FILES: Array<{
  usage: AssetUsage;
  label: string;
  note: string;
  files: { dark: string; light: string };
  size: { w: number; h: number };
  bytes: { dark: number; light: number };
  checksum: { dark: string; light: string };
}> = [
  {
    usage: 'monogram',
    label: 'Ivan Arsenov — monogramme IA',
    note: 'Monogramme seul. Marque du header en dessous de 1024px, où la largeur manque.',
    files: { dark: 'src/assets/identity/monogram-dark.webp', light: 'src/assets/identity/monogram-light.webp' },
    size: { w: 600, h: 491 },
    bytes: { dark: 30776, light: 45774 },
    checksum: { dark: '6fd8ec5ce998ae9877b07ae8f201645d648de92ccc09c14dfd1d03deed94a59c', light: '10bc1b1b6e258081c638b40c31a22a8471a2efd65f1530901cc6a4c343974469' },
  },
  {
    usage: 'lockup',
    label: 'Ivan Arsenov — lock-up complet',
    note: 'Monogramme + wordmark + filet, composition d’origine. Sert le footer.',
    files: { dark: 'src/assets/identity/lockup-dark.webp', light: 'src/assets/identity/lockup-light.webp' },
    size: { w: 1200, h: 726 },
    bytes: { dark: 60106, light: 96290 },
    checksum: { dark: '39442714f617339b922f09044b1011021aa9163413b697eb9a44c803115a113b', light: '1a91b040fb7d6ad353cc7748a7efa1c1bb3833bcb795e0e555cc819ff74ab17d' },
  },
  {
    usage: 'wordmark',
    label: 'Ivan Arsenov — wordmark',
    note: 'Recadrage strict du lock-up. Accompagne le monogramme dans le header à partir de 1024px.',
    files: { dark: 'src/assets/identity/wordmark-dark.webp', light: 'src/assets/identity/wordmark-light.webp' },
    size: { w: 900, h: 68 },
    bytes: { dark: 16498, light: 27524 },
    checksum: { dark: '1c97351d13e6b7636feab20e6e7c9e7afb30f732b33fe5970f6667340800730f', light: '3316f596783b2c79d8ce1c7bdc218feccab55298dd04d661155bb209bcf5b25c' },
  },
];

function identityAssets(): AssetRecord[] {
  return IDENTITY_FILES.map(({ usage, label, note, files, size, bytes, checksum }) => ({
    id: `ivan-arsenov:${usage}`,
    brandSlug: 'ivan-arsenov',
    brandLabel: label,
    usage,
    priority: 'identity' as const,
    /* Le tracé clair est la référence du registre : le site est majoritairement
       sur encre. Le tracé sombre est résolu par le composant. */
    path: files.light,
    /* `validated` : c'est l'identité PROPRE du client, fournie par lui pour ce
       site. Contrairement aux marques tierces du catalogue, aucun titulaire
       extérieur n'a de droit à confirmer. */
    status: 'validated' as const,
    source: 'Client — archive « ivanarsenov brand assets.zip », 2026-08-17',
    authorization: { status: 'granted' as const, evidence: 'Identité propre du client' },
    width: size.w,
    height: size.h,
    format: 'webp' as const,
    bytes: bytes.light,
    checksum: checksum.light,
    sourceType: null,
    opticalCoverage: null,
    legalNote: note,
  }));
}

/** Chemins des deux tracés, pour le composant qui choisit selon la surface. */
export const IDENTITY_TONES: Record<string, { dark: string; light: string }> =
  Object.fromEntries(IDENTITY_FILES.map((f) => [f.usage, f.files]));

export const STANDALONE_ASSETS: AssetRecord[] = [
  ...identityAssets(),
  {
    id: 'ivan-arsenov:favicon',
    brandSlug: 'ivan-arsenov',
    brandLabel: 'Ivan Arsenov — favicon',
    usage: 'favicon',
    priority: 'identity',
    path: 'public/favicon.ico',
    /*
     * Monogramme IA OFFICIEL. Le placeholder composé en interne au TR-001 est
     * supprimé du dépôt — le laisser en place, même inutilisé, exposerait un
     * jour une identité qui n'est pas celle du client.
     *
     * L'ICO embarque trois rendus distincts (16, 32, 48px) issus des fichiers
     * fournis, chacun matricé à sa taille propre : les empattements du sérif
     * survivent mieux ainsi qu'en laissant le navigateur réduire une seule
     * image. Aucune simplification graphique n'a été appliquée.
     */
    status: 'validated',
    source: 'Client — archive « ivanarsenov brand assets.zip », 2026-08-17',
    authorization: { status: 'granted', evidence: 'Identité propre du client' },
    width: 48,
    height: 48,
    format: 'ico',
    bytes: 2654,
    checksum: 'cb158947acad151a244443d7f309e813590d33f2670f2c6f80939df7b68ea3c2',
    sourceType: null,
    opticalCoverage: null,
    legalNote: 'Monogramme officiel. 16/32/48px embarqués, plus 512px et 180px Apple.',
  },
];
