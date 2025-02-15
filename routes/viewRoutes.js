const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authenticationController');
// const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use(viewController.alert);

router.get('/', authController.isLoggedIn, viewController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', viewController.getSignUpForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get(
  '/my-tours',
  // bookingController.createBookingCheckout,
  authController.protect,
  viewController.getMyTours,
);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData,
);

module.exports = router;
