var Teacher = new BaseModel('mongo_teachers', 'mongo');

module.exports = {
    getAllTeachers: function(cb) {
        Teacher.findAll().where({
            id: {
                gt: 3
            }
        }).fields(['id', 'name', 'age']).order({
            id: 'desc'
        }).done(function(error, datas) {
            cb && cb(error, datas);
        });
    },
    addTeacher: function(t, cb) {
        Teacher.add(t).done(function(error, teacher) {
            cb && cb(error, teacher);
        })
    }
};