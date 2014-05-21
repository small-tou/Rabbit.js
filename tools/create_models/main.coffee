mysql = require 'mysql'
queuedo = require 'queuedo'
fs = require 'fs'
path = require 'path'
config = require './config.coffee'
result = {}
database = config.mysql_database
modelsPath = config.modelsPath
connection = mysql.createConnection({
  host     : config.mysql_host,
  user     : config.mysql_username,
  password : config.mysql_password
});

connection.connect()
connection.query 'use ' + database + ';'
createTableInfo = (tableName,callback)->
  connection.query 'show full columns from '+tableName+';', (error, _results) ->
    if error then throw error
    else
      result[tableName] = {}
      _results.forEach (r)->
        result[tableName][r.Field] =
          type:r.Type
          allowNull:if r.Null=="YES" then true else false
          defaultValue:r.Default
          primaryKey:if r.Key == "PRI" then true else false
          comment:r.Comment||null
      callback()
connection.query 'show tables;', (error, _results) ->
  if error then throw error
  else
    queuedo _results,(cx,next,context)->
      tableName = cx['Tables_in_' + database]
      createTableInfo tableName,()->
        next.call(context)
    ,()->
      cCount = 0
      for table_name of result
        targetPath = path.join(modelsPath,table_name+".js")
        fs.writeFileSync targetPath,"module.exports = "+JSON.stringify(result[table_name],null,2)
        cCount++
        console.log 'create success : '+targetPath
      console.log 'total models :'+cCount
      connection.end()
      


