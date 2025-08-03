const Report = require('../models/Report');

const buildMatchStage = (filters) => {
    const matchStage = {};
    if (filters.farmaco) {
        matchStage['farmaco.nomeCommerciale'] = { $regex: filters.farmaco, $options: 'i' };
    }
    if (filters.dataDa || filters.dataA) {
        matchStage.createdAt = {};
        if (filters.dataDa) matchStage.createdAt.$gte = new Date(`${filters.dataDa}T00:00:00.000Z`);
        if (filters.dataA) matchStage.createdAt.$lte = new Date(`${filters.dataA}T23:59:59.999Z`);
    }
    return matchStage;
};

exports.runDynamicAnalysis = async (req, res) => {
    try {
        const filters = req.body.filters || {};
        const matchStage = buildMatchStage(filters);

        const [
            reportsByDrug,
            reportsBySeverity,
        ] = await Promise.all([
            Report.aggregate([
                { $match: matchStage },
                { $group: { _id: '$farmaco.nomeCommerciale', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            Report.aggregate([
                { $match: matchStage },
                { $group: { _id: '$reazione.gravita', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
        ]);

        res.status(200).json({
            reportsByDrug,
            reportsBySeverity
        });

    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
};

exports.getReactionsByDrugAndAge = async (req, res) => {
  const { farmaco, etaMin, etaMax } = req.query;
  if (!farmaco || !etaMin || !etaMax) {
    return res.status(400).json({ message: 'Parametri farmaco, etaMin e etaMax sono obbligatori.' });
  }
  try {
    const stats = await Report.aggregate([
      { $match: { 'farmaco.nomeCommerciale': { $regex: new RegExp(`^${farmaco}$`, 'i') }, 'paziente.eta': { $gte: parseInt(etaMin), $lte: parseInt(etaMax) } } },
      { $unwind: '$reazione.sintomiCategorizzati' },
      { $group: { _id: '$reazione.sintomiCategorizzati', conteggio: { $sum: 1 } } },
      { $sort: { conteggio: -1 } },
      { $limit: 5 }
    ]);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Errore del server', error: err.message });
  }
};

exports.getReportsByDrug = async (req, res) => {
    try {
        const stats = await Report.aggregate([
            {
                $group: {
                    _id: '$farmaco.nomeCommerciale',
                    conteggio: { $sum: 1 }
                }
            },
            { $sort: { conteggio: -1 } }
        ]);
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
};


exports.getMonthlyTrendByDrug = async (req, res) => {
    const { farmaco } = req.query;
    if (!farmaco) return res.status(400).json({ message: 'Il parametro farmaco è obbligatorio.' });
    try {
        const trend = await Report.aggregate([
            { $match: { 'farmaco.nomeCommerciale': { $regex: new RegExp(`^${farmaco}$`, 'i') } } },
            { $group: { _id: { anno: { $year: '$createdAt' }, mese: { $month: '$createdAt' } }, conteggio: { $sum: 1 } } },
            { $sort: { '_id.anno': 1, '_id.mese': 1 } }
        ]);
        res.status(200).json(trend);
    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
};

exports.getHotLotsByDrug = async (req, res) => {
    const { farmaco } = req.query;
    if (!farmaco) {
        return res.status(400).json({ message: 'Il parametro farmaco è obbligatorio.' });
    }

    try {
        const hotLots = await Report.aggregate([
            {
                $match: {
                    'farmaco.nomeCommerciale': { $regex: new RegExp(`^${farmaco}$`, 'i') },
                    'farmaco.lotto': { $exists: true, $ne: "" }
                }
            },
            {
                $group: {
                    _id: '$farmaco.lotto',
                    segnalazioniTotali: { $sum: 1 },
                    segnalazioniGravi: {
                        $sum: {
                            $cond: [{ $eq: ['$reazione.gravita', 'Grave'] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { segnalazioniTotali: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json(hotLots);
    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
};

exports.getSymptomCorrelation = async (req, res) => {
    try {
        const filters = req.body.filters || {};
        const matchStage = buildMatchStage(filters);

        const correlation = await Report.aggregate([
            { $match: matchStage },
            { $match: { 'reazione.sintomiCategorizzati.1': { $exists: true } } },
            { $unwind: '$reazione.sintomiCategorizzati' },
            {
                $group: {
                    _id: '$_id',
                    sintomi: { $addToSet: '$reazione.sintomiCategorizzati' }
                }
            },
            { $unwind: '$sintomi' },
            {
                $group: {
                    _id: '$_id',
                    sintomi: { $push: '$sintomi' }
                }
            },
            {
                $project: {
                    coppie: {
                        $filter: {
                            input: {
                                $map: {
                                    input: '$sintomi',
                                    as: 'sintomoA',
                                    in: {
                                        $map: {
                                            input: '$sintomi',
                                            as: 'sintomoB',
                                            in: {
                                                $cond: [
                                                    { $lt: ['$$sintomoA', '$$sintomoB'] },
                                                    ['$$sintomoA', '$$sintomoB'],
                                                    '$$REMOVE'
                                                ]
                                            }
                                        }
                                    }
                                }
                            },
                            as: 'coppia',
                            cond: { $ne: ['$$coppia', []] }
                        }
                    }
                }
            },
            { $unwind: '$coppie' },
            { $unwind: '$coppie' },
            {
                $group: {
                    _id: '$coppie',
                    conteggio: { $sum: 1 }
                }
            },
            {
                $match: {
                    '_id.0': { $exists: true },
                    '_id.1': { $exists: true }
                }
            },
            { $sort: { conteggio: -1 } },
            { $limit: 15 }
        ]);

        res.status(200).json(correlation);
    } catch (err) {
        console.error("ERRORE CORRELAZIONE:", err);
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
};

exports.getDemographicAnalysis = async (req, res) => {
    try {
        const filters = req.body.filters || {};
        const matchStage = buildMatchStage(filters);

        const [byAge, byGender] = await Promise.all([
            Report.aggregate([
                { $match: matchStage },
                {
                    $bucket: {
                        groupBy: "$paziente.eta",
                        boundaries: [0, 18, 40, 65, 120],
                        default: "Sconosciuta",
                        output: {
                            conteggio: { $sum: 1 }
                        }
                    }
                }
            ]),
            Report.aggregate([
                { $match: matchStage },
                { $group: { _id: '$paziente.sesso', conteggio: { $sum: 1 } } }
            ])
        ]);

        res.status(200).json({ byAge, byGender });

    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
};
