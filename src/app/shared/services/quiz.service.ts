import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { LocalStorageService } from 'angular-2-local-storage';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AppService } from './app.service';
import { AppConfig } from '../config';

@Injectable()
export class QuizService {
    // Resolve HTTP using the constructor
    public constructor(public  http: Http,public  appService: AppService,public  appConfig:AppConfig,
    public  authService: AuthService,public  router:Router, public localStorage: LocalStorageService) {}

    //load quiz template for teacher
    public getQuizByCourseAndClassUrl = this.appConfig.apiHost + '/quiz/list';
    public getQuizByCourseAndClass(course_id: number,class_id: number): Observable < { result: string, quiz_list: Array<any>, quiz_code:string, message:string} > {
        var params = {
            'course_id': course_id,
            'class_id' : class_id,
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getQuizByCourseAndClassUrl,params,options)
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

    //for teacher to load and show to student
    public getPublishedQuizUrl = this.appConfig.apiHost + '/quiz/published';
    public getPublishedQuiz(quiz_code: string): Observable < { result: string, quiz: any, message:string} > {
        var params = {
            'quiz_code': quiz_code,
        };
        let authToken = this.authService.token ? this.authService.token : this.localStorage.get('token');
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getPublishedQuizUrl,params,options)
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

    //for teacher to notify server that quiz has started
    public startQuizUrl = this.appConfig.apiHost + '/quiz/start';
    public startQuiz(quiz_code: string): Observable < { result: string, message:string} > {
        var params = {
            'quiz_code': quiz_code,
        };
        let authToken = this.authService.token ? this.authService.token : this.localStorage.get('token');
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.startQuizUrl,params,options)
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

    //For teacher to publish quiz
    public publishQuizUrl = this.appConfig.apiHost + '/quiz/publish';
    public publishQuiz(course_id: number,class_id: number,quiz: any): Observable < { result: string,quiz_code:number, message:string} > {
        var params = {
            'course_id': course_id,
            'class_id' : class_id,
            'quiz': quiz
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.publishQuizUrl,params,options)
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

    //Teacher to stop quiz midway
    public stopQuizUrl = this.appConfig.apiHost + '/quiz/stop';
    public stopQuiz(quiz_code: string): Observable < { result: string, message:string} > {
        var params = {
            'quiz_code': quiz_code
        };
        let authToken = this.authService.token ? this.authService.token : this.localStorage.get('token');
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.stopQuizUrl,params,options)
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

    //Teacher delete template quiz
    public deleteQuizUrl = this.appConfig.apiHost + '/quiz/delete';
    public deleteQuiz(quiz_id: number): Observable < { result: string, message:string} > {
        var params = {
            'quiz_id': quiz_id
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.deleteQuizUrl,params,options)
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

    //Teacher add template quiz
    public addQuizUrl = this.appConfig.apiHost + '/quiz/add';
    public addQuiz(course_id: number,class_id: number,quiz: any): Observable < { result: string, message:string} > {
        var params = {
            'course_id': course_id,
            'class_id' : class_id,
            'quiz': quiz
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.addQuizUrl,params,options)
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

    //Student join quiz
    public joinQuizUrl = this.appConfig.apiHost + '/quiz/join';
    public joinQuiz(code: string): Observable < { result: string, message:string} > {
        var params = {
            'code': code
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.joinQuizUrl,params,options)
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

    //Student quit quiz
    public quitQuizUrl = this.appConfig.apiHost + '/quiz/quit';
    public quitQuiz(code: string): Observable < { result: string, message:string} > {
        var params = {
            'code': code
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.quitQuizUrl,params,options)
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

    //Teacher save quiz and attendance
    public saveQuizUrl = this.appConfig.apiHost + '/quiz/save';
    public saveQuiz(quiz: any,checked_student_list: any): Observable < { result: string, message:string} > {
        var params = {
            'checked_student_list' : checked_student_list,
            'quiz': quiz
        };
        let authToken = this.authService.token ? this.authService.token : this.localStorage.get('token');
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.saveQuizUrl,params,options)
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

    //Teacher get misc question
    public getMiscQuestionUrl = this.appConfig.apiHost + '/quiz/misc-question';
    public getMiscQuestion(number_of_question: number): Observable < { result: string, questions:Array<any>, message:string} > {
        var params = {
            'number_of_question' : number_of_question
        };
        let authToken = this.authService.token ? this.authService.token : this.localStorage.get('token');
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.getMiscQuestionUrl,params,options)
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

    //Teacher update template quiz
    public updateQuizUrl = this.appConfig.apiHost + '/quiz/update';
    public updateQuiz(quiz: any): Observable < { result: string, message:string} > {
        var params = {
            'quiz': quiz
        };
        let authToken = this.authService.token;
        let headers = new Headers();
        headers.append('x-access-token', `${authToken}`);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.updateQuizUrl,params,options)
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