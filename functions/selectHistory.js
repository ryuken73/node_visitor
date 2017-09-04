// get Engineer and Company list from IBM DB
var Q = require('q');
var mysqldb = require('../lib/mysqldb');
var _ = require('lodash');

exports.history = function(req,res){
    return function(){
        global.logger.info('start select History Data start');
        var def = Q.defer();

        mysqldb.getConnection(req,res)
        .then(getHistory(req,res))
        .then(function(result){
            def.resolve(result);
        })
        .then(null, function(err){
            global.logger.error(err);
            def.reject('history select 실패')
        })
        .done(function(){
            mysqldb.delConnection(req);
        })

        return def.promise;
    }
}

function getHistory(req, res){
    return function(conn){
        var srchPattern = '%'+req.query.searchPattern+'%';
        var srt_dttm = req.query.srt_dttm;
        var end_dttm = req.query.end_dttm;

        var def = Q.defer();
        mysqldb.executeSQL(req, 'select * from visit_history_tbl ' + 
                                'where ( crgr_nm like ? or co_nm like ? or task like ? ) and ' +
                                '( srt_dttm >= ? and end_dttm <= ? ) and del_yn = "N" ' +
                                'order by srt_dttm desc ', [srchPattern,srchPattern,srchPattern,srt_dttm,end_dttm])
        .then(function(result){
            global.logger.trace('select result %j', result);
            def.resolve(result);
        })
        .then(null, function(err){
            global.logger.error(err);
            def.reject()
        })
        return def.promise;
    }
}