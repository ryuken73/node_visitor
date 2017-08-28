var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var process = require('process');
var fs = require('fs');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// express security guide
var helmet = require('helmet');

// error level의 오류가 발생하는 경우 메일 발송을 위한 setting
var notification = require('./lib/notification');
var mail = notification.mail('smtp://10.10.16.77'); // sbs.co.kr mail 서버
var mailNotification = function(level, tracerData){	
	if(tracerData.title === level){
		var sender = 'LMS ryuken01@sbs.co.kr';
		var receiver = 'ryuken01@sbs.co.kr';
		var subject = 'LMS Error : ' + tracerData.message;
		var body = tracerData.output;
		var mailOPtions = {
				from : sender,
				to : receiver,
				subject : subject,
				text : body
		};
		mail.sendMail(mailOPtions,function(err,result){
			if(err){
				return console.log(err);
			} 
			console.log('Mail Sent Successfully');
		});
	}
};

// tracer log config
var logLevel ;

var logFile = process.env.LOGFILE ? process.env.LOGFILE : './lms.log';
var mode = process.env.mode ? process.env.mode : 'development';
app.set('env', mode);

if(app.get('env') === 'development'){
	logLevel = 'trace';	
	console.log('development environment!!');
}else{
	// dynamic하게 loglevel을 바꿀때, initial loglevel보다 아래로는 setting을 못하기 때문에, 가장 낮은 레벨로 set.
	// 기동 후 console에 log info command를 issue해서 level을 낮추는게 좋다.
	logLevel = 'trace';
	console.log('production environment!!');
}

var tracer = require('tracer');
var logTracer = tracer.console(
			{
				format : "{{timestamp}} [{{title}}][{{method}}] {{message}} (in {{file}}:{{line}})",	
				dateformat: 'yyyy-mm-dd HH:MM:ss',
				level:logLevel,
				transport : [
					function(data){
						fs.appendFile(logFile, data.output + '\n', function(err){
							if(err) {
								throw err;
							}
						});
					},
					function(data){
						console.log(data.output);
					},
					function(data){
						mailNotification('error', data);
					}
					
				]
			}
); 

global.logger = logTracer;	
//

// security setting
app.use(helmet());

/* ibm DB2 pool
var DB2HOST = process.env.DB2HOST ? process.env.DB2HOST : "SBSDEV";
global.logger.info("DB2HOST : %s",DB2HOST);
var Pool = require('ibm_db').Pool;
var db2options = dbconfig.DB2[DB2HOST];
global.db2pool = new Pool();
global.db2cn = '';
Object.keys(db2options).forEach(function(key){
	global.db2cn +=  key + '=' + db2options[key] + ';' ;
});
*/

// mysql DB pool
var MYSQLHOST = process.env.MYSQLHOST ? process.env.MYSQLHOST : "LMSDEV";
global.logger.info("MYSQLHOST : %s",MYSQLHOST);
global.mySQLpool   = require('mysql').createPool(dbconfig.MYSQL[MYSQLHOST]);  
//





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// console utility

var printHelp  = function(){ 
	console.log("Valid cmd : %s", Object.keys(cmdMap).join(' ')) ;
};

var loglevel = function(argv){ 
	var level = argv.shift().trim();
	var validLevel = ["error","warn","info","debug","trace"];
	if(validLevel.indexOf(level) !== -1){
		tracer.setLevel(level);
		global.logger[level]('log level chagned to %s', level);
	}else{
		console.log('specify level one of %s', validLevel.join(' '));
	}
};

var cmdMap = { "help" : printHelp, "log" : loglevel }; //log debug라고 console치면 debug레벨로 변경됨

process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data',function(param){
	var paramArray = param.split(' ');
	var cmd = paramArray.shift();
	try {
		cmdMap[cmd.trim()](paramArray);
	} catch(ex) { 
		cmdMap.help();		
	}
});

//

module.exports = app;
