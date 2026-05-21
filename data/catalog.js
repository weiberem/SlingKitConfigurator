/**
 * Sling Aircraft Kit Configurator – Katalog
 *
 * Alle Preise in USD ab Werk (Sling Aircraft / The Airplane Factory, RSA).
 * Werte sind Richtwerte basierend auf öffentlich kommunizierten Preisen –
 * bitte vor Bestellung mit dem autorisierten Sling-Dealer abgleichen.
 */
window.SLING_CATALOG = {

  defaultRates: {
    USD: 1.0,
    CHF: 0.88,
    EUR: 0.92
  },

  models: [
    {
      id: 'sling2',
      name: 'Sling 2',
      tag: '2-Seat · LSA',
      description: 'Der bewährte 2-Sitzer-Tiefdecker. Ideal für Schulung, Reise und persönliches Fliegen.',
      specs: {
        Sitze: '2',
        Reichweite: '~1.300 km',
        VNE: '135 kts',
        Leergewicht: '~370 kg'
      },
      basePrice: 45000,
      variants: [
        { id: 'std', label: 'Standard (Bugrad)', price: 0 },
        { id: 'taildragger', label: 'Taildragger (Spornrad)', price: 2500 }
      ],
      compatibleEngines: ['rotax912uls', 'rotax912is', 'rotax915is'],
      compatibleSections: ['fuselage', 'wing', 'tail', 'finishing', 'firewall']
    },
    {
      id: 'sling4',
      name: 'Sling 4',
      tag: '4-Seat · Classic',
      description: 'Der klassische 4-Sitzer mit Rotax 914 Turbo – ausgereift, vielseitig und solide.',
      specs: {
        Sitze: '4',
        Reichweite: '~1.700 km',
        VNE: '147 kts',
        Motor: 'Rotax 914 Turbo'
      },
      basePrice: 64000,
      variants: [
        { id: 'std', label: 'Standard', price: 0 }
      ],
      compatibleEngines: ['rotax914', 'rotax915is'],
      compatibleSections: ['fuselage', 'wing', 'tail', 'finishing', 'firewall']
    },
    {
      id: 'tsi',
      name: 'Sling TSi',
      tag: '4-Seat · Turbo Sport',
      description: 'High-Performance 4-Sitzer mit Rotax 915iS. Mehrfach ausgezeichnet, schnell, effizient.',
      specs: {
        Sitze: '4',
        Reichweite: '~2.200 km',
        VNE: '167 kts',
        Motor: 'Rotax 915/916iS'
      },
      basePrice: 73000,
      badge: 'Bestseller',
      variants: [
        { id: 'std', label: 'Standard', price: 0 }
      ],
      compatibleEngines: ['rotax915is', 'rotax916is'],
      compatibleSections: ['fuselage', 'wing', 'tail', 'finishing', 'firewall']
    },
    {
      id: 'highwing',
      name: 'Sling High Wing',
      tag: '4-Seat · High Wing',
      description: 'Hochdecker mit Rundumsicht – ideal für Backcountry, Bush und Familie.',
      specs: {
        Sitze: '4',
        Reichweite: '~2.100 km',
        VNE: '156 kts',
        Motor: 'Rotax 915/916iS'
      },
      basePrice: 71000,
      badge: 'Neu',
      variants: [
        { id: 'tricycle', label: 'Tricycle (Bugrad)', price: 0 },
        { id: 'taildragger', label: 'Taildragger (Spornrad)', price: 3500 }
      ],
      compatibleEngines: ['rotax915is', 'rotax916is'],
      compatibleSections: ['fuselage', 'wing', 'tail', 'finishing', 'firewall']
    }
  ],

  kitVariants: [
    {
      id: 'selfbuild',
      label: 'Self-Build Kit',
      desc: 'Du baust komplett aus dem Rohkit. Tausende Stunden Bauspass, niedrigster Einstiegspreis.',
      multiplier: 1.0
    },
    {
      id: 'quickbuild',
      label: 'Quick-Build Kit',
      desc: '49 % vorgefertigt im Werk – deutlich weniger Bauzeit, schnellerer Erstflug.',
      multiplier: 1.32
    }
  ],

  kitSections: [
    {
      id: 'fuselage',
      label: 'Rumpf-Kit (Fuselage)',
      desc: 'Inkl. Cockpit-Struktur, Türen, Sitzwannen.',
      shareOfBase: 0.30,
      required: true
    },
    {
      id: 'wing',
      label: 'Flügel-Kit (Wings)',
      desc: 'Beide Tragflächen mit Tanks, Steuerflächen, Klappen.',
      shareOfBase: 0.28,
      required: true
    },
    {
      id: 'tail',
      label: 'Leitwerk-Kit (Empennage)',
      desc: 'Höhen- und Seitenleitwerk komplett.',
      shareOfBase: 0.12,
      required: true
    },
    {
      id: 'finishing',
      label: 'Finishing-Kit',
      desc: 'Verkleidungen, Interieur-Panels, Hardware, Kleinteile.',
      shareOfBase: 0.18,
      required: true
    },
    {
      id: 'firewall',
      label: 'Firewall-Forward Kit',
      desc: 'Motoraufhängung, Cowling, Engine-Mount, Auspuff-System (ohne Motor).',
      shareOfBase: 0.12,
      required: true
    }
  ],

  engines: [
    {
      id: 'rotax912uls',
      label: 'Rotax 912 ULS',
      desc: '100 PS · Vergaser · zuverlässiger Klassiker.',
      price: 28500
    },
    {
      id: 'rotax912is',
      label: 'Rotax 912iS Sport',
      desc: '100 PS · Einspritzung · effizient und sparsam.',
      price: 33500
    },
    {
      id: 'rotax914',
      label: 'Rotax 914 UL Turbo',
      desc: '115 PS · Turbo · gute Höhenleistung.',
      price: 36500
    },
    {
      id: 'rotax915is',
      label: 'Rotax 915iS',
      desc: '141 PS · Turbo + Einspritzung · 4-Sitzer-Performance.',
      price: 49500
    },
    {
      id: 'rotax916is',
      label: 'Rotax 916iS',
      desc: '160 PS · neueste Generation · Top-Performance.',
      price: 54500
    }
  ],

  avionics: [
    {
      id: 'vfr',
      label: 'VFR Basic',
      desc: 'Garmin G5 (PFD), Funkgerät, Transponder Mode S.',
      price: 14500
    },
    {
      id: 'standard',
      label: 'Garmin Standard',
      desc: 'Single G3X Touch 10", GTR 200B, GTX 45R, Audio Panel.',
      price: 26500
    },
    {
      id: 'advanced',
      label: 'Garmin Advanced',
      desc: 'Dual G3X Touch 10", GTN 650Xi, GFC 500 Autopilot.',
      price: 42500
    },
    {
      id: 'premium',
      label: 'Garmin Premium IFR',
      desc: 'Triple G3X Touch, GTN 750Xi, GFC 500, ADS-B In/Out, Wetter.',
      price: 58500
    }
  ],

  extras: [
    {
      id: 'brs',
      label: 'BRS Ballistic Parachute',
      desc: 'Gesamtrettungs-Fallschirmsystem.',
      price: 19500,
      models: ['sling2', 'sling4', 'tsi', 'highwing']
    },
    {
      id: 'ac',
      label: 'Klimaanlage',
      desc: 'Cockpit-Klimatisierung.',
      price: 7500,
      models: ['sling4', 'tsi', 'highwing']
    },
    {
      id: 'heatedseats',
      label: 'Sitzheizung',
      desc: 'Elektrisch beheizte Vordersitze.',
      price: 1200
    },
    {
      id: 'leather',
      label: 'Leder-Interieur',
      desc: 'Premium-Lederausstattung in Wunschfarbe.',
      price: 4800
    },
    {
      id: 'paint',
      label: 'Custom Paint Scheme',
      desc: 'Individuelle Lackierung nach Design-Vorgabe.',
      price: 9500
    },
    {
      id: 'wheelpants',
      label: 'Wheel Pants (Radverkleidungen)',
      desc: 'Aerodynamische Radverkleidungen.',
      price: 1800,
      models: ['sling2', 'sling4', 'tsi']
    },
    {
      id: 'longrange',
      label: 'Long-Range Tanks',
      desc: 'Zusatztanks für erweiterte Reichweite.',
      price: 3200,
      models: ['sling4', 'tsi', 'highwing']
    },
    {
      id: 'glidertow',
      label: 'Schleppkupplung (Glider Tow)',
      desc: 'Für Segelflugzeug-Schlepp zugelassen.',
      price: 2800,
      models: ['sling2']
    },
    {
      id: 'tundra',
      label: 'Tundra-Bereifung',
      desc: 'Grobstollige Reifen für unbefestigte Pisten.',
      price: 2100,
      models: ['highwing']
    }
  ]
};
