var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var pool = mysql.createPool(_global.db);
var async = require("async");
var jwt = require('jsonwebtoken');
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);

router.put('/update/', function(req, res, next) {
    if (req.body.classes == undefined) {
        _global.sendError(res, null, "Class is required");
        return;
    }
    var classes = [];
    if (Array.isArray(req.body.classes)) {
        classes = req.body.classes;
    } else {
        classes.push(req.body.classes);
    }
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        async.each(classes, function(_class, callback) {
            connection.query(format(`UPDATE class_has_course SET schedules = %L WHERE class_id = %L AND course_id = %L`,_class.schedules, _class.class_id, _class.course_id), function(error, result, fields) {
                if (error) {
                    console.log(error.message + ' at insert class_has_course');
                    callback(error);
                } else {
                    callback();
                }
            });
        }, function(error) {
            if (error) {
                var message = error.message + ' at update schedule at class_has_course';
                _global.sendError(res, message);
                done();
                return console.log(error);
            } else {
                console.log('updated class_has_course');
                res.send({ result: 'success', message: 'Schedule updated successfully' });
                done();
            }
        });
    });
});

router.post('/schedules-and-courses/', function(req, res, next) {
    if (req.body.program_id == undefined || req.body.program_id == 0) {
        _global.sendError(res, null, "Program is required");
        return;
    }
    if (req.body.semester_id == undefined || req.body.semester_id == 0) {
        _global.sendError(res, null, "Semester is required");
        return;
    }
    var program_id = req.body.program_id;
    var semester_id = req.body.semester_id;
    var class_id = req.body.class_id ? req.body.class_id : 0;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        if (class_id == 0) {
            connection.query(format(`SELECT courses.*,class_has_course.schedules,classes.name as class_name,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name, ' (', users.email, ')')), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name, ' (', users.email, ')')), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 1) as TAs 
                FROM courses, class_has_course, classes 
                WHERE class_has_course.course_id = courses.id AND courses.semester_id = %L AND courses.program_id = %L AND class_has_course.class_id = classes.id
                ORDER BY classes.name DESC`, semester_id, program_id), function(error, result, fields) {
                if (error) {
                    var message = error.message + ' at get schedule and course';
                    _global.sendError(res, message);
                    done();
                    return console.log(error);
                } else {
                    res.send({ result: 'success', courses: result.rows });
                    done();
                }
            });
        } else {
            connection.query(format(`SELECT courses.*,class_has_course.schedules,classes.name as class_name,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name, ' (', users.email, ')')), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name, ' (', users.email, ')')), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 1) as TAs  
                FROM courses, class_has_course, classes 
                WHERE class_has_course.course_id = courses.id AND courses.semester_id = %L AND courses.program_id = %L AND class_has_course.class_id = classes.id AND classes.id = %L
                ORDER BY classes.name DESC`, semester_id, program_id, class_id), function(error, result, fields) {
                if (error) {
                    var message = error.message + ' at get schedule and course';
                    _global.sendError(res, message);
                    done();
                    return console.log(error);
                } else {
                    res.send({ result: 'success', courses: result.rows });
                    done();
                }
            });
        }
    });
});

router.get('/schedules-and-courses-by-student/', function(req, res, next) {
    var student_id = req.decoded.id;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT courses.*,class_has_course.schedules,classes.name as class_name,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name, ' (', users.email, ')')), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name, ' (', users.email, ')')), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 1) as TAs 
                FROM courses, class_has_course, classes , student_enroll_course
                WHERE class_has_course.class_id = classes.id AND class_has_course.course_id = courses.id AND student_enroll_course.class_has_course_id = class_has_course.id 
                AND courses.semester_id = (SELECT MAX(id) from semesters) 
                AND student_enroll_course.student_id = %L
                ORDER BY classes.name DESC`, student_id), function(error, result, fields) {
            if (error) {
                var message = error.message + ' at get schedule and course by student';
                _global.sendError(res, message);
                done();
                return console.log(error);
            } else {
                res.send({ result: 'success', courses: result.rows });
                done();
            }
        });
    });
});

router.get('/schedules-and-courses-by-teacher/', function(req, res, next) {
    var teacher_id = req.decoded.id;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT courses.*,class_has_course.schedules,classes.name as class_name,
                            (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name, ' (', users.email, ')')), E'\r\n')
                            FROM teacher_teach_course,users 
                            WHERE users.id = teacher_teach_course.teacher_id AND 
                            courses.id = teacher_teach_course.course_id AND 
                            teacher_teach_course.teacher_role = 0) as lecturers,
                            (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name, ' (', users.email, ')')), E'\r\n')
                            FROM teacher_teach_course,users 
                            WHERE users.id = teacher_teach_course.teacher_id AND 
                            courses.id = teacher_teach_course.course_id AND 
                            teacher_teach_course.teacher_role = 1) as TAs 
            FROM courses, class_has_course, classes , teacher_teach_course 
            WHERE class_has_course.class_id = classes.id AND class_has_course.course_id = courses.id AND
            teacher_teach_course.course_id = class_has_course.course_id 
            AND courses.semester_id = (SELECT MAX(id) from semesters) AND teacher_teach_course.teacher_id = %L
            ORDER BY classes.name DESC`, teacher_id), function(error, result, fields) {
            if (error) {
                var message = error.message + ' at get schedule and course by teacher';
                _global.sendError(res, message);
                done();
                return console.log(error);
            } else {
                res.send({ result: 'success', courses: result.rows });
                done();
            }
        });
    });
});

router.post('/export/', function(req, res, next) {
    if (req.body.programs == undefined && req.body.classes == undefined) {
        _global.sendError(res, null, "Programs and classes is required");
        return;
    }
    var programs = req.body.programs;
    var classes = req.body.classes;

    var schedules = [];

    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        async.series([
            function(callback){
                async.each(programs, function(program, callback) {
                    connection.query(format(`SELECT code FROM programs WHERE id = %L`, program), function(error, program_result, fields) {
                        if (error) {
                            callback(error);
                        } else {
                            connection.query(format(`SELECT courses.*,class_has_course.schedules,classes.name as class_name,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 1) as TAs 
                                    FROM courses, class_has_course, classes 
                                    WHERE class_has_course.course_id = courses.id AND courses.semester_id = (SELECT MAX(id) FROM semesters) AND courses.program_id = %L AND class_has_course.class_id = classes.id
                                    ORDER BY classes.name DESC`, program), function(error, result, fields) {
                                if (error) {
                                    callback(error);
                                } else {
                                    schedules.push({
                                        course_list: result.rows,
                                        file_name: program_result.rows[0].code
                                    });
                                    callback();
                                }
                            });
                        }
                    });
                }, function(error) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function(callback){
                async.each(classes, function(_class, callback) {
                    connection.query(format(`SELECT name FROM classes WHERE id = %L`, _class), function(error, class_result, fields) {
                        if (error) {
                            callback(error);
                        } else {
                            connection.query(format(`SELECT courses.*,class_has_course.schedules,classes.name as class_name,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 1) as TAs  
                                    FROM courses, class_has_course, classes 
                                    WHERE class_has_course.course_id = courses.id AND courses.semester_id = (SELECT MAX(id) FROM semesters) AND class_has_course.class_id = classes.id AND classes.id = %L
                                    ORDER BY classes.name DESC`, _class), function(error, result, fields) {
                                if (error) {
                                    callback(error);
                                } else {
                                    schedules.push({
                                        course_list: result.rows,
                                        file_name: class_result.rows[0].name
                                    });
                                    callback();
                                }
                            });
                        }
                    });
                }, function(error) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            }
        ], function(error) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            } else {
                console.log('success export schedules---------------------------------------');
                res.send({ result: 'success', schedules : schedules, message: 'success export successfully' });
                done();
            }
        });
    });
});

router.post('/import', function(req, res, next) {
    if (req.body.schedule == undefined || req.body.schedule == {}) {
        _global.sendError(res, null, "Schedule is required");
        return;
    }
    if (req.body.schedule.program == undefined || req.body.schedule.program == '') {
        _global.sendError(res, null, "Program is required");
        return;
    }
    var program = req.body.schedule.program;
    var program_id = 0;
    var semester_id = 0;
    var course_list = req.body.schedule.course_list;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        async.series([
            function(callback){
                connection.query(format(`SELECT MAX(id) as id FROM semesters`), function(error, result, fields) {
                    if (error) {
                        callback(error + ' at get semester id');
                    } else {
                        if(result.rowCount == 0){
                            callback('Semester not found');
                        }else{
                            semester_id = result.rows[0].id;
                            callback();
                        }
                    }
                });
            },
            function(callback){
                connection.query(format(`SELECT id FROM programs WHERE code = %L`, program), function(error, result, fields) {
                    if (error) {
                        callback(error + ' at get program info');
                    } else {
                        if(result.rowCount == 0){
                            callback('Program not found');
                        }else{
                            program_id = result.rows[0].id;
                            callback();
                        }
                    }
                });
            },
            function(callback){
                async.each(course_list, function(course, callback) {
                    connection.query(format(`SELECT id FROM courses 
                        WHERE code = %L AND semester_id = %L AND program_id = %L`, course.code, semester_id, program_id), function(error, result, fields) {
                        if (error) {
                            callback(error + ' at get course info');
                        } else {
                            if(result.rowCount == 0){
                                //new course
                                var course_id = 0;
                                var class_has_course_id = 0;
                                async.series([
                                    //insert course
                                    function(callback){
                                        var new_course = [[
                                            course.name,
                                            course.code,
                                            semester_id,
                                            program_id,
                                            course.note,
                                            course.office_hour
                                        ]];
                                        connection.query(format(`INSERT INTO courses (name,code,semester_id,program_id,note,office_hour) VALUES %L RETURNING id`,new_course), function(error, result, fields) {
                                            if (error) callback(error + ' at insert course');
                                            else {
                                                course_id = result.rows[0].id;
                                                callback();
                                            }
                                        });
                                    },
                                    //insert class_has_course
                                    function(callback){
                                        connection.query(format(`SELECT id FROM classes WHERE name = %L`, course.class_name), function(error, result, fields) {
                                            if (error) callback(error + ' at get class_id');
                                            else {
                                                if(result.rowCount == 0){
                                                    callback('Class ' + course.class_name + ' not found');
                                                }else{
                                                    var class_id = result.rows[0].id;
                                                    var new_class_has_course = [[
                                                        class_id,
                                                        course_id,
                                                        course.schedules
                                                    ]];
                                                    connection.query(format(`INSERT INTO class_has_course (class_id,course_id,schedules) VALUES %L RETURNING id`,new_class_has_course), function(error, result, fields) {
                                                        if (error) callback(error + ' at insert class_has_course');
                                                        else callback();
                                                    });
                                                }
                                            }
                                        });
                                    },
                                    //insert teacher
                                    function(callback){
                                        var lecturers = course.lecturers.split('\r\n');
                                        var teachers = [];
                                        var name;
                                        for(var i = 0 ; i < lecturers.length; i++){
                                            // var name = _global.removeExtraFromTeacherName(lecturers[i]);
                                            //var email = _global.getEmailFromTeacherName(name);
                                            var email = _global.getEmailFromTeacherName(lecturers[i]);
                                            name = _global.removeEmailTeacherName(lecturers[i]);
                                            teachers.push({
                                                first_name : _global.getFirstName(name),
                                                last_name : _global.getLastName(name),
                                                email : email,
                                                role : _global.lecturer_role
                                            });
                                        }
                                        if(course.TAs != undefined){
                                            var tas = course.TAs.split('\r\n');
                                            for(var i = 0 ; i < tas.length; i++){
                                                // var name = _global.removeExtraFromTeacherName(lecturers[i]);
                                                //var email = _global.getEmailFromTeacherName(name);
                                                var email = _global.getEmailFromTeacherName(tas[i]);
                                                name = _global.removeEmailTeacherName(tas[i]);
                                                teachers.push({
                                                    first_name : _global.getFirstName(name),
                                                    last_name : _global.getLastName(name),
                                                    email : email,
                                                    role : _global.ta_role
                                                });
                                            }
                                        }
                                        async.each(teachers, function(teacher, callback) {
                                            var is_new_teacher = true;
                                            var teacher_id = 0;
                                            async.series([
                                                //check exist
                                                function(callback){
                                                    connection.query(format(`SELECT id FROM users 
                                                        WHERE role_id = %L AND email = %L`, _global.role.teacher, teacher.email), function(error, result, fields) {
                                                        if(error) callback(error + ' at get teacher info');
                                                        else{
                                                            if(result.rowCount == 0) is_new_teacher = true;
                                                            else {
                                                                is_new_teacher = false;
                                                                teacher_id = result.rows[0].id;
                                                            }
                                                            callback();
                                                        }
                                                    });
                                                },
                                                //insert teacher
                                                function(callback){
                                                    if(!is_new_teacher) callback();
                                                    else{
                                                        var new_teacher = [[
                                                            teacher.first_name,
                                                            teacher.last_name,
                                                            teacher.email,
                                                            _global.role.teacher
                                                        ]];
                                                        connection.query(format(`INSERT INTO users (first_name,last_name,email,role_id) VALUES %L RETURNING id`, new_teacher), function(error, result, fields) {
                                                            if(error) callback(error + ' at insert teacher');
                                                            else{
                                                                teacher_id = result.rows[0].id;
                                                                var token = jwt.sign({ email: teacher.email }, _global.jwt_secret_key, { expiresIn: _global.jwt_register_expire_time });
                                                                var link = _global.host + '/register;token=' + token;
                                                                _global.sendMail(
                                                                    '"Giáo vụ"',
                                                                    teacher.email,
                                                                    'Register your account',
                                                                    'Hi,'+ teacher.first_name + '\r\n' + 
                                                                    'Your account has been created.To setup your account for the first time, please go to the following web address: \r\n\r\n' +
                                                                    link + 
                                                                    '\r\n(This link is valid for 7 days from the time you received this email)\r\n\r\n' +
                                                                    'If you need help, please contact the site administrator,\r\n' +
                                                                    'Admin User \r\n\r\n' +
                                                                    'admin@fit.hcmus.edu.vn'
                                                                );
                                                                callback();
                                                            }
                                                        });
                                                    }
                                                },
                                                //insert teacher_teach_course
                                                function(callback){
                                                    if(!is_new_teacher){
                                                        connection.query(format(`SELECT * FROM teacher_teach_course 
                                                            WHERE teacher_id = %L AND course_id = %L`, teacher_id, course_id), function(error, result, fields) {
                                                            if(error) callback(error + ' at check teacher_teach_course');
                                                            else{
                                                                if(result.rowCount == 0){
                                                                    connection.query(format(`INSERT INTO teacher_teach_course (teacher_id,course_id,teacher_role) 
                                                                        VALUES %L`, [[teacher_id, course_id, teacher.role]]), function(error, result, fields) {
                                                                        if(error) callback(error + ' at insert teacher_teach_course');
                                                                        else{
                                                                            callback();
                                                                        }
                                                                    });
                                                                }else{
                                                                    callback();
                                                                }
                                                            }
                                                        });
                                                    }else{
                                                        connection.query(format(`INSERT INTO teacher_teach_course (teacher_id,course_id,teacher_role) 
                                                            VALUES %L`, [[teacher_id, course_id, teacher.role]]), function(error, result, fields) {
                                                            if(error) callback(error + ' at insert teacher_teach_course');
                                                            else{
                                                                callback();
                                                            }
                                                    });
                                                    } 
                                                },
                                            ], function(error) {
                                                if (error) callback(error);
                                                else callback();
                                            });
                                        }, function(error) {
                                            if (error) callback(error);
                                            else callback();
                                        });
                                    },
                                ], function(error) {
                                    if (error) callback(error);
                                    else callback();
                                });
                            }else{
                                //existed course
                                var course_id = result.rows[0].id;
                                async.series([
                                    //update course
                                    function(callback){
                                        connection.query(format(`UPDATE courses SET name = %L, note = %L, office_hour = %L
                                            WHERE id = %L`, course.name, course.note, course.office_hour, course_id), function(error, result, fields) {
                                            if (error) callback(error + ' at update course');
                                            else callback();
                                        });
                                    },
                                    //update class_has_course
                                    function(callback){
                                        connection.query(format(`SELECT id FROM classes WHERE name = %L`, course.class_name), function(error, result, fields) {
                                            if (error) callback(error + ' at get class_id');
                                            else {
                                                var class_id = result.rows[0].id;
                                                connection.query(format(`UPDATE class_has_course SET schedules = %L WHERE class_id = %L AND course_id = %L`, course.schedules, class_id, course_id), function(error, result, fields) {
                                                    if (error) callback(error + ' at update class_has_course');
                                                    else callback();
                                                });
                                            }
                                        });
                                    }
                                ], function(error) {
                                    if (error) callback(error);
                                    else callback();
                                });
                            }
                        }
                    });
                }, function(error) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            }
        ], function(error) {
            if (error) {
                _global.sendError(res, null,error);
                done();
                return console.log(error);
            } else {
                console.log('success import schedules---------------------------------------');
                res.send({ result: 'success', message: 'success import successfully' });
                done();
            }
        });
    });
});

module.exports = router;
