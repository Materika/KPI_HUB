/* ══════════════════════════════════════════════════════════════
   KPI HUB — CONFIGURAZIONE REPARTI

   Modifica questo array per:
     • Aggiungere nuovi reparti
     • Rimuovere reparti esistenti
     • Cambiare l'ORDINE DI DEFAULT (verrà mostrato così nell'hub)

   Nota: nell'hub master puoi anche trascinare i reparti su/giù
   con il mouse. L'ordine personalizzato viene salvato in localStorage.

   STRUTTURA DI OGNI REPARTO:
     slug:    identificativo univoco (no spazi, minuscolo)
     nome:    nome mostrato a video
     icona:   emoji (singolo carattere, gli emoji compositi vanno bene)
     colore:  codice esadecimale (per accenti grafici)
     file:    nome del file HTML del reparto (in cartella reparti/)
     dataFile:nome del file JSON con i KPI (in cartella data/)
     sotto:   sotto-reparti opzionali (es. Vendite)
══════════════════════════════════════════════════════════════ */

const REPARTI = [
  {
    slug: 'operativo',
    nome: 'Reparto Operativo',
    icona: '⚙️',
    colore: '#6366f1',
    file: 'reparti/operativo.html',
    dataFile: 'data/operativo.json'
  },
  {
    slug: 'acquisti',
    nome: 'Acquisti',
    icona: '🛒',
    colore: '#0891b2',
    file: 'reparti/acquisti.html',
    dataFile: 'data/acquisti.json'
  },
  {
    slug: 'amministrazione',
    nome: 'Amministrazione',
    icona: '🏦',
    colore: '#d97706',
    file: 'reparti/amministrazione.html',
    dataFile: 'data/amministrazione.json'
  },
  {
    slug: 'vendite',
    nome: 'Vendite',
    icona: '📈',
    colore: '#16a34a',
    file: 'reparti/vendite.html',
    dataFile: 'data/vendite.json',
    sotto: [
      // I sotto-reparti vendite vengono gestiti DENTRO il file vendite.html
      // perché è già strutturato così nel tuo index.html attuale.
      // Lista informativa per la dashboard master:
      { slug: 'materika', nome: 'Materika' },
      { slug: 'mike',     nome: 'Mike' },
      { slug: 'carlo',    nome: 'Carlo' },
      { slug: 'nicola',   nome: 'Nicola' },
      { slug: 'alberto',  nome: 'Alberto' }
    ]
  },
  {
    slug: 'logistica',
    nome: 'Logistica',
    icona: '🚚',
    colore: '#7c3aed',
    file: 'reparti/logistica.html',
    dataFile: 'data/logistica.json'
  },
  {
    slug: 'produzione',
    nome: 'Produzione',
    icona: '🏭',
    colore: '#dc2626',
    file: 'reparti/produzione.html',
    dataFile: 'data/produzione.json'
  }
];

window.REPARTI = REPARTI;
