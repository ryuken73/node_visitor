var express = require('express');
var router = express.Router();

var updateHistory = require('../functions/updateHistory');

/* GET users listing. */
router.get('/:id', function(req, res, next) {
    global.logger.trace(req.query);
    (updateHistory.update(req,res))()
    .then(function(result){
        global.logger.trace('update success');
        res.json({'success':true});
    })
    .then(null, function(err){
        global.logger.error(err)
        res.json({'success':false});
    })
});

module.exports = router;
