var express = require('express');
var r = require("rethinkdb");

var router = express.Router();

router.post("/project", function(req, res, next){
    if(!req.body.ProjectName || !req.body.ProjectSummary || (req.body.ProjectLeader && !req.body.ProjectLeaderName))
        next(new Error("Missing Required Project Information"));

    r.connect({host: '159.203.246.210', port: 28015}, function(err, conn){
        if (err) next(new Error('Database Failed to Connect'));

        r.db('ProjectBoard').table('projects').insert({
            name: req.body.projectName,
            summary: req.body.projectSummary,
            timestamp: new Date(),
            submitter: {
                name: "test",
                user: "test"
            },
            status: 'proposed',
            approved: false
        }).run(conn, function(err, response){
            if(err) {res.status = 500;return res.json({success: false, reason: 'Unknown Database Error', err: err})}
            console.log('hi');
            res.send("Hi");
        });
    });
});
router.get("/project/:id", function(req, res, next) {
    r.connect({host: '159.203.246.210', port: 28015}, function(err, conn) {
        if (err) return new Error('Database Failed to Connect');

        r.db('ProjectBoard').table('projects').get(req.params.id).run(conn, function(err, result) {
            if (err) return next(err);
            if (!result) {
                var err = new Error('Not Found');
                err.status = 404;
                return next(err);
            }

            req.app.locals.project = result;
            req.app.locals.title = result.name+' - ProjectBoard';
            res.render('project');
        });
    });
});

module.exports = router;
