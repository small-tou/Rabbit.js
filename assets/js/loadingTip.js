var loadingTip=function(){
    
    var tip=document.createElement("div")
    tip.className="loading-tip"
    tip.innerHTML="正在加载中。。。"
    document.body.appendChild(tip)
    return {
        show:function(text){
            tip.innerHTML=text||"正在加载中"
            $(tip).css("display","block")
        },
        hide:function(){
            $(tip).css("display","none")
        }
    }
}();