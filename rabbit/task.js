var parser = require('cron-parser');
var path = require("path");

var createTask = function(cron,file){
    parser.parseExpression(cron, {}, function(err, interval) {
        if (err) {
            console.log('Error: ' + err.message);
            return;
        }
        var next = interval.next();
        while (true) {
            try {
                if (new Date().getTime() == next.getTime()) {
                    console.log("begin exec task :"+next);
                    require(file).run();
                    next = interval.next();
                }
            } catch (e) {
                break;
            }
        }

        // Wed Dec 26 2012 14:44:00 GMT+0200 (EET)
        // Wed Dec 26 2012 15:00:00 GMT+0200 (EET)
        // Wed Dec 26 2012 15:22:00 GMT+0200 (EET)
        // Wed Dec 26 2012 15:44:00 GMT+0200 (EET)
        // Wed Dec 26 2012 16:00:00 GMT+0200 (EET)
        // Wed Dec 26 2012 16:22:00 GMT+0200 (EET)
    });
}
var tasks = require("./../tasks/task.json");
for(var cron in tasks){
    var file =path.join("../tasks",tasks[cron]) ;
    createTask(cron,file);
}