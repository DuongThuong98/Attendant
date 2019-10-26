import { Component, OnInit } from '@angular/core';
import { ScheduleService, AppService, AuthService } from '../shared/shared.module';
import { Router, ActivatedRoute, Params } from '@angular/router';
@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html'
})
export class ScheduleComponent implements OnInit {
    public constructor(public  scheduleService: ScheduleService, public  appService: AppService, public  router: Router,
    	public  authService: AuthService) {}

    public ngOnInit() {
        
    }
}
