import { Component, OnInit } from '@angular/core';
import { ScheduleService, AppService, SemesterService } from '../../shared/shared.module';
import { Router, ActivatedRoute, Params } from '@angular/router';
@Component({
    selector: 'app-schedule-teacher',
    templateUrl: './schedule-teacher.component.html'
})
export class ScheduleTeacherComponent implements OnInit {

    public isCollapsed = false;
    public constructor(public  scheduleService: ScheduleService, public  appService: AppService, public  router: Router, public  semesterService: SemesterService) {}
    public sessions = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
    ];
    public semester = {};
    public courses: Array < any > = [];

    public semesters: Array < any > = [];
    public selectedSemester: any;


    public onChangeSemester() {
        this.getSchedulesAndCourses();
        this.getSemesterInfo();
    }
    public loadSchedules() {
        this.sessions = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        ];
        for (var i = 0; i < this.courses.length; i++) {
            var schedules = this.courses[i].schedules.split(';');
            for (var j = 0; j < schedules.length; j++) {
                var temp = schedules[j].split('-');
                var index = temp[0];
                var course = {
                    code: this.courses[i].code,
                    class_name: this.courses[i].class_name,
                    room: temp[1],
                    type: temp[2],
                    color_class: this.courses[i].color_class
                };
                this.sessions[index].push(course);
            }
        }
    }
    public getSchedulesAndCourses() {
        this.scheduleService.getSchedulesAndCoursesByTeacher(this.selectedSemester)
            .subscribe(result => {
                this.courses = result.courses;
                for (var i = 0; i < this.courses.length; i++) {
                    this.courses[i]['color_class'] = 'class_color_' + i;
                }
                this.loadSchedules();
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't schedules and courses by teacher", 'error'); });
    }
    public getSemesterInfo() {
        this.semesterService.getSemester(this.selectedSemester)
            .subscribe(result => {
                this.semester = result.semester;
            }, error => {this.appService.showPNotify('failure', "Server Error! Can't semester", 'error'); });
    }
    public ngOnInit() {
        this.appService.getSemesterProgramClass().subscribe(results => {
            this.semesters = results.semesters;
            this.selectedSemester = this.semesters.length > 0 ? this.semesters[this.semesters.length - 1].id : 0;
            this.getSemesterInfo();
            this.getSchedulesAndCourses();
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't semester program class", 'error'); });
    }
}
