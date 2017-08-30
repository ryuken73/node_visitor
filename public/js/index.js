var now = new Date();
d3.select('#today').text(now);
setInterval(()=>{
    now = new Date();
    d3.select('#today').text(now);
},1000)

d3.select('#submit').on('click', function(){
    // check id and name from sbsdb
    alert('submit');
});

var MAXVISIBLE = 20;

$('#engName').autocomplete({
    source: function(request,response){      
    $.ajax({
            'url':'/getUser/search/'+encodeURIComponent(request.term),
            'type':'GET',
            'success':function(result){
                response(
                        $.map(result.slice(0,MAXVISIBLE),function(item){
                            return{
                                label : item.USER_NM +' - '+ item.CO_NM,
                                value: { name : item.USER_NM , company : item.CO_NM }
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
        event.preventDefault();
        var promise = new Promise(function(resolve,reject){
            $('#engName').val(ui.item.value.name);
            $('#compNM').val(ui.item.value.company);
            resolve()
        })
        promise.then(function(result){
            console.log($('#engName').val());
            // submit code 넣으면 된다..검색이라든가..뭐
        });
    }		
});	
