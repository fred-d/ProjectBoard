var express = require('express');
var session = require('express-session');
var sessionRDBConnector = require('session-rethinkdb');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('config');

var home = require('./routes/index');
var projects = require('./routes/projects');
var project = require('./routes/project');
var manage = require('./routes/manage');
var api = require('./routes/api');


var app = express();
app.use(session({
  secret: config.get('crypto.secret'),
  //store: new sessionRDBConnector(config.get('database')),
  resave: true,
  name: '_pbsid',
  saveUninitialized: true
}));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

/* Locals Middleware: adds some context that gets past down to every template */
app.use(function(req, res, next) {
    app.locals = {
        app: {
            version: 0.1
        },
        page: {
            path: req.path
        }
    };
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//Add all the routes into the app
app.use(home);
app.use(projects);
app.use(project);
app.use(manage);

//Add in the api route handler
app.use(api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    if(err.status == 404) {
        res.render('404');
    } else {
        res.render('error', {
            message: err.message,
            error: err
        });
    }
    next();
});

module.exports = app;
