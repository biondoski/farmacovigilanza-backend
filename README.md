# Piattaforma di Farmacovigilanza - Backend

Questo repository contiene il codice sorgente per il backend della Piattaforma di Farmacovigilanza, sviluppato come parte di un progetto di tesi di laurea. L'API REST è costruita con **Node.js**, **Express** e si interfaccia con un database NoSQL **MongoDB**.

---

## Contesto Tesi di Laurea

Questo progetto è stato sviluppato da:

* **Studente:** Antonio Biondillo
* **Matricola:** 01684787
* **Corso di Studio:** Ingegneria Informatica e dell'Automazione (D.M. 270/04)
* **Percorso:** Database
* **Titolo della Tesi:** Sviluppo di una Piattaforma per l'Analisi di Big Data in Ambito Farmaceutico: un'Applicazione per la Farmacovigilanza

---

## Funzionalità Principali

* 🔒 **Autenticazione Sicura:** Sistema di login e registrazione basato su **JSON Web Tokens (JWT)**.
* 👤 **Controllo degli Accessi Basato sui Ruoli (RBAC):** Tre livelli di utenza (`Operatore`, `Analista`, `Admin`) con permessi distinti.
* 📝 **API CRUD Complete:** Gestione completa delle segnalazioni di reazioni avverse.
* 🧠 **NLP (Natural Language Processing):** Categoriazzione automatica dei sintomi descritti in testo libero tramite tokenizzazione e stemming.
* 📊 **Endpoint di Analisi Avanzata:**
    * Aggregazioni complesse per dashboard analitiche.
    * Analisi di correlazione tra sintomi.
    * Analisi per lotti di produzione ("hot lots").
    * Analisi demografica per età e sesso.
* 📄 **Esportazione Dati:** Endpoint dedicato per l'esportazione delle segnalazioni in formato CSV.

---

## Stack Tecnologico

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB con Mongoose (ODM)
* **Autenticazione:** JSON Web Token (`jsonwebtoken`), `bcryptjs` per l'hashing delle password.
* **NLP:** `natural`
* **Middleware:** `cors`, `dotenv`

---

## Installazione e Avvio

### Prerequisiti

* Node.js (versione 18.x o superiore consigliata)
* MongoDB (istanza locale o su Atlas)
* `nvm` (Node Version Manager) per gestire le versioni di Node.js (consigliato)

### Procedura

1.  **Clonare il repository:**
    ```bash
    git clone <URL_DEL_REPOSITORY>
    cd farmacovigilanza-backend
    ```

2.  **Installare le dipendenze:**
    ```bash
    npm install
    ```

3.  **Configurare le variabili d'ambiente:**
    * Creare un file `.env` nella root del progetto.
    * Copiare il contenuto di `.env.example` (se presente) o aggiungere le seguenti chiavi:
        ```env
        MONGO_URI=TUA_STRINGA_DI_CONNESSIONE_MONGODB
        JWT_SECRET=TUA_CHIAVE_SEGRETA_PER_JWT
        PORT=5000
        ```

4.  **Avviare il server:**
    * Per lo sviluppo (con riavvio automatico):
        ```bash
        npm run dev
        ```
    * Per la produzione:
        ```bash
        npm start
        ```
Il server sarà in ascolto su `http://localhost:5000`.
