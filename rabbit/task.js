var parser = require('cron-parser');
var path = require("path");
var child_process = require('child_process');
var config = require("./../config.js")
var createTask = function(cron, file) {
    parser.parseExpression(cron, {}, function(err, interval) {
        if (err) {
            console.log('Error: ' + err.message);
            return;
        }
        var next = interval.next();
        while (true) {
            try {
                if (new Date().getTime() == next.getTime()) {
                    console.log("begin run task :" + next);
                    // require(file).run();
                    child_process.fork(file);
                    next = interval.next();
                }
            } catch (e) {
                console.trace(e);
                break;
            }
        }
    });
}

setTimeout(function() {

    var tasks = require("./../tasks/task.json");
    for (var cron in tasks) {
        var file = path.join(config.base_path, "tasks", tasks[cron]);
        createTask(cron, file);
    }

}, 1000)