var express = require('express');
var r = require('rethinkdb');
var router = express.Router();

router.get("/api/project/:project", function(req, res) {
    r.connect({host: '159.203.246.210', port: 28015}, function(err, conn){
        if(err) {
            res.status = 500;
            return res.json({success: false, reason: 'Database Connection Error'});
        }

        r.db('ProjectBoard').table('projects').get(req.params.project).run(conn, function(err, result){
            if(err) {
                res.status = 500;
                return res.json({success: false, reason: 'Database Transaction Error'});
            }
            if(!result) {
                res.status = 400;
                return res.json({success: false, reason: 'No Such Project'})
            }
            res.json(result);
        })
    });
});

router.post('/api/project/', function(req, res){
    if(!req.query.name) return res.json({success: false, reason: "'name' is a required field"});
    if(!req.query.author) return res.json({success: false, reason: "'author' is a required field"});

    r.connect({host: '159.203.246.210', port: 28015}, function(err, conn){
        if(err) {
            res.status = 500;
            console.log(err);
            return res.json({success: false, reason: 'Database Connection Error'});
        }

        r.db('ProjectBoard').table('projects').insert({
            name: req.query.name,
            timestamp: Date.now(),
            submitter: {
                name: req.query.author,
                user: req.app.locals.user.name
            },
            status: 'proposed',
            approved: false,
            lead: null
        }).run(conn, function(err, response){
            res.json({success: true, projectId: response.generated_keys[0]});
        });
    });
});


module.exports = router;