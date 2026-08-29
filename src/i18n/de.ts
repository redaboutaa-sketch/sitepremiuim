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
    /* Nom accessible du lien de marque. L'image porte alt="" : le nom
       serait sinon annoncé deux fois, par l'image puis par le lien. */
    homeLabel: 'Ivan Arsenov — Startseite',
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
    hint: 'Weiterscrollen — 14 Marken',
  },

  categories: {
    h2: 'Eine Kategorie. Mehr Tiefe.',
    copy: 'Ivan Arsenov konzentriert sich auf alkoholfreie Getränke. Kein sortimentsfremder Katalog — sondern eine gezielte Auswahl an Erfrischungsgetränken für Fachhändler.',
  },

  /*
   * `discovery` a été retiré avec la section S4 le 2026-08-24 (voir
   * src/views/Home.astro). Ne pas réintroduire ces libellés sans réintroduire
   * la section : une clé de traduction orpheline finit toujours par être
   * réutilisée pour un autre propos que le sien.
   */

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
    // `{featured}` a été retiré : depuis la réduction à 14 articles, toutes
    // les marques sont mises en avant. « 14 Marken · 14 ausgewählt »
    // n'informe plus, il occupe seulement de la place.
    stats: '{total} Marken · {families} Familien',
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
    familiesValue: 'Vier, ausschließlich Erfrischungsgetränke',
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
    "updated": "Stand: 29. August 2026",
    "controllerHeading": "Verantwortlicher",
    "imprint": {
      "title": "Impressum",
      "providerHeading": "Angaben gemäß § 5 DDG",
      "contactHeading": "Kontakt",
      "contactBody": [
        "Anfragen erreichen Ivan Arsenov unmittelbar per E-Mail oder über das Anfrageformular dieser Website.",
        "Eine Telefonnummer wird nicht veröffentlicht: für Geschäftsanfragen ist derzeit keine eingerichtet."
      ],
      "taxHeading": "Umsatzsteuer",
      "taxBody": "Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:",
      "responsibleHeading": "Verantwortlich für den Inhalt",
      "responsibleBody": "Gemäß § 18 Abs. 2 Medienstaatsvertrag (MStV):",
      "sections": [
        {
          "heading": "Marken Dritter",
          "body": [
            "Sämtliche auf dieser Website gezeigten Markennamen, Logos und Produktabbildungen sind Eigentum der jeweiligen Rechteinhaber. Sie dienen der Kennzeichnung der Waren, mit denen dieses Unternehmen handelt.",
            "Ihre Darstellung auf dieser Website weist auf das Sortiment hin, mit dem Ivan Arsenov arbeitet. Sie begründet keine Aussage darüber, dass die Markeninhaber dieses Unternehmen unterstützen, sponsern oder mit ihm verbunden sind.",
            "Sind Sie Rechteinhaber und möchten die Verwendung Ihres Materials besprechen, schreiben Sie uns bitte an die oben genannte Anschrift."
          ]
        },
        {
          "heading": "Haftung für Inhalte",
          "body": [
            "Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.",
            "Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werden wir diese Inhalte umgehend entfernen."
          ]
        },
        {
          "heading": "Haftung für Links",
          "body": [
            "Diese Website enthält keine Links auf externe Websites. Sollten Links aufgenommen werden, so liegen deren Inhalte in der Verantwortung des jeweiligen Anbieters: auf sie haben wir keinen Einfluss.",
            "Verlinkte Seiten würden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Eine permanente inhaltliche Kontrolle ohne konkrete Anhaltspunkte einer Rechtsverletzung ist nicht zumutbar."
          ]
        },
        {
          "heading": "Verbraucherstreitbeilegung",
          "body": [
            "Diese Website richtet sich an Unternehmen, nicht an Verbraucher.",
            "Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle im Sinne des § 36 Verbraucherstreitbeilegungsgesetz (VSBG) teilzunehmen."
          ]
        }
      ]
    },
    "privacy": {
      "title": "Datenschutzerklärung",
      "sections": [
        {
          "heading": "Geltungsbereich",
          "body": [
            "Diese Erklärung beschreibt, wie auf dieser Website personenbezogene Daten verarbeitet werden. Der Verantwortliche im Sinne des Art. 4 Nr. 7 DSGVO ist am Ende dieser Seite genannt.",
            "Diese Website verwendet keine Reichweitenmessung, keine Werbekennungen, keine Zählpixel und keine Skripte Dritter. Sie setzt keine Cookies. Personenbezogene Daten werden in genau zwei Fällen verarbeitet: wenn Ihr Browser eine Seite abruft, und wenn Sie das Anfrageformular absenden."
          ]
        },
        {
          "heading": "Daten beim Aufruf einer Seite",
          "body": [
            "Bei jedem Seitenaufruf erfasst der Server des Hosting-Anbieters technische Daten: die IP-Adresse des anfragenden Geräts, Datum und Uhrzeit, die angeforderte Adresse, den HTTP-Status, die übertragene Datenmenge sowie den von Ihrem Gerät gemeldeten Browser und dessen Betriebssystem.",
            "Diese Daten sind erforderlich, um die Website auszuliefern sowie Angriffe zu erkennen und abzuwehren. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO — unser berechtigtes Interesse am sicheren und zuverlässigen Betrieb der Website.",
            "Diese Website wird bei Hostinger gehostet. Der Anbieter verarbeitet diese Protokolldaten für uns als Auftragsverarbeiter gemäß Art. 28 DSGVO. Wir führen sie nicht mit anderen Daten zusammen und nutzen sie nicht, um einzelne Besucher zu identifizieren."
          ]
        },
        {
          "heading": "Anfrageformular",
          "body": [
            "Das Formular verlangt Vorname, Nachname, Unternehmen, Land, E-Mail-Adresse und Nachricht. Freiwillig können Sie eine Umsatzsteuer-Identifikationsnummer, eine Telefonnummer, die Sie interessierenden Kategorien und eine Mengenschätzung angeben. Die Marken, die Sie Ihrer Anfrage hinzugefügt haben, werden mit übermittelt.",
            "Diese Daten dienen ausschließlich der Beantwortung Ihrer Anfrage und der Fortführung des geschäftlichen Gesprächs mit Ihnen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO für auf Ihre Anfrage hin erfolgende vorvertragliche Maßnahmen sowie Art. 6 Abs. 1 lit. f DSGVO für unser berechtigtes Interesse an der Beantwortung geschäftlicher Anfragen.",
            "Der Inhalt des Formulars wird uns per E-Mail zugestellt. Die Bereitstellung der Daten ist weder gesetzlich noch vertraglich vorgeschrieben; ohne die Pflichtangaben können wir die Anfrage jedoch nicht bearbeiten.",
            "Ihre Anfrage und die zugehörigen Daten verbleiben bei uns, solange dies zur Bearbeitung und zur Durchführung einer daraus entstehenden Geschäftsbeziehung erforderlich ist, und darüber hinaus so lange, wie handels- und steuerrechtliche Aufbewahrungsfristen es verlangen — in der Regel sechs beziehungsweise zehn Jahre nach §§ 257 HGB, 147 AO."
          ]
        },
        {
          "heading": "Schutz vor automatisierten Einsendungen",
          "body": [
            "Das Formular enthält ein für Besucher unsichtbares Feld und misst die Zeit zwischen dem Laden der Seite und dem Absenden. Beides dient allein dazu, automatisierte Einsendungen zu erkennen.",
            "Weder wird damit Ihr Verhalten ausgewertet, noch wird etwas davon gespeichert oder weitergegeben. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO — unser berechtigtes Interesse am Schutz des Formulars vor Missbrauch."
          ]
        },
        {
          "heading": "Keine Weitergabe an Dritte",
          "body": [
            "Schriften, Bilder und Skripte werden von dieser Domain ausgeliefert. Die Website ruft keinen externen Server auf; über diese Website erhält daher kein Dritter Ihre IP-Adresse.",
            "Ihre Daten werden nicht verkauft, nicht vermietet und nicht zu eigenen Zwecken Dritter weitergegeben. Eine Offenlegung erfolgt nur, soweit wir gesetzlich dazu verpflichtet sind, oder gegenüber Auftragsverarbeitern, die nach Art. 28 DSGVO weisungsgebunden für uns tätig werden — derzeit ausschließlich unser Hosting-Anbieter."
          ]
        },
        {
          "heading": "Ihre Rechte",
          "body": [
            "Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob wir Sie betreffende personenbezogene Daten verarbeiten, und gegebenenfalls Auskunft darüber zu erhalten (Art. 15 DSGVO), unrichtige Daten berichtigen zu lassen (Art. 16), die Löschung zu verlangen (Art. 17), die Verarbeitung einschränken zu lassen (Art. 18), Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten (Art. 20) sowie einer auf berechtigten Interessen beruhenden Verarbeitung jederzeit zu widersprechen (Art. 21).",
            "Für die Ausübung dieser Rechte genügt eine E-Mail an die unten genannte Adresse.",
            "Ihnen steht zudem ein Beschwerderecht bei einer Aufsichtsbehörde zu (Art. 77 DSGVO). Für uns zuständig ist: Die Landesbeauftragte für den Datenschutz Niedersachsen, Prinzenstraße 5, 30159 Hannover."
          ]
        }
      ]
    },
    "cookies": {
      "title": "Cookies & lokale Speicherung",
      "sections": [
        {
          "heading": "Diese Website setzt keine Cookies",
          "body": [
            "Es wird kein Cookie gesetzt — weder zur Reichweitenmessung noch zu Werbezwecken, zur Profilbildung oder zu irgendeinem anderen Zweck. Weder durch uns noch durch andere: es wird kein Dienst Dritter geladen, sodass Dritte gar nicht in der Lage sind, eines zu setzen."
          ]
        },
        {
          "heading": "Ihre Anfrageauswahl",
          "body": [
            "Wenn Sie eine Marke Ihrer Anfrage hinzufügen, werden die von Ihnen gewählten Kennungen im sessionStorage Ihres Browsers abgelegt.",
            "Er enthält ausschließlich diese Kennungen — keine Werbekennung, kein Profil, keine personenbezogenen Daten. Er besteht allein auf Ihrem Gerät und wird verworfen, sobald Sie den Tab schließen. An einen Server wird nichts übermittelt, solange Sie das Anfrageformular nicht selbst absenden.",
            "Sein einziger Zweck ist, eine Auswahl von einer Seite zur nächsten zu erhalten: ohne ihn wären die gewählten Marken beim Seitenwechsel verloren."
          ]
        },
        {
          "heading": "Schriften und Bilder",
          "body": [
            "Schriften und Bilder werden von dieser Domain ausgeliefert. Es erfolgt keine Anfrage an ein Content Delivery Network oder einen Schriftendienst; diese Website übermittelt daher keine Besucher-IP-Adresse an Dritte."
          ]
        },
        {
          "heading": "Warum es kein Einwilligungsbanner gibt",
          "body": [
            "Das Speichern von Informationen auf Ihrem Endgerät bedarf nach § 25 Abs. 1 TDDDG grundsätzlich Ihrer Einwilligung. § 25 Abs. 2 Nr. 2 TDDDG nimmt davon Speicherungen aus, die unbedingt erforderlich sind, um einen von Ihnen ausdrücklich gewünschten Telemediendienst zur Verfügung zu stellen.",
            "Die Anfrageauswahl fällt unter diese Ausnahme: sie entsteht erst, wenn Sie eine Marke hinzufügen, sie enthält nur das, was dieser Klick bedeutet, und sie besteht allein, um die von Ihnen gewünschte Funktion bereitzustellen. Da darüber hinaus nichts gespeichert und kein Cookie gesetzt wird, bleibt für ein Banner nichts übrig, wonach es fragen könnte.",
            "Ein Einwilligungsbanner, das um eine nicht benötigte Erlaubnis bäte, würde ein falsches Bild davon vermitteln, was diese Website tut."
          ]
        }
      ]
    }
  },

  notFound: {
    title: 'Diese Seite gibt es nicht.',
    copy: 'Die Adresse hat sich möglicherweise geändert oder der Link ist unvollständig. Das gesamte Getränkesortiment ist einen Klick entfernt.',
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
