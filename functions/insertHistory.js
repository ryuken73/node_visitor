// get Engineer and Company list from IBM DB
var Q = require('q');
var mysqldb = require('../lib/mysqldb');
var _ = require('lodash');

exports.insert = function(req,res){
    return function(){
        global.logger.info('start insert History Data start');
        var def = Q.defer();

        mysqldb.getConnection(req,res)
        .then(insertHistory(req,res))
        .then(function(result){
            def.resolve(result);
        })
        .then(null, function(err){
            global.logger.error(err);
            def.reject('history insert 실패')
        })
        .done(function(){
            mysqldb.delConnection(req);
        })

        return def.promise;
    }
}

function insertHistory(req, res){
    return function(conn){
        
        var def = Q.defer();
        mysqldb.executeSQL(req, 'insert into visit_history_tbl set ?',req.query)
        .then(function(result){
            global.logger.trace('insert success %j', result);
            def.resolve(result);
        })
        .then(null, function(err){
            global.logger.error(err);
            def.reject()
        })
        return def.promise;

    }
}