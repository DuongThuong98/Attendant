import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TeacherService, ResultMessageModalComponent, AppService } from '../../shared/shared.module';
@Component({
    selector: 'teacher-detail',
    templateUrl: './teacher-detail.component.html'
})
export class TeacherDetailComponent implements OnInit {
    public teacher_id: number;
    public teaching_courses: Array < any > ;
    public teacher_not_found = false;
    public teacher = {
        id: 0,
        first_name: '',
        last_name: '',
        class_name: '',
        status: 0,
        email: '',
        phone: '',
        avatar: '',
    };
    public constructor(public  route: ActivatedRoute, public  router: Router, public  teacherService: TeacherService,public  appService:AppService) {
        this.route.params.subscribe(params => { this.teacher_id = params['id'] });
        this.teacherService.getTeacherDetail(this.teacher_id)
            .subscribe(result => {
                this.teacher = result.teacher;
                if(this.teacher == undefined || this.teacher == null){
                    this.teacher_not_found = true;
                    return;
                }
                this.teaching_courses = result.teaching_courses;
                this.editing_name = this.teacher.first_name + ' ' + this.teacher.last_name;
            }, err => { this.appService.showPNotify('failure', "Server Error! Can't teacher detail", 'error'); });
    }
    public ngOnInit(): void {
        
    }
    public onCellClick(id: any) {
        //this.appService.navigationData.current_teacher_id = id;
        this.router.navigate(['courses/',id]);
    }


    public apiResult: string;
    public apiResultMessage: string;
    @ViewChild(ResultMessageModalComponent)
    public  resultMessageModal: ResultMessageModalComponent;

    public isEditingTeacher = false;
    public editing_phone;
    public editing_mail;
    public editing_name;
    public onEditTeacher() {
        this.editing_name = this.teacher.first_name + ' ' + this.teacher.last_name;
        this.editing_mail = this.teacher.email;
        this.editing_phone = this.teacher.phone;
        this.isEditingTeacher = true;
    }
    public onCancelEditTeacher() {
        this.isEditingTeacher = false;
    }
    public onSaveEditTeacher() {
        this.teacherService.updateTeacher(this.teacher_id, this.editing_name, this.editing_mail, this.editing_phone,this.teacher.avatar)
            .subscribe(result => {
                this.apiResult = result.result;
                this.apiResultMessage = result.message;
                if (result.result == 'success') {
                    this.isEditingTeacher = false;
                    this.teacher.email = this.editing_mail;
                    this.teacher.phone = this.editing_phone;
                }
                //this.resultMessageModal.onOpenModal();
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't update teacher", 'error'); });
    }
}
