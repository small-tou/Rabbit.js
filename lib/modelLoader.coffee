config = require("./../config.coffee")
path = require 'path'
Sequelize = require("sequelize")
uuid = require 'node-uuid'
# redis = require("redis")
# client = redis.createClient()
# client.on "error",  (err)->
#   console.log("redis error " + err)
# global.redis_client = client

global.sequelize = sequelize = new Sequelize(config.mysql_table, config.mysql_username, config.mysql_password,
  define:
    underscored: false
    freezeTableName: true
    charset: 'utf8'
    collate: 'utf8_general_ci'
  host:config.mysql_host
  maxConcurrentQueries:120
  logging:true
)
module.exports = global.__M= (modelName)->
  obj = sequelize.define modelName.replace(/\//g,"_"), require path.join config.base_path,"models",modelName+config.script_ext
  return obj
global.__BaseModel = (modelName)->
  obj = sequelize.define modelName.replace(/\//g,"_"), require path.join config.base_path,"models",modelName+config.script_ext
  return obj
global.uuid = require 'node-uuid'

global.__FC = (func,model,methods)->
  if not methods
    methods = ['getById','getAll','getAllAndCount','add','update','count','delete','addCount']
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
      func.getAll = (page,count,condition,order,include,callback)->
        if arguments.length == 4
          callback = order
          order = null
          include = null
        else if arguments.length == 5
          callback = include
          include = null
        query = 
          offset: (page - 1) * count
          limit: count
          order: order || "id desc"
          raw:true
        if condition then query.where = condition
        if include then query.include = include
        model.findAll(query)
        .success (ms)->
          callback null,ms
        .error (e)->
          callback e
    else if m == 'getAllAndCount'
      func.getAllAndCount = (page,count,condition,order,include,callback)->
        if arguments.length == 4
          callback = order
          order = null
          include = null
        else if arguments.length == 5
          callback = include
          include = null
        query = 
          offset: (page - 1) * count
          limit: count
          order: order || "id desc"
        if condition then query.where = condition
        if include then query.include = include
        model.findAndCountAll(query)
        .success (ms)->
          callback null,ms.count,ms.rows
        .error (e)->
          callback e
    else if m == 'add'
      func.add = (data,callback)->
        data.uuid = uuid.v4()
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
          console.log model
          if m
            fields = []
            for k,v of data
              if model.rawAttributes[k]
                fields.push k
            m.updateAttributes(data,fields)
            .success ()->
              callback&&callback null,m
            .error (error)->
              callback&&callback error
        .error (error)->
          callback&&callback error
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
          if not m then callback new Error '不存在'
          else
            m.destroy()
            .success ()->
              callback&&callback null,m
            .error (error)->
              callback&&callback error
        .error (error)->
          callback&&callback error
    else if m == 'addCount'
      func.addCount = (id,field,callback)->
        model.find
          where:
            id:id
        .success (m)->
          if m
            updates = {}
            updates[field]=m[field]*1+1
            m.updateAttributes(updates,[field])
            .success ()->
              callback&&callback null,m
            .error (error)->
              callback&&callback error
        .error (error)->
          callback&&callback error
 
  return func

__BaseFunction = (_model)->
  this.model = _model
  return this;
__BaseFunction.prototype = 
  getById: (id,callback)->
    this.model.find
      where:
        id:id
    .success (m)->
      callback null,m
    .error (e)->
      callback e
  getAll: (page,count,condition,order,include,callback)->
    if arguments.length == 4
      callback = order
      order = null
      include = null
    else if arguments.length == 5
      callback = include
      include = null
    query = 
      offset: (page - 1) * count
      limit: count
      order: order || "id desc"
      raw:true
    if condition then query.where = condition
    if include then query.include = include
    this.model.findAll(query)
    .success (ms)->
      callback null,ms
    .error (e)->
      callback e
  getAllAndCount: (page,count,condition,order,include,callback)->
    if arguments.length == 4
      callback = order
      order = null
      include = null
    else if arguments.length == 5
      callback = include
      include = null
    query = 
      offset: (page - 1) * count
      limit: count
      order: order || "id desc"
    if condition then query.where = condition
    if include then query.include = include
    self = this 
    this.count condition,(error,c)->
      if error then callback error
      else

        self.model.findAll(query)
        .success (ms)->
          callback null,c,ms
        .error (e)->
          callback e
  add:(data,callback)->
    data.uuid = uuid.v4()
    this.model.create(data)
    .success (m)->
      callback&&callback null,m
    .error (error)->
      callback&&callback error
  update:(id,data,callback)->
    self = this
    this.model.find
      where:
        id:id
    .success (m)->
      
      if m
        fields = []
        for k,v of data
          if self.model.rawAttributes[k]
            fields.push k
        m.updateAttributes(data,fields)
        .success ()->
          callback&&callback null,m
        .error (error)->
          callback&&callback error
    .error (error)->
      callback&&callback error
  count:(condition,callback)->
    query={}
    if condition then query.where = condition
    this.model.count(query)
    .success (count)->
      callback null,count
    .error (e)->
      callback e
  delete:(id,callback)->
    this.model.find
      where:
        id:id
    .success (m)->
      if not m then callback new Error '不存在'
      else
        m.destroy()
        .success ()->
          callback&&callback null,m
        .error (error)->
          callback&&callback error
    .error (error)->
      callback&&callback error
  addCount:(id,field,callback)->
    this.model.find
      where:
        id:id
    .success (m)->
      if m
        updates = {}
        updates[field]=m[field]*1+1
        m.updateAttributes(updates,[field])
        .success ()->
          callback&&callback null,m
        .error (error)->
          callback&&callback error
    .error (error)->
      callback&&callback error
global.__BaseFunction = __BaseFunction