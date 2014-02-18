config = require './../config.coffee'
path = require 'path'
global.__F = (functionName)->
  return require path.join config.base_path,"functions",functionName+config.script_ext

