/**
 * ENQUIRY LIST — interface.
 *
 * Hydrate les boutons rendus par le serveur, tient le compteur du header à
 * jour et pilote le panneau de sélection.
 *
 * Amélioration progressive : sans JavaScript, les boutons ne sont pas rendus
 * du tout (voir EnquiryButton.astro) et le formulaire reste utilisable via
 * son champ de texte libre. La conversion n'en dépend jamais.
 */

import { add, clear, count, getSelection, isSelected, remove, subscribe, LIMIT } from './enquiry';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Libellés fournis par le serveur : jamais de chaîne codée en dur ici. */
function labels(root: HTMLElement) {
  return {
    add: root.dataset.labelAdd ?? '',
    selected: root.dataset.labelSelected ?? '',
    remove: root.dataset.labelRemove ?? '',
    countOne: root.dataset.labelCountOne ?? '',
    countMany: root.dataset.labelCountMany ?? '',
    full: root.dataset.labelFull ?? '',
  };
}

/* ------------------------------------------------------------------ *
 * Boutons Add to Enquiry
 * ------------------------------------------------------------------ */

function initButtons(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-enquiry-add]'));
  if (buttons.length === 0) return;

  const paint = () => {
    const selection = getSelection();
    const full = selection.length >= LIMIT;

    for (const button of buttons) {
      const slug = button.dataset.enquiryAdd!;
      const on = selection.includes(slug);
      const l = labels(button);

      button.setAttribute('aria-pressed', String(on));
      // Le libellé accessible change avec l'état : un bouton bascule qui
      // annonce toujours « Add » ment au lecteur d'écran.
      const text = button.querySelector('[data-enquiry-label]');
      if (text) text.textContent = on ? l.selected : full ? l.full : l.add;
      button.disabled = !on && full;
    }
  };

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const slug = button.dataset.enquiryAdd!;
      // Pas de `toggle` aveugle : on distingue l'ajout refusé (limite) du
      // retrait, sinon un clic sur un bouton plein retirerait un autre élément.
      if (isSelected(slug)) remove(slug);
      else add(slug);
    });
  }

  subscribe(paint);
}

/* ------------------------------------------------------------------ *
 * Compteur — n'existe que s'il y a une sélection
 * ------------------------------------------------------------------ */

function initIndicators(): void {
  const indicators = Array.from(document.querySelectorAll<HTMLElement>('[data-enquiry-indicator]'));
  if (indicators.length === 0) return;

  subscribe(({ slugs }) => {
    for (const indicator of indicators) {
      const l = labels(indicator);
      indicator.hidden = slugs.length === 0;
      const label = indicator.querySelector('[data-enquiry-count]');
      if (label) {
        label.textContent = (slugs.length === 1 ? l.countOne : l.countMany).replace(
          '{n}',
          String(slugs.length),
        );
      }
    }
  });
}

/* ------------------------------------------------------------------ *
 * Panneau de sélection
 * ------------------------------------------------------------------ */

function initPanel(): void {
  const panel = document.querySelector<HTMLElement>('[data-enquiry-panel]');
  const list = panel?.querySelector<HTMLElement>('[data-enquiry-list]');
  const empty = panel?.querySelector<HTMLElement>('[data-enquiry-empty]');
  const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-enquiry-open]'));
  const closers = Array.from(document.querySelectorAll<HTMLElement>('[data-enquiry-close]'));
  const clearBtn = panel?.querySelector<HTMLElement>('[data-enquiry-clear]');
  const main = document.querySelector<HTMLElement>('#main');
  const footer = document.querySelector<HTMLElement>('[data-footer]');
  if (!panel || !list) return;

  let opener: HTMLElement | null = null;
  let open = false;

  const names = new Map<string, string>();
  for (const el of document.querySelectorAll<HTMLElement>('[data-brand-name]')) {
    if (el.dataset.brandSlug) names.set(el.dataset.brandSlug, el.dataset.brandName!);
  }

  const render = (slugs: string[]) => {
    list.textContent = '';
    for (const slug of slugs) {
      const item = document.createElement('li');
      item.className = 'enquiry-panel__item';

      const name = document.createElement('span');
      name.className = 't-h3';
      name.textContent = names.get(slug) ?? slug;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'enquiry-panel__remove t-label';
      button.textContent = panel.dataset.labelRemove ?? '';
      button.setAttribute('aria-label', `${panel.dataset.labelRemove} ${name.textContent}`);
      button.addEventListener('click', () => {
        remove(slug);
        // Le focus ne doit pas tomber dans le vide après suppression.
        const next = list.querySelector<HTMLElement>('button') ?? closers[0] ?? null;
        next?.focus();
      });

      item.append(name, button);
      list.append(item);
    }
    if (empty) empty.hidden = slugs.length > 0;
  };

  const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));

  const show = (trigger: HTMLElement) => {
    if (open) return;
    open = true;
    opener = trigger;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    main?.setAttribute('inert', '');
    footer?.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    focusables()[0]?.focus();
  };

  const hide = (restore = true) => {
    if (!open) return;
    open = false;
    panel.hidden = true;
    for (const t of triggers) t.setAttribute('aria-expanded', 'false');
    main?.removeAttribute('inert');
    footer?.removeAttribute('inert');
    document.body.style.overflow = '';
    if (restore) opener?.focus();
  };

  for (const trigger of triggers) {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', () => show(trigger));
  }
  for (const closer of closers) closer.addEventListener('click', () => hide());
  clearBtn?.addEventListener('click', () => {
    clear();
    closers[0]?.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      hide();
      return;
    }
    if (event.key !== 'Tab') return;

    const items = focusables();
    if (items.length === 0) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  subscribe(({ slugs }) => {
    render(slugs);
    // Une liste vidée pendant qu'elle est ouverte ne doit pas laisser un
    // panneau fantôme : on la referme proprement.
    if (open && slugs.length === 0) hide();
  });
}

export function initEnquiry(): void {
  initButtons();
  initIndicators();
  initPanel();
  // Marque l'état hydraté : les tests et le CSS savent que la sélection
  // est opérationnelle.
  document.documentElement.dataset.enquiry = String(count());
}
