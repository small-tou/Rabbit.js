/**
func_teacher = loadService('teacher');
module.exports = {
    '/': {
        get: function() {
            this.rename('teachers');
            this.useFilters(['checkTeacher']);
            this.useAfterFilters(['checkTeacher']);
            return function(req, res, next) {
                func_teacher.getAllTeachers(function(error, teachers) {
                    if (error) {
                        next(error);
                    } else {
                        res.send(teachers);
                    }
                });
            }
        }
    },
    '/add': {
        get: function() {
            return function(req, res, next) {
                func_teacher.addTeacher({
                    name: '芋头',
                    desc: Math.random(),
                    age: Math.floor(Math.random() * 100)
                }, function(error, t) {
                    if (error) {
                        next(error);
                    } else {
                        res.send(t);
                    }
                });
            }
        }
    }
};
*/