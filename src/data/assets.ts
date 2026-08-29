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
 *   · un visuel GÉNÉRÉ reste marqué `sourceType: 'generated'` à vie — publié
 *     ou non, la donnée ne ment jamais sur l'origine du fichier.
 *
 * ⚠️ DÉCISION DU PROPRIÉTAIRE — 2026-08-29.
 * Ivan Arsenov déclare détenir les autorisations auprès des fournisseurs et
 * des marques. Les 28 visuels de marque passent donc `validated` /
 * `granted` et sont publiés en production. Les documents n'ont PAS été
 * transmis au dépôt : `evidence` porte la déclaration, sa date et son auteur,
 * pas une preuve. À archiver dès réception.
 *
 * La nuance qui subsiste, et qui est inscrite sur chacun des quatorze visuels
 * produits : l'autorisation porte sur l'USAGE DES MARQUES. Elle ne transforme
 * pas un fichier généré par un modèle en photographie officielle du produit.
 * Ces quatorze fichiers restent à remplacer par les packshots presse.
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
 * S4 DISCOVERY — SECTION SUPPRIMÉE le 2026-08-24.
 *
 * La séquence comptait huit spécimens : Chupa Chups, Guaraná Antarctica,
 * Mountain Dew, Hawai, Fernandes, Mentos, Bundaberg, Yummy Miami Soda. La
 * réduction du catalogue à 14 articles en a retiré SEPT ; la famille
 * `international` qui portait le propos éditorial de la section a disparu avec
 * eux. Il ne restait que Mountain Dew, déjà présent en Featured.
 *
 * La liste reste déclarée et VIDE plutôt que supprimée : `usagesFor()` s'en
 * sert pour accorder l'usage `packshot`, et TR-026 a montré ce que coûte une
 * liste absente — six produits sans aucune entrée au registre, pas même en
 * `missing`, donc invisibles à la QA. Une liste vide se relit ; une liste
 * effacée se réinvente.
 *
 * Pour réactiver S4, restaurer `Discovery.astro` et `Home.astro` depuis
 * `backup/catalogue-62-brands-full` en même temps que les marques.
 */
export const DISCOVERY_BRANDS = [] as const satisfies readonly string[];

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
   * ── HERO « THE STAGE » — six packshots GÉNÉRÉS ────────────────────────
   *
   * Extraits en TR-024A d'une planche composite produite par un modèle. Ils
   * ont d'abord servi à juger la composition du hero avec de vrais volumes
   * plutôt qu'avec des replis typographiques.
   *
   * Publiés en production depuis le 2026-08-29, sur décision du propriétaire
   * (voir l'en-tête de ce fichier). Ils restent `sourceType: 'generated'` :
   * ce sont des images fabriquées, pas des photographies du produit.
   */
  'coca-cola:hero': {
    path: 'src/assets/brands/coca-cola/hero.png',
    status: 'validated',
    sourceType: 'generated',
    source: 'Extraction TR-024A depuis une planche composite GÉNÉRÉE (archive « ChatGPT Image 17 août 2026 »)',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
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
    status: 'validated',
    sourceType: 'generated',
    source: 'Extraction TR-024A depuis une planche composite GÉNÉRÉE (archive « ChatGPT Image 17 août 2026 »)',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
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
    status: 'validated',
    sourceType: 'generated',
    source: 'Extraction TR-024A depuis une planche composite GÉNÉRÉE (archive « ChatGPT Image 17 août 2026 »)',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
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
    status: 'validated',
    sourceType: 'generated',
    source: 'Extraction TR-024A depuis une planche composite GÉNÉRÉE (archive « ChatGPT Image 17 août 2026 »)',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
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
    status: 'validated',
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
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
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
    status: 'validated',
    sourceType: 'generated',
    source: 'Extraction TR-024A depuis une planche composite GÉNÉRÉE (archive « ChatGPT Image 17 août 2026 »)',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
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

  'orangina:packshot': {
    path: 'src/assets/brands/orangina/packshot.png',
    status: 'validated',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
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
  'capri-sun:packshot': {
    path: 'src/assets/brands/capri-sun/packshot.png',
    status: 'validated',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
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
    status: 'validated',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
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
  'mountain-dew:packshot': {
    path: 'src/assets/brands/mountain-dew/packshot.png',
    status: 'validated',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
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
    status: 'validated',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
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
    status: 'validated',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 17 août 2026, 20_25_16 » (TR-025). ' +
      'Recadrage strict sur la boîte alpha, sans redimensionnement ni retouche. ' +
      'Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
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

  /*
   * ── TR-029 — LES DEUX DERNIERS TROUS DE LA PISTE ──────────────────────
   *
   * Livrés le 2026-08-25, présentés comme « les packshots officiels Mirinda
   * et Lipton Ice Tea ». LE FICHIER DIT AUTRE CHOSE, et c'est le fichier qui
   * fait foi : son manifeste C2PA signé porte
   *   c2pa.created · softwareAgent = gpt-image 2.0 ·
   *   digitalSourceType = trainedAlgorithmicMedia ·
   *   claim_generator_info = « OpenAI Media Service API ».
   * Ils sont donc enregistrés `sourceType: 'generated'`, comme les vingt-deux
   * précédents, et ne sont PAS marqués officiels.
   *
   * EXTRACTION — mesurée avant d'être décidée :
   *  · la planche n'a AUCUN canal alpha ; son damier de transparence est
   *    PEINT, à deux tons proches (244 / 254) et de période irrégulière ;
   *  · une diffusion depuis les bords sépare néanmoins fond et produits sans
   *    la moindre fuite dans leurs plages blanches — vérifié à cinq seuils,
   *    de 235 à 252 : le bandeau blanc de Mirinda, le texte « LEMON ICE TEA »
   *    et les lettres du logo restent enfermés par des contours plus sombres ;
   *  · aucun halo : la luminance du fond est PLATE autour des objets
   *    (248,3 à 1 px, 248,5 à 110 px — moins d'un niveau d'écart) ;
   *  · une OMBRE PORTÉE cuite débordait latéralement des deux bases. Elle a
   *    été retirée par SOUSTRACTION SEULE, jamais par retouche : diffusion
   *    depuis l'extérieur du bas de la vignette, sur les seuls pixels à la
   *    fois désaturés et clairs (sat < 0,18 · lum > 135). La marge est large
   *    — ombre mesurée à 0,012-0,119 de saturation contre 0,911-0,949 pour
   *    les bases. 1 825 px retirés sur Mirinda, 3 256 sur Lipton. Les bases
   *    (jonc métallique de la canette, pieds PET de la bouteille) sont
   *    intactes, contrôlées à l'œil sur encre.
   *
   * Aucun pixel de produit n'a été reconstruit, repeint ni interpolé. Si ça
   * avait été nécessaire, la règle est le REJET.
   */
  'mirinda:packshot': {
    path: 'src/assets/brands/mirinda/packshot.png',
    status: 'validated',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 25 août 2026, 10_34_39 » (TR-029). ' +
      'Détourage par diffusion depuis les bords, retrait soustractif de l’ombre ' +
      'portée, recadrage strict sur la boîte alpha. Aucun redimensionnement, ' +
      'aucune retouche. Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
    width: 359,
    height: 717,
    format: 'png',
    bytes: 687708,
    checksum: '3f6d68bdcbb7266b7dc1be309af5110cf5033c9e8a7904d99583860d73d863ff',
    opticalCoverage: 0.964,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire — livré comme « officiel », ' +
      'contredit par le manifeste C2PA du fichier. Préproduction uniquement. ' +
      'Résolution : 100 % du besoin DPR 2 et 100 % du besoin DPR 3 en Featured. ' +
      'Ne ferme pas B2 : la production exige un fichier presse ou une autorisation écrite.',
  },
  'lipton-ice-tea:packshot': {
    path: 'src/assets/brands/lipton-ice-tea/packshot.png',
    status: 'validated',
    sourceType: 'generated',
    source:
      'Planche composite GÉNÉRÉE « ChatGPT Image 25 août 2026, 10_34_39 » (TR-029). ' +
      'Détourage par diffusion depuis les bords, retrait soustractif de l’ombre ' +
      'portée, recadrage strict sur la boîte alpha. Aucun redimensionnement, ' +
      'aucune retouche. Manifeste C2PA du fichier : c2pa.created · gpt-image 2.0 · ' +
      'digitalSourceType = trainedAlgorithmicMedia.',
    authorization: { status: 'granted', evidence: 'Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. ⚠ Cette autorisation porte sur l’USAGE DES MARQUES ; elle ne transforme pas un fichier GÉNÉRÉ en photographie officielle du produit. Documents non transmis au dépôt : à archiver.' },
    width: 303,
    height: 969,
    format: 'png',
    bytes: 774345,
    checksum: '6f865f1f3a6f694e41c5561bc108acf01fc58fbdb3706475fd245130b9bc4dd3',
    opticalCoverage: 0.845,
    legalNote:
      'Asset GÉNÉRÉ, non fourni par le titulaire — livré comme « officiel », ' +
      'contredit par le manifeste C2PA du fichier. Préproduction uniquement. ' +
      'Résolution : 100 % du besoin DPR 2 et 100 % du besoin DPR 3 en Featured. ' +
      'Ne ferme pas B2 : la production exige un fichier presse ou une autorisation écrite. ' +
      'La marque n’a toujours AUCUN LOGO : le logo Lipton de la planche livrée a ' +
      'été REFUSÉ (voir doc/tr-029-mirinda-lipton-packshots.md §4) ; le logo réellement intégré vient d’une seconde livraison vectorielle, voir doc/tr-030-logo-lipton.md.',
  },

  /*
   * TR-026B — PACKSHOTS S4 DISCOVERY, six marques.
   *
   * Extraits par recadrage strict sur la boîte alpha d'une planche composite
   * GÉNÉRÉE, sans redimensionnement ni retouche. Deux planches ont été livrées,
   * portant deux jeux de contenants différents pour les mêmes six marques ;
   * celle-ci a été retenue sur un critère mesurable — 722 à 980 px de hauteur
   * par produit contre 562 à 829 pour l'autre, soit 15 à 30 % de définition en
   * plus sur un besoin S4 mesuré à 499 px CSS.
   *
   * Le catalogue n'établit AUCUN type de contenant pour ces six marques. Le
   * choix de planche est donc une décision de préproduction sur la définition,
   * pas une affirmation sur le conditionnement réel des produits.
   *
   * Régime identique aux seize précédents, sans exception : `generated`,
   * `requires_validation`, autorisation `unknown`, préproduction UNIQUEMENT.
   * Aucun ne ferme B2.
   *
   * RÉSOLUTION — besoin S4 mesuré dans le navigateur (TR-026) : 499 px CSS au
   * maximum, atteint à 430 px de fenêtre, soit 998 px à DPR 2 et 1 497 px à
   * DPR 3. Les six couvrent DPR 1 de 145 à 196 %, DPR 2 de 72 à 98 %. Aucun
   * agrandissement n'a été appliqué ; la note de chaque entrée porte le chiffre.
   */

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
  '7up:logo': {
    path: 'src/assets/brands/7up/logo.webp',
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (7-up.png, 345×415 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
    width: 345,
    height: 415,
    format: 'webp',
    bytes: 23430,
    checksum: 'de0d54a69d4c5b7a7bedc4bba1ae163b15119e5c24ebfd165332b150ca6651aa',
    sourceType: null,
    opticalCoverage: 0.56,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (37%).",
  },
  'capri-sun:logo': {
    path: 'src/assets/brands/capri-sun/logo.webp',
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Capri-Sun.png, 716×236 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
    width: 640,
    height: 211,
    format: 'webp',
    bytes: 38798,
    checksum: '1d887bdf07acd51b9c242e9e2a8ea5377380d4b97592aeb721beca28715ce787',
    sourceType: null,
    opticalCoverage: 0.452,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (39%) · très horizontal (ratio 3.03).",
  },
  'coca-cola:logo': {
    path: 'src/assets/brands/coca-cola/logo.webp',
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Coca-Cola.png, 620×203 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
    width: 620,
    height: 203,
    format: 'webp',
    bytes: 29842,
    checksum: '28d763db10bd7c5448f66860aad62e43d7f062dce637a21346c8da34a2840d78',
    sourceType: null,
    opticalCoverage: 0.416,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ très horizontal (ratio 3.05).",
  },
  'dr-pepper:logo': {
    path: 'src/assets/brands/dr-pepper/logo.webp',
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Dr.Pepper.png, 642×377 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
    width: 640,
    height: 376,
    format: 'webp',
    bytes: 45910,
    checksum: 'a97a067f1ac8787f34cd112ea68bacf95375c063e31b5dfde2cc51bb60bbaf95',
    sourceType: null,
    opticalCoverage: 0.754,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (57%).",
  },
  'fanta:logo': {
    path: 'src/assets/brands/fanta/logo.webp',
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Fanta.png, 864×663 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
    width: 640,
    height: 491,
    format: 'webp',
    bytes: 35046,
    checksum: '919fead12e4bc932cf75e4f14a90fcddf9f946453dd2d096d73f835b0891daf6',
    sourceType: null,
    opticalCoverage: 0.722,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur encre (52% des pixels ≥3:1) · peu lisible sur papier (51%).",
  },
  /*
   * ── TR-030 — LE LOGO LIPTON, DEUXIÈME LIVRAISON ───────────────────────
   *
   * La première tentative, le 2026-08-25, était un logo GÉNÉRÉ inclus dans la
   * planche de packshots : REFUSÉE (TR-029 §4), parce que redessiner une
   * marque figurative est précisément ce que la règle interdit.
   *
   * Cette livraison-ci est d'une autre nature, et c'est mesurable :
   *  · SVG VECTORIEL PUR — 9 <path>, 6 519 octets. Aucun <image>, aucune URI
   *    `data:`, aucun raster embarqué : rien n'a été décalqué ;
   *  · aucun <text> — le lettrage « Lipton » est en tracés convertis, ce que
   *    fait un kit de marque et pas un export approximatif ;
   *  · trois aplats exacts — #FCDA00, #BE0D30, blanc ;
   *  · le ® est présent et correctement posé ;
   *  · aucun <script>, aucun <style>, aucune référence externe.
   *
   * CE QUE JE NE PEUX PAS ÉTABLIR : un SVG ne porte pas de manifeste C2PA, et
   * ce fichier n'a AUCUNE métadonnée de générateur. Sa provenance ne se
   * démontre donc pas depuis le fichier, contrairement à la planche PNG dont
   * le manifeste signé disait « gpt-image ». Ce qui est vérifiable, c'est que
   * rien dedans n'indique une fabrication, et que ses caractéristiques sont
   * celles d'un fichier de marque authentique.
   * L'AUTORISATION reste non confirmée : `referential-use`, comme les treize
   * autres logos du catalogue. Le blocage B11 n'est pas fermé.
   *
   * FORMAT — rastérisé en WebP 640 px, comme les treize autres. Le SVG n'est
   * PAS conservé sous `src/assets/` pour deux raisons vérifiées : le glob de
   * `ProductObject` ne couvre pas `.svg`, et surtout `isImageFile()` de
   * `asset-governance.mjs` non plus — un SVG de marque tierce échapperait donc
   * à l'élagage de production et partirait chez l'hébergeur. Master vectoriel :
   * SHA-256 bb8033a6797a4def7534802381f471e1bad3a69746cfb91804a1186bb136fff5.
   */
  'lipton-ice-tea:logo': {
    path: 'src/assets/brands/lipton-ice-tea/logo.webp',
    status: 'validated',
    source:
      'Client — archive « logo.zip », 2026-08-25 (logo.svg, vectoriel pur, 84×85, ' +
      '9 tracés, SHA-256 bb8033a6…b136fff5). Rastérisé à 640 px, sans retouche.',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
    width: 640,
    height: 648,
    format: 'webp',
    bytes: 31444,
    checksum: '4f8afbee11cc9d61800df15c4914397fa81bf5e86269b7b19df0283be86fe9b7',
    sourceType: null,
    opticalCoverage: 0.766,
    legalNote: "Logo de marque fourni par le client, rastérisé depuis un SVG vectoriel pur. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (26% des pixels ≥3:1) — l’identité Lipton est majoritairement jaune et blanche, seul le bandeau rouge passe le seuil sur surface claire. Lisible sur encre (98%).",
  },
  'mirinda:logo': {
    path: 'src/assets/brands/mirinda/logo.webp',
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Mirinda.png, 473×494 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
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
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Monster.png, 858×308 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
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
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Mountain-Dew.png, 863×597 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
    width: 640,
    height: 443,
    format: 'webp',
    bytes: 47780,
    checksum: '11ae51239dc3691c628f96d3391671b970c733de7d4b27f80e773f5e618a869a',
    sourceType: null,
    opticalCoverage: 0.35,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (55%).",
  },
  'orangina:logo': {
    path: 'src/assets/brands/orangina/logo.webp',
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Orangina.png, 864×374 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
    width: 640,
    height: 277,
    format: 'webp',
    bytes: 33970,
    checksum: '62e59943034233ea41ee90038b821eb78202dc3cc42a7f8288001e1ad43bf377',
    sourceType: null,
    opticalCoverage: 0.708,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (39%).",
  },
  'pepsi:logo': {
    path: 'src/assets/brands/pepsi/logo.webp',
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Pepsi.png, 797×798 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
    width: 640,
    height: 641,
    format: 'webp',
    bytes: 34568,
    checksum: '9a54571ba35c1e3c08341b39c4bdb9011ee8f4f8336e19fec187e3d115f06633',
    sourceType: null,
    opticalCoverage: 0.784,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit.",
  },
  'red-bull:logo': {
    path: 'src/assets/brands/red-bull/logo.webp',
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Red-Bull.png, 864×490 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
    width: 640,
    height: 363,
    format: 'webp',
    bytes: 37338,
    checksum: 'b96f5c6ad290e79b7e6e264247ff70997fe049ea9bbdf93e2a29602b65cfd894',
    sourceType: null,
    opticalCoverage: 0.459,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit.",
  },
  'schweppes:logo': {
    path: 'src/assets/brands/schweppes/logo.webp',
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Schweppes.png, 864×751 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
    width: 640,
    height: 556,
    format: 'webp',
    bytes: 38284,
    checksum: 'eacef33015339d1b746f0f96cb6ba7eed8ade2403d71cd7ec95a44080b771f5e',
    sourceType: null,
    opticalCoverage: 0.488,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit. ⚠ peu lisible sur papier (29%).",
  },
  'sprite:logo': {
    path: 'src/assets/brands/sprite/logo.webp',
    status: 'validated',
    source: 'Client — archive « photos ivan.zip », 2026-08-16 (Sprite.png, 862×621 sur fond blanc)',
    authorization: { status: 'granted', evidence: 'Fourni par le client · usage référentiel de distributeur (D2). Autorisations déclarées par le propriétaire du site le 2026-08-29 — accords d’Ivan Arsenov avec les fournisseurs et les marques. Documents non transmis au dépôt : à archiver.' },
    width: 640,
    height: 461,
    format: 'webp',
    bytes: 26788,
    checksum: '854cbe192c34294f86963f3967b45546841ca2bd41e07f3ffcab045b9ccfbdc3',
    sourceType: null,
    opticalCoverage: 0.278,
    legalNote: "Logo de marque fourni par le client, détouré d’un fond blanc uniforme. N’EST PAS un packshot : ne peut pas alimenter le hero ni les plateaux produit.",
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
