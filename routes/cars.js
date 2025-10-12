// cars routes 
const express = require('express');
const {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  getMyCars,
  searchCarsByLocation
} = require('../controllers/carController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

const carValidation = [
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('vehicleNumber').notEmpty().withMessage('Vehicle number is required'),
  body('carType').isIn(['SUV', 'Hatchback', 'Sedan', 'Luxury', 'EV', 'Convertible', 'Minivan']).withMessage('Valid car type is required'),
  body('fuelType').isIn(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']).withMessage('Valid fuel type is required'),
  body('transmission').isIn(['Manual', 'Automatic']).withMessage('Valid transmission type is required'),
  body('seats').isInt({ min: 2, max: 12 }).withMessage('Valid seats number is required'),
  body('pricing.hourly').isFloat({ min: 0 }).withMessage('Valid hourly price is required'),
  body('pricing.daily').isFloat({ min: 0 }).withMessage('Valid daily price is required'),
  body('pricing.weekly').isFloat({ min: 0 }).withMessage('Valid weekly price is required'),
  body('pricing.monthly').isFloat({ min: 0 }).withMessage('Valid monthly price is required'),
  body('securityDeposit').isFloat({ min: 0 }).withMessage('Valid security deposit is required')
];

router.route('/')
  .get(getCars)
  .post(protect, authorize('car_owner', 'admin'), carValidation, createCar);

router.get('/search/location', searchCarsByLocation);
router.get('/owner/my-cars', protect, authorize('car_owner', 'admin'), getMyCars);

router.route('/:id')
  .get(getCar)
  .put(protect, authorize('car_owner', 'admin'), updateCar)
  .delete(protect, authorize('car_owner', 'admin'), deleteCar);

module.exports = router;