var messageTip=function(){
    
    var tip=document.createElement("div")
    tip.className="message-tip"
    tip.innerHTML="欢迎光临"
    tip.style.display="none"
    document.body.appendChild(tip)
    return {
        show:function(text,offset){
            tip.innerHTML=text||""
            tip.style.display="inline"
            if(offset&&offset.top&&offset.left){
                $(tip).css({
                    position:"absolute",
                    top:offset.top,
                    left:offset.left
                })
            }
            $(tip).addClass("show")
            setTimeout(function(){
                $(tip).removeClass("show")
                setTimeout(function(){
                    tip.style.display="none"
                },1000)
            },2000)
        }
    }
}();

$(".go_top").click(function(){
  $(document.body).animate({
    scrollTop:0
  })
})