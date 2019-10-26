import { Component, OnInit, Input, Output , EventEmitter} from '@angular/core';
declare var jQuery: any;

@Component({
  selector: 'result-message-modal',
  templateUrl: './result-message-modal.component.html',
})
export class ResultMessageModalComponent implements OnInit {
	@Input() public modal_message : string;
	@Input() public modal_title : string;

    public onOpenModal() {
        jQuery("#resultMessageModal").modal("show");
    }
    public onCancelModal() {
        jQuery("#resultMessageModal").modal("hide");
    }
    public onSaveModal() {
        jQuery("#resultMessageModal").modal("hide");
    }
	public constructor() { }
	public ngOnInit() {
	}

}