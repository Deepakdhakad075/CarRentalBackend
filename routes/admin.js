// admin routes 
const express = require('express');
const { getDashboardStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { verifyCar } = require('../controllers/carController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.put('/:id/verify', verifyCar);
module.exports = router;