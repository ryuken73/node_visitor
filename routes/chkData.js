var express = require('express');
var router = express.Router();

var chkEngInfo = require('../functions/chkEngInfo')

/* GET users listing. */
router.get('/engID', function(req, res, next) {
    global.logger.trace("start check engID");

    (chkEngInfo.validate(req,res))()
    .then(function(result){ 
        res.send({'validated':result});
    })
    .then(null, function(err){
        global.logger.error(err);
    })
});

module.exports = router;
