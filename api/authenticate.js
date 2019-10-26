var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var pool = mysql.createPool(_global.db);
var async = require('async');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);
//blacklist for token when log out, change password,...
var invalid_token = [];

router.post('/login', function(req, res, next) {
    if (req.body.username == undefined || req.body.username == '') {
        _global.sendError(res, null, 'Username is required');
        return;
    }
    if (req.body.password == undefined || req.body.password == '') {
        _global.sendError(res, null, 'Password is required');
        return;
    }
    var username = req.body.username;
    var password = req.body.password;
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }

        connection.query(format(`SELECT * FROM users WHERE email LIKE %L`, username + '@%'), function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            //check user exist
            if (result.rowCount == 0) {
                _global.sendError(res, null, "Username not found");
                done();
                return console.log("Username is not existed");
            }
            for(var i = 0 ; i < result.rowCount ; i++){
                var password_hash = result.rows[i].password;
                if(password_hash != null && password_hash != ''){
                    if (bcrypt.compareSync(password, password_hash)) {
                        var token = jwt.sign(result.rows[i], _global.jwt_secret_key, { expiresIn: _global.jwt_expire_time });
                        res.send({ result: 'success', token: token, user: result.rows[i] });
                        done();
                        return
                    }
                }
            }
            _global.sendError(res, null, "Wrong password");
            done();
            return console.log("Wrong password");
        });
    });
});

router.post('/logout', function(req, res, next) {
    var token = req.body.token;

    res.send({result : 'success'});
});

router.post('/forgot-password', function(req, res, next) {
    if (req.body.email == undefined || req.body.email == '') {
        _global.sendError(res, null, 'Email is required');
        return;
    }
    var email = req.body.email;
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        } else {
            connection.query(format(`SELECT * FROM users WHERE email = %L LIMIT 1`, email), function(error, result, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    done();
                    return console.log(error);
                }
                //check email exist
                if (result.rowCount == 0) {
                    _global.sendError(res, null, 'Email not found');
                    done();
                    return console.log('Email is not existed');
                }
                if (result.rows[0].password == null || result.rows[0].password == undefined) {
                    _global.sendError(res, null, "Old password not found. Please use the register link in your email to set up your account.");
                    done();
                    return console.log("Old password not found. Please use the register link in your email to set up your account.");
                }
                var token = jwt.sign({ email: email }, _global.jwt_secret_key, { expiresIn: _global.jwt_reset_password_expire_time });
                var link = _global.host + '/forgot-password;token=' + token;
                _global.sendMail(
                    '"Giáo vụ"',
                    email,
                    'Password reset request',
                    'Hi,'+ student.name + '\r\n' + 
                    'Hi,\r\n' + 
                    'A password reset was requested for your account.To confirm this request, and set a new password for your account, please go to the following web address: \r\n\r\n' +
                     link + 
                    '\r\n(This link is valid for 30 minutes from the time this reset was first requested)\r\n' +
                    'If this password reset was not requested by you, no action is needed.\r\n' +
                    'If you need help, please contact the site administrator,\r\n' +
                    'Admin User \r\n\r\n' +
                    'admin@fit.hcmus.edu.vn'
                );
                res.send({ result: 'success' });
                done();
            });
        }
    });
});

router.post('/reset-password-check', function(req, res, next) {
    if (req.body.token == undefined || req.body.token == '') {
        _global.sendError(res, null, 'Token is required');
        return;
    }
    var token = req.body.token;
    if (token) {
        jwt.verify(token, _global.jwt_secret_key, function(error, decoded) {
            if (error) {
                //return res.json(error);
                if (error.name == 'TokenExpiredError') {
                    _global.sendError(res, null, 'The password reset link you used is more than 30 minutes old and has expired. Please initiate a new password reset.');
                    return console.log('The password reset link you used is more than 30 minutes old and has expired. Please initiate a new password reset.');
                }
                _global.sendError(res, null, 'Invalid token');
                return console.log('Invalid token');

            } else {
                res.send({ result: 'success' });
                done();
            }
        });
    }
});

router.post('/reset-password', function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, _global.jwt_secret_key, function(error, decoded) {
            if (error) {
                //return res.json(error);
                if (error.name == 'TokenExpiredError') {
                    return res.status(401).send({
                        success: false,
                        message: error.message
                    });
                }
            } else {
                if (req.body.password == undefined || req.body.password == '') {
                    _global.sendError(res, null, 'Password is required');
                    return;
                }
                if (req.body.confirm_password == undefined || req.body.confirm_password == '') {
                    _global.sendError(res, null, 'Confirm Password is required');
                    return;
                }
                var password = req.body.password;
                var confirm_password = req.body.confirm_password;
                if (password != confirm_password) {
                    _global.sendError(res, null, 'Password and Confirm password must be the same');
                    return;
                }
                var email = decoded.email;
                pool_postgres.connect(function(error, connection, done) {
                    if (error) {
                        _global.sendError(res, error.message);
                        done();
                        return console.log(error);
                    }
                    connection.query(format(`UPDATE users SET password = %L WHERE email = %L`, bcrypt.hashSync(password, 10),email), function(error, rows, fields) {
                        if (error) {
                            _global.sendError(res, error.message);
                            done();
                            return console.log(error);
                        }
                        res.send({ result: 'success'});
                        done();
                    });
                });
            }
        });
    } else {
        return res.status(401).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

router.post('/register-check', function(req, res, next) {
    if (req.body.token == undefined || req.body.token == '') {
        _global.sendError(res, null, 'Token is required');
        return;
    }
    var token = req.body.token;
    if (token) {
        jwt.verify(token, _global.jwt_secret_key, function(error, decoded) {
            if (error) {
                //return res.json(error);
                if (error.name == 'TokenExpiredError') {
                    _global.sendError(res, null, 'The password reset link you used is more than 7 days old and has expired.');
                    return console.log('The password reset link you used is more than 7 days old and has expired.');
                }
                _global.sendError(res, null, 'Invalid token');
                return console.log('Invalid token');
            } else {
                pool_postgres.connect(function(error, connection, done) {
                    if (error) {
                        _global.sendError(res, error.message);
                        done();
                        return console.log(error);
                    }
                    connection.query(format(`SELECT * FROM users WHERE email = %L LIMIT 1`, decoded.email), function(error, result, fields) {
                        if (error) {
                            _global.sendError(res, error.message);
                            done();
                            return console.log(error);
                        }
                        //check password exist
                        if (result.rowCount == 0) {
                            _global.sendError(res, null, "Account not found.");
                            done();
                            return console.log("Account not found.");
                        }
                        res.send({ result: 'success' , user : result.rows[0]});
                        done();
                    });
                });
                
            }
        });
    }
});

router.post('/register', function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, _global.jwt_secret_key, function(error, decoded) {
            if (error) {
                if (error.name == 'TokenExpiredError') {
                    return res.status(401).send({
                        success: false,
                        message: error.message
                    });
                }
            } else {
                if (req.body.phone == undefined || isNaN(req.body.phone)) {
                    _global.sendError(res, null, "Invalid Phone Number");
                    return;
                }
                if (req.body.password == undefined || req.body.password == '') {
                    _global.sendError(res, null, 'Password is required');
                    return;
                }
                if (req.body.first_name == undefined || req.body.first_name == '') {
                    _global.sendError(res, null, "First name is required");
                    return;
                }
                if (req.body.last_name == undefined || req.body.last_name == '') {
                    _global.sendError(res, null, "Last name is required");
                    return;
                }
                if (req.body.confirm_password == undefined || req.body.confirm_password == '') {
                    _global.sendError(res, null, 'Confirm Password is required');
                    return;
                }
                var first_name = req.body.first_name;
                var last_name = req.body.last_name;
                var phone = req.body.phone;
                var avatar = req.body.avatar;
                var password = req.body.password;
                var confirm_password = req.body.confirm_password;
                if (password != confirm_password) {
                    _global.sendError(res, null, 'Password and Confirm password must be the same');
                    return;
                }
                var email = decoded.email;
                pool_postgres.connect(function(error, connection, done) {
                    if (error) {
                        _global.sendError(res, error.message);
                        done();
                        return console.log(error);
                    }
                    connection.query(format(`UPDATE users SET first_name = %L, last_name = %L, phone = %L, avatar = %L, password = %L 
                        WHERE email = %L`, first_name, last_name, phone, avatar, bcrypt.hashSync(password, 10),email), function(error, rows, fields) {
                        if (error) {
                            _global.sendError(res, error.message);
                            done();
                            return console.log(error);
                        }
                        res.send({ result: 'success'});
                        done();
                    });
                });
            }
        });
    } else {
        return res.status(401).send({
            success: false,
            message: 'No token provided.'
        });
    }
});
module.exports = router;
