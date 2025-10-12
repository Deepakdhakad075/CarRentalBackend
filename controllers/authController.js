// auth controller 
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { addToBlacklist } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');
const DocumentVerifier = require('../middleware/documentVerification');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kycStatus: user.kycStatus
    }
  });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'user'
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      preferredLocations: req.body.preferredLocations
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// exports.uploadKYC = async (req, res) => {
//   try {
//     const { drivingLicense, aadhaarCard } = req.body;
    
//     const kycData = {};
    
//     if (drivingLicense) {
//       kycData.drivingLicense = {
//         ...drivingLicense,
//         verified: false
//       };
//     }
    
//     if (aadhaarCard) {
//       kycData.aadhaarCard = {
//         ...aadhaarCard,
//         verified: false
//       };
//     }
    
//     kycData.kycStatus = 'pending';

//     const user = await User.findByIdAndUpdate(
//       req.user.id, 
//       kycData, 
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'KYC documents uploaded successfully',
//       data: user
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// };

//upload avatar
// exports.uploadKYC = async (req, res) => {
//   try {
//     const { drivingLicense, aadhaarCard, selfie } = req.body;

//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     const updateData = { kycStatus: 'pending' };

//     // Handle driving license - merge with existing data if partial update
//     if (drivingLicense) {
//       updateData.drivingLicense = {
//         number: drivingLicense.number || user.drivingLicense?.number || '',
//         frontImage: drivingLicense.frontImage || user.drivingLicense?.frontImage || { public_id: '', url: '' },
//         backImage: drivingLicense.backImage || user.drivingLicense?.backImage || { public_id: '', url: '' },
//         verified: false
//       };
//     }

//     // Handle Aadhaar card - merge with existing data if partial update
//     if (aadhaarCard) {
//       updateData.aadhaarCard = {
//         number: aadhaarCard.number || user.aadhaarCard?.number || '',
//         frontImage: aadhaarCard.frontImage || user.aadhaarCard?.frontImage || { public_id: '', url: '' },
//         backImage: aadhaarCard.backImage || user.aadhaarCard?.backImage || { public_id: '', url: '' },
//         verified: false
//       };
//     }

//     // Handle selfie - replace completely
//     if (selfie) {
//       updateData.selfie = {
//         public_id: selfie.public_id || '',
//         url: selfie.url || ''
//       };
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'KYC documents updated successfully',
//       data: updatedUser
//     });

//   } catch (error) {
//     console.error('KYC upload error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// };
// authController.js

// authController.js


exports.uploadKYC = async (req, res) => {
  try {
    const { drivingLicense, aadhaarCard, selfie } = req.body;

    const updateData = { kycStatus: 'pending' };
    const verificationResults = {};

    console.log('Starting KYC verification...');

    // Verify Aadhaar if provided
    if (aadhaarCard && aadhaarCard.number && aadhaarCard.frontImage && aadhaarCard.frontImage.url) {
      console.log('Verifying Aadhaar...');
      const aadhaarResult = await DocumentVerifier.verifyAadhaar(
        aadhaarCard.number, 
        aadhaarCard.frontImage.url
      );
      
      verificationResults.aadhaar = aadhaarResult;
      
      updateData.aadhaarCard = {
        ...aadhaarCard,
        verified: aadhaarResult.isValid,
        verificationDetails: aadhaarResult
      };
    } else if (aadhaarCard) {
      // Just save without verification if no image
      updateData.aadhaarCard = {
        ...aadhaarCard,
        verified: false
      };
    }

    // Verify Driving License if provided
    if (drivingLicense && drivingLicense.number && drivingLicense.frontImage && drivingLicense.frontImage.url) {
      console.log('Verifying Driving License...');
      const dlResult = await DocumentVerifier.verifyDrivingLicense(
        drivingLicense.number,
        drivingLicense.frontImage.url
      );
      
      verificationResults.drivingLicense = dlResult;
      
      updateData.drivingLicense = {
        ...drivingLicense,
        verified: dlResult.isValid,
        verificationDetails: dlResult
      };
    } else if (drivingLicense) {
      // Just save without verification if no image
      updateData.drivingLicense = {
        ...drivingLicense,
        verified: false
      };
    }

    // Handle selfie
    if (selfie) {
      updateData.selfie = selfie;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'KYC documents uploaded and verified',
      data: user,
      verification: verificationResults
    });

  } catch (error) {
    console.error('KYC upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
exports.uploadAvatar = async (req, res) => {
  console.log(req.body, "inside upload avatar");
  try {
    const { avatarUrl, publicId } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required'
      });
    }

    // Get current user
    const user = await User.findById(req.user.id);
    
    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.public_id) {
      try {
        await cloudinary.uploader.destroy(user.avatar.public_id);
        console.log('Old avatar deleted from Cloudinary');
      } catch (deleteError) {
        console.log('Error deleting old avatar:', deleteError.message);
        // Continue even if deletion fails
      }
    }

    // Update user with new avatar URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatar: {
          public_id: publicId || `avatar-${req.user.id}-${Date.now()}`,
          url: avatarUrl
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: updatedUser.avatar
      }
    });

  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating avatar',
      error: error.message
    });
  }
};
// controllers/authController.js


exports.logout = async (req, res) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('Logout attempt for token:', token ? 'token exists' : 'no token');

    // Add token to blacklist if it exists
    if (token) {
      addToBlacklist(token);
      console.log('Token added to blacklist');
    }

    // Clear cookie if using cookies (optional - remove if not using cookies)
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message // Add this for debugging
    });
  }
};
