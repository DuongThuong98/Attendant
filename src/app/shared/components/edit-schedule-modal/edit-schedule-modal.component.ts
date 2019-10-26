import { Component, OnInit, Input, Output , EventEmitter} from '@angular/core';
declare var jQuery: any;

@Component({
  selector: 'edit-schedule-modal',
  templateUrl: './edit-schedule-modal.component.html',
})
export class EditScheduleModalComponent implements OnInit {
	@Input() public modal_id : string;
	@Input() public modal_title : string;
    @Input() public view_only: boolean = false;
	@Input() public classes : Array<any>;
	@Output() public onSave : EventEmitter<Array<string>> = new EventEmitter<Array<string>>();

	public editingCellIndex: number = -1;
    public temp_room: string = '';
    public temp_type: string = '';
    public scheduleOutput: Array<string> = [];
    public sessions = [];
    public initSessions() {
        this.sessions = [];
        for(var i = 0 ; i < this.classes.length; i++){
        	var temp_sessions = [
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		        { room: '', type: 'LT' },
		    ];
		    this.sessions.push(temp_sessions);
        }
    }
    public current_class_id = 0;
    public onChangeClass(index : any){
    	this.current_class_id = index;
    }
    public onOpenModal() {
        jQuery("#"+this.modal_id).modal("show");
        this.current_class_id = 0;
        this.initSessions();
        for(var i = 0 ; i < this.classes.length; i++){
        	if(this.classes[i].schedules == undefined || this.classes[i].schedules == '')
        		continue;
        	var schedule = this.classes[i].schedules.split(';');
	        for (var j = 0; j < schedule.length; j++) {
	            var temp = schedule[j].split('-');
	            var index = temp[0];
	            var room = temp[1];
	            var type = temp[2];
	            this.sessions[i][index].room = room;
	            this.sessions[i][index].type = type;
	        }
	        
        }
    }
    public onCancelModal() {
        this.initSessions();
        this.editingCellIndex = -1;
        jQuery("#"+this.modal_id).modal("hide");
    }
    public onSaveModal() {
        this.scheduleOutput = [];
        for (var i = 0; i < this.sessions.length; i++) {
        	var temp_schedule = '';
        	for(var j = 0 ; j < this.sessions[i].length; j++){
        		if (this.sessions[i][j].room != '') {
                	temp_schedule += j + '-' + this.sessions[i][j].room + '-' + this.sessions[i][j].type + ';';
            	}
        	}
        	this.scheduleOutput.push(temp_schedule.substr(0, temp_schedule.length - 1));
        }
        this.onSave.emit(this.scheduleOutput);
        //this.initSessions();
        jQuery("#"+this.modal_id).modal("hide");
    }
    public onCellClick(index: number) {
        this.editingCellIndex = index;
        this.temp_room = this.sessions[this.current_class_id][index].room;
        this.temp_type = this.sessions[this.current_class_id][index].type;
        setTimeout(()=>{
        	jQuery('#roomInput').focus();
        },500);
    }
    public onCancelCell() {
        this.editingCellIndex = -1;
    }
    public onRemoveCell() {
        this.sessions[this.current_class_id][this.editingCellIndex].room = '';
        this.sessions[this.current_class_id][this.editingCellIndex].type = 'LT';
        this.editingCellIndex = -1;
    }
    public onUpdateCell() {
        this.sessions[this.current_class_id][this.editingCellIndex].room = this.temp_room;
        this.sessions[this.current_class_id][this.editingCellIndex].type = this.temp_type;
        this.editingCellIndex = -1;
    }
	public constructor() { }
	public ngOnInit() {
        this.initSessions();
	}

}