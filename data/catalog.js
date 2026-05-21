/**
 * Sling Aircraft Switzerland – Configurator Katalog
 *
 * Alle Preise in USD ab Werk. Richtwerte – verbindliche Angebote über
 * den autorisierten Sling Aircraft Switzerland Dealer.
 */
window.SLING_CATALOG = {

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

  /* Komplett-Rabatt (USD), wenn alle Pflicht-Kit-Teile zusammen bestellt werden */
  bundleDiscountUSD: 200,

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
      compatibleAvionics: ['vfr', 'standard', 'advanced', 'premium']
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
      compatibleAvionics: ['standard', 'advanced', 'premium']
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
      compatibleAvionics: ['standard', 'advanced', 'premium']
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
    { id: 'rotax912uls', label: 'Rotax 912 ULS',       desc: '100 PS · Vergaser · zuverlässiger Klassiker.',          price: 28500 },
    { id: 'rotax912is',  label: 'Rotax 912iS Sport',   desc: '100 PS · Einspritzung · sparsam und effizient.',        price: 33500 },
    { id: 'rotax915is',  label: 'Rotax 915iS',         desc: '141 PS · Turbo + Einspritzung · 4-Sitzer-Performance.', price: 49500 },
    { id: 'rotax916is',  label: 'Rotax 916iS',         desc: '160 PS · neueste Generation · Top-Performance.',        price: 54500 }
  ],

  propellers: [
    { id: 'sensenich',         label: 'Sensenich 2-Blatt Fixed',     desc: 'Bewährter Festpropeller, 2-Blatt Composite.',     price: 4250 },
    { id: 'airmaster-3',       label: 'Airmaster AP430 3-Blatt CS',  desc: 'Hydraulischer Verstellpropeller, 3-Blatt.',       price: 11200 },
    { id: 'duc-flashback-3r',  label: 'Duc Flashback-3 R 4-Blatt',   desc: 'Premium 4-Blatt Composite mit Hub-Cap und Spinner.', price: 13755 },
    { id: 'mt-3blade',         label: 'MT-Propeller 3-Blatt CS',     desc: 'Constant-Speed Holz-Composite, 3-Blatt.',         price: 12450 }
  ],

  avionics: [
    { id: 'vfr',      label: 'VFR Basic',         desc: 'Garmin G5 (PFD), Funkgerät GTR 200B, Transponder GTX 45R Mode S.',                 price: 14500 },
    { id: 'standard', label: 'Garmin Standard',   desc: 'Single G3X Touch 10", GTR 200B, GTX 45R, Audio Panel.',                              price: 26500 },
    { id: 'advanced', label: 'Garmin Advanced',   desc: 'Dual G3X Touch 10", GTN 650Xi, GFC 500 Autopilot.',                                  price: 42500 },
    { id: 'premium',  label: 'Garmin Premium IFR',desc: 'Triple G3X Touch, GTN 750Xi, GFC 500, ADS-B In/Out, FlightStream, Wetter.',         price: 58500 }
  ],

  extras: [
    { id: 'brs',         label: 'BRS Ballistic Parachute',       desc: 'Gesamtrettungs-Fallschirmsystem.',                                     price: 19500 },
    { id: 'ac',          label: 'Klimaanlage',                   desc: 'Cockpit-Klimatisierung.',                                              price: 7500, models: ['tsi', 'highwing'] },
    { id: 'heatedseats', label: 'Sitzheizung',                   desc: 'Elektrisch beheizte Vordersitze.',                                     price: 1200 },
    { id: 'leather',     label: 'Leder-Interieur',               desc: 'Premium-Lederausstattung in Wunschfarbe.',                             price: 4800 },
    { id: 'paint',       label: 'Custom Paint Scheme',           desc: 'Individuelle Lackierung nach Design-Vorgabe.',                         price: 9500 },
    { id: 'wheelpants',  label: 'Wheel Pants',                   desc: 'Aerodynamische Radverkleidungen.',                                     price: 1800, models: ['sling2', 'tsi'] },
    { id: 'longrange',   label: 'Long-Range Tanks',              desc: 'Zusatztanks für erweiterte Reichweite.',                               price: 3200, models: ['tsi', 'highwing'] },
    { id: 'glidertow',   label: 'Schleppkupplung',               desc: 'Für Segelflugzeug-Schlepp zugelassen.',                                price: 2800, models: ['sling2'] },
    { id: 'tundra',      label: 'Tundra-Bereifung',              desc: 'Grobstollige Reifen für unbefestigte Pisten.',                         price: 2100, models: ['highwing'] }
  ]
};
