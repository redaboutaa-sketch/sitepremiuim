/**
 * Dérive chromatique de section.
 *
 * Le spécimen le plus proche du centre de la fenêtre impose sa famille à la
 * section : `--signal` change, et la transition déclarée sur `@property
 * --signal` fait le reste. Rien n'est animé en JavaScript.
 *
 * Aucune minuterie : la dérive suit le regard de l'utilisateur, elle ne
 * tourne pas toute seule. Un changement automatique relèverait du carrousel.
 */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

export function initDrift(): void {
  const section = document.querySelector<HTMLElement>('[data-signal-drift]');
  if (!section) return;

  const items = Array.from(section.querySelectorAll<HTMLElement>('[data-drift-item]'));
  if (items.length === 0) return;

  // Sous reduced-motion, la section garde la teinte de son premier spécimen :
  // une composition arrêtée, pas une absence de couleur.
  if (reduced.matches) {
    const first = items[0]?.dataset.family;
    if (first) section.dataset.family = first;
    return;
  }

  let ticking = false;

  const update = () => {
    ticking = false;
    const centre = window.innerHeight / 2;

    let closest: HTMLElement | null = null;
    let best = Infinity;

    for (const item of items) {
      const rect = item.getBoundingClientRect();
      // On ignore ce qui est hors champ : sinon un élément lointain pourrait
      // rester « le plus proche » et figer la teinte.
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
      const distance = Math.abs(rect.top + rect.height / 2 - centre);
      if (distance < best) {
        best = distance;
        closest = item;
      }
    }

    const family = closest?.dataset.family;
    if (family && section.dataset.family !== family) section.dataset.family = family;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}
