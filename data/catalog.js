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
      partsBaseSum: 67409,
      parts: [
        { id: 'empennage',   label: 'Empennage (Tail) Kit', desc: 'Komplettes Leitwerk: Horizontal- und Vertikalstabilisator, Ruder, Höhenruder, Scharniere, Steuerverbindungen, Trimmtab, Composite-Tips, Trim Servo Unit inkl. Clevis Kit und Verkabelung, Hardware und Bauanleitung.', price: 5283 },
        { id: 'wing',        label: 'Wing Kit',             desc: 'Kompletter Flügelsatz: vormontierte Holme, Klappen, Querruder, Tanks, Composite Wingtips, verriegelnde Tankdeckel, Pitot-Schläuche, Standard-Landelichter mit Verkabelung, Strobes-Verkabelung, Tankgeber, rutschfester Gehbereich, Hardware und Bauanleitung. Pitotrohr separat.', price: 18647 },
        { id: 'fuselage',    label: 'Fuselage Kit',         desc: 'Kompletter Rumpf (Bug, Mitte, Heck): vormontierter Mittelholm, Heckholm, 2 Sitze, alle Steuermechanismen (Throttle, Stick, Pedale), Brandschott, Motoraufhängung am Brandschott, Trittstufen, elektrischer Klappenaktuator, seitliche Griffe, Firex Sound-Damping, Garmin-Autopilot-Halterungen, Autopilot-Pushrods, Hardware und Bauanleitung.', price: 20491 },
        { id: 'undercarriage', label: 'Undercarriage Kit',  desc: 'Komplettes Fahrwerk: Haupt- und Bugfahrwerk, Frontaufhängung, Lager und Anbauteile, Achsen, komplettes hydraulisches Bremssystem, 6-Ply Aviation-Reifen und -Schläuche, Hardware und Bauanleitung.', price: 11563 },
        { id: 'finishing',   label: 'Canopy, Dash, Final Assembly & Finishing Kit', desc: 'Komplettes Canopy-Kit inkl. Front- und Hauptcanopyrahmen, Front- und Hauptacrylglas, Closing-Skins und -Panels, lederbezogenes Top-Instrumentenpanel, Lüftungsdüsen, Instrumententafel-Cutout nach Kundenwunsch, individuelles Canopy-Schloss, alles für die finale Montage inkl. Wheel-Spats (3 Räder), Nosecowl, Composite-Closing-Fairings, Pushrod-Baugruppen, Hardware und Bauanleitung.', price: 11425 }
      ],
      compatibleEngines: ['rotax912is', 'own-engine'],
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
      partsBaseSum: 100590,
      parts: [
        { id: 'empennage',   label: 'Empennage (Tail) Kit', desc: 'Komplettes Leitwerk: Horizontal- und Vertikalstabilisator, Ruder, Höhenruder, Scharniere, Steuerverbindungen, Trimmtab, Composite-Tips, Dimpling-Dies, Trim Servo Unit inkl. Clevis Kit und Verkabelung, Hardware und Bauanleitung.', price: 6734 },
        { id: 'wing',        label: 'Wing Kit',             desc: 'Kompletter Flügelsatz: vormontierte Holme, Klappen, Querruder, Tanks, Composite Wingtips. Inkl. verriegelnde Tankdeckel, AOA mit Schläuchen, 4× LED-Landelichter mit Verkabelung, Strobes-Verkabelung, Tankgeber, rutschfester Gehbereich und Hardware. Pitotrohr separat.', price: 26340 },
        { id: 'fuselage',    label: 'Fuselage Kit',         desc: 'Kompletter Rumpf: vormontierter Mittelholm, Heckholm, Vorder- und Rücksitze, alle Steuermechanismen (Throttle, Stick, Pedale), Brandschott, Motoraufhängung am Brandschott, Trittstufen. Inkl. elektrischer Klappenaktuator, Firex Sound-Damping, Garmin-Autopilot-Halterungen, Autopilot-Pushrods, komplette Klima-/Heizanlage und Hardware.', price: 28109 },
        { id: 'undercarriage', label: 'Undercarriage Kit',  desc: 'Komplettes Fahrwerk: Haupt- und Bugfahrwerk, Frontaufhängung, Lager und Anbauteile, Achsen, komplettes hydraulisches Bremssystem, 6-Ply Aviation-Reifen und -Schläuche, Hardware und Bauanleitung.', price: 17273 },
        { id: 'finishing',   label: 'Canopy, Dash, Final Assembly & Finishing Kit', desc: 'Komplettes Canopy-Kit inkl. Canopy-Rahmen, Frontscheibe, Türen und Fenster, lederbezogenes Top-Dashboard, Lüftungsdüsen, Instrumententafel-Cutout, individuelles Canopy-Schloss für beide Türen, alles für die finale Montage inkl. Nosecowl, Wheel-Spats (3 Räder), Composite-Closing-Fairings, Pushrod-Baugruppen, Hardware und Bauanleitung.', price: 22134 }
      ],
      compatibleEngines: ['rotax916is', 'own-engine'],
      compatibleAvionics: ['standard', 'advanced', 'premium'],
      image: 'assets/models/tsi/SlingTSI-InFlight.jpg',
      gallery: [
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
      partsBaseSum: 134636,
      parts: [
        { id: 'empennage',   label: 'Empennage (Tail) Kit', desc: 'Komplettes Leitwerk: Horizontal- und Vertikalstabilisator, Ruder, Höhenruder, Scharniere, Steuerverbindungen, Trimmtab, Composite-Tips, Dimpling-Dies, Trim Servo Unit inkl. Clevis Kit und Verkabelung, Hardware und Bauanleitung.', price: 6887 },
        { id: 'wing',        label: 'Wing Kit',             desc: 'Kompletter Flügelsatz (Hochdecker mit Streben): vormontierte Holme, Klappen, Querruder, Tanks, Composite Wingtips. Inkl. verriegelnde Tankdeckel, AOA-Schläuche, 4× LED-Landelichter mit Verkabelung, Strobes-Verkabelung, Tankgeber und Hardware. Pitotrohr separat.', price: 26340 },
        { id: 'fuselage',    label: 'Fuselage Kit',         desc: 'Kompletter Rumpf inkl. CFK-Mittelteil (in einem Stück verklebt), vormontierter Mittelholm, Vorder- und Rücksitze, alle Steuermechanismen (Throttle, Stick, Pedale), Brandschott, Motoraufhängung am Brandschott, Trittstufen. Inkl. elektrischer Klappenaktuator, Sound-Damping-Foam, Garmin-Autopilot-Halterungen, Autopilot-Pushrods, komplette Klima-/Heizanlage und Hardware.', price: 73365 },
        { id: 'undercarriage', label: 'Undercarriage Kit',  desc: 'Komplettes Fahrwerk: Haupt- und Bugfahrwerk, Frontaufhängung, Lager und Anbauteile, Achsen, komplettes hydraulisches Bremssystem, 6-Ply Aviation-Reifen und -Schläuche, Hardware und Bauanleitung.', price: 17273 },
        { id: 'finishing',   label: 'Dash, Final Assembly & Finishing Kit', desc: 'Komplettes Dash-Kit (lederbezogen), Lüftungsdüsen, Instrumententafel-Cutout, alles für die finale Montage inkl. Nosecowl, Wheel-Spats (3 Räder), Composite-Closing-Fairings, Pushrod-Baugruppen, Hardware und Bauanleitung.', price: 10771 }
      ],
      compatibleEngines: ['rotax916is', 'own-engine'],
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
      rotax912is:  6450,
      rotax916is:  7711
    }
  },

  engines: [
    { id: 'rotax912is',  label: 'Rotax 912 iSc Sport', desc: '100 PS · Einspritzung · Standard-Motor für Sling 2.', price: 33500,
      approxPrice: true, models: ['sling2'],
      image: 'assets/engines/rotax912is/main.jpg',  infoUrl: 'https://www.flyrotax.com/products/912-is-sport-isc-sport' },
    { id: 'rotax916is',  label: 'Rotax 916 iS C',    desc: '160 PS · neueste Generation · Standard-Motor für Sling TSi und Sling High Wing.', price: 54500,
      approxPrice: true, models: ['tsi', 'highwing'],
      image: 'assets/engines/rotax916is/main.jpg',  infoUrl: 'https://www.flyrotax.com/products/916-is-c' },
    { id: 'own-engine',  label: 'Eigener Motor (Kunde besorgt selbst)', desc: 'Sie organisieren den Motor (und FF/Fuel-Kit) direkt beim Hersteller oder einem Drittanbieter. Kein Motor im Sling-Kit-Preis enthalten.', price: 0,
      models: ['sling2', 'tsi', 'highwing'] }
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
    { id: 'vfr',      label: 'VFR Basic',          desc: 'Garmin G5 (PFD), Funkgerät GTR 200B, Transponder GTX 45R Mode S.',         price: 14500, approxPrice: true,
      image: 'assets/avionics/vfr/main.jpg',      infoUrl: 'https://www.garmin.com/aviation/' },
    { id: 'standard', label: 'Garmin Standard',    desc: 'Single G3X Touch 10", GTR 200B, GTX 45R, Audio Panel.',                    price: 26500, approxPrice: true,
      image: 'assets/avionics/standard/main.jpg', infoUrl: 'https://www.garmin.com/aviation/' },
    { id: 'advanced', label: 'Garmin Advanced',    desc: 'Dual G3X Touch 10", GTN 650Xi, GFC 500 Autopilot.',                        price: 42500, approxPrice: true,
      image: 'assets/avionics/advanced/main.jpg', infoUrl: 'https://www.garmin.com/aviation/' },
    { id: 'premium',  label: 'Garmin Premium IFR', desc: 'Triple G3X Touch, GTN 750Xi, GFC 500, ADS-B In/Out, FlightStream, Wetter.', price: 58500, approxPrice: true,
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
      group: 'brakes',
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
      group: 'brakes',
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
      group: 'brakes',
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
      group: 'brakes',
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
      image: 'assets/extras/longrange-tanks/main.jpg',
      kitPartId: 'wing'
    },
    {
      id: 'builder-tools',
      label: 'Sling Builder Tools (empfohlen)',
      desc: 'Sling-empfohlenes Werkzeug-Set für den Bau – einmaliger Kauf.',
      prices: { sling2: 2457, tsi: 2656, highwing: 2774 },
      image: 'assets/extras/builder-tools/main.jpg'
    },

    /* ----- BRS Ballistic Recovery System ----- */
    {
      id: 'brs-magnum-901',
      label: 'BRS Magnum 901 Parachute (Rettungssystem)',
      desc: 'Ballistisches Rettungs-Fallschirmsystem von Magnum für das gesamte Flugzeug.',
      info: 'Bei Auswahl wird automatisch auch die Parachute-Vorbereitung (Kabel + Mounts) mitbestellt – ist Voraussetzung für den Einbau.',
      details: 'Komplett-System inkl. ballistischer Rakete, Fallschirm, Auslöse-Mechanismus und Verkabelung. Wird vom Hersteller mit dem Flugzeug aktiviert.\n\nAchtung: Wartungs-/Inspektionsintervalle beachten (Re-Pack alle 6-10 Jahre je nach System).',
      approxPrice: true,
      requires: ['parachute-prep'],
      prices: { sling2: 19500, tsi: 23500, highwing: 25500 },
      image: 'assets/extras/brs-magnum-901/main.jpg',
      infoUrl: 'https://brsaerospace.com/'
    },

    /* ----- Aithre Sauerstoff-Systeme ----- */
    {
      id: 'aithre-o2-single',
      label: 'Aithre Altus Meso – Sauerstoff-System (1 Maker)',
      desc: 'Portables Sauerstoff-System für ein Crew-Mitglied, mit Smart-App-Anbindung.',
      info: 'Smallest unit, ideal für Sling 2 oder als Backup.',
      approxPrice: true,
      group: 'o2',
      prices: { sling2: 2500, tsi: 2500, highwing: 2500 },
      image: 'assets/extras/aithre-o2-single/main.jpg',
      infoUrl: 'https://aithre.com/products/altus-meso-personal-portable-oxygen'
    },
    {
      id: 'aithre-o2-dual',
      label: 'Aithre Altus Mini Twin – Sauerstoff-System (2 Maker)',
      desc: 'Dual-Outlet-Sauerstoff-System für zwei Crew-Mitglieder (Pilot + Copilot).',
      approxPrice: true,
      group: 'o2',
      prices: { sling2: 5800, tsi: 5800, highwing: 5800 },
      image: 'assets/extras/aithre-o2-dual/main.jpg',
      infoUrl: 'https://aithre.com/products/altus-mini-twin-portable-oxygen-for-2'
    },
    {
      id: 'aithre-o2-reserve',
      label: 'Aithre – Reserve-Sauerstoffflasche',
      desc: 'Zusätzliche Reserveflasche (kleinste Grösse) als Backup für längere Flüge.',
      info: 'Empfohlen in Kombination mit Altus Meso oder Mini Twin.',
      approxPrice: true,
      prices: { sling2: 900, tsi: 900, highwing: 900 },
      image: 'assets/extras/aithre-o2-reserve/main.jpg',
      infoUrl: 'https://aithre.com/'
    },

    /* ----- IntelliKey von Midwest Panel ----- */
    {
      id: 'intellikey',
      label: 'IntelliKey – Schlüsselloses Zünd-System',
      desc: 'Elektronisches Schlüssel-System mit Anti-Diebstahl-Schutz und Code-Eingabe statt mechanischem Magnet-Schalter.',
      details: 'Modernisiert das veraltete mechanische Magnet-Switch-System mit einem elektronischen Zugang per Code/Tag. Erhöht den Diebstahl-Schutz und vereinfacht die Bedienung.',
      approxPrice: true,
      prices: { sling2: 1800, tsi: 1800, highwing: 1800 },
      image: 'assets/extras/intellikey/main.jpg',
      infoUrl: 'https://www.intellikey.us/'
    },

    /* ----- AirAvionics AT-1 (FLARM + ADS-B Out) ----- */
    {
      id: 'airavionics-at-1',
      label: 'AirAvionics AT-1 – FLARM + ADS-B Out',
      desc: 'Kombiniertes Collision-Avoidance- und ADS-B-Out-System – in der Schweiz/Europa für die meisten Lufträume empfohlen.',
      details: 'FLARM ist in der Schweiz Standard im Sport- und Segelflugverkehr. ADS-B Out wird in zunehmend mehr europäischen Lufträumen verlangt. Der AT-1 vereint beides in einem Gerät und reduziert Panel-Aufwand sowie Stromverbrauch.',
      approxPrice: true,
      prices: { sling2: 4200, tsi: 4200, highwing: 4200 },
      image: 'assets/extras/airavionics-at-1/main.jpg',
      infoUrl: 'https://www.air-avionics.com/'
    }
  ],

  /* ------------------------------------------------------------------
   * Quickbuild – optionale Vor-Montagen ab Werk (verkürzen die Bauzeit).
   * Aktuell nur für Sling High Wing in der offiziellen Preisliste.
   * ----------------------------------------------------------------*/
  quickbuild: {
    sling2: [
      { id: 'qb-empennage',      kitPartId: 'empennage',     label: 'Empennage vor-montiert',                                          price: 2600 },
      { id: 'qb-fuel-standard',  kitPartId: 'wing',          label: 'Fuel Tanks – Standard',                                           price: 2406 },
      { id: 'qb-fuel-longrange', kitPartId: 'wing',          label: 'Fuel Tanks – Long Range (Add extra)',                             price: 2406, requires: ['qb-fuel-standard'] },
      { id: 'qb-wings',          kitPartId: 'wing',          label: 'Wings vor-montiert (Klappen/Querruder/Tanks unmontiert)',         price: 4827 },
      { id: 'qb-fuselage',       kitPartId: 'fuselage',      label: 'Fuselage vor-montiert (ohne Fahrwerk/Steuerung)',                 price: 6335 },
      { id: 'qb-undercarriage',  kitPartId: 'undercarriage', label: 'Undercarriage assembled und am Rumpf montiert',                   price: 1155 }
    ],
    tsi: [
      { id: 'qb-empennage',      kitPartId: 'empennage',     label: 'Empennage vor-montiert',                                          price: 2771 },
      { id: 'qb-fuel-standard',  kitPartId: 'wing',          label: 'Fuel Tanks – Standard',                                           price: 2268 },
      { id: 'qb-fuel-longrange', kitPartId: 'wing',          label: 'Fuel Tanks – Long Range (Add extra)',                             price: 2268, requires: ['qb-fuel-standard'] },
      { id: 'qb-wings',          kitPartId: 'wing',          label: 'Wings vor-montiert (Klappen/Querruder/Tanks unmontiert)',         price: 6105 },
      { id: 'qb-fuselage',       kitPartId: 'fuselage',      label: 'Fuselage vor-montiert (ohne Fahrwerk/Steuerung)',                 price: 8664 },
      { id: 'qb-undercarriage',  kitPartId: 'undercarriage', label: 'Undercarriage assembled und am Rumpf montiert',                   price: 1184 },
      { id: 'qb-canopy-glass',   kitPartId: 'finishing',     label: 'Canopy mit Türen und Verglasung (ohne Frontscheibe/Dashboard)',   price: 3107 }
    ],
    highwing: [
      { id: 'qb-empennage',      kitPartId: 'empennage',     label: 'Empennage vor-montiert',                                          price: 3947 },
      { id: 'qb-fuel-standard',  kitPartId: 'wing',          label: 'Fuel Tanks – Standard',                                           price: 2268 },
      { id: 'qb-fuel-longrange', kitPartId: 'wing',          label: 'Fuel Tanks – Long Range (Add extra)',                             price: 2268, requires: ['qb-fuel-standard'] },
      { id: 'qb-wings',          kitPartId: 'wing',          label: 'Wings vor-montiert (Klappen/Querruder/Tanks unmontiert)',         price: 6105 },
      { id: 'qb-fuselage',       kitPartId: 'fuselage',      label: 'Fuselage vor-montiert (Rumpfheck am CFK-Mittelteil)',             price: 4823 },
      { id: 'qb-undercarriage',  kitPartId: 'undercarriage', label: 'Undercarriage assembled und am Rumpf montiert',                   price: 1800 },
      { id: 'qb-doors-glass',    kitPartId: 'finishing',     label: 'Türen und Verglasung eingebaut (ohne Frontscheibe/Dashboard)',    price: 2301 }
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
      info: 'Pflicht-Position – wird automatisch pro gewähltem Kit-Teil prozentual berechnet und kann nicht abgewählt werden.',
      /* Prozentwert pro Modell, errechnet aus offizieller EU-Preisliste:
         (Packing-Pauschale / Summe aller Kit-Teile). Wird in totals()
         pro selektiertem Kit-Teil-Preis angewendet. */
      percent: { sling2: 0.0451, tsi: 0.0279, highwing: 0.0185 }
    },
    quickbuildCrating: {
      id: 'crating-quickbuild',
      label: 'Wooden Crating & Container-Loading (Quickbuild)',
      desc: 'Holzverschlag und Container-Beladung – wird automatisch ergänzt sobald mindestens eine Quickbuild-Option gewählt ist.',
      prices: { sling2: 4773, tsi: 4522, highwing: 3919 }
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
