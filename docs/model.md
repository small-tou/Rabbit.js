
BaseModel是本框架对Model层的一个常用功能封装，将mongodb和mysql的操作做了统一，并且将sequelize的操作方式封装成promise的链式操作，更清晰直观。

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

Example.getAll().where({id:{lt:3}}).offset(10).limit(10).order({id:"desc"}).fields(['id','title','content']).done(function(error,datas){

})
```