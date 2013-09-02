var querystring = require('querystring');
var https = require('https');
var path = require("path");
var fs = require('fs');
var underscore = require("underscore");
var md5 = require("MD5");
var request = require('request');
var FormData = require('form-data');

var apiGroup={
    status:{
        scope: ["status_update", "read_user_status", "publish_comment", "read_user_comment"],
        methods: ["set", "addComment", "forward", "get", "gets", "getComment", "getEmoticons"]
    },
    photos:{
        scope: ["create_album", "read_user_album", "photo_upload", "read_user_photo", "publish_comment", "read_user_comment", "send_request", "deal_request"],
        methods:["createAlbum", "getAlbums", "upload", "get", "addComment", "getComments", "tag", "getTags", "acceptTag", "refuseTag"]
    },
    blog: {
        scope: ["publish_blog", "read_user_blog", "read_user_comment", "publish_comment", "publish_blog"],
        methods: ["addBlog", "gets", "get", "getComments", "addComment"]
    },
    friends: {
        scope: [],
        methods: ["areFriends", "get", "getSameFriends", "getFriends", "getAppUsers", "getAppFriends", "search"]
    },
    users: {
        scope: [],
        methods: ["getInfo", "getLoggedInUser", "hasAppPermission", "isAppUser", "getProfileInfo", "getVisitors"]
    },
    share: {
        scope: ["publish_share", "read_user_comment", "read_user_share", "publish_comment"],
        methods: ["publish", "share", "getComments", "addComment"]
    },
    like: {
        scope: ["operate_like"],
        methods: ["isLiked", "getCount", "like", "unlike"]
    },
    feed: {
        scope: ["read_user_feed", "publish_feed"],
        methods: ["get", "publish", "publishFeed"]
    },
    pages: {
        scope: [],
        methods: ["getManagedList", "setStatus", "isFan", "getCategories", "getInfo", "isAdmin", "isPage", "getList", "getFansList"]
    },
    notifications: {
        scope:[],
        methods: ["send"]
    }
};
var RenRen = function (options) {
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
    //根据api_group自动生成scope
    var scopes=[]
    this.options.api_group.forEach( function (v) {
        if(apiGroup[v]){
            scopes=scopes.concat(apiGroup[v].scope);
        };
    });
    underscore.uniq(scopes);
    this.options.scope=scopes.join(" ");
    this.base = this._base();
    this.oauth = this._oauth();
    this.status = this._status();
    this.photos = this._photos();
    this.blog = this._blog();
    this.friends = this._friends();
    this.users = this._users();
    this.share = this._share();
    this.like = this._like();
    this.feed = this._feed();
    this.pages = this._pages();
    this.notifications = this._notifications();
};
RenRen.prototype = {
    API_BASE_URL: 'http://api.renren.com/restserver.do',
    API_HOST: 'api.renren.com',
    API_URI_PREFIX: '/restserver.do'
};
RenRen.prototype._base = function () {
    var self = this;
    return {
        _post:function (options, callback,isMulti) {
            if (self.options.access_token) {
                options['access_token'] = self.options.access_token;
            }
            options['format'] = "JSON";
            options['v'] = "1.0";
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
            options['sig'] = md5(sig);
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
                        callback({}, data.toString())
                    })
                    res.on("close", function(data) {
                        callback({error:data}, data.toString())
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
                    callback && callback({}, body);
                });
            }
        }
    }
};
RenRen.prototype._oauth = function () {
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
            return  'https://graph.renren.com/oauth/authorize?' + querystring.stringify(options);
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
                host:"https://graph.renren.com",
                path:'/oauth/token',
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

RenRen.prototype._status = function () {
    var status = {};
    var self = this;
    apiGroup.status.methods.forEach(function (m) {
        status[m] = function (options, callback) {
            options.method = "status." + m;
            self.base._post(options, callback);
        }
    });
    return status;
};
RenRen.prototype._photos=function(){
    var photos = {};
    var self = this;
    apiGroup.photos.methods.forEach(function (m) {
        photos[m] = function (options, callback) {
            options.method = "photos." + m;
            self.base._post(options, callback, (m=="upload"?true:false));
        }
    });
    return photos;
}
RenRen.prototype._blog=function(){
    var blog = {};
    var self = this;
    apiGroup.blog.methods.forEach(function (m) {
        blog[m] = function (options, callback) {
            options.method = "blog." + m;
            self.base._post(options, callback);
        }
    });
    return blog;
}
RenRen.prototype._friends=function(){
    var friends = {};
    var self = this;
    apiGroup.friends.methods.forEach(function (m) {
        friends[m] = function (options, callback) {
            options.method = "friends." + m;
            self.base._post(options, callback);
        }
    });
    return friends;
}
RenRen.prototype._users=function(){
    var users = {};
    var self = this;
    apiGroup.users.methods.forEach(function (m) {
        users[m] = function (options, callback) {
            options.method = "users." + m;
            self.base._post(options, callback);
        }
    });
    return users;
}
RenRen.prototype._share=function(){
    var share = {};
    var self = this;
    apiGroup.share.methods.forEach(function (m) {
        share[m] = function (options, callback) {
            options.method = "share." + m;
            self.base._post(options, callback);
        }
    });
    return share;
}
RenRen.prototype._like=function(){
    var like = {};
    var self = this;
    apiGroup.like.methods.forEach(function (m) {
        like[m] = function (options, callback) {
            options.method = "like." + m;
            self.base._post(options, callback);
        }
    });
    return like;
}
RenRen.prototype._feed=function(){
    var feed = {};
    var self = this;
    apiGroup.feed.methods.forEach(function (m) {
        feed[m] = function (options, callback) {
            options.method = "feed." + m;
            self.base._post(options, callback);
        }
    });
    return feed;
}
RenRen.prototype._pages=function(){
    var pages = {};
    var self = this;
    apiGroup.pages.methods.forEach(function (m) {
        pages[m] = function (options, callback) {
            options.method = "pages." + m;
            self.base._post(options, callback);
        }
    });
    return pages;
}
RenRen.prototype._notifications=function(){
    var notifications = {};
    var self = this;
    apiGroup.notifications.methods.forEach(function (m) {
        notifications[m] = function (options, callback) {
            options.method = "notifications." + m;
            self.base._post(options, callback);
        }
    });
    return notifications;
}
exports = module.exports = RenRen;
