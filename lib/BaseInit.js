var Sequelize, config, path, sequelize;
config = require("./../config.js");
path = require('path');



global.loadFunction = function(functionName) {
    return require(path.join(config.base_path, "functions", functionName + config.script_ext));
};

/**
 * 初始化sequelize,通常为mysql。
 */
if (config.mysql_config) {
    Sequelize = require("sequelize");
    global.sequelize = sequelize = new Sequelize(config.mysql_config.table, config.mysql_config.username, config.mysql_config.password, {
        define: {
            underscored: false,
            freezeTableName: true,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        },
        host: config.mysql_config.host,
        maxConcurrentQueries: 120,
        logging: true
    });
    console.log("mysql尝试连接")
} else {
    console.log("mysql没有配置，不能使用sql的功能")
}
//全局的针对SQL的BaseModel
global.BaseModel = function(modelName) {
    var obj;
    obj = sequelize.define(modelName.replace(/\//g, "_"), require(path.join(config.base_path, "models", modelName + config.script_ext)));
    obj.db_type = "sql";
    return obj;
};

/**
 * 初始化mongodb，基于mongoose
 */
if (config.mongo_config) {
    mongoose = require("mongoose");
    var Schema = mongoose.Schema;
    mongoose.connect('mongodb://' + config.mongo_config.user + ':' + config.mongo_config.pass + '@' + config.mongo_config.host + ':' + config.mongo_config.port + '/' + config.mongo_config.database, config.mongo_config);
    console.log("mongodb尝试链接")
} else {
    console.log("mongodb没有配置，不能使用mongodb的功能");
}
//全局的针对mongoose的BaseMongoModel
//
global.BaseMongoModel = function(modelName) {
    var MongoModel = mongoose.model(modelName.replace(/\//g, "_"), new Schema(require(path.join(config.base_path, "models", modelName + config.script_ext))));
    MongoModel.db_type = "mongo";
    return MongoModel
}

//全局的BaseFunction，预置了对orm的顶层封装，也可以自定义对象的操作。
global.BaseFunction = require("./BaseFunction.js");