const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Add this missing declaration at the top
const tokenBlacklist = new Set();

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token, "token inside auth middleware");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Check if token is blacklisted (add this check)
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated. Please login again.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    console.log("nexttttttttttttt");
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

exports.addToBlacklist = (token) => {
  try {
    tokenBlacklist.add(token);
    
    // Optional: Remove from blacklist after token expiration
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiresIn = decoded.exp * 1000 - Date.now();
      setTimeout(() => {
        tokenBlacklist.delete(token);
      }, expiresIn);
    }
  } catch (error) {
    console.error('Error adding token to blacklist:', error);
  }
};