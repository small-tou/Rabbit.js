var func_example;

func_example = __F('example');

module.exports.controllers = {
    "/": {
        get: function(req, res, next) {
            func_example.findAll().where({
                id: {
                    gt: 3
                }
            }).fields(['id', 'content']).raw(true).done(function(error, datas) {
                if (error) {
                    console.trace(error);
                    next(error);
                } else {
                    res.send(datas);
                }
            });
        }
    },
    "/add": {
        get: function(req, res, next) {
            console.log(func_example.add)
            func_example.add({
                title: Math.random(),
                content: Math.random()
            }).done(function(error) {
                if (error) {
                    res.send(error.message);
                } else {
                    res.send("ok");
                }
            })

        }
    }
};

module.exports.filters = {
    "/": {
        get: ['example']
    }
};