var express = require('express');
var router = express.Router();

var delHistory = require('../functions/deleteHistory');

/* GET users listing. */
router.get('/:id', function(req, res, next) {
    global.logger.trace(req.params);
    delHistory.delete(req,res)
    .then(function(result){
        global.logger.trace('delete success');
        res.send('ok');
    })
    .then(null, function(err){
        global.logger.error(err)
        res.send('fail')
    })
});

module.exports = router;
