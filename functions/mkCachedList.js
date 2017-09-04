var Q = require('q');
var _ = require('lodash'); 
var extractJAMO = require('../util/extractJAMO');
var extractCHO = require('../util/extractCHO');

module.exports = function(sqlResult){

    var def = Q.defer();

    var processed = 0;

    _.forEach(sqlResult,function(engInfo){
        var jamo = extractJAMO(engInfo.CRGR_NM);
        var cho  = extractCHO(engInfo.CRGR_NM);
        engInfo.CRGR_NM_JAMO = jamo;
        engInfo.CRGR_NM_CHO = cho;
        global.usermapWithJAMOCHO.push(engInfo);
        processed ++;
        if(processed === sqlResult.length){
            def.resolve();
        }
    })        
    
    return def.promise;

}