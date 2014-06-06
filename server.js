//引入express服务器
var server = require('./index.js')
require('http').createServer(server).listen(server.get('port'), function() {
    console.log('Express server listening on port ' + server.get('port'));
});