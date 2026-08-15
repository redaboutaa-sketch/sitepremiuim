/**
 * EN — langue source éditoriale.
 *
 * Ce fichier définit LA FORME du dictionnaire. `de.ts` doit la satisfaire
 * intégralement : une clé manquante est une erreur de compilation TypeScript,
 * donc une erreur de build. C'est le mécanisme de parité EN/DE.
 */

export const en = {
  meta: {
    siteName: 'Ivan Arsenov',
    tagline: 'B2B Soft Drinks · International Selection',
  },

  nav: {
    drinks: 'Drinks',
    brands: 'Brands',
    about: 'About',
    contact: 'Contact',
    skipToContent: 'Skip to main content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    primary: 'Main navigation',
    mobile: 'Site navigation',
    language: 'Language',
  },

  cta: {
    primary: 'Request a Quote',
    secondary: 'Explore Our Drinks',
    addToEnquiry: 'Add to Enquiry',
    added: 'Added',
    requestQuote: 'Request Quote',
    sendEnquiry: 'Send Business Enquiry',
  },

  hero: {
    eyebrow: 'B2B Soft Drinks · International Selection',
    h1: 'Soft drinks without borders.',
    support:
      'From global icons to distinctive international flavours, Ivan Arsenov brings together a focused selection of non-alcoholic beverages for professional buyers.',
    stageLabel: 'Selected brands',
  },

  featured: {
    eyebrow: 'Global icons · International favourites',
    h2: 'Brands people already know. Flavours they may not.',
    copy: 'Explore recognised names alongside international variants, distinctive flavours and emerging beverage formats — all within one focused soft-drinks portfolio.',
    trackLabel: 'Featured brands',
    hint: 'Scroll to explore — 16 of 62 brands',
  },

  categories: {
    h2: 'One category. Deeper focus.',
    copy: 'Ivan Arsenov is focused on non-alcoholic beverages. No unrelated product catalogue — just a dedicated selection of soft drinks for professional buyers.',
  },

  pages: {
    home: {
      title: 'B2B Soft Drinks Supplier — International Selection',
      description:
        'Ivan Arsenov is a B2B trading business focused on non-alcoholic beverages, bringing together internationally recognised brands and distinctive flavours for professional buyers.',
    },
    drinks: {
      title: 'Explore Our Drinks',
      description:
        'A focused selection of non-alcoholic beverages — from recognised global brands to distinctive international flavours.',
    },
    brands: {
      title: 'Brands',
      description:
        'Discover global names, regional favourites and distinctive beverage brands across our focused soft-drinks selection.',
    },
    about: {
      title: 'About',
      description:
        'Ivan Arsenov is a B2B trading business based in Wildeshausen, Germany, focused on non-alcoholic beverages for professional buyers.',
    },
    contact: {
      title: 'Business Enquiry',
      description:
        'Looking for specific brands, flavours or beverage categories? Tell us what you need and we will continue the conversation directly.',
    },
    imprint: {
      title: 'Imprint',
      description: 'Legal information for Ivan Arsenov, Wildeshausen, Germany.',
    },
    privacy: {
      title: 'Privacy Policy',
      description: 'How Ivan Arsenov handles personal data submitted through this website.',
    },
    cookies: {
      title: 'Cookies & Local Storage',
      description: 'Which technologies this website uses to store information in your browser.',
    },
  },

  footer: {
    nav: 'Navigation',
    legal: 'Legal',
    contact: 'Contact',
    imprint: 'Imprint',
    privacy: 'Privacy',
    cookies: 'Cookies',
    vatId: 'VAT ID',
    trademarkNotice:
      'All trademarks, brand names and logos are the property of their respective owners. Their use on this website is purely referential and indicates the products available through Ivan Arsenov. No affiliation, sponsorship or endorsement is implied.',
  },
};

/**
 * Forme du dictionnaire. Toute locale doit la satisfaire.
 *
 * NB — pas de `as const` sur `en` : cela figerait les valeurs anglaises dans le
 * type et exigerait que `de.ts` répète l'anglais mot pour mot. On veut la
 * parité des CLÉS, avec des valeurs `string` libres.
 */
export type Dictionary = typeof en;
