var Sequelize, config, path, sequelize, uuid, __BaseFunction;

config = require("./../config.coffee");

path = require('path');

Sequelize = require("sequelize");

uuid = require('node-uuid');

global.__F = function(functionName) {
    return require(path.join(config.base_path, "functions", functionName + config.script_ext));
};

global.sequelize = sequelize = new Sequelize(config.mysql_table, config.mysql_username, config.mysql_password, {
    define: {
        underscored: false,
        freezeTableName: true,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    },
    host: config.mysql_host,
    maxConcurrentQueries: 120,
    logging: true
});

module.exports = global.__M = function(modelName) {
    var obj;
    obj = sequelize.define(modelName.replace(/\//g, "_"), require(path.join(config.base_path, "models", modelName + config.script_ext)));
    return obj;
};

global.__BaseModel = function(modelName) {
    var obj;
    obj = sequelize.define(modelName.replace(/\//g, "_"), require(path.join(config.base_path, "models", modelName + config.script_ext)));
    return obj;
};

global.uuid = require('node-uuid');



__BaseFunction = function(_model) {
    this.model = _model;
    return this;
};

__BaseFunction.prototype = {
    getById: function(id, callback) {
        return this.model.find({
            where: {
                id: id
            }
        }).success(function(m) {
            return callback(null, m);
        }).error(function(e) {
            return callback(e);
        });
    },
    getAll: function(page, count, condition, order, include, callback) {
        var query;
        if (arguments.length === 4) {
            callback = order;
            order = null;
            include = null;
        } else if (arguments.length === 5) {
            callback = include;
            include = null;
        }
        query = {
            offset: (page - 1) * count,
            limit: count,
            order: order || "id desc",
            raw: true
        };
        if (condition) {
            query.where = condition;
        }
        if (include) {
            query.include = include;
        }
        return this.model.findAll(query).success(function(ms) {
            return callback(null, ms);
        }).error(function(e) {
            return callback(e);
        });
    },
    getAllAndCount: function(page, count, condition, order, include, callback) {
        var query, self;
        if (arguments.length === 4) {
            callback = order;
            order = null;
            include = null;
        } else if (arguments.length === 5) {
            callback = include;
            include = null;
        }
        query = {
            offset: (page - 1) * count,
            limit: count,
            order: order || "id desc"
        };
        if (condition) {
            query.where = condition;
        }
        if (include) {
            query.include = include;
        }
        self = this;
        return this.count(condition, function(error, c) {
            if (error) {
                return callback(error);
            } else {
                return self.model.findAll(query).success(function(ms) {
                    return callback(null, c, ms);
                }).error(function(e) {
                    return callback(e);
                });
            }
        });
    },
    add: function(data, callback) {
        data.uuid = uuid.v4();
        return this.model.create(data).success(function(m) {
            return callback && callback(null, m);
        }).error(function(error) {
            return callback && callback(error);
        });
    },
    update: function(id, data, callback) {
        var self;
        self = this;
        return this.model.find({
            where: {
                id: id
            }
        }).success(function(m) {
            var fields, k, v;
            if (m) {
                fields = [];
                for (k in data) {
                    v = data[k];
                    if (self.model.rawAttributes[k]) {
                        fields.push(k);
                    }
                }
                return m.updateAttributes(data, fields).success(function() {
                    return callback && callback(null, m);
                }).error(function(error) {
                    return callback && callback(error);
                });
            }
        }).error(function(error) {
            return callback && callback(error);
        });
    },
    count: function(condition, callback) {
        var query;
        query = {};
        if (condition) {
            query.where = condition;
        }
        return this.model.count(query).success(function(count) {
            return callback(null, count);
        }).error(function(e) {
            return callback(e);
        });
    },
    "delete": function(id, callback) {
        return this.model.find({
            where: {
                id: id
            }
        }).success(function(m) {
            if (!m) {
                return callback(new Error('不存在'));
            } else {
                return m.destroy().success(function() {
                    return callback && callback(null, m);
                }).error(function(error) {
                    return callback && callback(error);
                });
            }
        }).error(function(error) {
            return callback && callback(error);
        });
    },
    addCount: function(id, field, callback) {
        return this.model.find({
            where: {
                id: id
            }
        }).success(function(m) {
            var updates;
            if (m) {
                updates = {};
                updates[field] = m[field] * 1 + 1;
                return m.updateAttributes(updates, [field]).success(function() {
                    return callback && callback(null, m);
                }).error(function(error) {
                    return callback && callback(error);
                });
            }
        }).error(function(error) {
            return callback && callback(error);
        });
    }
};

global.__BaseFunction = __BaseFunction;