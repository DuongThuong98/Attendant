var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var pool = mysql.createPool(_global.db);
var async = require("async");
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);

router.get('/:id', function(req, res, next) {
    var id = req.params['id'];
    pool_postgres.connect(function(error, connection, done) {
        if(connection == undefined){
            _global.sendError(res, null, "Can't connect to database");
            done();
            return console.log("Can't connect to database");
        }
        connection.query(format(`SELECT * FROM semesters WHERE id = %L`, id), function(error, result, fields) {
            if (error) {
                var message = error.message + ' at get semester info';
                _global.sendError(res, message);
                done();
                return console.log(error);
            } else {
                res.send({ result: 'success', semester : result.rows[0]});
                done();
            }
        });
    });
});
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

            semesters = result.rows;
            var search_list = [];
            if (searchText == null) {
                search_list = semesters;
            } else {
                for (var i = 0; i < semesters.length; i++) {
                    if (semesters[i].name.toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
                        search_list.push(semesters[i]);
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
                    semesters: _global.filterListByPage(page, limit, search_list)
                });
            } else {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    semesters: search_list
                });
            }
            done();
        };
        connection.query(format(`SELECT * FROM semesters`), return_function);
    });
});
router.post('/create', function(req, res, next) {
    if (req.body.name == undefined || req.body.name == '') {
        _global.sendError(res, null, "Name is required");
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
    var semester = [[
        req.body.name,
        req.body.start_date,
        req.body.end_date,
        req.body.vacation_time,
    ]];
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done(error);
            return console.log(error);
        }
        connection.query(format(`SELECT * FROM semesters WHERE name = %L`,req.body.name),function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done(error);
                return console.log(error);
            }
            if(result.rowCount > 0){
                _global.sendError(res, null, "Semester's existed");
                done();
                return console.log("Semester's existed");
            }else{
                connection.query(format(`INSERT INTO semesters (name,start_date,end_date,vacation_time) VALUES %L`,semester),function(error, rows, fields) {
                    if (error) {
                        _global.sendError(res, error.message);
                        done(error);
                        return console.log(error);
                    }
                    res.send({ result: 'success', message: 'Semester added successfully'});
                    done();
                });
            }
        });
    });
});

module.exports = router;