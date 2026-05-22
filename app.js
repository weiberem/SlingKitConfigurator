/* Sling Aircraft Switzerland – Configurator App */
(function () {
  'use strict';

  const CATALOG = window.SLING_CATALOG;
  const KEY_CURRENT = 'sling-config-current-v2';
  const KEY_SAVED = 'sling-configs-saved-v2';
  const KEY_RATES = 'sling-config-rates-v2';
  const KEY_CURRENCY = 'sling-config-currency-v2';
  const KEY_PRICES_CACHE = 'sling-prices-cache-v1';
  const PRICES_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

  /* -------- State -------- */

  function emptyConfig(modelId) {
    return {
      modelId: modelId || 'tsi',
      parts: [],
      engineId: null,
      includeFFwd: true,
      propellerId: null,
      propellerAddons: {},
      avionicsId: null,
      extras: [],
      services: [],
      quickbuild: []
    };
  }

  let state = {
    config: loadCurrent() || initFromURL() || autoSelectAll('tsi'),
    rates: loadRates(),
    currency: loadCurrency(),
    activeSection: 'parts',
    saved: loadSaved(),
    compareIds: []
  };

  function autoSelectAll(modelId) {
    const cfg = emptyConfig(modelId);
    const m = findModel(modelId);
    if (m) cfg.parts = m.parts.map(p => p.id);
    return cfg;
  }

  function loadCurrent() {
    try {
      const c = JSON.parse(localStorage.getItem(KEY_CURRENT));
      if (c) {
        if (!Array.isArray(c.services))   c.services = [];
        if (!Array.isArray(c.quickbuild)) c.quickbuild = [];
        if (!c.propellerAddons || typeof c.propellerAddons !== 'object') c.propellerAddons = {};
        if (c.propellerId && !CATALOG.propellers.some(p => p.id === c.propellerId)) c.propellerId = null;
      }
      return c;
    } catch { return null; }
  }
  function loadSaved() {
    try { return JSON.parse(localStorage.getItem(KEY_SAVED)) || []; } catch { return []; }
  }
  function loadRates() {
    try {
      const r = JSON.parse(localStorage.getItem(KEY_RATES));
      return { ...CATALOG.defaultRates, ...(r || {}) };
    } catch { return { ...CATALOG.defaultRates }; }
  }
  function loadCurrency() {
    return localStorage.getItem(KEY_CURRENCY) || 'CHF';
  }

  function persist() {
    try { localStorage.setItem(KEY_CURRENT, JSON.stringify(state.config)); } catch {}
    try { localStorage.setItem(KEY_SAVED, JSON.stringify(state.saved)); } catch {}
    try { localStorage.setItem(KEY_RATES, JSON.stringify(state.rates)); } catch {}
    try { localStorage.setItem(KEY_CURRENCY, state.currency); } catch {}
  }

  function initFromURL() {
    const h = location.hash;
    if (!h || !h.startsWith('#c=')) return null;
    try {
      const json = decodeURIComponent(escape(atob(h.slice(3))));
      return JSON.parse(json);
    } catch { return null; }
  }

  function encodeConfigToHash(cfg) {
    const json = JSON.stringify(cfg);
    return '#c=' + btoa(unescape(encodeURIComponent(json)));
  }

  /* -------- Google Sheet Preis-Loader -------- */

  function parseCsv(text) {
    const rows = [];
    text = text.replace(/^﻿/, '');
    const lines = text.split(/\r\n|\n|\r/);
    for (const line of lines) {
      if (!line) continue;
      const cells = [];
      let i = 0, cell = '', inQ = false;
      while (i < line.length) {
        const c = line[i];
        if (inQ) {
          if (c === '"' && line[i + 1] === '"') { cell += '"'; i += 2; continue; }
          if (c === '"') { inQ = false; i++; continue; }
          cell += c; i++;
        } else {
          if (c === '"') { inQ = true; i++; continue; }
          if (c === ',') { cells.push(cell.trim()); cell = ''; i++; continue; }
          cell += c; i++;
        }
      }
      cells.push(cell.trim());
      rows.push(cells);
    }
    return rows;
  }

  function rowsToOverrides(rows) {
    if (!rows.length) return { prices: {}, meta: {} };
    const header = rows[0].map(h => h.toLowerCase());
    const colType  = header.indexOf('type');
    const colId    = header.indexOf('id');
    const colModel = header.indexOf('model_id');
    const colPrice = header.indexOf('price_usd');
    if (colType < 0 || colId < 0 || colPrice < 0) {
      throw new Error('CSV-Header muss type, id, price_usd enthalten');
    }
    const prices = {};
    const meta = {};
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const type = (row[colType] || '').toLowerCase();
      const id   = row[colId] || '';
      const modelId = colModel >= 0 ? (row[colModel] || '') : '';
      const priceStr = (row[colPrice] || '').toString().replace(/[\s'’]/g, '').replace(',', '.');
      if (!type || !id) continue;
      if (type === 'meta') {
        meta[id] = priceStr;
        continue;
      }
      const num = parseFloat(priceStr);
      if (!isFinite(num)) continue;
      const key = modelId ? `${type}:${modelId}:${id}` : `${type}:${id}`;
      prices[key] = num;
    }
    return { prices, meta };
  }

  function applyPriceOverrides({ prices, meta }) {
    let applied = 0;
    CATALOG.models.forEach(m => {
      m.parts.forEach(p => {
        const k = `part:${m.id}:${p.id}`;
        if (prices[k] != null) { p.price = prices[k]; applied++; }
      });
    });
    CATALOG.engines.forEach(e => {
      if (prices[`engine:${e.id}`] != null) { e.price = prices[`engine:${e.id}`]; applied++; }
    });
    CATALOG.propellers.forEach(p => {
      if (prices[`propeller:${p.id}`] != null) { p.price = prices[`propeller:${p.id}`]; applied++; }
    });
    CATALOG.avionics.forEach(a => {
      if (prices[`avionics:${a.id}`] != null) { a.price = prices[`avionics:${a.id}`]; applied++; }
    });
    CATALOG.extras.forEach(x => {
      if (prices[`extra:${x.id}`] != null) { x.price = prices[`extra:${x.id}`]; applied++; }
    });
    Object.keys(CATALOG.firewallForward.perEngine).forEach(eid => {
      if (prices[`ffwd:${eid}`] != null) { CATALOG.firewallForward.perEngine[eid] = prices[`ffwd:${eid}`]; applied++; }
    });
    if (meta.rate_chf) { const v = parseFloat(meta.rate_chf); if (isFinite(v) && v > 0) CATALOG.defaultRates.CHF = v; }
    if (meta.rate_eur) { const v = parseFloat(meta.rate_eur); if (isFinite(v) && v > 0) CATALOG.defaultRates.EUR = v; }
    if (meta.bundle_discount_pct) { const v = parseFloat(meta.bundle_discount_pct); if (isFinite(v) && v >= 0) CATALOG.bundleDiscountPct = v > 1 ? v / 100 : v; }
    return applied;
  }

  function loadPricesCache() {
    try { return JSON.parse(localStorage.getItem(KEY_PRICES_CACHE)); } catch { return null; }
  }
  function savePricesCache(payload) {
    try { localStorage.setItem(KEY_PRICES_CACHE, JSON.stringify(payload)); } catch {}
  }

  function setPriceStand(date, source) {
    const el = document.getElementById('priceStand');
    if (!el) return;
    const formatted = date ? formatDateStr(date) : '—';
    const srcLabel = source === 'sheet' ? 'Live aus Google Sheet'
                    : source === 'cache' ? 'Cache (Sheet offline)'
                    : 'Lokal';
    el.textContent = `Preisstand: ${formatted} · ${srcLabel}`;
  }

  function formatDateStr(s) {
    if (!s) return '—';
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}.${m[2]}.${m[1]}`;
    return s;
  }

  async function fetchSheetPrices() {
    const url = CATALOG.pricesSheetUrl;
    if (!url) {
      setPriceStand(CATALOG.pricesUpdated, 'local');
      return false;
    }
    const cache = loadPricesCache();
    // Cache zuerst rendern (Schnellstart), Sheet im Hintergrund
    if (cache && cache.payload) {
      try {
        const n = applyPriceOverrides(cache.payload);
        setPriceStand(cache.payload.meta.last_updated || CATALOG.pricesUpdated, 'cache');
        if (typeof update === 'function') update();
        console.log(`[Sheet] ${n} Preise aus Cache geladen`);
      } catch (e) { console.warn('Cache fehlerhaft', e); }
    }
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const rows = parseCsv(text);
      const payload = rowsToOverrides(rows);
      const n = applyPriceOverrides(payload);
      savePricesCache({ payload, fetchedAt: Date.now() });
      setPriceStand(payload.meta.last_updated || CATALOG.pricesUpdated, 'sheet');
      if (typeof update === 'function') update();
      console.log(`[Sheet] ${n} Preise aus Google Sheet geladen`);
      return true;
    } catch (e) {
      console.warn('[Sheet] Konnte Preise nicht laden:', e.message);
      if (!cache) setPriceStand(CATALOG.pricesUpdated, 'local');
      return false;
    }
  }

  /* -------- Lookups (function decls so they're hoisted) -------- */

  function findModel(id)    { return CATALOG.models.find(m => m.id === id) || null; }
  function findEngine(id)   { return CATALOG.engines.find(e => e.id === id) || null; }
  function findProp(id)     { return CATALOG.propellers.find(p => p.id === id) || null; }
  function findAvionics(id) { return CATALOG.avionics.find(a => a.id === id) || null; }
  function findExtra(id)    { return CATALOG.extras.find(x => x.id === id) || null; }
  function findService(id)  { return (CATALOG.services || []).find(s => s.id === id) || null; }

  /* Preis eines Extras für ein gegebenes Modell (unterstützt sowohl die
     neue prices-Objekt-Form als auch das alte price+models-Schema). */
  function extraPrice(x, modelId) {
    if (x && x.prices && typeof x.prices === 'object') return x.prices[modelId];
    if (x && typeof x.price === 'number') {
      if (Array.isArray(x.models) && !x.models.includes(modelId)) return undefined;
      return x.price;
    }
    return undefined;
  }
  function extraCompatible(x, modelId) { return typeof extraPrice(x, modelId) === 'number'; }

  /* -------- Formatting -------- */

  function formatApprox(usd, currencyOverride) {
    if (!isFinite(usd)) return '—';
    if (usd === 0) return 'inkl.';
    return 'ca. ' + format(usd, currencyOverride);
  }

  function format(usd, currencyOverride) {
    if (!isFinite(usd)) return '—';
    const cur = currencyOverride || state.currency;
    const val = usd * (state.rates[cur] || 1);
    const rounded = Math.round(val);
    const grouped = rounded.toLocaleString('de-CH').replace(/,/g, "'");
    if (cur === 'EUR') return `EUR ${grouped}`;
    if (cur === 'CHF') return `CHF ${grouped}`;
    return `USD ${grouped}`;
  }

  /* -------- Totals -------- */

  function totals(cfg) {
    cfg = cfg || state.config;
    const lines = [];
    const model = findModel(cfg.modelId);
    if (!model) return { lines, partsSubtotal: 0, total: 0 };

    const selectedParts = model.parts.filter(p => cfg.parts.includes(p.id));
    const partsSubtotal = selectedParts.reduce((s, p) => s + p.price, 0);

    const allSelected = selectedParts.length === model.parts.length;

    if (selectedParts.length > 0) {
      lines.push({ type: 'group', label: 'Kit-Teile', value: partsSubtotal, sub: selectedParts.map(p => ({ label: p.label, value: p.price })) });
    }

    const engine = findEngine(cfg.engineId);
    if (engine && engine.id !== 'own-engine') {
      lines.push({ type: 'add', label: `Motor: ${engine.label}`, value: engine.price, approx: !!engine.approxPrice });
    }

    if (cfg.includeFFwd && engine && engine.id !== 'own-engine') {
      const ffPrice = (CATALOG.firewallForward.perEngine || {})[engine.id];
      if (ffPrice) lines.push({ type: 'add', label: `${CATALOG.firewallForward.label} (${engine.label})`, value: ffPrice, approx: !!engine.approxPrice });
    }

    const prop = findProp(cfg.propellerId);
    if (prop) {
      lines.push({ type: 'add', label: `Propeller: ${prop.label}`, value: prop.price });
      if (prop.addon && cfg.propellerAddons && cfg.propellerAddons[prop.addon.id]) {
        lines.push({ type: 'add', label: `↳ ${prop.addon.label}`, value: prop.addon.priceAdd, approx: !!prop.addon.approxPrice });
      }
    }

    const av = findAvionics(cfg.avionicsId);
    if (av) lines.push({ type: 'add', label: `Avionik: ${av.label}`, value: av.price });

    cfg.extras.forEach(eid => {
      const x = findExtra(eid);
      if (!x) return;
      const p = extraPrice(x, cfg.modelId);
      if (typeof p === 'number') lines.push({ type: 'add', label: x.label, value: p });
    });

    (cfg.services || []).forEach(sid => {
      const s = findService(sid);
      if (!s) return;
      if (s.quoteOnly) {
        lines.push({ type: 'add', label: `${s.label} (auf Anfrage)`, value: 0, quoteOnly: true });
      } else {
        lines.push({ type: 'add', label: s.label, value: s.price });
      }
    });

    // Quickbuild – ausgewählte Items
    const qbList = (CATALOG.quickbuild && CATALOG.quickbuild[cfg.modelId]) || [];
    const qbSelected = (cfg.quickbuild || []).map(id => qbList.find(q => q.id === id)).filter(Boolean);
    qbSelected.forEach(q => lines.push({ type: 'add', label: `Quickbuild: ${q.label}`, value: q.price }));

    // Crating (nur wenn Quickbuild-Items gewählt) – per-Modell
    if (qbSelected.length > 0 && CATALOG.shipping && CATALOG.shipping.quickbuildCrating) {
      const crateP = (CATALOG.shipping.quickbuildCrating.prices || {})[cfg.modelId];
      if (typeof crateP === 'number') {
        lines.push({ type: 'add', label: CATALOG.shipping.quickbuildCrating.label, value: crateP });
      }
    }

    // Packing – Pflicht, prozentual pro gewähltem Kit-Teil
    const packPct = (CATALOG.shipping && CATALOG.shipping.packing && CATALOG.shipping.packing.percent || {})[cfg.modelId];
    if (typeof packPct === 'number' && packPct > 0 && partsSubtotal > 0) {
      const packValue = Math.round(partsSubtotal * packPct);
      lines.push({
        type: 'add',
        label: `${CATALOG.shipping.packing.label} (${(packPct * 100).toFixed(2)} % pro Kit-Teil)`,
        value: packValue,
        required: true
      });
    }

    const subtotal = lines.reduce((s, l) => s + l.value, 0);
    const pct = CATALOG.bundleDiscountPct || 0;
    const discount = allSelected && pct > 0 ? Math.round(subtotal * pct) : 0;
    const total = subtotal - discount;
    return { lines, partsSubtotal, subtotal, total, discount, discountPct: allSelected ? pct : 0 };
  }

  /* -------- Icons -------- */

  const ICONS = {
    parts:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    engine:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
    propeller:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 12L4 4"/><path d="M12 12l8-8"/><path d="M12 12L4 20"/><path d="M12 12l8 8"/><circle cx="12" cy="12" r="2"/></svg>',
    avionics:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="1"/><line x1="6" y1="10" x2="10" y2="10"/><line x1="6" y1="14" x2="10" y2="14"/></svg>',
    extras:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    summary:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>',
    compare:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="3" x2="12" y2="21"/><path d="M8 7L4 11l4 4"/><path d="M16 7l4 4-4 4"/></svg>',
    saved:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    'plane-low': '<svg viewBox="0 0 64 64" width="32" height="32" fill="currentColor"><path d="M32 6c1 0 2 .8 2 2v18l24 8v6L34 36v14l6 3v4l-8-2-8 2v-4l6-3V36L6 40v-6l24-8V8c0-1.2.8-2 2-2z"/></svg>',
    'plane-high': '<svg viewBox="0 0 64 64" width="32" height="32" fill="currentColor"><path d="M32 6c1 0 2 .8 2 2v6l24 8v6L34 22v18l8 5v4l-10-2-10 2v-4l8-5V22L6 28v-6l24-8V8c0-1.2.8-2 2-2z"/></svg>'
  };

  /* -------- Renderers -------- */

  function renderModelStage() {
    const host = document.getElementById('modelStage');
    if (!host) return;
    const models = CATALOG.models;
    const idx = Math.max(0, models.findIndex(m => m.id === state.config.modelId));
    const m = models[idx];
    if (!m) return;

    document.getElementById('msName').textContent = '';
    document.getElementById('msTag').textContent = '';
    document.getElementById('msFrom').innerHTML = `Kit ab <strong>${format(m.partsBaseSum)}</strong>`;

    const dots = document.getElementById('msDots');
    dots.innerHTML = models.map((mm, i) => `<button class="ms-dot ${i === idx ? 'active' : ''}" data-i="${i}" type="button" aria-label="${mm.name}"></button>`).join('');
    dots.querySelectorAll('.ms-dot').forEach(d => {
      d.addEventListener('click', () => switchModel(models[+d.dataset.i].id));
    });

    const img = document.getElementById('mpImg');
    const bg = document.getElementById('mpBg');
    const fb = document.getElementById('mpFallback');
    fb.innerHTML = ICONS[m.icon] || ICONS['plane-low'];

    // Galerie aus m.gallery (Fallback auf m.image); auto-rotate alle 5s
    const photos = (Array.isArray(m.gallery) && m.gallery.length) ? m.gallery : (m.image ? [m.image] : []);
    if (window.__mpTimer) { clearInterval(window.__mpTimer); window.__mpTimer = null; }
    if (photos.length) {
      let pi = 0;
      const show = () => { tryImage(img, bg, candidatePaths(photos[pi]), m.name); };
      show();
      if (photos.length > 1) {
        window.__mpTimer = setInterval(() => { pi = (pi + 1) % photos.length; show(); }, 5000);
      }
    } else {
      img.style.display = 'none';
      img.removeAttribute('src');
      if (bg) { bg.removeAttribute('src'); bg.dataset.loaded = 'false'; }
    }
  }

  function candidatePaths(p) {
    const m = p.match(/^(.*?)(\.(jpg|jpeg|png|webp))$/i);
    const base = m ? m[1] : p;
    const ext = m ? m[2] : '.jpg';
    const others = ['.jpg', '.png', '.webp', '.jpeg'].filter(e => e.toLowerCase() !== ext.toLowerCase());
    return [p, ...others.map(e => base + e)];
  }

  function tryImage(img, bg, paths, alt) {
    let i = 0;
    img.style.display = 'none';
    img.alt = alt || '';
    function next() {
      if (i >= paths.length) {
        img.style.display = 'none';
        img.onerror = null; img.onload = null;
        if (bg) { bg.dataset.loaded = 'false'; bg.removeAttribute('src'); }
        return;
      }
      const p = paths[i++];
      img.onload = () => {
        img.style.display = 'block';
        if (bg) {
          bg.onload = () => { bg.dataset.loaded = 'true'; };
          bg.onerror = () => { bg.dataset.loaded = 'false'; };
          bg.src = p;
        }
      };
      img.onerror = next;
      img.src = p;
    }
    next();
  }

  function stepIndex(id) {
    const order = ['parts','accessories','avionics','services','summary'];
    return order.indexOf(id);
  }
  function stepAtIndex(i) {
    const order = ['parts','accessories','avionics','services','summary'];
    return order[Math.max(0, Math.min(order.length - 1, i))];
  }

  function nextModel(dir) {
    const models = CATALOG.models;
    const cur = models.findIndex(mm => mm.id === state.config.modelId);
    const ni = (cur + dir + models.length) % models.length;
    switchModel(models[ni].id);
  }

  function bindHeaderIconButtons() {
    const savedBtn = document.getElementById('savedBtn');
    if (savedBtn) savedBtn.addEventListener('click', () => setSection('saved'));
  }

  function bindModelStage() {
    const prev = document.getElementById('msPrev');
    const next = document.getElementById('msNext');
    if (prev) prev.addEventListener('click', () => nextModel(-1));
    if (next) next.addEventListener('click', () => nextModel(+1));

    // Touch swipe für iPad
    const stage = document.getElementById('modelStage');
    if (stage) {
      let sx = 0, sy = 0, t = 0;
      stage.addEventListener('touchstart', e => {
        const tt = e.changedTouches[0];
        sx = tt.clientX; sy = tt.clientY; t = Date.now();
      }, { passive: true });
      stage.addEventListener('touchend', e => {
        const tt = e.changedTouches[0];
        const dx = tt.clientX - sx;
        const dy = tt.clientY - sy;
        const dt = Date.now() - t;
        if (dt < 500 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          nextModel(dx < 0 ? +1 : -1);
        }
      }, { passive: true });
    }
  }

  const STEP_ICONS = {
    // 1 – Hangar (Aufbau): Hallengebäude mit Tor
    parts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M3 21V10l9-5 9 5v11"/><path d="M8 21v-7h8v7"/><path d="M3 21h18"/></svg>',
    // 2 – Zubehör: Settings/Gear (Motor + Propeller + Extras)
    accessories: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    // 3 – Avionik: Rundinstrument mit Nadel
    avionics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="9"/><path d="M12 3v2M21 12h-2M12 21v-2M3 12h2"/><path d="M12 12l4.5-3.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg>',
    // 4 – Services: Handshake
    services: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M11 17l2 2a1 1 0 0 0 1.4-1.4"/><path d="M14 14l2.5 2.5a1 1 0 0 0 1.4-1.4l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a1 1 0 1 1-1.4-1.4l2.8-2.8a5.8 5.8 0 0 1 7-.9l.5.3a2 2 0 0 0 1.4.2L21 4"/><path d="M21 3l1 11h-2"/><path d="M3 3L2 14l6.5 6.5a1 1 0 1 0 1.4-1.4"/><path d="M3 4h6"/></svg>',
    // 5 – Bestellen: startendes Flugzeug (steigend)
    summary: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M21.5 2.5c-.3-.3-.7-.4-1-.3L3.6 7.4c-.5.1-.7.7-.4 1.1l4.8 4 5.5-5.5-3.6 6.7 4.5 4.5c.4.3 1 .2 1.1-.4l5.3-15.4c.1-.3 0-.7-.3-.9zM2.5 18.5c2-2 4-2 6 0"/></svg>'
  };

  const STEP_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>';

  const STEPS = [
    { id: 'parts',       label: 'Kit-Teile' },
    { id: 'accessories', label: 'Zubehör' },
    { id: 'avionics',    label: 'Avionik' },
    { id: 'services',    label: 'Services' },
    { id: 'summary',     label: 'Bestellen' }
  ];

  function activeSteps() {
    return STEPS.slice();
  }

  function renderSidebar() {
    const host = document.getElementById('stepsBar');
    if (!host) return;
    const steps = activeSteps();
    const activeIdx = steps.findIndex(s => s.id === state.activeSection);
    const parts = [];
    parts.push('<div class="steps-inner">');
    steps.forEach((s, i) => {
      const cls = i === activeIdx ? 'active' : (i < activeIdx ? 'done' : '');
      const inner = (i < activeIdx) ? STEP_CHECK : (STEP_ICONS[s.id] || '');
      parts.push(`
        <button type="button" class="step ${cls}" data-section="${s.id}" aria-current="${i === activeIdx}">
          <span class="step-num">${inner}</span>
          <span class="step-label">${s.label}</span>
        </button>
      `);
      if (i < steps.length - 1) {
        parts.push(`<span class="step-sep ${i < activeIdx ? 'done' : ''}"></span>`);
      }
    });
    parts.push('</div>');
    host.innerHTML = parts.join('');
    host.querySelectorAll('.step').forEach(b => {
      b.addEventListener('click', () => setSection(b.dataset.section));
    });
  }

  function setSection(id) {
    if (state.activeSection === id) return;
    const panels = document.querySelectorAll('.main-panel .panel');
    const cur = document.getElementById(`panel-${state.activeSection}`);
    state.activeSection = id;
    const finish = () => {
      panels.forEach(p => {
        p.hidden = p.id !== `panel-${id}`;
        p.classList.remove('leaving');
      });
      if (id === 'saved') renderSavedPanel();
      if (id === 'compare') renderComparePanel();
      if (id === 'summary') renderFullSummaryPanel();
      renderSidebar();
    };
    if (cur && !cur.hidden) {
      cur.classList.add('leaving');
      setTimeout(finish, 180);
    } else {
      finish();
    }
  }

  const PANEL_TITLES = {
    parts:       'Kit Komponenten',
    accessories: 'Zubehör',
    avionics:    'Avionik',
    services:    'Services',
    summary:     'Zusammenfassung &amp; Bestellung'
  };

  function renderPanelTitles() {
    const m = findModel(state.config.modelId);
    const suffix = m ? ` für meine <strong>${m.name}</strong>` : '';
    Object.keys(PANEL_TITLES).forEach(id => {
      const el = document.getElementById('title-' + id);
      if (el) el.innerHTML = PANEL_TITLES[id] + suffix;
    });
  }

  function renderCurrencyMenu() {
    const menu = document.getElementById('curMenu');
    if (!menu) return;
    const items = ['USD', 'CHF', 'EUR'];
    menu.innerHTML = items.map(cur => {
      const active = cur === state.currency ? 'active' : '';
      const rate = cur === 'USD' ? null : (state.rates[cur] || 1);
      const rateHtml = rate === null
        ? '<span class="cur-rate cur-rate-base">Basis</span>'
        : `<button type="button" class="cur-rate" data-edit="${cur}" title="Kurs bearbeiten">1 = ${rate.toFixed(4)}</button>`;
      return `
        <li role="option" data-value="${cur}" class="${active}">
          <span class="cur-name">${cur}</span>
          ${rateHtml}
        </li>
      `;
    }).join('');
  }

  const LOGO_MODEL_SUFFIX = {
    sling2:   '<span class="ws">2</span>',
    tsi:      '<span class="ws">TS</span><span class="rs">i</span>',
    highwing: '<span class="ws">H</span><span class="rs">W</span>'
  };

  function renderHeader() {
    const m = findModel(state.config.modelId);
    const titleEl = document.getElementById('modelTitle');
    if (titleEl) titleEl.textContent = m ? m.name : '—';
    document.getElementById('summaryModelName').textContent = m ? m.name : '—';
    const suffix = LOGO_MODEL_SUFFIX[state.config.modelId] || '';
    const logoModel = document.getElementById('logoModel');
    if (logoModel) logoModel.innerHTML = suffix;
    const pvLogoModel = document.getElementById('pvLogoModel');
    if (pvLogoModel) pvLogoModel.innerHTML = suffix;
    document.getElementById('curLabel').textContent = state.currency;
    renderCurrencyMenu();
    renderPanelTitles();
    document.getElementById('summaryNote').textContent =
      state.currency === 'USD'
        ? 'Alle Preise in USD, ohne MwSt, ab Werk Johannesburg'
        : `Umgerechnet zu 1 USD = ${(state.rates[state.currency] || 1).toFixed(4)} ${state.currency}`;
  }

  function renderCurrencyPills() {
    document.querySelectorAll('.cur-pill').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.currency === state.currency ? 'true' : 'false');
    });
  }

  function renderParts() {
    const m = findModel(state.config.modelId);
    if (!m) return;
    const host = document.getElementById('partsList');
    const qbAll = (CATALOG.quickbuild || {})[state.config.modelId] || [];
    state.config.quickbuild = state.config.quickbuild || [];

    host.innerHTML = m.parts.map(p => {
      const selected = state.config.parts.includes(p.id);
      const qbForPart = qbAll.filter(q => q.kitPartId === p.id);
      const qbSelectedForPart = qbForPart.filter(q => state.config.quickbuild.includes(q.id));
      const qbHasSelection = qbSelectedForPart.length > 0;
      const qbToggleLabel = qbHasSelection
        ? `Quickbuild: ${qbSelectedForPart.length} gewählt ▾`
        : `+ Quickbuild für ${p.label.replace(/\s*Kit$/i, '')} ▾`;
      const qbBlock = qbForPart.length ? `
        <div class="qb-inline" data-qb-part="${p.id}">
          <button type="button" class="qb-toggle ${qbHasSelection ? 'has-sel' : ''}" data-qb-toggle="${p.id}" aria-expanded="false">
            ${qbToggleLabel}
          </button>
          <div class="qb-list" hidden>
            ${qbForPart.map(q => {
              const sel = state.config.quickbuild.includes(q.id);
              const reqLabels = Array.isArray(q.requires)
                ? q.requires.map(r => qbAll.find(x => x.id === r)?.label).filter(Boolean)
                : [];
              const reqHint = reqLabels.length
                ? `<div class="qb-req">↳ benötigt automatisch: ${reqLabels.join(', ')}</div>`
                : '';
              return `
                <label class="qb-item ${sel ? 'selected' : ''}" data-qb-id="${q.id}">
                  <span class="qb-check">${sel ? checkSvg() : ''}</span>
                  <span class="qb-label">${q.label}${reqHint}</span>
                  <span class="qb-price">+ ${format(q.price)}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      ` : '';
      return `
        <div class="part-wrap">
          <label class="option ${selected ? 'selected' : ''}" data-part="${p.id}" tabindex="0" role="checkbox" aria-checked="${selected}">
            <span class="opt-check">${checkSvg()}</span>
            <span class="opt-body">
              <span class="opt-title">${p.label}</span>
              <span class="opt-desc">${p.desc}</span>
              <div class="opt-price">${format(p.price)}</div>
            </span>
          </label>
          ${qbBlock}
        </div>
      `;
    }).join('');

    const allSelected = state.config.parts.length === m.parts.length;
    document.getElementById('togglePartsBtn').textContent = allSelected ? 'Alle abwählen' : 'Alle wählen';
    const badge = document.getElementById('bundleBadge');
    if (allSelected) {
      const t = totals();
      const pctText = ((CATALOG.bundleDiscountPct || 0) * 100).toFixed(0);
      badge.hidden = false;
      document.getElementById('bundleAmt').textContent =
        t.discount > 0
          ? `Komplett-Kit: ${pctText}% Rabatt – Sie sparen ${format(t.discount)}`
          : `Komplett-Kit: ${pctText}% Rabatt`;
    } else {
      badge.hidden = true;
    }

    host.querySelectorAll('.option[data-part]').forEach(opt => {
      const toggle = () => {
        const id = opt.dataset.part;
        if (state.config.parts.includes(id)) state.config.parts = state.config.parts.filter(x => x !== id);
        else state.config.parts.push(id);
        update();
      };
      opt.addEventListener('click', e => { e.preventDefault(); toggle(); });
      opt.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    });

    host.querySelectorAll('[data-qb-toggle]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation(); e.preventDefault();
        const list = btn.parentElement.querySelector('.qb-list');
        const open = list.hidden;
        list.hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
      });
    });

    host.querySelectorAll('.qb-item').forEach(item => {
      item.addEventListener('click', e => {
        e.stopPropagation(); e.preventDefault();
        const id = item.dataset.qbId;
        const arr = state.config.quickbuild;
        const i = arr.indexOf(id);
        if (i >= 0) {
          arr.splice(i, 1);
          // Items, die diesen als requires hatten, auch entfernen
          for (let k = arr.length - 1; k >= 0; k--) {
            const other = qbAll.find(q => q.id === arr[k]);
            if (other && Array.isArray(other.requires) && other.requires.includes(id)) {
              arr.splice(k, 1);
            }
          }
        } else {
          arr.push(id);
          const q = qbAll.find(qq => qq.id === id);
          if (q && Array.isArray(q.requires)) {
            q.requires.forEach(req => { if (!arr.includes(req)) arr.push(req); });
          }
        }
        update();
      });
    });

    renderQbWarning();
  }

  function renderQbWarning() {
    const m = findModel(state.config.modelId);
    if (!m) return;
    const qbCount = (state.config.quickbuild || []).length;
    const host = document.getElementById('qbWarning');
    if (!host) return;
    if (qbCount === 0) { host.hidden = true; host.innerHTML = ''; return; }
    host.hidden = false;
    if (qbCount >= 3) {
      host.className = 'qb-warning qb-warning-danger';
      host.innerHTML = `<strong>⚠️ ${qbCount} Quickbuild-Optionen gewählt</strong> – Die <strong>51 %-Regel</strong> (Builder's Rule) wird in der Schweiz mit grosser Wahrscheinlichkeit <strong>nicht eingehalten</strong>. Vor Bestellung zwingend mit der EAS (Experimental Aviation of Switzerland) abklären.`;
    } else {
      host.className = 'qb-warning qb-warning-info';
      host.innerHTML = `ℹ️ <strong>51 %-Regel (Builder's Rule)</strong>: Wird in der Schweiz task-basiert geprüft – jede Quickbuild-Option muss individuell mit der EAS geklärt werden.`;
    }
  }

  function checkSvg() {
    return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  }

  function infoLinkHtml(item, brand) {
    if (!item.infoUrl) return '';
    return `<a class="opt-link" href="${item.infoUrl}" target="_blank" rel="noopener noreferrer">${brand} ↗</a>`;
  }

  function bindOptionLinks(host) {
    host.querySelectorAll('.opt-link').forEach(a => {
      a.addEventListener('click', e => e.stopPropagation());
      a.addEventListener('keydown', e => e.stopPropagation());
    });
  }

  function renderEngines() {
    const m = findModel(state.config.modelId);
    const host = document.getElementById('engineList');
    const compatibleEngines = CATALOG.engines.filter(e => !m || m.compatibleEngines.includes(e.id));

    host.innerHTML = compatibleEngines.map(e => {
      const selected = state.config.engineId === e.id;
      const isOwn = e.id === 'own-engine';
      const brand = isOwn ? null : 'Rotax';
      const priceTxt = isOwn ? '<em>Nicht im Sling-Preis enthalten</em>' :
        (e.approxPrice ? formatApprox(e.price) : format(e.price));
      const ffwdHtml = (!isOwn && state.config.includeFFwd && CATALOG.firewallForward.perEngine[e.id])
        ? ` <span style="color:var(--text-mute);font-weight:400">+ ${e.approxPrice ? formatApprox(CATALOG.firewallForward.perEngine[e.id]) : format(CATALOG.firewallForward.perEngine[e.id])} FF-Kit</span>`
        : '';
      return `
        <label class="option is-radio ${selected ? 'selected' : ''}" data-engine="${e.id}" tabindex="0" role="radio" aria-checked="${selected}">
          <span class="opt-check">${checkSvg()}</span>
          <span class="opt-body">
            <span class="opt-title">${e.label}</span>
            <span class="opt-desc">${e.desc}</span>
            <div class="opt-price">${priceTxt}${ffwdHtml}</div>
            ${brand ? infoLinkHtml(e, brand) : ''}
          </span>
        </label>
      `;
    }).join('');

    host.insertAdjacentHTML('beforeend',
      '<div class="approx-note">ℹ️ <strong>Motor-Preise sind Schätzpreise</strong> (ohne MwSt) – die finale Offerte erfolgt bei Bestellung direkt vom Hersteller bzw. Importeur (Rotax). Alternativ können Sie den Motor selbst organisieren („Eigener Motor").</div>'
    );
    host.querySelectorAll('.option:not(.disabled)').forEach(opt => {
      const pick = () => { state.config.engineId = opt.dataset.engine; update(); };
      opt.addEventListener('click', e => { if (e.target.closest('.opt-link')) return; e.preventDefault(); pick(); });
      opt.addEventListener('keydown', e => { if (e.target.closest('.opt-link')) return; if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(); } });
    });
    bindOptionLinks(host);
  }

  function renderPropellers() {
    const host = document.getElementById('propellerList');
    const brandMap = { 'duc-flashback-3r': 'Duc Hélices', 'mt-3blade': 'MT-Propeller' };
    const isFourSeater = state.config.modelId === 'tsi' || state.config.modelId === 'highwing';
    host.innerHTML = CATALOG.propellers.map(p => {
      const selected = state.config.propellerId === p.id;
      const chHtml = (isFourSeater && p.chNote)
        ? `<div class="opt-note opt-note-${p.chNote.type}"><strong>🇨🇭</strong> ${p.chNote.text}</div>`
        : '';
      const addonHtml = (p.addon && selected)
        ? `<label class="opt-addon" data-prop-addon="${p.addon.id}">
             <input type="checkbox" ${state.config.propellerAddons && state.config.propellerAddons[p.addon.id] ? 'checked' : ''} />
             <span class="opt-addon-body">
               <span class="opt-addon-title">+ ${p.addon.label}</span>
               <span class="opt-addon-desc">${p.addon.desc || ''}</span>
             </span>
             <span class="opt-addon-price">+ ${p.addon.approxPrice ? formatApprox(p.addon.priceAdd) : format(p.addon.priceAdd)}</span>
           </label>`
        : '';
      return `
        <label class="option is-radio ${selected ? 'selected' : ''}" data-prop="${p.id}" tabindex="0" role="radio" aria-checked="${selected}">
          <span class="opt-check"></span>
          <span class="opt-body">
            <span class="opt-title">${p.label}</span>
            <span class="opt-desc">${p.desc}</span>
            <div class="opt-price">${format(p.price)}</div>
            ${chHtml}
            ${addonHtml}
            ${infoLinkHtml(p, brandMap[p.id] || 'Hersteller')}
          </span>
        </label>
      `;
    }).join('');
    host.querySelectorAll('.option').forEach(opt => {
      const pick = () => { state.config.propellerId = opt.dataset.prop; update(); };
      opt.addEventListener('click', e => {
        if (e.target.closest('.opt-link') || e.target.closest('.opt-addon')) return;
        e.preventDefault(); pick();
      });
      opt.addEventListener('keydown', e => { if (e.target.closest('.opt-link') || e.target.closest('.opt-addon')) return; if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(); } });
    });
    host.querySelectorAll('.opt-addon input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', e => {
        const addonId = e.target.closest('.opt-addon').dataset.propAddon;
        if (!state.config.propellerAddons) state.config.propellerAddons = {};
        state.config.propellerAddons[addonId] = e.target.checked;
        update();
      });
    });
    bindOptionLinks(host);
  }

  function renderAvionics() {
    const m = findModel(state.config.modelId);
    const host = document.getElementById('avionicsList');
    host.innerHTML = CATALOG.avionics.map(a => {
      const compatible = !m || m.compatibleAvionics.includes(a.id);
      const selected = state.config.avionicsId === a.id;
      const priceTxt = a.approxPrice ? formatApprox(a.price) : format(a.price);
      return `
        <label class="option is-radio ${selected ? 'selected' : ''} ${compatible ? '' : 'disabled'}" data-av="${a.id}" tabindex="0" role="radio" aria-checked="${selected}">
          <span class="opt-check"></span>
          <span class="opt-body">
            <span class="opt-title">${a.label}</span>
            <span class="opt-desc">${a.desc}${compatible ? '' : ' <em>(nicht freigegeben)</em>'}</span>
            <div class="opt-price">${priceTxt}</div>
            ${infoLinkHtml(a, 'Garmin')}
          </span>
        </label>
      `;
    }).join('');
    host.insertAdjacentHTML('beforeend',
      '<div class="approx-note">ℹ️ <strong>Avionik-Preise sind unverbindliche Richtwerte</strong> – die finale Offerte erfolgt bei Bestellung direkt vom Hersteller (Garmin / Importeur). FLARM/ADS-B-Add-ons wie der AirAvionics AT-1 finden sich im Extras-Step.</div>'
    );
    host.querySelectorAll('.option:not(.disabled)').forEach(opt => {
      const pick = () => { state.config.avionicsId = opt.dataset.av; update(); };
      opt.addEventListener('click', e => { if (e.target.closest('.opt-link')) return; e.preventDefault(); pick(); });
      opt.addEventListener('keydown', e => { if (e.target.closest('.opt-link')) return; if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(); } });
    });
    bindOptionLinks(host);
  }

  function hasExtraDetails(x) {
    return !!(x && (x.details || (Array.isArray(x.gallery) && x.gallery.length) || x.image));
  }

  function renderExtraDetails(x) {
    const gallery = (Array.isArray(x.gallery) && x.gallery.length) ? x.gallery.slice() : (x.image ? [x.image] : []);
    const multi = gallery.length > 1;
    const galleryHtml = gallery.length ? `
      <div class="opt-gallery" data-gallery-of="${x.id}">
        ${multi ? `<button class="og-arrow og-prev" type="button" aria-label="Vorheriges Bild">‹</button>` : ''}
        <div class="og-stage"><img class="og-img" alt="${x.label}" /><span class="og-fallback">📷 Bild noch nicht vorhanden</span></div>
        ${multi ? `<button class="og-arrow og-next" type="button" aria-label="Nächstes Bild">›</button>` : ''}
      </div>
      ${multi ? `<div class="og-dots"></div>` : ''}
    ` : '';
    const textHtml = x.details ? `<div class="opt-details-text">${x.details}</div>` : '';
    return galleryHtml + textHtml;
  }

  function initOptionGallery(panel, x) {
    const gallery = (Array.isArray(x.gallery) && x.gallery.length) ? x.gallery.slice() : (x.image ? [x.image] : []);
    if (!gallery.length) return;
    const img = panel.querySelector('.og-img');
    const fallback = panel.querySelector('.og-fallback');
    const dots = panel.querySelector('.og-dots');
    let idx = 0;
    const show = i => {
      idx = (i + gallery.length) % gallery.length;
      img.onload = () => { img.style.display = 'block'; fallback.style.display = 'none'; };
      img.onerror = () => { img.style.display = 'none'; fallback.style.display = 'flex'; };
      img.style.display = 'none'; fallback.style.display = 'flex';
      img.src = gallery[idx];
      if (dots) dots.querySelectorAll('button').forEach((d, di) => d.classList.toggle('active', di === idx));
    };
    if (dots && gallery.length > 1) {
      dots.innerHTML = gallery.map((_, i) => `<button class="og-dot ${i === 0 ? 'active' : ''}" type="button" data-i="${i}" aria-label="Bild ${i + 1}"></button>`).join('');
      dots.querySelectorAll('button').forEach(d => d.addEventListener('click', e => { e.stopPropagation(); show(+d.dataset.i); }));
    }
    panel.querySelector('.og-prev')?.addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
    panel.querySelector('.og-next')?.addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
    show(0);
  }

  function extraItemHtml(x, m) {
    const compatible = extraCompatible(x, m);
    const price = extraPrice(x, m);
    const selected = state.config.extras.includes(x.id);
    const noteHtml = (compatible && x.info) ? `<div class="opt-note">${x.info}</div>` : '';
    const showDetails = compatible && hasExtraDetails(x);
    return `
      <div class="option-wrap">
        <label class="option ${selected ? 'selected' : ''} ${compatible ? '' : 'disabled'}" data-extra="${x.id}" tabindex="0" role="checkbox" aria-checked="${selected}">
          <span class="opt-check">${checkSvg()}</span>
          <span class="opt-body">
            <span class="opt-title">${x.label}${x.group ? ` <span class="opt-grouptag">1 aus ${x.group === 'brakes' ? 'Bremsen' : x.group}</span>` : ''}</span>
            <span class="opt-desc">${x.desc || ''}${compatible ? '' : ' <em>(nicht für gewähltes Modell)</em>'}</span>
            <div class="opt-price">${compatible ? (x.approxPrice ? formatApprox(price) : format(price)) : '—'}</div>
            ${noteHtml}
            <div class="opt-action-row">
              ${showDetails ? `<button class="opt-details-btn" type="button" data-details="${x.id}" aria-expanded="false">Details &amp; Bilder ▾</button>` : ''}
              ${infoLinkHtml(x, 'Hersteller')}
            </div>
          </span>
        </label>
        ${showDetails ? `<div class="opt-details" id="opt-details-${x.id}" hidden>${renderExtraDetails(x)}</div>` : ''}
      </div>
    `;
  }

  function bindExtraItems(host) {
    host.querySelectorAll('.option:not(.disabled)').forEach(label => {
      const id = label.dataset.extra;
      const toggle = () => {
        if (state.config.extras.includes(id)) {
          state.config.extras = state.config.extras.filter(x => x !== id);
        } else {
          const x = findExtra(id);
          if (x && x.group) {
            state.config.extras = state.config.extras.filter(eid => {
              const other = findExtra(eid);
              return !other || other.group !== x.group;
            });
          }
          state.config.extras.push(id);
          if (x && Array.isArray(x.requires)) {
            x.requires.forEach(reqId => {
              if (!state.config.extras.includes(reqId)) state.config.extras.push(reqId);
            });
          }
        }
        update();
      };
      label.addEventListener('click', e => {
        if (e.target.closest('.opt-link, .opt-details-btn')) return;
        e.preventDefault(); toggle();
      });
      label.addEventListener('keydown', e => {
        if (e.target.closest('.opt-link, .opt-details-btn')) return;
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
      });
    });

    host.querySelectorAll('[data-details]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation(); e.preventDefault();
        const id = btn.dataset.details;
        const panel = host.querySelector(`#opt-details-${id}`);
        if (!panel) return;
        const willOpen = panel.hidden;
        panel.hidden = !willOpen;
        btn.setAttribute('aria-expanded', String(willOpen));
        btn.innerHTML = willOpen ? 'Details &amp; Bilder ▴' : 'Details &amp; Bilder ▾';
        if (willOpen && !panel.dataset.inited) {
          const x = findExtra(id);
          if (x) initOptionGallery(panel, x);
          panel.dataset.inited = '1';
        }
      });
    });
    bindOptionLinks(host);
  }

  function renderExtras() {
    const host = document.getElementById('extrasList');
    const m = state.config.modelId;
    const items = CATALOG.extras.filter(x => x.category !== 'avionics-addon');
    host.innerHTML = items.map(x => extraItemHtml(x, m)).join('');
    bindExtraItems(host);
  }

  function renderAvionicsAddons() {
    const host = document.getElementById('avionicsAddonsList');
    const section = document.getElementById('avionicsAddonsSection');
    if (!host || !section) return;
    const m = state.config.modelId;
    const items = CATALOG.extras.filter(x => x.category === 'avionics-addon');
    if (!items.length) { section.hidden = true; return; }
    section.hidden = false;
    host.innerHTML = items.map(x => extraItemHtml(x, m)).join('');
    bindExtraItems(host);
  }

  function renderPanelNav() {
    const steps = activeSteps();
    const idx = steps.findIndex(s => s.id === state.activeSection);
    if (idx < 0) return;
    const prev = idx > 0 ? steps[idx - 1] : null;
    const next = idx < steps.length - 1 ? steps[idx + 1] : null;
    const html = `
      <footer class="panel-nav">
        ${prev ? `<button type="button" class="btn btn-ghost" data-go-step="${prev.id}">← Zurück: ${prev.label}</button>` : '<span></span>'}
        ${next ? `<button type="button" class="btn btn-primary" data-go-step="${next.id}">Weiter: ${next.label} →</button>` : ''}
      </footer>
    `;
    document.querySelectorAll('.main-panel .panel').forEach(p => {
      const old = p.querySelector(':scope > .panel-nav');
      if (old) old.remove();
      if (!p.id) return;
      const stepId = p.id.replace(/^panel-/, '');
      if (!STEPS.some(s => s.id === stepId)) return;     // saved/compare/etc. ohne Nav
      p.insertAdjacentHTML('beforeend', html);
    });
    document.querySelectorAll('.panel-nav [data-go-step]').forEach(btn => {
      btn.addEventListener('click', () => setSection(btn.dataset.goStep));
    });
  }

  function renderServices() {
    const host = document.getElementById('servicesList');
    if (!host) return;
    const list = CATALOG.services || [];
    if (!list.length) { host.innerHTML = '<p class="muted">Aktuell keine Services hinterlegt.</p>'; return; }
    host.innerHTML = list.map(s => {
      const selected = (state.config.services || []).includes(s.id);
      const priceHtml = s.quoteOnly
        ? `<div class="opt-price opt-price-quote">Auf Anfrage</div>`
        : `<div class="opt-price">${format(s.price)}</div>`;
      const noteHtml = s.priceNote ? `<div class="opt-pricenote">${s.priceNote}</div>` : '';
      const infoHtml = s.info ? `<div class="opt-note">${s.info}</div>` : '';
      return `
        <label class="option ${selected ? 'selected' : ''}" data-service="${s.id}" tabindex="0" role="checkbox" aria-checked="${selected}">
          <span class="opt-check">${checkSvg()}</span>
          <span class="opt-body">
            <span class="opt-title">${s.label}</span>
            <span class="opt-desc">${s.desc || ''}</span>
            ${priceHtml}
            ${noteHtml}
            ${infoHtml}
          </span>
        </label>
      `;
    }).join('');
    host.querySelectorAll('.option').forEach(opt => {
      const toggle = () => {
        const id = opt.dataset.service;
        const arr = state.config.services || (state.config.services = []);
        const i = arr.indexOf(id);
        if (i >= 0) arr.splice(i, 1); else arr.push(id);
        update();
      };
      opt.addEventListener('click', e => { e.preventDefault(); toggle(); });
      opt.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    });
  }

  function renderSummaryCard() {
    const t = totals();
    const linesHost = document.getElementById('summaryLines');
    const showLines = [];

    if (t.partsSubtotal > 0) showLines.push({ label: 'Kit-Teile', value: t.partsSubtotal });

    t.lines.filter(l => l.type === 'add').forEach(l => {
      const cleaned = l.label.length > 38 ? l.label.slice(0, 36) + '…' : l.label;
      showLines.push({ label: cleaned, value: l.value, add: true, quoteOnly: !!l.quoteOnly });
    });

    if (t.discount > 0) {
      const pctText = (t.discountPct * 100).toFixed(0);
      showLines.push({ label: `Komplett-Kit-Rabatt (${pctText}%)`, value: -t.discount, discount: true });
    }

    if (showLines.length === 0) {
      linesHost.innerHTML = '<li><span class="sum-name muted">Noch keine Auswahl getroffen.</span></li>';
    } else {
      linesHost.innerHTML = showLines.map(l => {
        const cls = l.discount ? 'is-discount' : l.add ? 'is-add' : '';
        const sign = l.discount ? '− ' : (l.add ? '+ ' : '');
        const val = l.quoteOnly ? '<em style="opacity:0.75">Auf Anfrage</em>' : `${sign}${format(Math.abs(l.value))}`;
        return `<li class="${cls}"><span class="sum-name">${l.label}</span><span class="sum-val">${val}</span></li>`;
      }).join('');
    }
    document.getElementById('summaryTotal').textContent = format(t.total);
  }

  function renderFullSummaryPanel() {
    const t = totals();
    const m = findModel(state.config.modelId);
    const rows = [];
    if (m) rows.push(['<strong>Modell</strong>', m.name]);

    const selectedParts = m ? m.parts.filter(p => state.config.parts.includes(p.id)) : [];
    selectedParts.forEach(p => rows.push([p.label, format(p.price)]));
    if (t.discount) {
      const pctText = (t.discountPct * 100).toFixed(0);
      rows.push([
        `<span style="color:var(--ok)">Komplett-Kit-Rabatt (${pctText}%)</span>`,
        `<span style="color:var(--ok)">−${format(t.discount)}</span>`
      ]);
    }

    const e = findEngine(state.config.engineId);
    if (e) rows.push([`Motor: ${e.label}`, format(e.price)]);
    if (state.config.includeFFwd && e && CATALOG.firewallForward.perEngine[e.id]) {
      rows.push([`Firewall Forward + Fuel Kit (${e.label})`, format(CATALOG.firewallForward.perEngine[e.id])]);
    }
    const p = findProp(state.config.propellerId);
    if (p) rows.push([`Propeller: ${p.label}`, format(p.price)]);
    const a = findAvionics(state.config.avionicsId);
    if (a) rows.push([`Avionik: ${a.label}`, format(a.price)]);
    state.config.extras.forEach(eid => {
      const x = findExtra(eid);
      if (!x) return;
      const p = extraPrice(x, state.config.modelId);
      if (typeof p === 'number') rows.push([x.label, format(p)]);
    });
    (state.config.services || []).forEach(sid => {
      const s = findService(sid);
      if (!s) return;
      const val = s.quoteOnly ? '<em style="color:var(--text-mute)">Auf Anfrage</em>' : format(s.price);
      rows.push([s.label + (s.priceNote ? ` <span class="muted" style="font-size:0.78rem">(${s.priceNote})</span>` : ''), val]);
    });

    const host = document.getElementById('fullSummary');
    host.innerHTML = `
      <div class="full-summary">
        <table>
          <thead><tr><th>Komponente</th><th style="text-align:right">Preis</th></tr></thead>
          <tbody>
            ${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}
            <tr class="total"><td>Gesamtpreis</td><td>${format(t.total)}</td></tr>
          </tbody>
        </table>
        <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
          <button class="btn btn-primary" id="saveCfgBtn">Konfiguration speichern</button>
          <button class="btn btn-ghost" id="shareCfgBtn">Link / QR teilen</button>
          <button class="btn btn-ghost" id="addCompareBtn">Zum Vergleich hinzufügen</button>
          <button class="btn btn-ghost" id="salesListBtn">📋 Werks-Auftrags-Liste (Sling JNB)</button>
        </div>
      </div>
    `;
    document.getElementById('saveCfgBtn').addEventListener('click', saveCurrentConfig);
    document.getElementById('shareCfgBtn').addEventListener('click', openShareModal);
    document.getElementById('addCompareBtn').addEventListener('click', addCurrentToCompare);
    document.getElementById('salesListBtn').addEventListener('click', openSalesModal);
  }

  /* -------- Sales-Team Werks-Auftrags-Liste -------- */

  function buildSalesList() {
    const m = findModel(state.config.modelId);
    const t = totals();
    const lines = [];
    const W = 76;
    const pad = (l, r) => {
      const s = String(l);
      const v = String(r);
      const space = Math.max(2, W - s.length - v.length);
      return s + ' '.repeat(space) + v;
    };
    const sep = '-'.repeat(W);
    const dblsep = '='.repeat(W);

    lines.push(dblsep);
    lines.push('  SLING AIRCRAFT — KIT WORKS ORDER LIST');
    lines.push('  ' + (m ? m.name : '—') + (m ? `   (${m.tag})` : ''));
    lines.push('  Datum: ' + new Date().toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric' }));
    lines.push(dblsep);
    lines.push('');

    // Kunden-Kontakt (aus Inquiry-Form falls ausgefüllt)
    const form = document.getElementById('inquiryForm');
    if (form) {
      const data = new FormData(form);
      const cust = [];
      const name = [data.get('firstName'), data.get('lastName')].filter(Boolean).join(' ').trim();
      if (name)             cust.push(['Kunde',     name]);
      if (data.get('email')) cust.push(['E-Mail',    data.get('email')]);
      if (data.get('phone')) cust.push(['Telefon',   data.get('phone')]);
      if (data.get('country')) cust.push(['Land',    data.get('country')]);
      if (cust.length) {
        lines.push('-- KUNDE --');
        cust.forEach(([l, v]) => lines.push(`  ${l.padEnd(10)}: ${v}`));
        lines.push('');
      }
    }

    // Kit-Teile
    const sel = m ? m.parts.filter(p => state.config.parts.includes(p.id)) : [];
    if (sel.length) {
      lines.push('-- KIT PARTS --');
      sel.forEach(p => lines.push('  ' + pad(`[ ${p.id.padEnd(14)} ]  ${p.label}`, formatUSD(p.price))));
      lines.push(sep);
      lines.push('  ' + pad('Kit Parts Subtotal', formatUSD(sel.reduce((s, p) => s + p.price, 0))));
      const allSel = sel.length === (m ? m.parts.length : 0);
      if (allSel) lines.push('  >> KOMPLETT-KIT (alle Teile gewählt) — ' + ((CATALOG.bundleDiscountPct || 0) * 100).toFixed(0) + ' % Rabatt auf Gesamtsumme');
      lines.push('');
    }

    // Motor + Propeller + Avionik
    const eng  = findEngine(state.config.engineId);
    const prop = findProp(state.config.propellerId);
    const av   = findAvionics(state.config.avionicsId);
    if (eng || prop || av) {
      lines.push('-- POWERPLANT & AVIONIK --');
      if (eng)  lines.push('  ' + pad(`[ ${eng.id.padEnd(14)} ]  Engine: ${eng.label}`,   formatUSD(eng.price)));
      if (eng && state.config.includeFFwd && CATALOG.firewallForward.perEngine[eng.id]) {
        lines.push('  ' + pad(`                     FF + Fuel Kit (${eng.label})`, formatUSD(CATALOG.firewallForward.perEngine[eng.id])));
      }
      if (prop) lines.push('  ' + pad(`[ ${prop.id.padEnd(14)} ]  Propeller: ${prop.label}`, formatUSD(prop.price)));
      if (av)   lines.push('  ' + pad(`[ ${av.id.padEnd(14)} ]  Avionics: ${av.label}`, formatUSD(av.price)));
      lines.push('');
    }

    // Extras
    const xs = state.config.extras
      .map(eid => ({ x: findExtra(eid), p: extraPrice(findExtra(eid), state.config.modelId) }))
      .filter(o => o.x && typeof o.p === 'number');
    if (xs.length) {
      lines.push('-- KIT EXTRAS --');
      xs.forEach(({ x, p }) => {
        lines.push('  ' + pad(`[ ${x.id.padEnd(22)} ]  ${x.label}`, formatUSD(p)));
        if (x.info) lines.push('       ↳ ' + x.info);
      });
      lines.push('');
    }

    // Quickbuild
    const qbList = (CATALOG.quickbuild || {})[state.config.modelId] || [];
    const qbSel = (state.config.quickbuild || []).map(id => qbList.find(q => q.id === id)).filter(Boolean);
    if (qbSel.length) {
      lines.push('-- QUICKBUILD --');
      qbSel.forEach(q => lines.push('  ' + pad(`[ ${q.id.padEnd(22)} ]  ${q.label}`, formatUSD(q.price))));
      const crate = (CATALOG.shipping && CATALOG.shipping.quickbuildCrating && CATALOG.shipping.quickbuildCrating.prices || {})[state.config.modelId];
      if (typeof crate === 'number') lines.push('  ' + pad('  + Wooden Crating & Container-Loading (Quickbuild)', formatUSD(crate)));
      lines.push('');
    }

    // Services
    const svs = (state.config.services || []).map(id => findService(id)).filter(Boolean);
    if (svs.length) {
      lines.push('-- SERVICES --');
      svs.forEach(s => {
        const v = s.quoteOnly ? '(auf Anfrage)' : formatUSD(s.price);
        lines.push('  ' + pad(`[ ${s.id.padEnd(22)} ]  ${s.label}`, v));
        if (s.priceNote) lines.push('       ↳ ' + s.priceNote);
        if (s.info)      lines.push('       ↳ ' + s.info);
      });
      lines.push('');
    }

    // Packing (Pflicht, prozentual)
    const pctP = (CATALOG.shipping && CATALOG.shipping.packing && CATALOG.shipping.packing.percent || {})[state.config.modelId];
    if (typeof pctP === 'number' && sel.length) {
      const partsSum = sel.reduce((s, p) => s + p.price, 0);
      const packVal = Math.round(partsSum * pctP);
      lines.push('-- PACKING (PFLICHT, AUTOMATISCH) --');
      lines.push('  ' + pad(`Packing & Container-Vorbereitung (${(pctP * 100).toFixed(2)} % pro Kit-Teil)`, formatUSD(packVal)));
      sel.forEach(p => lines.push('     ↳ ' + p.label.padEnd(40) + ': ' + formatUSD(Math.round(p.price * pctP))));
      lines.push('');
    }

    // Totals
    lines.push(dblsep);
    if (t.discount > 0) {
      lines.push('  ' + pad('Subtotal',                       formatUSD(t.subtotal)));
      lines.push('  ' + pad(`Komplett-Kit-Rabatt (${(t.discountPct * 100).toFixed(0)}%)`, '-' + formatUSD(t.discount)));
    }
    lines.push('  ' + pad('GESAMT (USD, ohne MwSt, ab Werk JNB)', formatUSD(t.total)));
    lines.push(dblsep);
    lines.push('');
    lines.push('Hinweise:');
    lines.push('• Alle Preise in USD, ohne MwSt, ab Werk Johannesburg.');
    lines.push('• Versand- und Importkosten werden separat in Rechnung gestellt.');
    if (state.config.extras.includes('leather')) {
      lines.push('• 🎨 LEDER-INTERIEUR: Farbwahl muss separat mit dem Kunden abgestimmt werden!');
    }
    if ((state.config.modelId === 'tsi' || state.config.modelId === 'highwing')
        && state.config.propellerId && state.config.propellerId !== 'mt-3blade') {
      lines.push('• ⚠️  PROPELLER-WARNUNG: Das gewählte Modell darf in der Schweiz mit diesem Propeller nur als 2-Sitzer betrieben werden (MT-Propeller wäre 4-Sitzer-zertifiziert).');
    }

    lines.push('');
    lines.push(`Konfigurations-Link: ${location.origin}${location.pathname}${location.hash}`);

    return lines.join('\n');
  }

  function formatUSD(n) {
    if (typeof n !== 'number') return '—';
    return 'USD ' + Math.round(n).toLocaleString('en-US');
  }

  function openSalesModal() {
    const text = buildSalesList();
    document.getElementById('salesList').textContent = text;
    document.getElementById('salesStatus').textContent = '';
    showModal('salesModal');
  }

  function wireSalesModal() {
    const copyBtn = document.getElementById('salesCopyBtn');
    const dlBtn   = document.getElementById('salesDownloadBtn');
    const mailBtn = document.getElementById('salesMailBtn');
    if (!copyBtn) return;
    copyBtn.addEventListener('click', () => {
      const text = document.getElementById('salesList').textContent;
      const status = document.getElementById('salesStatus');
      navigator.clipboard.writeText(text).then(
        () => { status.textContent = '✓ In Zwischenablage kopiert.'; },
        () => { status.textContent = 'Konnte nicht kopieren – bitte manuell markieren und Strg/Cmd+C drücken.'; }
      );
    });
    dlBtn.addEventListener('click', () => {
      const text = document.getElementById('salesList').textContent;
      const m = findModel(state.config.modelId);
      const fname = `sling-order-${m ? m.id : 'config'}-${new Date().toISOString().slice(0, 10)}.txt`;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fname;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      document.getElementById('salesStatus').textContent = `✓ ${fname} heruntergeladen.`;
    });
    mailBtn.addEventListener('click', () => {
      const text = document.getElementById('salesList').textContent;
      const m = findModel(state.config.modelId);
      const sc = CATALOG.salesContact || {};
      const subject = `Sling Kit Works Order — ${m ? m.name : 'Konfiguration'}`;
      const params = new URLSearchParams();
      params.set('subject', subject);
      params.set('body', text);
      const cc = sc.cc ? `?cc=${encodeURIComponent(sc.cc)}&` : '?';
      const url = `mailto:${encodeURIComponent(sc.email || '')}${cc}${params.toString().slice(1)}`;
      location.href = url;
    });
  }

  /* -------- Save / Compare -------- */

  function genId() {
    return 'c_' + Math.random().toString(36).slice(2, 9);
  }

  function saveCurrentConfig() {
    const name = prompt('Name für diese Konfiguration:', defaultConfigName());
    if (!name) return;
    const t = totals();
    const entry = {
      id: genId(),
      name,
      createdAt: new Date().toISOString(),
      config: JSON.parse(JSON.stringify(state.config)),
      totalUSD: t.total
    };
    state.saved.unshift(entry);
    persist();
    setSection('saved');
    alert(`"${name}" gespeichert. Du findest sie unter "Gespeichert".`);
  }

  function defaultConfigName() {
    const m = findModel(state.config.modelId);
    const d = new Date();
    const dd = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
    return `${m ? m.name : 'Konfiguration'} – ${dd}`;
  }

  function renderSavedPanel() {
    const panel = ensurePanel('saved', 'Gespeicherte Konfigurationen', 'Lade, vergleiche oder lösche gespeicherte Konfigurationen.');
    if (state.saved.length === 0) {
      panel.innerHTML = '<p class="muted">Noch keine Konfiguration gespeichert. Speichere unter <em>Zusammenfassung → Konfiguration speichern</em>.</p>';
      return;
    }
    const compareCount = state.compareIds.length;
    const compareBar = `
      <div class="saved-actions">
        <span class="saved-actions-info">${state.saved.length} gespeichert · ${compareCount} im Vergleich</span>
        <button class="btn btn-primary" id="openCompareBtn" ${compareCount < 2 ? 'disabled' : ''}>
          Vergleich anzeigen ${compareCount >= 2 ? `(${compareCount})` : ''}
        </button>
      </div>
    `;
    panel.innerHTML = compareBar + state.saved.map(entry => {
      const m = findModel(entry.config.modelId);
      const inCompare = state.compareIds.includes(entry.id);
      return `
        <div class="option" data-saved="${entry.id}" style="cursor:default">
          <span class="opt-body">
            <span class="opt-title">${escapeHtml(entry.name)}</span>
            <span class="opt-desc">${m ? m.name : '—'} · ${new Date(entry.createdAt).toLocaleString('de-CH')} · <strong style="color:var(--accent)">${format(entry.totalUSD)}</strong></span>
            <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
              <button class="btn btn-ghost" data-act="load">Laden</button>
              <button class="btn btn-ghost" data-act="share">Link / QR</button>
              <button class="btn btn-ghost" data-act="compare">${inCompare ? '✓ Im Vergleich' : 'Zum Vergleich'}</button>
              <button class="btn btn-link" data-act="delete" style="color:#f87171">Löschen</button>
            </div>
          </span>
        </div>
      `;
    }).join('');

    const openCmpBtn = panel.querySelector('#openCompareBtn');
    if (openCmpBtn) openCmpBtn.addEventListener('click', () => { if (state.compareIds.length >= 2) setSection('compare'); });

    panel.querySelectorAll('[data-saved]').forEach(row => {
      const id = row.dataset.saved;
      row.querySelectorAll('button[data-act]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          const entry = state.saved.find(s => s.id === id);
          if (!entry) return;
          switch (btn.dataset.act) {
            case 'load':
              state.config = JSON.parse(JSON.stringify(entry.config));
              setSection('parts');
              update();
              break;
            case 'share':
              openShareModalFor(entry.config, entry.name);
              break;
            case 'compare':
              if (state.compareIds.includes(id)) state.compareIds = state.compareIds.filter(x => x !== id);
              else state.compareIds.push(id);
              renderSavedPanel();
              break;
            case 'delete':
              if (confirm(`"${entry.name}" wirklich löschen?`)) {
                state.saved = state.saved.filter(s => s.id !== id);
                state.compareIds = state.compareIds.filter(x => x !== id);
                persist();
                renderSavedPanel();
              }
              break;
          }
        });
      });
    });
  }

  function addCurrentToCompare() {
    const t = totals();
    const entry = {
      id: genId(),
      name: defaultConfigName() + ' (aktuell)',
      createdAt: new Date().toISOString(),
      config: JSON.parse(JSON.stringify(state.config)),
      totalUSD: t.total,
      transient: true
    };
    state.saved.unshift(entry);
    state.compareIds.push(entry.id);
    persist();
    setSection('compare');
  }

  function renderComparePanel() {
    const panel = ensurePanel('compare', 'Konfigurationen vergleichen',
      state.compareIds.length === 0
        ? 'Wähle unter <em>Gespeichert</em> mindestens zwei Konfigurationen zum Vergleichen aus.'
        : 'Side-by-Side Vergleich deiner ausgewählten Konfigurationen.');

    if (state.compareIds.length === 0) return;

    const entries = state.compareIds.map(id => state.saved.find(s => s.id === id)).filter(Boolean);
    if (entries.length === 0) {
      panel.innerHTML += '<p class="muted">Keine Konfigurationen ausgewählt.</p>';
      return;
    }

    const rows = compareRows(entries);
    const html = `
      <div style="overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:var(--bg-elev)">
        <table class="compare-table" style="width:100%;border-collapse:collapse;min-width:${260 + entries.length * 200}px">
          <thead>
            <tr>
              <th style="text-align:left;padding:14px 18px;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-mute);border-bottom:1px solid var(--line)">Komponente</th>
              ${entries.map(e => `
                <th style="text-align:left;padding:14px 18px;font-size:0.85rem;color:var(--text);border-bottom:1px solid var(--line);min-width:200px">
                  <div style="font-weight:700">${escapeHtml(e.name)}</div>
                  <div style="font-size:0.72rem;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.08em">${findModel(e.config.modelId)?.name || '—'}</div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td style="padding:12px 18px;border-bottom:1px solid var(--line);color:var(--text-dim);font-size:0.9rem">${r.label}</td>
                ${r.cells.map(c => `<td style="padding:12px 18px;border-bottom:1px solid var(--line);font-size:0.9rem;color:${c.highlight ? 'var(--accent)' : 'var(--text)'}">${c.value}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
        ${entries.map(e => `<button class="btn btn-ghost" data-remove="${e.id}">✕ ${escapeHtml(e.name)}</button>`).join('')}
        <button class="btn btn-link" id="clearCompareBtn">Vergleich leeren</button>
      </div>
    `;
    panel.insertAdjacentHTML('beforeend', html);

    panel.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.compareIds = state.compareIds.filter(x => x !== btn.dataset.remove);
        renderComparePanel();
      });
    });
    const clear = panel.querySelector('#clearCompareBtn');
    if (clear) clear.addEventListener('click', () => { state.compareIds = []; renderComparePanel(); });
  }

  function compareRows(entries) {
    const rows = [];
    rows.push({
      label: 'Modell',
      cells: entries.map(e => ({ value: findModel(e.config.modelId)?.name || '—' }))
    });
    rows.push({
      label: 'Kit-Teile',
      cells: entries.map(e => {
        const m = findModel(e.config.modelId);
        if (!m) return { value: '—' };
        const sel = m.parts.filter(p => e.config.parts.includes(p.id));
        return { value: sel.length === m.parts.length ? 'Komplett' : `${sel.length} / ${m.parts.length}` };
      })
    });
    rows.push({
      label: 'Motor',
      cells: entries.map(e => ({ value: findEngine(e.config.engineId)?.label || '—' }))
    });
    rows.push({
      label: 'Propeller',
      cells: entries.map(e => ({ value: findProp(e.config.propellerId)?.label || '—' }))
    });
    rows.push({
      label: 'Avionik',
      cells: entries.map(e => ({ value: findAvionics(e.config.avionicsId)?.label || '—' }))
    });
    rows.push({
      label: 'Extras',
      cells: entries.map(e => {
        if (!e.config.extras.length) return { value: '—' };
        return { value: e.config.extras.map(id => findExtra(id)?.label).filter(Boolean).join(', ') };
      })
    });
    const totalsArr = entries.map(e => totals(e.config).total);
    const minTotal = Math.min(...totalsArr);
    rows.push({
      label: 'Gesamtpreis',
      cells: totalsArr.map(v => ({ value: `<strong>${format(v)}</strong>`, highlight: v === minTotal }))
    });
    return rows;
  }

  function ensurePanel(id, title, subtitle) {
    const root = document.getElementById(`panel-${id}`);
    root.innerHTML = `
      <header class="panel-head">
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </header>
      <div class="panel-body"></div>
    `;
    return root.querySelector('.panel-body');
  }

  /* -------- Share / QR -------- */

  function openShareModal() { openShareModalFor(state.config); }

  /* -------- PDF Export -------- */

  function configKey(cfg) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));
  }

  function buildShareUrl(cfg) {
    return location.origin + location.pathname + '#c=' + configKey(cfg);
  }

  async function exportPDF() {
    const cfg = state.config;
    const t = totals();
    const m = findModel(cfg.modelId);
    if (!m) { alert('Bitte zuerst ein Modell wählen.'); return; }

    document.getElementById('pvTitle').textContent = m.name;
    document.getElementById('pvSub').textContent = `Konfiguration ${m.name} · ${m.tag}`;
    document.getElementById('pvDate').textContent = new Date().toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric' });
    document.getElementById('pvConfigName').textContent = `Währung: ${state.currency} · Kurs: ${state.currency === 'USD' ? '1.0000 (Basis)' : (state.rates[state.currency] || 1).toFixed(4)}`;
    document.getElementById('pvYear').textContent = new Date().getFullYear();
    document.getElementById('pvNote').textContent = state.currency === 'USD'
      ? 'Alle Preise in USD, ohne MwSt, ab Werk Johannesburg'
      : `Umgerechnet zu 1 USD = ${(state.rates[state.currency] || 1).toFixed(4)} ${state.currency}`;

    // Tabellen-Rows
    const rows = [];
    rows.push({ group: 'Kit-Teile' });
    const selectedParts = m.parts.filter(p => cfg.parts.includes(p.id));
    selectedParts.forEach(p => rows.push({ label: p.label, value: format(p.price) }));
    if (t.discount) rows.push({ label: `Komplett-Kit-Rabatt (${(t.discountPct * 100).toFixed(0)}%)`, value: `−${format(t.discount)}`, savings: true });

    const e = findEngine(cfg.engineId);
    if (e || cfg.propellerId || cfg.avionicsId) rows.push({ group: 'Antrieb & Avionik' });
    if (e) rows.push({ label: `Motor: ${e.label}`, value: format(e.price) });
    if (cfg.includeFFwd && e && CATALOG.firewallForward.perEngine[e.id]) {
      rows.push({ label: `Firewall Forward + Fuel Kit (${e.label})`, value: format(CATALOG.firewallForward.perEngine[e.id]) });
    }
    const pr = findProp(cfg.propellerId);
    if (pr) rows.push({ label: `Propeller: ${pr.label}`, value: format(pr.price) });
    const av = findAvionics(cfg.avionicsId);
    if (av) rows.push({ label: `Avionik: ${av.label}`, value: format(av.price) });

    if (cfg.extras.length) {
      rows.push({ group: 'Extras' });
      cfg.extras.forEach(eid => {
        const x = findExtra(eid);
        if (!x) return;
        const p = extraPrice(x, cfg.modelId);
        if (typeof p === 'number') rows.push({ label: x.label, value: format(p) });
      });
    }

    if ((cfg.services || []).length) {
      rows.push({ group: 'Services (ohne MwSt, ab Werk Johannesburg)' });
      cfg.services.forEach(sid => {
        const s = findService(sid);
        if (!s) return;
        const val = s.quoteOnly ? 'Auf Anfrage' : format(s.price);
        const label = s.label + (s.priceNote ? ` — ${s.priceNote}` : '');
        rows.push({ label, value: val });
      });
    }

    document.getElementById('pvTable').innerHTML = `
      <thead><tr><th>Komponente</th><th style="text-align:right">Preis</th></tr></thead>
      <tbody>
        ${rows.map(r => r.group
          ? `<tr><td class="pv-group" colspan="2">${r.group}</td></tr>`
          : `<tr><td${r.savings ? ' class="pv-savings"' : ''}>${r.label}</td><td${r.savings ? ' class="pv-savings"' : ''}>${r.value}</td></tr>`
        ).join('')}
      </tbody>
    `;
    document.getElementById('pvTotal').textContent = format(t.total);

    const key = configKey(cfg);
    const url = buildShareUrl(cfg);
    document.getElementById('pvKey').textContent = key;
    document.getElementById('pvUrl').textContent = url;

    // QR laden und auf Bild-Load warten, damit Print das QR enthält
    const qrImg = document.getElementById('pvQr');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data=${encodeURIComponent(url)}`;
    await new Promise(resolve => {
      qrImg.onload = resolve;
      qrImg.onerror = resolve;
      qrImg.src = qrUrl;
    });

    window.print();
  }

  /* -------- Load by key / URL -------- */

  function openLoadModal() {
    document.getElementById('loadKeyInput').value = '';
    document.getElementById('loadKeyStatus').textContent = '';
    document.getElementById('loadKeyStatus').classList.remove('error');
    showModal('loadModal');
  }

  function applyLoadKey() {
    const status = document.getElementById('loadKeyStatus');
    status.classList.remove('error');
    let input = document.getElementById('loadKeyInput').value.trim();
    if (!input) {
      status.textContent = 'Bitte Schlüssel oder Link eingeben.';
      status.classList.add('error');
      return;
    }
    // Falls volle URL: Hash extrahieren
    const hashMatch = input.match(/#c=([^&\s]+)/);
    if (hashMatch) input = hashMatch[1];
    // Falls Prefix "c=" mitkopiert
    if (input.startsWith('c=')) input = input.slice(2);

    try {
      const json = decodeURIComponent(escape(atob(input)));
      const cfg = JSON.parse(json);
      if (!cfg.modelId || !findModel(cfg.modelId)) throw new Error('Ungültiges Modell');
      const loadedPropId = cfg.propellerId || null;
      const propStillValid = loadedPropId && CATALOG.propellers.some(p => p.id === loadedPropId);
      state.config = {
        modelId: cfg.modelId,
        parts: Array.isArray(cfg.parts) ? cfg.parts : [],
        engineId: cfg.engineId || null,
        includeFFwd: cfg.includeFFwd !== false,
        propellerId: propStillValid ? loadedPropId : null,
        propellerAddons: (cfg.propellerAddons && typeof cfg.propellerAddons === 'object') ? cfg.propellerAddons : {},
        avionicsId: cfg.avionicsId || null,
        extras: Array.isArray(cfg.extras) ? cfg.extras : [],
        services: Array.isArray(cfg.services) ? cfg.services : []
      };
      hideModal('loadModal');
      setSection('parts');
      update();
    } catch (err) {
      status.textContent = 'Schlüssel konnte nicht gelesen werden. Bitte vollständigen Wert einfügen.';
      status.classList.add('error');
    }
  }

  function openShareModalFor(cfg, label) {
    const hash = encodeConfigToHash(cfg);
    const url = location.origin + location.pathname + hash;
    document.getElementById('shareUrl').value = url;
    const qr = document.getElementById('qrWrap');
    qr.innerHTML = `<img alt="QR" width="200" height="200" src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}" />`;
    showModal('shareModal');
  }

  function showModal(id) {
    document.getElementById(id).hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function hideModal(id) {
    document.getElementById(id).hidden = true;
    document.body.style.overflow = '';
  }

  /* -------- Actions -------- */

  function switchModel(id) {
    if (state.config.modelId === id) return;
    state.config = autoSelectAll(id);
    if (state.activeSection !== 'parts') setSection('parts');
    update();
  }

  function update() {
    persist();
    location.hash = encodeConfigToHash(state.config);
    renderModelStage();
    renderSidebar();
    renderHeader();
    renderCurrencyPills();
    renderParts();
    renderEngines();
    renderPropellers();
    renderAvionics();
    renderAvionicsAddons();
    renderExtras();
    renderServices();
    renderPanelNav();
    renderSummaryCard();
    if (state.activeSection === 'summary') renderFullSummaryPanel();
    if (state.activeSection === 'saved') renderSavedPanel();
    if (state.activeSection === 'compare') renderComparePanel();
  }

  /* -------- Wire-up -------- */

  function wireDropdown(id, onSelect) {
    const dd = document.getElementById(id);
    const btn = dd.querySelector('.dd-btn');
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.querySelectorAll('.dropdown.open').forEach(d => { if (d !== dd) d.classList.remove('open'); });
    });
    dd.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        const val = li.dataset.value;
        dd.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        onSelect(val);
      });
    });
    document.addEventListener('click', () => { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); });
  }

  function wireCurrencyPills() {
    document.querySelectorAll('.cur-pill').forEach(btn => {
      btn.addEventListener('click', () => { state.currency = btn.dataset.currency; update(); });
    });
  }

  function wireCurrencyDropdown() {
    const dd = document.getElementById('curDropdown');
    if (!dd) return;
    const btn = dd.querySelector('.dd-btn');
    const menu = document.getElementById('curMenu');

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.querySelectorAll('.dropdown.open').forEach(d => { if (d !== dd) d.classList.remove('open'); });
    });
    document.addEventListener('click', () => { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); });

    menu.addEventListener('click', e => {
      const editBtn = e.target.closest('[data-edit]');
      if (editBtn) {
        e.stopPropagation();
        startRateEdit(editBtn);
        return;
      }
      const li = e.target.closest('li[data-value]');
      if (!li) return;
      state.currency = li.dataset.value;
      dd.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      update();
    });
  }

  function startRateEdit(btnEl) {
    const cur = btnEl.dataset.edit;
    const current = (state.rates[cur] || 1).toFixed(4);
    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.0001';
    input.min = '0';
    input.value = current;
    input.className = 'cur-rate-input';
    input.setAttribute('aria-label', `1 USD in ${cur}`);
    btnEl.replaceWith(input);
    input.focus();
    input.select();
    let done = false;
    const commit = () => {
      if (done) return; done = true;
      const v = parseFloat(input.value);
      if (isFinite(v) && v > 0) {
        state.rates[cur] = v;
        try { localStorage.setItem(KEY_RATES, JSON.stringify(state.rates)); } catch {}
      }
      update();
    };
    const cancel = () => {
      if (done) return; done = true;
      renderCurrencyMenu();
    };
    input.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    });
    input.addEventListener('blur', commit);
    input.addEventListener('click', e => e.stopPropagation());
  }

  function wireModalsClose() {
    document.querySelectorAll('.modal [data-close]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        const modal = el.closest('.modal');
        if (modal) hideModal(modal.id);
      });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not([hidden])').forEach(m => hideModal(m.id));
      }
    });
  }

  function wireToolbar() {
    document.getElementById('togglePartsBtn').addEventListener('click', () => {
      const m = findModel(state.config.modelId);
      if (!m) return;
      const allSelected = state.config.parts.length === m.parts.length;
      state.config.parts = allSelected ? [] : m.parts.map(p => p.id);
      update();
    });
    document.getElementById('shareBtn').addEventListener('click', openShareModal);
    document.getElementById('printBtn').addEventListener('click', exportPDF);
    document.getElementById('loadBtn').addEventListener('click', openLoadModal);
    document.getElementById('loadKeyBtn').addEventListener('click', applyLoadKey);
    document.getElementById('goSummaryBtn').addEventListener('click', () => setSection('summary'));
    document.getElementById('resetBtn').addEventListener('click', () => {
      if (!confirm('Aktuelle Konfiguration zurücksetzen?')) return;
      state.config = autoSelectAll(state.config.modelId);
      update();
    });
    document.getElementById('copyUrlBtn').addEventListener('click', async () => {
      const input = document.getElementById('shareUrl');
      input.select();
      try {
        await navigator.clipboard.writeText(input.value);
        document.getElementById('copyUrlBtn').textContent = '✓ Kopiert';
        setTimeout(() => document.getElementById('copyUrlBtn').textContent = 'Kopieren', 1500);
      } catch {
        document.execCommand('copy');
      }
    });
    document.getElementById('inquiryForm').addEventListener('submit', e => {
      e.preventDefault();
      const form = e.target;
      const status = document.getElementById('formStatus');
      status.classList.remove('error');
      if (!form.reportValidity()) return;
      const t = totals();
      const payload = {
        contact: Object.fromEntries(new FormData(form).entries()),
        config: state.config,
        totals: { usd: t.total, currency: state.currency, displayed: format(t.total), rate: state.rates[state.currency] },
        url: location.href
      };
      console.log('Sling Anfrage:', payload);
      status.textContent = 'Danke! Deine Anfrage wurde erfasst. Wir melden uns in Kürze.';
      form.reset();
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* -------- Boot -------- */

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();
    document.getElementById('langLabel').textContent = 'DE';

    renderSidebar();
    bindModelStage();
    bindHeaderIconButtons();
    update();
    state.activeSection = 'parts';
    document.querySelectorAll('.main-panel .panel').forEach(p => {
      p.hidden = p.id !== 'panel-parts';
    });
    setPriceStand(CATALOG.pricesUpdated, 'local');
    fetchSheetPrices();

    wireDropdown('langDropdown', val => {
      document.getElementById('langLabel').textContent = val;
      // i18n hook – aktuell nur DE inhaltlich verfügbar
    });
    wireCurrencyDropdown();
    wireCurrencyPills();
    wireModalsClose();
    wireToolbar();
    wireSalesModal();

    window.addEventListener('hashchange', () => {
      const cfg = initFromURL();
      if (cfg) { state.config = cfg; update(); }
    });
  });

})();
