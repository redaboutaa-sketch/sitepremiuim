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

  discovery: {
    eyebrow: 'Beyond the usual',
    h2: 'Discover something different.',
    copy: 'Familiar brands can look very different around the world. Explore regional favourites, unusual flavours and distinctive soft drinks designed to bring something new to the shelf.',
    cta: 'See international finds',
  },

  process: {
    h2: 'Simple by design.',
    step1: { title: 'Explore', body: 'Browse the drinks and brands relevant to your business.' },
    step2: { title: 'Enquire', body: 'Select the products you are interested in and send us your requirements.' },
    step3: { title: "Let's talk business", body: 'Ivan Arsenov will review your enquiry and continue the conversation directly with you.' },
  },

  finalCta: {
    eyebrow: "Let's talk drinks",
    h2: 'Looking for the right products for your business?',
    copy: "Tell us what you're looking for and start a direct B2B conversation with Ivan Arsenov.",
  },

  enquiry: {
    add: 'Add to Enquiry',
    selected: 'Selected',
    remove: 'Remove',
    clearAll: 'Clear all',
    full: 'Selection full',
    countOne: '{n} selected',
    countMany: '{n} selected',
    panelTitle: 'Your enquiry',
    panelLead: 'Brands you have selected. They will be attached to your business enquiry — you can still edit them there.',
    empty: 'No brands selected yet.',
    request: 'Request Quote',
    close: 'Close',
    open: 'Open your enquiry',
  },

  drinks: {
    eyebrow: 'The selection',
    intro: 'A focused selection of non-alcoholic beverages — from recognised global brands to distinctive international flavours.',
    searchLabel: 'Search brands',
    searchPlaceholder: 'Search a brand…',
    filterLabel: 'Filter by category',
    filterAll: 'All',
    reset: 'Reset',
    countOne: '{n} brand',
    countMany: '{n} brands',
    internationalTag: 'International find',
    emptyTitle: 'No brands match that search.',
    emptyCopy: 'Try another spelling, or clear the filters to see the full selection. If you are looking for something we do not list, tell us directly.',
    emptyCta: 'Send a business enquiry',
  },

  brands: {
    eyebrow: 'The register',
    h1: 'Brands for every kind of refreshment.',
    intro: 'Discover global names, regional favourites and distinctive beverage brands across our focused soft-drinks selection.',
    stats: '{total} brands · {families} families · {featured} featured',
    foot: 'Every brand here can be added to a business enquiry. Tell us which ones matter to your assortment and we will take it from there.',
  },

  about: {
    eyebrow: 'About Ivan Arsenov',
    h1: 'Focused on soft drinks. Built for business.',
    body: [
      'Ivan Arsenov is a B2B trading business based in Wildeshausen, Germany, focused on non-alcoholic beverages.',
      'The portfolio brings together internationally recognised names, regional favourites and distinctive drink concepts for professional buyers.',
      'Our approach is intentionally focused: understand what you are looking for, identify the relevant products and build the commercial conversation around your requirements.',
    ],
    detailsLabel: 'Company details',
    factSelection: 'Selection',
    factFamilies: 'Families',
    familiesValue: 'Five, soft drinks only',
    factBased: 'Based in',
  },

  contact: {
    eyebrow: 'Business enquiry',
    h1: "Let's talk business.",
    intro: 'Looking for specific brands, flavours or beverage categories? Tell us what you need and we will continue the conversation directly.',
    optional: '— optional',
    requiredNote: 'Only name, company, country, email and message are required.',
    noSelection: 'No brands selected yet — you can also describe what you are looking for below.',
    interestPlaceholder: 'Anything else you are looking for…',
    volumePlaceholder: 'e.g. pallets per month, container loads',
    consent: 'I agree that my details will be used to answer this enquiry. See the {privacy} policy.',
    fields: {
      firstName: 'First name',
      lastName: 'Last name',
      company: 'Company name',
      country: 'Country',
      vat: 'VAT number',
      email: 'Email',
      phone: 'Phone',
      interest: 'Products / brands of interest',
      volume: 'Estimated quantity / volume',
      message: 'Message',
    },
    submitting: 'Sending…',
    invalid: 'Please check the highlighted fields.',
    success: '<strong>Thank you. Your business enquiry has been received.</strong><br>Ivan Arsenov will review your request and continue the conversation directly with you.',
    serverError: '<strong>Your enquiry could not be sent.</strong><br>Your details have been kept — please try again, or write directly to <a class="link-inline" href="mailto:info@ivan-arsenov.de">info@ivan-arsenov.de</a>.',
    notConfigured: '<strong>Enquiry delivery is not active on this environment yet.</strong><br>Nothing has been sent. Please write directly to <a class="link-inline" href="mailto:info@ivan-arsenov.de">info@ivan-arsenov.de</a> in the meantime.',
    errors: {
      firstName: 'Enter your first name.',
      lastName: 'Enter your last name.',
      company: 'Enter your company name.',
      country: 'Enter the country you are buying for.',
      email: 'Enter your email address.',
      emailFormat: 'Enter a complete email address, e.g. name@company.com',
      message: 'Tell us briefly what you are looking for.',
      consent: 'Please confirm before sending.',
    },
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
