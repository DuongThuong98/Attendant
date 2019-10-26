import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService, AttendanceService, AuthService, SocketService, AppConfig, CheckAttendanceService, StudentService } from '../../shared/shared.module';
import { LocalStorageService } from 'angular-2-local-storage';
declare var jQuery:any;
@Component({
    selector: 'check-attendance-teacher',
    templateUrl: './check-attendance-teacher.component.html'
})
export class CheckAttendanceTeacherComponent implements OnInit, OnDestroy {
    public stopped_modal_message;
    public constructor(public checkAttendanceService : CheckAttendanceService,public appConfig: AppConfig,public socketService: SocketService ,
        public authService: AuthService, public attendanceService: AttendanceService, public localStorage: LocalStorageService,
         public appService: AppService, public router: Router, public studentService : StudentService) {
        socketService.consumeEventOnCheckAttendanceUpdated();
        socketService.invokeCheckAttendanceUpdated.subscribe(result=>{
            if(this.selected_course_id == result['course_id'] && this.selected_class_id == result['class_id']){
                this.getOpeningAttendance();
            }
        });
        socketService.consumeEventOnCheckAttendanceCreated();
        socketService.invokeCheckAttendanceCreated.subscribe(result=>{
            this.getOpeningAttendance();
        });
        socketService.consumeEventOnCheckAttendanceStopped();
        socketService.invokeCheckAttendanceStopped.subscribe(result=>{
            if(this.selected_course_id == result['course_id'] && this.selected_class_id == result['class_id']){
                this.stopped_modal_message = "Session is " + result['message'];
                jQuery('#sessionStoppedModal').modal({backdrop: 'static', keyboard: false}) ;
            }
        });
    }

    public apiResult;
    public apiResultMessage;

    public selected_course_id;
    public selected_class_id;
    public selected_number_of_sessions;

    public opening_attendances = [];
    public selected_attendance = {};
    public selected_attendance_id = 0;
    public delegate_code = '';
    public check_attendance_list: Array < any > = [];

    public is_show_attendance_history = true;
    public selected_interaction;
    public changeHistory(){
        this.is_show_attendance_history = !this.is_show_attendance_history;
    }
    public sortAttendanceList(){
        var temp_check_attendance_list = [];
        for(var i = 0 ; i < this.check_attendance_list.length; i++){
            var attendance_details = this.check_attendance_list[i].attendance_details;
            if(!attendance_details[attendance_details.length - 1].attendance_type){
                var temp_attendance_details = [];
                for(var j = 0 ; j < attendance_details.length;j++){
                    temp_attendance_details.push({
                        attendance_type: attendance_details[j].attendance_type,
                        attendance_time: attendance_details[j].attendance_time,
                        attendance_id: attendance_details[j].attendance_id,
                        created_at: attendance_details[j].created_at,
                        edited_reason: attendance_details[j].edited_reason,
                        edited_by: attendance_details[j].edited_by,
                        editor: attendance_details[j].editor,
                        answered_questions: attendance_details[j].answered_questions,
                        discussions: attendance_details[j].discussions,
                        presentations: attendance_details[j].presentations,
                    });
                }
                temp_check_attendance_list.push({
                    id : this.check_attendance_list[i].id,
                    code : this.check_attendance_list[i].code,
                    name : this.check_attendance_list[i].name,
                    exemption : this.check_attendance_list[i].exemption,
                    avatar : this.check_attendance_list[i].avatar,
                    attendance_details : temp_attendance_details
                });
            }
        }
        for(var i = 0 ; i < this.check_attendance_list.length; i++){
            var attendance_details = this.check_attendance_list[i].attendance_details;
            if(attendance_details[attendance_details.length - 1].attendance_type){
                var temp_attendance_details = [];
                for(var j = 0 ; j < attendance_details.length;j++){
                    temp_attendance_details.push({
                        attendance_type: attendance_details[j].attendance_type,
                        attendance_time: attendance_details[j].attendance_time,
                        attendance_id: attendance_details[j].attendance_id,
                        created_at: attendance_details[j].created_at,
                        edited_reason: attendance_details[j].edited_reason,
                        edited_by: attendance_details[j].edited_by,
                        editor: attendance_details[j].editor,
                        answered_questions: attendance_details[j].answered_questions,
                        discussions: attendance_details[j].discussions,
                        presentations: attendance_details[j].presentations,
                    });
                }
                temp_check_attendance_list.push({
                    id : this.check_attendance_list[i].id,
                    code : this.check_attendance_list[i].code,
                    name : this.check_attendance_list[i].name,
                    exemption : this.check_attendance_list[i].exemption,
                    avatar : this.check_attendance_list[i].avatar,
                    attendance_details : temp_attendance_details
                });
            }
        }
        for(var i = 0 ; i < this.check_attendance_list.length; i++){
            this.check_attendance_list[i].id = temp_check_attendance_list[i].id;
            this.check_attendance_list[i].code = temp_check_attendance_list[i].code;
            this.check_attendance_list[i].name = temp_check_attendance_list[i].name;
            this.check_attendance_list[i].exemption = temp_check_attendance_list[i].exemption;
            this.check_attendance_list[i].avatar = temp_check_attendance_list[i].avatar;
            for(var j = 0 ; j < temp_check_attendance_list[i].attendance_details.length; j++){
                this.check_attendance_list[i].attendance_details[j].attendance_id = temp_check_attendance_list[i].attendance_details[j].attendance_id;
                this.check_attendance_list[i].attendance_details[j].attendance_type = temp_check_attendance_list[i].attendance_details[j].attendance_type;
                this.check_attendance_list[i].attendance_details[j].attendance_time = temp_check_attendance_list[i].attendance_details[j].attendance_time;
                this.check_attendance_list[i].attendance_details[j].created_at = temp_check_attendance_list[i].attendance_details[j].created_at;
                this.check_attendance_list[i].attendance_details[j].edited_reason = temp_check_attendance_list[i].attendance_details[j].edited_reason;
                this.check_attendance_list[i].attendance_details[j].edited_by = temp_check_attendance_list[i].attendance_details[j].edited_by;
                this.check_attendance_list[i].attendance_details[j].editor = temp_check_attendance_list[i].attendance_details[j].editor;
                this.check_attendance_list[i].attendance_details[j].answered_questions = temp_check_attendance_list[i].attendance_details[j].answered_questions;
                this.check_attendance_list[i].attendance_details[j].discussions = temp_check_attendance_list[i].attendance_details[j].discussions;
                this.check_attendance_list[i].attendance_details[j].presentations = temp_check_attendance_list[i].attendance_details[j].presentations;
                switch (this.check_attendance_list[i].attendance_details[j].attendance_type) {
                    case this.appService.attendance_type.checklist:
                        this.check_attendance_list[i].attendance_details[j]['icon'] = 'fa-check';
                        this.check_attendance_list[i].attendance_details[j]['method'] = 'Checklist';
                        break;
                    case this.appService.attendance_type.qr:
                        this.check_attendance_list[i].attendance_details[j]['icon'] = 'fa-qrcode';
                        this.check_attendance_list[i].attendance_details[j]['method'] = 'QR Code';
                        break;
                    case this.appService.attendance_type.quiz:
                        this.check_attendance_list[i].attendance_details[j]['icon'] = 'fa-question-circle';
                        this.check_attendance_list[i].attendance_details[j]['method'] = 'Quiz';
                        break;
                    case this.appService.attendance_type.permited_absent:
                        this.check_attendance_list[i].attendance_details[j]['icon'] = 'fa-envelope-square';
                        this.check_attendance_list[i].attendance_details[j]['method'] = 'Permited Absent';
                        break;        
                    default:
                        this.check_attendance_list[i].attendance_details[j]['icon'] = '';
                        this.check_attendance_list[i].attendance_details[j]['method'] = 'Absent';
                        break;
                }
            }
        }
    }
    public getCheckAttendanceList() {
        this.selected_class_id = this.selected_attendance['class_id'];
        this.selected_course_id = this.selected_attendance['course_id'];
        this.attendanceService.getCheckAttendanceList(this.selected_course_id,this.selected_class_id).subscribe(result => {
            this.apiResult = result.result;
            this.check_attendance_list = result.check_attendance_list;
            this.sortAttendanceList();
        }, error => { this.appService.showPNotify('failure',"Server Error! Can't get check_attendance_list",'error'); });
    }
    public ngOnInit() {
        this.selected_interaction = this.appService.student_interaction_type.answer_question;
        this.attendanceService.getOpeningAttendanceCourse(this.authService.current_user.id)
            .subscribe(result => {
                this.opening_attendances = result.opening_attendances;
                this.selected_course_id = this.localStorage.get('check_attendance_course_id');
                this.selected_class_id = this.localStorage.get('check_attendance_class_id');
                this.localStorage.remove('check_attendance_course_id', 'check_attendance_class_id');

                if (this.opening_attendances.length == 0) {
                    if(this.selected_course_id && this.selected_class_id){
                        this.createAttendance();
                    }else{
                        this.router.navigate(['/dashboard']);
                        this.appService.showPNotify('info', "There are no opening attendance! Select one first", 'info');
                    }
                } else {
                    if (!this.selected_course_id) {
                        //show first opening
                        this.selected_attendance_id = this.opening_attendances[0].id;
                        this.selected_attendance = this.opening_attendances[0];
                        this.getCheckAttendanceList();
                    } else {
                        //check if new or not
                        var i;
                        for (i = 0; i < this.opening_attendances.length; i++) {
                            if (this.opening_attendances[i].course_id == this.selected_course_id && this.opening_attendances[i].class_id == this.selected_class_id) {
                                this.selected_attendance = this.opening_attendances[i];
                                this.selected_attendance_id = this.opening_attendances[i].id;
                                break;
                            }
                        }
                        if (i == this.opening_attendances.length) {
                            //new
                            this.createAttendance();
                        }
                        else{
                            this.getCheckAttendanceList();
                        }
                    }
                    setTimeout(()=>{
                        //
                    },1000);
                }
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get opening attendances", 'error'); });
    }

    public ngOnDestroy(){
        console.log('abc');
        this.socketService.stopEventOnCheckAttendanceStopped();
        this.socketService.stopEventOnCheckAttendanceCreated();
        this.socketService.stopEventOnCheckAttendanceUpdated();
    }

    public getOpeningAttendance(){
        this.attendanceService.getOpeningAttendanceCourse(this.authService.current_user.id).subscribe(result => {
            this.opening_attendances = result.opening_attendances;
            for (var j = 0; j < this.opening_attendances.length; j++) {
                if (this.opening_attendances[j].course_id == this.selected_course_id && this.opening_attendances[j].class_id == this.selected_class_id) {
                    this.selected_attendance = this.opening_attendances[j];
                    this.selected_attendance_id = this.opening_attendances[j].id;
                    break;
                }
            }
            this.getCheckAttendanceList();
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get opening attendances", 'error'); });
    }
    public createAttendance(){
        this.attendanceService.createAttendance(this.selected_course_id, this.selected_class_id, this.authService.current_user.id)
            .subscribe(result => {
                if(result.result == 'success'){
                    this.getOpeningAttendance();
                    this.socketService.emitEventOnCheckAttendanceCreated(null);
                }
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't create new attendances", 'error'); });
    }
    public onChangeAttendance() {
        for (var j = 0; j < this.opening_attendances.length; j++) {
            if (this.opening_attendances[j].id == this.selected_attendance_id) {
                this.selected_attendance = this.opening_attendances[j];
                break;
            }
        }
        this.getCheckAttendanceList();
    }

    public onCancelAttendanceSession(){
        jQuery('#confirmCancelModal').modal('show');
    }
    public onCloseAttendanceSession(){
        jQuery('#confirmEndModal').modal('show');
    }
    public confirmCancelAttendanceSession(){
        this.attendanceService.cancelAttendance(this.selected_attendance['id']).subscribe(result=>{
            if(result.result == 'success'){
                var temp_attendance = this.localStorage.get('selected_attendance');
                if(temp_attendance && this.selected_attendance['id'] == temp_attendance['id']){
                    this.localStorage.remove('selected_attendance');
                }
                this.socketService.emitEventOnCheckAttendanceStopped({
                    message: 'cancelled by ' + this.authService.current_user.first_name + ' ' + this.authService.current_user.last_name,
                    course_id : this.selected_course_id,
                    class_id : this.selected_class_id,
                });
                this.appService.showPNotify('success',"Canceled Attendance Session",'success');
                this.router.navigate(['/dashboard']);
            }
        },error=>{this.appService.showPNotify('failure', "Server Error! Can't cancel attendance session", 'error');});
    }
    public confirmCloseAttendanceSession(){
        this.attendanceService.closeAttendance(this.selected_attendance['id']).subscribe(result=>{
            if(result.result == 'success'){
                var temp_attendance = this.localStorage.get('selected_attendance');
                if(temp_attendance && this.selected_attendance['id'] == temp_attendance['id']){
                    this.localStorage.remove('selected_attendance');
                }
                this.socketService.emitEventOnCheckAttendanceStopped({
                    message: 'closed by ' + this.authService.current_user.first_name + ' ' + this.authService.current_user.last_name,
                    course_id : this.selected_course_id,
                    class_id : this.selected_class_id,
                });
                this.appService.showPNotify('success',"Closed Attendance Session",'success');
                this.router.navigate(['/dashboard']);
            }else{
                this.appService.showPNotify('failure',result.message,'error');
            }
        },error=>{this.appService.showPNotify('failure', "Server Error! Can't close attendance session", 'error');});
    }
    public generateQRCode(){
        var check_attendance_url = this.appConfig.apiHost + "/check-attendance/qr-code/" + this.selected_attendance_id;
        this.localStorage.set('qrCodeData',check_attendance_url);
        window.open(this.appConfig.host + '/qr-code', '_blank', 'height=300,width=300,scrollbars=yes,status=0,toolbar=0,menubar=0,location=0');
    }
    public generateDelegateCode(){
        this.checkAttendanceService.generateDelegateCode(this.selected_course_id, this.selected_class_id).subscribe(result=>{
            this.delegate_code = result.code;
            jQuery('#delegateCodeModal').modal('show');
        },error=>{this.appService.showPNotify('failure', "Server Error! Can't generate delegate code", 'error');});
    }
    public generateQuiz(){
        this.localStorage.set('selected_attendance',this.selected_attendance);
        this.router.navigate(['/check-attendance/quiz/']);
    }
    public onAttendanceCheckClick(student_index: number, attendance_detail_index: number) {
        var type;
        if (this.check_attendance_list[student_index].attendance_details[attendance_detail_index].attendance_type) {
            type = this.appService.attendance_type.absent;
        } else {
            type = this.appService.attendance_type.checklist;
        }
        this.checkAttendanceService.checkList(this.check_attendance_list[student_index].attendance_details[attendance_detail_index].attendance_id,this.check_attendance_list[student_index].id,type).subscribe(result=>{
            if(result.result == 'success'){
                this.check_attendance_list[student_index].attendance_details[attendance_detail_index].attendance_type = type;
                if(type){
                    this.check_attendance_list[student_index].attendance_details[attendance_detail_index]['icon'] = 'fa-check';
                    this.check_attendance_list[student_index].attendance_details[attendance_detail_index]['method'] = 'Checklist';
                }else{
                    this.check_attendance_list[student_index].attendance_details[attendance_detail_index]['icon'] = '';
                    this.check_attendance_list[student_index].attendance_details[attendance_detail_index]['method'] = 'Absent';
                }
                this.sortAttendanceList();
                this.socketService.emitEventOnCheckAttendanceUpdated({
                    course_id : this.selected_course_id,
                    class_id : this.selected_class_id,
                });
            }
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't check_list",'error');});
    }

    public confirmInteraction(student, interaction_type){
        this.studentService.updateStudentInteraction(student.id,this.selected_attendance_id,interaction_type)
        .subscribe(result=>{
            if(result.result == 'success'){
                switch (interaction_type) {
                    case this.appService.student_interaction_type.answer_question:
                        student.attendance_details[student.attendance_details.length-1].answered_questions++;
                        break;
                    case this.appService.student_interaction_type.discuss:
                        student.attendance_details[student.attendance_details.length-1].discussions++;
                        break;
                    case this.appService.student_interaction_type.present:
                        student.attendance_details[student.attendance_details.length-1].presentations++;
                        break;
                }
                this.appService.showPNotify('success',"Successfully update student interaction!",'success');
            }
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't update student interaction",'error');});
    }
}
