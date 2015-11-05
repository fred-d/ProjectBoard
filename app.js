var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var projects = require('./routes/projects');
var manage = require('./routes/manage');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

//Add all the routes into the app
app.use(['/','/home'], routes);
app.use(projects);
app.use(manage);

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
        })
    }
});

module.exports = app;