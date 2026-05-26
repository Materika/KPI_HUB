/* ══════════════════════════════════════════════════════════════
   KPI HUB — CONFIGURAZIONE UTENTI

   Ogni utente ha:
     - username:     stringa (case-insensitive)
     - passwordHash: hash SHA-256 della password in chiaro
     - role:         'master' (vede tutto) | 'reparto' (vede solo il suo)
     - reparto:      slug del reparto (solo se role='reparto')

   ──────────────────────────────────────────────────────────────
   PASSWORD DI DEFAULT (CAMBIALE SUBITO!):
     master         → master2026
     operativo      → operativo2026
     acquisti       → acquisti2026
     amministrazione→ amministrazione2026
     vendite        → vendite2026
     logistica      → logistica2026
     produzione     → produzione2026
   ──────────────────────────────────────────────────────────────

   COME CAMBIARE UNA PASSWORD:
   1. Apri il file `genera-hash.html` (doppio click)
   2. Scrivi la nuova password e clicca "Genera hash"
   3. Copia l'hash e incollalo qui sotto al posto del vecchio
   4. Commit + push su GitHub → in pochi secondi è attivo

   IMPORTANTE: dopo aver cambiato le password, NON le potrai recuperare:
   se le perdi devi rigenerarle.
══════════════════════════════════════════════════════════════ */

const USERS = [
  // ── ACCOUNT MASTER (TU) ──────────────────────────────────────
  {
    username: 'master',
    passwordHash: 'd4d5d4a69da1f83ec07d3e3ccb84a680177d9076f89f1ab5138be675fd73cfbd', // master2026
    role: 'master'
  },

  // ── ACCOUNT REPARTI ──────────────────────────────────────────
  {
    username: 'operativo',
    passwordHash: '1d7dbe7d0f7e527e2a8a3a56296dd54e2f1d83f0912b1adb48fefb3154f8fb77', // operativo2026
    role: 'reparto',
    reparto: 'operativo'
  },
  {
    username: 'acquisti',
    passwordHash: 'f37656777c6d59576894b6fb66362f499fd5d162a3745b4bbcd18a35f547997c', // acquisti2026
    role: 'reparto',
    reparto: 'acquisti'
  },
  {
    username: 'amministrazione',
    passwordHash: '286190cd154b7b53c1912579a3ae31ac8f01d3b077ce958e2c771e6784af8ffc', // amministrazione2026
    role: 'reparto',
    reparto: 'amministrazione'
  },
  {
    username: 'vendite',
    passwordHash: 'd571064c2cb70112e7c4308634c2b551af9949028cd40212ac03374befc6549d', // vendite2026
    role: 'reparto',
    reparto: 'vendite'
  },
  {
    username: 'logistica',
    passwordHash: 'e17f4767a0e2d2d46ec691de2e7a02cf55c6d5c40981367e9b27f9bba88f5b19', // logistica2026
    role: 'reparto',
    reparto: 'logistica'
  },
  {
    username: 'produzione',
    passwordHash: '98fa4ba9960e6f1fb20070c725d54a88e97bc7193d7c930add2d072c23a86d0b', // produzione2026
    role: 'reparto',
    reparto: 'produzione'
  }
];

window.USERS = USERS;
