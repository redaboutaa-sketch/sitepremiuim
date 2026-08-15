/**
 * CATALOGUE — recherche, filtres et état d'URL.
 *
 * Les 62 entrées sont rendues par le serveur : filtrer revient à masquer des
 * cellules, jamais à reconstruire une liste. Aucune bibliothèque, aucun index
 * de recherche : sur 62 entrées, une comparaison de chaînes est instantanée
 * et pèse zéro octet.
 *
 * L'état vit dans l'URL — deep-link, partage, retour arrière navigateur et
 * arrivée depuis /brands/ fonctionnent sans code supplémentaire.
 */

const PARAMS = ['category', 'brand', 'find', 'q'] as const;

interface Query {
  category: string | null;
  brand: string | null;
  find: string | null;
  q: string;
}

function readQuery(): Query {
  const p = new URLSearchParams(window.location.search);
  return {
    category: p.get('category'),
    brand: p.get('brand'),
    find: p.get('find'),
    q: (p.get('q') ?? '').trim(),
  };
}

/** Normalise pour comparer sans diacritiques ni casse. */
const fold = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function initCatalog(): void {
  const list = document.querySelector<HTMLElement>('[data-catalog]');
  const empty = document.querySelector<HTMLElement>('[data-catalog-empty]');
  const counter = document.querySelector<HTMLElement>('[data-result-count]');
  const input = document.querySelector<HTMLInputElement>('[data-search-input]');
  const searchReset = document.querySelector<HTMLElement>('[data-search-reset]');
  const catalogReset = document.querySelector<HTMLElement>('[data-catalog-reset]');
  const filters = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-filter]'));
  if (!list) return;

  const cells = Array.from(list.querySelectorAll<HTMLElement>('[data-brand]'));
  const one = counter?.dataset.labelOne ?? '';
  const many = counter?.dataset.labelMany ?? '';

  const apply = (query: Query, { push }: { push: boolean }) => {
    const needle = fold(query.q);
    let visible = 0;

    for (const cell of cells) {
      const matchesCategory = !query.category || cell.dataset.category === query.category;
      const matchesBrand = !query.brand || cell.dataset.brand === query.brand;
      // `find` est un marqueur TRANSVERSAL : il se combine avec la famille,
      // il ne la remplace pas. Une Fanta reste `carbonated` et apparaît ici.
      const matchesFind = query.find !== 'international' || cell.dataset.international === 'true';
      const matchesSearch = !needle || (cell.dataset.search ?? '').includes(needle);

      const show = matchesCategory && matchesBrand && matchesFind && matchesSearch;
      cell.hidden = !show;
      if (show) visible++;
    }

    if (empty) empty.hidden = visible > 0;
    if (counter) {
      counter.textContent = (visible === 1 ? one : many).replace('{n}', String(visible));
      counter.hidden = visible === 0;
    }

    for (const filter of filters) {
      const slug = filter.dataset.filter!;
      const active = slug === 'all' ? !query.category : query.category === slug;
      if (active) filter.setAttribute('aria-current', 'true');
      else filter.removeAttribute('aria-current');
    }

    if (searchReset) searchReset.hidden = query.q === '' && !query.brand && !query.find;
    if (input && input.value !== query.q) input.value = query.q;

    if (push) {
      const params = new URLSearchParams();
      if (query.category) params.set('category', query.category);
      if (query.brand) params.set('brand', query.brand);
      if (query.find) params.set('find', query.find);
      if (query.q) params.set('q', query.q);
      const search = params.toString();
      const url = search ? `?${search}` : window.location.pathname;
      window.history.pushState({}, '', url);
    }
  };

  const current = (): Query => readQuery();

  const update = (patch: Partial<Query>) => {
    const next: Query = { ...current(), ...patch };
    // Choisir une famille lève le filtrage sur une marque unique : les deux
    // ensemble ne rendraient au mieux qu'un seul résultat.
    if (patch.category !== undefined) next.brand = null;
    apply(next, { push: true });
  };

  // Recherche instantanée. Pas de debounce : sur 62 comparaisons de chaînes,
  // il n'ajouterait que de la latence perçue.
  input?.addEventListener('input', () => update({ q: input.value.trim() }));

  input?.form?.addEventListener('submit', (event) => {
    event.preventDefault();
    update({ q: input.value.trim() });
  });

  for (const filter of filters) {
    filter.addEventListener('click', (event) => {
      event.preventDefault();
      const slug = filter.dataset.filter!;
      update({ category: slug === 'all' ? null : slug, find: null });
    });
  }

  const reset = () => {
    if (input) input.value = '';
    apply({ category: null, brand: null, find: null, q: '' }, { push: true });
    input?.focus();
  };

  searchReset?.addEventListener('click', reset);
  catalogReset?.addEventListener('click', reset);

  // Retour arrière et avant du navigateur.
  window.addEventListener('popstate', () => apply(readQuery(), { push: false }));

  apply(readQuery(), { push: false });
}

export { PARAMS };
