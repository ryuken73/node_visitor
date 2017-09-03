var express = require('express');
var router = express.Router();
var extractJAMO = require('../util/extractJAMO');
var extractCHO = require('../util/extractCHO');
var _ = require('lodash');
var Hangul = require('hangul-js');
var getEngInfo = require('../functions/getEngInfo');
var mkCachedList = require('../functions/mkCachedList');

router.get('/search/:pattern', function(req, res, next) {
	
	global.logger.trace('%s',req.params.pattern);
	var pattern = req.params.pattern
	var jamo = extractJAMO(req.params.pattern);
	var cho = extractCHO(req.params.pattern);
	global.logger.trace('%s',jamo);

	var userObj = _.filter(global.usermapWithJAMOCHO, function(obj){
		return obj.CRGR_NM.includes(req.params.pattern); 
	});
	
	var userObjJAMO = _.filter(global.usermapWithJAMOCHO, function(obj){
		return obj.CRGR_NM_JAMO.startsWith(jamo) ;
	});
	
	var processed = 0;
	var userObjCHO = [];

	for ( var i = 0 ; i < pattern.length ; i++ ) {
			if(Hangul.isHangul(pattern[i])){
				global.logger.trace('이건 초성검색이 아닙니다');
				break;
			}else{
				processed ++;
			}			
			
			if(processed === pattern.length){
				userObjCHO = _.filter(global.usermapWithJAMOCHO, function(obj){
					var chosung = obj.CRGR_NM_CHO ;
					if(chosung)	{
						return obj.CRGR_NM_CHO.startsWith(cho) ;
					}else{
						return false;
					}
				});
			}
	}	
	
	global.logger.trace('userObjCHO:%j',userObjCHO);
	
	_.assign(userObj, userObjJAMO);
	_.assign(userObj, userObjCHO);
	
	res.send(userObj);
	
}); 

router.get('/refreshEngList', function(req, res, next) {
	global.usermapWithJAMOCHO = [];
	(getEngInfo.get(req,res))()
	.then(mkCachedList)
    .then(function(result){
		//res.send({result:'OK'})
		res.send(global.usermapWithJAMOCHO);
	})
	.then(null, function(err){
		global.logger.error(err);
		res.send('error')
	})

});

module.exports = router;