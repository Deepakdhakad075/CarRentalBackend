// admin controller 
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCars = await Car.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingKYCs = await User.countDocuments({ kycStatus: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCars,
        totalBookings,
        pendingKYCs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};