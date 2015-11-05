var express = require('express');
var router = express.Router();

/* GET home listing. */
router.get(['/','/home'], function(req, res, next) {
  req.app.locals.title = 'ProjectBoard';
  res.render('index');
});

module.exports = router;