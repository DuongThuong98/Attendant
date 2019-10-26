import { Component, OnInit, ElementRef } from '@angular/core';
import { AppService, AuthService } from '../shared/shared.module';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
declare var jQuery: any;
@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
    public constructor(public  route: ActivatedRoute, public  appService: AppService, public  authService: AuthService,
     public  router: Router, public  localStorage: LocalStorageService,public element: ElementRef) {}

    public ngOnInit() {
        this.route.params.subscribe(params => { this.reset_token = params['token'] });
        if (this.reset_token) {
            this.authService.registerCheck(this.reset_token).subscribe(result => {
                this.register_check = result.result;
                this.error_message = result.message;
                if(this.register_check == 'success'){
                    setTimeout(()=>{
                        var image = this.element.nativeElement.querySelector('#profilePic');
                        image.src = this.appService.default_avatar;
                        this.first_name = result.user.first_name;
                        this.last_name = result.user.last_name;
                        this.phone = result.user.phone;
                    },1000);
                }
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't check register token", 'error'); });
        }
    }
    public email: string = '';
    public reset_token: string;
    public register_check;
    public first_name = ''; 
    public last_name = '';
    public phone = '';
    public avatar;
    public avatar_link = this.appService.default_avatar;
    public password: string = '';
    public confirm_password: string = '';

    public register(){
        this.authService.register(this.first_name,this.last_name,this.phone,this.avatar_link,this.password, this.confirm_password, this.reset_token).subscribe(result => {
            jQuery('#progressModal').modal('hide');
            if (result.result == 'success') {
                this.success_message = "Successfully register your account ! Returning to login page...";
                this.register_check = '';
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 3000);
            } else {
                this.error_message = result.message;
            }
        }, error => {
            jQuery('#progressModal').modal('hide');
            this.appService.showPNotify('failure', "Server Error! Can't register", 'error'); 
        });
    }
    public onRegister() {
        this.error_message = '';
        jQuery('#progressModal').modal({backdrop: 'static', keyboard: false});
        if(this.avatar != null){
            this.appService.uploadAvatar(this.avatar).subscribe(result=>{
                this.avatar_link = result['data'].link;
                this.register();
            },error=>{
                jQuery('#progressModal').modal('hide');
                this.appService.showPNotify('failure', "Error! Can't upload new profile picture", 'error');
            });
        }else{
            this.register();
        }
    }

    public error_message: any;
    public success_message;
    public apiResult = 'failure';
    public continue () {
        this.router.navigate(['/login']);
    }

    public onEditProfilePic(event:any){
        var reader = new FileReader();
        var image = this.element.nativeElement.querySelector('#profilePic');

        reader.onload = function(e) {
            var src = e.target['result'];
            image.src = src;
        };
        this.avatar = event.target.files[0];
        reader.readAsDataURL(event.target.files[0]);
    }
}
