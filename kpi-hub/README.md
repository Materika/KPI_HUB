# KPI Monitor — Hub Reparti

Hub web protetto da password per gestire i KPI di tutti i reparti aziendali, con dashboard master aggregata accessibile solo all'amministratore.

---

## 📋 Sommario

1. [Architettura](#-architettura)
2. [Struttura](#-struttura-del-progetto)
3. [Pubblicare su GitHub Pages](#-pubblicare-su-github-pages-prima-volta)
4. [Credenziali di default](#-credenziali-di-default-da-cambiare-subito)
5. [Cambiare una password](#-cambiare-una-password)
6. [Come funziona il flusso dati (Bridge)](#-come-funziona-il-flusso-dati-bridge)
7. [Aggiungere un nuovo reparto](#-aggiungere-un-nuovo-reparto)
8. [Aggiornare i KPI](#-aggiornare-i-kpi)
9. [Sicurezza — cosa sapere](#-sicurezza--cosa-sapere)

---

## 🏗 Architettura

**Tre tipologie di file per reparto:**

1. **`reparti/<slug>.html`** — la pagina del reparto. Per i reparti già caricati (Acquisti, Vendite, Amministrazione) è il TUO file HTML originale + uno snippet di auth in cima e uno snippet "bridge" in fondo. Per i reparti non ancora caricati è un placeholder.

2. **`data/<slug>.json`** — la "fonte di verità" leggibile dalla dashboard master. Viene **aggiornato automaticamente** dal Bridge ogni volta che salvi dati nel reparto, oppure puoi **esportarlo manualmente** col pulsante "📤 Esporta JSON" che appare in alto a destra in ogni reparto.

3. **`hub.html`** — la dashboard master. Mostra salute aziendale generale, andamento mensile, stato di ogni reparto e tutte le criticità.

**Flusso:**
```
Utente compila KPI in reparto → file originale salva in localStorage
                              ↓
                         Bridge intercetta
                              ↓
              Sincronizza in localStorage 'kpihub_data_<slug>'
                              ↓
          Hub Master legge da qui (priorità) o da data/<slug>.json
                              ↓
              Pulsante "Esporta JSON" → upload manuale su GitHub
```

---

## 📁 Struttura del progetto

```
kpi-hub/
├── index.html              redirect intelligente (root)
├── login.html              pagina di login
├── hub.html                Dashboard MASTER (solo master)
├── genera-hash.html        tool per creare hash password
├── README.md
├── reparti/
│   ├── acquisti.html       file originale + auth + bridge ✓
│   ├── vendite.html        file originale + auth + bridge ✓
│   ├── amministrazione.html file originale + auth + bridge ✓
│   ├── operativo.html      placeholder ⏳
│   ├── logistica.html      placeholder ⏳
│   ├── produzione.html     placeholder ⏳
│   └── _placeholder-template.html
├── data/
│   ├── acquisti.json       fonte di verità (aggiornata via bridge)
│   ├── vendite.json
│   ├── amministrazione.json
│   ├── operativo.json      (vuoto, in attesa)
│   ├── logistica.json      (vuoto, in attesa)
│   └── produzione.json     (vuoto, in attesa)
├── config/
│   ├── users.js            utenti + hash password
│   └── reparti.js          ordine/icone/colori reparti
└── assets/
    ├── css/reparto.css
    └── js/
        ├── auth.js             sistema login (SHA-256)
        ├── reparto-engine.js   motore reparti generici
        └── kpi-bridge.js       ponte file originali → JSON
```

---

## 🚀 Pubblicare su GitHub Pages (prima volta)

1. Crea un **repository pubblico** su GitHub (es. `kpi-hub`)
2. Clicca **"Add file" → "Upload files"**
3. **Scompatta lo zip** sul tuo PC. Vedrai una cartella `kpi-hub` con dentro tutti i file.
4. **Apri la cartella `kpi-hub`** e **seleziona tutto quello che c'è dentro** (`Ctrl+A` / `Cmd+A`)
5. **Trascina la selezione** (non la cartella stessa!) nella pagina GitHub
6. Commit
7. Vai in **Settings → Pages**: seleziona branch `main`, folder `/ (root)`, salva
8. Aspetta 1-2 minuti. Vai su `https://TUOUSER.github.io/NOMEREPO/`

> ⚠️ Se trascini la **cartella** invece del contenuto, l'URL diventa `…/NOMEREPO/kpi-hub/` (funziona lo stesso, ma è meno pulito).

---

## 🔑 Credenziali di default (DA CAMBIARE SUBITO)

| Utente | Password | Vede |
|---|---|---|
| `master` | `master2026` | Dashboard Master + tutti i reparti |
| `operativo` | `operativo2026` | Solo reparto Operativo |
| `acquisti` | `acquisti2026` | Solo reparto Acquisti |
| `amministrazione` | `amministrazione2026` | Solo reparto Amministrazione |
| `vendite` | `vendite2026` | Solo reparto Vendite |
| `logistica` | `logistica2026` | Solo reparto Logistica |
| `produzione` | `produzione2026` | Solo reparto Produzione |

---

## 🔐 Cambiare una password

1. Apri `https://TUOUSER.github.io/NOMEREPO/genera-hash.html`
2. Inserisci la nuova password → otterrai un hash SHA-256
3. Apri `config/users.js` su GitHub (clicca matita ✏️ per editare)
4. Sostituisci il valore di `hash` per l'utente desiderato
5. Commit. La password è cambiata.

---

## 🔄 Come funziona il flusso dati (Bridge)

I tuoi file originali (Acquisti, Vendite, Amministrazione) **non sono stati modificati nella logica interna**. Continuano a funzionare esattamente come prima: salvano in localStorage, hanno i loro grafici, AI, fornitori ecc.

In più ho aggiunto in fondo a ogni file un piccolo "bridge" (`assets/js/kpi-bridge.js`) che:

1. **Legge** i dati dal localStorage del file originale (es. `kpi_acquisti_dati_v3`)
2. **Li converte** in un formato standard (`kpiMensili[]`) leggibile dall'hub master
3. **Li salva** in un secondo localStorage condiviso (`kpihub_data_<slug>`)
4. Aggiunge un pulsante **📤 Esporta JSON** in alto a destra: cliccandolo scarichi il file `<slug>.json` aggiornato, da caricare manualmente su GitHub nella cartella `data/`.

**L'hub master** legge i dati in questo ordine:
- 🥇 Da `localStorage` (`kpihub_data_<slug>`) → dati live, aggiornati istantaneamente
- 🥈 Da `data/<slug>.json` su GitHub → dati pubblicati ufficialmente
- 🥉 Niente → reparto mostrato come "Da caricare"

> 💡 Su questo browser/dispositivo vedi sempre i dati più freschi. Per condividerli con altri utenti devi esportarli e committarli su GitHub.

---

## ➕ Aggiungere un nuovo reparto

Diciamo che vuoi caricare il reparto "Operativo" (oggi placeholder):

1. Prepara il tuo file HTML per il reparto Operativo
2. **In cima al file**, subito dopo `<head>`, incolla questo snippet di **auth guard**:
   ```html
   <!-- KPI Hub - Auth Guard -->
   <script src="../config/users.js"></script>
   <script src="../config/reparti.js"></script>
   <script src="../assets/js/auth.js"></script>
   <script>
     (function() {
       const s = AUTH.protect({ require: 'operativo', loginPath: '../login.html' });
       if (!s) throw new Error('Redirect to login');
       document.addEventListener('DOMContentLoaded', function() {
         AUTH.injectUserBar();
       });
     })();
   </script>
   ```
   Cambia `'operativo'` con lo slug del tuo reparto.

3. **In fondo al file**, prima di `</body>`, incolla questo snippet di **bridge**:
   ```html
   <!-- KPI Hub - Bridge -->
   <script src="../assets/js/kpi-bridge.js"></script>
   <script>
     KpiBridge.init({
       slug: 'operativo',
       storageKey: 'CHIAVE_LS_DEL_TUO_FILE',  // la chiave localStorage che usa internamente
       extractor: 'operativo'                  // serve un estrattore in kpi-bridge.js
     });
   </script>
   ```
   Per nuovi reparti devi aggiungere un estrattore corrispondente in `assets/js/kpi-bridge.js` che converta i tuoi dati nel formato `kpiMensili[]`. Vedi gli estrattori esistenti come riferimento.

4. **Sostituisci** il file `reparti/operativo.html` su GitHub col tuo file
5. Commit. La pagina è online subito.

---

## 📊 Aggiornare i KPI

**Opzione A (consigliata) — Direttamente dalla pagina reparto:**
1. Vai sul tuo reparto (`reparti/acquisti.html`)
2. Compila i dati come fai normalmente
3. Clicca **💾 Salva** (come prima)
4. Quando vuoi pubblicare i dati per l'hub: clicca **📤 Esporta JSON** in alto a destra
5. Su GitHub, vai in `data/<slug>.json`, clicca matita ✏️, sostituisci il contenuto col file scaricato, commit

**Opzione B — Modifica diretta del JSON su GitHub:**
1. Apri `data/<slug>.json` su GitHub
2. Edita il file (matita ✏️)
3. Modifica i valori `valori[]` (12 numeri per i 12 mesi)
4. Commit

Formato JSON:
```json
{
  "reparto": "acquisti",
  "nome": "Acquisti",
  "ultimoAggiornamento": "2026-05-15",
  "kpiMensili": [
    {
      "id": "ordiniNum",
      "label": "N° Ordini Inseriti",
      "icon": "📦",
      "unit": "",
      "isLowerBetter": true,
      "valori":         [144,132,141,104,48, 0,0,0,0,0,0,0],
      "valoriAnnoPrec": [104,123,161,114,121,111,159,32,171,185,163,78],
      "target":         [99,117,153,108,115,105,151,30,162,176,155,74],
      "azioni": {
        "ok": "✓ Tutto OK...",
        "amber": "△ Attenzione...",
        "warn": "⚠ Critico..."
      }
    }
  ],
  "alerts": []
}
```

---

## 🛡 Sicurezza — cosa sapere

Questo è un hub **client-side**: l'autenticazione protegge l'esperienza utente, non rende i file inaccessibili tecnicamente. Chiunque conosca l'URL diretto di una pagina (es. `…/reparti/vendite.html`) può vederla **prima** che l'auth la blocchi. Le password sono in `users.js` (hash SHA-256, non in chiaro), ma il file è pubblico.

**Per dati davvero sensibili** (fatturati, contratti, dati personali) considera:
- 🔒 GitHub Pages **privato** (richiede piano a pagamento)
- 🔒 Hosting con autenticazione server-side (Vercel/Netlify con password, o backend dedicato)
- 🔒 Cloudflare Access davanti al sito (gratis fino a 50 utenti)

Per uso interno con dati non critici, GitHub Pages pubblico va benissimo.

---

🎯 **Domande?** Apri una conversazione e ti aiuto.
