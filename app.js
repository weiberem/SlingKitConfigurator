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
      avionicsId: null,
      extras: []
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
    try { return JSON.parse(localStorage.getItem(KEY_CURRENT)); } catch { return null; }
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
    if (meta.bundle_discount_usd) { const v = parseFloat(meta.bundle_discount_usd); if (isFinite(v)) CATALOG.bundleDiscountUSD = v; }
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

  /* -------- Formatting -------- */

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
    // Komplett-Rabatt = informativer Vergleichswert (Ersparnis ggü. Einzelteilen),
    // wirkt nicht doppelt auf die Summe – Kit-Teil-Preise sind bereits Bundle-Preise.
    const discount = allSelected ? CATALOG.bundleDiscountUSD : 0;

    if (selectedParts.length > 0) {
      lines.push({ type: 'group', label: 'Kit-Teile', value: partsSubtotal, sub: selectedParts.map(p => ({ label: p.label, value: p.price })) });
    }

    const engine = findEngine(cfg.engineId);
    if (engine) lines.push({ type: 'add', label: `Motor: ${engine.label}`, value: engine.price });

    if (cfg.includeFFwd && engine) {
      const ffPrice = (CATALOG.firewallForward.perEngine || {})[engine.id];
      if (ffPrice) lines.push({ type: 'add', label: `${CATALOG.firewallForward.label} (${engine.label})`, value: ffPrice });
    }

    const prop = findProp(cfg.propellerId);
    if (prop) lines.push({ type: 'add', label: `Propeller: ${prop.label}`, value: prop.price });

    const av = findAvionics(cfg.avionicsId);
    if (av) lines.push({ type: 'add', label: `Avionik: ${av.label}`, value: av.price });

    cfg.extras.forEach(eid => {
      const x = findExtra(eid);
      if (x) lines.push({ type: 'add', label: x.label, value: x.price });
    });

    const total = lines.reduce((s, l) => s + l.value, 0);
    return { lines, partsSubtotal, total, discount };
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

  function renderModelTabs() {
    const host = document.getElementById('modelTabs');
    host.innerHTML = CATALOG.models.map(m => {
      const active = state.config.modelId === m.id ? 'active' : '';
      const fromPrice = format(m.partsBaseSum);
      return `
        <button type="button" class="model-tab ${active}" data-model="${m.id}" role="tab" aria-selected="${!!active}">
          <span class="mt-icon">${ICONS[m.icon] || ICONS['plane-low']}</span>
          <span>
            <span class="mt-name">${m.name}</span>
            <span class="mt-tag">${m.tag}</span>
            <span class="mt-from">Kit-Teile ab <strong>${fromPrice}</strong></span>
          </span>
        </button>
      `;
    }).join('');

    host.querySelectorAll('.model-tab').forEach(tab => {
      tab.addEventListener('click', () => switchModel(tab.dataset.model));
    });
  }

  function renderSidebar() {
    const items = [
      { id: 'parts',      label: 'Kit-Teile',       icon: ICONS.parts },
      { id: 'engine',     label: 'Motor',           icon: ICONS.engine },
      { id: 'propeller',  label: 'Propeller',       icon: ICONS.propeller },
      { id: 'avionics',   label: 'Avionik',         icon: ICONS.avionics },
      { id: 'extras',     label: 'Extras',          icon: ICONS.extras },
      { id: 'summary',    label: 'Zusammenfassung', icon: ICONS.summary },
      { id: 'saved',      label: 'Gespeichert',     icon: ICONS.saved },
      { id: 'compare',    label: 'Vergleichen',     icon: ICONS.compare }
    ];
    const host = document.getElementById('sectionNav');
    host.innerHTML = items.map(it => `
      <li class="${state.activeSection === it.id ? 'active' : ''}" data-section="${it.id}" tabindex="0" role="button">
        ${it.icon}<span>${it.label}</span>
      </li>
    `).join('');
    host.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => setSection(li.dataset.section));
      li.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSection(li.dataset.section); }
      });
    });
  }

  function setSection(id) {
    state.activeSection = id;
    renderSidebar();
    document.querySelectorAll('.main-panel .panel').forEach(p => {
      p.hidden = p.id !== `panel-${id}`;
    });
    if (id === 'saved') renderSavedPanel();
    if (id === 'compare') renderComparePanel();
    if (id === 'summary') renderFullSummaryPanel();
  }

  const LOGO_MODEL_SUFFIX = { sling2: '2', tsi: 'TSi', highwing: 'HW' };

  function renderHeader() {
    const m = findModel(state.config.modelId);
    document.getElementById('modelTitle').textContent = m ? m.name : '—';
    document.getElementById('modelSubtitle').textContent = m ? `Konfigurieren Sie Ihre ${m.name}` : '';
    document.getElementById('summaryModelName').textContent = m ? m.name : '—';
    document.getElementById('summaryImage').innerHTML = m ? `<div style="color:#dc1f26">${ICONS[m.icon] || ICONS['plane-low']}</div>` : '';
    const suffix = LOGO_MODEL_SUFFIX[state.config.modelId] || '';
    const logoModel = document.getElementById('logoModel');
    if (logoModel) logoModel.textContent = suffix;
    const pvLogoModel = document.getElementById('pvLogoModel');
    if (pvLogoModel) pvLogoModel.textContent = suffix;
    document.getElementById('curLabel').textContent = state.currency;
    document.getElementById('fxMiniValue').textContent = state.currency === 'USD'
      ? '1 USD = 1.00 USD (Basis)'
      : `1 USD = ${(state.rates[state.currency] || 1).toFixed(4)} ${state.currency}`;
    document.getElementById('summaryNote').textContent =
      state.currency === 'USD'
        ? 'Alle Preise in USD, ab Werk Sling Aircraft'
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
    host.innerHTML = m.parts.map(p => {
      const selected = state.config.parts.includes(p.id);
      return `
        <label class="option ${selected ? 'selected' : ''}" data-part="${p.id}" tabindex="0" role="checkbox" aria-checked="${selected}">
          <span class="opt-check">${checkSvg()}</span>
          <span class="opt-body">
            <span class="opt-title">${p.label}</span>
            <span class="opt-desc">${p.desc}</span>
            <div class="opt-price">${format(p.price)}</div>
          </span>
        </label>
      `;
    }).join('');

    const allSelected = state.config.parts.length === m.parts.length;
    document.getElementById('togglePartsBtn').textContent = allSelected ? 'Alle abwählen' : 'Alle wählen';
    const badge = document.getElementById('bundleBadge');
    if (allSelected) {
      badge.hidden = false;
      document.getElementById('bundleAmt').textContent = `Sie sparen ${format(CATALOG.bundleDiscountUSD)}`;
    } else {
      badge.hidden = true;
    }

    host.querySelectorAll('.option').forEach(opt => {
      const toggle = () => {
        const id = opt.dataset.part;
        if (state.config.parts.includes(id)) state.config.parts = state.config.parts.filter(x => x !== id);
        else state.config.parts.push(id);
        update();
      };
      opt.addEventListener('click', e => { e.preventDefault(); toggle(); });
      opt.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    });
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
    host.innerHTML = CATALOG.engines.map(e => {
      const compatible = !m || m.compatibleEngines.includes(e.id);
      const selected = state.config.engineId === e.id;
      const brand = e.id.startsWith('rotax') ? 'Rotax' : 'Hersteller';
      return `
        <label class="option is-radio ${selected ? 'selected' : ''} ${compatible ? '' : 'disabled'}" data-engine="${e.id}" tabindex="0" role="radio" aria-checked="${selected}">
          <span class="opt-check">${checkSvg()}</span>
          <span class="opt-body">
            <span class="opt-title">${e.label}</span>
            <span class="opt-desc">${e.desc}${compatible ? '' : ' <em>(nicht freigegeben für gewähltes Modell)</em>'}</span>
            <div class="opt-price">${format(e.price)}${state.config.includeFFwd && CATALOG.firewallForward.perEngine[e.id] ? ` <span style="color:var(--text-mute);font-weight:400">+ ${format(CATALOG.firewallForward.perEngine[e.id])} FF-Kit</span>` : ''}</div>
            ${infoLinkHtml(e, brand)}
          </span>
        </label>
      `;
    }).join('');
    host.querySelectorAll('.option:not(.disabled)').forEach(opt => {
      const pick = () => { state.config.engineId = opt.dataset.engine; update(); };
      opt.addEventListener('click', e => { if (e.target.closest('.opt-link')) return; e.preventDefault(); pick(); });
      opt.addEventListener('keydown', e => { if (e.target.closest('.opt-link')) return; if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(); } });
    });
    bindOptionLinks(host);
  }

  function renderPropellers() {
    const host = document.getElementById('propellerList');
    const brandMap = { 'sensenich': 'Sensenich', 'airmaster-3': 'Airmaster', 'duc-flashback-3r': 'Duc Hélices', 'mt-3blade': 'MT-Propeller' };
    host.innerHTML = CATALOG.propellers.map(p => {
      const selected = state.config.propellerId === p.id;
      return `
        <label class="option is-radio ${selected ? 'selected' : ''}" data-prop="${p.id}" tabindex="0" role="radio" aria-checked="${selected}">
          <span class="opt-check"></span>
          <span class="opt-body">
            <span class="opt-title">${p.label}</span>
            <span class="opt-desc">${p.desc}</span>
            <div class="opt-price">${format(p.price)}</div>
            ${infoLinkHtml(p, brandMap[p.id] || 'Hersteller')}
          </span>
        </label>
      `;
    }).join('');
    host.querySelectorAll('.option').forEach(opt => {
      const pick = () => { state.config.propellerId = opt.dataset.prop; update(); };
      opt.addEventListener('click', e => { if (e.target.closest('.opt-link')) return; e.preventDefault(); pick(); });
      opt.addEventListener('keydown', e => { if (e.target.closest('.opt-link')) return; if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(); } });
    });
    bindOptionLinks(host);
  }

  function renderAvionics() {
    const m = findModel(state.config.modelId);
    const host = document.getElementById('avionicsList');
    host.innerHTML = CATALOG.avionics.map(a => {
      const compatible = !m || m.compatibleAvionics.includes(a.id);
      const selected = state.config.avionicsId === a.id;
      return `
        <label class="option is-radio ${selected ? 'selected' : ''} ${compatible ? '' : 'disabled'}" data-av="${a.id}" tabindex="0" role="radio" aria-checked="${selected}">
          <span class="opt-check"></span>
          <span class="opt-body">
            <span class="opt-title">${a.label}</span>
            <span class="opt-desc">${a.desc}${compatible ? '' : ' <em>(nicht freigegeben)</em>'}</span>
            <div class="opt-price">${format(a.price)}</div>
            ${infoLinkHtml(a, 'Garmin')}
          </span>
        </label>
      `;
    }).join('');
    host.querySelectorAll('.option:not(.disabled)').forEach(opt => {
      const pick = () => { state.config.avionicsId = opt.dataset.av; update(); };
      opt.addEventListener('click', e => { if (e.target.closest('.opt-link')) return; e.preventDefault(); pick(); });
      opt.addEventListener('keydown', e => { if (e.target.closest('.opt-link')) return; if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(); } });
    });
    bindOptionLinks(host);
  }

  function renderExtras() {
    const host = document.getElementById('extrasList');
    const m = state.config.modelId;
    host.innerHTML = CATALOG.extras.map(x => {
      const compatible = !x.models || x.models.includes(m);
      const selected = state.config.extras.includes(x.id);
      return `
        <label class="option ${selected ? 'selected' : ''} ${compatible ? '' : 'disabled'}" data-extra="${x.id}" tabindex="0" role="checkbox" aria-checked="${selected}">
          <span class="opt-check">${checkSvg()}</span>
          <span class="opt-body">
            <span class="opt-title">${x.label}</span>
            <span class="opt-desc">${x.desc}${compatible ? '' : ' <em>(nicht für gewähltes Modell)</em>'}</span>
            <div class="opt-price">${format(x.price)}</div>
            ${infoLinkHtml(x, 'Hersteller')}
          </span>
        </label>
      `;
    }).join('');
    host.querySelectorAll('.option:not(.disabled)').forEach(opt => {
      const toggle = () => {
        const id = opt.dataset.extra;
        if (state.config.extras.includes(id)) state.config.extras = state.config.extras.filter(x => x !== id);
        else state.config.extras.push(id);
        update();
      };
      opt.addEventListener('click', e => { if (e.target.closest('.opt-link')) return; e.preventDefault(); toggle(); });
      opt.addEventListener('keydown', e => { if (e.target.closest('.opt-link')) return; if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    });
    bindOptionLinks(host);
  }

  function renderSummaryCard() {
    const t = totals();
    const linesHost = document.getElementById('summaryLines');
    const showLines = [];

    if (t.partsSubtotal > 0) showLines.push({ label: 'Kit-Teile', value: t.partsSubtotal });

    t.lines.filter(l => l.type === 'add').forEach(l => {
      const cleaned = l.label.length > 38 ? l.label.slice(0, 36) + '…' : l.label;
      showLines.push({ label: cleaned, value: l.value, add: true });
    });

    if (showLines.length === 0) {
      linesHost.innerHTML = '<li><span class="sum-name muted">Noch keine Auswahl getroffen.</span></li>';
    } else {
      linesHost.innerHTML = showLines.map(l => {
        const cls = l.add ? 'is-add' : l.discount ? 'is-discount' : '';
        const sign = l.add ? '+ ' : '';
        return `<li class="${cls}"><span class="sum-name">${l.label}</span><span class="sum-val">${sign}${format(l.value)}</span></li>`;
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
    if (t.discount) rows.push(['<span style="color:var(--ok)">Komplett-Paket-Ersparnis</span>', `<span style="color:var(--ok)">−${format(t.discount)} (in den Preisen enthalten)</span>`]);

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
      if (x) rows.push([x.label, format(x.price)]);
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
        </div>
      </div>
    `;
    document.getElementById('saveCfgBtn').addEventListener('click', saveCurrentConfig);
    document.getElementById('shareCfgBtn').addEventListener('click', openShareModal);
    document.getElementById('addCompareBtn').addEventListener('click', addCurrentToCompare);
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
    panel.innerHTML = state.saved.map(entry => {
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
      ? 'Alle Preise in USD, ab Werk Sling Aircraft'
      : `Umgerechnet zu 1 USD = ${(state.rates[state.currency] || 1).toFixed(4)} ${state.currency}`;

    // Tabellen-Rows
    const rows = [];
    rows.push({ group: 'Kit-Teile' });
    const selectedParts = m.parts.filter(p => cfg.parts.includes(p.id));
    selectedParts.forEach(p => rows.push({ label: p.label, value: format(p.price) }));
    if (t.discount) rows.push({ label: 'Komplett-Paket – Sie sparen', value: `−${format(t.discount)}`, savings: true });

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
        if (x) rows.push({ label: x.label, value: format(x.price) });
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
      state.config = {
        modelId: cfg.modelId,
        parts: Array.isArray(cfg.parts) ? cfg.parts : [],
        engineId: cfg.engineId || null,
        includeFFwd: cfg.includeFFwd !== false,
        propellerId: cfg.propellerId || null,
        avionicsId: cfg.avionicsId || null,
        extras: Array.isArray(cfg.extras) ? cfg.extras : []
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
    renderModelTabs();
    renderHeader();
    renderCurrencyPills();
    renderParts();
    renderEngines();
    renderPropellers();
    renderAvionics();
    renderExtras();
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

  function wireFXModal() {
    document.getElementById('fxMiniEdit').addEventListener('click', () => {
      document.getElementById('rateCHF').value = state.rates.CHF.toFixed(4);
      document.getElementById('rateEUR').value = state.rates.EUR.toFixed(4);
      showModal('fxModal');
    });
    ['rateCHF', 'rateEUR'].forEach(id => {
      document.getElementById(id).addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        if (isFinite(v) && v > 0) {
          state.rates[id === 'rateCHF' ? 'CHF' : 'EUR'] = v;
          update();
        }
      });
    });
    document.getElementById('resetRatesBtn').addEventListener('click', () => {
      state.rates = { ...CATALOG.defaultRates };
      document.getElementById('rateCHF').value = state.rates.CHF.toFixed(4);
      document.getElementById('rateEUR').value = state.rates.EUR.toFixed(4);
      update();
    });
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
      status.textContent = 'Danke! Deine Anfrage wurde erfasst. Sling Aircraft meldet sich in Kürze.';
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
    update();
    setSection('parts');
    setPriceStand(CATALOG.pricesUpdated, 'local');
    fetchSheetPrices();

    wireDropdown('langDropdown', val => {
      document.getElementById('langLabel').textContent = val;
      // i18n hook – aktuell nur DE inhaltlich verfügbar
    });
    wireDropdown('curDropdown', val => { state.currency = val; update(); });
    wireCurrencyPills();
    wireFXModal();
    wireModalsClose();
    wireToolbar();

    window.addEventListener('hashchange', () => {
      const cfg = initFromURL();
      if (cfg) { state.config = cfg; update(); }
    });
  });

})();
