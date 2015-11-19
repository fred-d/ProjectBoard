var express = require('express');
var r = require('rethinkdb');
var config = require('config');

var router = express.Router();
var projects;

/* Filter Handler: keeps track of what filter and order is selected */
router.get(["/projects","/projects/:filter","/projects/:filter/:order"], function(req, res, next) {
    req.app.locals.filter = req.params.filter || 'all';
    req.app.locals.order = req.params.order || 'newest';

    var filterStatement = function() {
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
    };

     if(req.app.locals.order == 'newest') {
        r.connect(config.get('database'), function(err, conn) {
            if (err) return next(Error('Database Connection Error'));

            r.table('projects').filter(filterStatement())
                .orderBy(r.desc('timestamp')).run(conn, function(err, cursor)  {
                if (err) return res.render('error', {
                    message: 'Database Error',
                    error: err
                });

                cursor.toArray(function (err, results) {
                    if (err) return next(Error('Database Error'));

                    req.app.locals.projects = results;
                    next();
                });
            });
        });
    }
     else if(req.app.locals.order == 'oldest') {
         r.connect(config.get('database'), function (err, conn) {
             if (err) return next(new Error('Database Connection Error'));

             r.table('projects').filter(filterStatement())
                 .orderBy(r.asc('timestamp')).run(conn, function(err, cursor)  {
                 if (err) return res.render('error', {
                     message: 'Database Error',
                     error: err
                 });

                 cursor.toArray(function (err, results) {
                     if (err) return next(Error('Database Error'));

                     req.app.locals.projects = results;
                     next();
                 });
             });
         });
     }
     else if(req.app.locals.order == "popular") {
         r.connect(config.get('database'), function(err, conn) {
             if (err) return new Error('Database Connection Error');

           r.table('projects').filter(filterStatement())
                 /*.orderBy(r.desc({ index: 'timestamp'}))*/.run(conn, function(err, cursor)  {//TODO add popularity sort
                 if (err) return new Error('Database Error');

                 cursor.toArray(function (err, results) {
                     if (err) return new Error('Database Error');

                     req.app.locals.projects = results;
                     next();
                 });
             });
         });
    }
     else {
         return new Error('Unknown Order');
    }
});

router.get(['/projects','/projects/all(/:order)?'], function(req, res) {
    res.render('projects',
        {
           title: 'View All Projects',
            filter: 'all'
        }
    );
});

router.get('/projects/in-progress(/:order)?', function(req, res) {
    res.render('projects',
        {
            title: 'View In-Progress Projects',
            filter: 'in-progress'
        }
    );
});

router.get('/projects/proposed(/:order)?', function(req, res) {
    res.render('projects',
        {
            title: 'View Proposed Projects',
            filter: 'proposed'
        }
    );
});

router.get('/projects/available(/:order)?', function(req, res) {
    res.render('projects',
        {
            title: 'View Approved and Available Projects',
            filter: 'available'
        }
    );
});

module.exports = router;
