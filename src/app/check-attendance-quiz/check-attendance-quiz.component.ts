import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService, AttendanceService, AuthService, AppConfig, CheckAttendanceService } from '../shared/shared.module';
import { LocalStorageService } from 'angular-2-local-storage';
declare var jQuery:any;
@Component({
    selector: 'app-check-attendance-quiz',
    templateUrl: './check-attendance-quiz.component.html'
})
export class CheckAttendanceQuizComponent implements OnInit {
    public constructor(public checkAttendanceService : CheckAttendanceService,public appConfig: AppConfig ,
        public authService: AuthService, public attendanceService: AttendanceService, public localStorage: LocalStorageService, public appService: AppService, public router: Router) {

    }
    public ngOnInit() {
        
    }
}
