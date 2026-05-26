/* ══════════════════════════════════════════════════════════════
   KPI HUB — Engine Reparto Unificato (stile "Acquisti")

   Ogni pagina reparto include questo file e chiama:
     RepartoEngine.init({ slug, repartoCfg, dataFile })

   Il file JSON del reparto contiene tutti i dati mensili.
   Stile e UX identici per ogni reparto.
══════════════════════════════════════════════════════════════ */

const MESI = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const MS = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

const RepartoEngine = {
  cfg: null,
  data: null,
  meseCorr: new Date().getMonth(),
  charts: {},

  // ─── INIT ────────────────────────────────────────────────
  async init(opts) {
    this.cfg = opts.repartoCfg;
    this.dataFile = '../' + opts.dataFile;
    await this.loadData();
    this.renderShell();
    this.renderAll();
  },

  // ─── DATA ────────────────────────────────────────────────
  async loadData() {
    try {
      const res = await fetch(this.dataFile + '?t=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      this.data = await res.json();
    } catch (e) {
      console.error('Impossibile caricare', this.dataFile, e);
      this.data = { reparto: this.cfg.slug, nome: this.cfg.nome, kpiMensili: [], alerts: [] };
    }
  },

  // ─── HEADER PAGINA ───────────────────────────────────────
  renderShell() {
    // Titolo
    document.title = 'KPI Monitor — ' + this.cfg.nome;
    const bcrumb = document.getElementById('bcrumb');
    if (bcrumb) bcrumb.textContent = this.cfg.nome;
    const phName = document.getElementById('ph-name');
    if (phName) phName.textContent = this.cfg.nome;
    const phIcon = document.getElementById('ph-icon');
    if (phIcon) phIcon.textContent = this.cfg.icona;
    const repSubtitle = document.getElementById('rep-subtitle');
    if (repSubtitle) repSubtitle.textContent = 'Dashboard KPI ' + this.cfg.nome + ' · ' + (this.data.ultimoAggiornamento || '');

    // Sidebar - lista reparti accessibili (master vede tutti, reparto solo se stesso)
    this.renderSidebar();

    // Mese corrente nella select
    const sel = document.getElementById('global-mese');
    if (sel) {
      sel.value = this.meseCorr;
      sel.onchange = () => { this.meseCorr = parseInt(sel.value); this.renderAll(); };
    }

    // Today chip
    const t = document.getElementById('today-chip');
    if (t) {
      const d = new Date();
      t.textContent = d.getDate() + ' ' + MS[d.getMonth()] + ' ' + d.getFullYear();
    }
  },

  renderSidebar() {
    const session = window.AUTH && AUTH.current();
    const isMaster = session && session.role === 'master';
    const reps = window.REPARTI || [];

    const sbReparti = document.getElementById('sb-reparti');
    if (!sbReparti) return;

    // Master vede tutti, reparto vede solo il suo
    const visibili = isMaster ? reps : reps.filter(r => r.slug === this.cfg.slug);

    sbReparti.innerHTML = visibili.map(r => `
      <a class="ni ${r.slug === this.cfg.slug ? 'active' : ''}" href="${r.slug === this.cfg.slug ? '#' : (r.slug + '.html')}">
        <span class="ni-emoji">${r.icona || '📁'}</span>
        ${r.nome}
      </a>
    `).join('');

    // Mostra il link "Dashboard Master" solo se è master
    const hubLink = document.getElementById('sb-hub-link');
    if (hubLink) hubLink.style.display = isMaster ? 'flex' : 'none';
  },

  // ─── RENDER GLOBALE ──────────────────────────────────────
  renderAll() {
    this.renderRiepilogo();
    this.renderAlerts();
    this.renderKpiCards();
    this.renderTrendChart();
    this.renderPerformanceChart();
    this.renderTabellaDettaglio();
  },

  // ─── KPI Mensili: helper ─────────────────────────────────
  getKpiMese(kpiIdx, mese) {
    const k = this.data.kpiMensili[kpiIdx];
    if (!k || !k.valori) return null;
    return k.valori[mese];
  },
  getKpiTarget(kpiIdx, mese) {
    const k = this.data.kpiMensili[kpiIdx];
    if (!k) return null;
    if (Array.isArray(k.target)) return k.target[mese];
    return k.target;
  },
  // status di un KPI in un mese: ok / warn / err
  statusKpiMese(kpiIdx, mese) {
    const k = this.data.kpiMensili[kpiIdx];
    if (!k) return 'empty';
    const v = this.getKpiMese(kpiIdx, mese);
    const t = this.getKpiTarget(kpiIdx, mese);
    if (v == null || t == null) return 'empty';
    const isLower = !!k.isLowerBetter;
    // Soglia warning ±5% del target
    const diff = v - t;
    if (isLower) {
      if (v <= t) return 'ok';
      if (v <= t * 1.05) return 'warn';
      return 'err';
    } else {
      if (v >= t) return 'ok';
      if (v >= t * 0.95) return 'warn';
      return 'err';
    }
  },

  // ─── RIEPILOGO COLONNE (stile Acquisti) ──────────────────
  renderRiepilogo() {
    const cont = document.getElementById('riepilogo-cols');
    if (!cont) return;
    const kpis = this.data.kpiMensili || [];
    const m = this.meseCorr;
    const meseLbl = document.getElementById('ins-mese-lbl');
    if (meseLbl) meseLbl.textContent = MESI[m];

    if (!kpis.length) {
      cont.innerHTML = '<div class="empty-state"><div class="ico">📭</div><p>Nessun KPI configurato per questo reparto.<br>Aggiungili in <code>data/' + this.cfg.slug + '.json</code></p></div>';
      return;
    }

    cont.innerHTML = kpis.map((k, i) => {
      const v = this.getKpiMese(i, m);
      const t = this.getKpiTarget(i, m);
      const status = this.statusKpiMese(i, m);
      const statusCls = status === 'ok' ? 'rc-tag-ok' : status === 'warn' ? 'rc-tag-warn' : status === 'err' ? 'rc-tag-warn' : 'rc-tag-neu';
      const statusTxt = status === 'ok' ? '✓ In target' : status === 'warn' ? '△ Attenzione' : status === 'err' ? '⚠ Fuori target' : '— Nessun dato';
      // Calcola percentuale di raggiungimento del target (per gauge)
      let pct = 0;
      if (v != null && t != null && t !== 0) {
        if (k.isLowerBetter) {
          pct = Math.min(100, Math.round((t / Math.max(v, 0.0001)) * 100));
        } else {
          pct = Math.min(100, Math.round((v / t) * 100));
        }
      }
      const gaugeColor = status === 'ok' ? '#16a34a' : status === 'warn' ? '#d97706' : status === 'err' ? '#dc2626' : '#9ca3af';
      const fmtV = this.formatValue(v, k.unit);
      const fmtT = this.formatValue(t, k.unit);

      return `
        <div class="rc-col">
          <div class="rc-head">
            <div class="rc-icon">${k.icon || '📊'}</div>
            <div class="rc-title">${k.label}</div>
            <span class="rc-tag ${statusCls}">${statusTxt}</span>
          </div>
          <div class="rc-inputs">
            <div class="rc-inp-row">
              <span class="rc-inp-lbl">VAL</span>
              <div class="rc-inp-euro">
                ${k.unit==='€'?'<span>€</span>':''}
                <input type="text" value="${v != null ? v : ''}" readonly title="Valore mese ${MESI[m]}">
                ${k.unit && k.unit!=='€'?'<span>'+k.unit+'</span>':''}
              </div>
            </div>
            <div class="rc-inp-row">
              <span class="rc-inp-lbl">TGT</span>
              <div class="rc-inp-euro" style="background:rgba(99,102,241,.06)">
                ${k.unit==='€'?'<span>€</span>':''}
                <input type="text" value="${t != null ? t : ''}" readonly>
                ${k.unit && k.unit!=='€'?'<span>'+k.unit+'</span>':''}
              </div>
            </div>
          </div>
          <div class="rc-totals">
            <div class="rc-tot-row"><span class="rc-tot-lbl">Valore</span><span class="rc-tot-val">${fmtV}</span></div>
            <div class="rc-tot-row"><span class="rc-tot-lbl">Target</span><span class="rc-tot-val" style="color:var(--text3)">${fmtT}</span></div>
          </div>
          <div class="rc-gauge-wrap">
            <div class="rc-gauge-val" style="color:${gaugeColor}">${pct}%</div>
            <div class="rc-gauge-sub">Raggiungimento</div>
            <div class="prog-bar">
              <div class="prog-fill" style="width:${pct}%;background:${gaugeColor}"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  formatValue(v, unit) {
    if (v == null || v === '') return '—';
    if (typeof v !== 'number') return String(v);
    if (unit === '€' || unit === 'EUR') return '€ ' + v.toLocaleString('it-IT');
    if (unit === '%') return v.toLocaleString('it-IT') + '%';
    return v.toLocaleString('it-IT') + (unit ? ' ' + unit : '');
  },

  // ─── ALERT PANEL ─────────────────────────────────────────
  renderAlerts() {
    const cont = document.getElementById('alert-list');
    if (!cont) return;
    const m = this.meseCorr;
    const kpis = this.data.kpiMensili || [];

    // Alert automatici da KPI sotto target
    const auto = [];
    kpis.forEach((k, i) => {
      const status = this.statusKpiMese(i, m);
      if (status === 'err' || status === 'warn') {
        const v = this.getKpiMese(i, m);
        const t = this.getKpiTarget(i, m);
        auto.push({
          level: status === 'err' ? 'crit' : 'warn',
          title: k.label + (status === 'err' ? ' fuori target' : ' in warning'),
          desc: 'Mese ' + MESI[m] + ' · Valore ' + this.formatValue(v, k.unit) + ' · Target ' + this.formatValue(t, k.unit),
          azione: k.azioni ? (status === 'err' ? k.azioni.warn : k.azioni.amber) : null
        });
      }
    });

    // Alert manuali dal JSON
    const manual = (this.data.alerts || []).map(a => ({ ...a }));

    const all = [...auto, ...manual];
    const counter = document.getElementById('alert-counter');
    if (counter) counter.textContent = all.length;

    if (!all.length) {
      cont.innerHTML = '<div class="empty-state ok"><div class="ico">✅</div><p>Tutti i KPI in linea con i target per ' + MESI[m] + '.</p></div>';
      return;
    }

    const ord = { crit:0, warn:1, info:2 };
    all.sort((a,b) => (ord[a.level]??3) - (ord[b.level]??3));

    cont.innerHTML = all.map(a => {
      const icon = a.level === 'crit' ? '🔴' : a.level === 'warn' ? '🟡' : 'ℹ️';
      const lvlCls = a.level === 'crit' ? 'crit' : a.level === 'warn' ? 'warn' : 'info';
      return `
        <div class="alert-row ${lvlCls}">
          <div class="alert-icon">${icon}</div>
          <div class="alert-text">
            <div class="alert-tit">${a.title || 'Alert'}</div>
            ${a.desc ? '<div class="alert-desc">' + a.desc + '</div>' : ''}
            ${a.azione ? '<div class="alert-azione">' + a.azione + '</div>' : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  // ─── KPI CARDS (sintesi top) ─────────────────────────────
  renderKpiCards() {
    const cont = document.getElementById('kpi-summary');
    if (!cont) return;
    const m = this.meseCorr;
    const kpis = this.data.kpiMensili || [];
    if (!kpis.length) { cont.innerHTML = ''; return; }

    cont.innerHTML = kpis.map((k, i) => {
      const v = this.getKpiMese(i, m);
      const t = this.getKpiTarget(i, m);
      const status = this.statusKpiMese(i, m);
      const col = status === 'ok' ? 'var(--green)' : status === 'warn' ? 'var(--amber)' : status === 'err' ? 'var(--red)' : 'var(--text4)';
      // Delta vs mese precedente
      let delta = '';
      if (m > 0 && v != null) {
        const vPrev = this.getKpiMese(i, m-1);
        if (vPrev != null && vPrev !== 0) {
          const dPct = ((v - vPrev) / vPrev * 100);
          const isPositive = k.isLowerBetter ? dPct < 0 : dPct > 0;
          const cls = Math.abs(dPct) < 0.5 ? 'delta-eq' : isPositive ? 'delta-up' : 'delta-dn';
          const arr = Math.abs(dPct) < 0.5 ? '→' : dPct > 0 ? '↑' : '↓';
          delta = '<div class="kpi-card-delta ' + cls + '">' + arr + ' ' + Math.abs(dPct).toFixed(1) + '% vs mese prec.</div>';
        }
      }
      return `
        <div class="kpi-card" style="--col:${col}">
          <div class="kpi-card-lbl">${k.icon || '📊'} ${k.label}</div>
          <div class="kpi-card-val">${this.formatValue(v, k.unit)}</div>
          ${t != null ? `<div class="kpi-card-sub">Target: ${this.formatValue(t, k.unit)}</div>` : ''}
          ${delta}
        </div>
      `;
    }).join('');
  },

  // ─── GRAFICO TREND ANNUALE ───────────────────────────────
  renderTrendChart() {
    const cv = document.getElementById('ch-trend');
    if (!cv || !window.Chart) return;
    const kpis = this.data.kpiMensili || [];
    if (!kpis.length) return;

    // Selettore KPI (se non c'è, mostra primo)
    const sel = document.getElementById('sel-trend-kpi');
    if (sel && !sel.dataset.init) {
      sel.innerHTML = kpis.map((k, i) => `<option value="${i}">${k.icon||''} ${k.label}</option>`).join('');
      sel.onchange = () => this.renderTrendChart();
      sel.dataset.init = '1';
    }
    const i = parseInt(sel ? sel.value : 0) || 0;
    const k = kpis[i] || kpis[0];

    const valori2026 = (k.valori || Array(12).fill(null));
    const valori2025 = (k.valoriAnnoPrec || Array(12).fill(null));
    const target = Array.isArray(k.target) ? k.target : Array(12).fill(k.target);

    if (this.charts.trend) this.charts.trend.destroy();
    this.charts.trend = new Chart(cv, {
      data: {
        labels: MS,
        datasets: [
          {
            type: 'bar', label: '2025',
            data: valori2025, backgroundColor: 'rgba(156,163,175,.55)',
            borderRadius: 4, order: 3
          },
          {
            type: 'bar', label: '2026',
            data: valori2026, backgroundColor: 'rgba(99,102,241,.85)',
            borderRadius: 4, order: 2
          },
          {
            type: 'line', label: 'Target',
            data: target, borderColor: '#16a34a', borderWidth: 2.5,
            borderDash: [6,4], pointRadius: 3, pointBackgroundColor: '#16a34a',
            backgroundColor: 'transparent', tension: 0, order: 1
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position:'bottom', labels:{font:{size:11,family:'Montserrat',weight:'600'},boxWidth:14,padding:14} },
          tooltip: { callbacks: { label: (c) => c.dataset.label + ': ' + RepartoEngine.formatValue(c.parsed.y, k.unit) } }
        },
        scales: {
          x: { ticks:{font:{size:10,family:'Montserrat'}} },
          y: { beginAtZero: true, ticks:{font:{size:10,family:'Montserrat'}, callback: (v) => v.toLocaleString('it-IT')} }
        }
      }
    });
  },

  // ─── GRAFICO PERFORMANCE (% raggiungimento per KPI nel mese) ──
  renderPerformanceChart() {
    const cv = document.getElementById('ch-performance');
    if (!cv || !window.Chart) return;
    const m = this.meseCorr;
    const kpis = this.data.kpiMensili || [];
    if (!kpis.length) return;

    const labels = kpis.map(k => k.label);
    const pcts = kpis.map((k, i) => {
      const v = this.getKpiMese(i, m);
      const t = this.getKpiTarget(i, m);
      if (v == null || t == null || t === 0) return 0;
      if (k.isLowerBetter) return Math.min(150, Math.round((t / Math.max(v, 0.0001)) * 100));
      return Math.min(150, Math.round((v / t) * 100));
    });
    const colors = kpis.map((k, i) => {
      const s = this.statusKpiMese(i, m);
      return s === 'ok' ? '#16a34a' : s === 'warn' ? '#d97706' : s === 'err' ? '#dc2626' : '#9ca3af';
    });

    if (this.charts.perf) this.charts.perf.destroy();
    this.charts.perf = new Chart(cv, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '% Raggiungimento target',
          data: pcts,
          backgroundColor: colors,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => c.parsed.x + '% del target' } }
        },
        scales: {
          x: { beginAtZero: true, suggestedMax: 120, ticks:{font:{size:10,family:'Montserrat'}, callback:(v)=>v+'%'} },
          y: { ticks:{font:{size:11,family:'Montserrat',weight:'600'}} }
        }
      }
    });
  },

  // ─── TABELLA DETTAGLIO MENSILE ───────────────────────────
  renderTabellaDettaglio() {
    const cont = document.getElementById('tabella-dettaglio');
    if (!cont) return;
    const kpis = this.data.kpiMensili || [];
    if (!kpis.length) { cont.innerHTML = ''; return; }

    let html = '<table class="tbl-mensile"><thead><tr><th class="tbl-name">KPI</th>';
    MS.forEach(m => html += '<th>' + m + '</th>');
    html += '<th class="tbl-tot">YTD</th></tr></thead><tbody>';
    kpis.forEach((k, i) => {
      html += '<tr><td class="tbl-name"><span class="tbl-icon">' + (k.icon||'📊') + '</span>' + k.label + '</td>';
      let ytd = 0, hasYtd = false;
      for (let m = 0; m < 12; m++) {
        const v = this.getKpiMese(i, m);
        const status = this.statusKpiMese(i, m);
        const cls = status === 'ok' ? 'cell-ok' : status === 'warn' ? 'cell-warn' : status === 'err' ? 'cell-err' : '';
        const txt = v != null ? this.formatValue(v, k.unit) : '—';
        html += '<td class="' + cls + '">' + txt + '</td>';
        if (v != null && !isNaN(v)) { ytd += v; hasYtd = true; }
      }
      html += '<td class="tbl-tot">' + (hasYtd ? this.formatValue(ytd, k.unit) : '—') + '</td></tr>';
    });
    html += '</tbody></table>';
    cont.innerHTML = html;
  }
};

window.RepartoEngine = RepartoEngine;
