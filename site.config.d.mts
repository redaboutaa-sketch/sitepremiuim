/**
 * Déclarations pour `site.config.mjs`.
 *
 * Le fichier de configuration est en JavaScript pour rester importable par
 * `astro.config.mjs` et les scripts Node ; ces types lui rendent la même
 * rigueur qu'un module TypeScript côté `src/`.
 */
/** Les deux domaines du client. Le site est servi depuis l'un des deux. */
export declare const KNOWN_APEXES: readonly string[];

export declare const SITE_HOST: string;
export declare const SITE_APEX: string;

/**
 * L'autre domaine du client, dérivé de `SITE_APEX`. `null` seulement si
 * l'hôte servi ne figure pas dans `KNOWN_APEXES`.
 */
export declare const FOREIGN_APEX: string | null;
export declare const SITE_ORIGIN: string;
export declare const STAGING_HOST: string;
export declare const CONTACT_EMAIL: string;
export declare const SENDER_EMAIL: string;
