var express = require('express');
var r = require('rethinkdb');
var router = express.Router();

var projectController = require('./api/project');

router.all('/api(*)?', function(req, res, next){
    console.log('api hit!');

    r.connect({host: '159.203.246.210', port: 28015}, function(err, conn) {
        if (err) {
            res.status = 500;
            return res.json({success: false, reason: 'Database Connection Error'});
        }
        r.db('ProjectBoard').table('users')
    });

    r.db('ProjectBoard').table('users')

    next();
});

router.all('/api/project(*)?', projectController);

module.exports = router;