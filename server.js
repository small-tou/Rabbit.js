//生成一些辅助的全局方法
require("./lib/baseFunctionInitor.js")
//引入express配置
var server = require("./index.js")

require('http').createServer(server).listen(server.get("port"), function() {
    console.log("Express server listening on port " + server.get("port"));
});