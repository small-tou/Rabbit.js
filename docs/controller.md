Controller的定义
===============

##用命令创建。

在项目文件夹下执行 `rabbit controller -name yutou`

即可在controllers文件夹下生成一个 yutou.js 模板文件。可以按照此格式和注释开展后续的代码。

##自己创建。

###目录结构

controllers文件夹里可以防止很多controller，而且程序初始化的时候会扫描这个文件夹，对所有controller进行初始化，然后自动生成对应的url的route，这是本框架的一大特色。

controllers里可以创建多层文件夹，每个文件夹代表route里的一级。

例如 这样的目录结构 /controllers/user/admin.js 里面有一个 get:createUser的定义。

则在浏览器里这样访问 www.example.com/controllers/user/admin/createUser

同样，你可以这样来创建一个文件夹里的多个controller /controllers/user/admin/index.js 这样的效果跟上面的完全一样，然后admin文件夹下可以继续细分其他的controller文件。

###controller基本结构。

一个controller里面，可以有很多方法，其实在express里，就是一些route中间件。

例如

```

// 加载需要用到的service
// var func_yutou = loadService('yutou');
module.exports = {
    '/': {
        get: function() {
            //this.rename('yutous'); //重命名controller，用来做标准的restfull的url，让route变成复数
            //this.useFilters(['']); //前置filter，会依次通过
            //this.useAfterFilters(['']); //后置的filter，通过此route之后依次通过，调用next
            return function(req, res, next) {
                /**
                 * 调用next()会进入后置的filter，或者自动渲染对应的views里面的模板。
                 * 调用next(error)会进入全局的错误处理中间件。
                 * 调用res.send()或者res.end() 之类的可以直接返回数据。记得return。
                 */
                next();
                /**
                 * 一个service调用的例子
                func_yutou.getAll(function(error,yutous) {
                    if (error) {
                        next(error);
                    } else {
                        res.send(yutous);
                    }
                });
                 */
            }
        }
    }
};

```

注意其中的注释。

每个route里可以定义相应地restfull的api，然后每个定义里都需要return出来一个方法，这个方法其实就是express里的中间件，之所以在其上封装了一层，是为了方便插入一些定制的方法。

例如封装后的controller有这些特色：

* 自动渲染对应的的views里面的模板文件，不需要自己指定res.render方法，只要调用next()方法，当系统发现后面已经没有中间件的时候，就会自动去渲染模板。
* 重命名route，代码中得this.rename("yutous")，调用此方法后，就可以用复数形式访问这个route了，方便实现标准的restfull接口。
* userFilters和userAfterFilters 分别在之前和之后插入filters来实现一些过滤。
