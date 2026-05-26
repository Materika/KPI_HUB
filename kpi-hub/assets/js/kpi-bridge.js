/* ══════════════════════════════════════════════════════════════
   KPI HUB — Bridge per reparti originali
   ──────────────────────────────────────────────────────────────
   Aggancia i file HTML originali (Acquisti, Vendite, Amm.) al
   sistema centralizzato dell'hub.

   USO (iniettato in fondo al body di ogni file originale):
       KpiBridge.init({
         slug: 'acquisti',
         storageKey: 'kpi_acquisti_dati_v3',  // chiave LS del file originale
         extractor: 'acquisti'                 // quale estrattore usare
       });

   FUNZIONI:
   1. Legge i dati dal localStorage del file originale
   2. Li converte in formato kpiMensili[] standard dell'hub
   3. Li salva in 'kpihub_data_<slug>' (visibile all'hub)
   4. Aggiunge un pulsante "📤 Esporta JSON" che scarica il file
      pronto da caricare in /data/<slug>.json su GitHub
══════════════════════════════════════════════════════════════ */

const KpiBridge = {
  cfg: null,

  init(opts) {
    this.cfg = opts;
    // Esegui dopo che la pagina ha caricato i suoi dati
    if (document.readyState === 'complete') {
      setTimeout(() => this.boot(), 600);
    } else {
      window.addEventListener('load', () => setTimeout(() => this.boot(), 600));
    }
  },

  boot() {
    // 1. Estrai e salva dati nello storage condiviso
    this.syncToHub();

    // 2. Hook su qualsiasi click di un bottone "Salva" (anche dentro il file originale)
    document.addEventListener('click', (e) => {
      const el = e.target;
      const txt = (el.textContent || '').toLowerCase();
      if (el.matches('button, .btn') && (txt.includes('salv') || el.classList.contains('sec-save-btn'))) {
        setTimeout(() => this.syncToHub(), 200);
      }
    }, true);

    // 3. Anche dopo modifiche input
    document.addEventListener('change', (e) => {
      if (e.target.matches('input, select, textarea')) {
        clearTimeout(this._dt);
        this._dt = setTimeout(() => this.syncToHub(), 400);
      }
    }, true);

    // 4. Inietta pulsante "Esporta JSON" in topbar
    this.injectExportButton();
  },

  syncToHub() {
    try {
      const raw = localStorage.getItem(this.cfg.storageKey);
      if (!raw) {
        // Niente dati salvati — uso quello che c'è in memoria
        var data = this.extractFromMemory();
      } else {
        var stored = JSON.parse(raw);
        var data = this.extract(stored);
      }
      if (!data) return;
      data.reparto = this.cfg.slug;
      data.ultimoAggiornamento = new Date().toISOString().slice(0, 10);
      localStorage.setItem('kpihub_data_' + this.cfg.slug, JSON.stringify(data));
    } catch (e) {
      console.warn('[KpiBridge] sync error:', e);
    }
  },

  extract(stored) {
    const fn = this.extractors[this.cfg.extractor];
    if (!fn) { console.warn('[KpiBridge] extractor non trovato:', this.cfg.extractor); return null; }
    return fn.call(this, stored);
  },

  extractFromMemory() {
    // Ogni reparto espone (idealmente) la sua struttura DB globale
    if (this.cfg.extractor === 'acquisti' && window.DB && window.DB.acquisti) {
      return this.extractors.acquistiMem.call(this, window.DB.acquisti);
    }
    if (this.cfg.extractor === 'vendite' && window.S) {
      return this.extractors.venditeMem.call(this);
    }
    if (this.cfg.extractor === 'amministrazione' && window.DB) {
      return this.extractors.amministrazioneMem.call(this, window.DB);
    }
    return null;
  },

  // ─── ESTRATTORI per i 3 reparti ──────────────────────────
  extractors: {

    // ──── ACQUISTI (da kpi-v191.html) ────
    acquisti(stored) {
      if (!stored.acquisti || !stored.acquisti.kpis) return null;
      const kpis = stored.acquisti.kpis;
      const out = { nome: 'Acquisti', kpiMensili: [], alerts: [] };
      const meta = {
        ordiniNum:   { label:'N° Ordini Inseriti',  icon:'📦', unit:'',  isLowerBetter:true },
        ordiniVal:   { label:'Valore Ordini',       icon:'💶', unit:'€', isLowerBetter:true },
        segnNum:     { label:'N° Segnalazioni',     icon:'⚠',  unit:'',  isLowerBetter:true },
        segnVal:     { label:'Valore Segnalazioni', icon:'💸', unit:'€', isLowerBetter:true }
      };
      Object.keys(kpis).forEach(id => {
        const k = kpis[id];
        const m = meta[id] || { label:id, icon:'📊', unit:'', isLowerBetter:false };
        const target = k.target || (k.tot2025 ? k.tot2025.map(v => v!=null ? Math.ceil(v*0.95) : 0) : Array(12).fill(0));
        out.kpiMensili.push({
          id, label:m.label, icon:m.icon, unit:m.unit,
          isLowerBetter: m.isLowerBetter,
          valori: k.tot2026 || Array(12).fill(null),
          valoriAnnoPrec: k.tot2025 || Array(12).fill(null),
          target
        });
      });
      return out;
    },

    acquistiMem(db) {
      const out = { nome: 'Acquisti', kpiMensili: [], alerts: [] };
      const meta = {
        ordiniNum:   { label:'N° Ordini Inseriti',  icon:'📦', unit:'',  isLowerBetter:true },
        ordiniVal:   { label:'Valore Ordini',       icon:'💶', unit:'€', isLowerBetter:true },
        segnNum:     { label:'N° Segnalazioni',     icon:'⚠',  unit:'',  isLowerBetter:true },
        segnVal:     { label:'Valore Segnalazioni', icon:'💸', unit:'€', isLowerBetter:true }
      };
      Object.keys(db.kpis || {}).forEach(id => {
        const k = db.kpis[id];
        const m = meta[id] || { label:id, icon:'📊', unit:'', isLowerBetter:false };
        out.kpiMensili.push({
          id, label:m.label, icon:m.icon, unit:m.unit,
          isLowerBetter: m.isLowerBetter,
          valori: k.tot2026 ? [...k.tot2026] : Array(12).fill(null),
          valoriAnnoPrec: k.tot2025 ? [...k.tot2025] : Array(12).fill(null),
          target: Array.isArray(k.target) ? [...k.target] : (k.tot2025 ? k.tot2025.map(v => v!=null ? Math.ceil(v*0.95) : 0) : Array(12).fill(0))
        });
      });
      return out;
    },

    // ──── VENDITE (da index.html) ────
    // index.html usa una struttura S = { kpis:[...] } interna
    vendite(stored) {
      // Per Vendite tipicamente non serve - leggiamo da memoria
      return this.extractors.venditeMem.call(this);
    },

    venditeMem() {
      const out = { nome: 'Vendite', kpiMensili: [], alerts: [] };
      // Vendite ha sottoreparti; aggrego il fatturato
      const S = window.S;
      if (!S || !S.kpis) return out;
      try {
        // Estraggo i KPI principali aggregati
        S.kpis.forEach(k => {
          if (!k || !k.id) return;
          out.kpiMensili.push({
            id: k.id,
            label: k.label || k.id,
            icon: k.icon || '📊',
            unit: k.unit || '',
            isLowerBetter: !!k.isLowerBetter,
            valori: Array.isArray(k.values) ? [...k.values] : (k.tot2026 ? [...k.tot2026] : Array(12).fill(null)),
            valoriAnnoPrec: Array.isArray(k.prevYear) ? [...k.prevYear] : (k.tot2025 ? [...k.tot2025] : Array(12).fill(null)),
            target: Array.isArray(k.target) ? [...k.target] : Array(12).fill(k.target || 0)
          });
        });
      } catch (e) { console.warn(e); }
      return out;
    },

    // ──── AMMINISTRAZIONE (da amministrazione-kpi.html) ────
    amministrazione(stored) {
      return this.buildAmm(stored);
    },

    amministrazioneMem(db) {
      return this.buildAmm(db);
    },

    // helper
    buildAmm(d) {
      const out = { nome: 'Amministrazione', kpiMensili: [], alerts: [] };
      if (!d) return out;
      const sources = [
        { key:'piano',      label:'Piano Finanziario',  icon:'🏦', unit:'%', isLowerBetter:false, valKey:'valori', tgtKey:'target' },
        { key:'crediti',    label:'% Crediti Scaduti',  icon:'⏱',  unit:'%', isLowerBetter:true,  valKey:'valori', tgtKey:'target' },
        { key:'recupero',   label:'Crediti Recuperati', icon:'💰', unit:'€', isLowerBetter:false, valKey:'valori', tgtKey:'target' },
        { key:'variazione', label:'Variazione Crediti', icon:'📊', unit:'€', isLowerBetter:true,  valKey:'valori', tgtKey:'target' }
      ];
      sources.forEach(s => {
        const node = d[s.key];
        if (!node) return;
        const valori = node[s.valKey] || node.values || node.tot2026 || Array(12).fill(null);
        const target = node[s.tgtKey] || (node.target ? (Array.isArray(node.target)?node.target:Array(12).fill(node.target)) : Array(12).fill(0));
        const prev = node.valoriAnnoPrec || node.tot2025 || node.prev || Array(12).fill(null);
        out.kpiMensili.push({
          id: s.key, label: s.label, icon: s.icon, unit: s.unit,
          isLowerBetter: s.isLowerBetter,
          valori: Array.isArray(valori)? [...valori] : Array(12).fill(null),
          valoriAnnoPrec: Array.isArray(prev)? [...prev] : Array(12).fill(null),
          target: Array.isArray(target)? [...target] : Array(12).fill(target||0)
        });
      });
      return out;
    }
  },

  // ─── PULSANTE ESPORTA JSON ────────────────────────────────
  injectExportButton() {
    const btn = document.createElement('button');
    btn.id = 'kpihub-export-btn';
    btn.innerHTML = '📤 Esporta JSON';
    btn.title = 'Scarica il file JSON da caricare in data/' + this.cfg.slug + '.json su GitHub';
    btn.style.cssText = `
      position:fixed;top:14px;right:200px;z-index:9999;
      background:#6366f1;color:#fff;border:none;
      padding:8px 14px;border-radius:8px;font-size:12px;font-weight:700;
      font-family:'Montserrat',sans-serif;cursor:pointer;
      box-shadow:0 4px 12px rgba(99,102,241,.3);
      transition:transform .12s,box-shadow .12s;
    `;
    btn.onmouseover = () => { btn.style.transform = 'translateY(-1px)'; btn.style.boxShadow = '0 6px 16px rgba(99,102,241,.4)'; };
    btn.onmouseout = () => { btn.style.transform = 'none'; btn.style.boxShadow = '0 4px 12px rgba(99,102,241,.3)'; };
    btn.onclick = () => this.downloadJson();
    document.body.appendChild(btn);
  },

  downloadJson() {
    this.syncToHub();  // assicurati che sia aggiornato
    const data = JSON.parse(localStorage.getItem('kpihub_data_' + this.cfg.slug) || '{}');
    if (!data.kpiMensili || !data.kpiMensili.length) {
      alert('⚠ Nessun dato da esportare per ' + this.cfg.slug);
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.cfg.slug + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    // Feedback
    const orig = document.getElementById('kpihub-export-btn').innerHTML;
    document.getElementById('kpihub-export-btn').innerHTML = '✓ Scaricato';
    document.getElementById('kpihub-export-btn').style.background = '#16a34a';
    setTimeout(() => {
      const el = document.getElementById('kpihub-export-btn');
      if (el) { el.innerHTML = orig; el.style.background = '#6366f1'; }
    }, 1800);
  }
};

window.KpiBridge = KpiBridge;
