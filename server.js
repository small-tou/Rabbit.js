//生成一些辅助的全局方法
require('./rabbit/BaseInit.js')
//引入express配置
var server = require('./index.js')
var config = require('./config.js');
require('http').createServer(server).listen(server.get('port'), function() {
    console.log('Express server listening on port ' + server.get('port'));
});

var protectProcess = require('./rabbit/lib/protect_child_process.js');
//启动定时任务的子进程
protectProcess(config.base_path + "/rabbit/task.js");