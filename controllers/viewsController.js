const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.alert = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert =
      "Your booking was succesful! Please check your email for a confirmation. If Your boooking doesn't show immediatly, please come back later. ";
  }
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  //1) get tour data from collection
  const tours = await Tour.find();

  //2) build template

  //3) render that template using the tour data from step 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) get tour data, for requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  //2) build template

  //3) render that template using the tour data from step 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: `Log into Your Account`,
  });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signup', {
    title: `Signup for Your Account`,
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: `Your account`,
    user: req.user,
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1)find all abookings
  const bookings = await Booking.find({ user: req.user.id });

  //2)find tours with returned ID
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: `My Tours`,
    user: req.user,
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).render('account', {
    title: `Your account`,
    user: updatedUser,
  });
});
