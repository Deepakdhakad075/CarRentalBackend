// car controller
const Car = require("../models/Car");
const { validationResult } = require("express-validator");

exports.getCars = async (req, res) => {
  try {
    const {
      city,
      carType,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      seats,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filter = { availability: true, isVerified: true };

    if (city) filter["location.city"] = new RegExp(city, "i");
    if (carType) filter.carType = carType;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (seats) filter.seats = { $gte: parseInt(seats) };

    let priceFilter = {};
    if (minPrice) priceFilter.$gte = parseInt(minPrice);
    if (maxPrice) priceFilter.$lte = parseInt(maxPrice);

    if (Object.keys(priceFilter).length > 0) {
      filter["pricing.daily"] = priceFilter;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const cars = await Car.find(filter)
      .populate("owner", "name phone rating")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Car.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: cars.length,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
      data: cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate(
      "owner",
      "name phone rating joinedAt"
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.createCar = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    req.body.owner = req.user.id;
    const car = await Car.create(req.body);

    res.status(201).json({
      success: true,
      message: "Car created successfully",
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.updateCar = async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    if (car.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this car",
      });
    }

    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Car updated successfully",
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    if (car.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this car",
      });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getMyCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user.id });

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// exports.searchCarsByLocation = async (req, res) => {
//   try {
//     const { lat, lng, radius = 10, city } = req.query;

//     let filter = { availability: true, isVerified: true };

//     if (lat && lng) {
//       filter['location.coordinates'] = {
//         $near: {
//           $geometry: {
//             type: 'Point',
//             coordinates: [parseFloat(lng), parseFloat(lat)]
//           },
//           $maxDistance: radius * 1000
//         }
//       };
//     } else if (city) {
//       filter['location.city'] = new RegExp(city, 'i');
//     }

//     const cars = await Car.find(filter)
//       .populate('owner', 'name phone rating')
//       .limit(50);

//     res.status(200).json({
//       success: true,
//       count: cars.length,
//       data: cars
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// };
// exports.searchCarsByLocation = async (req, res) => {
//   try {
//     const {
//       lat,
//       lng,
//       radius = 10,
//       city,
//       fuelType,
//       models,
//       transmission,
//       seats,
//     } = req.query;

//     let filter = { availability: true, isVerified: true };

//     // 🛢 FuelType Filter (array or single)
//     if (fuelType) {
//       const fuelArray = fuelType.split(",");
//       filter.fuelType = { $in: fuelArray };
//     }

//     // 🚗 Model Filter
//     if (models) {
//       filter.model = { $in: models.split(",") };
//     }

//     // ⚙ Transmission Filter
//     if (transmission) {
//       filter.transmission = { $in: transmission.split(",") };
//     }

//     // 🪑 Seats Filter (convert to numbers)
//     if (seats) {
//       const seatsArray = seats.split(",").map(Number);
//       filter.seats = { $in: seatsArray };
//     }

//     // 🌎 Location Filter
//     if (lat && lng) {
//       filter["location.coordinates"] = {
//         $near: {
//           $geometry: {
//             type: "Point",
//             coordinates: [parseFloat(lng), parseFloat(lat)],
//           },
//           $maxDistance: radius * 1000,
//         },
//       };
//     } else if (city) {
//       filter["location.city"] = new RegExp(`^${city}\\b`, "i");
//     }

//     const cars = await Car.find(filter)
//       .populate("owner", "name phone rating")
//       .limit(50);

//     res.status(200).json({
//       success: true,
//       count: cars.length,
//       data: cars,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };
// exports.searchCarsByLocation = async (req, res) => {
//   try {
//     const {
//       city,
//       fuelType,
//       segment,
//       brand,
//       transmissionType,
//       seatingCapacity,
//       luggageCapacity,
//       priceSort,
//     } = req.query;

//     let filter = { availability: true, isVerified: true };

//     // ✅ City filter
//     if (city) filter['location.city'] = new RegExp(city, 'i');

//     // ✅ Fuel type
//     if (fuelType) filter.fuelType = { $in: fuelType.split(',') };

//     // ✅ Segment / carType
//     if (segment) filter.carType = { $in: segment.split(',') };

//     // ✅ Models
//     if (models) filter.model = { $in: models.split(',') };

//     // ✅ Transmission
//     if (transmissionType) filter.transmission = { $in: transmissionType.split(',') };

//     // ✅ Seats
//     if (seatingCapacity) filter.seats = { $in: seatingCapacity.split(',').map(Number) };

//     // ✅ Luggage capacity (if stored, otherwise skip)
//     if (luggageCapacity) filter.luggageCapacity = { $in: luggageCapacity.split(',').map(Number) };

//     let query = Car.find(filter).populate('owner', 'name phone rating');

//     // ✅ Sorting
//     if (priceSort === 'lowToHigh') query = query.sort({ 'pricing.daily': 1 });
//     else if (priceSort === 'highToLow') query = query.sort({ 'pricing.daily': -1 });

//     // ✅ Limit
//     query = query.limit(50);

//     const cars = await query.exec();

//     res.status(200).json({
//       success: true,
//       count: cars.length,
//       data: cars
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// };
exports.searchCarsByLocation = async (req, res) => {
  try {
    const {
      city,
      fuelType,
      segment,
      brand, // ✅ brand filter
      transmissionType,
      seatingCapacity,
      luggageCapacity,
      priceSort,
    } = req.query;

    let filter = { availability: true, isVerified: true };

    // ✅ City filter (case-insensitive)
    if (city) filter['location.city'] = new RegExp(city, 'i');

    // ✅ Fuel type
    if (fuelType) filter.fuelType = { $in: fuelType.split(',') };

    // ✅ Segment / carType
    if (segment) filter.carType = { $in: segment.split(',') };

    // ✅ Brand filter
    if (brand) filter.brand = { $in: brand.split(',') };

    // ✅ Transmission
    if (transmissionType) filter.transmission = { $in: transmissionType.split(',') };

    // ✅ Seats
    if (seatingCapacity) filter.seats = { $in: seatingCapacity.split(',').map(Number) };

    // ✅ Luggage capacity (if stored)
    if (luggageCapacity) filter.luggageCapacity = { $in: luggageCapacity.split(',').map(Number) };

    // ✅ Query & populate owner
    let query = Car.find(filter).populate('owner', 'name phone rating');

    // ✅ Sorting
    if (priceSort === 'lowToHigh') query = query.sort({ 'pricing.daily': 1 });
    else if (priceSort === 'highToLow') query = query.sort({ 'pricing.daily': -1 });

    // ✅ Limit
    query = query.limit(50);

    const cars = await query.exec();

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};


// VERIFY OR REJECT CAR (ADMIN ONLY)
exports.verifyCar = async (req, res) => {
  try {
    const { status } = req.body; // expected values: 'verify' or 'reject'

    // check if admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can verify or reject cars",
      });
    }

    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    if (status === "verify") {
      car.isVerified = true;
    } else if (status === "reject") {
      car.isVerified = false;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Use "verify" or "reject"',
      });
    }

    await car.save();

    res.status(200).json({
      success: true,
      message: `Car ${
        status === "verify" ? "verified" : "rejected"
      } successfully`,
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
