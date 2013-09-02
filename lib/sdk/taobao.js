var querystring = require('querystring');
var https = require('https');
var path = require("path");
var fs = require('fs');
var underscore = require("underscore");
var md5 = require("MD5");
var request = require('request');
var FormData = require('form-data');

var apiGroup={
    taobaoke:{
        scope: [],
        methods: ["items.get","items.detail.get","items.coupon.get","items.relate.get","items.convert","caturl.get","listurl.get","report.get","shops.convert","shops.get","shops.relate.get"]
    },
    products:{
        scope:[],
        methods:["search","add","get","img.delete","img.upload","propimg.delete","propimg.upload","update"]
    },
    user:{
        scope:[],
        methods:["buyer.get","get","seller.get"]
    },
    users:{
        scope:[],
        methods:["get"]
    },
    item:{
        scopre:[],
        methods:["add","anchor.get","delete","get","img.delete","img.upload","joint.img","joint.propimg","price.update","propimg.delete","propimg.upload","quantity.update","recommend.add","recommend.delete","sku.add","sku.delete","sku.get","sku.price.update","sku.update","skus.get","templates.get","update","update.delisting","update.listing"]
    }
}
var Taobao = function (options) {
    this.options = {
        app_key:null,
        app_secret:null,
        access_token:null,
        user_id:0,
        refresh_token:null,
        format:"JSON",
        redirect_uri:"",
        api_group:[],
        scope:""
    };
    
    underscore.extend(this.options, options);
    this.base=this._base();
    this.oauth=this._oauth();
    this.taobaoke=this._taobaoke();
    this.products=this._products();
    this.user=this._user();
    this.users=this._users();
    this.item=this._item();
};
Taobao.prototype = {
    API_BASE_URL: 'https://eco.taobao.com/router/rest',
    API_HOST: 'eco.taobao.com',
    API_URI_PREFIX: '/router/rest'
};
Taobao.prototype._base = function () {
    var self = this;
    return {
        _post:function (options, callback,isMulti) {
            if (self.options.access_token) {
                options['access_token'] = self.options.access_token;
            }
            options['format'] = "json";
            options['v'] = "2.0";
            var keys = [], sig = "";
            for (var i in options) {
                keys.push(i);
            }
            keys.sort();
            keys.forEach(function (k) {
                if(k=="upload") return;
                sig += k + "=" + options[k]
            })
            sig += self.options.app_secret;
            if(isMulti){
                var form = new FormData();
                for (var i in options) {
                    if (i=="upload") {
                        form.append('upload', fs.createReadStream(options[i]));
                    } else {
                        form.append(i, options[i].replace(/__multi__/g, ""));
                    }
                };
                form.submit(self.API_BASE_URL, function(err, res) {
                    var chunks=[];
                    var size=0;
                    res.on("data",function (chunk) {
                        chunks.push(chunk);
                        size += chunk.length;
                    })
                    res.on("end",function () {
                        switch (chunks.length) {
                            case 0:
                                data = new Buffer(0);
                                break;
                            case 1:
                                data = chunks[0];
                                break;
                            default:
                                data = new Buffer(size);
                                for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
                                    chunks[i].copy(data, pos);
                                    pos += chunks[i].length;
                                }
                                break;
                        }
                        var e=null;
                        var body=data.toString();
                        try{
                            body=JSON.parse(body)
                            if(body.error_response){
                                e=new Error(body.error_response.msg)
                            }
                        }catch(error){
                            e=error;
                        }
                        callback && callback(e, body);
                    })
                    res.on("close", function(data) {
                        callback(new Error("connetion closed"), data.toString())
                    })
                });
            } else {
                var post_body = querystring.stringify(options);
                //用此方法可以传入多个相同名字的参数数组。
                post_body = post_body.replace(/__multi__/g, "");
                request.post({
                    headers:{
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    url: self.API_BASE_URL,
                    body: post_body
                }, function (e, r, body) {
                    if(!e){
                        try{
                            body=JSON.parse(body)
                            if(body.error_response){
                                e=new Error(body.error_response.msg)
                            }
                        }catch(error){
                            e=error;
                        }
                    }
                    callback && callback(e, body);
                });
            }
        }
    }
};
Taobao.prototype._oauth = function () {
    var self = this;
    return {
        //生成authorize url
        authorize:function () {
            var options = {
                client_id:self.options.app_key,
                response_type:"code",
                redirect_uri:self.options.redirect_uri,
                scope:self.options.scope
            };
            return  'https://oauth.taobao.com/authorize?' + querystring.stringify(options);
        },
        //用code换取accesstoken
        accesstoken:function (code, callback) {
            var options = {
                grant_type:"authorization_code",
                code:code,
                client_id:self.options.app_key,
                client_secret:self.options.app_secret,
                redirect_uri:self.options.redirect_uri
            };
            /**
             * {
    "access_token": "10000|5.a6b7dbd428f731035f771b8d15063f61.86400.1292922000-222209506",
    "expires_in": 87063,
    "refresh_token": "10000|0.385d55f8615fdfd9edb7c4b5ebdc3e39-222209506",
    "scope": "read_user_album read_user_feed"
}
             */
            var post_body = querystring.stringify(options);
            var headers = {};
            //    headers ["Content-length"] = post_body ? post_body.length : 0;
            headers ["Content-Type"] = 'application/x-www-form-urlencoded';
            var opts = {
                host:"https://oauth.taobao.com/",
                path:'token',
                method:'POST',
                headers:headers
            };
            request({
                url:opts.host+opts.path,
                method:'POST',
                headers:headers,
                body:post_body
            },function(e,r,body){
                console.log(body)
                body=JSON.parse(body)
                callback&&callback({},body)
            })
        //   self.base._request(opts, post_body, callback);
        }
    }
};

Taobao.prototype._taobaoke= function () {
    var taobaoke = {};
    var self = this;
    apiGroup.taobaoke.methods.forEach(function (m) {
        taobaoke[m] = function (options, callback) {
            options.method = "taobao.taobaoke." + m;
            self.base._post(options, callback);
        }
    });
    return taobaoke;
};
Taobao.prototype._products= function () {
    var products = {};
    var self = this;
    apiGroup.products.methods.forEach(function (m) {
        products[m] = function (options, callback) {
            options.method = "taobao.products." + m;
            self.base._post(options, callback);
        }
    });
    return products;
};
Taobao.prototype._user= function () {
    var user = {};
    var self = this;
    apiGroup.user.methods.forEach(function (m) {
        user[m] = function (options, callback) {
            options.method = "taobao.user." + m;
            self.base._post(options, callback);
        }
    });
    return user;
};
Taobao.prototype._users= function () {
    var users = {};
    var self = this;
    apiGroup.users.methods.forEach(function (m) {
        users[m] = function (options, callback) {
            options.method = "taobao.users." + m;
            self.base._post(options, callback);
        }
    });
    return users;
};
Taobao.prototype._item= function () {
    var item = {};
    var self = this;
    apiGroup.item.methods.forEach(function (m) {
        item[m] = function (options, callback) {
            options.method = "taobao.item." + m;
            self.base._post(options, callback);
        }
    });
    return item;
};
exports = module.exports = Taobao;
