var express = require('express');
var router = express.Router();
var passport = require('passport');
var pLocalStrat = require('passport-local').Strategy;
var pGithubStrat = require('passport-github2').Strategy;
var config = require('config');

passport.use(new pGithubStrat({
    clientID: config.get('auth.github.client-id'),
    clientSecret: config.get('auth.github.client-secret'),
    callbackURL: "https://projects.tylerwebdev.io/login/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

router.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));
router.get('/auth/local', passport.authenticate('local'));

router.get('/auth/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/?success');
  });

router.get('/login(/modal)?', function(req, res) {
    var modalMode = req.originalUrl == '/admin/login/modal';

    res.render('login', {title: 'Log In', modal: modalMode});
});

module.exports = router;
