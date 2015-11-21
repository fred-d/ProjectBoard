var express = require('express');
var router = express.Router();
var config = require('config');

router.get('/dev', function(req, res) {
  req.app.EnsureLoggedin(req, res, function() {
    res.json(req.session);
    req.app.slackbot.postMessageToUser(req.session.user.username, "hello!", {}, function(){});
  });
});

module.exports = router;
