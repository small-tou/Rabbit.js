Rabbit.JS is a fast and light mvc framework for Nodejs
================

##关于RabbitJS

RabbitJS 的定位是一个超轻量的快速开发框架。Light and Fast。你甚至很快就可以理解它的底层实现（也许只需要5分钟）。RabbitJS本身的代码量并不大，这得益于很多NodeJS开源库的支持，通过一些有效的组合，成为这样一个简单而清晰的开发框架。

RabbitJS 能够提供一个清晰的开发思路，让你的应用逻辑清晰并且足够结构化，但是同时又不会增加你的开发复杂度，相反，复杂度被降低，因为在逻辑分层的过程中对很多操作做了封装，你要做的就是关注自己需要关注的逻辑代码，而不用关心框架本身。

RabbitJS 是一个依靠约定和封装进行工作的框架，秉承约定大于配置的快速开发理念，高度自动化，提高开发效率。不过可能因此降低了一些灵活性，但是本框架的定位决定其使用场景，RabbitJS比较适合于中小型项目或者个人项目，得益于其快速开发的特点，可以快速搭建restfull的网络服务。

##特色

 - 清晰的应用分层，可以帮助您构建大型的应用，具体见章节“分层”
 - 约定大于配置，基本无需配置，即可开始开发之旅。
 - 约定大于配置，团队合作写出来的应用代码基本一致，方便统一代码风格。
 - 应用的restful的route完全根据目录结构自动生成，无需自己声明和指定。
 - controller和view之间拥有自动映射，你在controller里无需指定渲染的view路径。
 - 分层之间不采用跳路径方式应用，而是根据名字寻找，无需关心自己和别的分层中得js得目录结构关系。
 - 将controller层，service层，model层做了抽象封装，大部分通用逻辑都已经默认添加，极大的减少代码量。
 - 对model层做了特别封装，同时支持sql和mongodb，写法完全一样。
 - model层封装成了promise的写法，让你的数据操作更清晰简介。
 - 功能插件系统，开发中，常用的服务器功能一句话引入，例如用户系统，无需开发。
 - 默认为您配置了一个完美的express服务器。
 - clone下来，查看文档，立马开始您的开发之旅。

##分层

`controller` 是控制器，在基于express的应用里，实际上是route的角色。本框架使用rainbow的改良版实现自动路由，会根据目录自动生成路由，方便大量逻辑的分类和管理。

`service` 是方法集合，类似于spring里的service层，提供针对此方法的各种操作方法，可以给任意controller调用或者给其他service调用。

`model` 是数据模型的定义，在本框架中，真正的model已经被高度抽象，大部分方法都预先定义，基本你看到的model只负责定义数据模型的数据格式。

`view` 是模板，默认使用jade作为模板，在controller中调用res.render("模板名")即可渲染指定的模板。

`filter` 是一个特殊的分层，其本质是一个个route的集合，这种route可以被多个不同的controller调用，会在逻辑进入controller之前过滤和检查这些请求，例如检查用户信息，获取基本数据等。也可以用来串行数据，我通常会把所有的业务逻辑都放到filter中，然后controller基本就是个壳子，一个请求进来，经过一层层的filter，通过express的next关键字互相串联，通过res.locals存储各自的数据，最后在controller中调用res.render将数据传入模板中。

##安装和创建项目
[安装和创建项目](https://github.com/xinyu198736/RabbitJS/blob/master/docs/cli.md)

##基础依赖库
[基础依赖库文档](https://github.com/xinyu198736/RabbitJS/blob/master/docs/thirdparty.md)

##Controller的定义和介绍
[Controller的定义和介绍](https://github.com/xinyu198736/RabbitJS/blob/master/docs/controller.md)

##Model层的定义和封装
[Model层的定义和封装](https://github.com/xinyu198736/RabbitJS/blob/master/docs/model.md)








