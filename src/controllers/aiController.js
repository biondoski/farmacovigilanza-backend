const { GoogleGenerativeAI } = require('@google/generative-ai');
const Report = require('../models/Report');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeReport = async (req, res) => {
    try {
        const { reportId } = req.body;
        if (!reportId) {
            return res.status(400).json({ message: 'ID della segnalazione mancante.' });
        }

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Segnalazione non trovata.' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      Sei un assistente esperto di farmacovigilanza. Analizza i seguenti dati di una segnalazione di reazione avversa e fornisci un'analisi strutturata.

      Dati della Segnalazione:
      - Paziente: ${report.paziente.eta} anni, sesso ${report.paziente.sesso}.
      - Farmaco Sospetto Principale: ${report.farmaciSospetti[0]?.nomeCommerciale || 'Non specificato'}.
      - Descrizione Reazione: "${report.reazione.descrizione}".
      - Esito: ${report.reazione.esito}.
      - Gravità: ${report.reazione.gravita.isGrave ? 'Grave' : 'Non Grave'}.

      Esegui i seguenti tre compiti:
      1.  **Riepilogo Automatico:** Genera un riassunto conciso e in linguaggio naturale del caso (massimo 2 frasi).
      2.  **Identificazione di Rischi Potenziali:** Basandoti sulla descrizione, identifica i possibili rischi o suggerisci i prossimi passi monitoraggio in modo ipotetico (massimo 2 frasi).
      3.  **Classificazione Semplificata:** Suggerisci 2 o 3 possibili termini MedDRA (in formato PT - Preferred Term) che meglio descrivono i sintomi principali.

      Fornisci la tua risposta ESCLUSIVAMENTE in formato JSON valido, senza testo introduttivo o conclusivo, con le seguenti chiavi: "riepilogo", "rischiPotenziali", "classificazioneMedDRA" (che deve essere un array di stringhe).
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // ==> CORREZIONE PER ESTRARRE IL JSON <==
        const startIndex = responseText.indexOf('{');
        const endIndex = responseText.lastIndexOf('}');

        if (startIndex === -1 || endIndex === -1) {
            throw new Error("La risposta dell'AI non contiene un JSON valido.");
        }

        const jsonString = responseText.substring(startIndex, endIndex + 1);
        const jsonResponse = JSON.parse(jsonString);

        res.status(200).json(jsonResponse);

    } catch (error) {
        console.error("Errore durante l'analisi AI:", error);
        res.status(500).json({ message: "Si è verificato un errore durante l'analisi con l'intelligenza artificiale." });
    }
};
