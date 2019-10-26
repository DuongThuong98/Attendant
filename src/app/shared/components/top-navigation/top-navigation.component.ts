import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AppService } from '../../services/app.service';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
import {TranslateService} from '@ngx-translate/core';
@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.component.html',
})
export class TopNavigationComponent implements OnInit {

	public constructor(public  router:Router,public  authService : AuthService,public socketService: SocketService,
	public notificationService: NotificationService,public appService: AppService,
	public translate: TranslateService , public  localStorage : LocalStorageService) {
		// this language will be used as a fallback when a translation isn't found in the current language
      //   translate.setDefaultLang('vi');
      //    // the lang to use, if the lang isn't available, it will use the current loader to get them
	     // if(this.localStorage.get('language') != null){
	     // 	 translate.use(this.localStorage.get('language').toString());
	     // 	 this.selected_language = this.localStorage.get('language').toString();
	     // }else{
	     // 	this.translate.use('vi');
	     // }
    	socketService.consumeEventOnNotificationPushed();
    	socketService.invokeNotificationPushed.subscribe(result=>{
    		if (this.authService.current_user.id == result['to_id']) {
                this.getNotification();
            }
            if(this.authService.current_user.role_id == this.appService.userType.staff && result['to_id'] == 0){
				this.getNotification();
            }
        });
	}
	public selected_language = 'vi';
	public languages = [
		{
			id : 'vi',
			name : 'Vietnamese (vi)'
		},
		{
			id : 'en',
			name : 'English (en)'
		}
	];
	public onChangeLanguage() {
		// this.translate.use(this.selected_language);
		// this.localStorage.set('language',this.selected_language);
	}
	public notifications = [];
	public getNotification(){
		this.notificationService.getNotification(this.authService.current_user.id,this.authService.current_user.role_id).subscribe(result=>{
			if(result.result == 'success'){
				this.notifications = result.notifications;
			}else{
				this.appService.showPNotify('failure', result.message, 'error');
			}
		},error=>{this.appService.showPNotify('failure', "Server Error! Can't get notifications", 'error');});
	}

	public ngOnInit() {
		this.getNotification();
	}
	public logout(){
		this.authService.logout();
		this.router.navigate(['/login']);
	}
	public onChangePassword(){
		this.router.navigate(['/change-password']);
	}
	public onNotificationClick(index){
		this.notificationService.readNotification(this.notifications[index].id).subscribe(result=>{
			if(result.result == 'success'){
				switch (this.notifications[index].type) {
					case this.appService.notification_type.send_feedback:
					case this.appService.notification_type.reply_feedback:
						this.router.navigate(['/feedbacks']);
						break;
					case this.appService.notification_type.send_absence_request:
					case this.appService.notification_type.accept_absence_request:
					case this.appService.notification_type.reject_absence_request:
						this.router.navigate(['/absence-requests']);
						break;
					case this.appService.notification_type.request_to_be_check_attendance:
						this.router.navigate(['/check-attendance']);
						break;
					default:
						// code...
						break;
				}
				this.notifications.splice(index,1);
			}else{
				this.appService.showPNotify('failure', result.message, 'error');
			}
		},error=>{this.appService.showPNotify('failure', "Server Error! Can't read notifications", 'error');});
	}
}
	