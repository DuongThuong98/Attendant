import { Component, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { StudentService, AppService, AbsenceRequestService,ResultMessageModalComponent, AuthService } from '../../shared/shared.module';
declare var jQuery: any;
@Component({
    selector: 'students-detail',
    templateUrl: './student-detail.component.html'
})
export class StudentDetailComponent implements OnInit {

    public student_id: number;
    public student_not_found = false;
    public constructor(public  route: ActivatedRoute, public  router: Router, public  studentService: StudentService,public  authService: AuthService, public  appService: AppService, public  absenceRequestService: AbsenceRequestService) {

    }
    @ViewChild(ResultMessageModalComponent)
    public  resultMessageModal: ResultMessageModalComponent;
    public isEditingStudent = false;
    public student = {
        id: 0,
        first_name: '',
        last_name: '',
        class_name: '',
        class_id: 0,
        status: 0,
        email: '',
        phone: '',
        avatar: '',
        code: ''
    };
    public current_courses = [];
    public current_course_id = 0;
    public absence_requests = [];
    public ngOnInit(): void {
        this.route.params.subscribe(params => { this.student_id = params['id'] });
        //get Student from database
        this.getStudentrDetail();
    }
    public getStudentrDetail(){
        this.studentService.getStudentrDetail(this.student_id).subscribe(result => {
            this.student = result.student;
            if(this.student == undefined || this.student==null){
                this.student_not_found =true;
                return;
            }
            this.current_courses = result.current_courses;
            this.editing_name = this.student.first_name + ' ' + this.student.last_name;
            this.absenceRequestService.getRequestsByStudent(this.student_id,-1,'')
            .subscribe(result => {
                this.absence_requests = result.absence_requests;
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get absence requests by student", 'error'); });
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't student detail", 'error'); });
    }
    public onCourseClick(id: number) {
        this.router.navigate(['/courses/', id]);
    }

    public current_request_id = 0;
    public current_request_status = 0;
    public confirm_modal_title = '';
    public onAcceptRequest(id: number) {
        jQuery('#confirmModal').modal("show");
        this.confirm_modal_title = 'Accept this request ?';
        this.current_request_id = id;
        this.current_request_status = this.appService.absence_request_status.accepted.id;
    }
    public onUndoRequest(id: number) {
        jQuery('#confirmModal').modal("show");
        this.confirm_modal_title = 'Undo this request ?';
        this.current_request_id = id;
        this.current_request_status = this.appService.absence_request_status.new.id;
    }
    public onRejectRequest(id: number) {
        jQuery('#confirmModal').modal("show");
        this.confirm_modal_title = 'Reject this request ?';
        this.current_request_id = id;
        this.current_request_status = this.appService.absence_request_status.rejected.id;
    }
    public confirmAction() {
        this.absenceRequestService.changeRequestStatus(this.current_request_id, this.current_request_status)
            .subscribe(result => {
                this.absenceRequestService.getRequestsByStudent(this.student_id,-1,'')
                    .subscribe(result => {
                        this.absence_requests = result.absence_requests;
                        jQuery('#confirmModal').modal("hide");
                    }, error => { this.appService.showPNotify('failure', "Server Error! Can't get absence_requests by student", 'error'); });
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't change request status", 'error'); });
    }
    public editing_phone;
    public editing_mail;
    public editing_name;
    public editing_status;
    public onEditStudent() {
        this.editing_name = this.student.first_name + ' ' + this.student.last_name;
        this.editing_mail = this.student.email;
        this.editing_phone = this.student.phone;
        this.editing_status = this.student.status;
        this.isEditingStudent = true;
    }
    public onCancelEditStudent() {
        this.isEditingStudent = false;
    }
    public apiResult: string;
    public apiResultMessage: string;
    public onSaveEditStudent() {
        this.studentService.updateStudent(this.student.id, this.editing_name, this.editing_mail, this.editing_phone, this.student.avatar, this.editing_status)
            .subscribe(result => {
                this.apiResult = result.result;
                this.apiResultMessage = result.message;
                if (result.result == 'success') {
                    this.isEditingStudent = false;
                    this.student.email = this.editing_mail;
                    this.student.phone = this.editing_phone;
                    this.student.status = this.editing_status;
                }
                //this.resultMessageModal.onOpenModal();
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't update profile", 'error'); });
    }

    public current_attendance_status = 0;
    public onChangeAttendanceStatus(course_id, status){
        jQuery('#confirmChangeAttendanceStatusModal').modal("show");
        if(this.appService.attendance_status.exemption == status){
            this.confirm_modal_title = 'Change attendance status to Exemption?';
        }else{
            this.confirm_modal_title = 'Change attendance status to Normal?';
        }
        this.current_attendance_status = status;
        this.current_course_id = course_id;
    }
    public confirmChangeAttendanceStatus(){
        this.studentService.changeAttendanceStatus(this.student_id,this.current_course_id,this.student.class_id,this.current_attendance_status).subscribe(result=>{
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (result.result == 'success') {
                jQuery('#confirmChangeAttendanceStatusModal').modal("hide");
                this.getStudentrDetail();
            }
            this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
        },error=>{this.appService.showPNotify('failure', "Server Error! Can't change attendance status", 'error');});
    }
}
