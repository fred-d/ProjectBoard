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
            timestamp: Date.now() / 1000, //Generate the current epoch time
            submitter: {
                name: req.query.author, // What does the requester want us to call him
                user: req.app.locals.user.name // What is the actual name of the authenticated user
            },
            status: 'proposed', // All projects submitted via API *must* be aproved
            approved: false,
            lead: null //TODO add the ability to own-up a submitted project
        }).run(conn, function(err, response){
            if(err) return res.json({success: false, reason: "an unknown database error occurred"});
            res.json({success: true, projectId: response.generated_keys[0]});
        });
    });
});


module.exports = router;