const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');
const { getUsers, deleteUser, createUser, updateUser } = require('../controllers/userController');

// Proteggi tutte le rotte e autorizza solo l'Admin
router.use(protect, authorize('Admin'));

router.route('/')
    .get(getUsers)
    .post(createUser);
router.route('/:id').delete(deleteUser).put(updateUser);

module.exports = router;
