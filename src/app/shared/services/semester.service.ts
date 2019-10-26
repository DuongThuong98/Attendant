import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config'
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
@Injectable()
export class SemesterService {
    // Resolve HTTP using the constructor
    public constructor(public  http: Http, public  appConfig: AppConfig,public  authService: AuthService,public  router :Router) {}

    public  getSemesterUrl = this.appConfig.apiHost + '/semester';
    public getSemester(id: number): Observable < { result: string, semester : any , message:string} > {
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${this.getSemesterUrl}/${id}`,options)
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

    public getSemesterListsUrl = this.appConfig.apiHost + '/semester/list';
    public getSemesterList(searchText: string = null, sort: string = 'none', page: number = 1, limit: number = -1): Observable < { result: string, total_items: number, semesters: Array < any >, message:string } > {
        var params = {
            'searchText': searchText,
            'page': page,
            'limit': limit,
            'sort': sort
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getSemesterListsUrl, params, options)
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
    
    public addSemesterUrl = this.appConfig.apiHost + '/semester/create';
    public addSemester(name, start_date, end_date, vacation_time): Observable < { result: string, message: string } > {
        var params = {
            'name': name,
            'start_date': start_date,
            'end_date': end_date,
            'vacation_time': vacation_time
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.addSemesterUrl, params, options)
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
