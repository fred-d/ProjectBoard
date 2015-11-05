var express = require('express');
var router = express.Router();

router.get('/admin/login(/modal)?', function(req, res, next) {
    var modalMode = req.originalUrl == '/admin/login/modal';

    res.render('login', {title: 'Log In', modal: modalMode});
});

router.post('/admin/login', function(req, res, next) {
    res.cookie("_pbses", 'asdfasdf123'); //Set a session cookie
    res.send('You logged in!');
});

router.get('/admin/logout', function(req, res) {
    res.clearCookie('_pbses');

    if(!req.xhr)res.redirect("/home");
    else res.json({status: 'success'});

});

module.exports = router;