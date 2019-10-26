var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var pool = mysql.createPool(_global.db);
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var async = require("async");
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);
var fs = require('fs');

router.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, _global.jwt_secret_key, function(error, decoded) {
            if (error) {
                //return res.json(error);
                if(error.name == 'TokenExpiredError'){
                    return res.status(401).send({
                        success: false,
                        message: error.message
                    });
                }
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(401).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

router.use('/teacher', require('./teacher'));
router.use('/absence-request', require('./absence-request'));
router.use('/student', require('./student'));
router.use('/schedule', require('./schedule'));
router.use('/course', require('./course'));
router.use('/attendance', require('./attendance'));
router.use('/user', require('./user'));
router.use('/semester', require('./semester'));
router.use('/feedback', require('./feedback'));
router.use('/check-attendance', require('./check-attendance'));
router.use('/quiz', require('./quiz'));
router.use('/class', require('./classes'));
router.use('/program', require('./program'));
router.use('/notification', require('./notification'));

router.get('/semesters-programs-classes', function(req, res, next) {
    var program_id = req.body.program_id;
    var class_id = req.body.class_id;
    var semester_id = req.body.semester_id;
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(`SELECT * FROM semesters`, function(error, result, fields) {         
            if (error){
                done(error);
                return console.log(error);
            }
            var semesters = result.rows;
            connection.query(`SELECT * FROM programs`, function(error, result, fields) {
                if (error) {
                    done(error);
                    return console.log(error);
                }
                var programs = result.rows;
                connection.query(`SELECT * FROM classes`, function(error, result, fields) {
                    if (error) {
                        done(error);
                        return console.log(error);
                    }
                    var classes = result.rows;
                    res.send({ result: 'success', semesters: semesters, programs: programs, classes: classes });
                    done();
                });
            });
        });
    });
});

router.get('/settings', function(req, res, next) {
    if(req.decoded.role_id != _global.role.admin){
        _global.sendError(res, null, "You dont have permission to access");
        return console.log("You dont have permission to access");
    }
    fs.readFile('./api/data/settings.json', 'utf8', function (error, data) {
        if (error){
            if (err.code === 'ENOENT') {
                _global.sendError(res, null, 'Setting file not found');
                return console.log('Setting file not found');
            } else {
                _global.sendError(res, error.message);
                return console.log(error);
            }
        }
        var settings = JSON.parse(data);
        res.send({
                result: 'success',
                settings : settings
            });
        return console.log('get settings successfully------------------------');
    });
});

router.post('/settings', function(req, res, next) {
    if(req.decoded.role_id != _global.role.admin){
        _global.sendError(res, null, "You dont have permission to access");
        return console.log("You dont have permission to access");
    }
    if(req.body.settings == undefined || req.body.settings == {}){
        _global.sendError(res, null, "Settings are required");
        return console.log("Settings are required");
    }
    fs.writeFile('./api/data/settings.json',JSON.stringify(req.body.settings),function(error) {
            if(error) {
                _global.sendError(res, error.message);
                return console.log(error);
            }
            res.send({
                result: 'success',
                message : 'Save settings successfully'
            });
            return console.log('Save settings successfully------------------------');
        })
});

router.get('/staffs', function(req, res, next) {
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(`SELECT * FROM users WHERE role_id = 3`, function(error, result, fields) {
            if (error) {
                done(error);
                return console.log(error);
            }
    
            res.send({ result: 'success', staffs: result.rows });
            done();
        }); 
    });
});

router.post('/add-staff', function(req, res, next) {
    if (req.body.first_name == undefined || req.body.first_name == '') {
        _global.sendError(res, null, "First name is required");
        return;
    }
    if (req.body.last_name == undefined || req.body.last_name == '') {
        _global.sendError(res, null, "Last name is required");
        return;
    }
    if (req.body.email == undefined || req.body.email == '') {
        _global.sendError(res, null, "Email is required");
        return;
    }
    if (req.body.email.indexOf('@') == -1) {
        _global.sendError(res, null, "Invalid Email");
        return;
    }
    if (req.body.phone == undefined || isNaN(req.body.phone)) {
        _global.sendError(res, null, "Invalid Phone Number");
        return;
    }

    var new_first_name = req.body.first_name;
    var new_last_name = req.body.last_name;
    var new_email = req.body.email;
    var new_phone = req.body.phone;

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

            connection.query(format(`SELECT email FROM users WHERE email = %L LIMIT 1`, new_email), function(error, result, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    done();
                    return console.log(error);
                }
                //check email exist
                if (result.rowCount > 0) {
                    _global.sendError(res, "Email already existed");
                    done();
                    return console.log("Email already existed");
                }
                //new data to users table
                var new_password = new_email.split('@')[0];
                var new_user = [[
                    new_first_name,
                    new_last_name,
                    new_email,
                    new_phone,
                    _global.role.staff
                ]];
                
                connection.query(format('INSERT INTO users (first_name,last_name,email,phone,role_id) VALUES %L RETURNING id', new_user), function(error, result, fields) {
                    if (error) {
                        _global.sendError(res, "Email already existed");
                        done();
                        return console.log("Email already existed");
                    }else{
                        var token = jwt.sign({ email: new_email }, _global.jwt_secret_key, { expiresIn: _global.jwt_register_expire_time });
                        var link = _global.host + '/register;token=' + token;
                        _global.sendMail(
                            '"Giáo vụ"',
                            new_email,
                            'Register your account',
                            'Hi,'+ new_first_name + '\r\n' + 
                            'Your account has been created.To setup your account for the first time, please go to the following web address: \r\n\r\n' +
                            link + 
                            '\r\n(This link is valid for 7 days from the time you received this email)\r\n\r\n' +
                            'If you need help, please contact the site administrator,\r\n' +
                            'Admin User \r\n\r\n' +
                            'admin@fit.hcmus.edu.vn'
                        );
                        res.send({ result: 'success',  message : "Created staff successfully" });
                        done();
                    }
                });
                
        });
    });
});

router.post('/remove-staff', function(req, res, next) {
    if (req.body.email == undefined || req.body.email == '') {
        _global.sendError(res, null, "Email is required");
        return;
    }
    if (req.body.email.indexOf('@') == -1) {
        _global.sendError(res, null, "Invalid Email");
        return;
    }
    
    var email = req.body.email;
    
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
         
        connection.query(format(`DELETE FROM users WHERE email = %L`, [email]), function(error, result, fields) {
            if (error) {
                _global.sendError(res, null, 'error at delete staff');
                done();
                return console.log(error.message + ' at delete staff');
            } else {
                res.send({ result: 'success' ,message:'Deleted staff successfully'});
                done();
            }
        });
    });
});

module.exports = router;
