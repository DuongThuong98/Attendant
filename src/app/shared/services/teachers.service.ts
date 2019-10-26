import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config';
import {AuthService} from './auth.service'
import { Router } from '@angular/router';
@Injectable()
export class TeacherService {
    // Resolve HTTP using the constructor
    public constructor(public  http: Http,public  appConfig: AppConfig,public  authService: AuthService, public  router:Router) {}
        // private instance variable to hold base url
    public  getListTeachersUrl = this.appConfig.apiHost + '/teacher/list';
    public getListTeachers(searchText: string = null, page: number = 1, limit: number = 10, sort: string = 'none'): Observable < { result: string, total_items: number, teacher_list: Array<any> , message:string} > {
        var params = {
            'searchText': searchText,
            'page': page,
            'limit': limit,
            'sort': sort,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getListTeachersUrl, params, options)
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

    public  getTeacherDetailsUrl = this.appConfig.apiHost + '/teacher/detail';
    public getTeacherDetail(id: number): Observable < { result: string, teacher: any, teaching_courses: Array<any>, message:string} > {
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${this.getTeacherDetailsUrl}/${id}`,options)
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

    public  addTeacherUrl = this.appConfig.apiHost + '/teacher/add';
    public addTeacher(first_name: string, last_name: string, email: string, phone: string = null): Observable < { result: string, message: string } > {
        var params = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone': phone
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.addTeacherUrl, params, options)
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
    public  updateTeacherUrl = this.appConfig.apiHost + '/teacher/update';
    public updateTeacher(id: number,name: string, email: string, phone: string = null,avatar : string): Observable < { result: string, message: string } > {
        var params = {
            'id' : id,
            'name': name,
            'email': email,
            'phone': phone,
            'avatar': avatar
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.updateTeacherUrl, params, options)
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

    public importTeacherUrl = this.appConfig.apiHost + '/teacher/import';
    public importTeacher(teacher_list:Array<any>): Observable < { result: string, message: string } > {
        var params = {
            'teacher_list': teacher_list
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.importTeacherUrl, params, options)
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
