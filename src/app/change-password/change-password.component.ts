import { Component, OnInit } from '@angular/core';
import { AppService, AuthService } from '../shared/shared.module';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit {
    constructor(public  route: ActivatedRoute, public  appService: AppService,public  authService: AuthService, public router: Router, public localStorage: LocalStorageService) {}

    public ngOnInit() {

    }
    public current_password: string = '';
    public new_password: string = '';
    public confirm_password: string = '';

    public apiResult: string;
    public apiResultMessage: string;
    public onCancelChangePassword() {
        this.router.navigate(['/dashboard']);
    }
    public onChangePassword() {
        this.appService.changePassword(this.current_password, this.new_password, this.confirm_password).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (result.result == 'success') {
                setTimeout(() => {
                   this.router.navigate(['/dashboard']);
                }, 2000);
            }    
            this.appService.showPNotify(this.apiResult, this.apiResultMessage, this.apiResult == 'success' ? 'success' : 'error');
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't change password", 'error'); });
    }
}
