/*jslint node: true */
var queue_do = require("queuedo");
var fs = require("fs");
var fileList = [];
var getList = function (_path) {
     if (fs.existsSync(_path)) {
        var stat = fs.statSync(_path);
        if (stat.isDirectory()) {
            var paths = fs.readdirSync(_path);
            paths.forEach(function (_p) {
                getList(_path + "/" + _p);
            });
        } else {
            fileList.push(_path.replace(/\/\//g, "/"));
        }
     }
};
//遍历方法
//第三个参数是衔接方法，处理完当前队列之后才会调用上层传过来的衔接方法
//这样将整个深度搜索过程打扁成一个串行处理了。
var walk = function(_path, callback, next_func, isAsny) {
    fileList=[];
    getList(_path);
    queue_do(fileList, callback, next_func, isAsny);
};
module.exports = exports = walk;
