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

        var sortOrder = r.desc;
        if(req.params.order == "newest") sortOrder = r.desc;
        else if(req.params.order == "oldest") sortOrder = r.asc;

        r.db('ProjectBoard').table('projects').filter(function() {
            switch(req.app.locals.filter) { //a parameter received from the MVC controller to specify what items to show
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
        }).orderBy(sortOrder(function(){
            switch(req.app.locals.order) { //a parameter received from the MVC controller to specify the list order
                default:
                case "newest": //Sort from newest to oldest
                    return { index: 'timestamp'};
                    break;
                case "oldest": //Sort from oldest to newest
                    return {index: 'timestamp'};
                    break;
                case "popular":
                    return {};//TODO add a popularity system to tie into
                    break
            }
        })).run(conn, function(err, cursor)  {
            //if (err) return new Error('Database Error');
            if (err) return res.json(err); //Pass the error to the screen; you can see RethinkDB is griping about the use of r.desc()

            cursor.toArray(function (err, results) {
                if (err) next(new Error('Database Error'));

                req.app.locals.projects = results;
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