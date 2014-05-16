var Sequelize, config, path, sequelize, uuid;

config = require("./../config.js");

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
global.BaseModel = function(modelName) {
    var obj;
    obj = sequelize.define(modelName.replace(/\//g, "_"), require(path.join(config.base_path, "models", modelName + config.script_ext)));
    return obj;
};
global.BaseFunction = require("./BaseFunction.js");