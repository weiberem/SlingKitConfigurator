# Sling Aircraft Switzerland — Kit Configurator

Reiner Online-Configurator für Sling Aircraft Kits. Keine zusätzlichen
Website-Seiten, keine Marketing-Inhalte — der Configurator ist die
Anwendung. Wird aus der Haupt-Site `slingaircraft.ch` per Link oder
iframe aufgerufen, kann ebenso von Sling-Dealern (z. B. Deutschland)
unter eigener Domain eingebunden werden.

## Features

- **Drei Sling-Modelle**: Sling 2, Sling TSi, Sling High Wing — prominent
  ganz oben umschaltbar
- **Modell-spezifische Kit-Teile** mit realistischen Preisen
- **Komplett-Rabatt** wenn alle Pflicht-Kit-Teile zusammen bestellt werden
- **Motor / Propeller / Avionik / Extras** als eigene Sektionen
- **Firewall-Forward + Fuel Kit** automatisch motorabhängig dazugerechnet
- **USD-Basis · CHF / EUR Umrechnung** — Kurs immer sichtbar, vom
  Benutzer anpassbar
- **Konfiguration speichern** unter eigenem Namen (localStorage)
- **Eindeutiger Link / QR-Code** pro Konfiguration — teilbar per URL
- **Vergleichsansicht** — mehrere Konfigurationen side-by-side, günstigste
  Variante wird hervorgehoben
- **Druck-/Broschüren-Ansicht** für PDF-Export
- **Anfrageformular** in der Zusammenfassung

## Dateien

```
index.html        # Configurator-UI
styles.css        # Sling Switzerland Look & Feel (dunkel + Sling-Rot)
app.js            # Configurator-Logik, Save/Compare/Share
data/catalog.js   # Modelle, Kit-Teile, Engines, Propeller, Avionik, Extras (USD)
```

## Lokal starten

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Configurations-Links

Jede Konfiguration wird als Base64-JSON im URL-Hash kodiert:

```
https://configurator.slingaircraft.ch/#c=eyJtb2RlbElkIjoidHNpIiwicGFydHMiOlsiZW1wZW5uYWdlIiwid2luZyJdLi4u
```

Öffnen des Links → Konfigurator lädt exakt diese Auswahl.
„QR / Link teilen" generiert URL + scannbaren QR-Code.

## Einbettung in slingaircraft.ch

```html
<iframe src="https://configurator.slingaircraft.ch"
        style="width:100%;height:100vh;border:0"
        title="Sling Aircraft Configurator"></iframe>
```

Oder als direkter Link/Button auf der Hauptseite.

## Preise / Wechselkurse anpassen

- **Komponenten-Preise**: `data/catalog.js` — alle Werte in **USD**
- **Default-Wechselkurse**: `defaultRates` in `data/catalog.js`
  (`USD: 1.0`, `CHF: 0.88`, `EUR: 0.92`)
- Endkunden können den Kurs jederzeit über den Edit-Button (Bleistift)
  in der Page-Header-Leiste überschreiben

## Deployment

Statisches Hosting reicht (kein Build-Schritt):
- GitHub Pages
- Netlify / Vercel / Cloudflare Pages
- FTP-Upload auf eigenen Webspace

Beispiel Netlify:
1. Repo verbinden
2. Build command: *(leer)*
3. Publish dir: `/`

## Disclaimer

Preise im Katalog sind Richtwerte basierend auf öffentlich kommunizierten
Werten. Verbindliche Angebote ausschließlich über autorisierte Sling-Dealer.
