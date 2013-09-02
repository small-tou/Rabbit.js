config = require("./../config.coffee")
path = require 'path'
Sequelize = require("sequelize")
sequelize = new Sequelize(config.mysql_table, config.mysql_username, config.mysql_password,
  define:
    underscored: false
    freezeTableName: true
    charset: 'utf8'
    collate: 'utf8_general_ci'
)
module.exports = global.__M= (modelName,defaultMethods)->
  obj = sequelize.define modelName, require path.join config.base_path,"models",modelName+config.script_ext
  if defaultMethods
  	defaultMethods.forEach (method)->

  return obj

global.__FC = (func,model,methods)->
  methods.forEach (m)->
    if m == 'getById'
      func.getById = (id,callback)->
        model.find
          where:
            id:id
        .success (m)->
          callback null,m
        .error (e)->
          callback e
    else if m == 'getAll'
      func.getAll = (page,count,condition,callback)->
        query = 
          offset: (page - 1) * count
          limit: count
          order: "id desc"
        if condition then query.where = condition
        model.findAll(query)
        .success (ms)->
          callback null,ms
        .error (e)->
          callback e
    else if m == 'add'
      func.add = (data,callback)->
        model.create(data)
        .success (m)->
          callback&&callback null,m
        .error (error)->
          callback&&callback error
    else if m == "update"
      func.update = (id,data,callback)->
        model.find
          where:
            id:id
        .success (m)->
          m.updateAttributes(data)
          .success ()->
            callback null,m
          .error (error)->
            callback error
        .error (error)->
          callback error
    else if m == "count"
      func.count = (condition,callback)->
        query={}
        if condition then query.where = condition
        model.count(query)
        .success (count)->
          callback null,count
        .error (e)->
          callback e
    else if m == 'delete'
      func.delete = (id,callback)->
        model.find
          where:
            id:id
        .success (m)->
          m.destroy()
          .success ()->
            callback null,m
          .error (error)->
            callback error
        .error (error)->
          callback error
          
