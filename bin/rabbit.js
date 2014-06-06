var path = require('path');
var fs = require("fs");
var walkdo = require('walkdo');
var fse = require("fs-extra");
var rabbit = {
    create: function() {
        var cliPath = path.resolve('.');
        console.log(cliPath)
        console.log(__dirname)
        var folders = ['assets', 'controllers', 'filters', 'models', 'rabbit', 'services', 'tasks', 'services', 'views', 'config.js', 'filters.config.js', 'index.js', 'server.js', 'package.json'];
        folders.forEach(function(folder) {
            var _path = path.join(__dirname, '..', folder);
            var targetPath = path.join(cliPath, folder);
            if (fs.existsSync(_path)) {
                //copy整个目录过去
                fse.copy(_path, targetPath, function(e) {
                    if (e) console.log("copy file error:" + e.message);
                })
            }
        })
    },
    update: function() {

    }
}
module.exports = rabbit
rabbit.create();