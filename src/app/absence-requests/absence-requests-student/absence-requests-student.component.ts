import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService, AbsenceRequestService, AuthService, CreateAbsenceRequestModalComponent } from '../../shared/shared.module';
declare var jQuery: any;
@Component({
    selector: 'app-absence-requests-student',
    templateUrl: './absence-requests-student.component.html'
})
export class AbsenceRequestsStudentComponent implements OnInit {

    public constructor(public router: Router, public absenceRequestService: AbsenceRequestService, public appService: AppService, public authService: AuthService) {}

    public ngOnInit(): void {
        this.getAbsenceRequests();
        this.absence_request_status.push(this.appService.absence_request_status.new);
        this.absence_request_status.push(this.appService.absence_request_status.accepted);
        this.absence_request_status.push(this.appService.absence_request_status.rejected);

        this.selectedStatus = this.appService.absence_request_status.new.id;
    }

    public apiResult: string;
    public apiResultMessage: string;
    public absence_requests = [];
    public selectedStatus;
    public absence_request_status = [];
    public search_text = '';
    public getAbsenceRequests() {
        this.absenceRequestService.getRequestsByStudent(this.authService.current_user.id, this.selectedStatus, this.search_text).subscribe(result => {
            this.absence_requests = result.absence_requests;
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get absence requests", 'error');  });
    }
    public onChangeStatus() {
        this.getAbsenceRequests();
    }
    public current_request_id = 0;
    public current_request_status = 0;
    public confirm_modal_title = '';
    public onCancelRequest(id: number) {
        jQuery('#confirmModal').modal("show");
        this.confirm_modal_title = 'Cancel this request ?';
        this.current_request_id = id;
    }


    @ViewChild(CreateAbsenceRequestModalComponent)
    public createAbsenceRequestModal: CreateAbsenceRequestModalComponent;
    public onCreateRequest() {
        this.createAbsenceRequestModal.onOpenModal();
    }
    public onRequestCreated(result:string){
        if(result == 'success'){
            this.getAbsenceRequests();
        }
    }
    public confirmAction() {
        this.absenceRequestService.cancelAbsenceRequests(this.current_request_id)
            .subscribe(result => {
                this.apiResult = result.result;
                this.apiResultMessage = result.message;
                this.appService.showPNotify(this.apiResult, this.apiResultMessage, this.apiResult == 'success' ? 'success' : 'error');
                if (this.apiResult == 'success') {
                    jQuery('#confirmModal').modal("hide");
                    this.getAbsenceRequests();
                }
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't cancel request", 'error');  });
    }
    public onSearchChange() {
        if (this.search_text.length > 3 || this.search_text.length == 0) {
            this.getAbsenceRequests();
        }
    }
}
