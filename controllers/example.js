var func_example;

func_example = __F('example');

module.exports = {
    "/": {
        get: function() {
            this.useFilter(['example'])
            return function(req, res, next) {
                func_example.findAll().where({
                    id: {
                        gt: 3
                    }
                }).fields(['id', 'content']).raw(true).done(function(error, datas) {
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
            }

        }
    }
};