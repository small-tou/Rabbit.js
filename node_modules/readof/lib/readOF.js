/**
 *读取远程文件到指定路径并提供回调
 *@param picUrl string 要读取的图片的路径
 *@param targetPath string 目标存储路径，写完整，类型自行判断，无法根据content-type判断，可伪装
 *@param callback function 回调方法，写入完成或者出错的时候回调 callback(info,error) 
 *回调数据 出错时为空对象{}，成功时为 {
                        targetPath:targetPath,
                        picUrl:picUrl
                    }
 *@author yutou 
 *@email xinyu198736@gmail.com
 *@blog http://www.html-js.com
 *@source https://bitbucket.org/xinyu198736/readonlinefile/wiki/Home
 */
exports.read = function (picUrl,targetPath,callback) {
    callback=callback||function(){}
    var http = require('http');
    var url = require('url');
    var fs=require("fs")
    /* var mime= {
        "text/css":"css",
        "image/gif":"gif",
        "text/html":"html",
        "image/x-icon":"ico",
        "image/jpeg":"jpeg",
        "image/jpeg":"jpg",
        "text/javascript":"js",
        "application/json":"json",
        "application/pdf":"pdf",
        "image/png":"png",
        "image/svg+xml":"svg",
        "application/x-shockwave-flash":"swf",
        "image/tiff":"tiff",
        "text/plain":"txt",
        "audio/x-wav":"wav",
        "audio/x-ms-wma":"wma",
        "video/x-ms-wmv":"wmv",
        "text/xml":"xml"
    };*/ 
    var urlData = url.parse(picUrl);
    var request = http.createClient(80, urlData.host).
    request("GET", urlData.pathname, {
        "host": urlData.host
    });
    request.on('response', function(response) {
        if(response.statusCode!="200"){
            callback.call(response,{},{
                error:"readOnlineFile 404 request at "+picUrl+" "
            })
            return;
        }
        var resultBuffer = new Buffer(response.headers["content-length"]*1+2);
        var buffers=[]
        response.on('end', function() {
            for(var i=0,size=buffers.length,pos=0;i<size;i++){
                buffers[i].copy(resultBuffer,pos);
                pos += buffers[i].length;
            }
            try{
                fs.writeFile(targetPath,resultBuffer,function(e){
                    if(e){
                        callback.call(response,{},{
                            error:"readOnlineFile write file error: "+e+" "
                        })
                    } 
                    callback.call(response,{
                        targetPath:targetPath,
                        picUrl:picUrl
                    })
                })
            }catch(e){
                callback.call(response,{},{
                    error:"readOnlineFile write file error: "+e+" "
                })
            }
           
        });
        response.on('data', function(chunk) {
            if (response.statusCode == 200){
                buffers.push(new Buffer(chunk))
            } 
        });
    });
    request.end();
};

