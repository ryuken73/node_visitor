
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

Date.prototype.toISOString = function(){

	var year = this.getFullYear();
	var month = padZero(this.getMonth() + 1);
	var day = padZero(this.getDate());
	var hour = padZero(this.getHours());
	var minute = padZero(this.getMinutes());
	var second = padZero(this.getSeconds());

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
/*
$('input#keyword').on('keypress',function(event){
    console.log(event.keyCode);
    if(event.keyCode === 13){
        $('input#search').click();
    }
});
*/

/* d3 version
d3.select('input#keyword').on('keypress',function(d,i){
    console.log(d3.event.keyCode);
    if(d3.event.keyCode === 13){
    }   d3.select('input#search').dispatch('click')
})
*/

var inputBox = d3.select('input#keyword');
var beginBox = d3.select('input#search_begind');
var endBox = d3.select('input#search_endd');
var Boxes = [inputBox, beginBox, endBox];

Boxes.map(function(element){
    addEvent(element, 'keypress', function(){
        console.log(d3.event.keyCode);
        if(d3.event.keyCode === 13){
            d3.select('input#search').dispatch('click');
        }
    });
})

function addEvent(element, typeName, callback){
    element.on(typeName,function(d,i){
        callback();    
    });
}


/*
$('input#search_begind').on('keypress',function(event){
    console.log(event.keyCode);
    if(event.keyCode === 13){
        $('input#search').click();
    }
});
*/
/*
d3.select('input#search_begind').on('keypress',function(d,i){
    console.log(d3.event.keyCode);
    if(d3.event.keyCode === 13){
        d3.select('input#search').dispatch('click');
    }
});
*/
/*
$('input#search_endd').on('keypress',function(event){
    console.log(event.keyCode);
    if(event.keyCode === 13){
        $('input#search').click();
    }
});
*/


//


// set initial start and endtime ( endtime = start time + 30 minutes)
function initDate() {
    var startT = new Date();
    var endT = new Date(Date.now() + 1000 * 60 * 30 )
    console.log(startT);
    console.log(endT);
    var ISOTime = startT.toISOString();
    var ISOTimeEnd = endT.toISOString();
    d3.select('#startTime').property('value',ISOTime);
    d3.select('#endTime').property('value',ISOTimeEnd);    
}
//

// set initial search begin and end date
function initSearchDay(){
    var date1 = new Date();
    var date2 = new Date();
    var beginD = date1.getDayString(DAYOFFSET);
    var endD = date2.getDayString(0);
    d3.select('#search_begind').property('value',beginD);
    d3.select('#search_endd').property('value',endD); 
}
//

// Search button click Event
d3.select('#search').on('click', function(){
    //hideCancelBTN();
    getHistory(redrawTable);
})
//

function showCancelBTN(){
    d3.select('input#cancel').style('visibility','visible')
}


function hideCancelBTN(){
    //d3.select('input#search').dispatch('click');
    d3.select('input#cancel').style('visibility','hidden')

}

d3.select('input#cancel').on('click',function(){
    console.log('remove click')
    d3.select('input#search').dispatch('click');
    //hideCancelBTN();
})

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
    result.CRGR_NM = d3.select('#engName').property('value');
    result.CRGR_ID = d3.select('#engName').attr('engID') ? d3.select('#engName').attr('engID') : 100;
    result.CO_NM = d3.select('#compNM').property('value');
    result.CO_ID = d3.select('#compNM').attr('coID') ? d3.select('#compNM').attr('coID') : 100 ;
    result.SRT_DTTM = d3.select('#startTime').property('value');
    result.END_DTTM = d3.select('#endTime').property('value');
    result.TASK = d3.select('#task').property('value');
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

    // click on date
    // automatically change current time
    $('#history_table tbody').on('click','tr td[contenteditable="true"].endTime',function(){
        console.log($(this));
        console.log($(this).text());
        var date = new Date();
        var now = date.toISOString();
        $(this).text(now);
        setEndOfContenteditable(this);
        $(this).trigger('input');
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

// stackoverflow , how to move cursor to end of element
function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    { 
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
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
    var searchPattern = d3.select('#keyword').property('value');
    var srt_dttm = d3.select('#search_begind').property('value') + ' 00:00:00';
    var end_dttm = d3.select('#search_endd').property('value') + ' 23:59:59';
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
function redrawTable_simple(historyData){

    // update data is very difficult
    // remove previous table make simple but become ugly
    d3.select('tbody').selectAll('tr').remove();

    var tr = d3.select('tbody').selectAll('tr').data(historyData,function(d){return d.HISTORY_ID}).classed('editing',false)

    // remove editing class from all td
    d3.select('tbody').selectAll('tr').selectAll('td').classed('editing',false);

    // revmoe data
    var backgroundColor = d3.select('body').style('background-color')
    tr.exit().selectAll('td').transition().duration(1000).style('color',backgroundColor).remove()
    

    // new data
    var transitionForTR = d3.transition().duration(500)
    tr = tr.enter().append('tr').attr('history_id', getValue('HISTORY_ID')) 
    tr.append('td').attr('crgr_id', getValue('CRGR_ID')).text(getValue('CRGR_NM'))
    .style('color',backgroundColor).transition(transitionForTR).style('color','white')
    tr.append('td').attr('co_id', getValue('CO_ID')).text(getValue('CO_NM'))
    .style('color',backgroundColor).transition(transitionForTR).style('color','white')
    tr.append('td').attr('class','startTime').attr('contentEditable','true').text(getValue('SRT_DTTM'))
    .style('color',backgroundColor).transition(transitionForTR).style('color','white')
    tr.append('td').attr('class','endTime').attr('contentEditable','true').text(getValue('END_DTTM'))    
    .style('color',backgroundColor).transition(transitionForTR).style('color','white')
    tr.append('td').attr('class','td_task').attr('contentEditable','true').text(getValue('TASK'))  
    .style('color',backgroundColor).transition(transitionForTR).style('color','white')

    tr.append('td')
      .append('img').attr('tabindex','0').attr('class','uptHistory')
      .attr('history_id',getValue('HISTORY_ID')).attr('src','/images/glyphicons-199-ok-circle.png')

    tr.append('td')
      .append('img').attr('tabindex','0').attr('class','delHistory')
      .attr('history_id',getValue('HISTORY_ID')).attr('src','/images/glyphicons-198-remove-circle.png')

}

// redraw table data real d3.js
function redrawTable(historyData){
    
    var transitionForTR = d3.transition().duration(300)
    var backgroundColor = d3.select('body').style('background-color')

    // update data
    var tr = d3.select('tbody').selectAll('tr').data(historyData,function(d){return d.HISTORY_ID}).classed('editing',false)

    // remove editing class from all td
    d3.select('tbody').selectAll('tr').selectAll('td').classed('editing',false);

    // revmoe data

    var removeRows = tr.exit()
    removeRows.selectAll('td').transition().duration(1000).style('color',backgroundColor).remove()
    removeRows.transition().duration(1001).remove()

    // make tabular data
    // 1. from collection data enter tr with rows ( each tr's data = {'id':100, 'name':'ryu'....})
    // 2. very complicated (refer to extractRow and colnames)
    //    1) from object {'id':100, 'name':'ryu'}, make array like [{key:'id', value:100},{key:'name', value:'ryu'}]
    //    2) enter above array data to td
    
    colnames = ['CRGR_NM', 'CO_NM', 'SRT_DTTM', 'END_DTTM', 'TASK']
    var extractRow = function(rowObj){
        return colnames.map(function(colname){
            return {colname : colname, value : rowObj[colname]}
        })
    }

    // add new tr
    tr = tr.enter().append('tr').attr('history_id', getValue('HISTORY_ID')) 

    // add new td with data object {colname:'xxx', value:'yy'}
    tr.selectAll('td').data(extractRow).enter().append('td').text(function(d){return d.value})    

    // add new td with no data ( just have image )
    tr.append('td')
    .append('img').attr('tabindex','0').attr('class','uptHistory')
    .attr('history_id',getValue('HISTORY_ID')).attr('src','/images/glyphicons-199-ok-circle.png')

    tr.append('td')
    .append('img').attr('tabindex','0').attr('class','delHistory')
    .attr('history_id',getValue('HISTORY_ID')).attr('src','/images/glyphicons-198-remove-circle.png')

    tr.selectAll('td').style('color',backgroundColor).transition(transitionForTR).style('color','white')

    tr.each(function(parentData,index){
        var eachTR = d3.select(this) // must be tr
        eachTR.selectAll('td').filter(function(d,i){if(i==0) return true}).attr('crgr_id', function(d,i){ return parentData.CRGR_ID;})        
        eachTR.selectAll('td').filter(function(d,i){if(i==1) return true}).attr('co_id', function(d,i){ return parentData.CO_ID;})
        eachTR.selectAll('td').filter(function(d,i){if(i==2) return true}).attr('class', 'startTime').attr('contentEditable','true')
        eachTR.selectAll('td').filter(function(d,i){if(i==3) return true}).attr('class', 'endTime').attr('contentEditable','true')
        eachTR.selectAll('td').filter(function(d,i){if(i==4) return true}).attr('class', 'td_task').attr('contentEditable','true')
    })   
    
}


function getValue(colname){
    return function(d,i){
        return d[colname];
    } 
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
// when editting starts, background color changes.
// because contenteditable does not support change(), use input event
$('#history_table tbody').on('input','tr td',function(){
    $('[contenteditable="true"]:focus').addClass('editing');
    $('[contenteditable="true"]:focus').parent().addClass('editing');
    //showCancelBTN();
})


// main
initSearchDay();
disableAutoComplete();  // initially disable auto complete
attachEventEnableAutoComplete(); // enable autocomplete when keyup event occur
addClickEvtOnTbody();
addUpdateEvtOnTbody();
getHistory(redrawTable);