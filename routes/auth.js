// auth routes 
const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  uploadKYC,
  logout,
  uploadAvatar
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('phone').isMobilePhone().withMessage('Please include a valid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required')
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.post('/kyc', protect, uploadKYC);
router.post('/logout', protect, logout);
router.post('/avatar', protect, uploadAvatar);
module.exports = router;