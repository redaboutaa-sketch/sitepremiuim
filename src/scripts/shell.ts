/**
 * Comportements du shell — état du header et navigation mobile.
 *
 * Amélioration progressive : sans ce script, le header reste dense et le
 * panneau mobile reste fermé. Rien n'est cassé, seule la finition manque.
 */

const SCROLL_THRESHOLD = 80;

/* ------------------------------------------------------------------ *
 * Header — densification au défilement
 * ------------------------------------------------------------------ */

function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  let ticking = false;

  const apply = () => {
    header.toggleAttribute('data-scrolled', window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  };

  // rAF plutôt qu'un debounce : l'état suit le défilement sans le retarder,
  // et on ne recalcule jamais plus d'une fois par frame.
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  };

  apply();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ------------------------------------------------------------------ *
 * Navigation mobile
 * ------------------------------------------------------------------ */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function initMobileNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-mobile-nav]');
  const label = document.querySelector<HTMLElement>('[data-menu-label]');
  const main = document.querySelector<HTMLElement>('#main');
  const footer = document.querySelector<HTMLElement>('[data-footer]');
  if (!toggle || !panel) return;

  // Les libellés viennent du serveur : coder « Close menu » en dur casserait
  // la parité EN/DE au premier clic.
  const labels = {
    open: toggle.dataset.labelOpen ?? label?.textContent ?? '',
    close: toggle.dataset.labelClose ?? label?.textContent ?? '',
  };

  let isOpen = false;
  let scrollY = 0;

  const focusables = (): HTMLElement[] =>
    Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );

  /**
   * Blocage du défilement d'arrière-plan.
   *
   * `overflow: hidden` seul ne suffit pas sur iOS : on fige le document à sa
   * position courante, puis on la restaure exactement à la fermeture. Sans
   * cela, refermer le menu renvoie l'utilisateur en haut de page.
   */
  const lockScroll = () => {
    scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.insetInline = '0';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.overflow = 'hidden';
  };

  const unlockScroll = () => {
    document.body.style.position = '';
    document.body.style.insetInline = '';
    document.body.style.top = '';
    document.body.style.overflow = '';
    window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
  };

  const open = () => {
    if (isOpen) return;
    isOpen = true;

    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    if (label) label.textContent = labels.close;

    // L'arrière-plan devient inerte : ni focus, ni lecture par les
    // technologies d'assistance. Plus fiable qu'un aria-hidden manuel.
    main?.setAttribute('inert', '');
    footer?.setAttribute('inert', '');

    lockScroll();
    focusables()[0]?.focus();
  };

  const close = (restoreFocus = true) => {
    if (!isOpen) return;
    isOpen = false;

    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = labels.open;

    main?.removeAttribute('inert');
    footer?.removeAttribute('inert');

    unlockScroll();
    // Le focus revient au déclencheur : l'utilisateur clavier reprend
    // exactement là où il en était.
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => (isOpen ? close() : open()));

  document.addEventListener('keydown', (event) => {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab') return;

    // Piégeage du focus — le déclencheur fait partie du cycle pour rester
    // atteignable, sinon on ne pourrait plus fermer au clavier.
    //
    // L'ORDRE COMPTE : le bouton précède le panneau dans le DOM. Le placer en
    // fin de tableau faisait que `last` ne correspondait jamais au dernier
    // lien réellement atteint, et le focus s'échappait du panneau.
    const items = [toggle, ...focusables()];
    if (items.length === 0) return;

    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Naviguer ferme le panneau : sans cela, le retour arrière du navigateur
  // afficherait une page dont le défilement est encore bloqué.
  panel.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a[href]')) close(false);
  });

  // Le panneau n'existe plus au-delà du seuil desktop : s'il reste ouvert
  // pendant un redimensionnement, le défilement resterait bloqué.
  const desktop = window.matchMedia('(min-width: 1024px)');
  desktop.addEventListener('change', (e) => {
    if (e.matches) close(false);
  });
}

/* ------------------------------------------------------------------ *
 * Révélation au défilement
 * ------------------------------------------------------------------ */

/**
 * Observateur global des éléments `.reveal` et `.reveal-mask`.
 *
 * Sans lui, tout élément portant ces classes reste à `opacity: 0` : le CSS
 * pose l'état initial, c'est ce script qui autorise la transition. Le hero
 * gère les siens (ils doivent apparaître immédiatement, sans attendre une
 * intersection) ; toutes les autres sections passent par ici.
 *
 * Sous `prefers-reduced-motion`, le CSS impose déjà l'état final : on marque
 * quand même les éléments pour que l'état du DOM reste cohérent.
 */
function initReveal(): void {
  const targets = Array.from(
    document.querySelectorAll<HTMLElement>('.reveal, .reveal-mask'),
  ).filter((el) => !el.closest('[data-hero]'));

  if (targets.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    for (const el of targets) el.setAttribute('data-revealed', 'true');
    return;
  }

  const pending = new Set(targets);

  const reveal = (el: Element) => {
    el.setAttribute('data-revealed', 'true');
    pending.delete(el as HTMLElement);
    observer.unobserve(el);
  };

  /**
   * FILET DE SÉCURITÉ — indispensable, pas décoratif.
   *
   * Un IntersectionObserver ne se déclenche que sur un franchissement de
   * seuil. Un saut instantané — touche Fin, lien d'ancre, restauration de
   * position au rechargement — fait passer une section de « pas encore
   * visible » à « déjà dépassée » SANS jamais croiser de seuil : aucune
   * entrée n'est émise, et la section reste à `opacity: 0` définitivement.
   *
   * Ce n'est pas un défaut d'animation, c'est du contenu devenu illisible.
   * On balaie donc à chaque défilement tout ce qui est passé au-dessus de la
   * ligne de déclenchement, et on cesse d'écouter une fois la page épuisée.
   */
  const sweep = () => {
    const line = window.innerHeight * 0.88;
    for (const el of [...pending]) {
      if (el.getBoundingClientRect().top < line) reveal(el);
    }
    if (pending.size === 0) window.removeEventListener('scroll', onScroll);
  };

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sweep();
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) reveal(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  );

  for (const el of targets) observer.observe(el);
  window.addEventListener('scroll', onScroll, { passive: true });
  // La position peut déjà être restaurée au chargement.
  sweep();
}

initHeader();
initMobileNav();
initReveal();
