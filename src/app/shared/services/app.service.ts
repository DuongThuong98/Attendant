import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppConfig } from '../config'
import { AuthService } from './auth.service'
declare var PNotify: any;
declare var jQuery: any;
@Injectable()
export class AppService {

    constructor(public http: Http, public appConfig: AppConfig, public authService: AuthService, public router: Router) {}
    public feedback_status = [
        {
            id: 0,
            title: 'Pending'
        },
        {
            id: 1,
            title: 'Replied'
        }
    ];
    public feedback_categories = [
        {
            id: 0,
            title: 'All categories'
        },
        {
            id: 1,
            title: 'Academic'
        },
        {
            id: 2,
            title: 'Facility'
        }
    ];
    public student_status = {
        active: {
            id: 0,
            title: 'Active'
        },
        reserved: {
            id: 1,
            title: 'Reserved'
        },
        dropped: {
            id: 2,
            title: 'Dropped'
        }
    };
    public quiz_type = {
        academic: {
            id: 0,
            title: 'Academic'
        },
        miscellaneous: {
            id: 1,
            title: 'Miscellaneous'
        }
    };
    public timers = [
        {
            value: 5,
            text: '5s'
        },
        {
            value: 10,
            text: '10s'
        },
        {
            value: 20,
            text: '20s'
        },
        {
            value: 30,
            text: '30s'
        },
        {
            value: 60,
            text: '60s'
        },
        {
            value: 90,
            text: '90s'
        },
        {
            value:120,
            text: '120s'
        }
    ];
    public absence_request_status = {
        new: {
            id: 0,
            title: 'New'
        },
        accepted: {
            id: 1,
            title: 'Accepted'
        },
        rejected: {
            id: 2,
            title: 'Rejected'
        },
    };
    public notification_type = {
        send_feedback:0,
        reply_feedback:1,
        send_absence_request:2,
        accept_absence_request:3,
        reject_absence_request:4,
        open_attendance:5,
        request_to_be_check_attendance:6,
    };
    public default_avatar = 'http://i.imgur.com/FTa2JWD.png';
    public student_interaction_type = {answer_question: 0,discuss: 1, present: 2};
    public import_export_type = { student: 0, teacher: 1, course: 2, schedule: 3, examinees: 4, attendance_summary: 5, class:6,
        attendance_list:7,
        attendance_lists:8,
        exceeded_absence_limit:9
    };
    public enrollment_status = { compulsory: 0, elective: 1 };
    public attendance_status = { normal: 0, exemption: 1 };
    public userType = { admin: 4, student: 1, teacher: 2, staff: 3 };
    public attendance_type = { permited_absent:-1, absent: 0, checklist: 1, qr: 2, quiz: 3, face: 4 };
    
    public getSemesterProgramClassUrl = this.appConfig.apiHost + '/semesters-programs-classes';
    public getSemesterProgramClass(): Observable < { result: string, semesters: Array < any > , programs: Array < any > , classes: Array < any > , message: string } > {
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.getSemesterProgramClassUrl, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }
    

    public changePasswordUrl = this.appConfig.apiHost + '/user/change-password';
    public changePassword(current_password, new_password, confirm_password): Observable < { result: string, message: string } > {
        var params = {
            'current_password': current_password,
            'new_password': new_password,
            'confirm_password': confirm_password
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.changePasswordUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }

    public uploadAvatarUrl = 'https://api.imgur.com/3/upload';
    public uploadAvatar(avatar : any): Observable < { result: any} > {
        var formData = new FormData();
        formData.append("image",avatar);
        let headers = new Headers();
        headers.append("Authorization", "Client-ID 56f531f985863ea");
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.uploadAvatarUrl, formData, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }

    public showPNotify(title, message, type) {
        PNotify.desktop.permission();
        new PNotify({
            title: title,
            text: message,
            type: type,
            delay: 3000,
            animation: "fade",
            styling: 'fontawesome',
            buttons: { closer: true, sticker: false },
            stack: { "dir1": "down", "dir2": "right", "firstpos1": 25, "firstpos2": (jQuery(window).width() / 2) - (Number(PNotify.prototype.options.width.replace(/\D/g, '')) / 2) },
        });
    }

    public getStaffsUrl = this.appConfig.apiHost + '/staffs';
    public getStaffs(): Observable < { result: any, staffs : any, message: string} > {
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.getStaffsUrl, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if (error.status == 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }

    public addStaffUrl = this.appConfig.apiHost + '/add-staff';
    public addStaff(email : string, phone : string, first_name : string, last_name : string): Observable < { result: any, staff : any, message: string} > {
        var params = {
            'email': email,
            'phone': phone,
            'first_name': first_name,
            'last_name': last_name
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.addStaffUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }

    public removeStaffUrl = this.appConfig.apiHost + '/remove-staff';
    public removeStaff(email : string): Observable < { result: any, message: string} > {
        var params = {
            'email': email,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.removeStaffUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }

    public sendReplyUrl = this.appConfig.apiHost + '/feedback/send-reply';
    public sendReply(content : string, id: number): Observable < { result: any, message: string} > {
        var params = {
            'content': content,
            'id': id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.sendReplyUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if(error.status == 401){
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }

    public getSettingsUrl = this.appConfig.apiHost + '/settings';
    public getSettings(): Observable < { result: any, settings : any, message: string} > {
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.getSettingsUrl, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if (error.status == 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }

    public saveSettingsUrl = this.appConfig.apiHost + '/settings';
    public saveSettings(settings : any): Observable < { result: any, message: string} > {
        var params = {
            'settings' : settings
        }
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.saveSettingsUrl,params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            //.catch((error: any) => Observable.throw(error || 'Server error'));
            .catch((error: any) => {
                if (error.status == 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }
}
