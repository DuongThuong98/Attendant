import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import {AppConfig} from '../config';

@Injectable()
export class AbsenceRequestService {
    // Resolve HTTP using the constructor
    public constructor(public  http: Http, public  appConfig: AppConfig,public  authService: AuthService,public  router : Router) {}
        // private instance variable to hold base url
    public  getRequestsByStudentUrl = this.appConfig.apiHost + '/absence-request/by-student';
    public getRequestsByStudent(id : number,status: number ,search_text: string): Observable < { result: string, absence_requests: Array < any >, message:string} > {
        var params = {
            'id': id,
            'status': status,
            'search_text': search_text
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getRequestsByStudentUrl,params,options)
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
    public  changeRequestStatusUrl = this.appConfig.apiHost + '/absence-request/change-status';
    public changeRequestStatus(id : number,status : number): Observable < { result: string, message: string } > {
        var params = {
            'id': id,
            'status': status
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.changeRequestStatusUrl,params,options)
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

    public  getAbsenceRequestsUrl = this.appConfig.apiHost + '/absence-request/list';
    public getAbsenceRequests(status:number,search_text:string, page: number = 1, limit: number = -1): Observable < { result: string, total_items: number,absence_requests: Array < any >, message:string} > {
        var params = {
            'status': status,
            'search_text': search_text,
            'page': page,
            'limit': limit,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getAbsenceRequestsUrl,params,options)
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

    public  createAbsenceRequestsUrl = this.appConfig.apiHost + '/absence-request/create';
    public createAbsenceRequests(reason:string,start_date:any,end_date:any): Observable < { result: string, message:string} > {
        var params = {
            'reason': reason,
            'start_date': start_date,
            'end_date': end_date
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.createAbsenceRequestsUrl,params,options)
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

    public  cancelAbsenceRequestsUrl = this.appConfig.apiHost + '/absence-request/cancel';
    public cancelAbsenceRequests(id:number): Observable < { result: string, message:string} > {
        var params = {
            'id': id,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.cancelAbsenceRequestsUrl,params,options)
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
