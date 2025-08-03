const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');

router.get('/summary', protect, authorize('Analista', 'Admin'), getDashboardSummary);

module.exports = router;
