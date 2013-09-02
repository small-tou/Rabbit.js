var _=require("underscore");
var querystring = require('querystring');
module.exports = {
    /**
         * 新浪微博
         * 必选参数：client_id,redirect_uri
         * 可选参数：forcelogin,scope,state,display
         * 
         */
    "sina": function (_options) {
        var options = {
            client_id: null,
            redirect_uri: null,
            response_type: 'code' ,
            display: 'default' ,
            forcelogin: "false",
            scope: null,
            state: null
        };
        return  'https://api.weibo.com/oauth2/authorize?' + querystring.stringify(_.extend(options, _options));
    },
    /**
     * 人人网
     * 必选参数：client_id,redirect_uri
     * 可选参数：scope
     */
    "renren": function (_options) {
        var options = {
            client_id: null,
            redirect_uri: null,
            response_type: "code",
            scope: null
        };
        return  'https://graph.renren.com/oauth/authorize?' + querystring.stringify(_.extend(options, _options));
    },
    /**
     * 豆瓣
     * 必选参数：client_id,redirect_uri
     * 可选参数：scope
     */
    "douban": function (_options) {
        var options = {
            client_id: null,
            redirect_uri: null,
            response_type: "code",
            scope: null
        };
        return  'https://www.douban.com/service/auth2/auth?' + querystring.stringify(_.extend(options, _options));
    },
    /**
     * 淘宝
     * 必选参数：client_id,redirect_uri
     * 可选参数：scope
     */
    "taobao": function (_options) {
        var options = {
            client_id: null,
            redirect_uri: null,
            response_type:"code",
            scope:null
        };
        return  'https://oauth.taobao.com/authorize?' + querystring.stringify(_.extend(options, _options));
    },
    /**
     * 腾讯微博
     * 必选参数：client_id,redirect_uri
     * 可选参数：scope
     */
    "tqq": function (_options) {
        var options = {
            client_id: null,
            response_type: "code",
            redirect_uri: null,
            scope:null
        };
        return  'https://open.t.qq.com/cgi-bin/oauth2/authorize?' + querystring.stringify(_.extend(options, _options));
    }
}