express        = require("express")
http           = require("http")
path           = require("path")
config         = require './config.coffee'
rainbow        = require './lib/rainbow.js'
lessmiddle     = require 'less-middleware'
less           = require 'less'
log4js         = require 'log4js'
module.exports = app = express()
app.configure ->
  app.set "port", config.run_port
  #模板所在路径
  app.set "views", path.join __dirname, 'views'
  app.set "view engine", "jade"
  app.use express.favicon()
  app.use "/assets",lessmiddle({src:__dirname+"/assets",compress:true})
  #资源文件访问
  app.use "/assets", express.static(__dirname+"/assets")
  #上传的静态文件
  app.use "/uploads", express.static(__dirname+"/uploads")

  #设置日志
  log4js.configure({
    appenders: [
      { type: 'console' }
    ]
  })
  logger = log4js.getLogger('normal')
  logger.setLevel('INFO')
  app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO}))

  app.use express.bodyParser()
  app.use express.cookieParser()
  app.use express.cookieSession(secret: config.session_secret)
  app.use express.methodOverride()

  #rainbow自动载入route
  rainbow.route(app, config.rainbow)
  app.all "*",(req, res, next)->
    res.render '404.jade'
  app.use (err, req, res, next)->
    console.log err
    res.render 'error.jade'
      error:err.message
  #为模板传入一些全局方法
  app.locals.moment= require 'moment'
  app.locals.moment.lang('zh-cn');
  #静态文件路径
  app.locals.assets_head = config.assets_head
app.configure "development", ->
  app.use express.errorHandler()
  app.use express.logger("dev")