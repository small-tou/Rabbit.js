LightMVC for Nodejs
================

##分层

`controller` 是控制器，在基于express的应用里，实际上是route的角色。本框架使用rainbow的改良版实现自动路由，会根据目录自动生成路由，方便大量逻辑的分类和管理。

`function` 是方法集合，类似于spring里的service层，提供针对此方法的各种操作方法，可以给任意controller调用或者给其他function调用。

`model` 是数据模型的定义，在本框架中，真正的model已经被高度抽象，大部分方法都预先定义，基本你看到的model只负责定义数据模型的数据格式。

`view` 是模板，默认使用jade作为模板，在controller中调用res.render("模板名")即可渲染指定的模板。

`filter` 是一个特殊的分层，其本质是一个个route的集合，这种route可以被多个不同的controller调用，会在逻辑进入controller之前过滤和检查这些请求，例如检查用户信息，获取基本数据等。也可以用来串行数据，我通常会把所有的业务逻辑都放到filter中，然后controller基本就是个壳子，一个请求进来，经过一层层的filter，通过express的next关键字互相串联，通过res.locals存储各自的数据，最后在controller中调用res.render将数据传入模板中。

##基本使用

