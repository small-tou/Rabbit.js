/*jslint node: true */
var QueueDo=function () {
    var queue_do = function () {};
    queue_do.prototype = {
        loop: function () {
            this.index++;
            if (this.index == this.list.length) {
                this.next_func();
            } else {
                this.handle_func(this.list[this.index], this.loop, this);
            }
        },
        check_asyn: function () {
            this.index++;
            if (this.index == this.list.length) {
                this.next_func();
            }
        },
        loop_asyn: function () {
            var self = this;
            this.index++;
            this.list.forEach(function (item, i) {
                self.handle_func(item, self.check_asyn, self, i);
            });
        }
    };
    /**
 * @param {array} list 需要处理的数据的数组，作为参数传入handle_func第一个参数。
 * @param {function} handle_func 处理方法，第一个参数为数组的一个元素，第二个参数传入的是下一个loop方法，第三个参数是其loop的context
 * @param {function} next_func 队列处理完毕后调用的方法。
 * @param {boolen} isAsyn 是否异步，如果是true，则不会同步化，可以利用next_func获取处理完毕的信号
 * 批量压缩图片：
 * queue_do(files,function(pic,next,context){
           // ...异步处理，完毕后调用next.call(context);
            next.call(context);
    },function(){
        console.log("handle end")
    })
 */
    return  function (list, handle_func, next_func, isAsyn) {
        var qd = new queue_do();
        qd.list = list;
        qd.handle_func = handle_func;
        qd.next_func = next_func;
        qd.index = -1;
        qd.isAsyn = isAsyn || false;
        if (!isAsyn) {
            qd.loop();
        } else {
            qd.loop_asyn();
        }
    };
}();
