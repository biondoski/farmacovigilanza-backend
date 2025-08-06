const Report = require('../models/Report');

exports.getDashboardSummary = async (req, res) => {
  try {
    const [
      totalReports,
      reportsBySeverity,
      top5Drugs,
      last5Reports,
      reportLocations,
      totalGraveReports,
      reportsBySource,
      reportsByGender
    ] = await Promise.all([
      Report.countDocuments(),
      Report.aggregate([
        { $group: { _id: '$reazione.esito', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Report.aggregate([
        { $unwind: '$farmaciSospetti' },
        { $group: { _id: '$farmaciSospetti.nomeCommerciale', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Report.find().sort({ createdAt: -1 }).limit(5).select('farmaciSospetti reazione.esito createdAt'),
      Report.find({ 'localita.coordinates': { $exists: true, $ne: [] } }).select('localita farmaciSospetti reazione.gravita'),
      Report.countDocuments({ 'reazione.gravita.isGrave': true }),
      Report.aggregate([
        { $group: { _id: '$tipoSegnalazione', count: { $sum: 1 } } }
      ]),
      Report.aggregate([
        { $group: { _id: '$paziente.sesso', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      totalReports,
      reportsBySeverity,
      top5Drugs,
      last5Reports,
      reportLocations,
      totalGraveReports,
      reportsBySource,
      reportsByGender
    });

  } catch (err) {
    console.error('ERRORE DASHBOARD:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
};
