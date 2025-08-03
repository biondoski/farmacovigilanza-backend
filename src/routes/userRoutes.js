const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');
const { getUsers, deleteUser, createUser, updateUser } = require('../controllers/userController');

router.use(protect, authorize('Admin'));

router.route('/')
    .get(getUsers)
    .post(createUser);
router.route('/:id').delete(deleteUser).put(updateUser);

module.exports = router;
