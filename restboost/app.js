var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bodyParser = require('body-parser');
var apiBoost = require("./app/api/boostapi");
var db = require("./models");
var Sequelize = require('sequelize');
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


apiBoost(app,db,Sequelize);


// view engine setup
//
app.set('port', (process.env.PORT || 80));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// set body-parser
app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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



db.sequelize.sync().then(() => {

	app.listen(80, () => console.log("App listening on port 80!"));

});


module.exports = app;
