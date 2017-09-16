
DAYOFFSET = -1; //default begind offset days from today

// Date display
var now = new Date();
d3.select('#today').text(now);
setInterval(()=>{
    now = new Date();
    d3.select('#today').text(now);
},1000)
// Date Display End


// Date help function
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

Date.prototype.getDayString = function(offset) {
    this.setDate(this.getDate() + offset );
 	var year = this.getFullYear();
	var month = padZero(this.getMonth() + 1);
	var day = padZero(this.getDate());
    return year+'-'+month+'-'+day;       
}

Date.prototype.getMidnightString = function(date){
	var year = date.getFullYear();
	var month = padZero(date.getMonth() + 1);
	var day = padZero(date.getDate());
	return year+'-'+month+'-'+day+' 00:00:00';
}

// END Help function


// search input enter press event hander
$('input#keyword').on('keypress',function(event){
    console.log(event.keyCode);
    if(event.keyCode === 13){
        $('input#search').click();
    }
});

$('input#search_begind').on('keypress',function(event){
    console.log(event.keyCode);
    if(event.keyCode === 13){
        $('input#search').click();
    }
});

$('input#search_endd').on('keypress',function(event){
    console.log(event.keyCode);
    if(event.keyCode === 13){
        $('input#search').click();
    }
});

//


// set initial start and endtime ( endtime = start time + 30 minutes)
function initDate() {
    var startT = new Date();
    var endT = new Date(Date.now() + 1000 * 60 * 30 )
    console.log(startT);
    console.log(endT);
    var ISOTime = startT.toISOString(startT);
    var ISOTimeEnd = endT.toISOString(endT);
    $('#startTime').val(ISOTime);
    $('#endTime').val(ISOTimeEnd);
}
//

// set initial search begin and end date
function initSearchDay(){
    var date1 = new Date();
    var date2 = new Date();
    var beginD = date1.getDayString(DAYOFFSET);
    var endD = date2.getDayString(0);
    $('#search_begind').val(beginD);
    $('#search_endd').val(endD);
}
//

// Search button click Event
d3.select('#search').on('click', function(){
    getHistory(redrawTable);
})
//

// Submit Event
// insert or update history table
// if data has row id => Update
// else => Insert   

d3.select('#submit').on('click', function(){
    // check id and name from sbsdb
    var params = getFieldValue();

    validateField(params)
    .then(function(isvalidated){
        console.log('validated')
        return inputHistory(params);
    })
    .then(function(result){
        console.log('insert success')
        getHistory(redrawTable);
        clearFieldValue();
        console.log(result);
    })
    .then(null, function(err){
        console.error(err);
        alert(err);
    })
});

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

        if(validatedDateFormat(params)){ // check date format
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
            });
        } else {
            reject('시작 또는 종료시간 체크!');
        }
    })
}

function validatedDateFormat(param){
    var datePattern = "\\d\\d\\d\\d-\\d\\d-\\d\\d \\d\\d:\\d\\d:\\d\\d"; //2017-09-11 01:45:00 
    var pattern = new RegExp(datePattern);
    var srt_dttm_rslt = pattern.test(param.SRT_DTTM);
    var end_dttm_rslt = pattern.test(param.END_DTTM);
    return srt_dttm_rslt && end_dttm_rslt
}

function inputHistory(params){
    return new Promise(function(resolve,reject){
        $.ajax({
            'url':'/setData',
            'type' : 'GET',
            'data' : params,
            'success' : function(result){
                console.log(result);
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
    });
}

function clearFieldValue(){
    $('#engName').val('');
    $('#compNM').val('');
    $('#task').val('');
    $('#startTime').val('');
    $('#endTime').val('');   
    $('#engName').attr('engID',undefined);
    $('#compNM').attr('coID',undefined);
    //initDate();
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
                            var CONM = item.CO_NM;
                            var MPNO = item.CRGR_MPNO ? item.CRGR_MPNO : '없음';
                            var TELNO = item.CRGR_TELNO ? item.CRGR_TELNO : '없음';
                            var EMAIL = item.CRGR_EMAIL ? item.CRGR_EMAIL : '없음';
                            var engInfo = item.CRGR_NM + ' ( ' + CONM + ' , ' + MPNO + ' , ' + TELNO + ' , ' + EMAIL + ' ) ';

                            return{                            
                                label : engInfo,
                                //value: { name : item.USER_NM , company : item.CO_NM },
                                value : item.CRGR_NM,
                                co : item.CO_NM,
                                engID : item.CRGR_ID,
                                coID : item.CO_ID
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
            $('#engName').attr('engID',ui.item.engID);
            $('#compNM').attr('coID',ui.item.coID);
            initDate();
            resolve()
        })
        
        promise.then(function(result){
            // submit code 넣으면 된다..검색이라든가..뭐
            //initDate();

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

// End autocomplete



// add delete event on image
function addClickEvtOnTbody(){
    $('#history_table tbody').on('click','tr td img.delHistory',function(){
        //alert('delete : ' + $(this).attr('history_id'));
        var historyID = $(this).attr('history_id')
        delHistory(this, historyID);
    });
}

function delHistory(element, id){
    $.ajax({
        'url' : /delData/ + id,
        'method' : 'GET',
        'success' : function(){
            getHistory(redrawTable);
        }
    })

}

// add update event on update image
function addUpdateEvtOnTbody(){
    // click on image
    $('#history_table tbody').on('click','tr td img.uptHistory',function(){
        //alert('delete : ' + $(this).attr('history_id'));
        var param = getUpdateValue($(this));
        uptHistory(param.historyID, param.SRT_DTTM, param.END_DTTM, param.TASK)
    });

    // enter on image
    $('#history_table tbody').on('keypress','tr td img.uptHistory',function(event){
        console.log('key pressed ' + event.keyCode);
        if(event.keyCode === 13){
            var param = getUpdateValue($(this));
            uptHistory(param.historyID, param.SRT_DTTM, param.END_DTTM, param.TASK)
        }

    })

    // focus out => auto save 
    /* but tab does not work properly
    $('#history_table tbody').on('focusout','tr td[contenteditable="true"]',function(){
        console.log('focus out');
        var param = getUpdateValue($(this).parent());
        uptHistory(param.historyID, param.SRT_DTTM, param.END_DTTM, param.TASK)
    })
    */    
}

function getUpdateValue(elementWithHistoryID){
    var historyID = $(elementWithHistoryID).attr('history_id');
    console.log(historyID);
    var targetTR = $('tr[history_id='+historyID+']');

    var result = {};
    result.historyID = historyID;
    result.SRT_DTTM = targetTR.children('td.startTime').text();
    result.END_DTTM = targetTR.children('td.endTime').text();
    result.TASK = targetTR.children('td.td_task').text();
    return result;
}

function uptHistory(id, startT, endT, task){
    $.ajax({
        'url' : /uptData/ + id,
        'method' : 'GET',
        'data' : {
            SRT_DTTM : startT,
            END_DTTM : endT,
            TASK : task
        },
        'success' : function(){
            getHistory(redrawTable);
        }
    })
}

// End add delete event


// get History function 

function getHistory(cb){
    var searchPattern = $('#keyword').val();
    var srt_dttm = $('#search_begind').val() + ' 00:00:00';
    var end_dttm = $('#search_endd').val() + ' 23:59:59';
    if(srt_dttm >= end_dttm) {
        alert('종료날짜가 시작일보다 커야합니다.');
        return false
    }

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
        var startT = '<td class="startTime" contentEditable="true">' + data.SRT_DTTM + '</td>';
        var endT = '<td class="endTime" contentEditable="true">' + data.END_DTTM + '</td>';
        var task = '<td class="td_task" contentEditable="true">' + data.TASK + '</td>'
        var uptIcon = '<td><img tabindex="0" class="uptHistory" history_id=' + data.HISTORY_ID + ' src="/images/glyphicons-199-ok-circle.png"></img></td>'
        var delIcon = '<td><img tabindex="0" class="delHistory" history_id=' + data.HISTORY_ID + ' src="/images/glyphicons-198-remove-circle.png"></img></td>'
        var end = '</tr>'
        var entry = head + name + comp + startT + endT + task + uptIcon + delIcon + end;
        tbody.append(entry)
    })
}

// refresh engInfo event attachEventEnableAutoComplete
d3.select('#refreshEng').on('click', function(){
    $.ajax({
        'url' : '/getUser/refreshEngList',
        'method' : 'GET',
        'success' : function(result){
            if(result.length > 0){
                alert('refresh done : total ' + result.length);
            }
        }
    })
})

// attach event to contentEditable
// when editing background color change
// not support change(), use input event
$('#history_table tbody').on('input','tr td',function(){
    $('[contenteditable="true"]:focus').addClass('editing');
    $('[contenteditable="true"]:focus').parent().addClass('editing');
})


// main
initSearchDay();
disableAutoComplete();  // initially disable auto complete
attachEventEnableAutoComplete(); // enable autocomplete when keyup event occur
addClickEvtOnTbody();
addUpdateEvtOnTbody();
getHistory(redrawTable);