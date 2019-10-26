import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AppService } from './app.service';
import { AppConfig } from '../config';

@Injectable()
export class FeedbackService {
    // Resolve HTTP using the constructor
    public constructor(public  http: Http,public  appService: AppService,public  appConfig:AppConfig, public  authService: AuthService,public  router:Router) {}

    public getFeedbacksUrl = this.appConfig.apiHost + '/feedback/list';
    public getFeedbacks(search_text:string, category: number, role_id: number, status: number, page: number = 1, limit: number = -1): Observable < { result: string,total_items: number, feedbacks: Array<any>, message:string} > {
        var params = {
            'search_text': search_text,
            'category' : category,
            'role_id' : role_id,
            'status' : status,
            'page': page,
            'limit': limit,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getFeedbacksUrl,params,options)
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
    public  readFeedbacksUrl = this.appConfig.apiHost + '/feedback/read';
    public readFeedbacks(feedback_id: number): Observable < { result: string, message:string} > {
        var params = {
            'feedback_id' : feedback_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.readFeedbacksUrl,params,options)
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

    public sendFeedbacksUrl = this.appConfig.apiHost + '/feedback/send';
    public sendFeedbacks(to_id:number, title: string, category:number, content:string, isAnonymous: boolean): Observable < { result: string, message:string} > {
        var params = {
            'to_id' : to_id,
            'category' : category,
            'title' : title,
            'content' :content,
            'isAnonymous': isAnonymous
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.sendFeedbacksUrl,params,options)
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

    public getFeedbackHistoryUrl = this.appConfig.apiHost + '/feedback/history';
    public getFeedbackHistory(from_to : number,search_text:string, category:number, status : number, page: number = 1, limit: number = -1): Observable < { result: string,total_items: number, feedbacks: Array<any>, message:string} > {
        var params = {
            'from_to' : from_to,
            'category' : category,
            'status' : status,
            'search_text': search_text,
            'page': page,
            'limit': limit,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getFeedbackHistoryUrl,params,options)
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

    public deleteFeedbackUrl = this.appConfig.apiHost + '/feedback/delete';
    public deleteFeedback(id: number): Observable < { result: string, message:string} > {
        var params = {
            'id' : id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.deleteFeedbackUrl,params,options)
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