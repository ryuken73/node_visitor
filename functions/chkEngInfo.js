// get Engineer and Company list from IBM DB
var Q = require('q');
var ibmdb = require('../lib/ibmdb');
var _ = require('lodash');

exports.validate = function(req,res){
    return function(){

        global.logger.info('start chkEngInfo start');

        var def = Q.defer();
        /*
        ibmdb.getConnection(req,res)
        .then(chkEngInfoFromDB2(req,res))
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
        */
        def.resolve(true);
        return def.promise;
    }
}

function chkEngInfoFromDB2(req,res){
    return function(conn){

        var def = Q.defer();
        ibmdb.executeSQL(req,"select E.CRGR_NM,C.CO_NM + \
                              from MAT.F_CORPR_CO_CRGR_TBL E, MAT.F_CORPR_CO_TBL C + \
                              where E.del_yn='N' and C.CO_SRL_NO=E.CO_SRL_NO + \
                              and E.CRGR_NM = ? and E.CRGR_ID = ? and C.CO_NM = ?", [req.query.CRGR_NM, req.query.CRGR_ID,req.query.CO_NM])
        .then(function(data){
            if(data.length > 0){
                def.resolve(true);                    
            } else {
                def.reject('engineer info not found in DB2 : %j', req.query);
            }
        })
        .then(null, function(err){
            def.reject('select from db2 failure')
        })
        return def.promise;

    }
}