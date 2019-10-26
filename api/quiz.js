var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var async = require("async");
var randomstring = require("randomstring");
var pool = mysql.createPool(_global.db);
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);
var fs = require('fs');
var published_quizzes = [];

//teacher : get to show template quiz
router.post('/list', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        return console.log("Course_id is required");
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "Classes id is required");
        return console.log("Classes id is required");
    }
    var class_id = req.body.class_id;
    var course_id = req.body.course_id;
    var quiz_list = [];
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT quiz.* FROM quiz,class_has_course 
            WHERE quiz.class_has_course_id = class_has_course.id AND class_has_course.class_id = %L AND
             class_has_course.course_id = %L`, class_id, course_id), function(error, quizzes, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            var list = quizzes.rows;
            async.each(list, function(_quiz, callback) {
                connection.query(format(`SELECT * FROM quiz_questions WHERE quiz_questions.quiz_id = %L`, _quiz.id), function(error, questions, fields) {
                    if (error) {
                        callback(error.message);
                    } else {
                        if(_quiz.is_template){
                            _quiz['questions'] = questions.rows;
                            quiz_list.push(_quiz);
                            callback();
                        }else{
                            _quiz['questions'] = [];
                            async.each(questions.rows, function(question, callback) {
                                connection.query(format(`SELECT quiz_answers.* ,CONCAT(users.first_name,' ',users.last_name) as student_name, students.stud_id as student_code 
                                    FROM quiz_answers,students,users 
                                    WHERE users.id = students.id AND users.id = quiz_answers.answered_by AND quiz_question_id = %L`, question.id), function(error, answers, fields) {
                                    if (error) {
                                        callback(error.message);
                                    } else {
                                        question['answers'] = answers.rows.slice();
                                        _quiz['questions'].push(question);
                                        callback();
                                    }
                                });
                            }, function(error) {
                                if (error) {
                                    callback(error);
                                } else {
                                    quiz_list.push(_quiz);
                                    callback();
                                }
                            });
                        }
                    }
                });
            }, function(error) {
                if (error) {
                    _global.sendError(res, null, error);
                    done();
                    return console.log(error);
                } else {
                    console.log('Get quiz_list successfully-----------------');
                    res.send({
                        result: 'success',
                        quiz_list: quiz_list,
                    });
                    done();
                }
            });
        });
    });
});

//teacher : get detail to show
router.post('/published', function(req, res, next) {
    if (req.body.quiz_code == null || req.body.quiz_code == 0) {
        _global.sendError(res, null, "quiz_code is required");
        return console.log("quiz_code is required");
    }
    var quiz_code = req.body.quiz_code;
    fs.readFile('./api/data/quiz/' + quiz_code + '.json', 'utf8', function (error, data) {
        if (error){
            if (err.code === 'ENOENT') {
                _global.sendError(res, null, 'Invalid code! The quiz might be already closed');
                return console.log('Invalid code! The quiz might be already closed');
            } else {
                _global.sendError(res, error.message);
                return console.log(error);
            }
        }
        var quiz = JSON.parse(data);
        res.send({
            result: 'success',
            quiz: quiz
        });
        return console.log('Get published quiz successfully------------------------');
    });
});

//teacher : notify that teacher has started quiz
router.post('/start', function(req, res, next) {
    if (req.body.quiz_code == null || req.body.quiz_code == 0) {
        _global.sendError(res, null, "quiz_code is required");
        return console.log("quiz_code is required");
    }
    var quiz_code = req.body.quiz_code;
    fs.readFile('./api/data/quiz/' + quiz_code + '.json', 'utf8', function (error, data) {
        if (error){
            if (err.code === 'ENOENT') {
                _global.sendError(res, null, 'Invalid code! The quiz not found');
                return console.log('Invalid code! The quiz not found');
            } else {
                _global.sendError(res, error.message);
                return console.log(error);
            }
        }
        var quiz = JSON.parse(data);
        quiz['is_started'] = true;
        quiz['started_at'] = new Date();
        //ghi file
        fs.writeFile('./api/data/quiz/' + quiz_code + '.json',JSON.stringify(quiz),function(error) {
            if(error) {
                _global.sendError(res, error.message);
                return console.log(error);
            }
            res.send({
                result: 'success',
            });
            return console.log('Start quiz successfully------------------------');
        })
    });
});

//Teacher : publish quiz
router.post('/publish', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        return console.log("Course_id is required");
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "Classes id is required");
        return console.log("Classes id is required");
    }
    if (req.body.quiz == null || req.body.quiz.length == 0) {
        _global.sendError(res, null, "Quiz is required");
        return console.log("Quiz is required");
    }
    if (req.body.quiz.title == null || req.body.quiz.title == '') {
        _global.sendError(res, null, "Quiz title id is required");
        return console.log("Quiz title id is required");
    }
    if (req.body.quiz.questions == null || req.body.quiz.questions.length == 0) {
        _global.sendError(res, null, "Quiz questions are required");
        return console.log("Quiz questions are required");
    }
    var quiz = req.body.quiz;
    var class_id = req.body.class_id;
    var course_id = req.body.course_id;
    var required_correct_answers = req.body.quiz.required_correct_answers ? req.body.quiz.required_correct_answers : 0;
    if (req.body.quiz.type == _global.quiz_type.academic && req.body.quiz.questions.length < required_correct_answers) {
        _global.sendError(res, null, "No. required musn't exceed No. questions");
        return console.log("No. required musn't exceed No. questions");
    }
    for (var i = 0; i < quiz.questions.length; i++) {
        if (req.body.quiz.questions[i].text == null || req.body.quiz.questions[i].text == '') {
            _global.sendError(res, null, "Title of question " + (i + 1) + " are required");
            return console.log("Title of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].option_a == null || req.body.quiz.questions[i].option_a == '') {
            _global.sendError(res, null, "Option A of question " + (i + 1) + " are required");
            return console.log("Option A of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].option_b == null || req.body.quiz.questions[i].option_b == '') {
            _global.sendError(res, null, "Option B of question " + (i + 1) + " are required");
            return console.log("Option B of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].option_c == null || req.body.quiz.questions[i].option_c == '') {
            _global.sendError(res, null, "Option C of question " + (i + 1) + " are required");
            return console.log("Option C of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].option_d == null || req.body.quiz.questions[i].option_d == '') {
            _global.sendError(res, null, "Option D of question " + (i + 1) + " are required");
            return console.log("Option D of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].correct_option == null || req.body.quiz.questions[i].correct_option == '') {
            _global.sendError(res, null, "Correct option of question " + (i + 1) + " are required");
            return console.log("Correct option of question " + (i + 1) + " are required");
        }
    }
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT id FROM class_has_course WHERE class_id = %L AND course_id = %L`, class_id, course_id), function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            } else {
                var new_quiz = {
                    title: quiz.title,
                    class_has_course_id: result.rows[0].id,
                    is_started: false,
                    started_at: '',
                    is_randomize_answers: quiz.is_randomize_answers,
                    is_randomize_questions: quiz.is_randomize_questions,
                    required_correct_answers: quiz.required_correct_answers,
                    code: randomstring.generate({ length: 5, capitalization: 'uppercase', charset: 'numeric' }),
                    created_by: req.decoded.id,
                    type: quiz.type,
                    participants: [],
                    questions: []
                };
                for (var i = 0; i < quiz.questions.length; i++) {
                    new_quiz.questions.push({
                        text: quiz.questions[i].text,
                        option_a: quiz.questions[i].option_a,
                        option_b: quiz.questions[i].option_b,
                        option_c: quiz.questions[i].option_c,
                        option_d: quiz.questions[i].option_d,
                        correct_option: quiz.questions[i].correct_option,
                        timer: quiz.questions[i].timer,
                        answers: []
                    });
                }
                //shuffle question
                for (var i = new_quiz.questions.length; i; i--) {
                    var j = Math.floor(Math.random() * i);
                    var text = new_quiz.questions[j].text;
                    var timer = new_quiz.questions[j].timer;
                    var correct_option = new_quiz.questions[j].correct_option;

                    var options_j = [
                        new_quiz.questions[j].option_a,
                        new_quiz.questions[j].option_b,
                        new_quiz.questions[j].option_c,
                        new_quiz.questions[j].option_d
                    ];
                    var options_i = [
                        new_quiz.questions[i - 1].option_a,
                        new_quiz.questions[i - 1].option_b,
                        new_quiz.questions[i - 1].option_c,
                        new_quiz.questions[i - 1].option_d
                    ];
                    var random_index = 0;

                    new_quiz.questions[j].text = new_quiz.questions[i - 1].text;
                    new_quiz.questions[j].timer = new_quiz.questions[i - 1].timer;
                    new_quiz.questions[j].correct_option = new_quiz.questions[i - 1].correct_option;
                    random_index = Math.floor(Math.random() * options_i.length);
                    new_quiz.questions[j].option_a = options_i[random_index];
                    options_i.splice(random_index, 1);
                    random_index = Math.floor(Math.random() * options_i.length);
                    new_quiz.questions[j].option_b = options_i[random_index];
                    options_i.splice(random_index, 1);
                    random_index = Math.floor(Math.random() * options_i.length);
                    new_quiz.questions[j].option_c = options_i[random_index];
                    options_i.splice(random_index, 1);
                    random_index = Math.floor(Math.random() * options_i.length);
                    new_quiz.questions[j].option_d = options_i[random_index];
                    options_i.splice(random_index, 1);

                    new_quiz.questions[i - 1].text = text;
                    new_quiz.questions[i - 1].timer = timer;
                    new_quiz.questions[i - 1].correct_option = correct_option;
                    random_index = Math.floor(Math.random() * options_j.length);
                    new_quiz.questions[i - 1].option_a = options_j[random_index];
                    options_j.splice(random_index, 1);
                    random_index = Math.floor(Math.random() * options_j.length);
                    new_quiz.questions[i - 1].option_b = options_j[random_index];
                    options_j.splice(random_index, 1);
                    random_index = Math.floor(Math.random() * options_j.length);
                    new_quiz.questions[i - 1].option_c = options_j[random_index];
                    options_j.splice(random_index, 1);
                    random_index = Math.floor(Math.random() * options_j.length);
                    new_quiz.questions[i - 1].option_d = options_j[random_index];
                    options_j.splice(random_index, 1);
                }
                fs.writeFile('./api/data/quiz/' + new_quiz.code + '.json',JSON.stringify(new_quiz),function(error) {
                    if(error) {
                        _global.sendError(res, error.message);
                        return console.log(error);
                    }
                    console.log('success publish quiz---------------------------------------');
                    res.send({ result: 'success', quiz_code: new_quiz.code, message: 'Publish quiz successfully' });
                    done();
                });
            }
        });
    });
});

//Teacher : stop quiz midway
router.post('/stop', function(req, res, next) {
    if (req.body.quiz_code == null || req.body.quiz_code == 0) {
        _global.sendError(res, null, "quiz_code is required");
        return console.log("quiz_code is required");
    }
    var quiz_code = req.body.quiz_code;

    fs.unlink('./api/data/quiz/' + quiz_code + '.json', (error) => {
        if (error){
            _global.sendError(res, error.message,error);
            return console.log(error);
        };
        console.log('success stop quiz---------------------------------------');
        res.send({ result: 'success', message: 'Stop quiz successfully' });
    });
});

router.post('/join', function(req, res, next) {
    if (req.body.code == null || req.body.code == '') {
        _global.sendError(res, null, "Quiz code is required");
        return console.log("Quiz code is required");
    }
    var code = req.body.code;
    var student_id = req.decoded.id;
    fs.readFile('./api/data/quiz/' + code + '.json', 'utf8', function (error, data) {
        if (error){
            if (error.code === 'ENOENT') {
                _global.sendError(res, null, 'Invalid code! The quiz might be already closed');
                return console.log('Invalid code! The quiz might be already closed');
            } else {
                _global.sendError(res, error.message);
                return console.log(error);
            }
        }
        var quiz = JSON.parse(data);
        if (quiz['is_started']) {
            _global.sendError(res, null, 'Cannot join because quiz is already started');
            return console.log('Cannot join because quiz is already started');
        }
        var class_has_course_id = quiz.class_has_course_id;
        var participants = quiz.participants;
        for(var j = 0 ; j < participants.length; j++){
            if(participants[j].id == student_id){
                _global.sendError(res, null, "You're already joined this quiz.");
                return console.log("You're already joined this quiz.");
            }
        }
        pool_postgres.connect(function(error, connection, done) {
            if(connection == undefined){
                _global.sendError(res, null, "Can't connect to database");
                done();
                return console.log("Can't connect to database");
            }
            connection.query(format(`SELECT * FROM student_enroll_course, students WHERE class_has_course_id = %L AND student_id = %L AND student_id = students.id`, class_has_course_id, student_id), function(error, result, fields) {
                if (error) {
                    _global.sendError(res, null, error.message);
                    done();
                    return console.log(error);
                } else {
                    if (result.rowCount == 0) {
                        _global.sendError(res, null, 'You are not in this course');
                        done();
                        return console.log('You are not in this course');
                    } else {
                        participants.push({
                            id: student_id,
                            code: result.rows[0].stud_id,
                            name: req.decoded.first_name + ' ' + req.decoded.last_name,
                        });
                        fs.writeFile('./api/data/quiz/' + code.toString() + '.json',JSON.stringify(quiz),function(error) {
                            if(error) {
                                _global.sendError(res, error.message);
                                return console.log(error);
                            }
                            res.send({
                                result: 'success'
                            });
                            done();
                            var socket = req.app.get('socket');
                            socket.emit('joinedQuiz', { 'quiz_code': code.toString() });
                            return console.log('Join quiz successfully------------------------');
                        });
                    }
                }
            });
        });
    });
});

router.post('/quit', function(req, res, next) {
    if (req.body.code == null || req.body.code == '') {
        _global.sendError(res, null, "Quiz code is required");
        return console.log("Quiz code is required");
    }
    var code = req.body.code;
    var student_id = req.decoded.id;
    fs.readFile('./api/data/quiz/' + code + '.json', 'utf8', function (error, data) {
        if (error){
            if (error.code === 'ENOENT') {
                _global.sendError(res, null, 'Invalid code! The quiz might be already closed');
                return console.log('Invalid code! The quiz might be already closed');
            } else {
                _global.sendError(res, error.message);
                return console.log(error);
            }
        }
        var quiz = JSON.parse(data);
        var participants = quiz.participants;
        for (var j = 0; j < participants.length; j++) {
            if (participants[j].id == student_id) {
                participants.splice(j, 1);
                break;
            }
        }
        fs.writeFile('./api/data/quiz/' + code + '.json',JSON.stringify(quiz),function(error) {
            if(error) {
                _global.sendError(res, error.message);
                return console.log(error);
            }
            res.send({
                result: 'success'
            });
            var socket = req.app.get('socket');
            socket.emit('quittedQuiz', { 'quiz_code': code, 'student_id':student_id });
            return console.log('Quitted quiz successfully------------------------');
        })
    });
});

router.post('/delete', function(req, res, next) {
    if (req.body.quiz_id == null || req.body.quiz_id == 0) {
        _global.sendError(res, null, "quiz_id is required");
        return console.log("quiz_id is required");
    }
    var quiz_id = req.body.quiz_id;
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
            //delete Answers
            function(callback) {
                connection.query(format(`SELECT id FROM quiz_questions WHERE quiz_id = %L`, quiz_id), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        async.each(result.rows, function(question, callback) {
                            connection.query(format(`DELETE FROM quiz_answers WHERE quiz_question_id = %L`, question.id), function(error, result, fields) {
                                if (error) {
                                    callback(error.message);
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
                    }
                });
            },
            //delete Questions
            function(callback) {
                connection.query(format(`DELETE FROM quiz_questions WHERE quiz_id = %L`, quiz_id), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            //Delete quiz
            function(callback) {
                connection.query(format(`DELETE FROM quiz WHERE id = %L`, quiz_id), function(error, result, fields) {
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
                _global.sendError(res, error.message);
                connection.query('ROLLBACK', (error) => {
                    if (error) return console.log(error);
                });
                done();
                return console.log(error);
            } else {
                console.log('success delete quiz---------------------------------------');
                res.send({ result: 'success', message: 'Delete quiz successfully' });
                done();
            }
        });
    });
});

router.post('/add', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        return console.log("Course_id is required");
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "Classes id is required");
        return console.log("Classes id is required");
    }
    if (req.body.quiz == null || req.body.quiz.length == 0) {
        _global.sendError(res, null, "Quiz is required");
        return console.log("Quiz is required");
    }
    if (req.body.quiz.title == null || req.body.quiz.title == '') {
        _global.sendError(res, null, "Quiz title id is required");
        return console.log("Quiz title id is required");
    }
    if (req.body.quiz.questions == null || req.body.quiz.questions.length == 0) {
        _global.sendError(res, null, "Quiz questions are required");
        return console.log("Quiz questions are required");
    }
    var quiz = req.body.quiz;
    var class_id = req.body.class_id;
    var course_id = req.body.course_id;
    for (var i = 0; i < quiz.questions.length; i++) {
        if (req.body.quiz.questions[i].text == null || req.body.quiz.questions[i].text == '') {
            _global.sendError(res, null, "Title of question " + (i + 1) + " are required");
            return console.log("Title of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].option_a == null || req.body.quiz.questions[i].option_a == '') {
            _global.sendError(res, null, "Option A of question " + (i + 1) + " are required");
            return console.log("Option A of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].option_b == null || req.body.quiz.questions[i].option_b == '') {
            _global.sendError(res, null, "Option B of question " + (i + 1) + " are required");
            return console.log("Option B of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].option_c == null || req.body.quiz.questions[i].option_c == '') {
            _global.sendError(res, null, "Option C of question " + (i + 1) + " are required");
            return console.log("Option C of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].option_d == null || req.body.quiz.questions[i].option_d == '') {
            _global.sendError(res, null, "Option D of question " + (i + 1) + " are required");
            return console.log("Option D of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].correct_option == null || req.body.quiz.questions[i].correct_option == '') {
            _global.sendError(res, null, "Correct option of question " + (i + 1) + " are required");
            return console.log("Correct option of question " + (i + 1) + " are required");
        }
    }
    var class_has_course_id = 0;
    var quiz_id = 0;
    var quiz_code = '';
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
            //get class_has_course id
            function(callback) {
                connection.query(format(`SELECT id FROM class_has_course WHERE class_id = %L AND course_id = %L`, class_id, course_id), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        class_has_course_id = result.rows[0].id;
                        callback();
                    }
                });
            },
            //insert quiz
            function(callback) {
                var new_quiz = [
                    [
                        quiz.title,
                        class_has_course_id,
                        1,
                        _global.quiz_type.academic
                    ]
                ];
                connection.query(format(`INSERT INTO quiz (title,class_has_course_id,is_template,type) VALUES %L RETURNING id`, new_quiz), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        quiz_id = result.rows[0].id;
                        callback();
                    }
                });
            },
            //insert questions
            function(callback) {
                var new_questions = [];
                for (var i = 0; i < quiz.questions.length; i++) {
                    new_questions.push([
                        quiz_id,
                        quiz.questions[i].text,
                        quiz.questions[i].option_a,
                        quiz.questions[i].option_b,
                        quiz.questions[i].option_c,
                        quiz.questions[i].option_d,
                        quiz.questions[i].correct_option,
                        quiz.questions[i].timer
                    ]);
                }
                connection.query(format(`INSERT INTO quiz_questions (quiz_id,text,option_a,option_b,option_c,option_d,correct_option,timer) VALUES %L`, new_questions), function(error, result, fields) {
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
                _global.sendError(res, error.message);
                connection.query('ROLLBACK', (error) => {
                    if (error) return console.log(error);
                });
                done();
                return console.log(error);
            } else {
                console.log('success add quiz---------------------------------------');
                res.send({ result: 'success', message: 'Add quiz successfully' });
                done();
            }
        });
    });
});

//Teacher save quiz to database and check attendance
router.post('/save', function(req, res, next) {
    if (req.body.quiz == null) {
        _global.sendError(res, null, "Quiz is required");
        return console.log("Quiz is required");
    }
    if (req.body.checked_student_list == null) {
        _global.sendError(res, null, "Classes id is required");
        return console.log("Classes id is required");
    }
    var quiz = req.body.quiz;
    var checked_student_list = req.body.checked_student_list;
    var quiz_id = 0;
    var opening_attendance_id = 0;
    var class_id =0;
    var course_id = 0;
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
            //insert quiz
            function(callback) {
                var new_quiz = [[
                        quiz.title,
                        quiz.class_has_course_id,
                        quiz.started_at,
                        quiz.is_randomize_answers,
                        quiz.required_correct_answers,
                        quiz.code,
                        req.decoded.id,
                        quiz.type
                ]];
                connection.query(format(`INSERT INTO quiz (title,class_has_course_id,started_at,is_randomize_answers,required_correct_answers,code,created_by,type) 
                    VALUES %L RETURNING id`, new_quiz), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        quiz_id = result.rows[0].id;
                        callback();
                    }
                });
            },
            //insert questions & answers
            function(callback) {
                async.each(quiz.questions, function(question, callback) {
                    var new_question_id = 0;
                    async.series([
                        //insert questions
                        function(callback) {
                            var new_question = [[
                                quiz_id,
                                question.text,
                                question.option_a,
                                question.option_b,
                                question.option_c,
                                question.option_d,
                                question.correct_option,
                                question.timer
                            ]];
                            connection.query(format(`INSERT INTO quiz_questions (quiz_id,text,option_a,option_b,option_c,option_d,correct_option,timer) VALUES %L RETURNING id`, new_question), function(error, result, fields) {
                                if (error) {
                                    callback(error);
                                } else {
                                    new_question_id = result.rows[0].id;
                                    console.log('Inserted question');
                                    callback();
                                }
                            });
                        },
                        //insert answers
                        function(callback) {
                            var new_answers = [];
                            for(var i=0; i < question.answers.length; i++){
                                new_answers.push([
                                    new_question_id,
                                    question.answers[i].answered_by,
                                    question.answers[i].answered_at,
                                    question.answers[i].selected_option,
                                ]);
                            }
                            connection.query(format(`INSERT INTO quiz_answers (quiz_question_id,answered_by,answered_at,selected_option) VALUES %L `, new_answers), function(error, result, fields) {
                                if (error) {
                                    callback(error);
                                } else {
                                    console.log('Inserted answers');
                                    callback();
                                }
                            });
                        },
                    ], function(error) {
                        if (error) {
                            callback(error)
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
            //get opening attendance id
            function(callback) {
                connection.query(format(`SELECT attendance.id,attendance.class_id,attendance.course_id FROM attendance,class_has_course 
                    WHERE attendance.class_id = class_has_course.class_id AND
                    class_has_course.course_id = attendance.course_id AND 
                    class_has_course.id = %L AND attendance.closed = FALSE`, quiz.class_has_course_id), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        opening_attendance_id = result.rows[0].id;
                        class_id = result.rows[0].class_id;
                        course_id = result.rows[0].course_id;
                        callback();
                    }
                });
            },
            //overide old attendance details
            function(callback) {
                connection.query(format(`UPDATE attendance_detail SET attendance_type = %L WHERE attendance_id = %L`, _global.attendance_type.absent, opening_attendance_id), function(error, result, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            //update attendance details
            function(callback) {
                if(checked_student_list.length > 0){
                    var query_where = ' ( student_id = ' + checked_student_list[0].id;
                    for(var i = 1 ; i < checked_student_list.length; i++){
                        query_where += ' OR student_id = ' + checked_student_list[i].id;
                    }
                    query_where += " ) AND attendance_id = %L ";
                    connection.query(format(`UPDATE attendance_detail SET attendance_type = %L WHERE ` + query_where, _global.attendance_type.quiz, opening_attendance_id), function(error, result, fields) {
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
            //delete quiz
            function(callback){
                fs.unlink('./api/data/quiz/' + quiz.code + '.json', (error) => {
                    if (error){
                        callback(error);
                    }
                    else{
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
                done();
                return console.log(error);
            } else {
                console.log('success save quiz---------------------------------------');
                res.send({ result: 'success', message: 'Save quiz successfully' });
                done();
                var socket = req.app.get('socket');
                socket.emit('checkAttendanceUpdated', { 'course_id': course_id, 'class_id': class_id });            
            }
        });
    });
});

//Teacher generate misc question
router.post('/misc-question', function(req, res, next) {
    var number_of_question = req.body.number_of_question ? req.body.number_of_question : 3;
    var questions = [];

    fs.readFile('./api/data/quiz/misc_quiz.json', 'utf8', function (error, data) {
        if (error){
            _global.sendError(res, error.message);
            return console.log(error);
        }
        var all_questions = JSON.parse(data);

        for(var i = 0; i < number_of_question; i++){
            if(all_questions.length == 0){
                break;
            }
            var random_index = Math.floor(Math.random() * all_questions.length);
            questions.push(all_questions[random_index]);
            all_questions.splice(random_index, 1);
        }
        console.log('Get misc questions successfully-----------------');
        res.send({
            result: 'success',
            questions: questions,
        });
    });
});

router.post('/update', function(req, res, next) {
    if (req.body.quiz == null || req.body.quiz.length == 0) {
        _global.sendError(res, null, "Quiz is required");
        return console.log("Quiz is required");
    }
    if (req.body.quiz.id == null || req.body.quiz.id == 0) {
        _global.sendError(res, null, "Quiz_id is required");
        return console.log("Quiz_id is required");
    }
    if (req.body.quiz.questions == null || req.body.quiz.questions.length == 0) {
        _global.sendError(res, null, "Quiz questions are required");
        return console.log("Quiz questions are required");
    }
    var quiz = req.body.quiz;
    for (var i = 0; i < quiz.questions.length; i++) {
        if (req.body.quiz.questions[i].text == null || req.body.quiz.questions[i].text == '') {
            _global.sendError(res, null, "Title of question " + (i + 1) + " are required");
            return console.log("Title of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].option_a == null || req.body.quiz.questions[i].option_a == '') {
            _global.sendError(res, null, "Option A of question " + (i + 1) + " are required");
            return console.log("Option A of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].option_b == null || req.body.quiz.questions[i].option_b == '') {
            _global.sendError(res, null, "Option B of question " + (i + 1) + " are required");
            return console.log("Option B of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].option_c == null || req.body.quiz.questions[i].option_c == '') {
            _global.sendError(res, null, "Option C of question " + (i + 1) + " are required");
            return console.log("Option C of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].option_d == null || req.body.quiz.questions[i].option_d == '') {
            _global.sendError(res, null, "Option D of question " + (i + 1) + " are required");
            return console.log("Option D of question " + (i + 1) + " are required");
        }
        if (req.body.quiz.questions[i].correct_option == null || req.body.quiz.questions[i].correct_option == '') {
            _global.sendError(res, null, "Correct option of question " + (i + 1) + " are required");
            return console.log("Correct option of question " + (i + 1) + " are required");
        }
    }
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
            //update questions
            function(callback) {
                async.each(quiz.questions, function(question, callback) {
                    connection.query(format(`UPDATE quiz_questions SET text = %L,option_a = %L,option_b = %L,option_c = %L,option_d = %L,correct_option = %L,timer = %L
                        WHERE id = %L AND quiz_id = %L`,question.text, question.option_a, question.option_b, question.option_c, question.option_d, question.correct_option, question.timer, question.id, question.quiz_id), function(error, result, fields) {
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
                _global.sendError(res, error.message);
                connection.query('ROLLBACK', (error) => {
                    if (error) return console.log(error);
                });
                done();
                return console.log(error);
            } else {
                console.log('success update quiz---------------------------------------');
                res.send({ result: 'success', message: 'Update quiz successfully' });
                done();
            }
        });
    });
});
module.exports = router;
