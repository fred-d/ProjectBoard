var express = require('express');
var r = require("rethinkdb");

var router = express.Router();
var config = require('config');

router.post("/project", function(req, res, next){
    if(!req.body.projectName || !req.body.projectSummary || (req.body.projectLeader && !req.body.projectLeaderName))
        return next(new Error("Missing Required Project Information"));

    r.connect(config.get('database'), function(err, conn){
        if (err) return next(new Error('Database Failed to Connect'));

        r.table('projects').insert({
            name: req.body.projectName,
            summary: req.body.projectSummary,
            timestamp: new Date(),
            submitter: {
                name: "test",
                user: "test"
            },
            status: 'proposed',
            approved: false
        }).run(conn, function(err, result){
            if(err) {res.status = 500;return res.json({success: false, reason: 'Unknown Database Error', err: err})}
            res.redirect("/project/"+result.generated_keys[0]);
        });
    });
});
router.get("/project/:id", function(req, res, next) {
    r.connect(config.get('database'), function(err, conn) {
        if (err) return new Error('Database Failed to Connect');

        r.table('projects').get(req.params.id).run(conn, function(err, result) {
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
