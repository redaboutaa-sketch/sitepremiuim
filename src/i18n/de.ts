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

  enquiry: {
    add: 'Zur Anfrage hinzufügen',
    selected: 'Ausgewählt',
    remove: 'Entfernen',
    clearAll: 'Alle entfernen',
    full: 'Auswahl voll',
    countOne: '{n} ausgewählt',
    countMany: '{n} ausgewählt',
    panelTitle: 'Ihre Anfrage',
    panelLead: 'Die von Ihnen ausgewählten Marken. Sie werden Ihrer Geschäftsanfrage beigefügt — dort können Sie sie weiterhin bearbeiten.',
    empty: 'Noch keine Marken ausgewählt.',
    request: 'Angebot anfragen',
    close: 'Schließen',
    open: 'Anfrage öffnen',
  },

  drinks: {
    eyebrow: 'Die Auswahl',
    intro: 'Eine fokussierte Auswahl alkoholfreier Getränke — von bekannten Weltmarken bis zu besonderen internationalen Geschmacksrichtungen.',
    searchLabel: 'Marken durchsuchen',
    searchPlaceholder: 'Marke suchen…',
    filterLabel: 'Nach Kategorie filtern',
    filterAll: 'Alle',
    reset: 'Zurücksetzen',
    countOne: '{n} Marke',
    countMany: '{n} Marken',
    internationalTag: 'Internationale Entdeckung',
    emptyTitle: 'Keine Marke passt zu dieser Suche.',
    emptyCopy: 'Versuchen Sie eine andere Schreibweise oder setzen Sie die Filter zurück. Wenn Sie etwas suchen, das nicht gelistet ist, sagen Sie es uns direkt.',
    emptyCta: 'Geschäftsanfrage senden',
  },

  brands: {
    eyebrow: 'Das Verzeichnis',
    h1: 'Marken für jede Art von Erfrischung.',
    intro: 'Entdecken Sie Weltmarken, regionale Favoriten und besondere Getränkemarken aus unserem fokussierten Sortiment.',
    stats: '{total} Marken · {families} Familien · {featured} ausgewählt',
    foot: 'Jede Marke lässt sich einer Geschäftsanfrage hinzufügen. Sagen Sie uns, welche für Ihr Sortiment zählen — den Rest übernehmen wir.',
  },

  about: {
    eyebrow: 'Über Ivan Arsenov',
    h1: 'Fokus auf Erfrischungsgetränke. Gemacht für den Handel.',
    body: [
      'Ivan Arsenov ist ein B2B-Handelsunternehmen mit Sitz in Wildeshausen, Deutschland, spezialisiert auf alkoholfreie Getränke.',
      'Das Sortiment vereint international bekannte Namen, regionale Favoriten und besondere Getränkekonzepte für Fachhändler.',
      'Unser Ansatz ist bewusst fokussiert: verstehen, was Sie suchen, die passenden Produkte identifizieren und das Gespräch um Ihren Bedarf herum aufbauen.',
    ],
    detailsLabel: 'Unternehmensangaben',
    factSelection: 'Sortiment',
    factFamilies: 'Familien',
    familiesValue: 'Fünf, ausschließlich Erfrischungsgetränke',
    factBased: 'Sitz',
  },

  contact: {
    eyebrow: 'Geschäftsanfrage',
    h1: 'Reden wir über Geschäfte.',
    intro: 'Sie suchen bestimmte Marken, Geschmacksrichtungen oder Getränkekategorien? Sagen Sie uns, was Sie brauchen — wir setzen das Gespräch direkt fort.',
    optional: '— optional',
    requiredNote: 'Nur Name, Firma, Land, E-Mail und Nachricht sind erforderlich.',
    noSelection: 'Noch keine Marken ausgewählt — Sie können unten auch frei beschreiben, was Sie suchen.',
    interestPlaceholder: 'Wonach suchen Sie sonst noch…',
    volumePlaceholder: 'z. B. Paletten pro Monat, Containerladungen',
    consent: 'Ich bin einverstanden, dass meine Angaben zur Beantwortung dieser Anfrage verwendet werden. Siehe {privacy}.',
    fields: {
      firstName: 'Vorname',
      lastName: 'Nachname',
      company: 'Firmenname',
      country: 'Land',
      vat: 'USt-IdNr.',
      email: 'E-Mail',
      phone: 'Telefon',
      interest: 'Produkte / Marken von Interesse',
      volume: 'Geschätzte Menge / Volumen',
      message: 'Nachricht',
    },
    submitting: 'Wird gesendet…',
    invalid: 'Bitte prüfen Sie die markierten Felder.',
    success: '<strong>Vielen Dank. Ihre Geschäftsanfrage ist eingegangen.</strong><br>Ivan Arsenov prüft Ihre Anfrage und führt das Gespräch direkt mit Ihnen weiter.',
    serverError: '<strong>Ihre Anfrage konnte nicht gesendet werden.</strong><br>Ihre Angaben wurden beibehalten — bitte versuchen Sie es erneut oder schreiben Sie direkt an <a class="link-inline" href="mailto:info@ivan-arsenov.de">info@ivan-arsenov.de</a>.',
    notConfigured: '<strong>Der Anfrageversand ist in dieser Umgebung noch nicht aktiv.</strong><br>Es wurde nichts gesendet. Schreiben Sie bitte vorerst direkt an <a class="link-inline" href="mailto:info@ivan-arsenov.de">info@ivan-arsenov.de</a>.',
    errors: {
      firstName: 'Bitte geben Sie Ihren Vornamen ein.',
      lastName: 'Bitte geben Sie Ihren Nachnamen ein.',
      company: 'Bitte geben Sie Ihren Firmennamen ein.',
      country: 'Bitte geben Sie das Land an, für das Sie einkaufen.',
      email: 'Bitte geben Sie Ihre E-Mail-Adresse ein.',
      emailFormat: 'Bitte geben Sie eine vollständige E-Mail-Adresse ein, z. B. name@firma.de',
      message: 'Beschreiben Sie kurz, wonach Sie suchen.',
      consent: 'Bitte bestätigen Sie vor dem Senden.',
    },
  },

  legal: {
    "eyebrow": "Rechtliches",
    "pendingTitle": "Entwurf zur rechtlichen Prüfung.",
    "pendingBody": "Die Angaben zum Unternehmen sind korrekt. Die nachstehenden Rechtstexte sind ein strukturierter Platzhalter und müssen vor der Veröffentlichung durch die Rechtsberatung von Ivan Arsenov geprüft werden.",
    "controllerHeading": "Verantwortlicher",
    "imprint": {
      "title": "Impressum",
      "providerHeading": "Angaben gemäß § 5 DDG",
      "contactHeading": "Kontakt",
      "taxHeading": "Steuerliche Angaben",
      "taxNumber": "Steuernummer",
      "responsibleHeading": "Inhaltlich verantwortlich",
      "trademarkHeading": "Marken Dritter"
    },
    "privacy": {
      "title": "Datenschutzerklärung",
      "sections": [
        {
          "heading": "Was diese Website erhebt",
          "body": [
            "Diese Website nutzt keine Analysewerkzeuge, keine Werbe-Identifikatoren und keine Tracker Dritter. Es werden keine Cookies zu Mess- oder Profilzwecken gesetzt.",
            "Personenbezogene Daten werden ausschließlich verarbeitet, wenn Sie das Formular für Geschäftsanfragen absenden."
          ]
        },
        {
          "heading": "Formular für Geschäftsanfragen",
          "body": [
            "Erhoben werden Name, Firma, Land, E-Mail-Adresse und Nachricht sowie optional USt-IdNr., Telefon, Marken von Interesse und geschätztes Volumen.",
            "Diese Angaben dienen ausschließlich der Beantwortung Ihrer Anfrage und der Fortführung des geschäftlichen Gesprächs.",
            "Rechtsgrundlage, Speicherdauer und Ihre Rechte sind vor der Veröffentlichung rechtlich zu bestätigen."
          ]
        },
        {
          "heading": "Hosting und externe Dienste",
          "body": [
            "Schriften werden von dieser Domain ausgeliefert. Die Website stellt keine Anfragen an Server Dritter.",
            "Die Verarbeitung von Server-Logdaten durch den Hosting-Anbieter unterliegt einer gesonderten Vereinbarung, die vor der Veröffentlichung zu dokumentieren ist."
          ]
        },
        {
          "heading": "Ihre Rechte",
          "body": [
            "Sie können Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit verlangen sowie der Verarbeitung widersprechen.",
            "Der genaue Wortlaut dieser Rechte und die zuständige Aufsichtsbehörde sind rechtlich zu bestätigen."
          ]
        }
      ]
    },
    "cookies": {
      "title": "Cookies & lokale Speicherung",
      "sections": [
        {
          "heading": "Cookies",
          "body": [
            "Diese Website setzt keine Cookies zu Analyse-, Werbe- oder Profilzwecken.",
            "Es wird kein Dienst Dritter geladen, daher kann kein Dritter über diese Website Cookies setzen."
          ]
        },
        {
          "heading": "Auswahl für Anfragen",
          "body": [
            "Wenn Sie eine Marke Ihrer Anfrage hinzufügen, werden die von Ihnen gewählten Kennungen im sessionStorage Ihres Browsers gespeichert — einer auf die Browsing-Sitzung begrenzten Speicherung, ohne Absicht der Persistenz zwischen Sitzungen.",
            "Sie enthält ausschließlich die von Ihnen gewählten Markenkennungen. Kein Werbe-Identifikator, kein Profiling, keine personenbezogenen Daten.",
            "Sie wird an keinen Server übermittelt, solange Sie das Anfrageformular nicht absenden."
          ]
        },
        {
          "heading": "Schriften und Assets",
          "body": [
            "Schriften und Bilder werden von dieser Domain ausgeliefert. Es erfolgt keine Anfrage an ein Content Delivery Network, sodass durch diese Website keine Besucher-IP an Dritte übermittelt wird."
          ]
        },
        {
          "heading": "Einwilligungsregime",
          "body": [
            "Diese Seite beschreibt die technische Nutzung der Browser-Speicherung. Das anwendbare Einwilligungsregime ist vor der Veröffentlichung durch die Rechtsberatung von Ivan Arsenov zu bestimmen."
          ]
        }
      ]
    }
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
