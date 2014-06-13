安装和创建项目
===========

##首次安装

首先用npm安装最新版本的Rabbit.js

`sudo npm install rabbitjs -g`

注意一定要全局安装，因为Rabbit.js使用全局命令来完成项目管理。

然后你就拥有了 rabbit 这个系统命令。

在你电脑上创建一个空的项目文件夹，进入这个文件夹，然后执行：

`rabbit create`

这时候会在你的项目文件夹里生成一个基本的项目。项目立马可用。

执行 `npm install`之后，运行 `node server.js` 即可开始运行项目。

默认项目内有一些示例文件，里面有一些标准写法和用法，不需要可以删除掉。

##更新新版本的方法。

如果后续Rabbit.js的版本更新了，如何更新项目使用的RabbitJS版本呢？

首先更新你的Rabbit.js，`npm update rabbitjs -g`

然后进入项目文件夹，使用`rabbit update`命令即可。

会更新rabbit文件夹下的文件到新版本，不会删除和覆盖其他文件。

##其他命令

```
rabbit controller -name controllerName #生成一个controller模板

```