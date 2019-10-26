import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService, AttendanceService, AuthService,SocketService, AppConfig, CheckAttendanceService } from '../../shared/shared.module';
import { LocalStorageService } from 'angular-2-local-storage';
declare var jQuery: any;
@Component({
    selector: 'check-attendance-student',
    templateUrl: './check-attendance-student.component.html'
})
export class CheckAttendanceStudentComponent implements OnInit, OnDestroy {
    public stopped_modal_message;
    public constructor(public checkAttendanceService: CheckAttendanceService, public appConfig: AppConfig, public socketService: SocketService,
        public authService: AuthService, public attendanceService: AttendanceService, public localStorage: LocalStorageService, public appService: AppService, public router: Router) {
        socketService.consumeEventOnCheckAttendanceUpdated();
        socketService.invokeCheckAttendanceUpdated.subscribe(result=>{
            if(this.delegate_detail['course_id'] == result['course_id'] && this.delegate_detail['class_id'] == result['class_id']){
                this.getOpeningAttendance();
            }
        });
        socketService.consumeEventOnCheckAttendanceStopped();
        socketService.invokeCheckAttendanceStopped.subscribe(result=>{
            if(this.delegate_detail['course_id'] == result['course_id'] && this.delegate_detail['class_id'] == result['class_id']){
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
    public check_attendance_list: Array < any > = [];

    public delegate_code_checked = false;
    public delegate_code = '';
    public delegate_detail = {};

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
        this.attendanceService.getCheckAttendanceList(this.delegate_detail['course_id'], this.delegate_detail['class_id']).subscribe(result => {
            this.apiResult = result.result;
            this.check_attendance_list = result.check_attendance_list;
            this.sortAttendanceList();
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get check_attendance_list", 'error'); });
    }
    public ngOnInit() {
        jQuery('#enterDelegateCodeModal').modal({ backdrop: 'static', keyboard: false });
    }
    public ngOnDestroy(){
        this.socketService.stopEventOnCheckAttendanceStopped();
        this.socketService.stopEventOnCheckAttendanceUpdated();
    }
    public cancelCheckDelegateCode(){
        jQuery("#enterDelegateCodeModal").modal("hide");
        this.router.navigate(['/dashboard']);
    }
    public checkDelegateCode() {
        this.checkAttendanceService.checkDelegateCode(this.delegate_code).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (this.apiResult == 'success') {
                this.delegate_detail = result.delegate_detail;
                this.delegate_code_checked = true;
                this.getOpeningAttendance();
                jQuery("#enterDelegateCodeModal").modal("hide");
            }
            else{
                this.appService.showPNotify(this.apiResult, this.apiResultMessage,'error');
            }
        }, error => {
            this.appService.showPNotify('failure', "Server Error! Can't check delegate code", 'error');
        });
    }

    public getOpeningAttendance() {
        this.attendanceService.getOpeningAttendanceCourse(this.delegate_detail['created_by']).subscribe(result => {
            if (result.result == 'success') {
                this.opening_attendances = result.opening_attendances;
                for (var j = 0; j < this.opening_attendances.length; j++) {
                    if (this.opening_attendances[j].course_id == this.delegate_detail['course_id'] && this.opening_attendances[j].class_id == this.delegate_detail['class_id']) {
                        this.selected_attendance = this.opening_attendances[j];
                        this.selected_attendance_id = this.opening_attendances[j].id;
                        break;
                    }
                }
            }
            this.getCheckAttendanceList();
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get opening attendances", 'error'); });
    }
    public onAttendanceCheckClick(student_index: number, attendance_detail_index: number) {
        var type;
        if (this.check_attendance_list[student_index].attendance_details[attendance_detail_index].attendance_type) {
            type = this.appService.attendance_type.absent;
        } else {
            type = this.appService.attendance_type.checklist;
        }
        this.checkAttendanceService.checkList(this.check_attendance_list[student_index].attendance_details[attendance_detail_index].attendance_id, this.check_attendance_list[student_index].id, type).subscribe(result => {
            if (this.apiResult == 'success') {
                this.check_attendance_list[student_index].attendance_details[attendance_detail_index].attendance_type = type;
                if(type){
                    this.check_attendance_list[student_index].attendance_details[attendance_detail_index]['icon'] = 'fa-check';
                    this.check_attendance_list[student_index].attendance_details[attendance_detail_index]['method'] = 'Checklist';
                }else{
                    this.check_attendance_list[student_index].attendance_details[attendance_detail_index]['icon'] = '';
                    this.check_attendance_list[student_index].attendance_details[attendance_detail_index]['method'] = 'Absent';
                }
                this.sortAttendanceList();
                this.socketService.emitEventOnCheckAttendanceUpdated({course_id: this.delegate_detail['course_id'], class_id:  this.delegate_detail['class_id']});
            }
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't check_list", 'error'); });
    }
    public keyDownFunction(event) {
      if(event.keyCode == 13) {
        this.checkDelegateCode();
      }
    }
}
