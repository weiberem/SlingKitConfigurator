/**
 * Sling Aircraft Switzerland – Configurator Katalog
 *
 * Alle Preise in USD ab Werk. Richtwerte – verbindliche Angebote über
 * den autorisierten Sling Aircraft Switzerland Dealer.
 */
window.SLING_CATALOG = {

  /* ------------------------------------------------------------------
   * Sales-Kontakt für die Werks-Auftrags-Liste (E-Mail-Empfänger der
   * "Sales-Team Export"-Funktion). Hier können mehrere Empfänger als
   * Komma-Liste eingetragen werden, z.B. greg@airplanefactory.com.
   * ----------------------------------------------------------------*/
  salesContact: {
    name: 'Sling Aircraft Factory (JNB)',
    email: 'sales@airplanefactory.com',
    cc: ''
  },


  /* --- Google Sheet als Preis-Quelle ---
   * Leer lassen, um nur die lokalen Preise unten zu verwenden.
   * Format: publizierte CSV-URL eines Google Sheets.
   * Erzeugen via: Datei → Freigeben → Im Web veröffentlichen → CSV.
   * Beispiel: https://docs.google.com/spreadsheets/d/e/2PACX-XXX/pub?gid=0&single=true&output=csv
   */
  pricesSheetUrl: '',

  /* Lokal hinterlegter Preisstand – wird angezeigt, wenn das Sheet nicht erreichbar ist. */
  pricesUpdated: '2026-05-21',

  defaultRates: {
    USD: 1.0,
    CHF: 0.88,
    EUR: 0.92
  },

  /* Komplett-Rabatt in Prozent auf den Gesamtpreis, wenn alle Kit-Teile gewählt sind. */
  bundleDiscountPct: 0.02,

  models: [
    {
      id: 'sling2',
      name: 'Sling 2',
      tag: '2-Seat · LSA',
      icon: 'plane-low',
      description: '2-Sitzer-Tiefdecker. Robust, sparsam, ideal für Schulung und Reise.',
      partsBaseSum: 38500,
      parts: [
        { id: 'empennage',   label: 'Empennage (Tail) Kit', desc: 'Leitwerk komplett: Stabilisatoren, Ruder, Scharniere, Trimmtab, Endkappen, Trim Servo Unit, Clevis Kit, Hardware und Bauanleitung.', price: 3260 },
        { id: 'wing',        label: 'Wing Kit',             desc: 'Flügelsatz komplett: Holme, Klappen, Querruder, Tanks, Composite Wingtips, AOA, 2x LED Landelichter, Strobes, Tankgeber. Pitotrohr separat.', price: 12640 },
        { id: 'fuselage',    label: 'Fuselage Kit',         desc: 'Rumpf komplett: Mittelholm, 2 Sitze, Steuerung (Stick, Pedale), Brandschott, Motoraufhängung, Klappenaktuator, Heizsystem.', price: 13180 },
        { id: 'undercarriage', label: 'Undercarriage Kit',  desc: 'Fahrwerk komplett: Haupt-/Bugfahrwerk, Aufhängung, Lager, Achsen, hydraulisches Bremssystem, 6-Ply Reifen und Schläuche.', price: 6720 },
        { id: 'finishing',   label: 'Finishing Kit',        desc: 'Verkleidungen, Interieur-Panels, Türmechanismen, Hardware-Kits, Bauanleitungs-Set, Decals.', price: 2700 }
      ],
      compatibleEngines: ['rotax912uls', 'rotax912is', 'rotax915is'],
      compatibleAvionics: ['vfr', 'standard', 'advanced', 'premium'],
      image: 'assets/models/sling2/Sling2-InFlight.jpg',
      gallery: [
        'assets/models/sling2/Sling2-InFlight.jpg',
        'assets/models/sling2/Sling2-InFlightTD.jpg'
      ],
      infoUrl: 'https://airplanefactory.com/aircraft/sling-2/'
    },
    {
      id: 'tsi',
      name: 'Sling TSi',
      tag: '4-Seat · Turbo Sport',
      icon: 'plane-low',
      badge: 'Bestseller',
      description: 'High-Performance 4-Sitzer mit Rotax 915/916 iS. Mehrfach ausgezeichnet, schnell, effizient.',
      partsBaseSum: 79436,
      parts: [
        { id: 'empennage',   label: 'Empennage (Tail) Kit', desc: 'Leitwerk komplett: Stabilisatoren, Ruder, Scharniere, Trimmtab, Endkappen, Trim Servo Unit, Clevis Kit, Hardware und Bauanleitung.', price: 5318 },
        { id: 'wing',        label: 'Wing Kit',             desc: 'Flügelsatz komplett: vormontierte Holme, Klappen, Querruder, Tanks, Composite Wingtips, AOA, 4x LED Landelichter, Strobes, Tankgeber, rutschfester Gehbereich. Pitotrohr separat.', price: 20801 },
        { id: 'fuselage',    label: 'Fuselage Kit',         desc: 'Rumpf komplett: Mittelholm, 4 Sitze, Steuerung (Gas, Knüppel, Pedale), Brandschott, Motoraufhängung, Klappenaktuator, Firex Foam, Autopilot-Halterungen, Klima-/Heizsystem.', price: 22198 },
        { id: 'undercarriage', label: 'Undercarriage Kit',  desc: 'Fahrwerk komplett: Haupt-/Bugfahrwerk, Aufhängung, Lager, Achsen, hydraulisches Bremssystem, 6-Ply Reifen und Schläuche.', price: 13840 },
        { id: 'finishing',   label: 'Finishing Kit',        desc: 'Verkleidungen, Interieur-Panels, Türmechanismen, Hardware-Kits, Bauanleitungs-Set, Decals.', price: 17279 }
      ],
      compatibleEngines: ['rotax915is', 'rotax916is'],
      compatibleAvionics: ['standard', 'advanced', 'premium'],
      image: 'assets/models/tsi/main.png',
      gallery: [
        'assets/models/tsi/main.png',
        'assets/models/tsi/SlingTSI-InFlight.jpg'
      ],
      infoUrl: 'https://airplanefactory.com/aircraft/sling-tsi/'
    },
    {
      id: 'highwing',
      name: 'Sling High Wing',
      tag: '4-Seat · High Wing',
      icon: 'plane-high',
      badge: 'Neu',
      description: 'Hochdecker mit Rundumsicht – ideal für Backcountry, Bush und Familie.',
      partsBaseSum: 81450,
      parts: [
        { id: 'empennage',   label: 'Empennage (Tail) Kit', desc: 'Leitwerk komplett mit V-Stabilisator-Streben, Ruder, Trimmtab, Trim Servo Unit, Endkappen.', price: 5510 },
        { id: 'wing',        label: 'Wing Kit',             desc: 'Hochdecker-Flügel mit Streben, Tanks, Klappen, Querruder, LED-Beleuchtung, Strobes, AOA-Sensor.', price: 22980 },
        { id: 'fuselage',    label: 'Fuselage Kit',         desc: 'Rumpf komplett: 4 Sitze, Steuerung, Brandschott, Motoraufhängung, grosse Schiebetüren, Klima-/Heizsystem.', price: 23260 },
        { id: 'undercarriage', label: 'Undercarriage Kit',  desc: 'Robustes Fahrwerk mit Federbeinen, Tundra-tauglichen Achsen, hydraulischen Bremsen.', price: 13900 },
        { id: 'finishing',   label: 'Finishing Kit',        desc: 'Cockpit-Verkleidungen, Bodenplatten, Cargo-Bereich, Hardware-Kit, Decals, Bauanleitung.', price: 15800 }
      ],
      compatibleEngines: ['rotax915is', 'rotax916is'],
      compatibleAvionics: ['standard', 'advanced', 'premium'],
      image: 'assets/models/highwing/SlingHW-InFlight.jpg',
      gallery: [
        'assets/models/highwing/SlingHW-InFlight.jpg',
        'assets/models/highwing/SlingHW-InFlight2.jpg',
        'assets/models/highwing/SlingHW-InFlightTD.jpg'
      ],
      infoUrl: 'https://airplanefactory.com/aircraft/sling-high-wing/'
    }
  ],

  /* Optionaler Firewall-Forward / Fuel-Kit – Preise abhängig vom gewählten Motor */
  firewallForward: {
    label: 'Firewall Forward + Fuel Kit',
    desc: 'Motoraufhängung, Cowling, Auspuff, Kraftstoffsystem ab Brandschott – passend zum gewählten Motor.',
    perEngine: {
      rotax912uls: 5980,
      rotax912is:  6450,
      rotax915is:  7350,
      rotax916is:  7711
    }
  },

  engines: [
    { id: 'rotax912uls', label: 'Rotax 912 ULS',     desc: '100 PS · Vergaser · zuverlässiger Klassiker.',          price: 28500,
      image: 'assets/engines/rotax912uls/main.jpg', infoUrl: 'https://www.flyrotax.com/produkte/details/rotax-912-uls-s-2.html' },
    { id: 'rotax912is',  label: 'Rotax 912iS Sport', desc: '100 PS · Einspritzung · sparsam und effizient.',        price: 33500,
      image: 'assets/engines/rotax912is/main.jpg',  infoUrl: 'https://www.flyrotax.com/produkte/details/rotax-912-is-sport.html' },
    { id: 'rotax915is',  label: 'Rotax 915iS',       desc: '141 PS · Turbo + Einspritzung · 4-Sitzer-Performance.', price: 49500,
      image: 'assets/engines/rotax915is/main.jpg',  infoUrl: 'https://www.flyrotax.com/produkte/details/rotax-915-i-s-c-a.html' },
    { id: 'rotax916is',  label: 'Rotax 916iS',       desc: '160 PS · neueste Generation · Top-Performance.',        price: 54500,
      image: 'assets/engines/rotax916is/main.jpg',  infoUrl: 'https://www.flyrotax.com/produkte/details/rotax-916-i-s-c-a.html' }
  ],

  propellers: [
    { id: 'sensenich',        label: 'Sensenich 2-Blatt Fixed',    desc: 'Bewährter Festpropeller, 2-Blatt Composite.',         price: 4250,
      image: 'assets/propellers/sensenich/main.jpg',        infoUrl: 'https://sensenich.com/',
      chNote: { type: 'warn', text: 'Aktuell in der Schweiz nicht für 4-Sitzer-Betrieb zertifiziert – Sling TSi / High Wing dürfen mit diesem Propeller nur als 2-Sitzer betrieben werden.' } },
    { id: 'airmaster-3',      label: 'Airmaster AP430 3-Blatt CS', desc: 'Hydraulischer Verstellpropeller, 3-Blatt.',           price: 11200,
      image: 'assets/propellers/airmaster-3/main.jpg',      infoUrl: 'https://propellor.com/',
      chNote: { type: 'warn', text: 'Aktuell in der Schweiz nicht für 4-Sitzer-Betrieb zertifiziert – Sling TSi / High Wing dürfen mit diesem Propeller nur als 2-Sitzer betrieben werden.' } },
    { id: 'duc-flashback-3r', label: 'Duc Flashback-3 R 4-Blatt',  desc: 'Premium 4-Blatt Composite mit Hub-Cap und Spinner.',  price: 13755,
      image: 'assets/propellers/duc-flashback-3r/main.jpg', infoUrl: 'https://www.duc-helices.com/',
      chNote: { type: 'warn', text: 'Aktuell in der Schweiz nicht für 4-Sitzer-Betrieb zertifiziert – Sling TSi / High Wing dürfen mit diesem Propeller nur als 2-Sitzer betrieben werden.' } },
    { id: 'mt-3blade',        label: 'MT-Propeller 3-Blatt CS',    desc: 'Constant-Speed Holz-Composite, 3-Blatt.',             price: 12450,
      image: 'assets/propellers/mt-3blade/main.jpg',        infoUrl: 'https://www.mt-propeller.com/',
      chNote: { type: 'ok',   text: 'In der Schweiz für 4-Sitzer-Betrieb zugelassen – einzige aktuell für Sling TSi / High Wing zertifizierte Propeller-Option.' } }
  ],

  avionics: [
    { id: 'vfr',      label: 'VFR Basic',          desc: 'Garmin G5 (PFD), Funkgerät GTR 200B, Transponder GTX 45R Mode S.',         price: 14500,
      image: 'assets/avionics/vfr/main.jpg',      infoUrl: 'https://www.garmin.com/aviation/' },
    { id: 'standard', label: 'Garmin Standard',    desc: 'Single G3X Touch 10", GTR 200B, GTX 45R, Audio Panel.',                    price: 26500,
      image: 'assets/avionics/standard/main.jpg', infoUrl: 'https://www.garmin.com/aviation/' },
    { id: 'advanced', label: 'Garmin Advanced',    desc: 'Dual G3X Touch 10", GTN 650Xi, GFC 500 Autopilot.',                        price: 42500,
      image: 'assets/avionics/advanced/main.jpg', infoUrl: 'https://www.garmin.com/aviation/' },
    { id: 'premium',  label: 'Garmin Premium IFR', desc: 'Triple G3X Touch, GTN 750Xi, GFC 500, ADS-B In/Out, FlightStream, Wetter.', price: 58500,
      image: 'assets/avionics/premium/main.jpg',  infoUrl: 'https://www.garmin.com/aviation/' }
  ],

  /* ------------------------------------------------------------------
   * Extras – offizielle Sling Kit-Extras-Liste (Stand: Werks-Preisliste).
   * Preise in USD, ohne MwSt, ab Werk Johannesburg.
   * "prices" ist ein Objekt mit Preis pro Modell-ID. Modelle ohne Eintrag
   * gelten als nicht-kompatibel und werden ausgeblendet.
   * Propeller-Optionen sind hier NICHT enthalten – die werden im
   * eigenen Propeller-Step ausgewählt.
   * ----------------------------------------------------------------*/
  extras: [
    {
      id: 'ffwd-kit',
      label: 'Firewall Forward & Fuel System Kit',
      desc: 'Komplettes Firewall-Forward- und Fuel-System-Kit, abgestimmt auf den jeweiligen Standard-Motor (912iS für Sling 2, 916iS für TSi und High Wing).',
      prices: { sling2: 10325, tsi: 10461, highwing: 10461 },
      image: 'assets/extras/ffwd-kit/main.jpg'
    },
    {
      id: 'leather',
      label: 'Leder-Interieur (Sitze, Seitenpanels, Teppich)',
      desc: 'Komplettes Leder-Interieur-Kit inkl. Seitenverkleidung und Bodenteppich.',
      info: '🎨 Farbwahl erforderlich – die Farbe wird separat mit dem Dealer oder direkt mit Sling abgestimmt.',
      prices: { sling2: 4575, tsi: 10456, highwing: 11707 },
      image: 'assets/extras/leather/main.jpg'
    },
    {
      id: 'led-strobe-nav',
      label: 'LED Strobe & NAV Light System',
      desc: 'LED-Strobe-System mit Tail- und Wingtip-Strobes sowie integrierten Navigationslichtern.',
      prices: { sling2: 905, tsi: 950, highwing: 950 },
      image: 'assets/extras/led-strobe-nav/main.jpg'
    },
    {
      id: 'matco-dual-toe',
      label: 'Matco Dual Toe Brake Kit',
      desc: 'Komplettes Dual-Toe-Brake-Kit statt Standard-T-Pedale mit Mittel-Bremse.',
      details: 'Standard ab Werk: T-förmige Steuerpedale mit einer zentralen Bremse (Pilot bremst beide Räder gleichzeitig).\n\nMit dem Matco-Kit erhält jede Pilotenseite (links + rechts) eine eigene Toe-Brake auf jedem Pedal – wie im Auto. Vorteil: präzises Differential-Bremsen beim Rollen und Ausrichten, beidseitig vom Cockpit aus bedienbar.',
      gallery: [
        'assets/extras/matco-dual-toe/main.jpg',
        'assets/extras/matco-dual-toe/detail-1.jpg',
        'assets/extras/matco-dual-toe/detail-2.jpg'
      ],
      prices: { sling2: 2063, tsi: 1976 }
    },
    {
      id: 'beringer-hand-brake-tri',
      label: 'Beringer Hand Brake Upgrade (TRI)',
      desc: 'Hand-Brems-System-Upgrade von Beringer – TRI-Konfiguration.',
      details: 'Hochwertiges Hand-Brake-System von Beringer (Frankreich) – ersetzt die Standard-Bremse.\nHandgriff am Mittelholm/Powerquadrant, bedient die Hauptfahrwerks-Bremsen zentral. Ideal für Parking-Brake und kontrolliertes Anrollen.',
      gallery: [
        'assets/extras/beringer-hand-brake/main.jpg',
        'assets/extras/beringer-hand-brake/detail-1.jpg'
      ],
      prices: { tsi: 4361, highwing: 4555 }
    },
    {
      id: 'beringer-dual-toe-tri',
      label: 'Beringer Dual Toe Hydraulic Brakes (TRI)',
      desc: 'Hydraulische Dual-Toe-Brakes statt hand-betätigte Bremse – TRI-Konfiguration.',
      details: 'Premium-Bremsanlage von Beringer mit hydraulischen Dual-Toe-Bremsen auf beiden Pilotenseiten.\n\nUnterschied zur Hand-Brake-Variante: differential bremsbar pro Rad ohne Hand vom Stick zu nehmen – sicherer bei Crosswind-Landungen und engen Rollvorgängen.',
      gallery: [
        'assets/extras/beringer-dual-toe/main.jpg',
        'assets/extras/beringer-dual-toe/detail-1.jpg'
      ],
      prices: { tsi: 6001, highwing: 6268 }
    },
    {
      id: 'beringer-dual-toe-tdr',
      label: 'Beringer Dual Toe Hydraulic Brakes (TDR)',
      desc: 'Hydraulische Dual-Toe-Brakes – TDR-Konfiguration (Sling High Wing).',
      details: 'TDR-Variante der Beringer-Dual-Toe-Brakes – verstärkt für den schweren High-Wing-Einsatz (Backcountry, Bush-Strips). Erweiterte hydraulische Komponenten, robuster für unbefestigte Pisten.',
      gallery: [
        'assets/extras/beringer-dual-toe-tdr/main.jpg'
      ],
      prices: { highwing: 9375 }
    },
    {
      id: 'parachute-prep',
      label: 'Parachute-Vorbereitung',
      desc: 'Parachute-Kabel, Halterungen und Skin-Verstärkungen für die spätere Fallschirm-Installation.',
      prices: { sling2: 1496, tsi: 2252, highwing: 2903 },
      image: 'assets/extras/parachute-prep/main.jpg'
    },
    {
      id: 'longrange-tanks',
      label: 'Long-Range Fuel Tanks (Parts swap out)',
      desc: 'Long-Range-Tanks – Parts werden statt der Standard-Tanks geliefert.',
      prices: { sling2: 3624, tsi: 3639, highwing: 3800 },
      image: 'assets/extras/longrange-tanks/main.jpg'
    },
    {
      id: 'builder-tools',
      label: 'Sling Builder Tools (empfohlen)',
      desc: 'Sling-empfohlenes Werkzeug-Set für den Bau – einmaliger Kauf.',
      prices: { sling2: 2457, tsi: 2656, highwing: 2774 },
      image: 'assets/extras/builder-tools/main.jpg'
    }
  ],

  /* ------------------------------------------------------------------
   * Quickbuild – optionale Vor-Montagen ab Werk (verkürzen die Bauzeit).
   * Aktuell nur für Sling High Wing in der offiziellen Preisliste.
   * ----------------------------------------------------------------*/
  quickbuild: {
    tsi: [
      { id: 'qb-empennage',      label: 'Empennage',                                                       price: 2771 },
      { id: 'qb-fuel-standard',  label: 'Fuel tanks – Standard',                                           price: 2268 },
      { id: 'qb-fuel-longrange', label: 'Fuel tanks – Long Range (Add extra auf Standard)',                price: 2268 },
      { id: 'qb-wings',          label: 'Wings (Klappen, Querruder und Tanks unmontiert)',                 price: 6105 },
      { id: 'qb-fuselage',       label: 'Fuselage (ohne Fahrwerk/Steuerung montiert)',                      price: 8664 },
      { id: 'qb-undercarriage',  label: 'Undercarriage (assembled und am Rumpf angebaut)',                 price: 1184 },
      { id: 'qb-canopy-glass',   label: 'Canopy mit Türen und Verglasung (ohne Frontscheibe/Dashboard)',   price: 3107 },
      { id: 'qb-fill-rivets',    label: 'Mittellöcher der Standard-Nieten füllen (empfohlen)',             price: 1659 }
    ],
    highwing: [
      { id: 'qb-empennage',      label: 'Empennage',                                                       price: 3947 },
      { id: 'qb-fuel-standard',  label: 'Fuel tanks – Standard',                                           price: 2268 },
      { id: 'qb-fuel-longrange', label: 'Fuel tanks – Long Range (Add extra auf Standard)',                price: 2268 },
      { id: 'qb-wings',          label: 'Wings (Klappen, Querruder und Tanks unmontiert)',                 price: 6105 },
      { id: 'qb-fuselage',       label: 'Fuselage assembled (Rumpfheck am CFK-Mittelteil; ohne Fahrwerk/Steuerung)', price: 4823 },
      { id: 'qb-undercarriage',  label: 'Undercarriage (assembled und am Rumpf angebaut)',                 price: 1800 },
      { id: 'qb-doors-glass',    label: 'Türen und Verglasung eingebaut (ohne Frontscheibe/Dashboard)',    price: 2301 },
      { id: 'qb-fill-rivets',    label: 'Mittellöcher der Standard-Nieten füllen (empfohlen)',             price: 2436 }
    ]
  },

  /* ------------------------------------------------------------------
   * Shipping / Packing – Pflicht-Position für den Versand ab Werk
   * Johannesburg. Wird automatisch in den Gesamtpreis eingerechnet.
   * "crating" ist ein Aufschlag bei Quickbuild-Auswahl.
   * ----------------------------------------------------------------*/
  shipping: {
    packing: {
      id: 'packing',
      label: 'Packing & Container-Vorbereitung (Pflicht)',
      desc: 'Verpackung des Kits in den Container für den Export ab Werk Johannesburg.',
      info: 'Pflicht-Position – wird für den Export benötigt und kann nicht abgewählt werden.',
      prices: { sling2: 2494, tsi: 2810, highwing: 2494 }
    },
    quickbuildCrating: {
      id: 'crating-quickbuild',
      label: 'Wooden Crating & Container-Loading (Quickbuild)',
      desc: 'Holzverschlag und Container-Beladung – wird automatisch ergänzt sobald mindestens eine Quickbuild-Option gewählt ist.',
      prices: { tsi: 4522, highwing: 3919 }
    }
  },

  /* ------------------------------------------------------------------
   * Services – Dienstleistungen rund um Import, Lieferung und Bauhilfe.
   * Preise verstehen sich ohne MwSt; ab Johannesburg. Versand und
   * Einfuhrabgaben werden individuell offeriert.
   * ----------------------------------------------------------------*/
  services: [
    {
      id: 'door2door-ch',
      label: 'Tür-zu-Tür Service Schweiz',
      desc: 'Komplette Abwicklung: Versand-Organisation ab Johannesburg, Zoll, Mehrwertsteuer-Import und Lieferung an die Wunschadresse in der Schweiz.',
      price: 1022,
      priceNote: '+ Versandkosten ca. CHF 6\'000 und MwSt – beides individuell nach Lieferadresse',
      info: 'Pauschale für die Service-Leistung (Organisation und Abwicklung). Effektive Versand- und Importkosten werden separat in Rechnung gestellt.'
    },
    {
      id: 'build-help',
      label: 'Bauhilfe (Pakete oder Stundensatz)',
      desc: 'Individuelle Bauunterstützung durch erfahrene Techniker – buchbar als Paket oder zum Stundensatz.',
      info: '⚠️ Wichtig: Die 51 %-Regel für Experimental-Builders muss eingehalten werden. Umfang und Buchung immer in Absprache mit der EAS (Experimental Aviation of Switzerland).',
      quoteOnly: true
    }
  ]
};
