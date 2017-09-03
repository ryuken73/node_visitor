
// Date display
var now = new Date();
d3.select('#today').text(now);
setInterval(()=>{
    now = new Date();
    d3.select('#today').text(now);
},1000)
// Date Display End

// help function
function padZero(num){
	if(num < 10){
		return '0'+num;
	}
	return num.toString();
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

Date.prototype.getTodayString = function(date){
	var year = date.getFullYear();
	var month = padZero(date.getMonth() + 1);
	var day = padZero(date.getDate());
    return year+'-'+month+'-'+day;    
}

Date.prototype.getTomorrowString = function(date){
	var year = date.getFullYear();
	var month = padZero(date.getMonth() + 1);
	var day = padZero(date.getDate() + 1);
    return year+'-'+month+'-'+day;    
}

Date.prototype.getMidnightString = function(date){
	var year = date.getFullYear();
	var month = padZero(date.getMonth() + 1);
	var day = padZero(date.getDate());
	return year+'-'+month+'-'+day+' 00:00:00';
}

// END Help function

// set initial search begin and end date
var searchDate = new Date();
var beginD = searchDate.getTodayString(searchDate);
var endD = searchDate.getTomorrowString(searchDate);
$('#search_begind').val(beginD);
$('#search_endd').val(endD);
//

// Search Event
d3.select('#search').on('click', function(){
    getHistory(redrawTable);
})

// Submit Event
// insert or update history table
// when data has row id => then update
// no row id => then insert
d3.select('#submit').on('click', function(){
    // check id and name from sbsdb
    alert('submit');
    var params = getFieldValue();

    validateField(params)
    .then(function(isvalidated){
        console.log('validated')
        inputHistory(params);
    })
    .then(function(result){
        console.log('insert success')
        getHistory(redrawTable);
        console.log(result);
    })
    .then(null, function(err){
        console.error(err);
        alert(err);
    })
})

function getFieldValue(){
    var result = {};
    result.CRGR_NM = $('#engName').val();
    result.CRGR_ID = $('#engName').attr('engID') ? $('#engName').attr('engID') : 100;
    result.CO_NM = $('#compNM').val();
    result.CO_ID = $('#compNM').attr('coID') ? $('#compNM').attr('coID') : 100 ;
    result.SRT_DTTM = $('#startTime').val();
    result.END_DTTM = $('#endTime').val();
    result.TASK = $('#task').val();
    return result;
}

function validateField(params) {
    return new Promise(function(resolve,reject){
        $.ajax({
            'url' : '/chkData/engID',
            'type' : 'GET',
            'data' : params,
            'success' : function(result) {
                if(result.validated){
                    resolve(true);
                } else {

                    reject('등록되지 않은 엔지니어명입니다. ( SIIS 협력업체관리에 등록 후 사용 )');
                }
            },
            'failure' : function(err){
                reject('error to send validation request!')
            }
        })
    })
}

function inputHistory(params){
    return new Promise(function(resolve,reject){
        $.ajax({
            'url':'/setData',
            'type' : 'GET',
            'data' : params,
            'success' : function(result){
                if(result.success){
                    resolve(true);
                } else {
                    reject('apply failed!')
                }
            },
            'failure' : function(err){
                reject('error to set Data!');
            }
        })
        resolve('registered');
    });
}
// END Submit Event

// autocomplte
var MAXVISIBLE = 20;
autoComplteElement = $('#engName');
autoComplteElement.autocomplete({
    source: function(request,response){      
    $.ajax({
            'url':'/getUser/search/'+encodeURIComponent(request.term),
            'type':'GET',
            'success':function(result){
                response(
                        $.map(result.slice(0,MAXVISIBLE),function(item){
                            return{
                                label : item.CRGR_NM +' - '+ item.CO_NM,
                                //value: { name : item.USER_NM , company : item.CO_NM },
                                value : item.CRGR_NM,
                                co : item.CO_NM
                            };							
                        })
                    );
                
            }
        });
    },
    focus: function(event, ui){
        event.preventDefault(); 
    },
    select: function(event,ui){ // 값 선택할 때 input box에 값 채워지고 submit 되도록
        //event.preventDefault();
        //autocomplete disable
        autoComplteElement.autocomplete("disable");
        console.log('autocomplete disabled');
        var promise = new Promise(function(resolve,reject){
            //$('#engName').val(ui.item.value.name);
            $('#compNM').val(ui.item.co);
            resolve()
        })
        
        promise.then(function(result){
            // submit code 넣으면 된다..검색이라든가..뭐
            var startT = new Date();
            var ISOTime = startT.toISOString(startT);
            $('#startTime').val(ISOTime);
            $('#endTime').val(ISOTime);

        });
        
    }		
});	

var disableAutoComplete = function(){
    autoComplteElement.autocomplete('disable');
}

var attachEventEnableAutoComplete = function(){
    autoComplteElement.keyup(function(){
        console.log('key up');
        var disabled =  autoComplteElement.autocomplete("option", "disabled");
        if(disabled){
            console.log('enable autocomplete');
            autoComplteElement.autocomplete('enable');
        }
    })
}

disableAutoComplete();  // initially disable auto complete
attachEventEnableAutoComplete(); // enable autocomplete when keyup event occur
getHistory(redrawTable);

// get History function 

function getHistory(cb){
    var searchPattern = $('#keyword').val();
    var srt_dttm = $('#search_begind').val() + ' 00:00:00';
    var end_dttm = $('#search_endd').val() + ' 00:00:00';

    $.ajax({
        'url' : '/getData/history',
        'method' : 'GET',
        'data' : {
            'searchPattern':searchPattern,
            'srt_dttm':srt_dttm,
            'end_dttm':end_dttm
        },
        'success' : function(result){
            console.log(result);
            cb(result.data)
        },
        'failure' : function(error){
            console.log(error);
        }

    })    
}
//

// recreate table data
function redrawTable(historyData){
    var tbody = $('tbody');
    tbody.empty();
    historyData.forEach(function(data){
        var head = '<tr history_id=' + data.HISTORY_ID + '>'
        var name = '<td crgr_id=' + data.CRGR_ID + ' >' + data.CRGR_NM + '</td>';
        var comp = '<td co_id=' + data.CO_ID + '>' + data.CO_NM + '</td>';
        var startT = '<td>' + data.SRT_DTTM + '</td>';
        var endT = '<td>' + data.END_DTTM + '</td>';
        var task = '<td>' + data.TASK + '</td>'
        var end = '</tr>'
        var entry = head + name + comp + startT + endT + task + end;
        tbody.append(entry);
    })
}


