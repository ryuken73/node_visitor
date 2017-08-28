var nodemailer = require('nodemailer');

/* mail
 var mail= notification.mail('smtp://10.10.16.77');

var options = {
	from : 'LMS ryuken01@sbs.co.kr',
	to: 'ryuken01@sbs.co.kr',
	subject : 'LMS error',
	text : 'lms error'			
};	

mail.sendMail(options,function(err,info){
	if(err){ 
		return console.log(err)
	}
	console.log('Message sent: ' + info.response);
	
});
 */

exports.mail = function(smtp_address){
	return nodemailer.createTransport(smtp_address);
};