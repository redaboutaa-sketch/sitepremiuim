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
    /* Nom accessible du lien de marque. L'image porte alt="" : le nom
       serait sinon annoncé deux fois, par l'image puis par le lien. */
    homeLabel: 'Ivan Arsenov — Home',
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
    hint: 'Scroll to explore — 14 brands',
  },

  categories: {
    h2: 'One category. Deeper focus.',
    copy: 'Ivan Arsenov is focused on non-alcoholic beverages. No unrelated product catalogue — just a dedicated selection of soft drinks for professional buyers.',
  },

  /*
   * `discovery` a été retiré avec la section S4 le 2026-08-24 (voir
   * src/views/Home.astro). Ne pas réintroduire ces libellés sans réintroduire
   * la section : une clé de traduction orpheline finit toujours par être
   * réutilisée pour un autre propos que le sien.
   */

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
    // `{featured}` a été retiré : depuis la réduction à 14 articles, toutes
    // les marques sont mises en avant. « 14 brands · 14 featured » n'informe
    // plus, il occupe seulement de la place.
    stats: '{total} brands · {families} families',
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
    familiesValue: 'Four, soft drinks only',
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

  legal: {
    "eyebrow": "Legal",
    "updated": "Last updated: 29 August 2026",
    "controllerHeading": "Controller",
    "imprint": {
      "title": "Imprint",
      "providerHeading": "Information pursuant to § 5 DDG",
      "contactHeading": "Contact",
      "contactBody": [
        "Enquiries reach Ivan Arsenov directly by email or through the business enquiry form on this website.",
        "No telephone number is published: none is currently designated for business enquiries."
      ],
      "taxHeading": "VAT identification",
      "taxBody": "VAT identification number pursuant to § 27a of the German Value Added Tax Act (UStG):",
      "responsibleHeading": "Responsible for editorial content",
      "responsibleBody": "Pursuant to § 18 (2) of the German Interstate Media Treaty (MStV):",
      "sections": [
        {
          "heading": "Third-party trademarks",
          "body": [
            "All brand names, logos and product images shown on this website are the property of their respective owners. They are used to identify the goods this business trades in.",
            "Their presence on this website indicates the assortment Ivan Arsenov works with. It does not imply that the trademark owners endorse, sponsor or are otherwise affiliated with this business.",
            "If you are a trademark owner and wish to discuss the use of your material here, please write to us at the address above."
          ]
        },
        {
          "heading": "Liability for content",
          "body": [
            "As a service provider we are responsible for our own content on these pages under § 7 (1) DDG and general law. Under §§ 8 to 10 DDG, however, we are not obliged to monitor transmitted or stored third-party information, or to investigate circumstances indicating unlawful activity.",
            "Obligations to remove or block the use of information under general law remain unaffected. Liability in this respect arises only from the point at which a concrete infringement becomes known. Should we become aware of such an infringement, we will remove the content without delay."
          ]
        },
        {
          "heading": "Liability for links",
          "body": [
            "This website contains no links to external websites. Should links be added, their content would remain the responsibility of the respective operator: we have no influence over it.",
            "Any linked pages would be checked for possible legal infringement at the time of linking. Permanent monitoring without concrete evidence of an infringement is not reasonable."
          ]
        },
        {
          "heading": "Consumer dispute resolution",
          "body": [
            "This website addresses businesses, not consumers.",
            "We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board within the meaning of § 36 of the German Consumer Dispute Resolution Act (VSBG)."
          ]
        }
      ]
    },
    "privacy": {
      "title": "Privacy Policy",
      "sections": [
        {
          "heading": "Scope",
          "body": [
            "This policy describes how personal data is processed on this website. Named at the end of this page is the controller within the meaning of Article 4 (7) GDPR.",
            "This website has no analytics, no advertising identifiers, no tracking pixels and no third-party scripts. It sets no cookies. Personal data is processed in exactly two circumstances: when your browser requests a page, and when you submit the business enquiry form."
          ]
        },
        {
          "heading": "Data processed when you visit a page",
          "body": [
            "Each time a page is requested, the hosting provider's server records technical data: the IP address of the requesting device, the date and time, the address requested, the HTTP status, the volume transferred, and the browser and operating system reported by your device.",
            "This data is required to deliver the website and to detect and defend against attacks. The legal basis is Article 6 (1) (f) GDPR — our legitimate interest in operating the site securely and reliably.",
            "This website is hosted by Hostinger, which processes this log data on our behalf as a processor under Article 28 GDPR. We do not merge it with other data and do not use it to identify individual visitors."
          ]
        },
        {
          "heading": "Business enquiry form",
          "body": [
            "The form requires your first name, last name, company, country, email address and message. You may additionally provide a VAT number, a telephone number, the categories you are interested in and an estimated volume. The brands you add to your enquiry are transmitted with it.",
            "This data is used solely to answer your enquiry and to continue the commercial conversation with you. The legal basis is Article 6 (1) (b) GDPR for steps taken at your request prior to entering into a contract, and Article 6 (1) (f) GDPR for our legitimate interest in responding to business enquiries.",
            "The content of the form is delivered to us by email. Providing the data is neither required by law nor by contract, but without the required fields we cannot process the enquiry.",
            "Your enquiry and the associated data remain with us for as long as needed to handle it and to conduct any resulting business relationship, and thereafter for as long as statutory retention periods under commercial and tax law require — as a rule six or ten years under §§ 257 HGB and 147 AO."
          ]
        },
        {
          "heading": "Spam protection",
          "body": [
            "The form contains a field hidden from visitors and measures the time between the page loading and the form being sent. Both serve to detect automated submissions.",
            "Neither is used to analyse your behaviour, neither is stored, and neither is passed on. The legal basis is Article 6 (1) (f) GDPR — our legitimate interest in protecting the form against abuse."
          ]
        },
        {
          "heading": "No transfer to third parties",
          "body": [
            "Typefaces, images and scripts are served from this domain. The website makes no request to any external server, so no third party receives your IP address through this website.",
            "Your data is not sold, not rented and not passed to third parties for their own purposes. It is disclosed only where we are legally obliged to do so, or to processors acting on our instructions under Article 28 GDPR — currently our hosting provider alone."
          ]
        },
        {
          "heading": "Your rights",
          "body": [
            "You have the right to obtain confirmation as to whether we process personal data concerning you and, if so, to access it (Article 15 GDPR), to have inaccurate data rectified (Article 16), to have data erased (Article 17), to restrict processing (Article 18), to receive your data in a structured, commonly used and machine-readable format (Article 20), and to object at any time to processing based on legitimate interests (Article 21).",
            "To exercise any of these rights, an email to the address below is sufficient.",
            "You also have the right to lodge a complaint with a supervisory authority (Article 77 GDPR). The authority responsible for us is: Die Landesbeauftragte für den Datenschutz Niedersachsen, Prinzenstraße 5, 30159 Hannover, Germany."
          ]
        }
      ]
    },
    "cookies": {
      "title": "Cookies & Local Storage",
      "sections": [
        {
          "heading": "This website sets no cookies",
          "body": [
            "No cookie is set for analytics, advertising, profiling or any other purpose. Not by us, and not by anyone else: no third-party service is loaded, so no third party is in a position to set one."
          ]
        },
        {
          "heading": "Your enquiry selection",
          "body": [
            "When you add a brand to your enquiry, the identifiers you have selected are written to your browser's sessionStorage.",
            "It holds only those identifiers — no advertising identifier, no profile, no personal data. It exists on your device alone and is discarded when you close the tab. Nothing is transmitted to any server unless you send the enquiry form yourself.",
            "Its sole purpose is to let a selection survive from one page to the next: without it, the brands you picked would be lost the moment you navigated."
          ]
        },
        {
          "heading": "Fonts and images",
          "body": [
            "Typefaces and images are served from this domain. No request goes to a content delivery network or to a font service, so this website transmits no visitor IP address to a third party."
          ]
        },
        {
          "heading": "Why there is no consent banner",
          "body": [
            "Storing information on your device requires consent under § 25 (1) of the German Telecommunications Digital Services Data Protection Act (TDDDG). § 25 (2) no. 2 exempts storage that is strictly necessary to provide a telemedia service you have expressly requested.",
            "The enquiry selection falls under that exemption: it is created only when you click to add a brand, it contains only what that click implies, and it exists solely to deliver the feature you asked for. Since nothing else is stored and no cookie is set, there is nothing left for a banner to ask about.",
            "A consent banner that asked for permission we do not need would give a misleading impression of what this website does."
          ]
        }
      ]
    }
  },

  notFound: {
    title: 'This page does not exist.',
    copy: 'The address may have changed, or the link may be incomplete. The full drinks selection is a click away.',
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
