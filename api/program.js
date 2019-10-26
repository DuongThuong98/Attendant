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

            programs = result.rows;
            var search_list = [];
            if (searchText == null) {
                search_list = programs;
            } else {
                for (var i = 0; i < programs.length; i++) {
                    if (programs[i].name.toLowerCase().indexOf(searchText.toLowerCase()) != -1 ||
                        programs[i].code.toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
                        search_list.push(programs[i]);
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
                    programs: _global.filterListByPage(page, limit, search_list)
                });
            } else {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    programs: search_list
                });
            }
            done();
        };
        connection.query(format(`SELECT *, (SELECT count(*) FROM classes WHERE programs.id = classes.program_id) as total_class FROM programs`), return_function);
    });
});

router.post('/create', function(req, res, next) {
    if (req.body.name == undefined || req.body.name == '') {
        _global.sendError(res, null, "Name is required");
        return;
    }
    if (req.body.code == undefined || req.body.start_date == 0) {
        _global.sendError(res, null, "Code is required");
        return;
    }
    var program = [[
        req.body.name,
        req.body.code
    ]];
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }
        connection.query(format(`SELECT * FROM programs WHERE code = %L OR name = %L`,program[0][0],program[0][1]),function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            if(result.rowCount > 0){
                _global.sendError(res, null, "Program's existed");
                done();
                return console.log("Program's existed");
            }else{
                connection.query(format(`INSERT INTO programs (name,code) VALUES %L`,program),function(error, rows, fields) {
                    if (error) {
                        _global.sendError(res, error.message);
                        done();
                        return console.log(error);
                    }
                    res.send({ result: 'success', message: 'Program added successfully'});
                    done();
                });
            }
        });
    });
});

module.exports = router;