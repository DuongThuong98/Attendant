/*jshint esversion: 6 */

var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var connection = mysql.createConnection(_global.db);
var pool = mysql.createPool(_global.db);
var bcrypt = require('bcrypt');
var async = require("async");
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);
var delegate_list = [];

router.post('/list-by-course', function(req, res, next) {
    if (req.body.course_id == null) {
        _global.sendError(res, null, "Course id is required");
        return console.log("Course_id is required");
    }
    if (req.body.classes_id == null || req.body.classes_id.length == 0) {
        _global.sendError(res, null, "Classes id is required");
        return console.log("Classes id is required");
    }
    var course_id = req.body.course_id;
    var classes_id = req.body.classes_id;
    pool_postgres.connect(function(error, connection, done) {
        var attendance_lists = [];
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        async.each(classes_id, function(class_id, callback) {
            connection.query(format(`SELECT students.id, students.stud_id as code, CONCAT(users.first_name, ' ', users.last_name) AS name ,users.avatar, student_enroll_course.attendance_status
            FROM users,student_enroll_course,students,class_has_course 
            WHERE users.id = students.id AND users.id = student_enroll_course.student_id AND
                student_enroll_course.class_has_course_id = class_has_course.id AND class_has_course.course_id = %L AND
                class_has_course.class_id = %L`, course_id, class_id), function(error, result, fields) {
                if (error) {
                    var message = error.message + ' at get student_list by course';
                    _global.sendError(res, message);
                    done();
                    return console.log(message);
                }
                var student_list = result.rows;
                var attendance_list = [];
                async.each(student_list, function(student, callback) {
                    var attendance = {
                        id: student.id,
                        code: student.code,
                        name: student.name,
                        exemption: student.attendance_status,
                        attendance_details: []
                    };
                    if(student.attendance_status == _global.attendance_status.exemption){
                        attendance_list.push(attendance);
                        callback();
                    }else{
                        connection.query(format(`SELECT attendance_detail.attendance_id, attendance_time, attendance_type, created_at, edited_by, edited_reason, 
                            (SELECT CONCAT(users.first_name,' ',users.last_name) FROM users WHERE users.id = edited_by) as editor
                            FROM attendance, attendance_detail 
                            WHERE attendance.closed = TRUE AND attendance.id = attendance_detail.attendance_id AND  course_id = %L AND student_id = %L 
                            ORDER BY attendance_id`, course_id, student.id), function(error, result, fields) {
                            if (error) {
                                console.log(error.message + ' at get attendance_details');
                                callback(error);
                            } else {
                                for (var i = 0; i < result.rowCount; i++) {
                                    attendance.attendance_details.push({
                                        attendance_id: result.rows[i].attendance_id,
                                        attendance_time: result.rows[i].attendance_time,
                                        attendance_type: result.rows[i].attendance_type,
                                        created_at: result.rows[i].created_at,
                                        edited_by: result.rows[i].edited_by,
                                        edited_reason: result.rows[i].edited_reason,
                                        editor: result.rows[i].editor,
                                    });
                                }
                                attendance_list.push(attendance);
                                callback();
                            }
                        });
                    }
                }, function(error) {
                    if (error) {
                        _global.sendError(res, error.message);
                        done();
                        return console.log(error);
                    } else {
                        attendance_lists.push(attendance_list);
                        callback();
                    }
                });
            });
        }, function(error) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            } else {
                console.log('loaded attendance_list');
                res.send({
                    result: 'success',
                    attendance_lists: attendance_lists
                });
            }
            done();
        });

    });
});

// Use by Staff - Add To Course
router.post('/check-add-to-course', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        return console.log("Course_id is required");
    }
    if (req.body.student_code == null || req.body.student_code == '') {
        _global.sendError(res, null, "Student code is required");
        return console.log("Student code is required");
    }
    if (isNaN(req.body.student_code)) {
        _global.sendError(res, null, "Student code must contain only numbers");
        return;
    }
    if (req.body.student_name == null || req.body.student_name == '') {
        _global.sendError(res, null, "Student name is required");
        return console.log("Student name is required");
    }

    var course_id = req.body.course_id;
    var student_code = req.body.student_code;
    var student_name = req.body.student_name;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT students.stud_id 
            FROM attendance,attendance_detail, students 
            WHERE attendance.id = attendance_detail.attendance_id AND attendance_detail.student_id = students.id AND attendance.course_id = %L AND students.stud_id = %L`, course_id, student_code), function(error, result, fields) {
            if (error) {
                var message = error.message + ' at get check add to course';
                _global.sendError(res, message);
                done();
                return console.log(message);
            }
            if (result.rowCount > 0) {
                _global.sendError(res, null, 'Student code found in attendance list');
            } else {
                res.send({
                    result: 'success'
                });
            }
            done();
        });
    });
});

/*
// Use by Staff - Remove From Course
router.post('/check-remove-from-course', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        return console.log("Course_id is required");
    }
    if (req.body.delete_student_index == null || req.body.delete_student_index == '') {
        _global.sendError(res, null, "Delete student index is required");
        return console.log("Delete student index is required");
    }
    if (isNaN(req.body.delete_student_index)) {
        _global.sendError(res, null, "Delete student index must be a number");
        return;
    }

    var course_id = req.body.course_id;
    var delete_student_index = req.body.delete_student_index ;

    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(course_id, delete_student_index), function(error, result, fields) {
            if (error) {
                var message = error.message + ' at get check remove from course';
                _global.sendError(res, message);
                done();
                return console.log(message);
            }
            if (result.rowCount == 0) {
                _global.sendError(res, null, 'Delete student index not found');
            } else {
                res.send({
                    result: 'success'
                });
            }
            done();
        });
    });
});
*/

//use by staff
router.post('/update-list-by-course', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        return console.log("Course_id is required");
    }
    if (req.body.classes_id == null || req.body.classes_id.length == 0) {
        _global.sendError(res, null, "classes is required");
        return console.log("classes is required");
    }
    if (req.body.attendance_lists == null) {
        _global.sendError(res, null, "Attendance Lists is required");
        return console.log("Attendance Lists is required");
    }
    var course_id = req.body.course_id;
    var classes_id = req.body.classes_id;
    var attendance_lists = req.body.attendance_lists;
    for (var i = 0; i < attendance_lists.length; i++) {
        for (var j = 0; j < attendance_lists[i].length; j++) {
            if (attendance_lists[i][j].name == '') {
                _global.sendError(res, null, "Student name is required");
                done();
                return console.log("Student name is required");
            }
        }
    }
    new_student_list = [];
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT name FROM courses WHERE id = %L LIMIT 1`, course_id), function(error, result, fields) {
            if (error) {
                var message = error.message + ' at check valid course';
                _global.sendError(res, message);
                done();
                return console.log(message);
            }
            if (result.rowCount == 0) {
                _global.sendError(res, null, 'Course not found!');
                done();
            } else {
                async.series([
                    //Start transaction
                    function(callback) {
                        connection.query('BEGIN', function(error) {
                            if (error) callback(error);
                            else callback();
                        });
                    },
                    //Check student info to update or create
                    function(callback) {
                        async.eachOf(attendance_lists, function(attendance_list, index, callback) {
                            async.each(attendance_list, function(student, callback) {
                                var check_new_student = false;
                                async.series([
                                    //Check student info to update or create
                                    function(callback) {
                                        if (student.id == 0) {
                                            //new student to list
                                            async.series([
                                                function(callback){
                                                    connection.query(format(`SELECT id FROM students WHERE stud_id = %L LIMIT 1`, student.code), function(error, result, fields) {
                                                        if (error) {
                                                            callback(error);
                                                        } else {
                                                            if (result.rowCount == 0) {
                                                                //Not exist in system
                                                                var new_user = [
                                                                    [
                                                                        _global.getFirstName(student.name),
                                                                        _global.getLastName(student.name),
                                                                        student.code + '@student.hcmus.edu.vn',
                                                                        _global.role.student,
                                                                    ]
                                                                ];
                                                                new_student_list.push({
                                                                    name: _global.getLastName(student.name),
                                                                    email : student.code + '@student.hcmus.edu.vn'
                                                                });
                                                                connection.query(format(`INSERT INTO users (first_name,last_name,email,role_id) VALUES %L RETURNING id`, new_user), function(error, result, fields) {
                                                                    if (error) {
                                                                        callback(error);
                                                                    } else {
                                                                        student.id = result.rows[0].id;
                                                                        var new_student = [
                                                                            [
                                                                                result.rows[0].id,
                                                                                student.code,
                                                                                classes_id[index],
                                                                            ]
                                                                        ];
                                                                        connection.query(format(`INSERT INTO students (id,stud_id,class_id) VALUES %L`, new_student), function(error, result, fields) {
                                                                            if (error) {
                                                                                callback(error);
                                                                            } else {
                                                                                callback();
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                //Exist in system
                                                                student.id = result.rows[0].id;
                                                                callback();
                                                            }
                                                        }
                                                    });
                                                },
                                                function(callback){
                                                    connection.query(format(`SELECT id FROM class_has_course WHERE class_id = %L AND course_id = %L LIMIT 1`, classes_id[index], course_id), function(error, result, fields) {
                                                        if (error) {
                                                            callback(error);
                                                        } else {
                                                            var insert_student_enroll_course = [
                                                                [
                                                                    result.rows[0].id,
                                                                    student.id
                                                                ]
                                                            ];
                                                            connection.query(format(`INSERT INTO student_enroll_course (class_has_course_id,student_id) VALUES %L`, insert_student_enroll_course), function(error, result, fields) {
                                                                if (error) {
                                                                    callback(error);
                                                                } else {
                                                                    callback();
                                                                }
                                                            });
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
                                        } else {
                                            callback();
                                        }
                                    },
                                    function(callback) {
                                        //update student info
                                        connection.query(format(`SELECT * FROM users WHERE id = %L LIMIT 1`, student.id), function(error, result, fields) {
                                            if (error) {
                                                callback(error);
                                            } else {
                                                if (result.rowCount == 0) {
                                                    var error = { message: 'Invalid student id : ' + student.id };
                                                    callback(error);
                                                } else {
                                                    connection.query(format(`UPDATE users SET first_name = %L, last_name = %L WHERE id = %L`, _global.getFirstName(student.name), _global.getLastName(student.name), student.id), function(error, result, fields) {
                                                        if (error) {
                                                            callback(error);
                                                        } else {
                                                            callback();
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    },
                                    //update attendance details by class + course
                                    function(callback) {
                                        async.each(student.attendance_details, function(attendance_detail, callback) {
                                            connection.query(format(`SELECT * FROM attendance_detail WHERE attendance_id = %L AND student_id = %L`, attendance_detail.attendance_id, student.id), function(error, result, fields) {
                                                if (error) {
                                                    callback(error);
                                                } else {
                                                    //for new student
                                                    if (result.rowCount == 0) {
                                                        check_new_student = true;
                                                        var temp = [
                                                            [
                                                                attendance_detail.attendance_id,
                                                                student.id,
                                                                attendance_detail.attendance_type,
                                                                attendance_detail.attendance_time,
                                                                attendance_detail.edited_by,
                                                                attendance_detail.edited_reason
                                                            ]
                                                        ];
                                                        connection.query(format(`INSERT INTO attendance_detail (attendance_id,student_id,attendance_type,attendance_time,edited_by,edited_reason) VALUES %L`, temp), function(error, result, fields) {
                                                            if (error) {
                                                                callback(error);
                                                            } else {
                                                                callback();
                                                            }
                                                        });
                                                    } else {
                                                        connection.query(format(`UPDATE attendance_detail SET attendance_time = %L, attendance_type = %L, edited_by = %L, edited_reason = %L WHERE attendance_id = %L AND student_id = %L`, attendance_detail.attendance_time, attendance_detail.attendance_type, attendance_detail.edited_by, attendance_detail.edited_reason, attendance_detail.attendance_id, student.id), function(error, result, fields) {
                                                            if (error) {
                                                                callback(error);
                                                            } else {
                                                                callback();
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }, function(error) {
                                            if (error) {
                                                callback(error);
                                            } else {
                                                console.log('updated attendance details for one student');
                                                callback();
                                            }
                                        });
                                    },
                                    //Add opening attendance if needed
                                    function(callback) {
                                        if(check_new_student){
                                            connection.query(format(`SELECT * FROM attendance WHERE class_id = %L AND course_id = %L AND closed = FALSE`, classes_id[index], course_id), function(error, result, fields) {
                                                if (error) {
                                                    callback(error);
                                                } else {
                                                    //No opening attendance
                                                    if (result.rowCount == 0) {
                                                        callback();
                                                    } else {
                                                        var temp = [
                                                            [
                                                                result.rows[0].id,
                                                                student.id,
                                                                _global.attendance_type.absent,
                                                                null,
                                                                null,
                                                                null
                                                            ]
                                                        ];
                                                        connection.query(format(`INSERT INTO attendance_detail (attendance_id,student_id,attendance_type,attendance_time,edited_by,edited_reason) VALUES %L`, temp), function(error, result, fields) {
                                                            if (error) {
                                                                callback(error + 'at add opening attendance');
                                                            } else {
                                                                callback();
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }else{
                                            callback();
                                        }
                                        
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
                                    console.log('updated attendance_list');
                                    callback();
                                }
                            });
                        }, function(error) {
                            if (error) {
                                callback(error);
                            } else {
                                console.log('updated attendance_lists');
                                callback();
                            }
                        });
                    },
                    //Commit transaction
                    function(callback) {
                        connection.query('COMMIT', function(error) {
                            if (error) callback(error);
                            else callback();
                        });
                    },
                ], function(error) {
                    if (error) {
                        _global.sendError(res, error.message);
                        connection.query('ROLLBACK', function(error) {
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
                                console.log('success updating attendance list by course!---------------------------------------');
                                res.send({ result: 'success', message: 'Attendance list updated successfully' });
                                done();
                            }
                        });
                    }
                });
            }
        });
    });
});

router.post('/opening-by-teacher', function(req, res, next) {
    if (req.body.teacher_id == null || req.body.teacher_id == 0) {
        _global.sendError(res, null, "teacher_id is required");
        return console.log("teacher_id is required");
    }
    var teacher_id = req.body.teacher_id;
    var isMobile = req.body.isMobile == null ? 0 : 1;
    pool_postgres.connect(function(error, connection, done) {
        var query = `SELECT attendance.*, courses.name as course_name,
         courses.code as course_code, classes.name as class_name,
         teacher_teach_course.* , class_has_course.total_stud, class_has_course.id as class_has_course_id
            FROM attendance, teacher_teach_course, courses, classes, class_has_course
            WHERE attendance.closed = FALSE AND attendance.course_id = teacher_teach_course.course_id AND 
                attendance.course_id = courses.id AND attendance.class_id = classes.id AND
                class_has_course.class_id = classes.id AND class_has_course.course_id = courses.id AND
                teacher_teach_course.teacher_id = %L`;

        if (isMobile) {
            query = `SELECT class_has_course.id as class_has_course_id, attendance.id as attendance_id
            FROM attendance, teacher_teach_course, courses, classes, class_has_course
            WHERE attendance.closed = FALSE AND attendance.course_id = teacher_teach_course.course_id AND 
                attendance.course_id = courses.id AND attendance.class_id = classes.id AND
                class_has_course.class_id = classes.id AND class_has_course.course_id = courses.id AND
                teacher_teach_course.teacher_id = %L`;
        }
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(query, teacher_id), function(error, result, fields) {
            if (error) {
                _global.sendError(res, null, 'error at get opening attendances');
                done();
                return console.log(error.message + ' at get opening attendances');
            } else {
                res.send({
                    result: 'success',
                    length: result.rowCount,
                    opening_attendances: result.rows
                });
                done();
            }
        });
    });
});

router.post('/create', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "course_id is required");
        return console.log("course_id is required");
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "class_id is required");
        return console.log("class_id is required");
    }
    var course_id = req.body.course_id;
    var class_id = req.body.class_id;
    var created_by = req.body.created_by ? req.body.created_by : req.decoded.id;
    var attendance = [
        [
            course_id,
            class_id,
            created_by
        ]
    ];
    var new_attendance_id = 0;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        async.series([
            function(callback) {
                connection.query('BEGIN', (error) => {
                    if (error) callback(error);
                    else callback();
                });
            },
            //Insert Attendance
            function(callback) {
                connection.query(format(`INSERT INTO attendance (course_id,class_id,created_by) VALUES %L RETURNING id`, attendance), function(error, result, fields) {
                    if (error) {
                        callback(error.message + ' at create attendances');
                    } else {
                        new_attendance_id = result.rows[0].id;
                        callback();
                    }
                });
            },
            //Insert attendance detail
            function(callback) {
                connection.query(format(`SELECT student_id,courses.name AS course_name,courses.code AS course_code FROM student_enroll_course,class_has_course, courses
                    WHERE student_enroll_course.class_has_course_id = class_has_course.id 
                    AND class_has_course.course_id = %L
                    AND class_has_course.class_id = %L
                    AND courses.id = class_has_course.course_id `, course_id, class_id), function(error, result, fields) {
                    if (error) {
                        callback(error.message + ' at get student in attendances');
                    } else {
                        async.each(result.rows, function(student, callback) {
                            var attendance_detail = [
                                [
                                    new_attendance_id,
                                    student.student_id
                                ]
                            ];
                            connection.query(format(`INSERT INTO attendance_detail (attendance_id,student_id) VALUES %L`, attendance_detail), function(error, result, fields) {
                                if (error) {
                                    console.log(error);
                                    callback(error.message + ' at insert attendance_details');
                                } else {
                                    connection.query(format(`INSERT INTO notifications (to_id,from_id,message,object_id,type) VALUES %L RETURNING id`, [[
                                        student.student_id,
                                        req.decoded.id,
                                        'opened an attendance session for course ' + student.course_code + '-' + student.course_name ,
                                        new_attendance_id,
                                        _global.notification_type.open_attendance
                                    ]]), function(error, result, fields) {
                                        if (error) {
                                            callback(error.message + ' at insert notifications');
                                        } else {
                                            var socket = req.app.get('socket');
                                            socket.emit('notificationPushed', {'to_id':student.student_id});
                                            callback();
                                        }
                                    });
                                }
                            });
                        }, function(error) {
                            if (error) callback(error);
                            else callback();
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
                    if (error) return console.log(error);
                });
                done(error);
                return console.log(error);
            } else {
                console.log('insert attendance_details');
                res.send({ result: 'success', attendance_id: new_attendance_id });
                done();
            }
        });
    });
});

router.post('/delete', function(req, res, next) {
    if (req.body.attendance_id == null || req.body.attendance_id == 0) {
        _global.sendError(res, null, "attendance_id is required");
        return console.log("attendance_id is required");
    }
    var attendance_id = req.body.attendance_id;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT course_id , class_id FROM attendance WHERE id = %L`, attendance_id), function(error, result, fields) {
            if (error) {
                _global.sendError(res, null, 'error at get attendances info');
                done();
                return console.log(error.message + ' at get attendances info');
            } else {
                for (var i = 0; i < delegate_list.length; i++) {
                    if (delegate_list[i]['course_id'] == result.rows[0].course_id && delegate_list[i]['class_id'] == result.rows[0].class_id) {
                        delegate_list.splice(i, 1);
                        break;
                    }
                }
                connection.query(format(`DELETE FROM attendance WHERE id = %L`, attendance_id), function(error, result, fields) {
                    if (error) {
                        _global.sendError(res, null, 'error at delete attendances');
                        done();
                        return console.log(error.message + ' at delete attendances');
                    } else {
                        res.send({ result: 'success' });
                        done();
                    }
                });
            }
        });
    });
});

router.post('/close', function(req, res, next) {
    if (req.body.attendance_id == null || req.body.attendance_id == 0) {
        _global.sendError(res, null, "attendance_id is required");
        return console.log("attendance_id is required");
    }
    var attendance_id = req.body.attendance_id;
    var course_id = 0;
    var class_id = 0;
    var absence_requests = [];
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        async.series([
            //Start transaction
            function(callback) {
                connection.query('BEGIN', (error) => {
                    if (error) callback(error);
                    else callback();
                });
            },
            //get Info and delete delegate code
            function(callback) {
                connection.query(format(`SELECT course_id , class_id FROM attendance WHERE id = %L`, attendance_id), function(error, result, fields) {
                    if (error) {
                        callback(error + ' at get attendances info');
                    } else {
                        course_id = result.rows[0].course_id;
                        class_id = result.rows[0].class_id;
                        for (var i = 0; i < delegate_list.length; i++) {
                            if (delegate_list[i]['course_id'] == course_id && delegate_list[i]['class_id'] == class_id) {
                                delegate_list.splice(i, 1);
                                break;
                            }
                        }
                        callback();

                    }
                });
            },
            //close attendance
            function(callback) {
                connection.query(format(`UPDATE attendance SET closed = TRUE WHERE id = %L`, attendance_id), function(error, result, fields) {
                    if (error) {
                        callback(error + ' at close attendances');
                    } else {
                        callback();
                    }
                });
            },
            //get student who is absent
            function(callback) {
                connection.query(format(`SELECT users.*, courses.code as course_code, courses.name as course_name, attendance.course_id, attendance.class_id 
                    FROM courses,attendance,attendance_detail, users , student_enroll_course, class_has_course
                    WHERE attendance_id = %L AND attendance_type = %L AND users.id = attendance_detail.student_id AND attendance.id = attendance_id AND
                    courses.id = attendance.course_id AND class_has_course.course_id = courses.id AND
                    student_enroll_course.student_id = users.id AND
                    student_enroll_course.class_has_course_id = class_has_course.id AND 
                    student_enroll_course.attendance_status = %L`, attendance_id, _global.attendance_type.absent, _global.attendance_status.normal), function(error, result, fields) {
                    if (error) {
                        callback(error + ' at get absent students');
                    } else {
                        absent_students = result.rows.slice();
                        callback();
                    }
                });
            },
            //check accepted absence request for student
            function(callback) {
                async.each(absent_students, function(student, callback) {
                    var accepted_requests = [];
                    var check_permited = false;
                    async.series([
                        //Find accepted absent request
                        function(callback) {
                             connection.query(format(`SELECT * FROM absence_requests
                                WHERE student_id = %L AND status = %L`, student.id, _global.absence_request_status.accepted), function(error, result, fields) {
                                if (error) {
                                    callback(error + ' at get accepted absent request');
                                } else {
                                    accepted_requests = result.rows;
                                    callback();
                                }
                            });
                        },
                        //Check if this attendance session is absent permited
                        function(callback) {
                            if(accepted_requests.length == 0){
                                check_permited = false;
                                student['skip_send_email'] = false;
                                callback();
                            }
                            else{
                                var where = format('(( attendance.created_at >= %L AND attendance.created_at < %L )',accepted_requests[0].start_date,accepted_requests[0].end_date);
                                for(var i = 1 ; i < accepted_requests.length; i++){
                                    where += format(' OR ( attendance.created_at >= %L AND attendance.created_at < %L )',accepted_requests[i].start_date,accepted_requests[i].end_date);
                                }
                                where += ')';
                                connection.query(format(`SELECT * FROM attendance,attendance_detail
                                    WHERE attendance.id = attendance_detail.attendance_id AND
                                        attendance_detail.student_id = %L AND
                                        attendance.closed = TRUE AND
                                        attendance.id = %L AND ` + where, student.id, attendance_id), function(error, result, fields) {
                                    if (error) {
                                        callback(error + ' at check permited_student');
                                    } else {
                                        check_permited = true;
                                        student['skip_send_email'] = true;
                                        callback();
                                    }
                                });
                            }
                        },
                        //Update attendance detail
                        function(callback) {
                            if(check_permited){
                                connection.query(format(`UPDATE attendance_detail SET attendance_type =  %L
                                    WHERE attendance_id = %L AND student_id = %L`, _global.attendance_type.permited_absent, attendance_id, student.id), function(error, result, fields) {
                                    if (error) {
                                        callback(error + ' at update attendance for permited student');
                                    } else {
                                        callback();
                                    }
                                });
                            }else{
                                callback();
                            }
                        }
                    ], function(error) {
                        if (error) callback(error);
                        else callback();
                    });
                }, function(error) {
                    if (error) callback(error + ' at check accepted absence request');
                    else callback();
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
                _global.sendError(res,null, error);
                connection.query('ROLLBACK', (error) => {
                    if (error) return console.log(error);
                });
                done();
                return console.log(error);
            } else {
                async.each(absent_students, function(student, callback) {
                    //count absences and total attendance
                    if(!student['skip_send_email']){
                        connection.query(format(`SELECT COUNT(*) as count, attendance_type FROM attendance,attendance_detail 
                                    WHERE id = attendance_id AND student_id = %L AND course_id = %L AND class_id = %L 
                                    GROUP BY attendance_type`, student.id, student.course_id, student.class_id), function(error, result, fields) {
                            if (error) {
                                console.log(error.message + ' at insert attendance_details');
                                callback(error);
                            } else {
                                var total = 0;
                                var absence = 0;
                                for (var i = 0; i < result.rowCount; i++) {
                                    if (result.rows[i].attendance_type == _global.attendance_type.absent) absence = result.rows[i].count;
                                    total = Math.floor(total + result.rows[i].count);
                                }
                                _global.sendMail(
                                    '"Giáo vụ"',
                                    student.email,
                                    'Update on your absence from ' + student.course_code + '-' + student.course_name, // Subject line
                                    `Hi ` + student.last_name + `,\r\n\r\n Today, you were absent from the class ` + student.course_code + '-' + student.course_name + `.Currently, your absences/total is ` + absence + `/` + total + ` (` + Math.floor(100 * absence / total) + `%).` + `\r\n\r\nPlease be aware that if you exceed 30% of the total attendance, you won't be able to attend the final exam. Attend more classes to decrease that percentage.\r\n\r\n If you need help, please contact giaovu.clc@fit.hcmus.edu.vn`
                                );
                                callback();
                            }
                        });
                    }else{
                        callback();
                    }
                }, function(error) {
                    if (error) {
                        _global.sendError(res, error.message);
                        done();
                        return console.log(error);
                    } else {
                        console.log('successfully changed request status---------------------------------------');
                        res.send({ result: 'success', message: 'successfully changed request status' });
                        done();
                    }
                });
            }
        });
    });
});

router.post('/check-attendance-list', function(req, res, next) {
    var listOnlyFlag = req.body.islistOnly == null ? 0 : 1;

    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        return console.log("Course_id is required");
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "Class id is required");
        return console.log("Class id is required");
    }
    var course_id = req.body.course_id;
    var class_id = req.body.class_id;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT students.id, students.stud_id as code, CONCAT(users.first_name, ' ', users.last_name) AS name ,avatar, student_enroll_course.attendance_status
            FROM users,student_enroll_course,students,class_has_course 
            WHERE users.id = students.id AND users.id = student_enroll_course.student_id AND student_enroll_course.class_has_course_id = class_has_course.id AND class_has_course.course_id = %L AND class_has_course.class_id = %L`, course_id, class_id), function(error, result, fields) {
            if (error) {
                var message = error.message + ' at get student_list by course';
                _global.sendError(res, message);
                done();
                return console.log(message);
            }
            var student_list = result.rows;
            var check_attendance_list = [];
            async.each(student_list, function(student, callback) {
                var attendance = {
                    id: student.id,
                    code: student.code,
                    name: student.name,
                    exemption: student.attendance_status,
                    avatar: student.avatar,
                    attendance_details: []
                };
                if (listOnlyFlag) {
                    check_attendance_list.push(attendance);
                    callback();
                } else {
                    connection.query(format(`SELECT *, (SELECT CONCAT(users.first_name,' ',users.last_name) FROM users WHERE users.id = edited_by) as editor
                        FROM attendance, attendance_detail 
                        WHERE attendance.id = attendance_detail.attendance_id AND  course_id = %L AND student_id = %L
                        ORDER BY attendance_id`, course_id, student.id), function(error, result, fields) {
                        if (error) {
                            console.log(error.message + ' at get check_attendance_details');
                            callback(error);
                        } else {
                            for (var i = 0; i < result.rowCount; i++) {
                                attendance.attendance_details.push({
                                    attendance_id: result.rows[i].attendance_id,
                                    attendance_time: result.rows[i].attendance_time,
                                    attendance_type: result.rows[i].attendance_type,
                                    created_at: result.rows[i].created_at,
                                    edited_by: result.rows[i].edited_by,
                                    edited_reason: result.rows[i].edited_reason,
                                    editor: result.rows[i].editor,
                                    discussions: result.rows[i].discussions,
                                    answered_questions: result.rows[i].answered_questions,
                                    presentations: result.rows[i].presentations,
                                });
                            }
                            check_attendance_list.push(attendance);
                            callback();
                        }
                    });
                }
            }, function(error) {
                if (error) {
                    _global.sendError(res, error.message);
                    done();
                    return console.log(error);
                } else {
                    console.log('loaded check_attendance_list');
                    res.send({
                        result: 'success',
                        length: check_attendance_list.length,
                        check_attendance_list: check_attendance_list
                    });
                    done();
                }
            });
        });

    });
});

//Mobile
router.post('/check-attendance', function(req, res, next) {
    if (req.body.attendance_id == null || req.body.attendance_id == 0) {
        _global.sendError(res, null, "attendance_id is required");
        return console.log("attendance_id is required");
    }

    var attendance_id = req.body.attendance_id;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        if (error) {
            var message = error.message + ' at get student_list by course';
            _global.sendError(res, message);
            done();
            return console.log(message);
        }

        var class_has_course_id = 0;
        connection.query(format(`SELECT class_has_course.id 
            FROM class_has_course, attendance
            WHERE attendance.class_id = class_has_course.class_id
            AND attendance.course_id = class_has_course.course_id
            AND attendance.id = %L`, attendance_id), function(error, result, fields) {

            if (error) {
                var message = error.message + ' at get class_has_course_id';
                _global.sendError(res, message);
                done();
                return console.log(message);
            }

            class_has_course_id = result.rows[0].id;

            connection.query(format(`SELECT students.id as id, students.stud_id as code, CONCAT(users.first_name, ' ', users.last_name) AS name, attendance_detail.*, attendance_detail.attendance_type as status, users.avatar as avatar 
            FROM users, attendance_detail, students, student_enroll_course 
            WHERE users.id = students.id
            AND attendance_detail.student_id = students.id
            AND student_enroll_course.class_has_course_id = %L
            AND students.id = student_enroll_course.student_id
            AND attendance_detail.attendance_id = %L
            AND student_enroll_course.attendance_status = %L`, class_has_course_id, attendance_id, _global.attendance_status.normal), function(error, result, fields) {

                if (error) {
                    var message = error.message + ' at get student_list by course';
                    _global.sendError(res, message);
                    done();
                    return console.log(message);
                }

                console.log('loaded check_attendance_list');

                res.send({
                    result: 'success',
                    length: result.rowCount,
                    check_attendance_list: result.rows
                });

                done();
            });
        });
    });
});

//Mobile
router.post('/update-attendance', function(req, res, next) {
    if (req.body.attendance_id == null || req.body.attendance_id == 0) {
        _global.sendError(res, null, "attendance_id is required");
        return console.log("attendance_id is required");
    }

    var attendance_id = req.body.attendance_id;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        if (error) {
            var message = error.message + ' at get attendance data by course';
            _global.sendError(res, message);
            done();
            return console.log(message);
        }

        var attendance_detail = req.body.data;

        async.each(attendance_detail, function(detail, callback) {
            connection.query(format(`UPDATE attendance_detail
                SET attendance_type = %L, attendance_time = %L
                WHERE student_id = %L AND attendance_id = %L`, detail.status, new Date(),
                detail.student_id, attendance_id), function(error, result, fields) {
                if (error) {
                    console.log(error.message + ' at get attendance_details');
                    callback(error);
                } else {
                    callback();
                }
            });
        }, function(error) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            } else {
                res.send({ result: "success" });
                done();
            }
        });
    });
});

//Mobile - FAILLLLLLLLLLLLLLLLLLL
router.post('/update-attendance-offline', function(req, res, next) {
    if (req.body.data == null || req.body.data.length == 0) {
        _global.sendError(res, null, "attendance detail is required");
        return console.log("attendance detail is required");
    }
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "course id is required");
        return console.log("course id is required");
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "class id is required");
        return console.log("class id is required");
    }

    var attendance_id = 0;
    var attendance_detail = req.body.data;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        var new_attendance = [
            [
                course_id,
                class_id,
                req.decoded.id,
            ]
        ];
        connection.query(format(`INSERT INTO attendance (course_id,class_id,created_by) VALUES %L RETURNING id`, new_attendance), function(error, result, fields) {
            if (error) {
                _global.sendError(res, null, "error at insert new attendance");
                done();
                return console.log(error.message + ' at insert new attendance');
            } else {
                attendance_id = result.rows[0].id;
                var new_attendance_details = [];
                for (var i = 0; i < attendance_detail.length; i++) {
                    new_attendance_details.push([
                        attendance_id,
                        attendance_detail[i].student_id,
                        attendance_detail[i].status,
                        attendance_detail[i].time
                    ]);
                }
                connection.query(format(`INSERT INTO attendance_detail (attendance_id,student_id,attendance_type,attendance_time) VALUES ?`, new_attendance_details), function(error, result, fields) {
                    if (error) {
                        _global.sendError(res, null, "error at insert new attendance_details");
                        done();
                        return console.log(error.message + ' at insert new attendance_details');
                    } else {
                        res.send({ result: "success" });
                        done();
                    }
                });
            }
        });
    });
});

//Student progression
router.post('/list-by-student/', function(req, res, next) {
    if (req.body.student_id == null) {
        _global.sendError(res, null, "student_id is required");
        return console.log("student_id is required");
    }
    var student_id = req.body.student_id;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT courses.code, courses.name , courses.id , class_has_course.attendance_count, class_has_course.class_id , student_enroll_course.attendance_status
                FROM users,student_enroll_course,class_has_course ,courses 
                WHERE users.id = %L AND users.id = student_enroll_course.student_id AND student_enroll_course.class_has_course_id = class_has_course.id 
                    AND class_has_course.course_id = courses.id AND courses.semester_id = (SELECT MAX(id) FROM semesters)`, student_id), function(error, result, fields) {
            if (error) {
                var message = error.message + ' at get enrolling courses by student';
                _global.sendError(res, message);
                done();
                return console.log(message);
            }
            var course_list = result.rows;
            var attendance_list_by_student = [];
            async.each(course_list, function(course, callback) {
                var attendance = {
                    id: course.id,
                    code: course.code,
                    name: course.name,
                    class_id: course.class_id,
                    exemption : course.attendance_status,
                    attendance_count: course.attendance_count,
                    attendance_details: []
                };
                if(course.attendance_status == _global.attendance_status.exemption){
                    attendance_list_by_student.push(attendance);
                    callback();
                }else{
                    connection.query(format(`SELECT id , closed
                        FROM attendance
                        WHERE attendance.class_id = %L AND attendance.course_id = %L
                        ORDER BY id DESC`, course.class_id, course.id), function(error, result, fields) {
                        if (error) {
                            console.log(error.message + ' at get attendance status by course-student');
                            callback(error);
                        } else {
                            if(result.rowCount > 0){
                                attendance['current_attendance_status'] = result.rows[0].closed;
                            }
                            connection.query(format(`SELECT attendance_detail.attendance_id, attendance_time, attendance_type ,created_at, edited_by, edited_reason, 
                                    (SELECT CONCAT(users.first_name,' ',users.last_name) FROM users WHERE users.id = edited_by) as editor
                                FROM attendance, attendance_detail 
                                WHERE attendance.closed = TRUE AND attendance.id = attendance_detail.attendance_id AND course_id = %L AND class_id = %L AND student_id = %L 
                                ORDER BY attendance_id`, course.id, course.class_id, student_id), function(error, result, fields) {
                                if (error) {
                                    console.log(error.message + ' at get attendance_details by student');
                                    callback(error);
                                } else {
                                    for (var i = 0; i < result.rowCount; i++) {
                                        attendance.attendance_details.push({
                                            attendance_id: result.rows[i].attendance_id,
                                            attendance_time: result.rows[i].attendance_time,
                                            attendance_type: result.rows[i].attendance_type,
                                            created_at: result.rows[i].created_at,
                                            edited_by: result.rows[i].edited_by,
                                            edited_reason: result.rows[i].edited_reason,
                                            editor: result.rows[i].editor,
                                        });
                                    }
                                    attendance_list_by_student.push(attendance);
                                    callback();
                                }
                            });
                        }
                    });
                }
            }, function(error) {
                if (error) {
                    _global.sendError(res, error.message);
                    done();
                    return console.log(error);
                } else {
                    console.log('loaded attendance_list_by_student');
                    res.send({
                        result: 'success',
                        total_items: attendance_list_by_student.length,
                        attendance_list_by_student: attendance_list_by_student
                    });
                    done();
                }
            });
        });
    });
});

//Current opening for student
router.post('/opening-for-student/', function(req, res, next) {
    if (req.body.student_id == null) {
        _global.sendError(res, null, "student_id is required");
        return console.log("student_id is required");
    }
    var student_id = req.body.student_id;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT courses.code, courses.name , courses.id , class_has_course.class_id, student_enroll_course.attendance_status as exemption , attendance_detail.attendance_type
            FROM student_enroll_course,class_has_course ,courses , attendance, attendance_detail
            WHERE student_enroll_course.class_has_course_id = class_has_course.id 
            AND class_has_course.course_id = courses.id AND courses.semester_id = (SELECT MAX(id) FROM semesters)
            AND attendance.closed = FALSE 
            AND attendance.id = attendance_detail.attendance_id 
            AND attendance.course_id = class_has_course.course_id 
            AND attendance.class_id = class_has_course.class_id
            AND attendance_detail.student_id = student_enroll_course.student_id
            AND student_enroll_course.student_id = %L`, student_id), function(error, result, fields) {
            if (error) {
                var message = error.message + ' at get enrolling courses by student';
                _global.sendError(res, message);
                done();
                return console.log(message);
            }
            var course_list = result.rows;
            console.log('loaded opening_attendance_for_student');
            res.send({
                result: 'success',
                opening_attendance_for_student: course_list
            });
            done();
        });
    });
});

//Student request to be check
router.post('/request_to_be_check_attendance/', function(req, res, next) {
    if (req.body.student_id == null) {
        _global.sendError(res, null, "student_id is required");
        return console.log("student_id is required");
    }
    if (req.body.course_id == null) {
        _global.sendError(res, null, "course_id is required");
        return console.log("course_id is required");
    }
    var student_id = req.body.student_id;
    var course_id = req.body.course_id;

    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT users.id , courses.code as course_code, courses.name as course_name 
            FROM users , teacher_teach_course , courses
            WHERE users.id = teacher_teach_course.teacher_id
            AND courses.id = teacher_teach_course.course_id
            AND teacher_teach_course.teacher_role = %L
            AND teacher_teach_course.course_id = %L`, _global.lecturer_role, course_id), function(error, result, fields) {
            if (error) {
                var message = error.message + ' at get teachers';
                _global.sendError(res, message);
                done();
                return console.log(message);
            }
            async.each(result.rows, function(teacher, callback) {
                connection.query(format(`INSERT INTO notifications (to_id,from_id,message,object_id,type) VALUES %L`, [[
                        teacher.id,
                        student_id,
                        'requested to be check attendance for course ' + teacher.course_code + ' - ' + teacher.course_name,
                        student_id,
                        _global.notification_type.request_to_be_check_attendance
                    ]]), function(error, result, fields) {
                    if (error) {
                        callback(error.message);
                    }
                    var socket = req.app.get('socket');
                    socket.emit('notificationPushed', {'to_id': teacher.id});
                    callback();
                });
            }, function(error) {
                if (error) {
                    _global.sendError(res, null, error.message);
                    done();
                    return console.log(error);
                } else {
                    console.log('requested');
                    res.send({result: 'success', message : 'Successfully request'});
                    done();
                }
            });
        });
    });
});

router.post('/generate-delegate-code', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        return console.log("Course_id is required");
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "Class id is required");
        return console.log("Class id is required");
    }
    var course_id = req.body.course_id;
    var class_id = req.body.class_id;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        //check attendance is opening or not ?
        connection.query(format(`SELECT * FROM attendance WHERE course_id = %L AND class_id = %L AND closed = FALSE`, course_id, class_id), function(error, result, fields) {
            if (error) {
                _global.sendError(res, null, 'error at check  attendance opening or not');
                done();
                return console.log(error.message + ' at check  attendance opening or not');
            } else {
                if (result.rowCount == 0) {
                    _global.sendError(res, null, 'This course doesnt have any opening attendance');
                    done();
                    return console.log('This course doesnt have any opening attendance');
                } else {
                    var code = randomstring.generate({
                        length: 5,
                        capitalization: 'uppercase',
                        charset: 'numeric'
                    });
                    for (var i = 0; i < delegate_list.length; i++) {
                        if (delegate_list[i]['course_id'] == course_id && delegate_list[i]['class_id'] == class_id) {
                            delegate_list[i]['code'] = code;
                            delegate_list[i]['in_use'] = false;
                            res.send({
                                result: 'success',
                                code: code
                            });
                            done();
                            return;
                        }
                    }
                    delegate_list.push({
                        code: code,
                        course_id: course_id,
                        class_id: class_id,
                        attendance_id: result.rows[0].id,
                        in_use: false,
                        created_by: req.decoded.id,
                    });
                    res.send({
                        result: 'success',
                        code: code
                    });
                }
                done();
            }
        });
    });
});

router.post('/check-delegate-code', function(req, res, next) {
    if (req.body.code == null || req.body.code == '') {
        _global.sendError(res, null, "Delegate code is required");
        return console.log("Delegate code is required");
    }
    var code = req.body.code;
    for (var i = 0; i < delegate_list.length; i++) {
        if (delegate_list[i]['code'] == code) {
            // if (delegate_list[i]['in_use'] == true) {
            //     _global.sendError(res, null, 'This code is being used!');
            //     console.log('This code is being used!');
            //     return;
            // } else {
            //     delegate_list[i]['in_use'] = true;
            //     res.send({
            //         result: 'success',
            //         delegate_detail: delegate_list[i]
            //     });
            //     return;
            // }
            res.send({
                result: 'success',
                delegate_detail: delegate_list[i]
            });
            return;
        }
    }
    _global.sendError(res, null, 'Invalid code! It might have been expired or the attendance is already closed');
    console.log('Invalid code! It might have been expired or the attendance is already closed');
});

router.post('/opening-for-student', function(req, res, next) {
    var student_id = req.decoded.id;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        if (error) {
            var message = error.message + ' at get attendance data for student';
            _global.sendError(res, message);
            done();
            return console.log(message);
        }

        query = `SELECT class_has_course.id as class_has_course_id, attendance.id as attendance_id
            FROM qldd.attendance, class_has_course, student_enroll_course as sec
            WHERE attendance.closed = FALSE AND
            class_has_course.class_id = attendance.class_id 
            AND class_has_course.course_id = attendance.course_id
            AND sec.class_has_course_id = class_has_course.id
            AND sec.student_id = %L`;

        connection.query(format(query, student_id), function(error, result, fields) {
            if (error) {
                _global.sendError(res, null, 'error at get opening attendances');
                done();
                return console.log(error.message + ' at get opening attendances');
            } else {
                res.send({
                    result: 'success',
                    length: result.rowCount,
                    opening_attendances: result.rows
                });
                done();
            }
        });
    });
});

//Teacher update student's interaction
router.post('/update-interaction', function(req, res, next) {
    if (req.body.id == undefined || req.body.id == 0) {
        _global.sendError(res, null, "Student id is required");
        return;
    }
    if (req.body.attendance_id == undefined || req.body.attendance_id == 0) {
        _global.sendError(res, null, "attendance_id is required");
        return;
    }
    if (req.body.interaction_type == undefined) {
        _global.sendError(res, null, "Interaction type is required");
        return;
    }
    var student_id = req.body.id;
    var attendance_id = req.body.attendance_id;
    var interaction_type = req.body.interaction_type;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }
        async.series([
            //Start transaction
            function(callback) {
                connection.query('BEGIN', (error) => {
                    if(error) callback(error);
                    else callback();
                });
            },
            //update user interaction
            function(callback) {
                var query = 'UPDATE attendance_detail ';
                switch(interaction_type){
                    case _global.student_interaction_type.answer_question:
                        query += 'SET answered_questions = answered_questions + 1 ';
                    break;
                    case _global.student_interaction_type.discuss:
                        query += 'SET discussions = discussions + 1 ';
                    break;
                    case _global.student_interaction_type.present:
                        query += 'SET presentations = presentations + 1 ';
                    break;
                }
                query += 'WHERE attendance_id = %L AND student_id = %L ';
                connection.query(format(query, attendance_id, student_id), function(error, result, fields) {
                    if (error) {
                        console.log(error.message + ' at Update Student interaction');
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
                _global.sendError(res, error.message);
                connection.query('ROLLBACK', (error) => {
                    if (error) return console.log(error);
                });
                done(error);
                return console.log(error);
            } else {
                console.log('success updating student interaction!---------------------------------------');
                res.send({ result: 'success', message: 'Student Interaction Updated Successfully' });
                done();
            }
        });
    });
});
module.exports = router;
