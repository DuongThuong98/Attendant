import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService} from './auth.service';
import { AppService } from './app.service';
import { LocalStorageService } from 'angular-2-local-storage';
@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild, CanLoad {
    public constructor(public  appService: AppService, public  authService: AuthService, public  router: Router,public  localStorage : LocalStorageService) {}

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;

        return this.checkLogin(url);
    }
    public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }
    public canLoad(route: Route): boolean {
        let url = `/${route.path}`;

        return this.checkLogin(url);
    }

    public checkRole(url:string): boolean{
        if(this.authService.current_user.role_id == this.appService.userType.teacher){
            if(
                url.indexOf('/statistic') >= 0 ||
                url.indexOf("/semesters") >= 0 ||
                url.indexOf("/classes") >= 0  ||
                url.indexOf("/programs") >= 0 ||
                url.indexOf("/settings") >= 0 ||
                url.indexOf("/absence-requests") >= 0 ||
                url.indexOf('/teachers') >= 0 ||
                url.indexOf('/courses/add') >= 0 ||
                (url.indexOf('/courses') >= 0  && url.indexOf('/edit') >= 0) ||
                url.indexOf('/students') >= 0
                ){
                this.router.navigate(['/dashboard']);
                return false;
            }else{    
                return true;
            }
        }
        if(this.authService.current_user.role_id == this.appService.userType.student){
            if(
                url.indexOf('/statistic') >= 0 ||
                url.indexOf("/semesters") >= 0 ||
                url.indexOf("/classes") >= 0  ||
                url.indexOf("/programs") >= 0 ||
                url.indexOf("/settings") >= 0 ||
                url.indexOf('/teachers') >= 0 ||
                url.indexOf('/courses') >= 0 ||
                url.indexOf('/students') >= 0 ||
                url == '/quiz' ||
                url == '/quiz/display'
                ){
                this.router.navigate(['/dashboard']);
                return false;
            }else{    
                return true;
            }
        }
        if(this.authService.current_user.role_id == this.appService.userType.staff){
            if(
                url.indexOf("/settings") >= 0 ||
                url.indexOf('/check-attendance') >= 0 ||
                url == '/quiz' ||
                url == '/quiz/display'
                ){
                this.router.navigate(['/dashboard']);
                return false;
            }else{    
                return true;
            }
        }
        if(this.authService.current_user.role_id == this.appService.userType.admin){
            if(
                url.indexOf('/statistic') >= 0 ||
                url.indexOf("/semesters") >= 0 ||
                url.indexOf("/classes") >= 0  ||
                url.indexOf("/programs") >= 0 ||
                url.indexOf('/teachers') >= 0 ||
                url.indexOf('/courses') >= 0 ||
                url.indexOf('/students') >= 0 ||
                url.indexOf('/check-attendance') >= 0 ||
                url.indexOf("/absence-requests") >= 0 ||
                url == '/quiz' ||
                url == '/quiz/display'
                ){
                this.router.navigate(['/dashboard']);
                return false;
            }else{    
                return true;
            }
        }
        return true;
    }
    public checkLogin(url: string): boolean {
        if (this.localStorage.get('isLoggedIn')) {
            this.authService.current_user = this.localStorage.get('current_user');
            this.authService.token = this.localStorage.get('token').toString();
            return this.checkRole(url);
        }

        // Store the attempted URL for redirecting
        this.authService.redirectUrl = url;
        this.authService.redirectMessage = 'You have to login first!';
        // Navigate to the login page with extras
        this.router.navigate(['/login']);
        return false;
    }
}
