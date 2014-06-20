var path = require('path');
var fs = require("fs");
var walkdo = require('walkdo');
var fse = require("fs-extra");
var create_mysql_model = require("./../rabbit/lib/create_mysql_model.js");
var rabbit = {
    create: function() {
        var cliPath = path.resolve('.');
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
        var cliPath = path.resolve('.');
        var folders = ['rabbit'];
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
    createController: function(name) {
        var cliPath = path.resolve('.');
        var content = fs.readFileSync(path.join(__dirname, "../templates/controller.js"));
        content = content.toString().replace(/\{\{name\}\}/g, name);
        fs.writeFileSync(path.join(cliPath, "controllers", name + ".js"), content, 'utf-8');
    },
    createFunction: function() {

    },
    createAutoModel: function() {
        create_mysql_model();
    }

}
module.exports = rabbit
rabbit.createController("yutou");