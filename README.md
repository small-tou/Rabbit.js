LightJS is a simple mvc framework for Nodejs
================
本框架是一个simple mvc的库，使用它可以快速构建你的nodejs应用，即使你对nodejs了解并不深入也不会影响你的开发之路。一晚上上线一个网站不是梦。

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

##现在开始

接下来，从头开始为您展示如何使用LightMVC开发应用。

###前期准备

首先确保安装了nodejs环境，然后将此框架从
