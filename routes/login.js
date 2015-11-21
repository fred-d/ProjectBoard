var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var config = require('config');
var r = require('rethinkdb');

router.get('/login(/modal)?', function (req, res) {
  var path;
  if (req.session.requestedPath == undefined) path = '/';
  else path = req.session.requestedPath;

  var modalMode = req.originalUrl == '/admin/login/modal';
  res.render('login', {title: 'Log In', modal: modalMode, requestedPath: path});
});

router.post('/login', function (req, res, next) {
  r.connect(config.get('database'), function (err, conn) {
    if (err) return res.flash('danger', 'Database connection failure. Please try again later.').redirect('/login');

    r.table('users').filter({
      'username': req.body.username
    }).run(conn, function (err, cursor) {
      if (err) return next(Error(err));

      cursor.toArray(function (err, results) {
        if (err) return next(Error(err));

        if (results.length != 1) {
          res.flash('warning', 'Incorrect username or password. Try typing better.');
          res.redirect('/login');
        } else {
          if (bcrypt.compareSync(req.body.password, results[0].password)) {
            if (results[0].verified) {
              req.session.user = {
                id: results[0].id,
                name: results[0].name,
                username: results[0].username
              };
              if (req.session.requestedPath != undefined) {
                res.redirect(req.session.requestedPath);
              } else res.redirect('/');
            } else {
              req.flash('warning', 'Please verify your email address before you log in!');
              res.redirect('/login');
            }
          } else {
            res.flash('warning', "Incorrect password. Did you <a href=\"/login/reset\">forget it</a>?");
            res.redirect('/login');
          }
        }
      });
    });
  });
});

router.get('/login/verify/:id', function (req, res) {
  if(req.get('User-Agent').split(' ').indexOf('Slackbot') +
     req.get('User-Agent').split(' ').indexOf('Slack-ImgProxy') +
     req.get('User-Agent').split(' ').indexOf('Slackbot-LinkExpanding')
    > 0) {
    res.send("Click the link to verify your ProjectBoard account. Or, if you never requested an account, simply " +
      "ignore this message.")
  } else {
    r.connect(config.get('database'), function (err, conn) {
      r.table('users').get(req.params.id).update({verified: true}).run(conn, function (err, response) {
        if(err) console.log(err);

        if (response.replaced == 1) {
          req.flash('info', 'You\'ve successfully verified your email! Feel free to log in now.');

          r.table('users').get(req.params.id).run(conn, function(err, response) {
            req.app.slackbot.postMessageToUser(response.username, "Welcome to ProjectBoard! :)", {}, function(){});
          });
        } else {
          req.flash('danger', 'An error accoured. Please contact an administrator if you cannot log into your acount');
        }
        res.redirect('/login');
      });
    });
  }
});

router.get('/logout', function (req, res) {
  delete req.session.user;
  req.flash('info', 'You have been logged out');
  res.redirect('/login');
});

router.get('/register', function (req, res) {
  res.render('register');
});

router.post('/register', function (req, res, next) {
  r.connect(config.get('database'), function (err, conn) { // First, we open up a connection
    r.table('users').getAll(req.body.email, {index: 'email'}).run(conn, function (err, cursor) { // Next, let's see if that email address is taken yet.
      if (err) return next(Error(err));

      cursor.toArray(function (err, result) {
        if (err) return next(Error(err));

        if (result.length != 0) {
          res.flash('warning', 'That email address is already taken.');
          res.redirect('/register');
        } else {
          r.table('users').getAll(req.body.username, {index: 'username'}).run(conn, function (err, cursor) { // Is the username taken already?
            if (err) return next(Error(err));

            cursor.toArray(function (err, result) {
              if (err) return next(Error(err));

              if (result.length != 0) {
                res.flash('warning', 'That username is already taken.'); // Prepare to warn the user and keep checking requirement.
                res.redirect('/register');
              } else {
                r.table('users').insert({ // Otherwise, let's create an account!
                  username: req.body.username,
                  password: bcrypt.hashSync(req.body.password, config.get('crypto.hashIterations')),
                  name: req.body.fullname,
                  email: req.body.email,
                  creationDate: new Date(),
                  apikey: crypto.randomBytes(32).toString('hex'),
                  verified: false,
                  role: 'member'
                }).run(conn, function (err, response) {
                  if (err) return next(Error(err));

                  res.flash('info', 'Account successfully created! Check your slack for a verification link.');
                  res.redirect('login');

                  var message = "Hey, "+req.body.fullname.split(' ')[0]+"! Welcome to ProjectBoard.\nClick this link " +
                    "to verify your account: https://project.tylerwebdev.io/login/verify/"+response.generated_keys[0];
                  req.app.slackbot.postMessageToUser(req.body.username, message, {}, function(){});
                });
              }
            });
          });
        }
      });
    });
  });
});

module.exports = router;
