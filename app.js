var express = require('express');
var session = require('express-session');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('config');
var flash = require('flash');
var slackbot = require('slackbots');

var home = require('./routes/index');
var projects = require('./routes/projects');
var project = require('./routes/project');
var manage = require('./routes/manage');
var api = require('./routes/api');
var login = require('./routes/login');

var app = express();

app.use(session({
  secret: config.get('crypto.secret'),
  resave: true,
  name: '_pbsid',
  saveUninitialized: true
}));
app.use(flash());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.EnsureLoggedin = function (req, res, valid) {
  if (req.session.user == undefined) {
    req.flash('warning', "Please log in before you complete this action");
    req.session.requestedPath = req.originalUrl;
    res.redirect('/login');
  } else valid();
};

app.EnsureAdmin = function () {
  console.log('Checking to see is user is admin...');
};

/* Locals Middleware: adds some context that gets past down to every template */
app.use(function (req, res, next) {
  app.locals = {
    user: req.session.user,

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
app.use(login);

//Add in the api route handler
app.use(api);

if(config.has('3rd-party.slack.token')) {
  var bot = new slackbot({
    token: config.get('3rd-party.slack.token'),
    name: "Project Board"
  });
  bot.on('start', function() {
    console.info('SlackBot has been enabled');
    app.slackbot = bot;
    bot.postMessageToChannel('projectboard-log', 'i\'m back online :D', {
      icon_url: 'https://projects.tylerwebdev.io/images/logo-small.png'
    }, function () {
    });
  });
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
app.use(function (err, req, res, next) {
  res.status(err.status || 500);

  if (err.status == 404) {
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
