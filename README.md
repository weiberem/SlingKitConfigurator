# Sling Aircraft Kit Configurator

Ein leichtgewichtiger, einbettbarer Configurator für Sling-Aircraft-Kits.
Statische Seite – keine Build-Pipeline, keine Backend-Abhängigkeit.

## Features

- Alle Sling-Modelle: Sling 2, Sling 4, Sling TSi, Sling High Wing
- Self-Build & Quick-Build Kit-Varianten
- Kit-Sektionen einzeln wählbar (Rumpf, Flügel, Leitwerk, Finishing, Firewall-Forward)
- Triebwerksoptionen (Rotax 912 / 914 / 915iS / 916iS) mit Modell-Kompatibilität
- Garmin Avionik-Pakete von VFR Basic bis Premium IFR
- Optionale Ausstattung (BRS, Klima, Leder, Long-Range, Tundra, etc.)
- **Live-Währungsumschaltung USD / CHF / EUR**
- **Wechselkurs vom User anpassbar** – aktiver Kurs wird stets angezeigt
- Persistenz im `localStorage`
- Druck-/PDF-freundliche Konfigurationsübersicht
- Anfrageformular (Demo-Submit, leicht an Backend / Mailto anzubinden)

## Dateien

```
index.html        # Configurator-One-Pager
styles.css        # Sling-Style (dunkles Aviation-Theme)
app.js            # Configurator-Logik
data/catalog.js   # Modelle, Engines, Avionik, Extras, Preise (alle in USD)
```

## Lokal starten

Einfach `index.html` im Browser öffnen – oder lokal servieren:

```bash
python3 -m http.server 8080
# dann http://localhost:8080
```

## Auf der Hauptseite einbetten (slingaircraft.ch)

### Variante A: Iframe

```html
<iframe src="https://configurator.slingaircraft.ch"
        style="width:100%;height:100vh;border:0;"
        title="Sling Aircraft Configurator"></iframe>
```

### Variante B: Direkt-Link

Im One-Pager auf einen Button „Konfigurator starten" verlinken, der auf den
Configurator zeigt – z. B. `https://configurator.slingaircraft.ch`.

## Für Dealer (z. B. Deutschland)

Der Configurator funktioniert ohne Anpassungen für jeden Dealer. Optional kann
über URL-Parameter die Default-Währung gesetzt werden:

```
https://configurator.slingaircraft.ch/?currency=EUR
```

(Hook für Erweiterung ist in `app.js` vorhanden, siehe `state.currency`.)

## Preise & Wechselkurse anpassen

- **Modell-/Komponenten-Preise**: `data/catalog.js` editieren – alle Werte in USD.
- **Default-Wechselkurse**: `defaultRates` in `data/catalog.js` (USD = 1.0,
  CHF und EUR als Multiplikatoren auf USD).
- Endkunden können den Kurs jederzeit über die FX-Leiste oben überschreiben.

## Deployment

Empfohlen: statisches Hosting (Netlify, Vercel, GitHub Pages, Cloudflare Pages).

Beispiel Netlify:

1. Repo verbinden
2. Build command: *(leer)*
3. Publish directory: `/`

## Disclaimer

Preise im Katalog sind Richtwerte. Verbindliche Angebote ausschließlich
über autorisierte Sling-Aircraft-Dealer.
