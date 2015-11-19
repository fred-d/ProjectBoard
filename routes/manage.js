var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var config = require('config');
var r = require('rethinkdb');

router.get('/dev', function(req, res, next) {
  req.app.EnsureLoggedin(req, res, function() {
    res.json(req.session);
  });
});

router.get('/login(/modal)?', function(req, res) {

    var modalMode = req.originalUrl == '/admin/login/modal';
    res.render('login', {title: 'Log In', modal: modalMode});
});

router.post('/login', function(req, res, next){
  console.log(bcrypt.hashSync(req.body.password, config.get('crypto.hashIterations')));

  r.connect(config.get('database'), function(err, conn) {
    if(err) return res.flash('danger', 'Database connection failure. Please try again later.').redirect('/login');

    r.table('users').filter({
      'username': req.body.username,
    }).run(conn, function(err, cursor){
      if(err) return next(Error(err));

        cursor.toArray(function(err, results){
          if(err) return next(Error(err));

          if(results.length != 1) {

            res.flash('warning', 'Incorrect username or password. Try typing better.');
            res.redirect('/login');
          } else {
            console.log(results);

            if(bcrypt.compareSync(req.body.password, results[0].password)){
              req.session.user = {
                id: results[0].id,
                name: results[0].name,
                username: results[0].username
              };
              res.redirect('/dev');
            } else {
              res.flash('warning', "Incorrect password. Did you <a href=\"/login/reset\">forget it</a>?");
              res.redirect('/login');
            }
          }
        });
    });
  });
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/register', function(req, res, next) {
  r.connect(config.get('database'), function(err, conn) { // First, we open up a connection
    r.table('users').getAll(req.body.email, {index:'email'}).run(conn, function(err, cursor){ // Next, let's see if that email address is taken yet.
      if(err) return next(Error(err));

      cursor.toArray(function(err, result) {
        if(err) return next(Error(err));

        if(result.length != 0) {
          res.flash('warn', 'That email address is already taken.'); // If so, prepare to warn the user and keep checking requirements.
        }

        r.table('users').getAll(req.body.username, {index:'username'}).run(conn, function(err, cursor){ // Is the username taken already?
          if(err) return next(Error(err));

          cursor.toArray(function(err, result){
            if(err) return next(Error(err));

            if(result.length != 0) {
              res.flash('warn', 'That username is already taken.'); // Prepare to warn the user and keep checking requirement.
            }

            if(res.locals.flash == undefined) { // If any flashes exist, we know the user need to enter in different info.
              res.redirect('/register');
            } else {
              r.table('users').insert({ // Otherwise, let's create an account!
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, config.get('crypto.hashIterations')),
                name: req.body.fullname,
                email: req.body.email,
                creationDate: new Date(),
                apikey: crypto.randomBytes(64).toString('hex'),
                approved: false
              }).run(conn, function(err, response) {
                if(err) return next(Error(err));
                res.flash('info', 'Account successfully created! Please wait for an administrator to approve you account');
                res.redirect('login');
              });
            }
          });
        });
      });
    });
  });
});

module.exports = router;
