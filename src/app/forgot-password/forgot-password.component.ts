import { Component, OnInit } from '@angular/core';
import { AppService, AuthService } from '../shared/shared.module';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
    public constructor(public  route: ActivatedRoute, public  appService: AppService, public  authService: AuthService, public  router: Router, public  localStorage: LocalStorageService) {}

    public ngOnInit() {
        this.route.params.subscribe(params => { this.reset_token = params['token'] });
        if (this.reset_token) {
            this.authService.resetPasswordCheck(this.reset_token).subscribe(result => {
                this.reset_password_check = result.result;
                this.error_message = result.message;
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't check reset password", 'error'); });
        }
    }
    public email: string = '';
    public reset_token: string;
    public reset_password_check;
    public password: string = '';
    public confirm_password: string = '';
    public resetPassword() {
        this.error_message = '';
        this.authService.resetPassword(this.password, this.confirm_password, this.reset_token).subscribe(result => {
            if (result.result == 'success') {
                this.success_message = "Successfully changed your password ! Returning to login page...";
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 3000);
            } else {
                this.error_message = result.message;
            }
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't reset password", 'error'); });
    }

    public error_message: any;
    public success_message;
    public apiResult = 'failure';
    public forgotPassword() {
        this.authService.forgotPassword(this.email).subscribe(results => {
            this.apiResult = results.result;
            if (results.result == 'failure') {
                this.error_message = results.message;
            }
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't proceed forgot password", 'error'); });
    }
    public continue () {
        this.router.navigate(['/login']);
    }
}
