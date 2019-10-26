var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var async = require("async");
var pg = require('pg');
var jwt = require('jsonwebtoken');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);
var connection = mysql.createConnection(_global.db);
var pool = mysql.createPool(_global.db);
var bcrypt = require('bcrypt');

router.post('/list', function(req, res, next) {
    var searchText = req.body.searchText;
    var page = req.body.page != null ? req.body.page : _global.default_page;
    var limit = req.body.limit != null ? req.body.limit : _global.detail_limit;
    var sort = req.body.sort != null ? req.body.sort : 'none';

    var program_id = req.body.program_id != null ? req.body.program_id : 1;
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

            class_list = result.rows;
            var search_list = [];
            if (searchText == null) {
                search_list = class_list;
            } else {
                for (var i = 0; i < class_list.length; i++) {
                    if (class_list[i].name.toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
                        search_list.push(class_list[i]);
                    }
                }
            }
            if (sort != 'none') {
                _global.sortListByKey(sort, search_list, 'name');
            }
            if (limit != -1) {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    classes: _global.filterListByPage(page, limit, search_list)
                });
            } else {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    classes: search_list
                });
            }
            done();
        };
        connection.query(format(`SELECT *, (SELECT COUNT(id) FROM students WHERE class_id = classes.id) as total_stud
						FROM classes WHERE program_id = %L
						ORDER BY classes.id`,program_id), return_function);
    });
});

router.post('/create', function(req, res, next) {
    if (req.body.name == undefined || req.body.name == '') {
        _global.sendError(res, null, "Name is required");
        return;
    }
    if (req.body.email == undefined || req.body.email == 0) {
        _global.sendError(res, null, "Email is required");
        return;
    }
    if (req.body.email.indexOf('@') == -1) {
        _global.sendError(res, null, "Invalid Email");
        return;
    }
    var _class = [[
        req.body.name,
        req.body.email,
        req.body.program_id
    ]];
    var student_list = req.body.student_list;
    var new_student_list = [];
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done(error);
            return console.log(error);
        }
        connection.query(format(`SELECT * FROM classes WHERE name = %L`,req.body.name),function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done(error);
                return console.log(error);
            }
            if(result.rowCount > 0){
                _global.sendError(res, null, "Class's existed");
                done(error);
                return console.log("Class's existed");
            }else{
                var class_id = 0;
                async.series([
                    //Start transaction
                    function(callback) {
                        connection.query('BEGIN', (error) => {
                            if(error) callback(error);
                            else callback();
                        });
                    },
                    //Insert class
                    function(callback) {
                        connection.query(format(`INSERT INTO classes (name,email,program_id) VALUES %L RETURNING id`,_class),function(error, result, fields) {
                            if (error) {
                                callback(error);
                            }else{
                                class_id = result.rows[0].id;
                                callback();
                            }
                        });
                    },
                    //Add student from file
                    function(callback) {
                        if(student_list == undefined || student_list == []){
                            callback();
                        }else{
                            async.each(student_list, function(student, callback) {
                                connection.query(format(`SELECT id FROM students WHERE stud_id = %L LIMIT 1`, student.stud_id), function(error, result, fields) {
                                    if (error) {
                                        console.log(error.message + ' at get student_id from datbase (file)');
                                        callback(error);
                                    } else {
                                        if(result.rowCount == 0){
                                            //new student to system
                                            var new_user = [[
                                                _global.getFirstName(student.name),
                                                _global.getLastName(student.name),
                                                student.stud_id + '@student.hcmus.edu.vn',
                                                student.phone,
                                                _global.role.student,
                                                bcrypt.hashSync(student.stud_id.toString(), 10),
                                            ]];
                                            new_student_list.push({
                                                name: _global.getLastName(student.name),
                                                email : student.stud_id + '@student.hcmus.edu.vn'
                                            });
                                            connection.query(format(`INSERT INTO users (first_name,last_name,email,phone,role_id,password) VALUES %L RETURNING id`, new_user), function(error, results, fields) {
                                                if (error) {
                                                    callback(error);
                                                } else {
                                                    var student_id = results.rows[0].id;
                                                    var new_student = [[
                                                        student_id,
                                                        student.stud_id,
                                                        class_id,
                                                    ]];
                                                    connection.query(format(`INSERT INTO students (id,stud_id,class_id) VALUES %L`, new_student), function(error, results, fields) {
                                                        if (error) {
                                                            callback(error);
                                                        } else {
                                                            callback();
                                                        }
                                                    });
                                                }
                                            });
                                        }else{
                                            //old student => ignore
                                            callback();
                                        }
                                    }
                                });
                            }, function(error) {
                                if (error) {
                                    callback(error + ' Error at add student to class from file');
                                }
                                else {
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
                                            callback(error + ' at send mail');
                                        } else {
                                            callback();
                                        }
                                    });
                                }
                            });
                        }
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
                        console.log('success add class!---------------------------------------');
                        res.send({ result: 'success', message: 'Class Added Successfully' });
                        done();
                    }
                });
            }
        });
    });
});

module.exports = router;