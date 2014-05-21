var config = require('./../config.js')
var Path = require('path')
var filtersConfig = require('./../filters.config.js')
var Controller = function(app, func, path, method) {
    this.func = func;
    this.filters = [];
    this.afterFilters = [];
    this.mainRounte = null;
    this.method = method;
    this.path = path;
    this.name = path.replace(/.*\//, "");
    this.newName = null;
    var self = this;
    //检查全局的filter配置
    for (var route in filtersConfig) {
        var reg = new RegExp(route);
        var routeConfig = filtersConfig[route];
        for (var _method in routeConfig) {
            if (_method == this.method) {
                if (reg.test('/' + this.path)) {
                    routeConfig[_method].forEach(function(f) {
                        self.filters.push(require(Path.join(config.base_path, config.rainbow.filters, f)))
                    });
                }
            }
        }
    };
    this.renderRoute = function(req, res, next) {
        res.render(path + '.jade')
    };
    this.mainRoute = func.call(this);
}

Controller.prototype = {
    getRoutes: function() {
        return this.filters.concat([this.mainRoute]).concat([this.renderRoute]);
    },
    useFilters: function(filters) {
        var self = this;
        filters.forEach(function(filter_path) {
            self.filters.push(require(Path.join(config.base_path, config.rainbow.filters, filter_path)))
        });
    },
    useAfterFilters: function(filters) {
        var self = this;
        filters.forEach(function(filter_path) {
            self.afterFilters.push(require(Path.join(config.base_path, config.rainbow.filters, filter_path)))
        });
    },
    rename: function(name) {
        this.newName = name;
    }
}

module.exports = Controller