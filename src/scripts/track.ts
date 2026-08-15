/**
 * Piste horizontale pilotée par le défilement vertical.
 *
 * Modèle retenu : on pilote `scrollLeft`, pas une translation CSS.
 *
 * Une translation se superposerait au défilement natif de la zone — deux
 * systèmes de coordonnées pour un seul mouvement, donc un décalage incohérent
 * dès que l'utilisateur touche la piste. En pilotant `scrollLeft`, le
 * défilement natif reste la seule vérité : la molette, le doigt, le clavier et
 * le pilotage écrivent tous la même valeur.
 *
 * Aucun épinglage : le flux du document n'est jamais modifié.
 *
 * Dès que l'utilisateur manipule la piste lui-même, le pilotage s'arrête
 * définitivement. Reprendre la main sur son geste serait le pire des deux
 * mondes.
 */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Part du débordement parcourue par le défilement. Le reste s'explore à la main. */
const TRAVEL = 0.9;

export function initTrack(): void {
  const section = document.querySelector<HTMLElement>('[data-featured]');
  const viewport = document.querySelector<HTMLElement>('[data-track-viewport]');
  const track = document.querySelector<HTMLElement>('[data-track]');
  if (!section || !viewport || !track) return;

  // Sur mobile et en reduced-motion, la piste reste purement manuelle :
  // c'est déjà une interaction naturelle au doigt.
  if (reduced.matches || window.innerWidth < 768) return;

  const overflow = () => track.scrollWidth - viewport.clientWidth;
  if (overflow() <= 0) return;

  let driving = true;
  let ticking = false;

  const update = () => {
    ticking = false;
    if (!driving) return;

    const rect = section.getBoundingClientRect();
    const range = rect.height - window.innerHeight;
    if (range <= 0) return;

    /*
     * Progression 0 quand le HAUT de la section atteint le haut de la fenêtre,
     * 1 quand son bas la quitte. C'est le seul calage qui laisse la première
     * marque visible pendant qu'on lit le titre : une progression relative à
     * l'entrée dans la fenêtre plaçait déjà la piste à 44 % à cet instant, et
     * Coca-Cola n'était jamais vu.
     */
    const progress = Math.min(Math.max(-rect.top / range, 0), 1);
    viewport.scrollLeft = progress * overflow() * TRAVEL;
  };

  const onScroll = () => {
    if (ticking || !driving) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  /** L'utilisateur prend la main — définitivement. */
  const release = (event: Event) => {
    if (event instanceof WheelEvent && Math.abs(event.deltaX) < 4) return;
    driving = false;
    window.removeEventListener('scroll', onScroll);
    viewport.setAttribute('data-track-released', '');
  };

  viewport.addEventListener('pointerdown', release, { passive: true });
  viewport.addEventListener('wheel', release, { passive: true });
  viewport.addEventListener('keydown', release);

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}
