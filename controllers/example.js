var func_example;

func_example = __F('example');

module.exports.controllers = {
    "/": {
        get: function(req, res, next) {
            return func_example.getAll(1, 100, {}, null, function(error, examples) {
                return res.send(examples);
            });
        }
    }
};

module.exports.filters = {
    "/": {
        get: ['example']
    }
};