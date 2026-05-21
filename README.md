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

### Schnelle Preisaktualisierung (alle 3-4 Monate) — via Google Sheet

Der Configurator kann Preise aus einem Google Sheet ziehen. Du editierst
Preise direkt im Sheet, der Configurator zieht sie beim nächsten Laden.

**Setup einmalig:**

1. **Google Sheet anlegen** mit dieser Spaltenstruktur (erste Zeile = Header):

   ```
   type      | id                | model_id | price_usd | notes
   ----------|-------------------|----------|-----------|------------------
   part      | empennage         | sling2   | 3260      |
   part      | wing              | sling2   | 12640     |
   part      | fuselage          | sling2   | 13180     |
   part      | undercarriage     | sling2   | 6720      |
   part      | finishing         | sling2   | 2700      |
   part      | empennage         | tsi      | 5318      |
   part      | wing              | tsi      | 20801     |
   part      | fuselage          | tsi      | 22198     |
   part      | undercarriage     | tsi      | 13840     |
   part      | finishing         | tsi      | 17279     |
   part      | empennage         | highwing | 5510      |
   part      | wing              | highwing | 22980     |
   part      | fuselage          | highwing | 23260     |
   part      | undercarriage     | highwing | 13900     |
   part      | finishing         | highwing | 15800     |
   engine    | rotax912uls       |          | 28500     |
   engine    | rotax912is        |          | 33500     |
   engine    | rotax915is        |          | 49500     |
   engine    | rotax916is        |          | 54500     |
   ffwd      | rotax912uls       |          | 5980      |
   ffwd      | rotax912is        |          | 6450      |
   ffwd      | rotax915is        |          | 7350      |
   ffwd      | rotax916is        |          | 7711      |
   propeller | sensenich         |          | 4250      |
   propeller | airmaster-3       |          | 11200     |
   propeller | duc-flashback-3r  |          | 13755     |
   propeller | mt-3blade         |          | 12450     |
   avionics  | vfr               |          | 14500     |
   avionics  | standard          |          | 26500     |
   avionics  | advanced          |          | 42500     |
   avionics  | premium           |          | 58500     |
   extra     | brs               |          | 19500     |
   extra     | ac                |          | 7500      |
   extra     | heatedseats       |          | 1200      |
   extra     | leather           |          | 4800      |
   extra     | paint             |          | 9500      |
   extra     | wheelpants        |          | 1800      |
   extra     | longrange         |          | 3200      |
   extra     | glidertow         |          | 2800      |
   extra     | tundra            |          | 2100      |
   meta      | last_updated      |          | 2026-05-21|
   meta      | rate_chf          |          | 0.88      |
   meta      | rate_eur          |          | 0.92      |
   meta      | bundle_discount_usd |        | 200       |
   ```

2. **Sheet veröffentlichen**: `Datei → Freigeben → Im Web veröffentlichen`
   → Bereich: ganzes Dokument → Format: **CSV** → URL kopieren.
   URL sieht so aus:
   `https://docs.google.com/spreadsheets/d/e/2PACX-XXX/pub?gid=0&single=true&output=csv`

3. **URL in `data/catalog.js`** eintragen:
   ```js
   pricesSheetUrl: 'https://docs.google.com/spreadsheets/d/e/.../pub?...&output=csv',
   ```

4. **Commit + Deploy**. Ab jetzt zieht der Configurator bei jedem Laden
   die Preise aus dem Sheet.

**Was du danach machst** (alle 3-4 Monate):
- Sheet öffnen, Preise in `price_usd` aktualisieren
- `last_updated` auf das aktuelle Datum setzen
- Speichern. Fertig — der Configurator zeigt beim nächsten Aufruf die neuen Preise.
  Im Footer steht der aktuelle Stand (z. B. *Preisstand: 21.05.2026 · Live aus Google Sheet*).

**Verhalten bei Sheet-Offline**:
- Letzte erfolgreich geladenen Preise werden aus dem localStorage genutzt
  (Footer zeigt *Cache (Sheet offline)*).
- Wenn auch kein Cache da ist, fallen die im Code hinterlegten Preise ein
  (Footer zeigt *Lokal*).

**Wichtig**: Die `id`s im Sheet müssen exakt mit den `id`s in
`data/catalog.js` übereinstimmen (z. B. `tsi`, `rotax916is`,
`duc-flashback-3r`). Das Sheet überschreibt **nur Preise** —
neue Modelle, neue Engines, neue Extras müssen weiterhin in
`data/catalog.js` ergänzt werden (1× pro Jahr Aufwand).

### Struktur ändern (Modelle, Optionen) — via Code

- **Komponenten-Struktur** (Modelle, Kit-Teile-Liste, Engine-Optionen,
  Propeller, Avionik, Extras): `data/catalog.js` direkt editieren.
- **Default-Wechselkurse**: `defaultRates` in `data/catalog.js`
- Endkunden können den Kurs jederzeit über den Edit-Button (Bleistift)
  in der Page-Header-Leiste überschreiben.

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
