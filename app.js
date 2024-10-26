var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var rateLimit = require('express-rate-limit');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();
var multer = require('multer');
var fs = require('fs');
var axios = require('axios');
var mongoose = require("mongoose");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Add rate limiting to protect against brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per `window` (here, per 15 minutes)
});
app.use(limiter);

mongoose.set('runValidators', true);
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.once('open', () => {
  console.log(`Well done! Connected to MongoDB database: ${mongoose.connection.name}`);
}).on('error', error => {
  console.log("Oops! database connection error:" + error);
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
