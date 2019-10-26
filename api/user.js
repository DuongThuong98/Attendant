var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var connection = mysql.createConnection(_global.db);
var pool = mysql.createPool(_global.db);
var bcrypt = require('bcrypt');
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);

router.post('/detail', function(req, res, next) {
    if (req.body.id != null) {
        user_id = req.body.id;
    } else {
        _global.sendError(res, "Missing user id", "Require user\'s ID");
        return;
    }

    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }

        connection.query(format(`SELECT id,last_name,first_name,email,phone,role_id as role FROM users WHERE id= %L LIMIT 1`, user_id),
            function(error, result, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    done();
                    return console.log(error);
                }

                //check user exist
                if (result.rowCount == 0) {
                    _global.sendError(res, 'User\'s ID not exist');
                    done();
                    return console.log('User\'s ID not exist');
                }

                var user = result.rows[0];
                res.send({ result: 'success', user: user });
                done();
            });
    });
});


router.post('/change-password', function(req, res, next) {
    if (req.body.current_password == null || req.body.current_password == '') {
        _global.sendError(res, null, "current_password is  required");
        return;
    }
    if (req.body.new_password == null || req.body.new_password == '') {
        _global.sendError(res, null, "new_password is required");
        return;
    }
    if (req.body.confirm_password == null || req.body.confirm_password == '') {
        _global.sendError(res, null, "confirm_password is required");
        return;
    }
    if (req.body.confirm_password != req.body.new_password) {
        _global.sendError(res, null, "confirm_password and new_password must be the same");
        return;
    }
    var user_id = req.decoded.id;
    var current_password = req.body.current_password;
    var new_password = req.body.new_password;
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }

        connection.query(format(`SELECT password FROM users WHERE id= %L LIMIT 1`, user_id), function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }

            var password_hash = result.rows[0].password;
            if (bcrypt.compareSync(current_password, password_hash)) {
                var params = [bcrypt.hashSync(new_password, 10), user_id];
                //update password
                connection.query(format('UPDATE users SET password = %L WHERE id = %L', params[0], params[1]), function(error, result, fields) {
                    if (error) {
                        res.send({ result: 'failure', message: 'Password Updated Failed' });
                        done();
                        return console.log(error);
                    }
                    res.send({ result: 'success', message: 'Password Updated Successfully' });
                    done();
                });
            } else {
                _global.sendError(res, null, "Wrong current password");
                done();
                return console.log("Wrong current password");
            }
        });
    });
});

module.exports = router;
