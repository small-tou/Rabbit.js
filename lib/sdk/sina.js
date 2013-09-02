var querystring = require('querystring');
var https = require('https');
var path = require("path");
var fs = require('fs');
var underscore = require("underscore");
var request = require('request');
var FormData = require('form-data');
var snserror = require("snserror")

var apiGroup={
  statuses:{
    scope:[],
    methods:["update","destroy","upload","repost","upload_url_text","public_timeline","friends_timeline","home_timeline",
    "user_timeline","friends_timeline/ids","user_timeline/ids","repost_timeline","repost_timeline/ids",
    "repost_by_me","mentions","mentions/ids","bilateral_timeline","show","querymid","queryid","count",
    "to_me","to_me/ids","go"]
  },
  users:{
    scope:[],
    methods:["show", "domain_show", "counts", "show_rank", "get_top_status", "set_top_status", "cancel_top_status"]
  },
  comments:{
    scope:[],
    methods:[ "show", "by_me", "to_me", "timeline", "mentions", "show_batch", "create", "destroy", "destroy_batch", "reply"]
  },
  friendships:{
    scope:[],
    methods:["friends", "friends/in_common", "friends/bilateral", "friends/bilateral/ids", "friends/ids", "followers", "followers/ids", "followers/active", "friends_chain/followers", "show", "create", "destroy", "remark/update", "groups", "groups/timeline", "groups/timeline/ids", "groups/members", "groups/members/ids", "groups/members/description", "groups/is_member", "groups/listed", "groups/show", "groups/show_batch", "groups/create", "groups/update", "groups/destroy", "groups/members/add", "groups/members/add_batch", "groups/members/update", "groups/members/destroy", "groups/order"]
  },
  account:{
    scope:[],
    methods:["get_privacy", "profile/school_list", "rate_limit_status", "get_uid", "verify_credentials", "end_session"]
  },
  favorites:{
    scope:[],
    methods:["","ids", "show", "by_tags", "tags", "by_tags/ids", "create", "destroy", "destroy_batch", "tags/update", "tags/update_batch", "tags/destroy_batch"]
  },
  search:{
    scope:[],
    methods:['topics']
  }
}

var Weibo=function(options){
  this.options = { 
    app_key:null,
    app_secret:null,
    access_token:null,
    user_id:0,
    refresh_token:null,
    redirect_uri:"",
    api_group:[],
    scope:""
  };
  underscore.extend(this.options, options);
  this.oauth=this._oauth();
  this.base=this._base();
  this.statuses=this._statuses();
  this.users=this._users();
  this.comments=this._comments();
  this.friendships=this._friendships();
  this.search=this._search();
}

Weibo.prototype= {
  API_BASE_URL  :  'https://api.weibo.com/2/' ,
  API_HOST  :  'api.weibo.com' ,
  API_URI_PREFIX  :  '/2' ,
};
Weibo.prototype._base=function(){
  var self=this;
  return {
    "_post":function(options,callback,isMulti){
      if(isMulti){
        var form = new FormData();
        for (var i in options) {
          if (i=="pic") {
            form.append('pic', fs.createReadStream(options[i]));
          } else {
            form.append(i, options[i].replace(/__multi__/g, ""));
          }
        };
        form.submit(self.API_BASE_URL+options.path+".json", function(err, res) {
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
              if(body.error){
                e=new Error(snserror.sina[body.error_code]?snserror.sina[body.error_code].cn:body.error)
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
        var headers = {};
        headers ["Content-Type"] = 'application/x-www-form-urlencoded';
        var opts = {
          host:"https://api.weibo.com/",
          path:'2/'+options.path+".json",
          method:'POST',
          headers:headers
        };
        if(options.method){
          options.method=options.method.toUpperCase()
        }
        console.log(opts.host+opts.path+((options.method=="GET")?("?"+post_body):""))
        request({
          url:opts.host+opts.path+((options.method=="GET")?("?"+post_body):""),
          method:options.method||"POST",
          headers:headers,
          body:((options.method=="GET")?"":post_body)
        },function(e,r,body){
          if(!e){
            try{
              body=JSON.parse(body)
              if(body.error){
                e=new Error(snserror.sina[body.error_code]?snserror.sina[body.error_code].cn:body.error)
              }
            }catch(error){
              e=error;
            }
          }
          callback&&callback(e,body)
        })
      }
    }
  }
};
Weibo.prototype._oauth=function(){
  var self = this;
  return {
    //生成authorize url
    authorize:function () {
      var options = {
        client_id      :  self.options.app_key ,
        redirect_uri   :  self.options.redirect_uri ,
        response_type  :  'code' ,
        state          :  null ,
        display        :  'default' ,
        forcelogin:self.options.forcelogin||"false"
      };
      return  'https://api.weibo.com/oauth2/authorize?' + querystring.stringify(options);
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
      var post_body = querystring.stringify(options);
      var headers = {};
      headers ["Content-Type"] = 'application/x-www-form-urlencoded';
      headers [ "Content-length" ] =  post_body  ?  post_body . length  :  0 ;
      var opts = {
        host:"https://api.weibo.com/",
        path:'oauth2/access_token',
        method:'POST',
        headers:headers
      };
      request({
        url:opts.host+opts.path,
        method:'POST',
        headers:headers,
        body:post_body
      },function(e,r,body){
        if(!e){
          try{
            body=JSON.parse(body)
            if(body.error){
              e=new Error(snserror.sina[body.error_code]?snserror.sina[body.error_code].cn:body.error)
            }
          }catch(error){
            e=error;
          }
        }
        callback&&callback(e,body)
      })
    //   self.base._request(opts, post_body, callback);
    }
  }
};
Weibo.prototype._statuses=function(){
  var statuses = {};
  var self = this;
  apiGroup.statuses.methods.forEach(function (m) {
    statuses[m] = function (options, callback) {
      options.path = "statuses/" + m;
      self.base._post(options, callback,(m=="upload"?true:false));
    }
  });
  return statuses;
};
Weibo.prototype._users=function(){
  var users = {};
  var self = this;
  apiGroup.users.methods.forEach(function (m) {
    users[m] = function (options, callback) {
      options.path = "users/" + m;
      self.base._post(options, callback);
    }
  });
  return users;
}
Weibo.prototype._comments=function(){
  var comments = {};
  var self = this;
  apiGroup.comments.methods.forEach(function (m) {
    comments[m] = function (options, callback) {
      options.path = "comments/" + m;
      self.base._post(options, callback);
    }
  });
  return comments;
}
Weibo.prototype._friendships=function(){
  var friendships = {};
  var self = this;
  apiGroup.friendships.methods.forEach(function (m) {
    friendships[m] = function (options, callback) {
      options.path = "friendships/" + m;
      self.base._post(options, callback);
    }
  });
  return friendships;
}
Weibo.prototype._search=function(){
  var search = {};
  var self = this;
  apiGroup.search.methods.forEach(function (m) {
    search[m] = function (options, callback) {
      options.path = "search/" + m;
      self.base._post(options, callback);
    }
  });
  return search;
}
module.exports=Weibo;