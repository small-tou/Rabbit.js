var Teacher = new BaseModel('teachers', 'sql');
var User = new BaseModel("user")
var Subscribe = new BaseModel("subscribe")
//这里可以对func进行扩充，最后返回即可
module.exports = {
    getAllTeachers: function(cb) {
        Teacher.findAll().fields(['name', 'age']).order({
            age: 'desc'
        }).done(function(error, datas) {
            cb && cb(error, datas);
        });
    },
    addTeacher: function(t, cb) {
        Teacher.add(t).done(function(error, teacher) {
            cb && cb(error, teacher);
        });
    }
};