queue_do
========

异步队列同步化，支持递归嵌套

基于nodejs模块封装，同样适用于前端的异步同步化。

#安装

<pre>
npm install queuedo
</pre>

web版见：lib/queue_do_webjs.js


#原理和使用

文章见：http://www.html-js.com/?p=1474

支持异步同步化
同步化后成队列后执行回调方法
也可以异步处理队列，同时处理完毕后调用回调方法
具体见代码中的注释

 * @param array list 需要处理的数据的数组，作为参数传入handle_func第一个参数。
 * @param function handle_func 处理方法，第一个参数为数组的一个元素，第二个参数传入的是下一个loop方法，第三个参数是其loop的context
 * @param function next_func 队列处理完毕后调用的方法。
 * @param boolen isAsyn 是否异步，如果是true，则不会同步化，可以利用next_func获取处理完毕的信号

#一个例子，递归遍历某个文件夹下所有的图片并压缩到1000宽度。

<pre>
var fs   = require('fs');
var path = require('path');
//源文件
var source = '/Applications/XAMPP/xamppfiles/htdocs/htmljs';
//目标文件
var target = '/Applications/XAMPP/xamppfiles/htdocs/htmljs_temp';
//引入gm做图片处理器
var gm = require('gm');
var imageMagick = gm.subClass({
    imageMagick: true
});
var queue_do=require("./queue_do.js")
var walk=function(_path,callback,next_func){
    var list=[]
    if(fs.existsSync(_path)){
        var stat=fs.statSync(_path)
        if(stat.isDirectory()){
            fs.readdir(_path,function(error,files){
                queue_do(files,function(__path,next,context){
                    walk(_path+"/"+__path,callback,function(){
                        next.call(context)
                    })
                },function(){
                    next_func()
                })
            })
        }else{
            callback(_path)
            next_func()
        }
    }
}
walk(source,function(list){
    console.log(list)
},function(){
    console.log("all finish!")
})

</pre>

几个异步方法的同步化：
下面的例子是同步去请求豆瓣三个api，最后请求完后显示出来的例子。
只是示例，完整程序的一部分，不能运行。
<pre>
var queuedo=require("queuedo");
var Douban = require("douban");
module.exports = function(req, res) {
    var config = {
        app_key:"0bb4b9fc67f9b013231e2df537ed1039",
        app_secret:"e7434521cb0c70ad",
        redirect_uri:"http://localhost:8080/sina_auth_cb",
        access_token:req.cookies.token
    }
    var api = new Douban(config);
    var datas=[
        
    ]
    var functions=[
    function(callback){
        api.shuo.statuses({
            source:config.app_key,
            text:"hello nodejs"+Math.random()
        },function(error,data){
            datas.push({
                api:"shuo.statuses",
                data:data
            });
            callback();
        });
    }, function(callback){
        api.shuo.home_timeline({},function(error,data){
            datas.push({
                api:"shuo.home_timeline",
                data:data
            })
            callback();
        });
    }, function(callback){
        api.shuo.user_timeline({
            screen_name:"mier963"
        },function(error,data){
            datas.push({
                api:"shuo.user_timeline",
                data:data
            })
            callback();
        });
    }];
    queuedo(functions,function(func,next,context){
        func(function(){
            next.call(context);
        });
    },function(){
        res.render("shuo.html",{
            data:datas
        })
    });
}
</pre>