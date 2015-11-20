var express = require('express');
var router = express.Router();
var config = require('config');

router.get('/dev', function(req, res) {
  req.app.EnsureLoggedin(req, res, function() {
    res.json(req.session);

  });
});

module.exports = router;
