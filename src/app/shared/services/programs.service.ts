import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config'
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
@Injectable()
export class ProgramsService {
    // Resolve HTTP using the constructor
    constructor(public  http: Http, public  appConfig: AppConfig,public  authService: AuthService,public  router :Router) {}

    public getProgramListsUrl = this.appConfig.apiHost + '/program/list';
    public getProgramList(searchText: string = null, sort: string = 'none', page: number = 1, limit: number = -1): Observable < { result: string, total_items: number, programs: Array < any >, message:string } > {
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
        return this.http.post(this.getProgramListsUrl, params, options)
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

    
    public addProgramUrl = this.appConfig.apiHost + '/program/create';
    public addProgram(name, code): Observable < { result: string, message: string } > {
        var params = {
            'name': name,
            'code': code,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.addProgramUrl, params, options)
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
