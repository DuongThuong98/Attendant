import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
@Injectable()
export class AttendanceService {
    // Resolve HTTP using the constructor
    constructor(public  http: Http, public  appConfig: AppConfig, public  authService: AuthService, public  router: Router) {}
    public  getAttendanceListByCourseUrl = this.appConfig.apiHost + '/attendance/list-by-course';
    public getAttendanceListByCourse(course_id: number, classes_id: Array<number>): Observable < { result: string, attendance_lists: Array<any>, message: string} > {
        var params = {
            'course_id': course_id,
            'classes_id' : classes_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getAttendanceListByCourseUrl, params, options)
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
    public  checkAddToCourseUrl = this.appConfig.apiHost + '/attendance/check-add-to-course';
    public checkAddToCourse(course_id: number, student_code: string, student_name: string): Observable < { result: string, message: string} > {
        var params = {
            'course_id': course_id,
            'student_code' : student_code,
            'student_name' : student_name,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.checkAddToCourseUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            // ...errors if any
            .catch((error: any) => {
                if (error.status === 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                // this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }

    /*
    public  checkRemoveFromCourseUrl = this.appConfig.apiHost + '/attendance/check-remove-from-course';
    public checkRemoveFromCourse(course_id: number, delete_student_index: number): Observable < { result: string, message: string} > {
        var params = {
            'course_id': course_id,
            'delete_student_index': delete_student_index,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.checkRemoveFromCourseUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            // ...errors if any
            .catch((error: any) => {
                if (error.status === 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                // this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }
    */

    public  updateAttendanceListByCourseUrl = this.appConfig.apiHost + '/attendance/update-list-by-course';
    public updateAttendanceListByCourse(course_id: number, classes_id: Array<number>, attendance_lists: Array<any>): Observable < { result: string, message: string} > {
        var params = {
            'course_id': course_id,
            'classes_id': classes_id,
            'attendance_lists' : attendance_lists
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.updateAttendanceListByCourseUrl, params, options)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => {
                if (error.status === 401) {
                    this.authService.tokenExpired(this.router.url);
                }
                //this.authService.tokenExpired(this.router.url);
                return Observable.throw(error || 'Server error');
            });
    }

    public  getOpeningAttendanceUrl = this.appConfig.apiHost + '/attendance/opening-by-teacher';
    public getOpeningAttendanceCourse(teacher_id: number): Observable < { result: string, opening_attendances: Array<any>, message: string} > {
        var params = {
            'teacher_id': teacher_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getOpeningAttendanceUrl, params, options)
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

    public  createAttendanceUrl = this.appConfig.apiHost + '/attendance/create';
    public createAttendance(course_id: number, classes_id: number, teacher_id: number): Observable < { result: string, message: string} > {
        var params = {
            'course_id': course_id,
            'class_id': classes_id,
            'created_by' : teacher_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.createAttendanceUrl, params, options)
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
    public  cancelAttendanceUrl = this.appConfig.apiHost + '/attendance/delete';
    public cancelAttendance(attendance_id: number): Observable < { result: string, message: string} > {
        var params = {
            'attendance_id': attendance_id,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.cancelAttendanceUrl, params, options)
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
    public  closeAttendanceUrl = this.appConfig.apiHost + '/attendance/close';
    public closeAttendance(attendance_id: number): Observable < { result: string, message: string} > {
        var params = {
            'attendance_id': attendance_id,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.closeAttendanceUrl, params, options)
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

    public  getCheckAttendanceListUrl = this.appConfig.apiHost + '/attendance/check-attendance-list';
    public getCheckAttendanceList(course_id: number, class_id: number): Observable < { result: string, check_attendance_list: Array<any>, message: string} > {
        var params = {
            'course_id': course_id,
            'class_id' : class_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getCheckAttendanceListUrl, params, options)
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
    
    public  getAttendanceListByStudentUrl = this.appConfig.apiHost + '/attendance/list-by-student';
    public getAttendanceListByStudent(student_id: number): Observable < { result: string, attendance_list_by_student: Array<any>, message: string} > {
        var params = {
            'student_id': student_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getAttendanceListByStudentUrl, params, options)
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

    public getOpeningAttendanceForStudentUrl = this.appConfig.apiHost + '/attendance/opening-for-student';
    public getOpeningAttendanceForStudent(student_id: number): Observable < { result: string, opening_attendance_for_student: Array<any>, message: string} > {
        var params = {
            'student_id': student_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getOpeningAttendanceForStudentUrl, params, options)
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

    public requestToBeCheckAttendanceUrl = this.appConfig.apiHost + '/attendance/request_to_be_check_attendance';
    public requestToBeCheckAttendance(student_id: number, course_id: number): Observable < { result: string, message: string} > {
        var params = {
            'student_id': student_id,
            'course_id': course_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.requestToBeCheckAttendanceUrl, params, options)
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