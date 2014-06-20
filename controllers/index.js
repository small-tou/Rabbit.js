module.exports = {
    "/": {
        get: function() {
            return function(req, res, next) {
                res.send("Hello Rabbit.js!");
            }
        }
    }
}