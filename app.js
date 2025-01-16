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

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//1) GLOBAL Miidlewares

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
        ], // Allow external scripts from cdn.jsdelivr.net
        styleSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          'https://fonts.googleapis.com',
          'https://api.mapbox.com', // Allow Mapbox styles
        ], // Allow external styles
        connectSrc: ["'self'", 'http://localhost:3000', 'ws://localhost:64320'], // Allow connections to the same domain (API calls)
        imgSrc: [
          "'self'",
          'data:',
          'https://cdn.jsdelivr.net',
          'https://api.mapbox.com',
        ], // Allow images from the current domain or Mapbox
        fontSrc: ["'self'", 'https://fonts.gstatic.com'], // Allow fonts from Google Fonts
        workerSrc: ["'self'", 'https://api.mapbox.com', 'blob:'], // Allow Web Workers from Mapbox and blob URIs
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

app.get('*.map', (req, res) => {
  res.status(404).send('Source map not found');
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
