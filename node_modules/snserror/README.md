sns-error-info
==============

整理各SNS平台的错误码所对应的英文和中文描述，可自己扩展，方便在应用中错误提示，也可以当做手册查询

#install

npm install snserror

#useage

1.直接使用：获取到错误的code之后，直接查询：

```
var code = 1110;
var snserror = require("snserror");
console.log(snserror.sina[code].cn);//输出1110对应的中文释义
```
2.应用自定制

```
var _ = require("underscore");
var snserror = require("snserror");
snserror.sina = _.extend(snserror.sina, {
  "1110":{
    cn:"我自己定制我的错误信息"
  }
});
console.log(snserror.sina[1110].cn);//输出1110对应的中文释义
```