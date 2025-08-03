const Report = require('../models/Report');

exports.getDashboardSummary = async (req, res) => {
  try {
    const [
      totalReports,
      reportsBySeverity,
      top5Drugs,
      last5Reports,
      reportLocations,
      totalGraveReports
    ] = await Promise.all([
      Report.countDocuments(),
      Report.aggregate([
        { $group: { _id: '$reazione.gravita', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Report.aggregate([
        { $group: { _id: '$farmaco.nomeCommerciale', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Report.find().sort({ createdAt: -1 }).limit(5).select('farmaco.nomeCommerciale reazione.gravita createdAt'),
      Report.find({ 'localita.coordinates': { $exists: true, $ne: [] } }).select('localita farmaco.nomeCommerciale reazione.gravita'),
      Report.countDocuments({ 'reazione.gravita': 'Grave' })
    ]);

    res.status(200).json({
      totalReports,
      reportsBySeverity,
      top5Drugs,
      last5Reports,
      reportLocations,
      totalGraveReports
    });

  } catch (err) {
  }
};
