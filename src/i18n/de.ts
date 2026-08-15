/**
 * DE — adaptation professionnelle, pas traduction mot-à-mot.
 *
 * Le type `Dictionary` impose la parité : une clé manquante ou en trop
 * fait échouer la compilation.
 *
 * Formulations définitives arrêtées en TR-017 ; ce fichier porte déjà la
 * terminologie B2B validée (Großhandel · Anfrage · Angebot · Sortiment).
 */

import type { Dictionary } from './en';

export const de: Dictionary = {
  meta: {
    siteName: 'Ivan Arsenov',
    tagline: 'B2B Erfrischungsgetränke · Internationale Auswahl',
  },

  nav: {
    drinks: 'Getränke',
    brands: 'Marken',
    about: 'Über uns',
    contact: 'Kontakt',
    skipToContent: 'Zum Hauptinhalt springen',
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    primary: 'Hauptnavigation',
    mobile: 'Seitennavigation',
    language: 'Sprache',
  },

  cta: {
    primary: 'Angebot anfragen',
    secondary: 'Getränkesortiment entdecken',
    addToEnquiry: 'Zur Anfrage hinzufügen',
    added: 'Hinzugefügt',
    requestQuote: 'Angebot anfragen',
    sendEnquiry: 'Geschäftsanfrage senden',
  },

  hero: {
    eyebrow: 'B2B Erfrischungsgetränke · Internationale Auswahl',
    h1: 'Erfrischung ohne Grenzen.',
    support:
      'Von Weltmarken bis zu besonderen internationalen Geschmacksrichtungen: Ivan Arsenov bündelt eine fokussierte Auswahl alkoholfreier Getränke für Fachhändler.',
    stageLabel: 'Ausgewählte Marken',
  },

  featured: {
    eyebrow: 'Weltmarken · Internationale Favoriten',
    h2: 'Marken, die man kennt. Geschmacksrichtungen, die überraschen.',
    copy: 'Bekannte Namen neben internationalen Varianten, besonderen Geschmacksrichtungen und neuen Getränkeformaten — alles in einem fokussierten Sortiment alkoholfreier Getränke.',
    trackLabel: 'Ausgewählte Marken',
    hint: 'Weiterscrollen — 16 von 62 Marken',
  },

  categories: {
    h2: 'Eine Kategorie. Mehr Tiefe.',
    copy: 'Ivan Arsenov konzentriert sich auf alkoholfreie Getränke. Kein sortimentsfremder Katalog — sondern eine gezielte Auswahl an Erfrischungsgetränken für Fachhändler.',
  },

  discovery: {
    eyebrow: 'Jenseits des Gewohnten',
    h2: 'Entdecken Sie etwas anderes.',
    copy: 'Bekannte Marken sehen weltweit oft ganz anders aus. Entdecken Sie regionale Favoriten, ungewöhnliche Geschmacksrichtungen und besondere Erfrischungsgetränke, die dem Regal etwas Neues geben.',
    cta: 'Internationale Entdeckungen ansehen',
  },

  process: {
    h2: 'Bewusst einfach.',
    step1: { title: 'Entdecken', body: 'Sehen Sie sich die Getränke und Marken an, die zu Ihrem Geschäft passen.' },
    step2: { title: 'Anfragen', body: 'Wählen Sie die Produkte aus, die Sie interessieren, und schildern Sie uns Ihren Bedarf.' },
    step3: { title: 'Ins Geschäft kommen', body: 'Ivan Arsenov prüft Ihre Anfrage und führt das Gespräch direkt mit Ihnen weiter.' },
  },

  finalCta: {
    eyebrow: 'Reden wir über Getränke',
    h2: 'Suchen Sie die passenden Produkte für Ihr Sortiment?',
    copy: 'Sagen Sie uns, wonach Sie suchen — und starten Sie das direkte Gespräch mit Ivan Arsenov.',
  },

  pages: {
    home: {
      title: 'B2B Großhandel für Erfrischungsgetränke — Internationale Auswahl',
      description:
        'Ivan Arsenov ist ein B2B-Handelsunternehmen für alkoholfreie Getränke und vereint international bekannte Marken mit besonderen Geschmacksrichtungen für Fachhändler.',
    },
    drinks: {
      title: 'Getränkesortiment entdecken',
      description:
        'Eine fokussierte Auswahl alkoholfreier Getränke — von bekannten Weltmarken bis zu besonderen internationalen Geschmacksrichtungen.',
    },
    brands: {
      title: 'Marken',
      description:
        'Entdecken Sie Weltmarken, regionale Favoriten und besondere Getränkemarken aus unserem fokussierten Sortiment.',
    },
    about: {
      title: 'Über uns',
      description:
        'Ivan Arsenov ist ein B2B-Handelsunternehmen mit Sitz in Wildeshausen, spezialisiert auf alkoholfreie Getränke für Fachhändler.',
    },
    contact: {
      title: 'Geschäftsanfrage',
      description:
        'Sie suchen bestimmte Marken, Geschmacksrichtungen oder Getränkekategorien? Sagen Sie uns, was Sie brauchen — wir setzen das Gespräch direkt mit Ihnen fort.',
    },
    imprint: {
      title: 'Impressum',
      description: 'Rechtliche Angaben zu Ivan Arsenov, Wildeshausen, Deutschland.',
    },
    privacy: {
      title: 'Datenschutzerklärung',
      description:
        'Wie Ivan Arsenov personenbezogene Daten verarbeitet, die über diese Website übermittelt werden.',
    },
    cookies: {
      title: 'Cookies & lokale Speicherung',
      description:
        'Welche Technologien diese Website nutzt, um Informationen in Ihrem Browser zu speichern.',
    },
  },

  footer: {
    nav: 'Navigation',
    legal: 'Rechtliches',
    contact: 'Kontakt',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    cookies: 'Cookies',
    vatId: 'USt-IdNr.',
    trademarkNotice:
      'Alle Marken, Markennamen und Logos sind Eigentum der jeweiligen Rechteinhaber. Ihre Verwendung auf dieser Website erfolgt ausschließlich zu Referenzzwecken und weist auf die über Ivan Arsenov erhältlichen Produkte hin. Eine Verbindung, Förderung oder Billigung wird damit nicht impliziert.',
  },
};
