import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthService,AppService, ResultMessageModalComponent } from '../../shared/shared.module';
declare let jQuery: any;
@Component({
    selector: 'course-detail',
    templateUrl: './course-detail.component.html'
})
export class CourseDetailComponent implements OnInit {
   

    public constructor(public  route: ActivatedRoute, public  router: Router,public  appService: AppService, public  authService: AuthService) {}

    
    public ngOnInit(): void {
    }
}
