var Sequelize, config, path, sequelize, uuid;

config = require("./../config.js");

path = require('path');

Sequelize = require("sequelize");

uuid = require('node-uuid');
mongoose = require("mongoose");
var Schema = mongoose.Schema;
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
global.BaseModel = function(modelName) {
    var obj;
    obj = sequelize.define(modelName.replace(/\//g, "_"), require(path.join(config.base_path, "models", modelName + config.script_ext)));
    obj.db_type = "sql";
    return obj;
};
mongoose.connect('mongodb://' + config.mongo_config.user + ':' + config.mongo_config.pass + '@' + config.mongo_config.host + ':' + config.mongo_config.port + '/' + config.mongo_config.database, config.mongo_config);
global.BaseMongoModel = function(modelName) {
    //.replace(/^(.)/, function(m) {return m.toUpperCase();})
    //var mongoose = require('mongoose');
    var MongoModel = mongoose.model(modelName.replace(/\//g, "_"), new Schema(require(path.join(config.base_path, "models", modelName + config.script_ext))));
    MongoModel.db_type = "mongo";
    return MongoModel
}
global.BaseFunction = require("./BaseFunction.js");