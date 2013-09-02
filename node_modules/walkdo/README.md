node-walk
=========

遍历文件夹并处理所得文件，支持同步遍历和异步遍历，同步遍历顺序严格使用深度搜索算法

#下载

npm install walkdo

#使用

<pre>
var walk=require("walkdo")
//源文件
var source = '/Applications/XAMPP/xamppfiles/htdocs/node/walk/';
//同步深度遍历文件夹
walk(source,function(list,next,context){
    console.log(list)
    next.call(context)
},function(){
    console.log("all finish!")
})
//深度遍历，异步处理。
walk(source,function(list,next,context){
    console.log(list)
    next.call(context)
},function(){
    console.log("all finish!")
},true)
</pre>

实际使用实例见：https://github.com/xinyu198736/dependparser