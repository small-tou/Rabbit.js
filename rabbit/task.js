var parser = require('cron-parser');

parser.parseExpression('1 * * * * *', {}, function(err, interval) {
    if (err) {
        console.log('Error: ' + err.message);
        return;
    }
    var next = interval.next();
    while (true) {
        try {

            if (new Date().getTime() == next.getTime()) {
                console.log(next);
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