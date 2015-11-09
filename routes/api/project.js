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
            return res.json(result);
        })
    });
});
router.post('/api/project/', function(req, res){
    if(!req.query.name) return res.json({success: false, reason: "'name' is a required field"});
    if(!req.query.author) return res.json({success: false, reason: "'author' is a required field"});

    r.connect({host: '159.203.246.210', port: 28015}, function(err, conn){
        if(err) {res.status = 500;return res.json({success: false, reason: 'Database Connection Error', err: err})}

            r.db('ProjectBoard').table('projects').getAll(req.query.name, {index:'name'}).run(conn, function(err, cursor) {
                if(err) {res.status = 500;return res.json({success: false, reason: 'Unknown Database Error', err: err})}
                cursor.toArray(function (err, results) {
                    if(results.length!=0) {
                        res.status = 400;
                        console.log(results);
                        return res.json({success: false, reason: 'A project already exists with what name.'});
                    }
                });

                r.db('ProjectBoard').table('projects').insert({
                    name: req.query.name,
                    timestamp: new Date(), // RethinkDB will accept this as a valid current-time object
                    submitter: {
                        name: req.query.author, // What does the requester want us to call him
                        user: req.app.locals.user.name // What is the actual name of the authenticated user
                    },
                    status: 'proposed', // All projects submitted via API *must* be approved through the website;
                    approved: false,
                    lead: req.query.lead || null // If a leader was not set, we want to fill the DB field with null.
                }).run(conn, function(err, response){
                    if(err) {res.status = 500;return res.json({success: false, reason: 'Unknown Database Error', err: err})}
                    res.json({success: true, projectId: response.generated_keys[0]});
                });
            });
    });
});

module.exports = router;