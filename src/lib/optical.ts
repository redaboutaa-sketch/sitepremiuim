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
