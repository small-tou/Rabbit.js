node-weibov2
============

基于node-weibo-v2改进的node平台微博v2接口sdk

#安装

  npm install weibov2
  
#特性

市面上的weibo nodejs sdk 不少，但是有些是1.0，有些2.0的大部分功能不够完善，用的人少，所以有问题也很少改进。

这个模块是根据weibo-v2.js（[[https://github.com/vzhishu/node-weibo-v2]]）改进而来。有以下改进。

* 支持从本地发图片，也就是upload，目前看到的2.0的nodejs sdk，发现这个功能都没有实现的。我参考一个1.0的框架实现了此功能。
* 支持url缩短，url缩短需要向sdk传入多个索引名相同的配置属性，js不支持，在此模块中，多个相同索引名的属性，只需要这样传入：
    <pre>var prefix=""
    var option={
        access_token:token
    }
    for(var i=0;i<reg_result.length;i++){
        option[prefix+"url_long"]=reg_result[i]
        prefix+="__multi__"
    } 
    api.statuses.shorten(option,function(_d){
       //...                                                
    })</pre>
在模块内发出请求之前会把所有的__multi__替换成空，以此实现传入多个相同名字的参数。
* 原来的weibo-v2.js里面有很多特殊的空字符，导致js完全执行不了，会一直报错，而且很多json的最后都写着逗号，编辑器会一直报错。所以我觉得这个模块挺坑爹的，对这些问题都做了改进，可以正常运行。
* 错误处理，weibo-v2.js里面不光没有做统一的错误处理，还把返回的json格式打乱了，做了统一处理，每次callback，如果第二个参数存在，就说明api返回了错误，error即为返回的错误json生成的对象。

#使用示例-上传图片和错误处理

<pre>
var wb = require('./lib/weibo-v2.js').WeiboApi;
 var opts = {
   app_key       :  config.weibo_key ,
   app_secret    :  config.weibo_secret 
};
var api = new wb(opts);
//上传图片
api.statuses.upload({
    access_token:token,
    status:data.content
},data.pic,function(_d,error){
if(error){console.log(" upload error :"+error);return;}
console.log("upload success")
})
</pre>

#授权示例
以express和weibov2结合来示例：

<pre>
var weibo2 = require('weibov2');
var express = require('express')

var app = express();
//省略express初始化配置若干句

auth = function(req, res) {
    var opts = {
        app_key       :  APP_KEY ,
        app_secret    :  APP_SECRET ,
        redirect_uri : 'http://'+req.host+':'+PORT+'/sina_auth_cb'
    };
    console.log('http://'+req.host+':'+PORT+'/sina_auth_cb')
    var api = new weibo2.WeiboApi(opts);
    var auth_url = api.getAuthorizeUrl({
        redirect_uri : 'http://'+req.host+':'+PORT+'/sina_auth_cb'
    });
    console.log(auth_url);
    res.writeHead(
        302, 
        {
            'Location': auth_url
        }
        );
    res.end();    
};

sina_auth_cb = function(req, res, query_info) {
    var code = req.query.code;
    if(!code) {
        req.session.index_error="授权失败，请重试！（code获取失败）"
        res.redirect('/');
        return;
    };
    console.log(code)
    var opts = {
        app_key       :  APP_KEY ,
        app_secret    :  APP_SECRET ,
        'redirect_uri' : 'http://'+req.host+':'+PORT+'/sina_auth_cb'
    };
    var api = new weibo2.WeiboApi(opts);
    api.accessToken(
    {
        code : code
    },
    function(data) {
       
        var access_token=data.access_token
        api.users.show({
            uid:data.uid,
            access_token:data.access_token
        },function(d){
            var user=d;
           
            console.log("oauth success! userid:"+user.id)
            //将用户id和用户名存储到cookie，下次无需认证直接可以使用。
            res.cookie("userid", user.id,{
                expires: new Date(Date.now() + 604800000), 
                httpOnly: true
            });
            res.cookie("username", user.name,{
                expires: new Date(Date.now() + 604800000), 
                httpOnly: true
            });
            //将用户的accesstoken存储到数据库，在后台可以直接用这两个信息发送微博，无需用户参与。
            //。。。。
            //认证成功跳转到oauth页面
            res.redirect('oauth');
        })   
    }
    );

};

app.get("/auth",auth)
app.get("/sina_auth_cb",sina_auth_cb)
</pre>