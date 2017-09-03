// get Engineer and Company list from IBM DB
var Q = require('q');
var mysqldb = require('../lib/mysqldb');
var _ = require('lodash');

exports.delete = function(req,res){
        global.logger.info('start delete History Data start');
        var def = Q.defer();

        mysqldb.getConnection(req,res)
        .then(deleteHistory(req,res))
        .then(function(result){
            def.resolve(result);
        })
        .then(null, function(err){
            global.logger.error(err);
            def.reject('history delete 실패')
        })
        .done(function(){
            mysqldb.delConnection(req);
        })

        return def.promise;

}

function deleteHistory(req, res){

    return function(conn){
        
        var def = Q.defer();
        //mysqldb.executeSQL(req, 'delete from sbs.visit_history_tbl where history_id = ?',req.params.id)
        mysqldb.executeSQL(req, 'update sbs.visit_history_tbl set del_yn="Y" where history_id = ?',req.params.id)
        .then(function(result){
            global.logger.trace('delete success %j', result);
            def.resolve(result);
        })
        .then(null, function(err){
            global.logger.error(err);
            def.reject()
        })
        return def.promise;

    }
}