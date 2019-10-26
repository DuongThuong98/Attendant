import { Component, OnInit,ViewChild, ElementRef} from '@angular/core';
import {  AppService, AuthService ,TeacherService,ExcelService,ExportModalComponent } from '../../shared/shared.module';
import { Router } from '@angular/router';
declare var jQuery: any;
@Component({
	selector: 'app-dashboard-staff',
	templateUrl: './dashboard-staff.component.html'
})
export class DashboardStaffComponent implements OnInit {

	public i = 0;
	public constructor(public  appService: AppService,public  excelService: ExcelService,public  authService: AuthService,
		public  teacherService: TeacherService,public  router : Router,public element: ElementRef) {
	}
	public isEditingProfile = false;
	public editing_name = '';
	public editing_phone = '';
	public editing_mail = '';
	public uploaded_avatar;
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
                this.teacherService.updateTeacher(this.authService.current_user.id, this.editing_name, this.editing_mail, this.editing_phone, avatar_link)
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
            this.teacherService.updateTeacher(this.authService.current_user.id, this.editing_name, this.editing_mail, this.editing_phone, null)
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
	public onChangePassword(){
		this.router.navigate(['/change-password']);
	}
	public getSemesterProgramClass(){
		this.appService.getSemesterProgramClass().subscribe(results => {
            this.programs = results.programs;
            this.new_class_program = this.programs[this.programs.length - 1].id;
        }, error => { this.appService.showPNotify('failure',"Server Error! Can't get semester-program-class",'error'); });
	}
	public programs = [];
	public new_class_program;
	public ngOnInit() {
		this.editing_name = this.authService.current_user.first_name + ' ' + this.authService.current_user.last_name;
		var image = this.element.nativeElement.querySelector('#profilePic');
		image.src = this.authService.current_user.avatar;
		jQuery('#from_to').daterangepicker(null, function(start, end, label) {

        });
	}

	
	public keyDownFunction(event) {
      if(event.keyCode == 13) {
        this.onSaveEditProfile();
      }
    }
}

