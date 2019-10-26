import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config'
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
@Injectable()
export class CourseService {
    // Resolve HTTP using the constructor
    constructor(public  http: Http, public  appConfig: AppConfig,public  authService: AuthService,public  router :Router) {}

    public  getCourseDetailsUrl = this.appConfig.apiHost + '/course/detail';
    public getCourseDetail(id: number): Observable < { result: string, course: any , lecturers: Array < any > , TAs: Array < any > , class_has_course: Array < any > , message:string} > {
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${this.getCourseDetailsUrl}/${id}`,options)
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

    public  getCourseListsUrl = this.appConfig.apiHost + '/course/list';
    public getCourseLists(program_id: number, class_id: number,semester_id:number,searchText: string = null, sort: string = 'none', page: number = 1, limit: number = -1): Observable < { result: string, total_items: number, courses: Array < any >, message:string } > {
        var params = {
            'searchText': searchText,
            'page': page,
            'limit': limit,
            'sort': sort,
            'program_id': program_id,
            'class_id': class_id,
            'semester_id': semester_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getCourseListsUrl, params, options)
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
    public  addCourseUrl = this.appConfig.apiHost + '/course/add';
    public addCourse(code: string, name: string, lecturers: Array < any > , TAs: Array < any > , office_hour: string, note: string,
        program_id: number, classes: Array < any > ): Observable < { result: string, message: string } > {
        var params = {
            code: code,
            name: name,
            lecturers: lecturers,
            TAs: TAs,
            office_hour: office_hour,
            note: note,
            program_id: program_id,
            classes: classes,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.addCourseUrl, params, options)
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
    public  editCourseUrl = this.appConfig.apiHost + '/course/edit';
    public editCourse(id:number ,code: string, name: string, lecturers: Array < any > , TAs: Array < any > , office_hour: string, note: string): Observable < { result: string, message: string } > {
        var params = {
            id: id,
            code: code,
            name: name,
            lecturers: lecturers,
            TAs: TAs,
            office_hour: office_hour,
            note: note
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.editCourseUrl, params, options)
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
    public  getTeachingCoursesUrl = this.appConfig.apiHost + '/course/list/teaching';
    public getTeachingCourses(teacher_id: number,searchText: string = null, program_id: number = 0, class_id: number = 0): Observable < { result: string, courses: Array < any >, message:string } > {
        var params = {
            'teacher_id': teacher_id,
            'searchText': searchText,
            'program_id': program_id,
            'class_id': class_id,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getTeachingCoursesUrl, params, options)
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
    public importCourseUrl = this.appConfig.apiHost + '/course/import';
    public importCourse(class_name:string,course_list:Array<any>): Observable < { result: string, message: string } > {
        var params = {
            'class_name': class_name,
            'course_list': course_list,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.importCourseUrl, params, options)
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
    public exportCourseUrl = this.appConfig.apiHost + '/course/export';
    public exportCourse(classes_id:Array<any>): Observable < { result: string,course_lists:Array<any>, message: string } > {
        var params = {
            'classes_id': classes_id,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.exportCourseUrl, params, options)
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

    public getClassHasCourseUrl = this.appConfig.apiHost + '/course/class-has-course';
    public getClassHasCourse(): Observable < { result: string,class_has_course: Array < any >, message:string } > {
        var params = {};
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getClassHasCourseUrl, params, options)
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
    public getProgramHasCourseUrl = this.appConfig.apiHost + '/course/program-has-course';
    public getProgramHasCourse(semester_id: number): Observable < { result: string,program_has_course: Array < any >, message:string } > {
        var params = {
            'semester_id' : semester_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getProgramHasCourseUrl, params, options)
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
