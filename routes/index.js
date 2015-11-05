var express = require('express');
var router = express.Router();

/* GET home listing. */
router.get(['/','/home'], function(req, res, next) {
  res.render('index', { title: 'ProjectBoard' });
});

module.exports = router;