func_example = __F 'example'
module.exports.controllers = 
  "/":
    get:(req,res,next)->
        func_example.getAll 1,100,{},null,(error,examples)->
            res.send examples
module.exports.filters = 
  "/":
    get:['example']