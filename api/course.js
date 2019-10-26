var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var async = require("async");
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);
var connection = mysql.createConnection(_global.db);
var jwt = require('jsonwebtoken'); 
var pool = mysql.createPool(_global.db);
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var teacher_list = [];

router.get('/detail/:id', function(req, res, next) {
    var id = req.params['id'];
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT courses.*,semesters.name as semester_name, semesters.id as semester_id,programs.name as program_name,
                            (semesters.id - (SELECT MAX(id) FROM semesters)) as not_in_current_semester
            FROM courses,semesters,programs 
            WHERE programs.id = courses.program_id AND courses.id = %L AND courses.semester_id = semesters.id LIMIT 1`, id), function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            var course = result.rows[0];
            connection.query(format(`SELECT * FROM users,teacher_teach_course
                WHERE users.id = teacher_teach_course.teacher_id AND teacher_teach_course.course_id = %L`, id), function(error, result, fields) {
                if (error) {
                    var message = error.message + ' at get lecturers/TAs';
                    _global.sendError(res, message);
                    done();
                    return console.log(message);
                }
                var lecturers = [];
                var TAs = [];
                for (var i = 0; i < result.rowCount; i++) {
                    if (result.rows[i].teacher_role == 0) {
                        lecturers.push(result.rows[i]);
                    } else {
                        TAs.push(result.rows[i]);
                    }
                }
                connection.query(format(`SELECT class_id, classes.name as class_name, classes.email as class_email,class_has_course.course_id ,schedules , total_stud
                    FROM classes,class_has_course 
                    WHERE course_id = %L AND classes.id = class_has_course.class_id `, id), function(error, result, fields) {
                    if (error) {
                        var message = error.message + ' at get schedule';
                        _global.sendError(res, message);
                        done();
                        return console.log(message);
                    }
                    res.send({ result: 'success', course: course, lecturers: lecturers, TAs: TAs, class_has_course: result.rows });
                    done();
                });
            });
        });
    });
});

router.post('/list', function(req, res, next) {
    var searchText = req.body.searchText;
    var page = req.body.page != null ? req.body.page : _global.default_page;
    var limit = req.body.limit != null ? req.body.limit : _global.detail_limit;
    var sort = req.body.sort != null ? req.body.sort : 'none';

    var program_id = req.body.program_id != null ? req.body.program_id : 1;
    var class_id = req.body.class_id != null ? req.body.class_id : 0;
    var semester_id = req.body.semester_id != null ? req.body.semester_id : 0;
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }
        var return_function = function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }

            course_list = result.rows;
            var search_list = [];
            if (searchText == null) {
                search_list = course_list;
            } else {
                for (var i = 0; i < course_list.length; i++) {
                    if (course_list[i].code.toLowerCase().indexOf(searchText.toLowerCase()) != -1 ||
                        course_list[i].name.toLowerCase().indexOf(searchText.toLowerCase()) != -1 ||
                        course_list[i].lecturers.toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
                        search_list.push(course_list[i]);
                    }
                }
            }
            if (sort != 'none') {
                _global.sortListByKey(sort, search_list, 'last_name');
            }
            if (limit != -1) {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    courses: _global.filterListByPage(page, limit, search_list)
                });
            } else {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    courses: search_list
                });
            }
            done();
        };
        var query = `SELECT courses.id,courses.code,courses.name,attendance_count,total_stud, courses.note,courses.office_hour,
                                (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                                FROM teacher_teach_course,users 
                                WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                                FROM teacher_teach_course,users 
                                WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 1) as TAs,
                                classes.name as class_name 
                        FROM courses, class_has_course, classes
                        WHERE class_has_course.course_id = courses.id AND classes.id = class_has_course.class_id AND courses.program_id = ` + program_id;
        if (class_id != 0) {
            query += ' AND class_has_course.class_id = ' + class_id;
        }
        if (semester_id != 0) {
            query += ' AND courses.semester_id = ' + semester_id;
        }
        query += ' ORDER BY courses.id';
        connection.query(query, return_function);
    });
});

router.post('/add', function(req, res, next) {
    if (req.body.code === undefined || req.body.code == '') {
        _global.sendError(res, null, "Course code is required");
        return;
    }
    if (req.body.name === undefined || req.body.name == '') {
        _global.sendError(res, null, "Course name is required");
        return;
    }
    if (req.body.lecturers === undefined || req.body.lecturers.length == 0) {
        _global.sendError(res, null, "Lecturers is required");
        return;
    }
    if (req.body.program_id === undefined || req.body.program_id == 0) {
        _global.sendError(res, null, "Program is required");
        return;
    }
    if (req.body.classes === undefined) {
        _global.sendError(res, null, "Class is required");
        return;
    }
    for (var i = 0; i < req.body.classes.length; i++) {
        if (parseInt(req.body.classes[i].classId) == 0) {
            _global.sendError(res, null, "Class is required");
            return;
        }
        if (req.body.classes[i].schedule == '') {
            _global.sendError(res, null, "Schedule is required");
            return;
        }
    }
    var new_name = req.body.name;
    var new_code = req.body.code;
    var new_lecturers = req.body.lecturers;
    var new_TAs = req.body.TAs === undefined ? [] : req.body.TAs;
    var new_program_id = req.body.program_id;
    var new_note = req.body.note === undefined ? null : req.body.note;
    var new_office_hour = req.body.office_hour === undefined ? null : req.body.office_hour;

    var new_classes = req.body.classes;

    var new_student_list = [];
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }
        connection.query(format(`SELECT id FROM courses WHERE code= %L AND semester_id = (SELECT MAX(id) FROM semesters)  LIMIT 1`, new_code), function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            //check course with same code in the same semester exist
            if (result.rowCount > 0) {
                _global.sendError(res, null, "The course already existed this semester");
                done();
                return console.log("The course already existed this semester");
            }
            console.log('start adding course!---------------------------------------');
            connection.query(`SELECT MAX(id) as id FROM semesters`, function(error, result, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    done();
                    return console.log(error);
                }
                var new_course = [[
                    new_code,
                    new_name,
                    result.rows[0].id,
                    new_program_id,
                    new_note,
                    new_office_hour,
                ]];
                var new_course_id;

                async.series([
                    //Start transaction
                    function(callback) {
                        connection.query('BEGIN', (error) => {
                            if (error) callback(error);
                            else callback();
                        })
                    },
                    //Insert new Course
                    function(callback) {
                        connection.query(format(`INSERT INTO courses (code,name,semester_id,program_id,note,office_hour) VALUES %L RETURNING id`, new_course), function(error, result, fields) {
                            if (error) {
                                console.log('insert courses error');
                                callback(error);
                            } else {
                                new_course_id = result.rows[0].id;
                                callback();
                            }
                        });
                    },
                    //Insert teacher_teach_course
                    function(callback) {
                        var new_teacher_teach_course = [];
                        //// Lecturers
                        for (var i = 0; i < new_lecturers.length; i++) {
                            var temp = [];
                            temp.push(new_lecturers[i].id);
                            temp.push(new_course_id);
                            temp.push(_global.lecturer_role);
                            new_teacher_teach_course.push(temp);
                        }
                        //// TAs
                        for (var i = 0; i < new_TAs.length; i++) {
                            var temp = [];
                            temp.push(new_TAs[i].id);
                            temp.push(new_course_id);
                            temp.push(_global.ta_role);
                            new_teacher_teach_course.push(temp);
                        }
                        connection.query(format(`INSERT INTO teacher_teach_course (teacher_id,course_id,teacher_role) VALUES %L`, new_teacher_teach_course), function(error, result, fields) {
                            if (error) {
                                console.log(error.message + ' at insert teacher_teach_course');
                                callback(error);
                            } else {
                                console.log('inserted teacher_teach_course');
                                callback();
                            }
                        });
                    },
                    //Insert class_has_course
                    function(callback) {
                        async.each(new_classes, function(_class, callback) {
                            var class_has_course = [[
                                _class.classId,
                                new_course_id,
                                _class.schedule
                            ]];
                            connection.query(format(`INSERT INTO class_has_course (class_id, course_id, schedules) VALUES %L RETURNING id`, class_has_course), function(error, result, fields) {
                                if (error) {
                                    console.log(error.message + ' at insert class_has_course');
                                    callback(error);
                                } else {
                                    var class_has_course_id = result.rows[0].id;
                                    var new_student_enroll_course = [];
                                    async.series([
                                        //get student from class
                                        function(callback) {
                                            if (_class.isAddStudentFromCLass) {
                                                connection.query(format(`SELECT id FROM students WHERE class_id = %L`, _class.classId),function(error, result, fields) {
                                                    if (error) {
                                                        console.log(error.message + ' at get students from class');
                                                        callback(error);
                                                    } else {
                                                        for (var i = 0; i < result.rowCount; i++) {
                                                            var temp = [];
                                                            temp.push(class_has_course_id);
                                                            temp.push(result.rows[i].id);
                                                            new_student_enroll_course.push(temp);
                                                        }
                                                        callback();
                                                    }
                                                });
                                            } else callback();
                                        },
                                        //get student from file
                                        function(callback) {
                                            if (_class.studentListFromFile.length > 0) {
                                                async.each(_class.studentListFromFile, function(student, callback) {
                                                    connection.query(format(`SELECT id FROM students WHERE stud_id = %L LIMIT 1`, student.stud_id), function(error, result, fields) {
                                                        if (error) {
                                                            console.log(error.message + ' at get student_id from datbase (file)');
                                                            callback(error);
                                                        } else {
                                                            if (result.rowCount == 0) {
                                                                //new student to system
                                                                var new_user = [[
                                                                    _global.getFirstName(student.name),
                                                                    _global.getLastName(student.name),
                                                                    student.stud_id + '@student.hcmus.edu.vn',
                                                                    student.phone,
                                                                    _global.role.student,
                                                                    bcrypt.hashSync(student.code, 10),
                                                                ]];
                                                                new_student_list.push({
                                                                    name: _global.getLastName(student.name),
                                                                    email : student.stud_id + '@student.hcmus.edu.vn'
                                                                });
                                                                connection.query(format(`INSERT INTO users (first_name,last_name,email,phone,role_id,password) VALUES %L RETURNING id`, new_user), function(error, result, fields) {
                                                                    if (error) {
                                                                        callback(error);
                                                                    } else {
                                                                        var student_id = result.rows[0].id;
                                                                        var new_student = [
                                                                            student_id,
                                                                            student.stud_id,
                                                                            _class.classId,
                                                                        ];
                                                                        connection.query(format(`INSERT INTO students (id,stud_id,class_id) VALUES %L`, new_student), function(error, result, fields) {
                                                                            if (error) {
                                                                                callback(error);
                                                                            } else {
                                                                                var temp = [];
                                                                                temp.push(class_has_course_id);
                                                                                temp.push(student_id);
                                                                                new_student_enroll_course.push(temp);
                                                                                callback();
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                //old student
                                                                var temp = [];
                                                                temp.push(class_has_course_id);
                                                                temp.push(result.rows[0].id);
                                                                new_student_enroll_course.push(temp);
                                                                callback();
                                                            }
                                                        }
                                                    });
                                                }, function(error) {
                                                    if (error) callback(error);
                                                    else callback();
                                                });
                                            } else {
                                                callback();
                                            }
                                        }
                                    ], function(error) {
                                        if (error) {
                                            callback(error);
                                        } else {
                                            connection.query(format(`INSERT INTO student_enroll_course (class_has_course_id,student_id) VALUES %L`, new_student_enroll_course), function(error, result, fields) {
                                                if (error) {
                                                    console.log(error.message + ' at insert student_enroll_course');
                                                    callback(error);
                                                } else {
                                                    console.log('inserted student_enroll_course');
                                                    callback();
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }, function(error) {
                            if (error) {
                                callback(error);
                            } else {
                                console.log('inserted class_has_course');
                                callback();
                            }
                        });
                    },
                    //Commit transaction
                    function(callback) {
                        connection.query('COMMIT', (error) => {
                            if (error) callback(error);
                            else callback();
                        });
                    },
                ], function(error) {
                    if (error) {
                        _global.sendError(res, error.message);
                        connection.query('ROLLBACK', (error) => {
                            done();
                            return console.log(error);
                        });
                        done();
                        return console.log(error);
                    } else {
                        async.each(new_student_list, function(student, callback) {
                            var token = jwt.sign({ email: student.email }, _global.jwt_secret_key, { expiresIn: _global.jwt_register_expire_time });
                            var link = _global.host + '/register;token=' + token;
                            _global.sendMail(
                                '"Giáo vụ"',
                                student.email,
                                'Register your account',
                                'Hi,'+ student.name + '\r\n' + 
                                'Your account has been created.To setup your account for the first time, please go to the following web address: \r\n\r\n' +
                                link + 
                                '\r\n(This link is valid for 7 days from the time you received this email)\r\n\r\n' +
                                'If you need help, please contact the site administrator,\r\n' +
                                'Admin User \r\n\r\n' +
                                'admin@fit.hcmus.edu.vn'
                            );
                            callback();
                        }, function(error) {
                            if (error) {
                                _global.sendError(res, error.message);
                                done();
                                return console.log(error);
                            } else {
                                console.log('success adding course!---------------------------------------');
                                res.send({ result: 'success', message: 'Course Added Successfully' });
                            }
                        });
                    }
                    done();
                });
            });
        });
    });
});

router.post('/edit', function(req, res, next) {
    if (req.body.id === undefined || req.body.id == 0) {
        _global.sendError(res, null, "Course ID is required");
        return;
    }
    if (req.body.code === undefined || req.body.code == '') {
        _global.sendError(res, null, "Course code is required");
        return;
    }
    if (req.body.name === undefined || req.body.name == '') {
        _global.sendError(res, null, "Course name is required");
        return;
    }
    if (req.body.lecturers === undefined || req.body.lecturers.length == 0) {
        _global.sendError(res, null, "Lecturers is required");
        return;
    }
    var course_id = req.body.id;
    var new_name = req.body.name;
    var new_code = req.body.code;
    var new_lecturers = req.body.lecturers;
    var new_TAs = req.body.TAs === undefined ? [] : req.body.TAs;
    var new_note = req.body.note === undefined ? null : req.body.note;
    var new_office_hour = req.body.office_hour === undefined ? null : req.body.office_hour;

    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }
        connection.query(format(`SELECT code FROM courses WHERE id = %L LIMIT 1`, course_id), function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            //check course with same code in the same semester exist
            if (result.rowCount == 0) {
                _global.sendError(res, null, "Course not found");
                done();
                return console.log("Course not found");
            }
            console.log('start updating course!---------------------------------------');
            async.series([
                //Start transaction
                function(callback) {
                    connection.query('BEGIN', (error) => {
                        if (error) callback(error);
                        else callback();
                    });
                },
                //Insert new Course
                function(callback) {
                    connection.query(format(`UPDATE courses SET code = %L ,name = %L , note = %L , office_hour = %L WHERE id = %L`, new_code, new_name, new_note, new_office_hour, course_id), function(error, result, fields) {
                        if (error) {
                            callback(error);
                        } else {
                            callback();
                        }
                    });
                },
                //update teacher_teach_course
                function(callback) {
                    var new_teacher_teach_course = [];
                    //// Lecturers
                    for (var i = 0; i < new_lecturers.length; i++) {
                        var temp = [];
                        temp.push(new_lecturers[i].id);
                        temp.push(course_id);
                        temp.push(_global.lecturer_role);
                        new_teacher_teach_course.push(temp);
                    }
                    //// TAs
                    for (var i = 0; i < new_TAs.length; i++) {
                        var temp = [];
                        temp.push(new_TAs[i].id);
                        temp.push(course_id);
                        temp.push(_global.ta_role);
                        new_teacher_teach_course.push(temp);
                    }
                    connection.query(format(`DELETE FROM teacher_teach_course WHERE course_id = %L`, course_id), function(error, result, fields) {
                        if (error) {
                            console.log(error.message + ' at remove old teacher_teach_course');
                            callback(error);
                        } else {
                            console.log('removed old teacher_teach_course');
                            connection.query(format(`INSERT INTO teacher_teach_course (teacher_id,course_id,teacher_role) VALUES %L`, new_teacher_teach_course), function(error, result, fields) {
                                if (error) {
                                    console.log(error.message + ' at insert new teacher_teach_course');
                                    callback(error);
                                } else {
                                    console.log('inserted new teacher_teach_course');
                                    callback();
                                }
                            });
                        }
                    });
                },
                //Commit transaction
                function(callback) {
                    connection.query('COMMIT', (error) => {
                        if (error) callback(error);
                        else callback();
                    });
                },
            ], function(error) {
                if (error) {
                    _global.sendError(res, error.message);
                    connection.query('ROLLBACK', (error) => {
                        done();
                        return console.log(error);
                    });
                    done();
                    return console.log(error);
                } else {
                    console.log('success updated course!---------------------------------------');
                    res.send({ result: 'success', message: 'Course Updated Successfully' });
                }
                done();
            });
        });
    });
});

router.post('/list/teaching', function(req, res, next) {
    if (req.body.teacher_id === undefined || req.body.teacher_id == 0) {
        _global.sendError(res, null, "Teacher id is required");
        return;
    }
    var teacher_id = req.body.teacher_id;
    var searchText = req.body.searchText;
    var program_id = req.body.program_id != null ? req.body.program_id : 0;
    var class_id = req.body.class_id != null ? req.body.class_id : 0;

    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }
        var return_function = function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }

            course_list = result.rows;
            var search_list = [];
            if (searchText == null) {
                search_list = course_list;
            } else {
                for (var i = 0; i < course_list.length; i++) {
                    if (course_list[i].code.toLowerCase().indexOf(searchText.toLowerCase()) != -1 ||
                        course_list[i].name.toLowerCase().indexOf(searchText.toLowerCase()) != -1 ||
                        course_list[i].lecturers.toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
                        search_list.push(course_list[i]);
                    }
                }
            }
            res.send({
                result: 'success',
                courses: search_list
            });
            done();
        };
        var query = `SELECT courses.id,courses.code,courses.name,total_stud,classes.id as class_id,classes.name as class_name, 
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
                    FROM courses, class_has_course, teacher_teach_course, classes
                    WHERE teacher_teach_course.teacher_id = %L AND
                        teacher_teach_course.course_id = courses.id AND 
                        class_has_course.course_id = courses.id AND
                        class_has_course.class_id = classes.id AND
                        courses.semester_id = (SELECT MAX(ID) FROM semesters)`;
        if (class_id != 0) {
            query += ' AND class_has_course.class_id = ' + class_id;
        }
        if (program_id != 0) {
            query += ' AND courses.program_id = ' + program_id;
        }
        connection.query(format(query, teacher_id), return_function);
    });
});

router.post('/import', function(req, res, next) {
    if (req.body.class_name == undefined || req.body.class_name == '') {
        _global.sendError(res, null, "Class name is required");
        return;
    }
    if (req.body.course_list == undefined || req.body.course_list.length == 0) {
        _global.sendError(res, null, "Course list is required");
        return;
    }
    var class_name = req.body.class_name;
    var course_list = req.body.course_list;
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }
        var class_id = 0;
        var program_id = 0;
        var new_course_id = 0;
        var semester_id = 0;
        var program_code = _global.getProgramCodeFromClassName(class_name);
        async.series([
            //Start transaction
            function(callback) {
                connection.query('BEGIN', (error) => {
                    if (error) callback(error);
                    else callback();
                });
            },
            //Get semester id
            function(callback) {
                connection.query(`SELECT MAX(id) as id FROM semesters`, function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        semester_id = result.rows[0].id;
                        callback();
                    }
                });
            },
            //Get program id
            function(callback) {
                connection.query(format(`SELECT id FROM programs WHERE UPPER(code) = UPPER(%L) LIMIT 1`, program_code), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        if (result.rowCount == 0) {
                            //program not found
                            callback('Program not found');
                        } else {
                            program_id = result.rows[0].id;
                            callback();
                        }
                    }
                });
            },
            //Get class id
            function(callback) {
                connection.query(format(`SELECT id FROM classes WHERE UPPER(name) = UPPER(%L) LIMIT 1`, class_name), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        if (result.rowCount == 0) {
                            //new class => insert
                            var email = class_name.toLowerCase() + '@student.hcmus.edu.vn';
                            var new_class = [[
                                class_name,
                                email,
                                program_id
                            ]];
                            connection.query(format(`INSERT INTO classes (name,email,program_id) VALUES %L RETURNING id`, new_class), function(error, result, fields) {
                                if (error) {
                                    callback(error);
                                } else {
                                    class_id = result.rows[0].id;
                                    callback();
                                }
                            });
                        } else {
                            class_id = result.rows[0].id;
                            callback();
                        }
                    }
                });
            },
            //Insert course
            function(callback) {
                async.each(course_list, function(course, callback) {
                    var new_course = [[
                        course.code,
                        course.name,
                        semester_id,
                        program_id,
                        course.office_hour,
                        course.note,
                    ]];
                    async.series([
                        //insert courses
                        function(callback) {
                            connection.query(format(`INSERT INTO courses (code,name,semester_id,program_id,office_hour,note) VALUES %L RETURNING id`, new_course), function(error, result, fields) {
                                if (error) {
                                    callback(error);
                                } else {
                                    new_course_id = result.rows[0].id;
                                    callback();
                                }
                            });
                        },
                        //insert class_has_course
                        function(callback) {
                            var new_class_has_course = [[
                                class_id,
                                new_course_id
                            ]];
                            connection.query(format(`INSERT INTO class_has_course (class_id,course_id) VALUES %L`, new_class_has_course), function(error, result, fields) {
                                if (error) {
                                    callback(error);
                                } else {
                                    callback();
                                }
                            });
                        },
                        //insert teacher & teacher_teach_course
                        function(callback) {
                            var lecturers = course.lecturers.split('\r\n');
                          var teachers = [];
                          var name;
                          for(var i = 0 ; i < lecturers.length; i++){
                            // var name = _global.removeExtraFromTeacherName(lecturers[i]);
                            //var email = _global.getEmailFromTeacherName(name);
                            var email = _global.getEmailFromTeacherName(lecturers[i]);
                            name = _global.removeEmailTeacherName(lecturers[i]);
                            if (email == undefined || email == ''){
                              callback(name + ' missing email')
                              return

                            }
                            teachers.push({
                              first_name : _global.getFirstName(name),
                              last_name : _global.getLastName(name),
                              email : email,
                              role : _global.lecturer_role
                            });
                          }
                          if(course.tas != undefined){
                            var tas = course.tas.split('\r\n');
                            console.log('TA list', tas)
                            for(var i = 0 ; i < tas.length; i++){
                              // var name = _global.removeExtraFromTeacherName(lecturers[i]);
                              //var email = _global.getEmailFromTeacherName(name);
                              var email = _global.getEmailFromTeacherName(tas[i]);
                              name = _global.removeEmailTeacherName(tas[i]);
                              if (email == undefined || email == ''){
                                callback(name + ' missing email')
                                return
                              }
                              teachers.push({
                                first_name : _global.getFirstName(name),
                                last_name : _global.getLastName(name),
                                email : email,
                                role : _global.ta_role
                              });
                            }
                          }
                            async.each(teachers, function(teacher, callback) {
                                var check_new_teacher = false;
                                var teacher_id = 0;
                                async.series([
                                    //check if teacher exist
                                    function(callback) {
                                        connection.query(format(`SELECT users.id FROM users,teachers WHERE users.id = teachers.id AND email = %L LIMIT 1`, teacher.email), function(error, result, fields) {
                                            if (error) {
                                                callback(error);
                                            } else {
                                                if (result.rowCount == 0) {
                                                    check_new_teacher = true;
                                                    callback();
                                                } else {
                                                    teacher_id = result.rows[0].id;
                                                    callback();
                                                }
                                            }
                                        });
                                    },
                                    //insert teacher if needed
                                    function(callback) {
                                        if(check_new_teacher){
                                            var new_teacher = [[
                                                teacher.first_name,
                                                teacher.last_name,
                                                teacher.email,
                                                _global.role.teacher
                                            ]];
                                            connection.query(format(`INSERT INTO users (first_name,last_name,email,role_id) VALUES %L RETURNING id`, new_teacher), function(error, result, fields) {
                                                if (error) {
                                                    callback(error);
                                                } else {
                                                    teacher_id = result.rows[0].id;
                                                    var token = jwt.sign({ email: teacher.email }, _global.jwt_secret_key, { expiresIn: _global.jwt_register_expire_time });
                                                    var link = _global.host + '/register;token=' + token;
                                                    _global.sendMail(
                                                        '"Giáo vụ"',
                                                        teacher.email,
                                                        'Register your account',
                                                        'Hi,'+ teacher.first_name + ' ' + teacher.last_name + '\r\n' + 
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
                                        }else{
                                            callback();
                                        }
                                    },
                                    //insert teacher_teach_coures
                                    function(callback) {
                                        var new_teacher_teach_course = [[
                                           teacher_.id,
                                            teacher.role,
                                            new_course_id
                                        ]];
                                        connection.query(format(`INSERT INTO teacher_teach_course (teacher_id,teacher_role,course_id) VALUES %L`, new_teacher_teach_course), function(error, result, fields) {
                                            if (error) {
                                                callback(error);
                                            } else {
                                                callback();
                                            }
                                        });
                                    },
                                ], function(error) {
                                    if (error) {
                                        callback(error);
                                    } else {
                                        callback();
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
                    ], function(error) {
                        if (error) {
                            callback(error);
                        } else {
                            callback();
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
            //Commit transaction
            function(callback) {
                connection.query('COMMIT', (error) => {
                    if (error) callback(error);
                    else callback();
                });
            },
        ], function(error) {
            if (error) {
                _global.sendError(res, error.message, error);
                connection.query('ROLLBACK', (error) => {
                    done();
                    console.log(error);
                });
                done();
                console.log(error);
            } else {
                console.log('success import courses!---------------------------------------');
                res.send({ result: 'success', message: 'Courses imported successfully' });
            }
            done();
        });
    });
});

router.post('/export', function(req, res, next) {
    if (req.body.classes_id == undefined || req.body.classes_id.length == 0) {
        _global.sendError(res, null, "Classes id is required");
        return;
    }
    var classes_id = req.body.classes_id;
    var course_lists = [];
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }
        async.series([
            //Start transaction
            function(callback) {
                connection.query('BEGIN', (error) => {
                    if (error) callback(error);
                    else callback();
                });
            },
            //get student from each class
            function(callback) {
                async.each(classes_id, function(class_id, callback) {
                    connection.query(format(`SELECT courses.id,courses.code,courses.name,attendance_count,total_stud, courses.note,courses.office_hour,classes.name as class_name,
                                (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name, '(', users.email, ')')), E'\r\n')
                                FROM teacher_teach_course,users 
                                WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name, '(', users.email, ')')), E'\r\n')
                                FROM teacher_teach_course,users 
                                WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 1) as TAs 
                            FROM courses, class_has_course,classes
                            WHERE class_has_course.course_id = courses.id AND class_has_course.class_id = %L  AND classes.id = class_has_course.class_id
                            ORDER BY courses.id`, class_id), function(error, result, fields) {
                        if (error) {
                            console.log(error.message + ' at get course by class');
                            callback(error);
                        } else {
                            course_lists.push(result.rows);
                            callback();
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
            //Commit transaction
            function(callback) {
                cconnection.query('COMMIT',function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
        ], function(error) {
            if (error) {
                _global.sendError(res, null, error.message);
                connection.query('ROLLBACK', (error) => {
                    done();
                    console.log(error);
                });
                done();
                console.log(error);
            } else {
                console.log('success export courses!---------------------------------------');
                res.send({ result: 'success', message: 'Courses exported successfully', course_lists: course_lists });
            }
            done();
        });
    });
});

router.post('/class-has-course', function(req, res, next) {
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }
        connection.query(`SELECT class_has_course.id,courses.code,courses.name,classes.name as class_name 
                        FROM courses, class_has_course, classes
                        WHERE class_has_course.course_id = courses.id AND classes.id = class_has_course.class_id
                        ORDER BY classes.name DESC`, function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            res.send({
                result: 'success',
                class_has_course: result.rows
            });
            done();
        });
    });
});

router.post('/program-has-course', function(req, res, next) {
    var semester_id = req.body.semester_id ? req.body.semester_id : 0;
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }
        connection.query(`SELECT * FROM programs`, function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            var program_has_course = result.rows;
            async.each(program_has_course, function(program, callback) {
                connection.query(format(`SELECT class_has_course.id,courses.code,courses.name,classes.name as class_name, semesters.name as semester,
                                (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), ', ')
                                FROM teacher_teach_course,users 
                                WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers 
                        FROM courses, class_has_course, classes, semesters
                        WHERE class_has_course.course_id = courses.id AND classes.id = class_has_course.class_id AND
                            semesters.id = courses.semester_id AND courses.program_id = %L AND semesters.id = %L
                        ORDER BY classes.name DESC`, program.id, semester_id), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        program['courses'] = result.rows;
                        callback();
                    }
                });
            }, function(error) {
                if (error) {
                    _global.sendError(res, error.message);
                    done();
                    return console.log(error);
                } else {
                    res.send({
                        result: 'success',
                        program_has_course: program_has_course
                    });
                    done();
                }
            });
        });
    });
});

//API mobile

router.post('/teaching', function(req, res, next) {
    var teacher_id = req.decoded.id;

    if (teacher_id) {
        pool_postgres.connect(function(error, connection, done) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }

            var return_function = function(error, result, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    done();
                    return console.log(error);
                }

                res.send({
                    result: 'success',
                    total_items: result.rowCount,
                    courses: result.rows
                });

                done();
            };

            connection.query(format(`SELECT courses.id, courses.code, courses.name, class_has_course.class_id as class, classes.name as class_name, 
                class_has_course.id as chcid, class_has_course.total_stud as total_stud, class_has_course.schedules as schedule, courses.office_hour, courses.note
                                FROM courses JOIN teacher_teach_course ON course_id = courses.id
                                    JOIN class_has_course on class_has_course.course_id = courses.id
                                    JOIN classes on class_has_course.class_id = classes.id
                                WHERE teacher_id = %L AND
                                    courses.semester_id = (SELECT MAX(ID) FROM semesters)`, teacher_id), return_function);
        });
    } else {
        return res.status(401).send({
            result: 'failure',
            message: 'teacher_id is required'
        });
    }
});

router.post('/studying', function(req, res, next) {
    var student_id = req.decoded.id;
    if (student_id) {
        pool_postgres.connect(function(error, connection, done) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }

            var return_function = function(error, result, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    done();
                    return console.log(error);
                }

                console.log(result);

                res.send({
                    result: 'success',
                    total_items: result.rowCount,
                    courses: result.rows
                });

                done();
            };

            connection.query(format(`SELECT courses.id, courses.code, courses.name, class_has_course.class_id as class, classes.name as class_name, 
                class_has_course.id as chcid, class_has_course.total_stud as total_stud, class_has_course.schedules as schedule, courses.office_hour, courses.note 
                                FROM courses JOIN class_has_course ON class_has_course.course_id = courses.id
                                    JOIN classes ON class_has_course.class_id = classes.id
                                    JOIN student_enroll_course ON class_has_course.id = student_enroll_course.class_has_course_id
                                WHERE student_id = %L AND
                                    courses.semester_id = (SELECT MAX(ID) FROM semesters)`, student_id), return_function);
        });
    } else {
        return res.status(401).send({
            result: 'failure',
            message: 'student_id is required'
        });
    }
});

module.exports = router;
