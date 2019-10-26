import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {  AppService, AuthService , SocketService, CreateAbsenceRequestModalComponent , SendFeedbackModalComponent,
 StudentService, AttendanceService} from '../../shared/shared.module';
import { Router, ActivatedRoute, Params } from '@angular/router';
declare var uploadToImgur : any;
declare var jQuery: any;
@Component({
	selector: 'app-dashboard-student',
	templateUrl: './dashboard-student.component.html'
})
export class DashboardStudentComponent implements OnInit {

	//public htmlContent: string = null;
	public userType: number = null;

	public role: object = null;

	public constructor(public  appService: AppService,public  authService: AuthService, public  studentService: StudentService,
		public  attendanceService: AttendanceService, public  router: Router,public element: ElementRef, public socketService : SocketService) {
		socketService.consumeEventOnCheckAttendanceUpdated();
        socketService.invokeCheckAttendanceUpdated.subscribe(result=>{
            this.getOpeningAttendanceForStudent();
        });
        socketService.consumeEventOnCheckAttendanceCreated();
        socketService.invokeCheckAttendanceCreated.subscribe(result=>{
            this.getAttendanceListByStudent();
        });
        socketService.consumeEventOnCheckAttendanceStopped();
        socketService.invokeCheckAttendanceStopped.subscribe(result=>{
            this.getAttendanceListByStudent();
        });
	}

	public attendance_list_by_student : Array<any> = [];
	public opening_attendance_for_student = [];
	public ngOnInit() {
		this.editing_name = this.authService.current_user.first_name + ' ' + this.authService.current_user.last_name;
		var image = this.element.nativeElement.querySelector('#profilePic');
		image.src = this.authService.current_user.avatar;
		this.getAttendanceListByStudent();
	}

	public getAttendanceListByStudent(){
		this.attendanceService.getAttendanceListByStudent(this.authService.current_user.id).subscribe(result=>{
			if(result.result == 'success'){
				this.attendance_list_by_student = result.attendance_list_by_student;
				for(var i = 0; i < this.attendance_list_by_student.length;i++){
					var absences = 0;
					for(var j = 0 ; j < this.attendance_list_by_student[i].attendance_details.length; j++){
						if(this.attendance_list_by_student[i].attendance_details[j].attendance_type == this.appService.attendance_type.absent){
							absences++;
						}
						switch (this.attendance_list_by_student[i].attendance_details[j].attendance_type) {
							case this.appService.attendance_type.checklist:
								this.attendance_list_by_student[i].attendance_details[j]['icon'] = 'fa-check';
								this.attendance_list_by_student[i].attendance_details[j]['method'] = 'Checklist';
								break;
							case this.appService.attendance_type.qr:
								this.attendance_list_by_student[i].attendance_details[j]['icon'] = 'fa-qrcode';
								this.attendance_list_by_student[i].attendance_details[j]['method'] = 'QR Code';
								break;
							case this.appService.attendance_type.quiz:
								this.attendance_list_by_student[i].attendance_details[j]['icon'] = 'fa-question-circle';
								this.attendance_list_by_student[i].attendance_details[j]['method'] = 'Quiz';
								break;
							case this.appService.attendance_type.permited_absent:
								this.attendance_list_by_student[i].attendance_details[j]['icon'] = 'fa-envelope-square';
								this.attendance_list_by_student[i].attendance_details[j]['method'] = 'Permited Absent';
								break;		
							default:
								this.attendance_list_by_student[i].attendance_details[j]['icon'] = '';
								this.attendance_list_by_student[i].attendance_details[j]['method'] = 'Absent';
								break;
						}
					}
					this.attendance_list_by_student[i]['absences'] = absences;
				}
				this.getOpeningAttendanceForStudent();
			}
		},error => { this.appService.showPNotify('failure', "Server Error! Can't get attendance progression", 'error'); });
	}

	public getOpeningAttendanceForStudent(){
		this.attendanceService.getOpeningAttendanceForStudent(this.authService.current_user.id).subscribe(result=>{
			if(result.result == 'success'){
				this.opening_attendance_for_student = result.opening_attendance_for_student;
				for(var i = 0; i < this.opening_attendance_for_student.length;i++){
					switch (this.opening_attendance_for_student[i].attendance_type) {
						case this.appService.attendance_type.checklist:
							this.opening_attendance_for_student[i]['checked_by'] = "Checked with Checklist";
							break;
						case this.appService.attendance_type.qr:
							this.opening_attendance_for_student[i]['checked_by'] = "Checked with QR code";
							break;
						case this.appService.attendance_type.quiz:
							this.opening_attendance_for_student[i]['checked_by'] = "Checked with quiz";
							break;
						case this.appService.attendance_type.permited_absent:
							this.opening_attendance_for_student[i]['checked_by'] = "Permited Absent";
							break;
					}
				}
			}
		},error => { this.appService.showPNotify('failure', "Server Error! Can't get opening attendance for student", 'error'); });
	}

	public isEditingProfile = false;
	public uploaded_avatar;
	public editing_name = '';
	public editing_phone = '';
	public editing_mail = '';

	public apiResult;
	public apiResultMessage;
	public onEditProfilePic(event:any){
		var reader = new FileReader();
        var image = this.element.nativeElement.querySelector('#profilePic');

        reader.onload = function(e) {
            var src = e.target['result'];
            image.src = src;
        };
        this.uploaded_avatar = event.target.files[0];
        reader.readAsDataURL(event.target.files[0]);
	}
	public onEditProfile(){
		this.isEditingProfile = true;
		this.editing_name = this.authService.current_user.first_name + ' ' + this.authService.current_user.last_name;
		this.editing_mail = this.authService.current_user.email;
		this.editing_phone = this.authService.current_user.phone;
	}
	public onCancelEditProfile(){
		var image = this.element.nativeElement.querySelector('#profilePic');
		image.src = this.authService.current_user.avatar;
		this.isEditingProfile = false;
	}
	public onSaveEditProfile(){
		jQuery('#progressModal').modal({backdrop: 'static', keyboard: false});
		if(this.uploaded_avatar != null){
			this.appService.uploadAvatar(this.uploaded_avatar).subscribe(result=>{
				var avatar_link = result['data'].link;
				this.studentService.updateStudent(this.authService.current_user.id, this.editing_name, this.editing_mail, this.editing_phone, avatar_link, null)
	            .subscribe(result => {
					jQuery('#progressModal').modal('hide');
	                this.apiResult = result.result;
	                this.apiResultMessage = result.message;
	                this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
	                if (result.result == 'success') {
	                    this.isEditingProfile = false;
	                    this.authService.current_user.email = this.editing_mail;
	                    this.authService.current_user.phone = this.editing_phone;
	                    this.authService.current_user.avatar = avatar_link;
	                    this.authService.saveCurrentUserToLocal();
	                    var image = this.element.nativeElement.querySelector('#topNavPic');
						image.src = this.authService.current_user.avatar;
	                }
	            }, error => { 
	            	jQuery('#progressModal').modal('hide');
	            	this.appService.showPNotify('failure', "Server Error! Can't edit profile", 'error');
	    		});
			},error=>{
				jQuery('#progressModal').modal('hide');
				this.appService.showPNotify('failure', "Error! Can't upload new profile picture", 'error');
			});
		}else{
			this.studentService.updateStudent(this.authService.current_user.id, this.editing_name, this.editing_mail, this.editing_phone, null, null)
            .subscribe(result => {
				jQuery('#progressModal').modal('hide');
                this.apiResult = result.result;
                this.apiResultMessage = result.message;
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
                if (result.result == 'success') {
                    this.isEditingProfile = false;
                    this.authService.current_user.email = this.editing_mail;
                    this.authService.current_user.phone = this.editing_phone;
                }
            }, error => { 
            	jQuery('#progressModal').modal('hide');
            	this.appService.showPNotify('failure', "Server Error! Can't edit profile", 'error');
    		});
		}
	}

	@ViewChild(CreateAbsenceRequestModalComponent)
    public  createAbsenceRequestModal: CreateAbsenceRequestModalComponent;
    public onCreateAbsenceRequest() {
        this.createAbsenceRequestModal.onOpenModal();
    }
    public onRequestCreated(result:string){}

    @ViewChild(SendFeedbackModalComponent)
    public  sendFeedbackModal: SendFeedbackModalComponent;
    public onSendFeedback() {
        this.sendFeedbackModal.onOpenModal();
    }
    public onFeedbackSent(result:string){}

    public onChangePassword(){
        this.router.navigate(['/change-password']);
    }
    public keyDownFunction(event) {
      if(event.keyCode == 13) {
        this.onSaveEditProfile();
      }
    }

    public onRequestToBeChecked(course){
    	this.attendanceService.requestToBeCheckAttendance(this.authService.current_user.id,course.id).subscribe(result=>{
    		if(result.result == 'success'){
    			this.appService.showPNotify('success', result.message, 'success');
    		}else{
    			this.appService.showPNotify('failure', result.message, 'error');
    		}
    	},error=>{this.appService.showPNotify('failure', "Server Error! Can't request to be check attendance", 'error');});
    }
}

