import { Component, OnInit, Input, Output , EventEmitter} from '@angular/core';
import { AbsenceRequestService } from '../../services/absence-request.service';
import { AppService } from '../../services/app.service';
declare var jQuery: any;

@Component({
  selector: 'create-absence-request-modal',
  templateUrl: './create-absence-request-modal.component.html',
})
export class CreateAbsenceRequestModalComponent implements OnInit {
	@Input() public classes : Array<any>;
	@Output() public onConfirmed : EventEmitter<string> = new EventEmitter<string>();

    public new_reason = "";
    public new_start_date;
    public new_end_date;

    public apiResult: string;
    public apiResultMessage: string;
    public onOpenModal() {
        jQuery("#createAbsenceRequestModal").modal("show");
    }
    public onConfirmCreateRequest() {
        this.new_start_date = jQuery('#from_to').data('daterangepicker').startDate;
        this.new_end_date = jQuery('#from_to').data('daterangepicker').endDate;
        this.absenceRequestService.createAbsenceRequests(this.new_reason, this.new_start_date, this.new_end_date).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            this.appService.showPNotify(this.apiResult, this.apiResultMessage, this.apiResult == 'success' ? 'success' : 'error');
            if (this.apiResult == 'success') {
                this.new_reason = '';
                jQuery("#createAbsenceRequestModal").modal("hide");
                this.onConfirmed.emit('success');
            }
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't create absence request", 'error'); });
    }
	public constructor(public  absenceRequestService : AbsenceRequestService,public  appService: AppService) { }
	public ngOnInit() {
        jQuery('#from_to').daterangepicker(null, function(start, end, label) {

        });
	}

}