var Example, func;
//生成一个Model对象
Example = new BaseMongoModel('mongo_examples');


func = new BaseFunction(Example);
//这里可以对func进行扩充，最后返回即可
module.exports = func;