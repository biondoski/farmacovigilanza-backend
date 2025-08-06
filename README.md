# Piattaforma di Farmacovigilanza - Backend

Questo repository contiene il codice sorgente per il backend della Piattaforma di Farmacovigilanza, sviluppato come parte di un progetto di tesi di laurea. L'API REST è costruita con **Node.js**, **Express** e si interfaccia con un database NoSQL **MongoDB**. Il sistema è progettato per raccogliere, gestire e analizzare segnalazioni di sospette reazioni avverse a farmaci, seguendo il modello dati definito dall'AIFA.

---

## Contesto Tesi di Laurea

* **Studente:** Antonio Biondillo
* **Matricola:** 01684787
* **Corso di Studio:** Ingegneria Informatica e dell'Automazione (D.M. 270/04)
* **Percorso:** Database
* **Titolo della Tesi:** Sviluppo di una Piattaforma per l'Analisi di Big Data in Ambito Farmaceutico: un'Applicazione per la Farmacovigilanza

---

## Funzionalità Principali

* 🔒 **Autenticazione Sicura:** Sistema di login e registrazione basato su **JSON Web Tokens (JWT)**.
* 👤 **Controllo degli Accessi Basato sui Ruoli (RBAC):** Tre livelli di utenza (`Operatore`, `Analista`, `Admin`) con permessi granulari.
* 🇮🇹 **Modello Dati Conforme AIFA:** La struttura delle segnalazioni è basata sulle schede ufficiali dell'Agenzia Italiana del Farmaco.
* 📝 **API CRUD Complete:** Gestione completa (Creazione, Lettura, Aggiornamento, Eliminazione) delle segnalazioni e degli utenti.
* 🧠 **NLP (Natural Language Processing):** Categoriazzione automatica dei sintomi descritti in testo libero tramite tokenizzazione e stemming con la libreria `natural`.
* 📊 **Endpoint di Analisi Avanzata:**
    * API dinamiche per alimentare dashboard complesse con filtri globali.
    * Analisi di correlazione tra sintomi (co-occorrenza).
    * Analisi per lotti di produzione ("hot lots") per identificare picchi di reazioni.
    * Analisi demografica per fasce d'età e sesso.
* 📄 **Esportazione Dati:** Endpoint dedicato per l'esportazione delle segnalazioni in formato CSV.

---

## Stack Tecnologico

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB con Mongoose (ODM)
* **Autenticazione:** JSON Web Token (`jsonwebtoken`), `bcryptjs` per l'hashing.
* **NLP:** `natural`
* **Process Management (Produzione):** PM2

---

## Installazione e Avvio

### Prerequisiti

* Node.js (v18.x o superiore)
* MongoDB (istanza locale o su Atlas)
* `nvm` (consigliato)

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
    * Aggiungere le seguenti chiavi:
        ```env
        MONGO_URI=TUA_STRINGA_DI_CONNESSIONE_MONGODB
        JWT_SECRET=TUA_CHIAVE_SEGRETA_PER_JWT
        PORT=5000
        ```

4.  **Avviare il server:**
    ```bash
    npm run dev
    ```
Il server sarà in ascolto su `http://localhost:5000`.
