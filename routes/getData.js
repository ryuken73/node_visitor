var express = require('express');
var router = express.Router();

var selectHistory = require('../functions/selectHistory');

/* GET users listing. */
router.get('/history', function(req, res, next) {
    global.logger.trace("start get history");
    global.logger.trace(req.query);

    (selectHistory.history(req,res))()
    .then(function(result){ 
        res.send({'data':result});
    })
    .then(null, function(err){
        global.logger.error(err);
    })
});

module.exports = router;
