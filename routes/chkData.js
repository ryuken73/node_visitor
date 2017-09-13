var express = require('express');
var router = express.Router();
var app = express();

var chkEngInfo = require('../functions/chkEngInfo')

/* GET users listing. */
router.get('/engID', function(req, res, next) {
    global.logger.trace("start check engID");
    var mode = app.get('env');
    if(mode === 'development'){
        res.json({'validated':true})
    } else {
    (chkEngInfo.validate(req,res))()
    .then(function(result){ 
        res.json({'validated':result});
    })
    .then(null, function(err){
        global.logger.error(err); 
        res.json({'validated':false});
    })
    }
}); 

module.exports = router;
 