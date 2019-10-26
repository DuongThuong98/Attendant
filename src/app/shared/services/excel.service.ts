import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { FileUploader } from "ng2-file-upload/ng2-file-upload";
import * as XLSX from 'xlsx';
declare var XlsxPopulate : any; 
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';
import * as Async from 'async';

import { AppConfig } from '../config';
import { AppService } from './app.service';
@Injectable()
export class ExcelService {

    public constructor(public http: Http,public appService: AppService) {}
    public s2ab(s): any {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    public readStudentListFile(file: any): Observable < { result: string, student_list: Array < any > , message: string } > {
        return new Observable < any > ((observer) => {
                XlsxPopulate.fromDataAsync(file)
                .then(workbook => {
                    observer.next(workbook.sheet(0));
                });
            }).map((sheet: any) => {
                var cells = sheet.usedRange().value();
                var import_start = 0;
                var student_list = [];
                for(var i = 0 ; i < cells.length; i++){
                    if(cells[i][0] == 'STT'){
                        import_start = i+1;
                        break;
                    }
                }
                for(var i = import_start; i < cells.length; i++){
                    var student = {
                        stt : cells[i][0],
                        stud_id : cells[i][1],
                        name : cells[i][2],
                        phone : cells[i][3],
                    }
                    if(student.stud_id != undefined || student.name != undefined){
                        student_list.push(student);
                    }
                }
                return { result: 'success', message: 'success', student_list : student_list};
            }).catch((error: any) => Observable.of({ result: 'failure', message: error }));
    }

    public writeStudentSearchList(student_list: any, file_name: string) {
        XlsxPopulate.fromBlankAsync()
        .then(workbook => {
            workbook.sheet(0).cell("A1").value("Danh sách sinh viên").style("horizontalAlignment", "center");

            workbook.sheet(0).cell("A3").value("STT").style("border", true).style("horizontalAlignment", "center");
            workbook.sheet(0).cell("B3").value("MSSV").style("border", true).style("horizontalAlignment", "center");
            workbook.sheet(0).cell("C3").value("Họ Tên").style("border", true).style("horizontalAlignment", "center");
            workbook.sheet(0).cell("D3").value("SĐT").style("border", true).style("horizontalAlignment", "center");
            workbook.sheet(0).cell("E3").value("Lớp").style("border", true).style("horizontalAlignment", "center");

            for (var i = 0; i < student_list.length; i++) {
                workbook.sheet(0).cell("A" + Math.floor(i + 4)).value(i + 1).style("border", true);
                workbook.sheet(0).cell("B" + Math.floor(i + 4)).value(student_list[i].code).style("border", true);
                workbook.sheet(0).cell("C" + Math.floor(i + 4)).value(student_list[i].name).style("border", true);
                workbook.sheet(0).cell("D" + Math.floor(i + 4)).value(student_list[i].phone).style("border", true);
                workbook.sheet(0).cell("E" + Math.floor(i + 4)).value(student_list[i].class_name).style("border", true);
            }
            workbook.sheet(0).range("A1:E1").merged(true);
            const range = workbook.sheet(0).range("A1:Y"+Math.floor(student_list.length+4));
            return workbook.outputAsync()
                .then(function (blob) {
                    if (file_name == '') file_name = 'students';
                    FileSaver.saveAs(blob, file_name + ".xlsx");
                });
        });
    }

    public writeStudentLists(student_lists: any,file_names: any) {
        var zip = new JSZip();
        Async.eachOf(student_lists, function(student_list,index,callback){
             XlsxPopulate.fromBlankAsync()
            .then(workbook => {
                workbook.sheet(0).cell("A1").value("Danh sách sinh viên " + file_names[index]).style("horizontalAlignment", "center");

                workbook.sheet(0).cell("A3").value("STT").style("border", true).style("horizontalAlignment", "center");
                workbook.sheet(0).cell("B3").value("MSSV").style("border", true).style("horizontalAlignment", "center");
                workbook.sheet(0).cell("C3").value("Họ Tên").style("border", true).style("horizontalAlignment", "center");
                workbook.sheet(0).cell("D3").value("SĐT").style("border", true).style("horizontalAlignment", "center");
                workbook.sheet(0).cell("E3").value("Lớp").style("border", true).style("horizontalAlignment", "center");

                for (var i = 0; i < student_list.length; i++) {
                    workbook.sheet(0).cell("A" + Math.floor(i + 4)).value(i + 1).style("border", true);
                    workbook.sheet(0).cell("B" + Math.floor(i + 4)).value(student_list[i].code).style("border", true);
                    workbook.sheet(0).cell("C" + Math.floor(i + 4)).value(student_list[i].name).style("border", true);
                    workbook.sheet(0).cell("D" + Math.floor(i + 4)).value(student_list[i].phone).style("border", true);
                    workbook.sheet(0).cell("E" + Math.floor(i + 4)).value(student_list[i].class_name).style("border", true);
                }
                workbook.sheet(0).range("A1:E1").merged(true);
                const range = workbook.sheet(0).range("A1:Y"+Math.floor(student_list.length+3));
                return workbook.outputAsync()
                    .then(function (blob) {
                        zip.file(file_names[index] + ".xlsx", blob);
                        callback();
                    });
            });
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                zip.generateAsync({ type: "blob" })
                .then(function(content) {
                    FileSaver.saveAs(content, "students.zip");
                });  
            }
        });
    }

    public writeExamineesLists(student_lists: any, class_has_courses: any) {
        var zip = new JSZip();
        Async.eachOf(student_lists, function(student_list,index,callback){
            var class_has_course = class_has_courses[index];
            XlsxPopulate.fromBlankAsync()
            .then(workbook => {
                workbook.sheet(0).cell("A1").value("Trường Đại học Khoa học Tự nhiên - TP.HCM");
                workbook.sheet(0).cell("A2").value("Khoa Công Nghệ Thông Tin");
                workbook.sheet(0).cell("A3").value("BẢNG ĐIỂM TỔNG KẾT MÔN").style("horizontalAlignment", "center");
                workbook.sheet(0).cell("A4").value("Học kỳ: " + class_has_course.semester);
                workbook.sheet(0).cell("A5").value('Chương trình: ' + class_has_course.program);
                workbook.sheet(0).cell("H5").value('Lớp: ' + class_has_course.class_name);
                workbook.sheet(0).cell("A6").value('Môn: ' + class_has_course.code + ' - ' + class_has_course.name);
                workbook.sheet(0).cell("H6").value('Ngày thi: ');
                workbook.sheet(0).cell("A7").value('Giảng viên: ' + class_has_course.lecturers);
                workbook.sheet(0).cell("H7").value('Phòng: ');
                
                workbook.sheet(0).cell("A9").value("STT").style("border", true);
                workbook.sheet(0).cell("B9").value("MSSV").style("border", true);
                workbook.sheet(0).cell("C9").value("Họ SV").style("border", true);
                workbook.sheet(0).cell("D9").value("Tên SV").style("border", true);
                workbook.sheet(0).cell("E9").value("Số tờ").style("border", true);
                workbook.sheet(0).cell("F9").value("Ký tên").style("border", true);
                workbook.sheet(0).cell("G9").value("Điểm CK").style("border", true);
                workbook.sheet(0).cell("H9").value("Điểm TK").style("border", true);
                workbook.sheet(0).cell("I9").value("Ghi chú").style("border", true);

                for (var i = 0; i < student_list.length; i++) {
                    workbook.sheet(0).cell("A" + Math.floor(i + 10)).value(i + 1).style("border", true);
                    workbook.sheet(0).cell("B" + Math.floor(i + 10)).value(student_list[i].student_code).style("border", true);
                    workbook.sheet(0).cell("C" + Math.floor(i + 10)).value(student_list[i].first_name).style("border", true);
                    workbook.sheet(0).cell("D" + Math.floor(i + 10)).value(student_list[i].last_name).style("border", true);
                    workbook.sheet(0).cell("E" + Math.floor(i + 10)).value('').style("border", true);
                    workbook.sheet(0).cell("F" + Math.floor(i + 10)).value('').style("border", true);
                    workbook.sheet(0).cell("G" + Math.floor(i + 10)).value('').style("border", true);
                    workbook.sheet(0).cell("H" + Math.floor(i + 10)).value('').style("border", true);
                    workbook.sheet(0).cell("I" + Math.floor(i + 10)).value('').style("border", true);
                }

                workbook.sheet(0).cell("A" + Math.floor(student_list.length + 12)).value('Giảng viên: ...................................');
                workbook.sheet(0).cell("A" + Math.floor(student_list.length + 13)).value('Ngày: ................................');

                workbook.sheet(0).range("A3:I3").merged(true);

                const range = workbook.sheet(0).range("A1:I"+Math.floor(student_list.length+13));
                return workbook.outputAsync()
                    .then(function (blob) {
                        zip.file(class_has_course.code + ' - ' + class_has_course.name + ' - ' + class_has_course.class_name + ".xlsx", blob);
                        callback();
                    });
            });
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                zip.generateAsync({ type: "blob" })
                .then(function(content) {
                    FileSaver.saveAs(content, "examinees.zip");
                });  
            }
        });
    }

    public writeAttendanceSummary(student_lists: any, class_has_courses: any) {
        var zip = new JSZip();
        Async.eachOf(student_lists, function(student_list,index,callback){
            var class_has_course = class_has_courses[index];
            XlsxPopulate.fromBlankAsync()
            .then(workbook => {
                workbook.sheet(0).cell("A1").value('Danh Sách Sinh Viên Môn ' + class_has_course.code + ' - ' + class_has_course.name);
                workbook.sheet(0).cell("A2").value("Học kỳ: " + class_has_course.semester);
                workbook.sheet(0).cell("A3").value('Giảng viên: ' + class_has_course.lecturers);
                
                workbook.sheet(0).cell("A5").value("STT").style("border", true);
                workbook.sheet(0).cell("B5").value("MSSV").style("border", true);
                workbook.sheet(0).cell("C5").value("Họ SV").style("border", true);
                workbook.sheet(0).cell("D5").value("Tên SV").style("border", true);
                workbook.sheet(0).cell("E5").value("Số buổi vắng").style("border", true);
                workbook.sheet(0).cell("F5").value("Số % buổi vắng").style("border", true);

                for (var i = 0; i < student_list.length; i++) {
                    workbook.sheet(0).cell("A" + Math.floor(i + 6)).value(i + 1).style("border", true);
                    workbook.sheet(0).cell("B" + Math.floor(i + 6)).value(student_list[i].student_code).style("border", true);
                    workbook.sheet(0).cell("C" + Math.floor(i + 6)).value(student_list[i].first_name).style("border", true);
                    workbook.sheet(0).cell("D" + Math.floor(i + 6)).value(student_list[i].last_name).style("border", true);
                    if(student_list[i].exemption){
                        workbook.sheet(0).cell("E" + Math.floor(i + 6)).value('Miễn điểm danh').style("border", true).style("fontColor",'ff0000');
                        workbook.sheet(0).range("E" + Math.floor(i + 6) + ":" + "F" + Math.floor(i + 6)).merged(true);
                    }else{
                        if(student_list[i].absent_percentage > 30){
                            workbook.sheet(0).cell("E" + Math.floor(i + 6)).value(student_list[i].absent_count).style("border", true).style("fontColor",'ff0000');
                            workbook.sheet(0).cell("F" + Math.floor(i + 6)).value(student_list[i].absent_percentage + '%').style("border", true).style("fontColor",'ff0000');
                        }
                        else{
                            workbook.sheet(0).cell("E" + Math.floor(i + 6)).value(student_list[i].absent_count).style("border", true);
                            workbook.sheet(0).cell("F" + Math.floor(i + 6)).value(student_list[i].absent_percentage + '%').style("border", true);
                        }
                    }
                }

                const range = workbook.sheet(0).range("A1:G"+Math.floor(student_list.length+6));
                return workbook.outputAsync()
                    .then(function (blob) {
                        zip.file(class_has_course.code + ' - ' + class_has_course.name + ' - ' + class_has_course.class_name + ".xlsx", blob);
                        callback();
                    });
            });
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                zip.generateAsync({ type: "blob" })
                .then(function(content) {
                    FileSaver.saveAs(content, "attendance_summary.zip");
                });  
            }
        });
    }

    public readTeacherListFile(file: any): Observable < { result: string, teacher_list: Array < any > , message: string } > {
        return new Observable < any > ((observer) => {
                XlsxPopulate.fromDataAsync(file)
                .then(workbook => {
                    observer.next(workbook.sheet(0));
                });
            }).map((sheet: any) => {
                var cells = sheet.usedRange().value();
                var import_start = 0;
                var teacher_list = [];
                for(var i = 0 ; i < cells.length; i++){
                    if(cells[i][0] == 'STT'){
                        import_start = i+1;
                        break;
                    }
                }
                for(var i = import_start; i < cells.length; i++){
                    var teacher = {
                        stt : cells[i][0],
                        first_name : cells[i][1],
                        last_name : cells[i][2],
                        phone : cells[i][3],
                        email: cells[i][4]
                    }
                    teacher_list.push(teacher);
                }
                return { result: 'success', message: 'success', teacher_list : teacher_list};
            }).catch((error: any) => Observable.of({ result: 'failure', message: error }));
    }

    public writeTeacherSearchList(teacher_list: any, file_name: string) {
        XlsxPopulate.fromBlankAsync()
            .then(workbook => {
                workbook.sheet(0).cell("A1").value("STT").style("border", true);
                workbook.sheet(0).cell("B1").value("Họ").style("border", true);
                workbook.sheet(0).cell("C1").value("Tên").style("border", true);
                workbook.sheet(0).cell("D1").value("SĐT").style("border", true);
                workbook.sheet(0).cell("E1").value("Email").style("border", true);
                for (var i = 0; i < teacher_list.length; i++) {
                    workbook.sheet(0).cell("A" + Math.floor(i + 2)).value(i + 2).style("border", true);
                    workbook.sheet(0).cell("B" + Math.floor(i + 2)).value(teacher_list[i].first_name).style("border", true);
                    workbook.sheet(0).cell("C" + Math.floor(i + 2)).value(teacher_list[i].last_name).style("border", true);
                    workbook.sheet(0).cell("D" + Math.floor(i + 2)).value(teacher_list[i].phone).style("border", true);
                    workbook.sheet(0).cell("E" + Math.floor(i + 2)).value(teacher_list[i].email).style("border", true);
                }
                const range = workbook.sheet(0).range("A1:E"+Math.floor(teacher_list.length+1));
                return workbook.outputAsync()
                    .then(function (blob) {
                        if (file_name == '') file_name = 'teachers';
                        FileSaver.saveAs(blob, file_name + ".xlsx");
                    });
            });
    }

    public readCourseListFile(file: any): Observable < { result: string, course_list: Array < any > , message: string } > {
        return new Observable < any > ((observer) => {
            XlsxPopulate.fromDataAsync(file)
            .then(workbook => {
                observer.next(workbook.sheet(0));
            });
        }).map((sheet: any) => {
            var cells = sheet.usedRange().value();
            var import_start = 0;
            var course_list = [];
            for(var i = 0 ; i < cells.length; i++){
                if(cells[i][0] == 'STT'){
                    import_start = i+1;
                    break;
                }
            }
            for(var i = import_start; i < cells.length; i++){
                var course = {
                    stt : cells[i][0],
                    code : cells[i][1],
                    name : cells[i][2],
                    lecturers : cells[i][3],
                    TAs : cells[i][4],
                    office_hour : cells[i][5],
                    note : cells[i][6],
                }
                course_list.push(course);
            }
            return { result: 'success', message: 'success', course_list : course_list};
        }).catch((error: any) => Observable.of({ result: 'failure', message: error }));
    }

    public writeCourseSearchList(course_list: any, file_name: string) {
        XlsxPopulate.fromBlankAsync()
        .then(workbook => {
            workbook.sheet(0).cell("A1").value("STT").style("border", true).style("horizontalAlignment", "center");
            workbook.sheet(0).cell("B1").value("Mã môn").style("border", true).style("horizontalAlignment", "center");
            workbook.sheet(0).cell("C1").value("Tên môn").style("border", true).style("horizontalAlignment", "center");
            workbook.sheet(0).cell("D1").value("GV Lý Thuyết").style("border", true).style("horizontalAlignment", "center");
            workbook.sheet(0).cell("E1").value("Trợ giảng").style("border", true).style("horizontalAlignment", "center");
            workbook.sheet(0).cell("F1").value("Office hour").style("border", true).style("horizontalAlignment", "center");
            workbook.sheet(0).cell("G1").value("Ghi chú").style("border", true).style("horizontalAlignment", "center");

            for (var i = 0; i < course_list.length; i++) {
                workbook.sheet(0).cell("A" + Math.floor(i + 2)).value(i + 1).style("border", true);
                workbook.sheet(0).cell("B" + Math.floor(i + 2)).value(course_list[i].code).style("border", true);
                workbook.sheet(0).cell("C" + Math.floor(i + 2)).value(course_list[i].name).style("border", true);
                workbook.sheet(0).cell("D" + Math.floor(i + 2)).value(course_list[i].lecturers).style("border", true);
                workbook.sheet(0).cell("E" + Math.floor(i + 2)).value(course_list[i].tas).style("border", true);
                workbook.sheet(0).cell("F" + Math.floor(i + 2)).value(course_list[i].office_hour).style("border", true);
                workbook.sheet(0).cell("G" + Math.floor(i + 2)).value(course_list[i].note).style("border", true);
            }
            const range = workbook.sheet(0).range("A1:G"+Math.floor(course_list.length+4));
            return workbook.outputAsync()
                .then(function (blob) {
                    if (file_name == '') file_name = 'courses';
                    FileSaver.saveAs(blob, file_name + ".xlsx");
                });
        });
    }

    public writeCourseLists(course_lists: any) {
        var zip = new JSZip();
        Async.each(course_lists, function(course_list,callback){
             XlsxPopulate.fromBlankAsync()
            .then(workbook => {
                workbook.sheet(0).cell("A1").value("STT").style("border", true).style("horizontalAlignment", "center");
                workbook.sheet(0).cell("B1").value("Mã Môn").style("border", true).style("horizontalAlignment", "center");
                workbook.sheet(0).cell("C1").value("Tên Môn").style("border", true).style("horizontalAlignment", "center");
                workbook.sheet(0).cell("D1").value("GV Lý Thuyết").style("border", true).style("horizontalAlignment", "center");
                workbook.sheet(0).cell("E1").value("Trợ Giảng").style("border", true).style("horizontalAlignment", "center");
                workbook.sheet(0).cell("F1").value("Office hour").style("border", true).style("horizontalAlignment", "center");
                workbook.sheet(0).cell("G1").value("Ghi chú").style("border", true).style("horizontalAlignment", "center");

                for (var i = 0; i < course_list.length; i++) {
                    workbook.sheet(0).cell("A" + Math.floor(i + 2)).value(i + 1).style("border", true);
                    workbook.sheet(0).cell("B" + Math.floor(i + 2)).value(course_list[i].code).style("border", true);
                    workbook.sheet(0).cell("C" + Math.floor(i + 2)).value(course_list[i].name).style("border", true);
                    workbook.sheet(0).cell("D" + Math.floor(i + 2)).value(course_list[i].lecturers).style("border", true);
                    workbook.sheet(0).cell("E" + Math.floor(i + 2)).value(course_list[i].tas).style("border", true);
                    workbook.sheet(0).cell("F" + Math.floor(i + 2)).value(course_list[i].office_hour).style("border", true);
                    workbook.sheet(0).cell("G" + Math.floor(i + 2)).value(course_list[i].note).style("border", true);
                }
                const range = workbook.sheet(0).range("A1:G"+Math.floor(course_list.length+4));
                return workbook.outputAsync()
                    .then(function (blob) {
                        zip.file(course_list[0].class_name + ".xlsx", blob);
                        callback();
                    });
            });
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                zip.generateAsync({ type: "blob" })
                .then(function(content) {
                    FileSaver.saveAs(content, "courses.zip");
                });  
            }
        });
    }

    public readScheduleFile(file: any): Observable < { result: string, schedule: any, message: string } > {
        return new Observable < any > ((observer) => {
            XlsxPopulate.fromDataAsync(file)
            .then(workbook => {
                observer.next(workbook.sheet(0));
            });
        }).map((sheet: any) => {
            var cells = sheet.usedRange().value();
            var import_start = 0;
            var schedule = {};
            schedule['course_list'] = [];
            schedule['program'] = file['name'].split('.')[0];
            for(var i = 0 ; i < cells.length; i++){
                if(cells[i][0] == 'STT'){
                    import_start = i+1;
                    break;
                }
            }
            for(var i = import_start; i < cells.length; i++){
                if(cells[i][0] == undefined){
                    break;
                }
                if(cells[i][1] == undefined || cells[i][1] == ''){
                    return { result: 'failure', message: "Course's code is missing in line " + i};
                }
                if(cells[i][2] == undefined || cells[i][2] == ''){
                    return { result: 'failure', message: "Course's name is missing in line " + i};
                }
                if(cells[i][3] == undefined || cells[i][3] == ''){
                    return { result: 'failure', message: 'Class is missing in line ' + i};
                }
                if(cells[i][4] == undefined || cells[i][4] == ''){
                    return { result: 'failure', message: 'Lecturers is missing in line ' + i};
                }
                var course = {
                    stt : cells[i][0],
                    code : cells[i][1],
                    name : cells[i][2],
                    class_name : cells[i][3],
                    lecturers : cells[i][4],
                    TAs : cells[i][5] != undefined ? cells[i][5] : '',
                    office_hour : cells[i][6] != undefined ? cells[i][6] : '',
                    note : cells[i][7] != undefined ? cells[i][7] : '',
                    schedules : ''
                }
                schedule['course_list'].push(course);
            }

            for(var i = 4 ; i < 8; i++){
                for(var j = 1; j < 7; j++){
                    if(cells[i][j] == undefined){
                        continue;
                    }
                    var session = cells[i][j].split('\r\n');
                    for(var k = 0; k < session.length; k++){
                        for(var l = 0; l < schedule['course_list'].length; l++){
                            var session_array = session[k].split('-');
                            var code = session_array[0];
                            var class_name = session_array[1];
                            var new_session =  Math.floor((i - 4) + (j - 1) * 4) + '-' + session_array[2] + '-' + session_array[3];
                            if(schedule['course_list'][l].code == code && schedule['course_list'][l].class_name == class_name){
                                if(schedule['course_list'][l].schedules == '')
                                    schedule['course_list'][l].schedules = new_session;
                                else
                                    schedule['course_list'][l].schedules += ';' + new_session;
                            }
                        }
                    }
                }
            }
            console.log(schedule);
            return { result: 'success', message: 'success', schedule : schedule};
        }).catch((error: any) => Observable.of({ result: 'failure', message: error }));
    }

    public writeScheduleLists(schedules : any) {
        var zip = new JSZip();
        Async.each(schedules, function(schedule,callback){
             XlsxPopulate.fromBlankAsync()
            .then(workbook => {
                var sessions = ['','','','','','','','','','','','','','','', '','','','', '','','','','',];
                var group = [
                    {
                       color : 'ff0000',
                       class : ''
                    },{
                       color : '0000ff',
                       class : ''
                    },{
                       color : 'f4a460',
                       class : ''
                    },{
                       color : '00ff00',
                       class : ''
                    },{
                       color : 'ff69b4',
                       class : ''
                    }
                ];
                var time = ['(LT)7:30-9:10 \r\n (TH)7:30-9:30','(LT)9:30-11:10 \r\n (TH)9:30-11:30',
                        '(LT)13:30-15:10 \r\n (TH)13:30-15:30','(LT)15:30-17:10 \r\n (TH)15:30-17:30'];
                workbook.sheet(0).cell("A11").value("STT").style("border", true).style("bold",true);
                workbook.sheet(0).cell("B11").value("Mã môn").style("border", true).style("bold",true);
                workbook.sheet(0).cell("C11").value("Tên môn").style("border", true).style("bold",true);
                workbook.sheet(0).cell("D11").value("Lớp").style("border", true).style("bold",true);
                workbook.sheet(0).cell("E11").value("GV Lý Thuyết").style("border", true).style("bold",true);
                workbook.sheet(0).cell("F11").value("Trợ giảng").style("border", true).style("bold",true);
                workbook.sheet(0).cell("G11").value("Office hour").style("border", true).style("bold",true);
                workbook.sheet(0).cell("H11").value("Ghi chú").style("border", true).style("bold",true);

                for (var i = 0; i < schedule.course_list.length; i++) {
                    var color = '';
                    for(var j = 0 ; j < group.length ; j++){
                        if(group[j].class == ''){
                            color = group[j].color;
                            group[j].class = schedule.course_list[i].class_name;
                            break;
                        }else{
                            if(group[j].class == schedule.course_list[i].class_name){
                                color = group[j].color;
                                break;
                            }  
                        }
                    }

                    workbook.sheet(0).cell("A" + Math.floor(i + 12)).value(i + 1).style("border", true);
                    workbook.sheet(0).cell("B" + Math.floor(i + 12)).value(schedule.course_list[i].code).style("border", true).style("fontColor",color).style("bold",true);
                    workbook.sheet(0).cell("C" + Math.floor(i + 12)).value(schedule.course_list[i].name).style("border", true);
                    workbook.sheet(0).cell("D" + Math.floor(i + 12)).value(schedule.course_list[i].class_name).style("border", true);
                    workbook.sheet(0).cell("E" + Math.floor(i + 12)).value(schedule.course_list[i].lecturers).style("border", true);
                    workbook.sheet(0).cell("F" + Math.floor(i + 12)).value(schedule.course_list[i].tas).style("border", true);
                    workbook.sheet(0).cell("G" + Math.floor(i + 12)).value(schedule.course_list[i].office_hour).style("border", true);
                    workbook.sheet(0).cell("H" + Math.floor(i + 12)).value(schedule.course_list[i].note).style("border", true);
                    workbook.sheet(0).row(Math.floor(i + 12)).height(30);
                    var schedules = schedule.course_list[i].schedules.split(';');
                    for (var j = 0; j < schedules.length; j++) {
                        var temp = schedules[j].split('-');
                        var index = temp[0];
                        var room = temp[1];
                        var type = temp[2];
                        sessions[index] += schedule.course_list[i].code + '-' + schedule.course_list[i].class_name + '-' + room + '-' + type + '\r\n';
                    }
                }

                workbook.sheet(0).cell("A1").value("THỜI KHÓA BIỂU ");
                workbook.sheet(0).range("A3:G3").merged(true);
                workbook.sheet(0).column("A").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
                workbook.sheet(0).column("B").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
                workbook.sheet(0).column("C").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
                workbook.sheet(0).column("D").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
                workbook.sheet(0).column("E").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
                workbook.sheet(0).column("F").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
                workbook.sheet(0).column("G").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
                workbook.sheet(0).column("H").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
                workbook.sheet(0).cell("A4").value("").style("border", true);
                workbook.sheet(0).cell("B4").value("2").style("border", true);
                workbook.sheet(0).cell("C4").value("3").style("border", true);
                workbook.sheet(0).cell("D4").value("4").style("border", true);
                workbook.sheet(0).cell("E4").value("5").style("border", true);
                workbook.sheet(0).cell("F4").value("6").style("border", true);
                workbook.sheet(0).cell("G4").value("7").style("border", true);

                for(var i = 0 ; i < 4; i++){
                    workbook.sheet(0).cell("A" + Math.floor(i+5)).value(time[i]).style("border", true).style("fontColor","0000ff").style("bold",true);
                    workbook.sheet(0).cell("B" + Math.floor(i+5)).value(sessions[i]).style("border", true).style("bold",true);
                    workbook.sheet(0).cell("C" + Math.floor(i+5)).value(sessions[i + 4]).style("border", true).style("bold",true);
                    workbook.sheet(0).cell("D" + Math.floor(i+5)).value(sessions[i + 8]).style("border", true).style("bold",true);
                    workbook.sheet(0).cell("E" + Math.floor(i+5)).value(sessions[i + 12]).style("border", true).style("bold",true);
                    workbook.sheet(0).cell("F" + Math.floor(i+5)).value(sessions[i + 16]).style("border", true).style("bold",true);
                    workbook.sheet(0).cell("G" + Math.floor(i+5)).value(sessions[i + 20]).style("border", true).style("bold",true);
                    workbook.sheet(0).row(Math.floor(i + 5)).height(100);
                }
                const range = workbook.sheet(0).range("A1:H"+Math.floor(schedule.course_list.length+12));

                return workbook.outputAsync()
                    .then(function (blob) {
                        zip.file(schedule.file_name + ".xlsx", blob);
                        callback();
                    });
            });
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                zip.generateAsync({ type: "blob" })
                .then(function(content) {
                    FileSaver.saveAs(content, "schedules.zip");
                });  
            }
        });
    }

    public writeScheduleSearchList(course_list: any, semester: any, file_name: string) {
        XlsxPopulate.fromBlankAsync()
        .then(workbook => {
            var sessions = ['','','','','','','','','','','','','','','', '','','','', '','','','','',];
            var group = [
                {
                   color : 'ff0000',
                   class : ''
                },{
                   color : '0000ff',
                   class : ''
                },{
                   color : 'f4a460',
                   class : ''
                },{
                   color : '00ff00',
                   class : ''
                },{
                   color : 'ff69b4',
                   class : ''
                }
            ];
            var time = ['(LT)7:30-9:10 \r\n (TH)7:30-9:30','(LT)9:30-11:10 \r\n (TH)9:30-11:30',
                    '(LT)13:30-15:10 \r\n (TH)13:30-15:30','(LT)15:30-17:10 \r\n (TH)15:30-17:30'];
            workbook.sheet(0).cell("A11").value("STT").style("border", true).style("bold",true);
            workbook.sheet(0).cell("B11").value("Mã môn").style("border", true).style("bold",true);
            workbook.sheet(0).cell("C11").value("Tên môn").style("border", true).style("bold",true);
            workbook.sheet(0).cell("D11").value("Lớp").style("border", true).style("bold",true);
            workbook.sheet(0).cell("E11").value("GV Lý Thuyết").style("border", true).style("bold",true);
            workbook.sheet(0).cell("F11").value("Trợ giảng").style("border", true).style("bold",true);
            workbook.sheet(0).cell("G11").value("Office hour").style("border", true).style("bold",true);
            workbook.sheet(0).cell("H11").value("Ghi chú").style("border", true).style("bold",true);

            for (var i = 0; i < course_list.length; i++) {
                var color = '';
                for(var j = 0 ; j < group.length ; j++){
                    if(group[j].class == ''){
                        color = group[j].color;
                        group[j].class = course_list[i].class_name;
                        break;
                    }else{
                        if(group[j].class == course_list[i].class_name){
                            color = group[j].color;
                            break;
                        }  
                    }
                }

                workbook.sheet(0).cell("A" + Math.floor(i + 12)).value(i + 1).style("border", true);
                workbook.sheet(0).cell("B" + Math.floor(i + 12)).value(course_list[i].code).style("border", true).style("fontColor",color).style("bold",true);
                workbook.sheet(0).cell("C" + Math.floor(i + 12)).value(course_list[i].name).style("border", true);
                workbook.sheet(0).cell("D" + Math.floor(i + 12)).value(course_list[i].class_name).style("border", true);
                workbook.sheet(0).cell("E" + Math.floor(i + 12)).value(course_list[i].lecturers).style("border", true);
                workbook.sheet(0).cell("F" + Math.floor(i + 12)).value(course_list[i].tas).style("border", true);
                workbook.sheet(0).cell("G" + Math.floor(i + 12)).value(course_list[i].office_hour).style("border", true);
                workbook.sheet(0).cell("H" + Math.floor(i + 12)).value(course_list[i].note).style("border", true);
                workbook.sheet(0).row(Math.floor(i + 12)).height(30);
                var schedules = course_list[i].schedules.split(';');
                for (var j = 0; j < schedules.length; j++) {
                    var temp = schedules[j].split('-');
                    var index = temp[0];
                    var room = temp[1];
                    var type = temp[2];
                    sessions[index] += course_list[i].code + '-' + course_list[i].class_name + '-' + room + '-' + type + '\r\n';
                }
            }

            workbook.sheet(0).cell("A1").value("THỜI KHÓA BIỂU " + semester.name);
            workbook.sheet(0).range("A1:G1").merged(true);
            workbook.sheet(0).cell("A2").value("Thời gian học: " +  semester.start_date.toString('dd-MMM-yyyy') + ' - ' + semester.end_date.toString('dd-MMM-yyyy') );
            workbook.sheet(0).range("A2:G2").merged(true);
            workbook.sheet(0).cell("A3").value("Thời gian nghỉ: " + semester.vacation_time);
            workbook.sheet(0).range("A3:G3").merged(true);
            workbook.sheet(0).column("A").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
            workbook.sheet(0).column("B").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
            workbook.sheet(0).column("C").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
            workbook.sheet(0).column("D").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
            workbook.sheet(0).column("E").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
            workbook.sheet(0).column("F").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
            workbook.sheet(0).column("G").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
            workbook.sheet(0).column("H").width(30).style("horizontalAlignment", "center").style("verticalAlignment", "center").style("wrapText",true);
            workbook.sheet(0).cell("A4").value("").style("border", true);
            workbook.sheet(0).cell("B4").value("2").style("border", true);
            workbook.sheet(0).cell("C4").value("3").style("border", true);
            workbook.sheet(0).cell("D4").value("4").style("border", true);
            workbook.sheet(0).cell("E4").value("5").style("border", true);
            workbook.sheet(0).cell("F4").value("6").style("border", true);
            workbook.sheet(0).cell("G4").value("7").style("border", true);

            for(var i = 0 ; i < 4; i++){
                workbook.sheet(0).cell("A" + Math.floor(i+5)).value(time[i]).style("border", true).style("fontColor","0000ff").style("bold",true);
                workbook.sheet(0).cell("B" + Math.floor(i+5)).value(sessions[i]).style("border", true).style("bold",true);
                workbook.sheet(0).cell("C" + Math.floor(i+5)).value(sessions[i + 4]).style("border", true).style("bold",true);
                workbook.sheet(0).cell("D" + Math.floor(i+5)).value(sessions[i + 8]).style("border", true).style("bold",true);
                workbook.sheet(0).cell("E" + Math.floor(i+5)).value(sessions[i + 12]).style("border", true).style("bold",true);
                workbook.sheet(0).cell("F" + Math.floor(i+5)).value(sessions[i + 16]).style("border", true).style("bold",true);
                workbook.sheet(0).cell("G" + Math.floor(i+5)).value(sessions[i + 20]).style("border", true).style("bold",true);
                workbook.sheet(0).row(Math.floor(i + 5)).height(100);
            }
            const range = workbook.sheet(0).range("A1:H"+Math.floor(course_list.length+12));
            return workbook.outputAsync()
                .then(function (blob) {
                    console.log(5);
                    if (file_name == '') file_name = 'schedule';
                    FileSaver.saveAs(blob, file_name + ".xlsx");
                });
        });
    }

    public readAttendanceListFile(file: any) : Observable < { result: string, attendance_list: Array < any > , message: string } >{
        return new Observable < any > ((observer) => {
                XlsxPopulate.fromDataAsync(file)
                .then(workbook => {
                    observer.next(workbook.sheet(0));
                });
            }).map((sheet: any) => {
                var cells = sheet.usedRange().value();
                var import_start = 0;
                var attendance_list = [];
                for(var i = 0 ; i < cells.length; i++){
                    if(cells[i][0] == 'STT'){
                        import_start = i+1;
                        break;
                    }
                }
                for(var i = import_start; i < cells.length; i++){
                    var attendance = {
                        code : cells[i][1],
                        name : cells[i][2],
                        attendance_details : []
                    }
                    for(var j = 3; j < cells[i].length; j++){
                        var type = this.appService.attendance_type.absent;
                        var icon = '';
                        var method = 'Absent';
                        if(cells[i][j] != undefined){
                            switch (cells[i][j]) {
                                case 'X':
                                    type = this.appService.attendance_type.checklist;
                                    icon = 'fa-check';
                                    method = 'Checklist';
                                    break;
                                case 'P':
                                    icon = 'fa-envelope-square';
                                    method = 'Permited Absent';
                                    type = this.appService.attendance_type.permited_absent;
                                    break;
                            }
                        }
                        attendance.attendance_details.push({
                            attendance_type : type,
                            method : method,
                            icon : icon
                        });
                    }
                    attendance_list.push(attendance);
                }
                return { result: 'success', message: 'success', attendance_list : attendance_list};
            }).catch((error: any) => Observable.of({ result: 'failure', message: error }));
    }
    public writeAttendanceList(attendance_list : any,file_name: string,lecturers: string) {
        XlsxPopulate.fromBlankAsync()
            .then(workbook => {
                workbook.sheet(0).cell("A1").value("Danh sách điểm danh " + file_name).style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).range("A1:X1").merged(true);
                workbook.sheet(0).cell("A2").value("GV : " + lecturers).style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).range("A2:X2").merged(true);

                workbook.sheet(0).cell("A4").value("STT").style("border", true).style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("B4").value("MSSV").style("border", true).style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("C4").value("Họ Tên").style("border", true).style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).column("C").width(30);
                workbook.sheet(0).cell("D4").value("Tuần 1").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("F4").value("Tuần 2").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("H4").value("Tuần 3").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("J4").value("Tuần 4").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("L4").value("Tuần 5").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("N4").value("Tuần 6").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("P4").value("Tuần 7").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("R4").value("Tuần 8").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("T4").value("Tuần 9").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("V4").value("Tuần 10").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("X4").value("Tuần 11").style("horizontalAlignment", "center").style("bold",true);
                var cell = ['D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y'];
                for (var i = 0; i < attendance_list.length; i++) {
                    workbook.sheet(0).cell("A" + Math.floor(i + 5)).value(i + 1).style("border", true);
                    workbook.sheet(0).cell("B" + Math.floor(i + 5)).value(attendance_list[i].code).style("border", true);
                    workbook.sheet(0).cell("C" + Math.floor(i + 5)).value(attendance_list[i].name).style("border", true);
                    var j = 0;
                    for(j = 0 ; j < attendance_list[i].attendance_details.length; j++){
                        var value;
                        switch (attendance_list[i].attendance_details[j].attendance_type) {
                            case this.appService.attendance_type.checklist:
                            case this.appService.attendance_type.quiz:
                            case this.appService.attendance_type.qr:
                                workbook.sheet(0).cell(cell[j] + Math.floor(i + 5)).value('X').style("border", true).style("bold",true);
                                break;
                            case this.appService.attendance_type.permited_absent:
                                workbook.sheet(0).cell(cell[j] + Math.floor(i + 5)).value('P').style("border", true).style("bold",true);
                                break;
                            case this.appService.attendance_type.absent:
                                workbook.sheet(0).cell(cell[j] + Math.floor(i + 5)).value('A').style("border", true).style("fontColor",'ff0000').style("bold",true);
                                break;
                        }
                    }
                    for(;j < 22; j++){
                        workbook.sheet(0).cell(cell[j] + Math.floor(i + 5)).value('').style("border", true);
                    }
                }
                workbook.sheet(0).range("D4:E4").merged(true).style("border", true);
                workbook.sheet(0).range("F4:G4").merged(true).style("border", true);
                workbook.sheet(0).range("H4:I4").merged(true).style("border", true);
                workbook.sheet(0).range("J4:K4").merged(true).style("border", true);
                workbook.sheet(0).range("L4:M4").merged(true).style("border", true);
                workbook.sheet(0).range("N4:O4").merged(true).style("border", true);
                workbook.sheet(0).range("P4:Q4").merged(true).style("border", true);
                workbook.sheet(0).range("R4:S4").merged(true).style("border", true);
                workbook.sheet(0).range("T4:U4").merged(true).style("border", true);
                workbook.sheet(0).range("V4:W4").merged(true).style("border", true);
                workbook.sheet(0).range("X4:Y4").merged(true).style("border", true);
                const range = workbook.sheet(0).range("A1:Y"+Math.floor(attendance_list.length+5));
                return workbook.outputAsync()
                    .then(function (blob) {
                        if (file_name == '') file_name = 'attendance_list';
                        FileSaver.saveAs(blob, file_name + ".xlsx");
                    });
            });
    }
    public writeAttendanceLists(attendance_lists : any, class_has_courses: any) {
        var zip = new JSZip();
        Async.eachOf(attendance_lists, function(student_list,index,callback){
            var class_has_course = class_has_courses[index];
            XlsxPopulate.fromBlankAsync()
            .then(workbook => {
                workbook.sheet(0).cell("A1").value('Danh Sách Điểm Danh Môn ' + class_has_course.code + ' - ' + class_has_course.name).style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).range("A1:L1").merged(true);
                workbook.sheet(0).cell("A2").value("Học kỳ: " + class_has_course.semester);
                workbook.sheet(0).range("A2:L2").merged(true);
                workbook.sheet(0).cell("A3").value('Giảng viên: ' + class_has_course.lecturers);
                workbook.sheet(0).range("A3:L3").merged(true);
                
                workbook.sheet(0).cell("A5").value("STT").style("border", true).style("bold",true);
                workbook.sheet(0).cell("B5").value("MSSV").style("border", true).style("bold",true);
                workbook.sheet(0).cell("C5").value("Họ Tên").style("border", true).style("bold",true);
                workbook.sheet(0).column("C").width(30);
                workbook.sheet(0).cell("D5").value("Tuần 1").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("F5").value("Tuần 2").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("H5").value("Tuần 3").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("J5").value("Tuần 4").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("L5").value("Tuần 5").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("N5").value("Tuần 6").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("P5").value("Tuần 7").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("R5").value("Tuần 8").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("T5").value("Tuần 9").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("V5").value("Tuần 10").style("horizontalAlignment", "center").style("bold",true);
                workbook.sheet(0).cell("X5").value("Tuần 11").style("horizontalAlignment", "center").style("bold",true);

                for (var i = 0; i < student_list.length; i++) {
                    workbook.sheet(0).cell("A" + Math.floor(i + 6)).value(i + 1).style("border", true);
                    workbook.sheet(0).cell("B" + Math.floor(i + 6)).value(student_list[i].student_code).style("border", true);
                    workbook.sheet(0).cell("C" + Math.floor(i + 6)).value(student_list[i].first_name + ' ' + student_list[i].last_name).style("border", true);
                    if(student_list[i].exemption){
                        workbook.sheet(0).cell("D" + Math.floor(i + 6)).value('Miễn điểm danh').style("border", true).style("fontColor",'ff0000').style("bold",true);
                        workbook.sheet(0).range("D" + Math.floor(i + 6) + ":" + "Y" + Math.floor(i + 6)).merged(true);
                    }else{     
                        var j = 0;
                        var cell = ['D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y'];
                        for(j = 0 ; j < student_list[i].attendance_details.length; j++){
                            if(student_list[i].attendance_details[j].attendance_type > 0){
                                workbook.sheet(0).cell(cell[j] + Math.floor(i + 6)).value('X').style("border", true).style("bold",true);
                            }else{
                                if(student_list[i].attendance_details[j].attendance_type == 0){
                                    workbook.sheet(0).cell(cell[j] + Math.floor(i + 6)).value('A').style("border", true).style("fontColor",'ff0000').style("bold",true);
                                }else{
                                    workbook.sheet(0).cell(cell[j] + Math.floor(i + 6)).value('P').style("border", true).style("bold",true);
                                }
                            }
                        }
                        for(;j < 22; j++){
                            workbook.sheet(0).cell(cell[j] + Math.floor(i + 6)).value('').style("border", true);
                        }
                    }
                }
                workbook.sheet(0).range("D5:E5").merged(true).style("border", true);
                workbook.sheet(0).range("F5:G5").merged(true).style("border", true);
                workbook.sheet(0).range("H5:I5").merged(true).style("border", true);
                workbook.sheet(0).range("J5:K5").merged(true).style("border", true);
                workbook.sheet(0).range("L5:M5").merged(true).style("border", true);
                workbook.sheet(0).range("N5:O5").merged(true).style("border", true);
                workbook.sheet(0).range("P5:Q5").merged(true).style("border", true);
                workbook.sheet(0).range("R5:S5").merged(true).style("border", true);
                workbook.sheet(0).range("T5:U5").merged(true).style("border", true);
                workbook.sheet(0).range("V5:W5").merged(true).style("border", true);
                workbook.sheet(0).range("X5:Y5").merged(true).style("border", true);
                const range = workbook.sheet(0).range("A1:Y"+Math.floor(student_list.length+6));
                return workbook.outputAsync()
                    .then(function (blob) {
                        zip.file(class_has_course.code + ' - ' + class_has_course.name + ' - ' + class_has_course.class_name + ".xlsx", blob);
                        callback();
                    });
            });
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                zip.generateAsync({ type: "blob" })
                .then(function(content) {
                    FileSaver.saveAs(content, "attendance_lists.zip");
                });  
            }
        });
    }

    public writeExceededAbsenceLimit(student_lists: any, class_has_courses: any) {
        var zip = new JSZip();
        Async.eachOf(student_lists, function(student_list,index,callback){
            var class_has_course = class_has_courses[index];
            XlsxPopulate.fromBlankAsync()
            .then(workbook => {
                workbook.sheet(0).cell("A1").value('Danh Sách Sinh Viên Vượt Quá Số Buổi Vắng Cho Phép Môn ' + class_has_course.code + ' - ' + class_has_course.name);
                workbook.sheet(0).cell("A2").value("Học kỳ: " + class_has_course.semester);
                workbook.sheet(0).cell("A3").value('Giảng viên: ' + class_has_course.lecturers);
                
                workbook.sheet(0).cell("A5").value("STT").style("border", true);
                workbook.sheet(0).cell("B5").value("MSSV").style("border", true);
                workbook.sheet(0).cell("C5").value("Họ SV").style("border", true);
                workbook.sheet(0).cell("D5").value("Tên SV").style("border", true);
                workbook.sheet(0).cell("E5").value("Số buổi vắng").style("border", true);
                workbook.sheet(0).cell("F5").value("Số % buổi vắng").style("border", true);

                for (var i = 0; i < student_list.length; i++) {
                    workbook.sheet(0).cell("A" + Math.floor(i + 6)).value(i + 1).style("border", true);
                    workbook.sheet(0).cell("B" + Math.floor(i + 6)).value(student_list[i].student_code).style("border", true);
                    workbook.sheet(0).cell("C" + Math.floor(i + 6)).value(student_list[i].first_name).style("border", true);
                    workbook.sheet(0).cell("D" + Math.floor(i + 6)).value(student_list[i].last_name).style("border", true);
                    if(student_list[i].exemption){
                        workbook.sheet(0).cell("E" + Math.floor(i + 6)).value('Miễn điểm danh').style("border", true).style("fontColor",'ff0000');
                        workbook.sheet(0).range("E" + Math.floor(i + 6) + ":" + "F" + Math.floor(i + 6)).merged(true);
                    }else{
                        if(student_list[i].absent_percentage > 30){
                            workbook.sheet(0).cell("E" + Math.floor(i + 6)).value(student_list[i].absent_count).style("border", true).style("fontColor",'ff0000');
                            workbook.sheet(0).cell("F" + Math.floor(i + 6)).value(student_list[i].absent_percentage + '%').style("border", true).style("fontColor",'ff0000');
                        }
                        else{
                            workbook.sheet(0).cell("E" + Math.floor(i + 6)).value(student_list[i].absent_count).style("border", true);
                            workbook.sheet(0).cell("F" + Math.floor(i + 6)).value(student_list[i].absent_percentage + '%').style("border", true);
                        }
                    }
                }

                const range = workbook.sheet(0).range("A1:G"+Math.floor(student_list.length+6));
                return workbook.outputAsync()
                    .then(function (blob) {
                        zip.file(class_has_course.code + ' - ' + class_has_course.name + ' - ' + class_has_course.class_name + ".xlsx", blob);
                        callback();
                    });
            });
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                zip.generateAsync({ type: "blob" })
                .then(function(content) {
                    FileSaver.saveAs(content, "exceeded_absence_limit.zip");
                });  
            }
        });
    }
}
