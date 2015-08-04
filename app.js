var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , express = require('express')
  , expressValidator = require('express-validator')
  , favicon = require('serve-favicon')
  , flash = require('connect-flash')
  , fs = require('fs')
  , logger = require('morgan')
  , path = require('path')
  , parseurl = require('parseurl')

  , session = require('express-session')
  , SessionStore = require('session-rethinkdb')(session)
  
  , passwordless = require('./controllers/passwordless')

  , api = require('./routes/api')
  , routes = require('./routes/index')
  , users = require('./routes/users')

  , app = express()
  , config = require('./config')
  ;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// static serving
app.use(express.static(path.join(__dirname, 'public')));
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator({
  customSanitizers: {
    toLowerCase: function (str) { return str.toLowerCase(); }
  }
}));

app.use(flash());

// sessions
app.use(session({
  secret: config.express.secret,
  //store: new SessionStore({servers:[config.rethinkdb]}),
  resave: false,
  saveUninitialized: false,
}));

// authentication
passwordless(app);

// attach relevant routes to url bases
app.use('/', routes);
app.use('/api/v1/', api);
app.use('/users', users);

// error handling middleware
app.use(handle404);

if (app.get('env') === 'development')
  app.use(handleDevError);
app.use(handleError);


/*
 * Page-not-found middleware
 * catch 404 and forward to error handler
 */
function handle404(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}

/*
 * Development error handler
 * Will print stacktrace
 */
function handleDevError(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
}

/*
 * Production error handler
 * No stacktraces leaked to user
 */
function handleError(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
}


module.exports = app;

