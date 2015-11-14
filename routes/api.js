var express = require('express');
var r = require('rethinkdb');
var router = express.Router();
var config = require('config');

var projectController = require('./api/project');

router.all('/api(*)?', function(req, res, next){
    r.connect(config.get('database'), function(err, conn) {
        if (err) {
            console.log(err);
            res.status = 500;
            return res.json({success: false, reason: 'Database Connection Error'});
        }
        if(!req.query.apikey) return res.json({success: false, reason: 'Missing required field `apikey`'});

        r.db('ProjectBoard').table('users').getAll(req.query.apikey, {index: 'apikey'}).run(conn, function(err, cursor){
            if (err) {
                console.log(err);
                res.status = 500;
                return res.json({success: false, reason: 'Database Connection Error'});
            }
            cursor.toArray(function(err, result){
                if(result.length != 1) {
                    res.status = 400;
                    return res.json({success: false, reason: "Invalid API key"});
                }
                req.app.locals.user = result[0];
                next();
            });
        });
    });
});

router.all('/api/project(*)?', projectController);

module.exports = router;
