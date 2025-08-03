const express = require('express');
const router = express.Router();
const { getReactionsByDrugAndAge, getMonthlyTrendByDrug, getReportsByDrug, runDynamicAnalysis, getHotLotsByDrug, getSymptomCorrelation, getDemographicAnalysis } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');

router.use(protect, authorize('Analista', 'Admin'));

router.get('/reports-by-drug', getReportsByDrug);
router.get('/reactions-by-drug-age', getReactionsByDrugAndAge);
router.get('/monthly-trend', getMonthlyTrendByDrug);
router.post('/dynamic', runDynamicAnalysis);
router.get('/hot-lots', getHotLotsByDrug); // <-- Aggiungi questa rotta
router.post('/symptom-correlation', getSymptomCorrelation); // <-- Aggiungi
router.post('/demographics', getDemographicAnalysis); // <-- Aggiungi

module.exports = router;
