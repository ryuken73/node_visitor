/**
 *  date관련 utilty
 **/

exports.getfullString = function(date){
	return date.toDateString(date);
};

exports.getDayString = function(date){
	return date.toDayString(date);
};

exports.getISOString = function(date){
	return date.toISOString(date);
}

exports.getMidnightString = function(date){
	var year = date.getFullYear();
	var month = padZero(date.getMonth() + 1);
	var day = padZero(date.getDate());
	return year+'-'+month+'-'+day+' '00:00:00';
}

exports.getMidnightEndString = function(date){
	var year = date.getFullYear();
	var month = padZero(date.getMonth() + 1);
	var day = padZero(date.getDate());
	return year+'-'+month+'-'+day+' '23:59:59';
}

Date.prototype.toDateString = function(date){

	var year = date.getFullYear();
	var month = padZero(date.getMonth() + 1);
	var day = padZero(date.getDate());
	var hour = padZero(date.getHours());
	var minute = padZero(date.getMinutes());
	var second = padZero(date.getSeconds());

	return year+month+day+hour+minute+second;
};

Date.prototype.toISOString = function(date){

	var year = date.getFullYear();
	var month = padZero(date.getMonth() + 1);
	var day = padZero(date.getDate());
	var hour = padZero(date.getHours());
	var minute = padZero(date.getMinutes());
	var second = padZero(date.getSeconds());

	return year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;
};


Date.prototype.toDayString = function(date){

	var year = date.getFullYear();
	var month = padZero(date.getMonth() + 1);
	var day = padZero(date.getDate());
	return year+month+day;
};


function padZero(num){
	if(num < 10){
		return '0'+num;
	}
	return num.toString();
};