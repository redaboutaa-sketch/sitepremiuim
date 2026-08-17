import type { AssetRecord } from '../data/assets';

/**
 * NORMALISATION OPTIQUE DES LOGOS.
 *
 * Le problème : les 60 logos livrés vont d'un ratio 0,50 (Taksi, très vertical)
 * à 4,65 (Mentos, très horizontal) — un écart de 9×. Les dimensionner à
 * largeur CSS constante donnerait à Mentos un poids visuel écrasant et
 * réduirait Taksi à un timbre-poste. Les dimensionner à hauteur constante
 * ferait l'inverse.
 *
 * La règle appliquée est donc : **égaliser la SURFACE optique**, pas une
 * dimension. Deux logos de formes très différentes occupent une aire
 * comparable dans le plateau, ce qui est ce que l'œil compare réellement.
 *
 * Deux corrections viennent ensuite :
 *
 *  1. LA COUVERTURE. Un aplat plein et un lettrage aéré de même aire n'ont pas
 *     le même poids : l'encre compte, pas la boîte englobante. Un logo dense
 *     est donc légèrement réduit, un logo aéré légèrement agrandi.
 *
 *  2. LES BORNES. Aucun logo ne dépasse sa taille « contain » — jamais
 *     d'agrandissement au-delà du cadre, jamais de déformation — et aucun ne
 *     descend sous une échelle plancher, sous laquelle il cesserait d'être
 *     identifiable.
 */

/** Rapport largeur/hauteur du plateau (`aspect-ratio: 3 / 4`). */
const PLATE_RATIO = 3 / 4;

/**
 * Aire visée, en fraction de la boîte de contenu du plateau.
 *
 * Calibrée sur les extrêmes réels du lot : à cette valeur, Mentos atteint sa
 * largeur maximale sans être bridé, et un logo carré occupe une aire
 * équivalente. Plus haut, les logos très horizontaux débordent ; plus bas,
 * l'ensemble paraît timide dans le plateau.
 */
const TARGET_AREA = 0.22;

/** Couverture de référence — la médiane du lot livré. */
const REFERENCE_COVERAGE = 0.57;

/** Un aplat plein ne descend pas plus bas, un lettrage aéré ne monte pas plus haut. */
const COVERAGE_CORRECTION = { min: 0.82, max: 1.18 } as const;

/** En deçà, un logo cesse d'être lisible dans une cellule de catalogue. */
const MIN_SCALE = 0.34;

export interface OpticalSize {
  /** Largeur rendue, en % de la largeur du plateau. */
  width: number;
  /** Hauteur rendue, en % de la HAUTEUR du plateau. */
  height: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Calcule les dimensions de rendu d'un logo dans le plateau.
 *
 * Retourne `null` si l'asset ne porte pas ses mesures : sans dimensions
 * réelles on ne peut pas normaliser, et poser une taille arbitraire serait
 * précisément le défaut que cette fonction existe pour éviter.
 */
export function opticalSize(asset: Pick<AssetRecord, 'width' | 'height' | 'opticalCoverage'>): OpticalSize | null {
  const { width, height } = asset;
  if (!width || !height) return null;

  const ratio = width / height;

  /*
   * Ajustement « contain » dans un plateau de largeur 1 et de hauteur
   * 1 / PLATE_RATIO, exprimé dans les mêmes unités que la largeur.
   */
  const boxHeight = 1 / PLATE_RATIO;
  const widthLimited = ratio >= PLATE_RATIO;
  const fitWidth = widthLimited ? 1 : boxHeight * ratio;
  const fitHeight = widthLimited ? 1 / ratio : boxHeight;

  const fitArea = fitWidth * fitHeight;

  // Correction de couverture : l'encre compte, pas la boîte englobante.
  const coverage = asset.opticalCoverage ?? REFERENCE_COVERAGE;
  const correction = clamp(
    Math.sqrt(REFERENCE_COVERAGE / coverage),
    COVERAGE_CORRECTION.min,
    COVERAGE_CORRECTION.max,
  );

  // Jamais au-delà de « contain » : `1` est un plafond dur, pas un objectif.
  const scale = clamp(Math.sqrt(TARGET_AREA / fitArea) * correction, MIN_SCALE, 1);

  return {
    width: +(fitWidth * scale * 100).toFixed(1),
    // La hauteur est exprimée en % de la hauteur du plateau, d'où la division.
    height: +((fitHeight * scale) / boxHeight * 100).toFixed(1),
  };
}

/* ====================================================================== *
 * LARGEUR D'AFFICHAGE RÉELLE D'UN PACKSHOT DANS « THE STAGE »
 *
 * Un packshot n'est pas dimensionné comme un logo : `.product-object__img`
 * pose `inline-size: auto; max-block-size: 100%`. L'image est donc ajustée
 * PAR LA HAUTEUR, et sa largeur rendue dépend de son propre ratio source.
 *
 * Conséquence mesurée : à 1920 px, l'emplacement fait 220 px de large, mais
 * la canette Sprite qu'il contient n'en occupe que 71. Annoncer 220 px dans
 * `sizes` faisait télécharger au navigateur une variante trois fois trop
 * définie — 490 Ko de packshots sur la page d'accueil.
 *
 * Les valeurs ci-dessous ne sont PAS des réglages : elles transcrivent le CSS.
 *
 *   hauteurPlateau = largeurEmplacement × 4/3      (aspect-ratio: 3 / 4)
 *   hauteurImage   = hauteurPlateau − 2 × padding  (padding du plateau)
 *   largeurImage   = hauteurImage × ratioSource
 *   largeurVue     = largeurImage × échelleDuPlan  (transform: scale())
 *
 * `transform` n'est pas pris en compte par le navigateur pour choisir une
 * source : l'échelle du plan doit donc être appliquée ici, à la main.
 *
 * Vérification : le modèle a été confronté aux géométries relevées sur les
 * neuf largeurs de `qa/screenshots/stage/geometry.json`. Écart maximal 1 px.
 * ====================================================================== */

/** `padding: clamp(var(--sp-2), 2.5vw, var(--sp-5))` — 8 px … 24 px. */
const PLATE_PAD_MAX = 24;

/** Géométrie de chaque plan, transcrite de `Hero.astro`. */
const PLANE = {
  back: { slot: 'clamp(120px, 15vw, 220px)', max: 220, vw: 0.15, scale: 0.64 },
  mid: { slot: 'clamp(120px, 15vw, 220px)', max: 220, vw: 0.15, scale: 1 },
  front: { slot: 'clamp(150px, 19vw, 280px)', max: 280, vw: 0.19, scale: 1.32 },
} as const;

export type StagePlane = keyof typeof PLANE;

/**
 * Coefficients de la RANGÉE MOBILE (< 768 px), en vw par unité de ratio.
 *
 * La recomposition mobile dispose les emplacements en flexbox : leur largeur
 * dépend de `--margin`, des gouttières et des facteurs de flex, et n'a donc
 * pas de forme fermée exprimable dans `sizes`. Ces deux coefficients sont
 * MESURÉS sur 320, 375, 390 et 430 px, puis MAJORÉS de 6 % — un `sizes`
 * sous-évalué servirait une image floue, ce qui est bien pire que quelques
 * kilo-octets de trop.
 *
 * Le plan arrière est en `display: none` sous 768 px. Le navigateur télécharge
 * malgré tout l'image : on lui demande donc explicitement la plus petite
 * variante disponible plutôt que de la laisser choisir.
 */
const MOBILE_VW = { back: 0, mid: 30, front: 42 } as const;

const px = (v: number) => `${Math.ceil(v)}px`;

/**
 * Attribut `sizes` d'un packshot de la scène.
 *
 * Découpé en régimes parce que `sizes` n'accepte pas `clamp()` de façon
 * fiable : chaque média-requête correspond à un intervalle où la largeur de
 * l'emplacement suit une seule loi. Dans les intervalles où la largeur croît
 * moins vite que la fenêtre, la valeur retenue est celle du HAUT de
 * l'intervalle — donc une borne supérieure, jamais une sous-estimation.
 */
export function stageSizes(plane: StagePlane, sourceRatio: number): string {
  const { max, vw, scale } = PLANE[plane];
  const k = sourceRatio * scale;

  /** Largeur vue pour une largeur d'emplacement donnée, padding au maximum. */
  const seen = (slot: number) => (slot * (4 / 3) - 2 * PLATE_PAD_MAX) * k;

  /** Fenêtre à partir de laquelle `clamp()` plafonne l'emplacement. */
  const capAt = Math.ceil(max / vw);

  const mobile =
    MOBILE_VW[plane] === 0 ? '1px' : `${(MOBILE_VW[plane] * sourceRatio).toFixed(2)}vw`;

  return [
    `(min-width: ${capAt}px) ${px(seen(max))}`,
    // 960 px : la fenêtre où `padding` atteint son plafond de 24 px.
    `(min-width: 960px) calc((${((vw * 400) / 3).toFixed(3)}vw - ${2 * PLATE_PAD_MAX}px) * ${k.toFixed(4)})`,
    // 768–960 px : borne supérieure de l'intervalle, prise à 960 px.
    `(min-width: 768px) ${px(seen(960 * vw))}`,
    mobile,
  ].join(', ');
}

/* ---------------------------------------------------------------------- *
 * PISTE FEATURED
 *
 * Même modèle, autres bornes — transcrites de `FeaturedBrands.astro` :
 *   ≥ 1024 px : `inline-size: clamp(180px, 15vw, 235px)`
 *   < 1024 px : `inline-size: clamp(150px, 15vw, 210px)`
 * Aucune transformation d'échelle : ce que le navigateur calcule est ce qui
 * est vu.
 *
 * Sans cela, `sizes` annonçait 25 vw — 360 px à 1440 — pour des objets rendus
 * entre 90 et 165 px. Le navigateur prenait la plus grande variante de chaque
 * srcset, y compris pour les six masters de scène déjà chargés par le hero
 * dans une définition bien plus petite : 1 008 Ko de packshots sur l'accueil.
 * ---------------------------------------------------------------------- */

const FEATURED_MAX = 235;
const FEATURED_VW = 0.15;
/** Plateau le plus large sous 1024 px, padding au plus étroit (fenêtre 320 px). */
const FEATURED_SMALL_SLOT = 150;
const PLATE_PAD_MIN = 8;

export function featuredSizes(sourceRatio: number): string {
  const seen = (slot: number, pad: number) => (slot * (4 / 3) - 2 * pad) * sourceRatio;
  const capAt = Math.ceil(FEATURED_MAX / FEATURED_VW);

  return [
    `(min-width: ${capAt}px) ${px(seen(FEATURED_MAX, PLATE_PAD_MAX))}`,
    `(min-width: 1024px) calc((${((FEATURED_VW * 400) / 3).toFixed(3)}vw - ${2 * PLATE_PAD_MAX}px) * ${sourceRatio.toFixed(4)})`,
    // Sous 1024 px, le plateau est plafonné par sa borne basse et le padding
    // rétrécit avec la fenêtre : la valeur retenue est le maximum de
    // l'intervalle, atteint à 320 px. Une borne supérieure, jamais l'inverse.
    px(seen(FEATURED_SMALL_SLOT, PLATE_PAD_MIN)),
  ].join(', ');
}
