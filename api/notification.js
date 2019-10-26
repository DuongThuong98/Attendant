var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var async = require("async");
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);
var connection = mysql.createConnection(_global.db);
var pool = mysql.createPool(_global.db);
var bcrypt = require('bcrypt');

router.post('/list', function(req, res, next) {
    var user_id = req.body.user_id != null ? req.body.user_id : 0;
    var user_role = req.body.user_role != null ? req.body.user_role : 0;
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

            notifications = result.rows;
            for(var i = 0 ; i < notifications.length; i++){
                if(notifications[i].to == null){
                    notifications[i].to = 'Giáo vụ';
                }
                if(notifications[i].from == null){
                    notifications[i].from = ' You have';
                }
            }
            res.send({
                result: 'success',
                notifications: notifications
            });
            done();
        };
        if(user_role == _global.role.staff){
            connection.query(format(`SELECT *,
                        (SELECT CONCAT(first_name,' ',last_name) FROM users WHERE users.id = notifications.to_id) as to,
                        (SELECT CONCAT(first_name,' ',last_name) FROM users WHERE users.id = notifications.from_id) as from  
                        FROM notifications WHERE to_id IS NULL
                        ORDER BY notifications.id`), return_function);
        }else{
            connection.query(format(`SELECT *,
                        (SELECT CONCAT(first_name,' ',last_name) FROM users WHERE users.id = notifications.to_id) as to,
                        (SELECT CONCAT(first_name,' ',last_name) FROM users WHERE users.id = notifications.from_id) as from  
                        FROM notifications WHERE to_id = %L
                        ORDER BY notifications.id`,user_id), return_function);    
        }
    });
});

router.post('/read', function(req, res, next) {
    var id = req.body.id != null ? req.body.id : 0;
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
            });
            done();
        };
        connection.query(format(`DELETE FROM notifications WHERE id = %L`,id), return_function);
    });
});

module.exports = router;