/**
 * FORMULAIRE BUSINESS ENQUIRY.
 *
 * Cinq états : idle, invalid, submitting, success, server error.
 *
 * ⚠️ FORM_UI_READY ≠ FORM_DELIVERY_READY
 * Le transport est isolé derrière une interface. Tant qu'aucun endpoint réel
 * n'est configuré, le formulaire NE PRÉTEND PAS avoir envoyé quoi que ce
 * soit : il affiche explicitement que la livraison n'est pas encore active et
 * propose l'adresse e-mail directe. Simuler un succès serait mentir à un
 * prospect — et faire perdre une affaire à Ivan.
 */

import { clear, getSelection, remove, subscribe } from './enquiry';

type Transport = 'configured' | 'not-configured';

/**
 * CONTRAT DE DISPONIBILITÉ DU TRANSPORT (TR-020).
 *
 * La sonde est un GET sur `<action>?probe=1`. Elle N'EST PAS un HEAD :
 * un endpoint POST a le droit de répondre 405 à un HEAD tout en étant
 * parfaitement opérationnel — le déclarer indisponible sur ce seul motif
 * serait un faux négatif qui coûterait une affaire à Ivan.
 *
 * Seule réponse valant « disponible » :
 *     HTTP 200 + JSON { "delivery": "ready" }
 *
 * Tout le reste — { "delivery": "not-ready" }, corps illisible, statut
 * d'erreur, panne réseau, 404 (fichier jamais déposé) — vaut indisponible.
 * Le défaut est donc FERMÉ : en cas de doute on n'annonce pas un envoi.
 *
 * ⚠️ Cette sonde n'établit PAS `FORM_DELIVERY_READY`. Elle constate qu'un
 *    endpoint se déclare configuré. La seule preuve reste un envoi E2E réel
 *    sur l'environnement cible, réception vérifiée dans la boîte d'Ivan.
 */
async function probeTransport(action: string): Promise<Transport> {
  try {
    const url = new URL(action, window.location.href);
    url.searchParams.set('probe', '1');

    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return 'not-configured';

    const payload: unknown = await response.json();
    const delivery =
      typeof payload === 'object' && payload !== null
        ? (payload as Record<string, unknown>).delivery
        : undefined;

    return delivery === 'ready' ? 'configured' : 'not-configured';
  } catch {
    return 'not-configured';
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initEnquiryForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-enquiry-form]');
  if (!form) return;

  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const chips = form.querySelector<HTMLElement>('[data-selection-chips]');
  const chipsEmpty = form.querySelector<HTMLElement>('[data-selection-empty]');
  const startedAt = form.querySelector<HTMLInputElement>('[data-started-at]');

  const messages = JSON.parse(form.dataset.messages ?? '{}') as Record<string, string>;
  const names = JSON.parse(
    document.querySelector('[data-brand-names]')?.textContent ?? '{}',
  ) as Record<string, string>;

  if (startedAt) startedAt.value = String(Date.now());

  /* ---------------- Sélection transférée ---------------- */

  if (chips) {
    subscribe(({ slugs }) => {
      chips.textContent = '';
      for (const slug of slugs) {
        const chip = document.createElement('li');
        chip.className = 'chip';

        const label = document.createElement('span');
        label.textContent = names[slug] ?? slug;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'chip__remove';
        button.setAttribute('aria-label', `${messages.remove ?? 'Remove'} ${label.textContent}`);
        button.textContent = '×';
        button.addEventListener('click', () => remove(slug));

        chip.append(label, button);
        chips.append(chip);
      }
      if (chipsEmpty) chipsEmpty.hidden = slugs.length > 0;
    });
  }

  /* ---------------- Validation ---------------- */

  const errorFor = (name: string) =>
    form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);

  const setError = (field: HTMLElement, name: string, message: string | null) => {
    const box = errorFor(name);
    if (!box) return;
    if (message) {
      box.textContent = message;
      box.hidden = false;
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', `error-${name}`);
      box.id = `error-${name}`;
    } else {
      box.hidden = true;
      box.textContent = '';
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  };

  /** Message SPÉCIFIQUE par champ — jamais « something went wrong ». */
  const validate = (field: HTMLInputElement | HTMLTextAreaElement): string | null => {
    const value = field.value.trim();
    const name = field.name;

    if (field.type === 'checkbox') {
      return (field as HTMLInputElement).checked ? null : messages[`err_${name}`] ?? null;
    }
    if (field.required && value === '') return messages[`err_${name}_required`] ?? null;
    if (name === 'email' && value !== '' && !EMAIL.test(value)) {
      return messages.err_email_format ?? null;
    }
    return null;
  };

  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input[required], textarea[required], #email',
    ),
  ).filter((f) => f.name !== 'company_website');

  for (const field of fields) {
    // Validation au `blur`, jamais pendant la frappe initiale : signaler une
    // erreur à la deuxième lettre saisie est hostile.
    field.addEventListener('blur', () => setError(field, field.name, validate(field)));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        setError(field, field.name, validate(field));
      }
    });
  }

  /* ---------------- États ---------------- */

  /**
   * `focus` est explicite : sur une erreur de validation, le focus doit aller
   * au PREMIER CHAMP FAUTIF pour que l'utilisateur puisse corriger. Le
   * message est de toute façon annoncé par `aria-live` — le focaliser
   * volerait le focus et obligerait à re-tabuler jusqu'au champ.
   */
  const show = (tone: 'success' | 'error' | 'info', html: string, focus = true) => {
    if (!status) return;
    status.hidden = false;
    status.dataset.tone = tone;
    status.innerHTML = html;
    if (focus) status.focus();
  };

  const setSubmitting = (on: boolean) => {
    if (!submit || !submitLabel) return;
    submit.disabled = on;
    submit.dataset.submitting = on ? 'true' : '';
    submitLabel.textContent = on ? messages.submitting ?? '' : messages.submit ?? '';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    let firstInvalid: HTMLElement | null = null;
    for (const field of fields) {
      const message = validate(field);
      setError(field, field.name, message);
      if (message && !firstInvalid) firstInvalid = field;
    }
    if (firstInvalid) {
      // Le focus va au PREMIER champ fautif : l'utilisateur n'a pas à
      // chercher où se trouve le problème.
      show('error', messages.invalid ?? '', false);
      firstInvalid.focus();
      return;
    }

    setSubmitting(true);

    const transport = await probeTransport(form.action);

    if (transport === 'not-configured') {
      setSubmitting(false);
      // On ne prétend RIEN. On dit ce qui est, et on donne un recours.
      show('info', messages.notConfigured ?? '');
      return;
    }

    try {
      const payload = new FormData(form);
      for (const slug of getSelection()) payload.append('brands[]', slug);

      const response = await fetch(form.action, { method: 'POST', body: payload });
      if (!response.ok) throw new Error(String(response.status));

      setSubmitting(false);
      form.reset();
      clear();
      show('success', messages.success ?? '');
    } catch {
      setSubmitting(false);
      // Les données saisies sont conservées : on n'efface jamais le travail
      // de l'utilisateur sur une erreur réseau.
      show('error', messages.serverError ?? '');
    }
  });
}
