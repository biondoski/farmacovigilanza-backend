const express = require('express');
const router = express.Router();
const { analyzeReport } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');

router.post('/analyze', protect, authorize('Analista', 'Admin'), analyzeReport);

module.exports = router;
