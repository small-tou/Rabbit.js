var func_example;

func_example = loadFunction('example');
func_mongo_example = loadFunction("mongo_example")
module.exports = {
    "/": {
        get: function() {
            this.useFilter(['example'])
            return function(req, res, next) {
                // func_example.findAll().where({
                //     id: {
                //         gt: 3
                //     }
                // }).fields(['id', 'content']).raw(true).done(function(error, datas) {
                //     if (error) {
                //         next(error);
                //     } else {
                //         res.send(datas);
                //     }
                // });

                //从mongodb读取一个记录的例子
                // func_mongo_example.findByField("content", "haha").fields(['title', 'content']).raw(true).done(function(error, datas) {
                //     if (error) {
                //         next(error);
                //     } else {
                //         res.send(datas);
                //     }
                // });

                // 从mongodb读取多个实例例子
                func_mongo_example.findAll().fields(['title', 'content']).done(function(error, datas) {
                    if (error) {
                        next(error);
                    } else {
                        res.send(datas);
                    }
                });
            }

        }
    },
    "/add": {
        get: function() {
            return function(req, res, next) {
                func_example.add({
                    title: Math.random(),
                    content: Math.random()
                }).done(function(error) {
                    if (error) {
                        res.send(error.message);
                    } else {
                        res.send("ok");
                    }
                });
                func_mongo_example.add({
                    title: Math.random(),
                    content: Math.random()
                }).done(function(error, record) {
                    console.log(record)
                })
            }
        }
    },
    "/update": {
        get: function() {
            return function(req, res, next) {
                //测试mongodb的update
                func_mongo_example.update({
                    content: "haha"
                }).where({
                    _id: "53771f18ecd19521446e8ce1"
                }).done(function(error) {
                    console.log(error);
                    next();
                })
            }
        }
    }
};