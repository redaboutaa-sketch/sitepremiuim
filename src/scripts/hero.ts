/**
 * HERO — mouvement.
 *
 * Trois comportements, tous facultatifs :
 *   1. révélation d'entrée (CSS, déclenchée ici) ;
 *   2. parallaxe pointeur amortie, plafonnée à 14 px ;
 *   3. stratification des plans au défilement (GSAP ScrollTrigger).
 *
 * Rien de tout cela n'est nécessaire à la lecture : la composition rendue par
 * le serveur EST la composition finale. Le script se contente d'y amener
 * l'œil. Sous `prefers-reduced-motion`, il s'arrête après la révélation —
 * qui devient instantanée par la feuille de style.
 */

const hero = document.querySelector<HTMLElement>('[data-hero]');
const stage = document.querySelector<HTMLElement>('[data-stage]');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

/* ------------------------------------------------------------------ *
 * 1 — Révélation d'entrée
 * ------------------------------------------------------------------ */

function reveal(): void {
  if (!hero) return;
  // Deux frames : la première laisse le navigateur poser l'état initial,
  // la seconde déclenche la transition. Sans cela, l'état initial et l'état
  // final sont peints ensemble et la révélation ne se voit pas.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      for (const el of hero.querySelectorAll('.reveal-mask, .reveal')) {
        el.setAttribute('data-revealed', 'true');
      }
      hero.setAttribute('data-entered', '');
    });
  });
}

/* ------------------------------------------------------------------ *
 * 2 — Parallaxe pointeur
 * ------------------------------------------------------------------ */

const MAX = 14; // px — plafond absolu, voir doc/design-direction.md §3
const EASE = 0.08;

function initPointer(): void {
  if (!stage || reduced.matches || !finePointer.matches) return;

  const slots = Array.from(stage.querySelectorAll<HTMLElement>('.hero__slot'));
  if (slots.length === 0) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let running = false;

  const onMove = (event: PointerEvent) => {
    // Position normalisée entre -1 et 1, depuis le centre de l'écran.
    targetX = (event.clientX / window.innerWidth - 0.5) * -2;
    targetY = (event.clientY / window.innerHeight - 0.5) * -2;
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  };

  const tick = () => {
    // Amortissement : l'image respire, elle ne suit pas le curseur au pixel.
    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;

    for (const slot of slots) {
      const depth = Number(getComputedStyle(slot).getPropertyValue('--depth')) || 0.5;
      slot.style.setProperty('--px', `${currentX * MAX * depth}px`);
      slot.style.setProperty('--py', `${currentY * MAX * depth * 0.6}px`);
    }

    // On s'arrête dès que le mouvement devient imperceptible : pas de boucle
    // rAF permanente quand le pointeur est immobile.
    if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }
  };

  window.addEventListener('pointermove', onMove, { passive: true });
}

/* ------------------------------------------------------------------ *
 * 3 — Stratification au défilement
 * ------------------------------------------------------------------ */

async function initScroll(): Promise<void> {
  if (!hero || !stage || reduced.matches) return;
  // Sur petit écran, pas d'épinglage : le scroll natif reste intégralement
  // maître, et la scène n'occupe pas assez de hauteur pour le justifier.
  if (window.innerWidth < 1024) return;

  // Chargement différé : GSAP n'est jamais téléchargé si le mouvement est
  // refusé ou si l'écran est petit.
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  const slots = gsap.utils.toArray<HTMLElement>('.hero__slot');
  const monogram = hero.querySelector('.hero__monogram');
  const content = hero.querySelector('.hero__content');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '+=100%',
      scrub: 0.6,
      // Pas de `pin` : épingler impose un décalage de mise en page au
      // reste du document et casse la position du header collant. Le même
      // effet de stratification s'obtient en déplaçant les plans à des
      // vitesses différentes, sans toucher au flux.
    },
  });

  // Les plans se séparent : le lointain remonte, le proche descend.
  for (const slot of slots) {
    const depth = Number(getComputedStyle(slot).getPropertyValue('--depth')) || 0.5;
    tl.to(slot, { yPercent: -22 * (1 - depth) + 14 * depth, ease: 'none' }, 0);
  }

  if (monogram) tl.to(monogram, { scale: 1.04, ease: 'none' }, 0);
  if (content) tl.to(content, { yPercent: -12, opacity: 0.35, ease: 'none' }, 0);
}

/* ------------------------------------------------------------------ */

if (hero) {
  reveal();
  initPointer();
  void initScroll();
}
