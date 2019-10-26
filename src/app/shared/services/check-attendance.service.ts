import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
@Injectable()
export class CheckAttendanceService {
    // Resolve HTTP using the constructor
    public constructor(public  http: Http,public  appConfig: AppConfig, public  authService: AuthService,public  router:Router) {}
    public  checkListUrl = this.appConfig.apiHost + '/check-attendance/check-list';
    public checkList(attendance_id: number, student_id: number,attendance_type: number): Observable < { result: string, message:string} > {
        var params = {
            'attendance_id': attendance_id,
            'student_id' : student_id,
            'attendance_type' : attendance_type
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.checkListUrl,params,options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if (error.status == 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }
    public  generateDelegateCodeUrl = this.appConfig.apiHost + '/attendance/generate-delegate-code';
    public generateDelegateCode(course_id: number, class_id: number): Observable < { result: string,code:string, message:string} > {
        var params = {
            'course_id': course_id,
            'class_id' : class_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.generateDelegateCodeUrl,params,options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if (error.status == 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }
    public checkDelegateCodeUrl = this.appConfig.apiHost + '/attendance/check-delegate-code';
    public checkDelegateCode(code:string): Observable < { result: string, delegate_detail:any, message:string} > {
        var params = {
            'code': code,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.checkDelegateCodeUrl,params,options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if (error.status == 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }
}