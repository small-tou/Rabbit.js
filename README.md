LightJS is a simple mvc framework for Nodejs
================
本框架是一个simple mvc的库，使用它可以快速构建你的nodejs应用，即使你对nodejs了解并不深入也不会影响你的开发之路。一晚上上线一个网站不是梦。
##特色

 - 清晰的应用分层，可以帮助您构建大型的应用，具体见章节“分层”
 - 约定大于配置，基本无需配置，即可开始开发之旅。
 - 应用的restful的route完全根据目录结构自动生成，无需自己声明和指定。
 - controller和view之间拥有自动映射，你在controller里无需指定渲染的view路径。
 - 分层之间不采用跳路径方式应用，而是根据名字寻找，无需关心自己和别的分层中得js得目录结构关系。
 - 将controller层，function层，model层做了抽象封装，大部分通用逻辑都已经默认添加，极大的减少代码量。
 - 对model层做了特别封装，同时支持sql和mongodb，写法完全一样。
 - model层封装成了promise的写法，让你的数据操作更清晰简介。
 - 功能插件系统，开发中，常用的服务器功能一句话引入，例如用户系统，无需开发。
 - 默认为您配置了一个完美的express服务器。
 - clone下来，查看文档，立马开始您的开发之旅。

##分层

`controller` 是控制器，在基于express的应用里，实际上是route的角色。本框架使用rainbow的改良版实现自动路由，会根据目录自动生成路由，方便大量逻辑的分类和管理。

`function` 是方法集合，类似于spring里的service层，提供针对此方法的各种操作方法，可以给任意controller调用或者给其他function调用。

`model` 是数据模型的定义，在本框架中，真正的model已经被高度抽象，大部分方法都预先定义，基本你看到的model只负责定义数据模型的数据格式。

`view` 是模板，默认使用jade作为模板，在controller中调用res.render("模板名")即可渲染指定的模板。

`filter` 是一个特殊的分层，其本质是一个个route的集合，这种route可以被多个不同的controller调用，会在逻辑进入controller之前过滤和检查这些请求，例如检查用户信息，获取基本数据等。也可以用来串行数据，我通常会把所有的业务逻辑都放到filter中，然后controller基本就是个壳子，一个请求进来，经过一层层的filter，通过express的next关键字互相串联，通过res.locals存储各自的数据，最后在controller中调用res.render将数据传入模板中。

##基础依赖库

本框架使用了很多基础构建库来实现其最终的快速开发的目标。大概介绍下：

`express` 基础的http服务提供者。

`sequelize` 一个支持多种数据库的orm库，可以将数据库操作映射成js方法，将数据映射到js对象，使开发者更专注于编程，对提升开发效率有明显效果。

`rainbowy` 一个微型库，作用就是根据目录层次生成对象的route，将route分组和梳理，方便管理，特别是route多了的时候效果更是明显。

其他库：

 - `less` css预编译，支持实时编译
 - `jade` 默认模板引擎
 - `moment` 模板中得全局对象，用来格式化显示时间
 - `node-uuid` 用来生成uuid，uuid可以做到全站唯一，且不可推导
 - `MD5` 用来生成md5
 - `coffee-script` 本框架的默认编程语言
 - `log4js` 用来做日志管理的库

##全局对象和方法

注意，不要自己在程序中引入任何全局方法和变量，对应用有强烈破坏性。本框架引入的全局变量是为了方便使用，不要在任何地方使用相同命名的变量和方法。

 - `BaseModel` 用于sql的orm的model对象，调用 new BaseModel("model定义路径") 即可返回一个sequelize的model数据对象。
 - `BaseMongoModel` 用于mongodb的mongoose对象，跟BaseModel类似。
 - `BaseFunction` 是一个model对象的顶层封装，把sql和mongo的常用方法操作封装起来，调用new BaseFunction(model对象)即可返回一个封装，写在functions层里的，之后你可以在此基础上扩展，_.extend(baseFunction,{其他方法操作})；
 - `loadFunction` 用来加载functions里面的方法，指定相对functions目录的路径即可放回一个function对象。


###BaseFunction

BaseFunction是本框架对Model层的一个常用功能封装，将mongodb和mysql的操作做了统一，并且将sequelize的操作方式封装成promise的链式操作，更清晰直观。

基本的api:

 - `getAll` 批量获取记录。
 - `getById` 根据id获取单条记录，mongodb根据_id获取。参数是id。
 - `getByField` 根据某个字段的值获取单条记录，其实都是getAll的扩展。参数是 字段名和字段值。
 - `update` 更新某条记录，参数是更新的字段和值的kv json。
 - `delete` 删除某条记录，参数是筛选的字段和值的kv json。
 - `count` 获取记录数量
 - `add` 添加记录，参数是记录的字段和值的kv json。
 - `addCount` 针对某字段进行加1的操作。

可用于筛选条件的api:

 - `where` 设置筛选条件，例如 .where({id:1,time:{lt:3}})
 - `offset` 设置起始索引，sql里的offset，mongoose里的skip。
 - `limit` 跟offset同用，常用于翻页，设置筛选的记录条数。
 - `fields` 查询返回哪些字段
 - `order` 排序方式。
 - `raw` sql操作时，指定为true，返回单纯的数据对象，可提高性能。

执行操作的api:

 - `done` 开始执行操作，不执行done之前所有的操作都是预备，done的参数是回调方法，第一个参数是error，第二个是返回的数据。

典型操作：

```
var Example = new BaseModel('examples');
//同步数据库
Example.sync();
//用model对象生成一个其方法集合
var func = new BaseFunction(Example);

func.getAll().where({id:{lt:3}}).offset(10).limit(10).order("id desc").fields(['id','title','content']).done(function(error,datas){
    
})


```

##现在开始

接下来，从头开始为您展示如何使用LightMVC开发应用。

###前期准备

首先确保安装了nodejs环境，然后将此框架从github clone 到本地目录

`git clone https://github.com/xinyu198736/LightMVC.git project_name`

首先，决定你用mysql还是mongodb，当然也可以同时用二者，只需要按照config.js中得配置示例配置即可，如果不需要使用mysql，把mysql_config整个去掉即可，否则会报错。

其他的配置基本不需要修改，默认即可。配置文件有详细注释，可以自行查看。

对了，还有最基本的 `npm install` 安装一下依赖的包。

还真别说，这时候你启动`node server.js`按照道理来说，整个应用都会成功启动起来，这时候应用已经跑起来啦。

###开发一个应用逻辑的步骤

首先，给你的应用定义相应地Model，
