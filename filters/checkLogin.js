module.exports = function(req, res, next) {
    console.log('checklogin filter');
    //这里是一个filters，这里通过一系列处理，最后调用next即可
    next();
};