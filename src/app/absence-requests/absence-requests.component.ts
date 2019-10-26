import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService , AbsenceRequestService, AuthService} from '../shared/shared.module';
declare var jQuery: any;
@Component({
    selector: 'app-absence-requests',
    templateUrl: './absence-requests.component.html'
})
export class AbsenceRequestsComponent implements OnInit {

    public constructor(public authService: AuthService, public appService: AppService) {
    }

    public ngOnInit(): void {
    }
}
