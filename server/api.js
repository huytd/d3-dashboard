var express = require('express');
var router  = express.Router();

router.get('/', function(req, res, next) {
    res.json({ message: 'Welcome' });
});

router.get('/getWPSummary/IED', function(req, res, next) {
    res.sendFile(__dirname + '/QS_DASH_WPSUMMARY.json');
});

router.get('/getWPSummary/INF', function(req, res, next) {
    res.sendFile(__dirname + '/QS_DASH_WPSUMMARY_2.json');
});


router.get('/getWPCheckout', function(req, res, next) {
    res.sendFile(__dirname + '/QS_DASH_CHKOUTSUMMARY.json');
});

module.exports = router;
