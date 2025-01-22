const path = require('path');
const express = require('express');
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoSanitize = require('express-mongo-sanitize');
// eslint-disable-next-line import/no-extraneous-dependencies
const xss = require('xss-clean');
// eslint-disable-next-line import/no-extraneous-dependencies
const hpp = require('hpp');
// eslint-disable-next-line import/no-extraneous-dependencies
const cookieParser = require('cookie-parser');
// eslint-disable-next-line import/no-extraneous-dependencies
const bodyParser = require('body-parser');
// eslint-disable-next-line import/no-extraneous-dependencies
const compression = require('compression');
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//1) GLOBAL Miidlewares
//implement CORS
app.use(cors());
//Access-control-Allow-origin to all
//api.natours.com , frontend  natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }));

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

//Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//SET SECURITY HTTP HEADERS
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Allow the current domain
        scriptSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          'https://api.mapbox.com',
          'https://js.stripe.com',
        ], // Allow external scripts
        styleSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          'https://fonts.googleapis.com',
          'https://api.mapbox.com',
        ], // Allow external styles
        connectSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://js.stripe.com',
        ], // Allow API calls
        imgSrc: [
          "'self'",
          'data:',
          'https://cdn.jsdelivr.net',
          'https://api.mapbox.com',
        ], // Allow images
        fontSrc: ["'self'", 'https://fonts.gstatic.com'], // Allow Google Fonts
        frameSrc: [
          "'self'",
          'https://js.stripe.com', // Explicitly allow Stripe for iframe embedding
        ], // Allow iframes from Stripe
        workerSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://js.stripe.com',
          'blob:',
        ], // Allow Web Workers
      },
    },
  }),
);

//Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//LIMIT REQUEST FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,please try again in an hour!',
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

//Body Parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  }),
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data Sanitization against NOSQL query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression());

//Test middlewares
app.use((req, res, next) => {
  req.requsetTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//3)routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.get('*.map', (req, res) => {
  res.status(404).send('Source map not found');
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
