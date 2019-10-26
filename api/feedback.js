var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var connection = mysql.createConnection(_global.db);
var pool = mysql.createPool(_global.db);
var async = require("async");
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);

router.post('/list', function(req, res, next) {
    var category = req.body.category ? req.body.category : 0;
    var status = req.body.status ? req.body.status : 0;
    var role_id = req.body.role_id ? req.body.role_id : 0;
    var search_text = req.body.search_text ? req.body.search_text : '';
    var page = req.body.page != null ? req.body.page : _global.default_page;
    var limit = req.body.limit != null ? req.body.limit : _global.detail_limit;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        var query = format(`SELECT id, title, content, replied, feedbacks.read, created_at , 
            (SELECT CONCAT(users.first_name,' ',users.last_name,E'\r\n',users.email) FROM users WHERE users.id = feedbacks.from_id) as _from, 
            (SELECT CONCAT(first_name,' ',last_name) FROM users WHERE users.id = feedbacks.to_id) as _to 
            FROM feedbacks WHERE to_id IS NULL AND replied = %L`, status);
        if(role_id != 0){
            query += ' AND type = ' + role_id;
        }
        if(category != 0){
            query += ' AND category = ' + category;
        }
        query += ' ORDER BY feedbacks.read , feedbacks.created_at';
        connection.query(query,function(error, result, fields) {
            if (error) {
                _global.sendError(res,null,error);
                done();
                return console.log(error);
            }
            var feedbacks = result.rows;
            for(var i = 0 ; i < feedbacks.length; i++){
                if(feedbacks[i]._to == null){
                    feedbacks[i]._to = 'Giáo vụ';
                }
                if(feedbacks[i]._from == null){
                    feedbacks[i]._from = 'Anonymous';
                }
            }
            var search_list = [];
            if (search_text == null) {
                search_list = feedbacks;
            } else {
                for (var i = 0; i < feedbacks.length; i++) {
                    if (feedbacks[i]._from.toLowerCase().indexOf(search_text.toLowerCase()) != -1 ||
                        feedbacks[i]._to.toLowerCase().indexOf(search_text.toLowerCase()) != -1 ||
                        feedbacks[i].title.toLowerCase().indexOf(search_text.toLowerCase()) != -1) {
                        search_list.push(feedbacks[i]);
                    }
                }
            }
            if (limit != -1) {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    feedbacks: _global.filterListByPage(page, limit, search_list)
                });
            } else {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    feedbacks: search_list
                });
            }
            done();
        });
    });
});

router.put('/read', function(req, res, next) {
    if (req.body.feedback_id == undefined || req.body.feedback_id == 0) {
        _global.sendError(res, null, "feedback id is required");
        return;
    }
    var feedback_id = req.body.feedback_id;
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res,null,error);
            done();
                return console.log(error);
        }
        connection.query(format(`UPDATE feedbacks SET read = TRUE WHERE id = %L`,feedback_id),function(error, result, fields) {
            if (error) {
                _global.sendError(res,null,error);
                done();
                return console.log(error);
            }
            res.send({ result: 'success'});
            done();
        });
    });
});

router.post('/send', function(req, res, next) {
    if (req.body.to_id == undefined) {
        _global.sendError(res, null, "Receiver is required");
        return;
    }
    if (req.body.category == undefined || req.body.category == 0) {
        _global.sendError(res, null, "Category is required");
        return;
    }
    if (req.body.title == undefined || req.body.title == '') {
        _global.sendError(res, null, "title is required");
        return;
    }
    if (req.body.content == undefined || req.body.content == '') {
        _global.sendError(res, null, "content is required");
        return;
    }
    var from_id = (req.body.isAnonymous ? null : req.decoded.id);
    var to_id = (req.body.to_id != 0 ? req.body.to_id : null);
    var feedback = [[
        to_id,
        req.body.title,
        req.body.content,
        req.body.category,
        from_id,
        (req.body.isAnonymous ? 3 : (req.decoded.role_id == _global.role.student ? 1 : 2)),
    ]];
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res,null,error.message);
            done();
            return console.log(error);
        }
        connection.query(format(`INSERT INTO feedbacks (to_id,title,content,category,from_id,type) VALUES %L RETURNING id`,feedback),function(error, result, fields) {
            if (error) {
                _global.sendError(res,null,error.message);
                done();
                return console.log(error);
            }
            if(from_id){
                connection.query(format(`INSERT INTO notifications (to_id,message,object_id,type) VALUES %L RETURNING id`, [[
                        to_id,
                        'a new feedback',
                        result.rows[0].id,
                        _global.notification_type.send_feedback
                    ]]), function(error, result, fields) {
                    if (error) {
                        _global.sendError(res,null,error.message);
                        done();
                        return console.log(error);
                    }
                    var socket = req.app.get('socket');
                    socket.emit('notificationPushed', {'to_id':to_id});
                    res.send({ result: 'success', message: 'Feedback sent successfully'});
                    done();
                });
            }else{
                connection.query(format(`INSERT INTO notifications (to_id,from_id,message,object_id,type) VALUES %L RETURNING id`, [[
                        to_id,
                        req.decoded.id,
                        'a new feedback',
                        result.rows[0].id,
                        _global.notification_type.send_feedback
                    ]]), function(error, result, fields) {
                    if (error) {
                        _global.sendError(res,null,error.message);
                        done();
                        return console.log(error);
                    }
                    var socket = req.app.get('socket');
                    socket.emit('notificationPushed', {'to_id':to_id});
                    res.send({ result: 'success', message: 'Feedback sent successfully'});
                    done();
                });
            }
        });
    });
});

router.post('/history', function(req, res, next) {
    var user_id = req.decoded.id;
    var from_to = req.body.from_to;
    var search_text = req.body.search_text ? req.body.search_text : '';
    var page = req.body.page != null ? req.body.page : _global.default_page;
    var limit = req.body.limit != null ? req.body.limit : _global.detail_limit;
    var status = req.body.status ? req.body.status : 0;
    var category = req.body.category ? req.body.category : 0;

    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res,null,error);
            done();
            return console.log(error);
        }

        var query = '';
        if(from_to == 0){
            query = `SELECT * , (SELECT CONCAT(first_name,' ',last_name) FROM users WHERE users.id = feedbacks.to_id) as _to  FROM feedbacks
        WHERE from_id = %L AND replied = %L `;
        }else{
            query = `SELECT *, (SELECT CONCAT(users.first_name,' ',users.last_name,E'\r\n',users.email) FROM users WHERE users.id = feedbacks.from_id) as from FROM feedbacks 
        WHERE to_id = %L AND replied = %L `;
        }
        if(category != 0){
            query += ' AND category = ' + category ;
        }
        query += ` ORDER BY feedbacks.read, feedbacks.created_at DESC`;
        connection.query(format(query,user_id,status), function(error, result, fields) {
            if (error) {
                _global.sendError(res, null, error);
                done();
                return console.log(error);
            }

            var feedbacks = result.rows;
            for(var i = 0 ; i < feedbacks.length; i++){
                if(feedbacks[i]._to == null){
                    feedbacks[i]._to = 'Giáo vụ';
                }
            }
            var search_list = [];
            if (search_text == null) {
                search_list = feedbacks;
            } else {
                for (var i = 0; i < feedbacks.length; i++) {
                    if (feedbacks[i].title.toLowerCase().indexOf(search_text.toLowerCase()) != -1) {
                        search_list.push(feedbacks[i]);
                    }
                }
            }
            if (limit != -1) {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    feedbacks: _global.filterListByPage(page, limit, search_list)
                });
            } else {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    feedbacks: search_list
                });
            }
            done();
        });
    });
});

router.post('/send-reply', function(req, res, next) {
    // if (req.body.content == undefined || req.body.content == '') {
    //     _global.sendError(res, null, "reply_content is required");
    //     return;
    // }
    
    if (req.body.id == undefined || req.body.id == '') {
        _global.sendError(res, null, "feedback_id is required");
        return;
    }

    var reply_content = req.body.content;
    var feedback_id = req.body.id;    

    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res,null,error);
            done();
                return console.log(error);
        }

        var query = `SELECT id, title, content, from_id, 
            (SELECT users.email FROM users WHERE users.id = feedbacks.from_id) as _from,  
            (SELECT users.last_name FROM users WHERE users.id = feedbacks.from_id) as _last_name  
            FROM feedbacks
            WHERE id = %L`;
        connection.query(format(query, feedback_id),function(error, result, fields) {
            if (error) {
                _global.sendError(res,null,error);
                done();
                return console.log(error);
            }

            var student_email = result.rows[0]._from;
            var title = result.rows[0].title;
            var last_name = result.rows[0]._last_name;
            var reply_to = result.rows[0].from_id;
            connection.query(format('UPDATE feedbacks SET replied = TRUE WHERE id = %L', feedback_id), function(error, result, fields) {
                if (error) {
                    res.send({ result: 'failure', message: 'Reply Failed' });
                    done();
                    return console.log(error);
                }
                var token = jwt.sign({ email: student_email}, _global.jwt_secret_key, { expiresIn: _global.jwt_register_expire_time });
                var link = _global.host + '/register;token=' + token;
                _global.sendMail(
                    '"Giáo vụ"',
                    student_email,
                    'Reply your feedback ' + title,
                    `Hi ` + last_name +`,\r\n\r\nTo your feedback:\r\n` + reply_content + `\r\n Reply by ` + req.decoded.first_name + ` ` + req.decoded.last_name + `.\r\n\r\nIf you need help, please contact giaovu@fit.hcmus.edu.vn`
                );

                //  Missing a query to insert a reply into student feedback section similar like below:
                // connection.query(format(`INSERT INTO feedbacks (to_id,title,content,category,from_id,type) VALUES %L RETURNING id`,feedback),function(error, result, fields) {
                //     if (error) {
                //         _global.sendError(res,null,error.message);
                //         done();
                //         return console.log(error);
                //     }

                connection.query(format(`INSERT INTO notifications (to_id,from_id,message,object_id,type) VALUES %L RETURNING id`, [[
                        reply_to,
                        req.decoded.id,
                        ' accepted your feedback. Thanks for your feedback, we will contact you through email for further support',
                        feedback_id,
                        _global.notification_type.reply_feedback
                    ]]), function(error, result, fields) {
                        if (error) {
                            res.send({ result: 'failure', message: 'Reply Failed' });
                            done();
                        } else {
                            var socket = req.app.get('socket');
                            socket.emit('notificationPushed', {'to_id':reply_to});
                            res.send({ result: 'success', message: 'Replied Feedback Successfully' });
                            done();
                        }
                    });
                
            });
        });
    });
});

router.post('/delete', function(req, res, next) {
    if (req.body.id == undefined || req.body.id == 0) {
        _global.sendError(res, null, "Feedback id is required");
        return;
    }
    var feedback_id = req.body.id;
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res,null,error);
            done();
                return console.log(error);
        }
        connection.query(format(`SELECT * FROM feedbacks WHERE id = %L AND from_id = %L`,feedback_id,req.decoded.id),function(error, result, fields) {
            if (error) {
                _global.sendError(res,null,error);
                done();
                return console.log(error);
            }
            if(result.rowCount == 0){
                _global.sendError(res,null,'Feedback not existed or not belong to you');
                done();
                return console.log('Feedback not existed or not belong to you');
            }else{
                connection.query(format(`DELETE FROM feedbacks WHERE id = %L`, feedback_id), function(error, result, fields) {
                    if (error) {
                        _global.sendError(res,null,error);
                        done();
                        return console.log(error);
                    }
                    res.send({ result: 'success', message: 'Feedback deleted successfully'});
                    done();
                });
            }
        });
    });
});
module.exports = router;
