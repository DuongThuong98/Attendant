import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, Operator } from 'rxjs';
import { AppConfig } from '../config'
import { Router } from '@angular/router';

import { LocalStorageService } from 'angular-2-local-storage';

@Injectable()
export class AuthService {
	public constructor(public  http: Http,public  appConfig : AppConfig,public  router:Router,public  localStorage : LocalStorageService) {}
    // isLoggedIn: boolean = false;
    public token :string = '';
    // store the URL to redirect after logging in
    public redirectUrl: string;
    public redirectMessage: string;
    public current_user : any;

    public tokenExpired(redirectUrl: string){
        this.redirectUrl = redirectUrl;
        this.redirectMessage = 'Your session is expired. Please login again!';
        this.logout();
        this.router.navigate(['/login']);
    }

    public loginUrl = this.appConfig.host + '/authenticate/login';
    public login(username : string, password: string): Observable < { result: string, message: string ,token: string, user: any} > {
        var params = {
            'username': username,
            'password': password
        };
        return this.http.post(this.loginUrl, params)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => Observable.throw(error || 'Server error'));
    }

    public  logoutUrl = this.appConfig.host + '/authenticate/logout';
    public logout(): void {
        var params = {
            'token': this.token,
        };
        //this.http.post(this.logoutUrl, params).catch((error: any) => Observable.throw(error || 'Server error'));

        this.token = '';
        this.current_user = '';
        //delete from localStorage
        this.localStorage.set('isLoggedIn',false);
        this.localStorage.remove('token','current_user');
    }

    public  forgotPasswordUrl = this.appConfig.host + '/authenticate/forgot-password';
    public forgotPassword(email : string): Observable < { result: string, message: string} > {
        this.token = '';
        this.current_user = '';
        this.localStorage.set('isLoggedIn',false);
        this.localStorage.remove('token','current_user');
        var params = {
            'email': email,
        };
        return this.http.post(this.forgotPasswordUrl, params)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => Observable.throw(error || 'Server error'));
    }
    public  resetPasswordCheckUrl = this.appConfig.host + '/authenticate/reset-password-check';
    public resetPasswordCheck(token : string): Observable < { result: string, message: string} > {
        var params = {
            'token': token,
        };
        return this.http.post(this.resetPasswordCheckUrl, params)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error || 'Server error'));
    }
    public  resetPasswordUrl = this.appConfig.host + '/authenticate/reset-password';
    public resetPassword(password : string,confirm_password: string,token:string): Observable < { result: string, message: string} > {
        var params = {
            'password': password,
            'confirm_password': confirm_password,
            'token': token
        };
        return this.http.post(this.resetPasswordUrl, params)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => Observable.throw(error || 'Server error'));
    }

    public saveCurrentUserToLocal(){
        this.localStorage.set('current_user',this.current_user);
    }

    public registerCheckUrl = this.appConfig.host + '/authenticate/register-check';
    public registerCheck(token : string): Observable < { result: string,user: any, message: string} > {
        var params = {
            'token': token,
        };
        return this.http.post(this.registerCheckUrl, params)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error || 'Server error'));
    }
    public registerUrl = this.appConfig.host + '/authenticate/register';
    public register(first_name:string, last_name:string, phone: string, avatar:string, password : string,confirm_password: string,token:string): Observable < { result: string, message: string} > {
        var params = {
            'first_name': first_name,
            'last_name': last_name,
            'phone': phone,
            'avatar': avatar,
            'password': password,
            'confirm_password': confirm_password,
            'token': token
        };
        return this.http.post(this.registerUrl, params)
            // ...and calling .json() on the response to return data
            .map((res: Response) => res.json())
            //...errors if any
            .catch((error: any) => Observable.throw(error || 'Server error'));
    }
}
