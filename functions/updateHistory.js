// get Engineer and Company list from IBM DB
var Q = require('q');
var mysqldb = require('../lib/mysqldb');
var _ = require('lodash');

exports.update = function(req,res){
    return function(){
        global.logger.info('start update History Data start');
        var def = Q.defer();

        mysqldb.getConnection(req,res)
        .then(updateHistory(req,res))
        .then(function(result){
            def.resolve(result);
        })
        .then(null, function(err){
            global.logger.error(err);
            def.reject('history update 실패')
        })
        .done(function(){
            mysqldb.delConnection(req);
        })

        return def.promise;
    }
}

function updateHistory(req, res){
    return function(conn){
        
        var def = Q.defer();
        mysqldb.executeSQL(req, 'update visit_history_tbl set ? where history_id = ?',[req.query,req.params.id])
        .then(function(result){
            global.logger.trace('update success %j', result);
            def.resolve(result);
        })
        .then(null, function(err){
            global.logger.error(err);
            def.reject()
        })
        return def.promise;

    }
}