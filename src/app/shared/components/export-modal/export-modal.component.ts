import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader } from "ng2-file-upload/ng2-file-upload";
import { CourseService,TeacherService ,StudentService, AppService,ExcelService,ScheduleService  } from '../../shared.module';
declare var jQuery :any;

@Component({
    selector: 'export-modal',
    templateUrl: './export-modal.component.html',
})
export class ExportModalComponent implements OnInit {
    @Input() public title: string;
    @Input() public note: string;
    @Input() public export_type: number;
    @Input() public search_data: any;
    public constructor(public excelService: ExcelService, public appService: AppService, public studentService: StudentService,
        public teacherService: TeacherService, public courseService: CourseService,public scheduleService:ScheduleService) {}
    public ngOnInit() {}
    public classes = [];
    public programs = [];
    public program_has_course = [];
    public export_on_search = 0;
    public export_list = [];
    public export_progress = 0;
    public isExporting = false;
    public select_all_class = 0;
    public select_all_program_has_course = [];
    public select_all_program = 0;
    public file_name = '';
    public larger_modal = false;

    public semesters: Array < any > = [];
    public selectedSemester;
    public onGetProgramHasCourse(){
        this.courseService.getProgramHasCourse(this.selectedSemester).subscribe(result => {
            this.program_has_course = result.program_has_course;
            for (var i = 0; i < this.program_has_course.length; i++) {
                for(var j = 0 ; j < this.program_has_course[i].courses.length; j++){
                    this.program_has_course[i].courses[j]['selected'] = false;
                }
                this.select_all_program_has_course.push(0);
            }
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get program_has_course", 'error'); });
    }

    public onOpenModal() {
        this.file_name = '';
        this.export_progress = 0;
        switch (this.export_type) {
            case this.appService.import_export_type.student:
            case this.appService.import_export_type.course:
            case this.appService.import_export_type.schedule:
                this.export_on_search = 1;
                this.appService.getSemesterProgramClass().subscribe(result => {
                    this.classes = result.classes;
                    for (var i = 0; i < this.classes.length; i++) {
                        this.classes[i]['selected'] = false;
                    }
                    this.programs = result.programs;
                    for (var i = 0; i < this.programs.length; i++) {
                        this.programs[i]['selected'] = false;
                    }
                }, error => { this.appService.showPNotify('failure', "Server Error! Can't semester class program", 'error'); });
                break;
            case this.appService.import_export_type.teacher:
                this.export_on_search = 1;
                break;
            case this.appService.import_export_type.examinees:
            case this.appService.import_export_type.attendance_summary:
            case this.appService.import_export_type.attendance_lists:
            case this.appService.import_export_type.exceeded_absence_limit:
                this.export_on_search = 0;
                this.larger_modal = true;
                this.appService.getSemesterProgramClass().subscribe(results => {
                    this.semesters = results.semesters;
                    this.selectedSemester = this.semesters.length > 0 ? this.semesters[this.semesters.length - 1].id : 0;
                    this.onGetProgramHasCourse();
                }, error => { this.appService.showPNotify('failure', "Server Error! Can't get semester_program_class", 'error'); });
                break;
            default:
                // code...
                break;
        }
        jQuery("#exportModal").modal({ backdrop: 'static', keyboard: false });
    }
    public onSelectAllClass() {
        for (var i = 0; i < this.classes.length; i++) {
            this.classes[i]['selected'] = this.select_all_class;
        }
    }
    public onSelectAllProgram() {
        for (var i = 0; i < this.programs.length; i++) {
            this.programs[i]['selected'] = this.select_all_program;
        }
    }
    public onSelectAllProgramHasCourse(index) {
        for(var j = 0 ; j < this.program_has_course[index].courses.length; j++){
            this.program_has_course[index].courses[j]['selected'] = this.select_all_program_has_course[index];
        }
    }

    public onCancelExport() {
        this.isExporting = false;
        jQuery("#exportModal").modal("hide");
    }
    public onExport() {
        switch (this.export_type) {
            case this.appService.import_export_type.student:
                this.exportStudent();
                break;
            case this.appService.import_export_type.teacher:
                this.exportTeacher();
                break;
            case this.appService.import_export_type.course:
                this.exportCourse();
                break;
            case this.appService.import_export_type.schedule:
                this.exportSchedule();
                break;
            case this.appService.import_export_type.examinees:
                this.exportExaminees();
                break;
            case this.appService.import_export_type.attendance_summary:
                this.exportAttendanceSummary();
                break;
            case this.appService.import_export_type.attendance_lists:
                this.exportAttendanceLists();
                break;
            case this.appService.import_export_type.exceeded_absence_limit:
                this.exportExceededAbsenceLimit();
                break;
            default:
                // code...
                break;
        }
    }
    public onStopExport() {
        
    }

    public exportStudent(){
        if (!this.export_on_search) {
            var selected_classes = [];
            var selected_classes_name = [];
            for (var i = 0; i < this.classes.length; i++) {
                if (this.classes[i].selected) {
                    selected_classes.push(this.classes[i].id);
                    selected_classes_name.push(this.classes[i].name);
                }
            }
            if (selected_classes.length == 0) {
                this.isExporting = false;
            } else {
                this.studentService.exportStudent(selected_classes).subscribe(result => {
                    var student_lists = result.student_lists;
                    this.excelService.writeStudentLists(student_lists,selected_classes_name);
                    this.isExporting = false;
                }, error => { this.appService.showPNotify('failure', "Server Error! Can't get student list", 'error') });
            }
        } else {
            this.studentService.getListStudents(this.search_data['program_id'], this.search_data['class_id'], this.search_data['status'], this.search_data['search_text'], 1, -1).subscribe(result => {
                var student_list = result.student_list;
                this.excelService.writeStudentSearchList(student_list, this.file_name);
                this.isExporting = false;
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get student list", 'error') });
        }
    }
    public exportTeacher(){
        this.teacherService.getListTeachers(this.search_data['search_text'], 1, -1,this.search_data['sort_tag']).subscribe(result => {
            var teacher_list = result.teacher_list;
            this.excelService.writeTeacherSearchList(teacher_list, this.file_name);
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get teacher list", 'error') });
    }
    public exportCourse(){
        if (!this.export_on_search) {
            var selected_classes = [];
            for (var i = 0; i < this.classes.length; i++) {
                if (this.classes[i].selected) {
                    selected_classes.push(this.classes[i].id);
                }
            }
            if (selected_classes.length == 0) {
                return;
            } else {
                this.courseService.exportCourse(selected_classes).subscribe(result => {
                    var course_lists = result.course_lists;
                    this.excelService.writeCourseLists(course_lists);
                }, error => { this.appService.showPNotify('failure', "Server Error! Can't get course lists", 'error') });
            }
        } else {
            this.courseService.getCourseLists(this.search_data['program_id'],this.search_data['class_id'],this.search_data['semester_id'],
                this.search_data['search_text']).subscribe(result => {
                var course_list = result.courses;
                this.excelService.writeCourseSearchList(course_list, this.file_name);
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get course list", 'error') });
        }
    }
    public exportSchedule(){
        if (!this.export_on_search) {
            var selected_classes = [];
            var selected_programs = [];
            for (var i = 0; i < this.classes.length; i++) {
                if (this.classes[i].selected) {
                    selected_classes.push(this.classes[i].id);
                }
            }
            for (var i = 0; i < this.programs.length; i++) {
                if (this.programs[i].selected) {
                    selected_programs.push(this.programs[i].id);
                }
            }
            if (selected_classes.length == 0 && selected_programs.length == 0) {
                return;
            } else {
                this.scheduleService.exportSchedule(selected_programs,selected_classes)
                .subscribe(result => {
                    var schedules = result.schedules;
                    this.excelService.writeScheduleLists(schedules);
                }, error => { this.appService.showPNotify('failure', "Server Error! Can't get schedules", 'error'); });
            }
        } else {
            this.scheduleService.getSchedulesAndCourses(this.search_data['program_id'],this.search_data['class_id'],this.search_data['semester_id'])
            .subscribe(result => {
                var courses = result.courses;
                this.excelService.writeScheduleSearchList(courses, this.search_data['semester'], this.file_name);
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get schedule and courses", 'error'); });
        }
    }
    public exportExaminees(){
        var selected_class_has_course_id = [];
        var selected_class_has_course = [];
        for(var i = 0 ; i < this.program_has_course.length; i++){
            for(var j = 0 ; j < this.program_has_course[i].courses.length; j++){
                if (this.program_has_course[i].courses[j].selected) {
                    selected_class_has_course_id.push(this.program_has_course[i].courses[j].id);
                    this.program_has_course[i].courses[j]['program'] = this.program_has_course[i].name;
                    selected_class_has_course.push(this.program_has_course[i].courses[j]);
                }
            }
        }
        if (selected_class_has_course_id.length == 0) {
            return;
        } else {
            this.studentService.exportExaminees(selected_class_has_course_id).subscribe(result => {
                var examinees_lists = result.examinees_lists;
                this.excelService.writeExamineesLists(examinees_lists,selected_class_has_course);
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get examinees lists", 'error') });
        }
    }
    public exportAttendanceSummary(){
        var selected_class_has_course_id = [];
        var selected_class_has_course = [];
        for(var i = 0 ; i < this.program_has_course.length; i++){
            for(var j = 0 ; j < this.program_has_course[i].courses.length; j++){
                if (this.program_has_course[i].courses[j].selected) {
                    selected_class_has_course_id.push(this.program_has_course[i].courses[j].id);
                    selected_class_has_course.push(this.program_has_course[i].courses[j]);
                }
            }
        }
        if (selected_class_has_course_id.length == 0) {
            return;
        } else {
            this.studentService.exportAttendanceSummary(selected_class_has_course_id).subscribe(result => {
                var attendance_summary_lists = result.attendance_summary_lists;
                this.excelService.writeAttendanceSummary(attendance_summary_lists, selected_class_has_course);
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get attendance summary", 'error') });
        }
    }
    public exportAttendanceLists(){
        var selected_class_has_course_id = [];
        var selected_class_has_course = [];
        for(var i = 0 ; i < this.program_has_course.length; i++){
            for(var j = 0 ; j < this.program_has_course[i].courses.length; j++){
                if (this.program_has_course[i].courses[j].selected) {
                    selected_class_has_course_id.push(this.program_has_course[i].courses[j].id);
                    selected_class_has_course.push(this.program_has_course[i].courses[j]);
                }
            }
        }
        if (selected_class_has_course_id.length == 0) {
            return;
        } else {
            this.studentService.exportAttendanceLists(selected_class_has_course_id).subscribe(result => {
                var attendance_lists = result.attendance_lists;
                this.excelService.writeAttendanceLists(attendance_lists, selected_class_has_course);
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get attendance lists", 'error') });
        }
    }

    public exportExceededAbsenceLimit(){
        var selected_class_has_course_id = [];
        var selected_class_has_course = [];
        for(var i = 0 ; i < this.program_has_course.length; i++){
            for(var j = 0 ; j < this.program_has_course[i].courses.length; j++){
                if (this.program_has_course[i].courses[j].selected) {
                    selected_class_has_course_id.push(this.program_has_course[i].courses[j].id);
                    selected_class_has_course.push(this.program_has_course[i].courses[j]);
                }
            }
        }
        if (selected_class_has_course_id.length == 0) {
            return;
        } else {
            this.studentService.exportExceededAbsenceLimit(selected_class_has_course_id).subscribe(result => {
                var attendance_summary_lists = result.exceeded_absence_limit;
                this.excelService.writeExceededAbsenceLimit(attendance_summary_lists, selected_class_has_course);
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get exceeded absence limit", 'error') });
        }
    }
}
