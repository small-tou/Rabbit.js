var app, config, express, http, less, lessmiddle, log4js, path, rainbow;
var less = require('less-middleware');
http = require('http');

path = require('path');

config = require('./../config.js');

rainbow = require('./rainbow.js');


log4js = require('log4js');
express = require('express');
module.exports = function(app) {
    app.configure(function() {
        var logger;
        app.set('port', config.run_port);
        //模板所在路径
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'jade');
        app.use(express.favicon());

        app.use(less({ src: path.join(config.base_path, '/assets') }));
        app.use('/assets', express['static'](__dirname + '/assets'));
        app.use('/uploads', express['static'](__dirname + '/uploads'));
        //日志支持
        log4js.configure({
            appenders: [{
                type: 'console'
            }]
        });
        logger = log4js.getLogger('normal');
        logger.setLevel('INFO');
        app.use(log4js.connectLogger(logger, {
            level: log4js.levels.INFO
        }));

        //cookie session postbody支持
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.cookieSession({
            secret: config.session_secret
        }));
        app.use(express.methodOverride());

        //rainbow配置
        rainbow.route(app, config.rainbow);
        //404处理
        app.all('*', function(req, res, next) {
            return res.render('404.jade');
        });
        //所有错误的集中处理，在任何route中调用next(error)即可进入此逻辑
        app.use(function(err, req, res, next) {
            console.trace(err);
            return res.render('502.jade', {
                error: err
            });
        });
        //给模板引擎设置默认函数，例如时间显示moment
        app.locals.moment = require('moment');
        app.locals.moment.lang('zh-cn');
        //静态资源头，本地开发用本地，线上可以用cdn
        app.locals.assets_head = config.assets_head;
    });

    app.configure('development', function() {
        app.use(express.errorHandler());
        app.use(express.logger('dev'));
    });
}
