var express = require('express');
var router = express.Router();
var extractJAMO = require('../util/extractJAMO');
var extractCHO = require('../util/extractCHO');
var _ = require('lodash');
var Hangul = require('hangul-js');

router.get('/search/:pattern', function(req, res, next) {
	
	global.logger.trace('%s',req.params.pattern);
	var pattern = req.params.pattern
	var jamo = extractJAMO(req.params.pattern);
	var cho = extractCHO(req.params.pattern);
	global.logger.trace('%s',jamo);
    global.logger.trace('%j',global.usermapWithJAMOCHO)

	var userObj = _.filter(global.usermapWithJAMOCHO, function(obj){
		return obj.USER_NM.includes(req.params.pattern); 
	});
	
	var userObjJAMO = _.filter(global.usermapWithJAMOCHO, function(obj){
		return obj.USER_NM_JAMO.startsWith(jamo) ;
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
					var chosung = obj.USER_CHO ;
					if(chosung)	{
						return obj.USER_CHO.startsWith(cho) ;
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

module.exports = router;