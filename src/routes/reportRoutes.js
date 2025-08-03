const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');

const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  exportReports
} = require('../controllers/reportController');

router.use(protect);

router.route('/')
  .post(createReport)
  .get(getReports);

router.get('/export', protect, authorize('Analista', 'Admin'), exportReports);

router.route('/:id')
  .get(getReportById)
  .put(updateReport)
  .delete(deleteReport);



module.exports = router;
