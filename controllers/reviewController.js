const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');

exports.setTourAndUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.restrictToUser = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne({ user: req.user.id });
  if (!booking) {
    return next(
      new AppError('Please book this tour before creating a review!', 404),
    );
  }
  next();
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
