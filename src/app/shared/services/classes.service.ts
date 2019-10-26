import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config'
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
@Injectable()
export class ClassesService {
    // Resolve HTTP using the constructor
    constructor(public  http: Http, public  appConfig: AppConfig,public  authService: AuthService,public  router :Router) {}

    public getClassListsUrl = this.appConfig.apiHost + '/class/list';
    public getClassList(program_id: number,searchText: string = null, sort: string = 'none', page: number = 1, limit: number = -1): Observable < { result: string, total_items: number, classes: Array < any >, message:string } > {
        var params = {
            'searchText': searchText,
            'page': page,
            'limit': limit,
            'sort': sort,
            'program_id': program_id,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getClassListsUrl, params, options)
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

    public addClassUrl = this.appConfig.apiHost + '/class/create';
    public addClass(name, email, program_id, student_list: Array < any > = []): Observable < { result: string, message: string } > {
        var params = {
            'name': name,
            'email': email,
            'program_id': program_id,
            'student_list': student_list
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.addClassUrl, params, options)
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
