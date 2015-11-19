var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
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
      'password': bcrypt.hashSync(req.body.password, config.get('crypto.hashIterations'))
    }).run(conn, function(err, cursor){
      if(err) return next(Error(err));

        cursor.toArray(function(err, results){
          if(err) return next(Error(err));

          if(results.length != 1) {

            res.flash('warning', 'Incorrect username or password. Try typing better.');
            res.redirect('/login');
          } else {
            console.log(results);

            req.session.user = {
              id: results[0].id,
              name: results[0].name,
              username: results[0].username
            };
            res.redirect('/dev');
          }
        });
    });
  });
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/register', function(req, res, next) {
  r.connect(config.get('database'), function(err, conn) {
    r.table('users')
  });
});

module.exports = router;
