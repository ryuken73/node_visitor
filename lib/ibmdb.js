/**
 * ibm DB promise interface by RYU
 */

var Q = require('q');
var config = require('../config.json');

exports.getConnection = function(req, res){
	
	return new Q.promise(function(resolve , reject){	
		global.db2pool.open(global.db2cn, function openDB2pool(err,conn){
			if(err){ 
				global.logger.error('pool.getConnection error');
				reject(err); 		
				return false;
			}			
			global.logger.trace('get db connection success');
			req.db2conn = conn;
			resolve();
		}); 
	});
};

exports.executeSQL = function(req, sql, params){
	
		global.logger.debug('db query start : %s, parameters : %j', sql, params);

		var promise = new Q.promise(function(resolve,reject){
 
		req.db2conn.query(sql, params, function queryDB2(err,results){	
				if(err){
					global.logger.error('db execution Error : %s , paramters : %j', sql, params);
					reject(err);
					return false;
				}		
				global.logger.debug('db execution OK : %s, parameters : %j', sql, params);
				resolve(results);
			});
		});
		
		promise
		.then(function resultDB2(result){
			global.logger.trace('db execution Result : %j', result);
		});
		
		return promise;
};	

exports.delConnection = function(req){
	global.logger.debug('db2 connection release');
	req.db2conn.close(function(err){
		if(err){
			global.logger.error('db2 release connection error : %j', err);
		} else {
			global.logger.trace('release connection');
		}						
	});	
}