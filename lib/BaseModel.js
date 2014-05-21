var _ = require('underscore');
var BaseModel = function(modelName, modelType) {
    this.modelType = modelType ? modelType : 'sql';
    if (this.modelType == 'sql') {
        //生成一个Model对象
        this.Model = loadModel(modelName);
        //同步数据库
        this.Model.sync();
    } else {
        this.Model = loadMongoModel(modelName);
    }

    this.params = {};
    this.params.where = null;
    this.params.limit = 0;
    this.params.offset = 0;
    this.params.fields = null;
    this.params.order = '';
    this.params.raw = false;


    this.result = null;
    this.action = null;
}

BaseModel.prototype = {
    getModel: function() {
        return this.Model;
    },
    findAll: function() {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
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
            } else {
                self.Model.find().where(self.params.where).skip(self.params.offset)
                    .limit(self.params.limit)
                    .select((self.params.fields ? self.params.fields.join(' ') : null))
                    .sort(self.params.order)
                    .exec(function(error, datas) {
                        callback(error, datas);
                    })

            }
        }
        return this;
    },
    findById: function(id) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
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
            } else {
                self.params.where = self.params.where || {};
                self.params.where[_id] = id;
                self.Model.findOne(self.params.where, (self.params.fields ? self.params.fields.join(' ') : null), function(err, data) {
                    callback(err, data)
                })
            }
        }
        return this;
    },
    findByField: function(field, value) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
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
            } else {
                self.params.where = self.params.where || {};
                self.params.where[field] = value;
                self.Model.findOne(self.params.where, (self.params.fields ? self.params.fields.join(' ') : null), function(err, data) {
                    callback(err, data)
                })
            }
        }
        return this;
    },
    count: function() {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                self.Model.count({
                    where: self.params.where
                }).success(function(count) {
                    callback(null, count);
                }).error(function(e) {
                    callback(e);
                });
            } else {
                self.Model.count(self.params.where, function(err, count) {
                    callback(err, count);
                })
            }
        }
        return this;
    },
    add: function(kv) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
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
            if (self.Model.db_type == 'sql') {
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
            if (self.Model.db_type == 'sql') {
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
                if (self.result) {
                    self.Model.remove({
                        _id: self.result._id
                    }, function(err) {
                        callback(err)
                    })
                } else {
                    self.Model.remove(self.params.where, function(err) {
                        callback(err)
                    })
                }
            }
        }
        return this;
    },
    addCount: function(key) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                if (self.result) {
                    var obj = {}
                    obj[key] = self.result[key] * 1 + 1;
                    self.result.updateAttributes(obj, [key]).success(function(data) {
                        callback(null, data);
                    }).error(function(e) {
                        callback(e);
                    });
                } else {
                    callback(new Error('先调用findBy再调用addCount，please'))
                }
            } else {
                if (self.result) {
                    var obj = {};
                    obj[key] = self.result[key] * 1 + 1;
                    self.Model.update(obj, {
                        _id: self.result._id
                    }).success(function() {
                        callback()
                    });
                } else {
                    callback(new Error('先调用findBy再调用addCount，please'))
                }
            }
        }
        return this;
    },
    getAllAndCount: function() {

    }
}



_.extend(BaseModel.prototype, {
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
        if (this.Model.db_type == 'sql') {
            var order_str = '';
            for (var i in order) {
                order_str += i + ' ' + order[i] + ' '
            }
            this.params.order = order_str;
        } else {
            this.params.order = order
        }
        return this;
    },
    raw: function(raw) {
        this.params.raw = raw;
        return this;
    }
});
_.extend(BaseModel.prototype, {
    done: function(callback) {
        if (this.action) {
            this.action(callback);
            this.params.where = null;
            this.params.limit = 0;
            this.params.offset = 0;
            this.params.fields = null;
            this.params.order = '';
            this.params.raw = false;
            this.result = null;
            this.action = null;
        } else {
            callback(new Error('没有指定动作'))
        }
    }
});
module.exports = BaseModel;