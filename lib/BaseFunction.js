var F = function(Model) {
    this.params = {};
    this.params.where = null;
    this.params.limit = 0;
    this.params.offset = 0;
    this.params.fields = null;
    this.params.order = "id desc";
    this.params.raw = false;

    this.Model = Model;

    this.result = null;
    this.action = null;

}

F.prototype = {
    findAll: function() {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            console.log(self.params)
            self.Model.findAll({
                where: self.params.where,
                limit: self.params.limit,
                offset: self.params.offset,
                attributes: self.params.fields,
                order: self.params.order,
                raw: self.params.raw
            }).success(function(datas) {
                callback(null, datas);
            }).error(function(e) {
                callback(e);
            });
        }
        return this;
    },
    findById: function(id) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            self.params.where = self.params.where || {};
            self.params.where.id = id;
            self.Model.find({
                where: self.params.where,
                attributes: self.params.fields,
                order: self.params.order,
                raw: self.params.raw
            }).success(function(data) {
                callback(null, data);
            }).error(function(e) {
                callback(e);
            });
        }
        return this;
    },
    findByField: function(field, value) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            self.params.where = self.params.where || {};
            self.params.where[field] = value;
            self.Model.find({
                where: self.params.where,
                attributes: self.params.fields,
                order: self.params.order,
                raw: self.params.raw
            }).success(function(data) {
                callback(null, data);
            }).error(function(e) {
                callback(e);
            });
        }
        return this;
    },
    count: function() {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            self.Model.count({
                where: self.params.where
            }).success(function(count) {
                callback(null, count);
            }).error(function(e) {
                callback(e);
            });
        }
        return this;
    },
    add: function(kv) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == "sql") {
                self.Model.create(kv).success(function(data) {
                    callback(null, data);
                }).error(function(e) {
                    callback(e);
                });
            } else {
                self.Model.create(kv, function(err, model) {
                    callback(err, model);
                })
            }

        }
        return this;
    },
    update: function(kv) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == "sql") {
                if (self.result) {
                    var fields, k, v;
                    fields = [];
                    for (k in data) {
                        v = data[k];
                        if (self.Model.rawAttributes[k]) {
                            fields.push(k);
                        }
                    }
                    self.result.updateAttributes(kv, fields).success(function(data) {
                        callback(null, data);
                    }).error(function(e) {
                        callback(e);
                    });
                } else {
                    self.Model.update(kv, self.params.where).success(function() {
                        callback()
                    });
                }
            } else {
                //mongodb的update
                if (self.result) {
                    self.Model.update({
                        _id: self.result._id
                    }, kv, function(err, numberAffected, raw) {
                        callback(err);
                    })
                } else {
                    self.Model.update(self.params.where, kv, function(err, numberAffected, raw) {
                        callback(err);
                    })
                }
            }
        }
        return this;
    },
    delete: function() {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == "sql") {
                if (self.result) {
                    self.result.destroy().success(function(data) {
                        callback(null, data);
                    }).error(function(e) {
                        callback(e);
                    });
                } else {
                    self.Model.destroy(self.params.where).success(function() {
                        callback()
                    });
                }
            } else {

            }
        }
        return this;
    },
    addCount: function(key) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.result) {
                var obj = {}
                obj[key] = self.result[key] * 1 + 1;
                self.result.updateAttributes(obj, [key]).success(function(data) {
                    callback(null, data);
                }).error(function(e) {
                    callback(e);
                });
            } else {
                callback(new Error("先调用findBy再调用addCount，please"))
            }
        }
        return this;
    },
    getAllAndCount: function() {

    }
}

var _ = require("underscore")

_.extend(F.prototype, {
    where: function(param) {
        this.params.where = param;
        return this;
    },
    limit: function(limit) {
        this.params.limit = limit;
        return this;
    },
    offset: function(offset) {
        this.params.offset = offset;
        return this;
    },
    //返回哪些字段
    fields: function(fields) {
        this.params.fields = fields;
        return this;
    },
    order: function(order) {
        this.params.order = order;
        return this;
    },
    raw: function(raw) {
        this.params.raw = raw;
        return this;
    }
});
_.extend(F.prototype, {
    done: function(callback) {
        if (this.action) {

            this.action(callback);
            this.params.where = null;
            this.params.limit = 0;
            this.params.offset = 0;
            this.params.fields = null;
            this.params.order = "id desc";
            this.params.raw = false;
            this.result = null;
            this.action = null;
        } else {
            callback(new Error("没有指定动作"))
        }
    }
});
/**
 * var user = new F();
 * @type {F}
 */

module.exports = F;