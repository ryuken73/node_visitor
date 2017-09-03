var express = require('express');
var router = express.Router();

var insertHistory = require('../functions/insertHistory');

/* GET users listing. */
router.get('/', function(req, res, next) {
    global.logger.trace(req.query);
    (insertHistory.insert(req,res))()
    .then(function(result){
        global.logger.trace('insert success');
        res.send('ok');
    })
    .then(null, function(err){
        global.logger.error(err)
        res.send('fail')
    })
});

module.exports = router;
