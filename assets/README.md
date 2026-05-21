# Assets – Bilder & Logos

Alle Konfigurator-Bilder werden hier abgelegt. Die Ordnerstruktur folgt
den IDs aus `data/catalog.js`.

## Namens-Konvention pro Ordner

| Datei            | Zweck                                                |
|------------------|------------------------------------------------------|
| `main.jpg`       | Haupt-/Heldenbild (wird im Configurator angezeigt)   |
| `detail-1.jpg`   | Detailfoto 1 (Galerie)                               |
| `detail-2.jpg`   | Detailfoto 2 (Galerie)                               |
| `detail-N.jpg`   | … beliebig viele Detailbilder                        |
| `thumb.jpg`      | Optionaler kleiner Thumbnail (256–512px breit)       |

**Formate:** `.jpg`, `.png`, `.webp` (empfohlen: WebP für kleine Dateien).
**Empfohlene Grösse:** `main` ≥ 1600×1200 px, `detail-N` ≥ 1200×900 px.

## Struktur

```
assets/
├── logo/                          ← Sling-Aircraft-Logo (sling-logo.svg)
├── models/
│   ├── sling2/                    ← Sling 2 – Außen, Innen, Detail
│   ├── tsi/                       ← Sling TSi
│   └── highwing/                  ← Sling High Wing
├── engines/
│   ├── rotax912uls/
│   ├── rotax912is/
│   ├── rotax915is/
│   └── rotax916is/
├── propellers/
│   ├── sensenich/
│   ├── airmaster-3/
│   ├── duc-flashback-3r/
│   └── mt-3blade/
├── avionics/
│   ├── vfr/
│   ├── standard/
│   ├── advanced/
│   └── premium/
└── extras/
    ├── brs/        ac/             heatedseats/
    ├── leather/    paint/          wheelpants/
    └── longrange/  glidertow/      tundra/
```

## Wie verknüpft sich das mit dem Katalog?

Jeder Eintrag in `data/catalog.js` kann folgende Felder enthalten:

```js
{
  id: 'rotax915is',
  label: 'Rotax 915iS',
  desc: '141 PS · Turbo + Einspritzung',
  price: 49500,
  image:   'assets/engines/rotax915is/main.jpg',
  gallery: [
    'assets/engines/rotax915is/detail-1.jpg',
    'assets/engines/rotax915is/detail-2.jpg'
  ],
  infoUrl: 'https://www.flyrotax.com/'   // Hersteller-Link
}
```

Die Pfade sind **bereits hinterlegt** – sobald du eine Datei mit dem
passenden Namen in den Ordner legst, taucht sie automatisch im
Configurator auf.

## Logo

Lege das offizielle Sling-Aircraft-Logo unter
`assets/logo/sling-logo.svg` ab (SVG bevorzugt). Wird automatisch in
Header und PDF-Export verwendet.
