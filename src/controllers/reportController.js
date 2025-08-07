const natural = require('natural');
const Report = require('../models/Report');
const stopwords = require('stopwords-it');

exports.createReport = async (req, res) => {
  try {
    const reportData = req.body;
    let sintomiEstratti = [];

    if (reportData.reazione && reportData.reazione.descrizione) {
      const tokenizer = new natural.WordTokenizer();
      const tokens = tokenizer.tokenize(reportData.reazione.descrizione.toLowerCase());

      const paroleFiltrate = tokens.filter(parola => !stopwords.includes(parola));

      const stemmer = natural.PorterStemmerIt;
      sintomiEstratti = paroleFiltrate.map(parola => stemmer.stem(parola));
    }

    const newReport = new Report({
      ...reportData,
      reazione: {
        ...reportData.reazione,
        sintomiCategorizzati: sintomiEstratti,
      },
      submittedBy: req.user ? req.user._id : null
    });

    const savedReport = await newReport.save();
    res.status(201).json(savedReport);

  } catch (err) {
    console.error('ERRORE CREAZIONE:', err.message);
    res.status(400).json({ message: 'Errore nella creazione della segnalazione', error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { farmaco, dataDa, dataA, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    let query = {};

    if (farmaco) {
      query['farmaciSospetti'] = { $elemMatch: { nomeCommerciale: { $regex: farmaco, $options: 'i' } } };
    }

    if (dataDa || dataA) {
      query.createdAt = {};
      if (dataDa) query.createdAt.$gte = new Date(`${dataDa}T00:00:00.000Z`);
      if (dataA) query.createdAt.$lte = new Date(`${dataA}T23:59:59.999Z`);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const limitValue = parseInt(limit);
    const pageValue = parseInt(page);

    let reportsQuery = Report.find(query)
        .sort(sortOptions)
        .populate('submittedBy', 'name email');

    // Applica la paginazione solo se il limite non è 0
    if (limitValue !== 0) {
      reportsQuery = reportsQuery.limit(limitValue).skip((pageValue - 1) * limitValue);
    }

    const reports = await reportsQuery;
    const count = await Report.countDocuments(query);

    res.status(200).json({
      reports,
      totalPages: limitValue !== 0 ? Math.ceil(count / limitValue) : 1,
      currentPage: pageValue
    });
  } catch (err) {
    res.status(500).json({ message: 'Errore del server' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('submittedBy', 'name email');
    if (!report) return res.status(404).json({ message: 'Segnalazione non trovata' });
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: 'Errore del server' });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedReport) return res.status(404).json({ message: 'Segnalazione non trovata' });
    res.status(200).json(updatedReport);
  } catch (err) {
    res.status(400).json({ message: 'Errore nell\'aggiornamento', error: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: 'Segnalazione non trovata' });
    res.status(200).json({ message: 'Segnalazione eliminata con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore del server' });
  }
};

exports.exportReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('submittedBy', 'name');

    const headers = 'Data;Tipo Segnalazione;Paziente Eta;Paziente Sesso;Farmaco Sospetto;Esito Reazione;Gravita;Descrizione;Inserito Da\n';

    const rows = reports.map(r => {
      const descrizione = r.reazione?.descrizione?.replace(/"/g, '""').replace(/\n|\r/g, ' ') || '';
      const data = r.createdAt ? new Date(r.createdAt).toLocaleDateString('it-IT') : 'N/D';
      const farmaco = r.farmaciSospetti[0]?.nomeCommerciale || 'N/D';
      const esito = r.reazione?.esito || 'N/D';
      const isGrave = r.reazione?.gravita?.isGrave ? 'Grave' : 'Non Grave';
      const inseritoDa = r.submittedBy?.name || 'Utente eliminato';

      return `${data};${r.tipoSegnalazione};${r.paziente.eta};${r.paziente.sesso};${farmaco};${esito};${isGrave};"${descrizione}";${inseritoDa}`;
    }).join('\n');

    const csv = headers + rows;

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('segnalazioni.csv');
    res.send(Buffer.from(csv, 'utf-8'));

  } catch (err) {
    console.error("ERRORE ESPORTAZIONE:", err);
    res.status(500).json({ message: 'Errore durante l\'esportazione' });
  }
};
