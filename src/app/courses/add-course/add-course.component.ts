import { Component, OnInit, Input,ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CourseService, TeacherService, AppService, ExcelService, EditScheduleModalComponent, ResultMessageModalComponent } from '../../shared/shared.module';
import { FileUploader } from "ng2-file-upload/ng2-file-upload";
declare var jQuery: any;


@Component({
    selector: 'add-course',
    templateUrl: './add-course.component.html'
})
export class AddCourseComponent implements OnInit {

    public constructor( public router: Router, public excelService: ExcelService, public appService: AppService,
        public courseService: CourseService, public teacherService: TeacherService) {

    }
    public apiResult: string;
    public apiResultMessage: string;
    @ViewChild(ResultMessageModalComponent)
    public resultMessageModal: ResultMessageModalComponent;

    public onChangeProgram() {
        this.filteredClasses = [{ id: 0, name: 'Choose class' }];
        for (var i = 0; i < this.classes.length; i++) {
            if (this.classes[i].program_id == this.selectedProgram) {
                this.filteredClasses.push(this.classes[i]);
            }
        }
        for (var i = 0; i < this.selectedClasses.length; i++) {
            this.selectedClasses[i].classId = this.filteredClasses[0].id;
        }
    }
    public ngOnInit(): void {
        this.teacherService.getListTeachers(this.searchText, 1, 9999)
            .subscribe(result => {
                this.teachers = result.teacher_list;
                this.filtered_teachers = this.teachers.slice();
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't teacher list", 'error'); });
        this.appService.getSemesterProgramClass().subscribe(results => {
            this.classes = results.classes;
            this.programs = results.programs;
            this.selectedProgram = this.programs[0].id;
            this.onChangeProgram();
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get semester_program_class", 'error'); });
    }

    public searchText: string = '';
    public teachers: Array < any > = [];
    public filtered_teachers: Array < any > = [];
    public selected_lecturers: Array < any > = [];
    public temp_lecturers: Array < any > = [];
    public selected_TAs: Array < any > = [];
    public temp_TAs: Array < any > = [];

    public code = '';
    public name = '';
    public note = '';
    public office_hour = '';

    public onCancelAddCourse() {
        this.router.navigate(['/courses/']);
    }

    public isContinue = false;
    public addCourse(){
        this.courseService.addCourse(this.code, this.name, this.selected_lecturers, this.selected_TAs, this.office_hour, this.note,
                this.selectedProgram, this.selectedClasses)
            .subscribe(result => {
                this.apiResult = result.result;
                this.apiResultMessage = result.message;
                if (this.apiResult == 'success') {
                    if (this.isContinue == false) {
                        this.apiResultMessage = result.message + '...Redirecting';
                        setTimeout(() => {
                            this.router.navigate(['/courses/']);
                        }, 3000);
                    } else {
                        this.apiResultMessage = result.message;
                    }
                }
                jQuery("#progressModal").modal("hide");
                //this.resultMessageModal.onOpenModal();
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
            }, error => {
                this.apiResult = 'failure';
                this.apiResultMessage = error;
                console.log(error);
                jQuery("#progressModal").modal("hide");
                //this.resultMessageModal.onOpenModal();
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
            });
    }
    public loopReadStudentFile(index: any){
        if(this.selectedClasses[index].addStudentFromFile == ''){
            if(index < this.selectedClasses.length-1){
                this.loopReadStudentFile(index+1);
            }else{
                this.addCourse();
                return;
            }
        }
        else{
            this.excelService.readStudentListFile(this.selectedClasses[index].addStudentFromFile).subscribe(result => {
                this.apiResult = result.result;
                if (this.apiResult == 'failure') {
                    this.apiResultMessage = result.message;
                    return;
                }
                if (this.apiResult == 'success') {
                    this.selectedClasses[index].studentListFromFile = result.student_list.slice();
                    if(index < this.selectedClasses.length-1){
                        this.loopReadStudentFile(index+1);
                    }else{
                        this.addCourse();
                        return;
                    }
                }
            }, error => {
                console.log(error);
            });
        }
    }
    public onAddCourse(isContinue: boolean = false) {
        jQuery("#progressModal").modal("show");
        this.isContinue = isContinue;
        this.loopReadStudentFile(0);
    }

    public searchList() {
        this.filtered_teachers = [];
        for (var i = 0; i < this.teachers.length; i++) {
            if (this.teachers[i].first_name.toLowerCase().indexOf(this.searchText.toLowerCase()) >= 0 || this.teachers[i].last_name.toLowerCase().indexOf(this.searchText.toLowerCase()) >= 0) {
                this.filtered_teachers.push(this.teachers[i]);
            }
        }
    }
    public onSelectLecturerClick(id: any) {
        for (var i = 0; i < this.teachers.length; i++) {
            if (this.teachers[i].id == id) {
                this.temp_lecturers.push(this.teachers[i]);
                this.teachers.splice(i, 1);
                this.searchList();
                break;
            }
        }
    }
    public onRemoveLecturerClick(id: any) {
        for (var i = 0; i < this.temp_lecturers.length; i++) {
            if (this.temp_lecturers[i].id == id) {
                this.teachers.push(this.temp_lecturers[i]);
                this.searchList();
                this.temp_lecturers.splice(i, 1);
                break;
            }
        }
    }
    public onOpenChooseLecturer() {
        this.temp_lecturers = [];
        this.temp_lecturers = this.selected_lecturers.slice();
        jQuery("#chooseLecturerModal").modal("show");
    }
    public onCancelChooseLecturer() {
        for (var i = 0; i < this.temp_lecturers.length; i++) {
            this.teachers.push(this.temp_lecturers[i]);
            this.searchList();
            this.temp_lecturers.splice(i, 1);
            break;
        }
        this.filtered_teachers = this.teachers.slice();
        this.temp_lecturers = [];
        jQuery("#chooseLecturerModal").modal("hide");
    }
    public onSaveChooseLecturer() {
        this.selected_lecturers = this.temp_lecturers.slice();
        this.temp_lecturers = [];
        this.filtered_teachers = this.teachers.slice();
        jQuery("#chooseLecturerModal").modal("hide");
    }


    public onSelectTAClick(id: any) {
        for (var i = 0; i < this.teachers.length; i++) {
            if (this.teachers[i].id == id) {
                this.temp_TAs.push(this.teachers[i]);
                this.teachers.splice(i, 1);
                this.searchList();
                break;
            }
        }
    }
    public onRemoveTAClick(id: any) {
        for (var i = 0; i < this.temp_TAs.length; i++) {
            if (this.temp_TAs[i].id == id) {
                this.teachers.push(this.temp_TAs[i]);
                this.searchList();
                this.temp_TAs.splice(i, 1);
                break;
            }
        }
    }
    public onOpenChooseTA() {
        this.temp_TAs = [];
        this.temp_TAs = this.selected_TAs.slice();
        jQuery("#chooseTAModal").modal("show");
    }
    public onCancelChooseTA() {
        this.temp_lecturers = [];
        for (var i = 0; i < this.temp_TAs.length; i++) {
            this.teachers.push(this.temp_TAs[i]);
            this.searchList();
            this.temp_TAs.splice(i, 1);
        }
        this.filtered_teachers = this.teachers.slice();
        jQuery("#chooseTAModal").modal("hide");
    }
    public onSaveChooseTA() {
        this.filtered_teachers = this.teachers.slice();
        this.selected_TAs = this.temp_TAs.slice();
        this.temp_TAs = [];
        jQuery("#chooseTAModal").modal("hide");
    }


    //Class
    public programs: Array < any > = [];
    public selectedProgram: any;
    public classes: Array < any > ;
    public filteredClasses: Array < any > ;
    public isAddStudentFromCLass: boolean = true;
    public isAddStudentFromFile: boolean = false;
    public selectedClasses: Array < any > = [{
        classId: 0,
        class_name: '',
        schedule: '',
        isAddStudentFromCLass: true,
        addStudentFromFile: '',
        studentListFromFile: [],
    }];
    public tempValue = [];
    public onSelectFile(index: number, file: any) {
        this.selectedClasses[index].addStudentFromFile = file;
    }
    public onRemoveFile(index: number) {
        this.selectedClasses[index].addStudentFromFile = '';
    }
    public onAddClass() {
        this.selectedClasses.push({
            classId: 0,
            class_name: '',
            schedule : '',
            isAddStudentFromCLass: false,
            addStudentFromFile: '',
            studentListFromFile: [],
        });
    }
    public onRemoveClass(index: number) {
        // remove class
        for (var i = index; i < this.selectedClasses.length - 1; i++) {
            this.selectedClasses[i].classId = this.selectedClasses[i + 1].classId;
            this.selectedClasses[i].class_name = this.selectedClasses[i + 1].class_name;
            this.selectedClasses[i].schedule = this.selectedClasses[i + 1].schedule;
            this.selectedClasses[i].isAddStudentFromCLass = this.selectedClasses[i + 1].isAddStudentFromCLass;
            this.selectedClasses[i].addStudentFromFile = this.selectedClasses[i + 1].addStudentFromFile;
        }
        this.selectedClasses.pop();
    }

    //Schedule
    @ViewChild(EditScheduleModalComponent)
    public editScheduleModal: EditScheduleModalComponent;

    public scheduleModal ={
        id : 'chooseScheduleModal',
        title : 'Add Schedule'
    }
    public onOpenChooseSchedule() {
        for(var i = 0 ; i < this.selectedClasses.length; i++){
            if(this.selectedClasses[i].classId == 0){
                this.apiResult = 'failure';
                this.apiResultMessage = 'Class is required';
                //this.resultMessageModal.onOpenModal();
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
                return;
            }
            for(var j = i + 1 ; j < this.selectedClasses.length; j++){
                if(this.selectedClasses[i].classId == this.selectedClasses[j].classId){
                    this.apiResult = 'failure';
                    this.apiResultMessage = 'Cannot select the same class';
                    //this.resultMessageModal.onOpenModal();
                    this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
                    return;
                }
            }
        }
        for(var i = 0 ; i < this.selectedClasses.length; i++){
            for(var j = 0 ; j < this.classes.length ; j++){
                if(this.selectedClasses[i].classId == this.classes[j].id){
                    this.selectedClasses[i].class_name = this.classes[j].name;
                    break;
                }
            }
        }
        this.editScheduleModal.onOpenModal();
    }
    public onSaveChooseSchedule(schedule : Array<string>) {
        for(var i = 0 ; i < schedule.length; i++){
            this.selectedClasses[i].schedule = schedule[i];
        }
    }
}
