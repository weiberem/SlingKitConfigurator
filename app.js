/* Sling Aircraft Kit Configurator – App logic */
(function () {
  'use strict';

  const CATALOG = window.SLING_CATALOG;
  const STORAGE_KEY = 'sling-configurator-v1';

  // ---------- State ----------

  const defaultState = () => ({
    currency: 'USD',
    rates: { ...CATALOG.defaultRates },
    modelId: null,
    variantId: null,
    kitVariantId: 'quickbuild',
    sectionIds: CATALOG.kitSections.filter(s => s.required).map(s => s.id),
    engineId: null,
    avionicsId: null,
    extras: []
  });

  let state = loadState() || defaultState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Migrate: ensure rates exist
      parsed.rates = { ...CATALOG.defaultRates, ...(parsed.rates || {}) };
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { /* ignore */ }
  }

  // ---------- Helpers ----------

  const CURRENCY_SYMBOL = { USD: '$', CHF: 'CHF ', EUR: '€' };

  function formatPrice(usd, opts = {}) {
    if (!isFinite(usd)) return '—';
    const cur = opts.currency || state.currency;
    const rate = state.rates[cur] || 1;
    const val = usd * rate;
    const sym = CURRENCY_SYMBOL[cur] || '';
    const rounded = Math.round(val);
    const grouped = rounded.toLocaleString('de-CH').replace(/,/g, "'");
    if (cur === 'EUR') return `${grouped} €`;
    if (cur === 'CHF') return `CHF ${grouped}`;
    return `$${grouped}`;
  }

  function findModel(id) { return CATALOG.models.find(m => m.id === id) || null; }
  function findEngine(id) { return CATALOG.engines.find(e => e.id === id) || null; }
  function findAvionics(id) { return CATALOG.avionics.find(a => a.id === id) || null; }
  function findKitVariant(id) { return CATALOG.kitVariants.find(k => k.id === id) || null; }
  function findSection(id) { return CATALOG.kitSections.find(s => s.id === id) || null; }
  function findExtra(id) { return CATALOG.extras.find(x => x.id === id) || null; }
  function findVariant(model, id) { return model ? (model.variants.find(v => v.id === id) || null) : null; }

  // ---------- Price computation ----------

  function computeTotals() {
    const model = findModel(state.modelId);
    if (!model) {
      return { subtotalUSD: 0, lines: [] };
    }
    const lines = [];
    const kitVariant = findKitVariant(state.kitVariantId) || CATALOG.kitVariants[0];

    // Sum kit sections, apply quick-build multiplier
    let sectionsUSD = 0;
    state.sectionIds.forEach(sid => {
      const sec = findSection(sid);
      if (!sec) return;
      const sectionUSD = Math.round(model.basePrice * sec.shareOfBase * kitVariant.multiplier);
      sectionsUSD += sectionUSD;
      lines.push({ label: `${sec.label} (${kitVariant.label})`, priceUSD: sectionUSD });
    });

    // Model variant surcharge (taildragger etc.)
    const variant = findVariant(model, state.variantId);
    if (variant && variant.price) {
      lines.push({ label: `Variante: ${variant.label}`, priceUSD: variant.price });
    }

    const engine = findEngine(state.engineId);
    if (engine) lines.push({ label: `Motor: ${engine.label}`, priceUSD: engine.price });

    const avionics = findAvionics(state.avionicsId);
    if (avionics) lines.push({ label: `Avionik: ${avionics.label}`, priceUSD: avionics.price });

    state.extras.forEach(eid => {
      const x = findExtra(eid);
      if (x) lines.push({ label: x.label, priceUSD: x.price });
    });

    const subtotalUSD = lines.reduce((sum, l) => sum + l.priceUSD, 0);
    return { subtotalUSD, lines };
  }

  // ---------- Renderers ----------

  function renderModels() {
    const grid = document.getElementById('modelGrid');
    grid.innerHTML = CATALOG.models.map(m => {
      const selected = state.modelId === m.id ? 'selected' : '';
      const badge = m.badge ? `<span class="badge">${m.badge}</span>` : '';
      const specs = Object.entries(m.specs).map(([k, v]) => `
        <div><div class="spec-label">${k}</div><div class="spec-value">${v}</div></div>
      `).join('');
      return `
        <article class="model-card ${selected}" data-model="${m.id}" tabindex="0" role="button" aria-pressed="${!!selected}">
          ${badge}
          <div class="model-tag">${m.tag}</div>
          <h3>${m.name}</h3>
          <p class="model-desc">${m.description}</p>
          <div class="model-specs">${specs}</div>
          <div class="model-price">${formatPrice(m.basePrice)} <small>Basis-Kit ab</small></div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('.model-card').forEach(card => {
      card.addEventListener('click', () => selectModel(card.dataset.model));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectModel(card.dataset.model);
        }
      });
    });
  }

  function renderKitVariant() {
    const host = document.getElementById('kitVariant');
    host.innerHTML = CATALOG.kitVariants.map(k => {
      const selected = state.kitVariantId === k.id ? 'selected' : '';
      const surcharge = k.multiplier > 1
        ? `+${Math.round((k.multiplier - 1) * 100)}%`
        : 'Basis';
      return `
        <label class="option ${selected}" data-kit="${k.id}">
          <input type="radio" name="kitVariant" value="${k.id}" ${selected ? 'checked' : ''} />
          <div class="opt-body">
            <div class="opt-title"><span>${k.label}</span><span class="opt-price">${surcharge}</span></div>
            <div class="opt-desc">${k.desc}</div>
          </div>
        </label>
      `;
    }).join('');

    host.querySelectorAll('.option').forEach(opt => {
      opt.addEventListener('click', e => {
        if (e.target.tagName === 'INPUT') return;
        const input = opt.querySelector('input');
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    host.querySelectorAll('input[name="kitVariant"]').forEach(inp => {
      inp.addEventListener('change', e => {
        state.kitVariantId = e.target.value;
        update();
      });
    });
  }

  function renderSections() {
    const host = document.getElementById('kitSections');
    host.innerHTML = CATALOG.kitSections.map(s => {
      const selected = state.sectionIds.includes(s.id);
      const model = findModel(state.modelId);
      const kit = findKitVariant(state.kitVariantId);
      const priceUSD = model && kit ? Math.round(model.basePrice * s.shareOfBase * kit.multiplier) : 0;
      const priceLabel = model ? formatPrice(priceUSD) : '—';
      return `
        <label class="option ${selected ? 'selected' : ''} ${s.required ? '' : ''}" data-section="${s.id}">
          <input type="checkbox" value="${s.id}" ${selected ? 'checked' : ''} ${s.required ? 'data-required="true"' : ''} />
          <div class="opt-body">
            <div class="opt-title">
              <span>${s.label}${s.required ? ' <small style="color:var(--text-mute);font-size:0.7rem">· Pflicht</small>' : ''}</span>
              <span class="opt-price">${priceLabel}</span>
            </div>
            <div class="opt-desc">${s.desc}</div>
          </div>
        </label>
      `;
    }).join('');

    host.querySelectorAll('input[type="checkbox"]').forEach(inp => {
      inp.addEventListener('change', e => {
        const sid = e.target.value;
        const sec = findSection(sid);
        if (sec.required) {
          e.target.checked = true; // can't uncheck required
          return;
        }
        if (e.target.checked) {
          if (!state.sectionIds.includes(sid)) state.sectionIds.push(sid);
        } else {
          state.sectionIds = state.sectionIds.filter(x => x !== sid);
        }
        update();
      });
    });
  }

  function renderEngines() {
    const host = document.getElementById('engineOptions');
    const model = findModel(state.modelId);
    host.innerHTML = CATALOG.engines.map(e => {
      const compatible = !model || model.compatibleEngines.includes(e.id);
      const selected = state.engineId === e.id;
      return `
        <label class="option ${selected ? 'selected' : ''} ${compatible ? '' : 'disabled'}" data-engine="${e.id}">
          <input type="radio" name="engine" value="${e.id}" ${selected ? 'checked' : ''} ${compatible ? '' : 'disabled'} />
          <div class="opt-body">
            <div class="opt-title"><span>${e.label}</span><span class="opt-price">${formatPrice(e.price)}</span></div>
            <div class="opt-desc">${e.desc}${compatible ? '' : ' <em>(nicht freigegeben für gewähltes Modell)</em>'}</div>
          </div>
        </label>
      `;
    }).join('');

    host.querySelectorAll('input[name="engine"]').forEach(inp => {
      inp.addEventListener('change', e => { state.engineId = e.target.value; update(); });
    });
    host.querySelectorAll('.option:not(.disabled)').forEach(opt => {
      opt.addEventListener('click', e => {
        if (e.target.tagName === 'INPUT') return;
        const inp = opt.querySelector('input');
        if (inp.disabled) return;
        inp.checked = true;
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  function renderAvionics() {
    const host = document.getElementById('avionicsOptions');
    host.innerHTML = CATALOG.avionics.map(a => {
      const selected = state.avionicsId === a.id;
      return `
        <label class="option ${selected ? 'selected' : ''}" data-avionics="${a.id}">
          <input type="radio" name="avionics" value="${a.id}" ${selected ? 'checked' : ''} />
          <div class="opt-body">
            <div class="opt-title"><span>${a.label}</span><span class="opt-price">${formatPrice(a.price)}</span></div>
            <div class="opt-desc">${a.desc}</div>
          </div>
        </label>
      `;
    }).join('');

    host.querySelectorAll('input[name="avionics"]').forEach(inp => {
      inp.addEventListener('change', e => { state.avionicsId = e.target.value; update(); });
    });
    host.querySelectorAll('.option').forEach(opt => {
      opt.addEventListener('click', e => {
        if (e.target.tagName === 'INPUT') return;
        const inp = opt.querySelector('input');
        inp.checked = true;
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  function renderExtras() {
    const host = document.getElementById('extrasOptions');
    host.innerHTML = CATALOG.extras.map(x => {
      const available = !x.models || !state.modelId || x.models.includes(state.modelId);
      const selected = state.extras.includes(x.id);
      return `
        <label class="option ${selected ? 'selected' : ''} ${available ? '' : 'disabled'}" data-extra="${x.id}">
          <input type="checkbox" value="${x.id}" ${selected ? 'checked' : ''} ${available ? '' : 'disabled'} />
          <div class="opt-body">
            <div class="opt-title"><span>${x.label}</span><span class="opt-price">${formatPrice(x.price)}</span></div>
            <div class="opt-desc">${x.desc}${available ? '' : ' <em>(nicht für gewähltes Modell)</em>'}</div>
          </div>
        </label>
      `;
    }).join('');

    host.querySelectorAll('input[type="checkbox"]').forEach(inp => {
      inp.addEventListener('change', e => {
        const id = e.target.value;
        if (e.target.checked) {
          if (!state.extras.includes(id)) state.extras.push(id);
        } else {
          state.extras = state.extras.filter(x => x !== id);
        }
        update();
      });
    });
  }

  function renderSummary() {
    const { subtotalUSD, lines } = computeTotals();
    const model = findModel(state.modelId);
    const variant = findVariant(model, state.variantId);

    document.getElementById('sumModel').textContent = model ? model.name : '— Modell wählen —';
    document.getElementById('sumVariant').textContent = variant ? variant.label : (model ? model.tag : '');

    const listHost = document.getElementById('summaryList');
    if (lines.length === 0) {
      listHost.innerHTML = '<li><span class="sum-label muted">Noch keine Optionen ausgewählt.</span><span></span></li>';
    } else {
      listHost.innerHTML = lines.map(l => `
        <li>
          <span class="sum-label">${l.label}</span>
          <span class="sum-value">${formatPrice(l.priceUSD)}</span>
        </li>
      `).join('');
    }

    document.getElementById('sumSubtotalUSD').textContent = formatPrice(subtotalUSD, { currency: 'USD' });
    document.getElementById('sumTotal').textContent = formatPrice(subtotalUSD);
    document.getElementById('sumCurLabel').textContent = state.currency;
    document.getElementById('sumRate').textContent =
      state.currency === 'USD' ? '1.0000 (Basis)' : `1 USD = ${(state.rates[state.currency] || 1).toFixed(4)} ${state.currency}`;
  }

  function renderFxBar() {
    document.getElementById('rateCHF').value = state.rates.CHF.toFixed(4);
    document.getElementById('rateEUR').value = state.rates.EUR.toFixed(4);

    document.getElementById('fxActive').textContent = state.currency === 'USD'
      ? 'USD (Basis)'
      : `1 USD = ${(state.rates[state.currency] || 1).toFixed(4)} ${state.currency}`;

    document.querySelectorAll('.cur-btn').forEach(btn => {
      const active = btn.dataset.currency === state.currency;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    const formCur = document.getElementById('formCurrency');
    if (formCur) formCur.value = state.currency;
  }

  // ---------- Actions ----------

  function selectModel(id) {
    if (state.modelId === id) return;
    state.modelId = id;
    const m = findModel(id);
    state.variantId = m && m.variants[0] ? m.variants[0].id : null;
    // Reset engine if not compatible
    if (state.engineId && m && !m.compatibleEngines.includes(state.engineId)) {
      state.engineId = null;
    }
    // Reset extras that aren't compatible
    state.extras = state.extras.filter(eid => {
      const x = findExtra(eid);
      return !x.models || x.models.includes(id);
    });
    update();
    document.getElementById('configurator').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function update() {
    saveState();
    renderModels();
    renderKitVariant();
    renderSections();
    renderEngines();
    renderAvionics();
    renderExtras();
    renderSummary();
    renderFxBar();
  }

  // ---------- Wiring ----------

  function wireCurrencySwitcher() {
    document.querySelectorAll('.cur-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.currency = btn.dataset.currency;
        update();
      });
    });
  }

  function wireRateInputs() {
    document.getElementById('rateCHF').addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      if (isFinite(v) && v > 0) { state.rates.CHF = v; update(); }
    });
    document.getElementById('rateEUR').addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      if (isFinite(v) && v > 0) { state.rates.EUR = v; update(); }
    });
    document.getElementById('resetRates').addEventListener('click', () => {
      state.rates = { ...CATALOG.defaultRates };
      update();
    });
  }

  function wireResetBtn() {
    document.getElementById('resetBtn').addEventListener('click', () => {
      if (!confirm('Konfiguration zurücksetzen?')) return;
      state = defaultState();
      update();
    });
  }

  function wirePrintBtn() {
    document.getElementById('printBtn').addEventListener('click', () => window.print());
  }

  function wireContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const payload = document.getElementById('configurationPayload');

    form.addEventListener('submit', e => {
      e.preventDefault();
      status.classList.remove('error');

      if (!form.reportValidity()) return;

      const { subtotalUSD } = computeTotals();
      const model = findModel(state.modelId);
      if (!model) {
        status.textContent = 'Bitte zuerst ein Modell auswählen.';
        status.classList.add('error');
        return;
      }

      payload.value = JSON.stringify({
        state,
        totals: {
          subtotalUSD,
          displayed: formatPrice(subtotalUSD),
          currency: state.currency,
          rate: state.rates[state.currency]
        }
      }, null, 2);

      // Demo-Submit: in produktiv mit eigenem Endpoint ersetzen.
      console.log('Sling Configurator – Anfrage:', payload.value);
      status.textContent = 'Danke! Deine Anfrage wurde erfasst. Dein Sling-Dealer meldet sich in Kürze.';
      form.reset();
    });
  }

  // ---------- Init ----------

  document.addEventListener('DOMContentLoaded', () => {
    update();
    wireCurrencySwitcher();
    wireRateInputs();
    wireResetBtn();
    wirePrintBtn();
    wireContactForm();
  });

})();
