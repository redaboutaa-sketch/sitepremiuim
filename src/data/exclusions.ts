/**
 * Marques exclues du catalogue publiable.
 *
 * PORTÉE DU CONTRÔLE — cette liste est appliquée au SCHÉMA DE DONNÉES
 * PUBLIABLE, jamais par une recherche de chaînes dans le dépôt. « Heineken »
 * peut légitimement apparaître dans ce fichier, dans doc/catalog.md, dans un
 * commentaire ou dans un test : ce qui est interdit, c'est qu'une ENTRÉE DE
 * CATALOGUE PUBLIABLE le porte.
 *
 * Source de vérité : doc/catalog.md §4 et §5
 */

export interface Exclusion {
  slug: string;
  label: string;
  reason: string;
}

export const EXCLUSIONS: Exclusion[] = [
  // Alcool — hors périmètre absolu.
  { slug: 'amstel', label: 'Amstel', reason: 'Alcool' },
  { slug: 'bavaria', label: 'Bavaria', reason: 'Alcool' },
  { slug: 'heineken', label: 'Heineken', reason: 'Alcool' },
  { slug: 'banditos', label: 'Banditos', reason: 'Alcool' },

  // Thé et café — hors périmètre absolu.
  { slug: 'dilmah', label: 'Dilmah', reason: 'Thé' },
  { slug: 'nescafe', label: 'Nescafé', reason: 'Café' },
  { slug: 'lipton', label: 'Lipton', reason: 'Thé' },
  { slug: 'fuze-tea', label: 'Fuze Tea', reason: 'Thé' },

  // Décision D5 — marque trop fortement associée aux iced teas.
  { slug: 'arizona', label: 'Arizona', reason: 'Décision D5 — exclue, non réintégrable en V1' },

  // Décision D3 — boissons lactées / protéinées, hors définition stricte
  // de « Soft Drinks ». Le positionnement reste 100 % Soft Drinks.
  { slug: 'barebells', label: 'Barebells', reason: 'Décision D3 — dairy / protein' },
  { slug: 'chocomel', label: 'Chocomel', reason: 'Décision D3 — dairy / protein' },
  { slug: 'fristi', label: 'Fristi', reason: 'Décision D3 — dairy / protein' },
  { slug: 'optimel', label: 'Optimel', reason: 'Décision D3 — dairy / protein' },
  { slug: 'pinar', label: 'Pınar', reason: 'Décision D3 — dairy / protein' },

  // Décision D4 — Concentrates & Syrups hors V1.
  { slug: 'karvan-cevitam', label: 'Karvan Cévitam', reason: 'Décision D4 — concentrates' },
  { slug: 'raak', label: 'RAAK', reason: 'Décision D4 — concentrates' },
  { slug: 'slimpie', label: 'Slimpie', reason: 'Décision D4 — concentrates' },

  // Décision D6 — retirée en attente de la liste des SKU prêts à boire.
  // Aucun complément alimentaire ne peut figurer au catalogue.
  {
    slug: 'xxl-nutrition',
    label: 'XXL Nutrition',
    reason: 'Décision D6 — retirée jusqu’à confirmation des SKU prêts à boire',
  },
];

export const EXCLUDED_SLUGS: ReadonlySet<string> = new Set(EXCLUSIONS.map((e) => e.slug));

export function exclusionFor(slug: string): Exclusion | undefined {
  return EXCLUSIONS.find((e) => e.slug === slug);
}
