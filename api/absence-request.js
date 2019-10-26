var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var async = require("async");
var nodemailer = require('nodemailer');
var pool = mysql.createPool(_global.db);
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);
var fs = require('fs');

router.post('/by-student', function(req, res, next) {
    if (req.body.id == undefined || req.body.id == 0) {
        _global.sendError(res, null, "student Id is required");
        return;
    }
    var id = req.body.id;
    var status = req.body.status ? req.body.status : -1;
    var search_text = req.body.search_text ? req.body.search_text : '';
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        var query = 'SELECT * FROM absence_requests WHERE student_id = ' + id;
        if (status != -1) {
            query += " AND status = " + status;
        }
        connection.query(query, function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            absence_requests = result.rows;
            var search_list = [];
            if (search_text == null) {
                search_list = absence_requests;
            } else {
                for (var i = 0; i < absence_requests.length; i++) {
                    if (absence_requests[i].reason.toLowerCase().indexOf(search_text.toLowerCase()) != -1) {
                        search_list.push(absence_requests[i]);
                    }
                }
            }
            res.send({
                result: 'success',
                total_items: search_list.length,
                absence_requests: search_list
            });
            done();
        });
    });
});

router.put('/change-status', function(req, res, next) {
    if (req.body.id == undefined || req.body.id == 0) {
        _global.sendError(res, null, "Request Id is required");
        return;
    }
    if (req.body.status == undefined) {
        _global.sendError(res, null, "Request status is required");
        return;
    }
    var id = req.body.id;
    var status = req.body.status;
    var absence_request_info ;
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
            //update absence requests
            function(callback) {
                connection.query(format(`UPDATE absence_requests SET status = %L WHERE id = %L`, status, id), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            //get absence requests info
            function(callback) {
                connection.query(format(`SELECT * FROM absence_requests, users 
                    WHERE absence_requests.student_id = users.id AND absence_requests.id = %L LIMIT 1`, id), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        absence_request_info = result.rows[0];
                        callback();
                    }
                });
            },
            //create notification
            function(callback) {
                if(status != _global.absence_request_status.new){
                    var notification_type;
                    var notification_message;
                    if(status == _global.absence_request_status.accepted){
                        notification_type = _global.notification_type.accept_absence_request;
                        notification_message = 'accepted your absence request';
                    }else{
                        notification_type = _global.notification_type.reject_absence_request;
                        notification_message = 'rejected your absence request';
                    }
                    connection.query(format(`INSERT INTO notifications (to_id,from_id,message,object_id,type) VALUES %L RETURNING id`, [[
                        absence_request_info.student_id,
                        req.decoded.id,
                        notification_message,
                        id,
                        notification_type
                    ]]), function(error, result, fields) {
                        if (error) {
                            callback(error);
                        } else {
                            callback();
                        }
                    });
                }
                else{
                    callback();
                }
            },
            //update attendance details if needed
            function(callback) {
                var start_date = absence_request_info.start_date;
                var end_date = absence_request_info.end_date;
                connection.query(format(`SELECT attendance_id FROM attendance, attendance_detail 
                    WHERE attendance.id = attendance_detail.attendance_id AND
                    attendance_detail.student_id = %L AND
                    attendance.closed = TRUE AND
                    attendance.created_at >= %L AND
                    attendance.created_at < %L`, absence_request_info.student_id,start_date,end_date), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        if(result.rowCount != 0){
                            var query_where = ' student_id = ' + absence_request_info.student_id;
                            query_where += ' AND (attendance_id = ' + result.rows[0].attendance_id;
                            for(var i = 1 ; i < result.rowCount; i++){
                                query_where += ' OR attendance_id = ' + result.rows[i].attendance_id;
                            }
                            query_where += ")";
                            connection.query(format(`UPDATE attendance_detail SET attendance_type = %L WHERE` + query_where, _global.attendance_type.permited_absent), function(error, result, fields) {
                                if (error) {
                                    callback(error);
                                } else {
                                    callback();
                                }
                            });
                        }else{
                            callback();
                        }
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
                done();
                return console.log(error);
            } else {
                if(status != _global.absence_request_status.new){
                    var email = absence_request_info.email;
                    var status_text =  status == _global.absence_request_status.accepted ? 'accepted' : 'rejected';
                    _global.sendMail(
                        '"Giáo vụ"',
                        email,
                        'Your absence request has been ' + status_text,
                        `Hi ` + absence_request_info.last_name +`,\r\n\r\nYour absence request:\r\n_Reason: ` + absence_request_info.reason + `\r\n_From : `+ absence_request_info.start_date + ` to `+ absence_request_info.end_date +`\r\n\r\nHas been ` + status_text + ` by ` + req.decoded.first_name + ` ` + req.decoded.last_name + `.\r\n\r\nIf you need help, please contact giaovu.clc@fit.hcmus.edu.vn`
                    );
                }
                console.log('successfully changed request status---------------------------------------');
                res.send({ result: 'success', message: 'successfully changed request status' });
                done();
            }
        });
    });
});

router.post('/list', function(req, res, next) {
    var status = req.body.status ? req.body.status : 0;
    var search_text = req.body.search_text ? req.body.search_text : '';
    var page = req.body.page != null ? req.body.page : _global.default_page;
    var limit = req.body.limit != null ? req.body.limit : _global.detail_limit;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT absence_requests.*,students.stud_id as code, CONCAT(users.first_name,' ', users.last_name) as name 
            FROM absence_requests,students,users 
            WHERE users.id = students.id AND absence_requests.student_id = students.id AND absence_requests.status = %L`, status), function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            absence_requests = result.rows;
            var search_list = [];
            if (search_text == null) {
                search_list = absence_requests;
            } else {
                for (var i = 0; i < absence_requests.length; i++) {
                    if (absence_requests[i].code.toLowerCase().indexOf(search_text.toLowerCase()) != -1 ||
                        absence_requests[i].name.toLowerCase().indexOf(search_text.toLowerCase()) != -1 ||
                        absence_requests[i].reason.toLowerCase().indexOf(search_text.toLowerCase()) != -1) {
                        search_list.push(absence_requests[i]);
                    }
                }
            }
            if (limit != -1) {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    absence_requests: _global.filterListByPage(page, limit, search_list)
                });
            } else {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    absence_requests: search_list
                });
            }
            done();
        });
    });
});

router.post('/create', function(req, res, next) {
    if (req.body.reason == undefined || req.body.reason == '') {
        _global.sendError(res, null, "Reason is required");
        return;
    }
    if (req.body.start_date == undefined || req.body.start_date == 0) {
        _global.sendError(res, null, "Start date is required");
        return;
    }
    if (req.body.end_date == undefined || req.body.end_date == 0) {
        _global.sendError(res, null, "End date is required");
        return;
    }
    var reason = req.body.reason;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var current_user = req.decoded;

    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        var absence_request = [[
            current_user.id,
            reason,
            start_date,
            end_date,
        ]];
        connection.query(format(`INSERT INTO absence_requests (student_id,reason,start_date,end_date) VALUES %L RETURNING id`, absence_request), function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            var request_id = result.rows[0].id;
            connection.query(format(`INSERT INTO notifications (from_id,message,object_id,type) VALUES %L RETURNING id`, [[
                    current_user.id,
                    'sent an absence request',
                    request_id,
                    _global.notification_type.send_absence_request
                ]]), function(error, result, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    done();
                    return console.log(error);
                }
                res.send({
                    result: 'success',
                    message: 'Request sent successfully'
                });
                done();
            });
        });
    });
});

router.post('/cancel', function(req, res, next) {
    if (req.body.id == undefined || req.body.id == '') {
        _global.sendError(res, null, "Request id is required");
        return;
    }
    var id = req.body.id;
    var current_user = req.decoded;

    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT student_id FROM absence_requests WHERE id = %L`, id), function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            if (result.rows[0].student_id != current_user.id) {
                _global.sendError(res, null, 'This request is not your to cancel');
                done();
                return console.log(error);
            } else {
                connection.query(format(`DELETE FROM absence_requests WHERE id = %L`, id), function(error, result, fields) {
                    if (error) {
                        _global.sendError(res, error.message);
                        done();
                        return console.log(error);
                    }
                    connection.query(format(`DELETE FROM notifications WHERE from_id = %L AND object_id = %L`, current_user.id, id), function(error, result, fields) {
                        if (error) {
                            _global.sendError(res, error.message);
                            done();
                            return console.log(error);
                        }
                        res.send({
                            result: 'success',
                            message: 'Request canceled successfully'
                        });
                        done();
                    });
                });
            }
        });
    });
});

module.exports = router;
