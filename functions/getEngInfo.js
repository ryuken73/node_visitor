// get Engineer and Company list from IBM DB
var Q = require('q');
var ibmdb = require('../lib/ibmdb');
var _ = require('lodash');

exports.get = function(req,res){
    return function(){
        
        global.logger.info('start getEngInfo start');
        var def = Q.defer();

        ibmdb.getConnection(req,res)
        .then(getEngListFromDB2(req,res))
        .then(function(result){
            def.resolve(result);
        })
        .then(null, function(err){
            global.logger.error(err);
            def.reject('SBSDB 조회 실패')
        })
        .done(function(){
            ibmdb.delConnection(req);
        })

        return def.promise;
    }
}

function getEngListFromDB2(req,res){
    return function(conn){

        var def = Q.defer();
        ibmdb.executeSQL(req,"select E.CRGR_NM,C.CO_NM,E.SEQ as CRGR_ID,C.CO_SRL_NO as CO_ID from MAT.F_CORPR_CO_CRGR_TBL E, MAT.F_CORPR_CO_TBL C where E.del_yn='N' and C.CO_SRL_NO=E.CO_SRL_NO",[])
        .then(function(data){
            if(data.length > 0){
                var dataTrimmed = _.map(data, function(engInfo){
                                      engInfo.CO_NM = engInfo.CO_NM.trimRight();
                                      return engInfo;
                                 });
                def.resolve(dataTrimmed);                    
            }
        })
        .then(null, function(err){
            def.reject('select from db2 failure')
        })
        return def.promise;

    }
}