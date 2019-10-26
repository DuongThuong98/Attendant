import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
@Injectable()
export class MapService {
    // Resolve HTTP using the constructor
    constructor(public  http: Http, public  appConfig: AppConfig, public  authService: AuthService, public  router: Router) {}
    public  getMapUrl = 'http://checkingattendance.000webhostapp.com/LogAPI/getLog.php';
    public getMap(): Observable < { result: string, message: string} > {
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.getMapUrl)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.toString())
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