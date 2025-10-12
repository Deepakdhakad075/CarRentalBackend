// booking model 
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  pickupLocation: {
    address: String,
    city: String,
    coordinates: { lat: Number, lng: Number }
  },
  dropLocation: {
    address: String,
    city: String,
    coordinates: { lat: Number, lng: Number }
  },
  totalDays: Number,
  totalHours: Number,
  totalAmount: {
    type: Number,
    required: true
  },
  securityDeposit: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cash']
  },
  transactionId: String,
  cancellationReason: String,
  adminNotes: String
}, {
  timestamps: true
});

bookingSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.totalHours = Math.ceil(diffTime / (1000 * 60 * 60));
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);