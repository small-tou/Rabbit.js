//框架主脚本
require('./rabbit/BaseInit.js')
//初始化express
var express = require('express');
var config = require('./config.js');
module.exports = app = express();
var ExpressInit = require("./rabbit/ExpressInit.js");
ExpressInit(app);

var protectProcess = require('./rabbit/lib/protect_child_process.js');
//启动定时任务的子进程
protectProcess(config.base_path + "/rabbit/task.js");