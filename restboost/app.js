const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const bodyParser = require('body-parser');
const apiBoost = require("./app/api/boostapi");
const db = require("./models");
const Sequelize = require('sequelize');

//swagger

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    info: {
      title: 'ET APP API', // Title (required)
      version: '1.0.0', // Version (required)
    },
  },
  // Path to the API docs
  apis: ['./app/api/swagger.js'],
};

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = swaggerJSDoc(options);



const app = express();
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

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
