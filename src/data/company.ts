/**
 * Identité juridique et coordonnées.
 *
 * Données réelles fournies par le client. C'est la seule preuve de crédibilité
 * dont nous disposons — et en négoce transfrontalier, un numéro de TVA
 * vérifiable via VIES vaut mieux que dix témoignages.
 *
 * Aucun champ n'est complété par supposition. Le téléphone reste absent tant
 * qu'aucun numéro commercial n'est fourni (décision D12).
 */

export const COMPANY = {
  /** Nom commercial affiché. */
  name: 'Ivan Arsenov',
  /** Personne juridiquement responsable — requis par le §5 DDG. */
  legalName: 'Ivan Arsenov Iliev',

  address: {
    street: 'Zwischenbrücken 8',
    postalCode: '27793',
    city: 'Wildeshausen',
    country: 'Germany',
    countryCode: 'DE',
  },

  email: 'info@ivan-arsenov.de',
  /** `null` tant qu'Ivan n'a pas fourni de numéro commercial (D12). */
  phone: null as string | null,

  vatId: 'DE464097303',
  taxNumber: '68/120/14293',

  domain: 'www.ivan-arsenov.de',
} as const;

export const addressLines = (): string[] => [
  COMPANY.address.street,
  `${COMPANY.address.postalCode} ${COMPANY.address.city}`,
  COMPANY.address.country,
];
