var express = require('express');
var router = express.Router();
var r = require("rethinkdb");

/* GET home listing. */
router.get("/project/:id", function(req, res, next) {
    r.connect({host: '159.203.246.210', port: 28015}, function(err, conn) {
        if (err) new Error('Database Failed to Connect');

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