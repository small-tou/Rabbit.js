var Example, func;
//生成一个Model对象
Example = new __BaseModel('examples');
//同步数据库
Example.sync();
//用model对象生成一个其方法集合
func = new __BaseFunction(Example);
//这里可以对func进行扩充，最后返回即可
module.exports = func;