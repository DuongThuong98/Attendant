import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
@Injectable()
export class ScheduleService {
    // Resolve HTTP using the constructor
    public constructor(public  http: Http,public  appConfig: AppConfig, public  authService: AuthService,public  router: Router) {}
    public  updateScheduleUrl = this.appConfig.apiHost + '/schedule/update/';
    public updateSchedule(classes : any): Observable < { result: string, message : string} > {
        var params = {
            'classes': classes
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.updateScheduleUrl,params,options)
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
    public  getSchedulesAndCoursesUrl = this.appConfig.apiHost + '/schedule/schedules-and-courses/';
    public getSchedulesAndCourses(program_id:number, class_id : number, semester_id : number): Observable < { result: string, courses: Array<any> ,message : string} > {
        var params = {
            'program_id': program_id,
            'class_id': class_id,
            'semester_id': semester_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getSchedulesAndCoursesUrl,params,options)
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
    public  getSchedulesAndCoursesByStudentUrl = this.appConfig.apiHost + '/schedule/schedules-and-courses-by-student/';
    public getSchedulesAndCoursesByStudent(semester_id : number): Observable < { result: string, courses: Array<any> ,message : string} > {
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.getSchedulesAndCoursesByStudentUrl,options)
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
    public  getSchedulesAndCoursesByTeacherUrl = this.appConfig.apiHost + '/schedule/schedules-and-courses-by-teacher/';
    public getSchedulesAndCoursesByTeacher(semester_id : number): Observable < { result: string, courses: Array<any> ,message : string} > {
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.getSchedulesAndCoursesByTeacherUrl,options)
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

    public exportScheduleUrl = this.appConfig.apiHost + '/schedule/export/';
    public exportSchedule(programs : any , classes : any): Observable < { result: string, schedules: Array<any> ,message : string} > {
        let authToken = this.authService.token;
        let headers = new Headers();
        var params = {
            'programs': programs,
            'classes' : classes
        };
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.exportScheduleUrl,params,options)
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

    public importScheduleUrl = this.appConfig.apiHost + '/schedule/import';
    public importSchedule(schedule : any): Observable < { result: string ,message : string} > {
        let authToken = this.authService.token;
        let headers = new Headers();
        var params = {
            'schedule': schedule
        };
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.importScheduleUrl,params,options)
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