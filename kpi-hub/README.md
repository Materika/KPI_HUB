# KPI Monitor — Hub Reparti

Hub web protetto da password per gestire i KPI di tutti i reparti aziendali, con dashboard master aggregata accessibile solo dall'amministratore.

---

## 📋 Sommario

1. [Struttura](#-struttura-del-progetto)
2. [Pubblicare su GitHub Pages](#-pubblicare-su-github-pages-prima-volta)
3. [Credenziali di default](#-credenziali-di-default-da-cambiare-subito)
4. [Cambiare una password](#-cambiare-una-password)
5. [Aggiungere/rimuovere/riordinare reparti](#-aggiungere-rimuovere-o-riordinare-reparti)
6. [Aggiornare i KPI di un reparto](#-aggiornare-i-kpi-di-un-reparto)
7. [Personalizzare le pagine reparto](#-personalizzare-le-pagine-reparto)
8. [Sicurezza — cosa sapere](#-sicurezza--cosa-sapere)

---

## 📁 Struttura del progetto

```
kpi-hub/
├── index.html              ← redirect intelligente (root)
├── login.html              ← pagina di login
├── hub.html                ← Dashboard MASTER (solo tu)
├── genera-hash.html        ← tool per creare hash password
├── reparti/
│   ├── operativo.html      ← pagina KPI Operativo
│   ├── acquisti.html       ← pagina KPI Acquisti
│   ├── amministrazione.html
│   ├── vendite.html        ← include i sotto-reparti
│   ├── logistica.html
│   ├── produzione.html
│   └── _template-reparto.html  ← base per nuovi reparti
├── data/
│   ├── operativo.json      ← i KPI di ogni reparto
│   ├── acquisti.json
│   ├── amministrazione.json
│   ├── vendite.json
│   ├── logistica.json
│   └── produzione.json
├── config/
│   ├── users.js            ← utenti, password (come hash), ruoli
│   └── reparti.js          ← lista reparti e ordine di default
└── assets/
    └── js/
        └── auth.js         ← motore di autenticazione
```

---

## 🚀 Pubblicare su GitHub Pages (prima volta)

### Passo 1 — Crea un repository nuovo
1. Vai su [github.com/new](https://github.com/new)
2. Scegli un nome (es. `kpi-hub`)
3. Selezione: **Public** (necessario per GitHub Pages gratis)
4. **Non** spuntare "Add a README"
5. Clicca **Create repository**

### Passo 2 — Carica i file
1. Nella pagina del repo appena creato, clicca su **"uploading an existing file"**
2. **Trascina dentro tutta la cartella** `kpi-hub/` (o il contenuto)
3. Scrivi un messaggio tipo "Setup iniziale" in basso
4. Clicca **Commit changes**

### Passo 3 — Attiva GitHub Pages
1. Vai su **Settings** (in alto a destra nella pagina del repo)
2. Nel menu di sinistra: **Pages**
3. In "Source" seleziona **Deploy from a branch**
4. In "Branch" seleziona **main** e cartella **/ (root)**
5. Clicca **Save**

### Passo 4 — Aspetta 1-2 minuti
GitHub costruisce il sito. Quando è pronto vedrai:
> ✅ Your site is live at `https://TUO-USERNAME.github.io/kpi-hub/`

Apri quell'URL e dovresti vedere la pagina di login.

---

## 🔑 Credenziali di default — DA CAMBIARE SUBITO

| Username | Password | Ruolo |
|---|---|---|
| `master` | `master2026` | **Master** (vede tutto) |
| `operativo` | `operativo2026` | Reparto |
| `acquisti` | `acquisti2026` | Reparto |
| `amministrazione` | `amministrazione2026` | Reparto |
| `vendite` | `vendite2026` | Reparto |
| `logistica` | `logistica2026` | Reparto |
| `produzione` | `produzione2026` | Reparto |

**⚠️ Cambia subito almeno la password master.** Vedi sezione sotto.

---

## 🔐 Cambiare una password

1. Apri il file **`genera-hash.html`** (doppio click sul file scaricato sul tuo PC, o online)
2. Scrivi la nuova password e clicca **"Genera hash"**
3. Copia l'hash (lunga stringa esadecimale)
4. Apri **`config/users.js`**
5. Trova l'utente da modificare (es. `master`) e sostituisci il valore di `passwordHash` con il nuovo
6. Salva, fai commit + push su GitHub
7. In 1-2 minuti la nuova password è attiva

Esempio di linea da modificare:
```js
{
  username: 'master',
  passwordHash: 'd4d5d4a69da1f83ec07d3e3ccb84a680...',  // ← sostituisci qui
  role: 'master'
}
```

---

## 📂 Aggiungere, rimuovere o riordinare reparti

### Aggiungere un nuovo reparto
1. Crea un nuovo file in `reparti/` (puoi copiare `_template-reparto.html` e modificare il valore di `__REPARTO_SLUG` in alto)
2. Crea il file JSON corrispondente in `data/` (vedi formato sotto)
3. Aggiungi un blocco in `config/reparti.js`:
   ```js
   {
     slug: 'nuovo-reparto',
     nome: 'Nuovo Reparto',
     icona: '🎯',
     colore: '#0891b2',
     file: 'reparti/nuovo-reparto.html',
     dataFile: 'data/nuovo-reparto.json'
   }
   ```
4. Aggiungi un utente in `config/users.js` se vuoi che possa accedere

### Rimuovere un reparto
Cancella la sua riga in `config/reparti.js`. Puoi anche cancellare i file relativi.

### Riordinare i reparti
- **Modo grafico (consigliato):** entra nel `hub.html` come master e **trascina le card** per riordinarle. L'ordine viene salvato nel tuo browser.
- **Modo permanente:** cambia l'ordine delle voci dentro `config/reparti.js`.

---

## 📊 Aggiornare i KPI di un reparto

Ogni reparto ha un file JSON in `data/`. Il formato è:

```json
{
  "reparto": "operativo",
  "nome": "Reparto Operativo",
  "ultimoAggiornamento": "2026-01-15",
  "kpi": [
    {
      "label": "Efficienza operativa",
      "value": 87,
      "unit": "%",
      "target": 85,
      "status": "ok"
    }
  ],
  "alerts": [
    {
      "level": "crit",
      "title": "Titolo alert",
      "desc": "Descrizione dettaglio"
    }
  ]
}
```

### Campi di ogni `kpi`
- **`label`**: nome del KPI (es. "Fatturato totale")
- **`value`**: numero (o stringa)
- **`unit`**: opzionale — `"%"`, `"€"`, `"pz"`, `"h"`, ecc.
- **`target`**: valore obiettivo (opzionale ma consigliato)
- **`status`**: `"ok"` | `"warn"` | `"err"` — determina colori e alert nella dashboard

### Campi di ogni `alert`
- **`level`**: `"crit"` | `"warn"` | `"info"`
- **`title`**: breve titolo
- **`desc`**: descrizione

### Workflow di aggiornamento
1. Apri il file JSON del reparto su GitHub (`data/vendite.json`)
2. Clicca sulla matita ✏️ per editare
3. Modifica i valori
4. Scorri in fondo e clicca **Commit changes**
5. In ~1 minuto la dashboard riflette i nuovi dati

---

## 🎨 Personalizzare le pagine reparto

I file **`reparti/acquisti.html`**, **`reparti/amministrazione.html`** e **`reparti/vendite.html`** sono già pagine ricche e personalizzate (con form di inserimento, grafici dettagliati, ecc).

Le altre (`operativo.html`, `logistica.html`, `produzione.html`) sono basate su un template generico che legge i dati dal JSON.

Per arricchirle, puoi:
- Modificare direttamente l'HTML
- Copiare uno dei file ricchi (es. `acquisti.html`) come base
- Aggiungere nuovi grafici Chart.js, tabelle, form, ecc.

L'importante è **NON RIMUOVERE** il blocco `<!-- ── AUTH GUARD ── -->` in alto: è quello che protegge la pagina dall'accesso non autorizzato.

---

## 🛡️ Sicurezza — cosa sapere

Questo hub usa autenticazione **lato client** (JavaScript). Questo significa:

✅ **Va bene per:**
- Uso interno aziendale
- Proteggere dati sensibili da accessi casuali
- Separazione netta tra utenti (ogni reparto vede solo il suo)
- Tracciamento degli accessi base

⚠️ **Limiti:**
- Un utente molto tecnico **potrebbe** aggirare il login locale modificando il JavaScript nel suo browser. Tuttavia non vedrebbe nulla di più di quello che è pubblicato nel repo: se metti dati ultra-sensibili, considera di usare repo **Private** + GitHub Pages (richiede piano Pro) oppure un servizio con vera autenticazione lato server (Vercel, Netlify, Firebase Auth).
- Le password sono salvate come hash SHA-256 senza salt: ottimo contro letture casuali, debole contro attacchi brute-force se l'hash venisse esfiltrato. **Usa password lunghe** (12+ caratteri) per sicurezza.
- La sessione si chiude alla chiusura del browser (`sessionStorage`).

### Per aumentare la sicurezza
- Cambia le password di default subito (specialmente master)
- Usa password lunghe e uniche per ogni reparto
- Considera di mettere il repo in **Private** se l'azienda ha l'abbonamento GitHub Pro/Team

---

## 🆘 Problemi comuni

**"Il login non funziona"**
→ Controlla la console del browser (F12). Probabilmente il file `config/users.js` non è raggiungibile o ha un errore di sintassi.

**"Vedo solo il login, anche da master"**
→ Le credenziali sono `master` / `master2026` (case-sensitive per la password).

**"Dopo il login non vedo nulla"**
→ I file JSON in `data/` non sono raggiungibili. Verifica che siano stati caricati su GitHub.

**"GitHub Pages non si aggiorna"**
→ Aspetta 1-2 minuti dopo ogni commit. Forza il refresh con `Ctrl+Shift+R` (`Cmd+Shift+R` su Mac).

---

Buon lavoro! 🚀
