/**
 * ENQUIRY LIST — sélection B2B.
 *
 * Parcours : Discover → Select → Enquire.
 *
 * Ce n'est PAS un panier. Aucune quantité, aucun prix, aucun total, aucune
 * commande. La liste ne porte que des identifiants de marques : c'est une
 * liste d'intérêt qui pré-remplira une demande d'offre.
 *
 * Stockage : `sessionStorage`, limité à la session de navigation, sans
 * intention de persistance entre sessions. Uniquement les identifiants
 * sélectionnés par l'utilisateur — aucun traceur, aucun profilage, aucune
 * donnée personnelle. La qualification juridique de ce stockage relève de
 * LEGAL_CONTENT_REQUIRES_VALIDATION et n'est formulée nulle part par le code.
 */

const KEY = 'ia.enquiry';
const LIMIT = 25;

export interface EnquiryState {
  slugs: string[];
}

type Listener = (state: EnquiryState) => void;

const listeners = new Set<Listener>();

function read(): string[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // On filtre à la lecture : une valeur corrompue ne doit pas casser la page.
    return parsed.filter((v): v is string => typeof v === 'string' && /^[a-z0-9-]+$/.test(v));
  } catch {
    return [];
  }
}

function write(slugs: string[]): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    // Stockage indisponible (mode privé strict, quota) : la sélection reste
    // valable pour la page courante. Rien ne casse.
  }
  for (const listener of listeners) listener({ slugs });
}

export const getSelection = (): string[] => read();
export const isSelected = (slug: string): boolean => read().includes(slug);
export const count = (): number => read().length;
export const atLimit = (): boolean => read().length >= LIMIT;

export function add(slug: string): boolean {
  const slugs = read();
  if (slugs.includes(slug)) return false;
  if (slugs.length >= LIMIT) return false;
  write([...slugs, slug]);
  return true;
}

export function remove(slug: string): void {
  write(read().filter((s) => s !== slug));
}

export function toggle(slug: string): boolean {
  if (isSelected(slug)) {
    remove(slug);
    return false;
  }
  return add(slug);
}

export function clear(): void {
  write([]);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  listener({ slugs: read() });
  return () => listeners.delete(listener);
}

export { LIMIT };
