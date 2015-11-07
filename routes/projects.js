var express = require('express');
var r = require('rethinkdb');

var router = express.Router();
var projects;

/* Filter Handler: keeps track of what filter and order is selected */
router.get(["/projects","/projects/:filter","/projects/:filter/:order"], function(req, res, next) {
    req.app.locals.filter = req.params.filter;
    req.app.locals.order = req.params.order || 'newest';

    r.connect({host: '159.203.246.210', port: 28015}, function(err, conn) {
        if (err) new Error('Database Connection Error');

        r.db('ProjectBoard').table('projects').filter(function() {
            switch(req.app.locals.filter) {
                default:
                case "all":
                    return {};
                    break;
                case "available":
                    return {status: "available"};
                    break;
                case "proposed":
                    return {status: "proposed"};
                    break;
                case "in-progress":
                    return {status: "in-progress"};
                    break;
            }
        }).run(conn, function(err, cursor) {
            if (err) new Error('Database Error');

            cursor.toArray(function (err, result) {
                if (err) new Error('Database Error');

                req.app.locals.projects = result;
                next();
            });
        });
    });
});

router.get(['/projects','/projects/all(/:order)?'], function(req, res, next) {
    res.render('projects', {
        title: 'View All Projects',
        filter: 'all'
    });
});

router.get('/projects/in-progress(/:order)?', function(req, res, next) {
    res.render('projects', {
        title: 'View In-Progress Projects',
        filter: 'in-progress'
    });
});

router.get('/projects/proposed(/:order)?', function(req, res, next) {
    res.render('projects',
        {
            title: 'View Proposed Projects',
            filter: 'proposed'
        });
});

router.get('/projects/available(/:order)?', function(req, res, next) {
    res.render('projects',
        {
            title: 'View Approved and Available Projects',
            filter: 'available'
        });
});

module.exports = router;