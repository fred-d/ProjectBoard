var express = require('express');
var router = express.Router();
var projectController = require('./api/project');

router.all('/api(*)?', function(req, res, next){
    console.log('api hit!');
    next();
});

router.all('/api/project(*)?', projectController);

module.exports = router;