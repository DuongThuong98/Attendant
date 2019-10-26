import { Component, OnInit,ViewChild } from '@angular/core';
import { ScheduleService, AppService, SemesterService,ImportModalComponent,ExportModalComponent } from '../../shared/shared.module';
import { Router, ActivatedRoute, Params } from '@angular/router';
@Component({
    selector: 'app-schedule-staff',
    templateUrl: './schedule-staff.component.html'
})
export class ScheduleStaffComponent implements OnInit {
    constructor(public  scheduleService: ScheduleService, public  appService: AppService, public  router: Router, public  semesterService: SemesterService) {}
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
    public programs: Array < any > = [];
    public selectedProgram: any;
    public classes: Array < any > ;
    public filteredClasses: Array < any > ;
    public selectedClass: any;

    public onChangeProgram() {
        this.filteredClasses = [{ id: 0, name: 'All Classes' }];
        for (var i = 0; i < this.classes.length; i++) {
            if (this.classes[i].program_id == this.selectedProgram) {
                this.filteredClasses.push(this.classes[i]);
            }
        }
        this.selectedClass = this.filteredClasses[0].id;
        this.getSchedulesAndCourses();
    }
    public onChangeSemester() {
        this.getSchedulesAndCourses();
        this.getSemesterInfo();
    }
    public onChangeClass() {
        this.getSchedulesAndCourses();
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
                    color_class: this.courses[i].color_class + (temp[2] == 'TH' ? ' underline' : '')
                };
                this.sessions[index].push(course);
            }
        }
    }
    public getSchedulesAndCourses() {
        this.scheduleService.getSchedulesAndCourses(this.selectedProgram, this.selectedClass, this.selectedSemester)
            .subscribe(result => {
                if(result.result == 'success'){
                    this.courses = result.courses;
                    for (var i = 0; i < this.courses.length; i++) {
                        for (var j = 0; j < this.filteredClasses.length; j++) {
                            if (this.courses[i].class_name == this.filteredClasses[j].name) {
                                this.courses[i]['color_class'] = 'class_color_' + j;
                                break;
                            }
                        }
                    }
                    this.loadSchedules();
                }
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get schedule and courses", 'error'); });
    }
    public getSemesterInfo() {
        this.semesterService.getSemester(this.selectedSemester)
            .subscribe(result => {
                if(result.result == 'success'){
                    this.semester = result.semester;
                }
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get semester", 'error'); });
    }
    public ngOnInit() {
        this.appService.getSemesterProgramClass().subscribe(results => {
            this.semesters = results.semesters;
            this.selectedSemester = this.semesters.length > 0 ? this.semesters[this.semesters.length - 1].id : 0;
            this.getSemesterInfo();
            this.classes = results.classes;
            this.programs = results.programs;
            this.selectedProgram = this.programs.length > 0 ? this.programs[0].id : 0;
            this.onChangeProgram();
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get schedule program class", 'error'); });
    }
    public onCourseClick(course_id: number) {
        this.router.navigate(['/courses/', course_id]);
    }
    @ViewChild(ImportModalComponent)
    public  importModal: ImportModalComponent;
    public onImportSchedule(){
        this.importModal.onOpenModal();
    }
    public onCloseImport(event : any){
        this.getSchedulesAndCourses();
    }

    @ViewChild(ExportModalComponent)
    public  exportModal: ExportModalComponent;
    public export_search_data : any = {};
    public onExportSchedule(){
        this.export_search_data = {};
        this.export_search_data['program_id'] = this.selectedProgram;
        this.export_search_data['class_id'] = this.selectedClass;
        this.export_search_data['semester_id'] = this.selectedSemester;
        this.export_search_data['semester'] = this.semester;
        this.exportModal.onOpenModal();
    }
}
