/* ──────────────────────────────────────────────────────────
   KPI HUB — Sistema di autenticazione
   - Password salvate come hash SHA-256
   - Sessione in sessionStorage (chiusa con il browser)
   - Logica di accesso: master vede tutto, reparto vede solo se stesso
────────────────────────────────────────────────────────── */

const AUTH = {
  STORAGE_KEY: 'kpihub_session',
  LOGIN_PAGE: 'login.html',

  // Hash SHA-256 di una stringa
  async hash(str) {
    const buf = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  // Verifica credenziali contro USERS (config/users.js)
  async login(username, password) {
    if (typeof USERS === 'undefined') {
      throw new Error('USERS non caricato: includi config/users.js');
    }
    const u = USERS.find(x => x.username.toLowerCase() === username.toLowerCase().trim());
    if (!u) return { ok: false, msg: 'Utente non trovato' };
    const h = await this.hash(password);
    if (h !== u.passwordHash) return { ok: false, msg: 'Password errata' };
    // Sessione valida
    const session = {
      username: u.username,
      role: u.role, // 'master' | 'reparto'
      reparto: u.reparto || null, // slug del reparto se role=reparto
      loginAt: new Date().toISOString()
    };
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    return { ok: true, session };
  },

  // Sessione corrente (oppure null)
  current() {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },

  // Logout
  logout() {
    sessionStorage.removeItem(this.STORAGE_KEY);
    window.location.href = this.LOGIN_PAGE;
  },

  /**
   * Protezione di pagina.
   * @param {Object} opts
   * @param {string} opts.require - 'any' | 'master' | nome reparto (slug)
   * Se la sessione non basta, redirect al login.
   */
  protect(opts = { require: 'any' }) {
    const s = this.current();
    const loginUrl = (opts.loginPath || this.LOGIN_PAGE);

    if (!s) {
      window.location.href = loginUrl;
      return false;
    }
    if (opts.require === 'master' && s.role !== 'master') {
      // Non master → redirect alla sua pagina reparto o al login
      window.location.href = loginUrl;
      return false;
    }
    if (opts.require && opts.require !== 'any' && opts.require !== 'master') {
      // Richiede uno specifico reparto. Master entra ovunque.
      if (s.role !== 'master' && s.reparto !== opts.require) {
        window.location.href = loginUrl;
        return false;
      }
    }
    return s;
  },

  // Mostra la barra utente nell'angolo (chiamabile da qualsiasi pagina)
  injectUserBar(opts = {}) {
    const s = this.current();
    if (!s) return;
    const bar = document.createElement('div');
    bar.id = 'auth-bar';
    bar.innerHTML = `
      <style>
        #auth-bar{position:fixed;top:14px;right:14px;z-index:9999;
          display:flex;align-items:center;gap:10px;
          background:rgba(17,24,39,.92);backdrop-filter:blur(8px);
          color:#fff;padding:6px 10px 6px 14px;border-radius:20px;
          font-family:'Montserrat','DM Sans',sans-serif;font-size:11px;font-weight:600;
          box-shadow:0 4px 16px rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.08);}
        #auth-bar .ab-badge{font-size:9px;font-weight:700;text-transform:uppercase;
          letter-spacing:.5px;padding:2px 6px;border-radius:6px;}
        #auth-bar .ab-master{background:rgba(245,158,11,.25);color:#fbbf24;}
        #auth-bar .ab-rep{background:rgba(99,102,241,.25);color:#a5b4fc;}
        #auth-bar .ab-logout{background:#ef4444;color:#fff;border:none;border-radius:14px;
          padding:4px 10px;font-size:10px;font-weight:700;cursor:pointer;
          font-family:inherit;letter-spacing:.3px;}
        #auth-bar .ab-logout:hover{background:#dc2626;}
        @media (max-width:600px){#auth-bar .ab-user{display:none;}}
      </style>
      <span class="ab-badge ${s.role==='master'?'ab-master':'ab-rep'}">${s.role==='master'?'MASTER':'REPARTO'}</span>
      <span class="ab-user">${s.username}</span>
      <button class="ab-logout" onclick="AUTH.logout()">Esci</button>
    `;
    document.body.appendChild(bar);
  }
};

// Esposizione globale
window.AUTH = AUTH;
