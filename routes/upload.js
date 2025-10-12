// upload routes 
const express = require('express');
const {
  uploadSingle,
  uploadMultiple,
  uploadToFolder,
  deleteImage,
  uploadKYCDocuments,
  uploadCarImages
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadSingle: uploadSingleMiddleware, uploadMultiple: uploadMultipleMiddleware, uploadFields } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/single', uploadSingleMiddleware('image'), uploadSingle);
router.post('/multiple', uploadMultipleMiddleware('images', 10), uploadMultiple);
router.post('/folder/:folderName', uploadSingleMiddleware('image'), uploadToFolder);
router.post('/car-images', uploadMultipleMiddleware('carImages', 10), uploadCarImages);
router.delete('/delete', deleteImage);

router.post('/kyc', 
  uploadFields([
    { name: 'drivingLicenseFront', maxCount: 1 },
    { name: 'drivingLicenseBack', maxCount: 1 },
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]), 
  uploadKYCDocuments
);

module.exports = router;