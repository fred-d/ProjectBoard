var express = require('express');
var router = express.Router();

router.get('/admin', function(req, res) {
    //If the user doesn't have a session yet, make them log in
    if(typeof req.cookies._pbses == 'undefined') res.redirect('/admin/login'); //TODO Verify an authentic session token
    else res.send("Admin Panel!"); //TODO Add a real page here
});

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

    if(req.xhr) res.json({status: 'success'});
    else {
        if(typeof req.query.redir == 'undefined') res.redirect("/home");
        else res.redirect(req.query.redir);
    }
});

module.exports = router;