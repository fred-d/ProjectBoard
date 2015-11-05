var express = require('express');
var router = express.Router();

router.get(['/projects','/projects/all'], function(req, res, next) {
    res.render('projects', {
        title: 'View All Projects',
        filter: 'all'
    });
});

router.get('/projects/in-progress', function(req, res, next) {
    res.render('projects', {
        title: 'View In-Progress Projects',
        filter: 'in-progress'
    });
});

router.get('/projects/proposed', function(req, res, next) {
    res.render('projects',
        {
            title: 'View Proposed Projects',
            filter: 'proposed'
        });
});

router.get('/projects/approved', function(req, res, next) {
    res.render('projects',
        {
            title: 'View Approved Projects',
            filter: 'approved'
        });
});

module.exports = router;