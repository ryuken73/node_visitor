/**
 * mysql DB promise interface by RYU
 */


var Q = require('q');

exports.getConnection = function(req, res){
					
	return Q.promise( function(resolve, reject) {		
	 
		global.mySQLpool.getConnection(function(err,conn) {
			
			if(err){ 
				global.logger.error(err);
				reject(err); 	
				return false;
			}
			
			global.logger.trace('get db connection success');
			req.conn = conn; // attach connection object to req
			
			resolve();
			
		});

	});	
};

exports.executeSQL = function(req, sql, params){

		global.logger.debug(' db query start : %s, parameters : %j', sql, params);

		var promise = new Q.promise( function(resolve,reject) {
			req.conn.query(sql, params, function queryMySQL(err,results){
				if(err){							
					global.logger.error(' db execution Error : %s , paramters : %j', sql, params);
					reject(err);
				} else {
					global.logger.debug(' db execution OK : %s, parameters : %j', sql, params);
					resolve(results);
				}	
			});
		});
		
		// sql query 끝날때 마다 trace로 DB execution result를 logging		
		
		promise
		.then(function resultMySQL(result){ 
			global.logger.trace(' db execution Result : %j', result);
		});	
		return promise;	
};	

exports.delConnection = function(req){
	global.logger.debug(' mysql db connection close');
	try {
		req.conn.release();
	} catch(err) {
		global.logger.error('mysql db connection close error');
		global.logger.error(err);
	}
};

// transaction related promise function

exports.beginTransaction = function(req){
		var def = Q.defer();
		req.conn.beginTransaction(function(err){
			if(err){
				def.reject({result:'failure',msg:'beginTransaction failed'});
			}else{
				global.logger.debug('Start Transaction ');		
				def.resolve();
			}
		});
		return def.promise;
};


exports.TXexecuteSQL = function(req, sql, params){
		
		global.logger.debug(' TX db query start : %s, parameters : %j', sql, params);		
		
		var def = Q.defer();
		req.conn.query({sql:sql, timeout:60000}, params, function(err,results){
			if(err){
				global.logger.error(' TX db execution Error : %s , paramters : %j', sql, params);	
				def.reject(err); // 12줄 아래의 reject handler로 들어간다.			
			}else{
				global.logger.debug(' TX db execution OK : %s, parameters : %j', sql, params);	
				def.resolve(results);
			}	
		});
		
		// sql query 끝날때 마다 trace로 DB execution result를 logging
		def.promise
		.then(function mysqlResult(result){
			global.logger.trace(' db execution Result : %j', result);
		})
		.then(null,function mysqlResultErr(err){
			global.logger.error(err);
			global.logger.error('rollback transaction');
			req.conn.rollback();
			def.reject(err); // TXexecuteSQL pomise chain 전체의 reject handler로 전달된다.
		});		
		
		return def.promise;		
};

exports.TXexecuteSQLCommit = function(req, sql, params){
	
		global.logger.debug(' TX db query start : %s, parameters : %j', sql, params);		
		
		var def = Q.defer();
		req.conn.query({sql:sql, timeout:60000}, params, function(err,results){
			if(err){
				global.logger.error(' TX db execution Error : %s , paramters : %j', sql, params);	
				def.reject(err);	// 12줄 아래의 reject handler로 들어간다.			
			}else{
				global.logger.debug(' TX db execution OK : %s, parameters : %j', sql, params);	
				global.logger.debug(' TX db execution COMMIT : %s, parameters : %j', sql, params);
				req.conn.commit(function(err){
					if(err){
						def.reject(err);
					}else{
						def.resolve(results);	
					}					
				});
			}	
		});
		
		// sql query 끝날때 마다 trace로 DB execution result를 logging
		def.promise
		.then(function(result){
			global.logger.trace(' db execution Result : %j', result);
		})
		.then(null,function(err){
			global.logger.error(err);
			global.logger.error('rollback transaction');
			req.conn.rollback();
			def.reject(err); // TXexecuteSQLCommit pomise chain 전체의 reject handler로 전달된다.			
		});		
		
		return def.promise;		
};