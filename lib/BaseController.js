var config = require("./../config.js")
var Path = require("path")
var Controller = function(app, func, path) {
    this.func = func;
    this.filters = [];
    this.mainRounte = null;
    this.renderRoute = function(req, res, next) {
        res.render(path + ".jade")
    }
    this.mainRoute = func.call(this);
}

Controller.prototype = {
    getRoutes: function() {

        return this.filters.concat([this.mainRoute]).concat([this.renderRoute]);
    },
    useFilter: function(filters) {
        var self = this;
        filters.forEach(function(filter_path) {
            self.filters.push(require(Path.join(config.base_path, config.rainbow.filters, filter_path)))
        })
    }
}

module.exports = Controller