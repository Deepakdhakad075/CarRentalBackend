// car model 
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: [true, 'Please add car brand'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Please add car model'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Please add manufacturing year'],
    min: [1990, 'Year must be after 1990'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in future']
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please add vehicle number'],
    unique: true,
    uppercase: true
  },
  color: {
    type: String,
    required: [true, 'Please add car color']
  },
  carType: {
    type: String,
    enum: ['SUV', 'Hatchback', 'Sedan', 'Luxury', 'EV', 'Convertible', 'Minivan'],
    required: true
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
    required: true
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic'],
    required: true
  },
  seats: {
    type: Number,
    required: true,
    min: 2,
    max: 12
  },
  features: [{
    type: String,
    enum: ['AC', 'Bluetooth', 'GPS', 'Sunroof', 'Leather Seats', 'Backup Camera', 'USB Port', 'Keyless Entry']
  }],
  images: [{
    public_id: String,
    url: String
  }],
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: { lat: Number, lng: Number }
  },
  pricing: {
    hourly: { type: Number, required: true, min: 0 },
    daily: { type: Number, required: true, min: 0 },
    weekly: { type: Number, required: true, min: 0 },
    monthly: { type: Number, required: true, min: 0 }
  },
  securityDeposit: {
    type: Number,
    required: true,
    min: 0
  },
  availability: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  documents: {
    rcBook: { public_id: String, url: String },
    insurance: { public_id: String, url: String },
    pollutionCertificate: { public_id: String, url: String }
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  }
}, {
  timestamps: true
});

carSchema.index({ 'location.city': 1, availability: 1 });
carSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Car', carSchema);