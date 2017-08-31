
// Date display
var now = new Date();
d3.select('#today').text(now);
setInterval(()=>{
    now = new Date();
    d3.select('#today').text(now);
},1000)
// Date Display End


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


// Start Submit Event
// insert or update history table
// when data has row id => then update
// no row id => then insert
d3.select('#submit').on('click', function(){
    // check id and name from sbsdb
    alert('submit');
});
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

disableAutoComplete()  // initially disable auto complete
attachEventEnableAutoComplete() // enable autocomplete when keyup event occur

