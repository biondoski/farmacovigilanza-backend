const natural = require('natural');
const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const { farmaco, paziente, reazione, localita } = req.body;
    let sintomiEstratti = [];

    if (reazione && reazione.descrizione) {
      const tokenizer = new natural.WordTokenizer();
      const tokens = tokenizer.tokenize(reazione.descrizione.toLowerCase());
      const { words } = require('natural/lib/natural/util/stopwords_it');
      const paroleFiltrate = tokens.filter(parola => !words.includes(parola));
      const stemmer = natural.PorterStemmerIt;
      sintomiEstratti = paroleFiltrate.map(parola => stemmer.stem(parola));
    }

    const newReport = new Report({
      farmaco,
      paziente,
      reazione: { ...reazione, sintomiCategorizzati: sintomiEstratti },
      localita,
      submittedBy: req.user._id
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
    const { gravita, farmaco, dataDa, dataA, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    let query = {};

    if (gravita) query['reazione.gravita'] = gravita;
    if (farmaco) query['farmaco.nomeCommerciale'] = { $regex: farmaco, $options: 'i' };

    if (dataDa || dataA) {
      query.createdAt = {};
      if (dataDa) query.createdAt.$gte = new Date(`${dataDa}T00:00:00.000Z`);
      if (dataA) query.createdAt.$lte = new Date(`${dataA}T23:59:59.999Z`);
    }

    // ==> NUOVA LOGICA PER L'ORDINAMENTO <==
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const reports = await Report.find(query)
        .sort(sortOptions) // Applica l'ordinamento
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('submittedBy', 'name email');

    const count = await Report.countDocuments(query);

    res.status(200).json({
      reports,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
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
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!report) return res.status(404).json({ message: 'Segnalazione non trovata' });
    res.status(200).json(report);
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

    const headers = 'Data;Farmaco;Eta Paziente;Sesso;Gravita;Descrizione;Inserito Da\n';

    const rows = reports.map(r => {
      // Controlli di sicurezza per ogni campo
      const data = r.createdAt ? new Date(r.createdAt).toLocaleDateString('it-IT') : 'N/D';
      const farmaco = r.farmaco?.nomeCommerciale || 'N/D';
      const eta = r.paziente?.eta || 'N/D';
      const sesso = r.paziente?.sesso || 'N/D';
      const gravita = r.reazione?.gravita || 'N/D';
      const descrizione = r.reazione?.descrizione?.replace(/"/g, '""').replace(/\n|\r/g, ' ') || '';
      const inseritoDa = r.submittedBy?.name || 'Utente eliminato';

      return `${data};${farmaco};${eta};${sesso};${gravita};"${descrizione}";${inseritoDa}`;
    }).join('\n');

    const csv = headers + rows;

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('segnalazioni.csv');
    res.send(Buffer.from(csv, 'utf-8')); // Invia come buffer per gestire meglio i caratteri

  } catch (err) {
    console.error("ERRORE ESPORTAZIONE:", err);
    res.status(500).json({ message: 'Errore durante l\'esportazione' });
  }
};
