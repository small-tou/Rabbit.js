// 加载需要用到的service
// var func_{{name}} = loadService('{{name}}');
module.exports = {
    '/': {
        get: function() {
            //this.rename('{{name}}s'); //重命名controller，用来做标准的restfull的url，让route变成复数
            //this.useFilters(['']); //前置filter，会依次通过
            //this.useAfterFilters(['']); //后置的filter，通过此route之后依次通过，调用next
            return function(req, res, next) {
                /**
                 * 调用next()会进入后置的filter，或者自动渲染对应的views里面的模板。
                 * 调用next(error)会进入全局的错误处理中间件。
                 * 调用res.send()或者res.end() 之类的可以直接返回数据。记得return。
                 */
                next();
                /**
                 * 一个service调用的例子
                func_{{name}}.getAll(function(error,{{name}}s) {
                    if (error) {
                        next(error);
                    } else {
                        res.send({{name}}s);
                    }
                });
                 */
            }
        }
    }
};