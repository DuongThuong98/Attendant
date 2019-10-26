import { Component, OnInit ,ViewChild} from '@angular/core';
import {  AppService, AuthService,ExcelService,ExportModalComponent } from '../shared/shared.module';

@Component({
	selector: 'app-statistic',
	templateUrl: './statistic.component.html'
})
export class StatisticComponent implements OnInit {

	public constructor(public  appService: AppService,public  authService: AuthService,public  excelService: ExcelService) {
	}

	public ngOnInit() {}


	@ViewChild(ExportModalComponent)
    public  exportModal: ExportModalComponent;
    public export_type;
    public export_title;

	public onExportExamineesList(){
		this.export_type = this.appService.import_export_type.examinees;
		this.export_title = 'Export Examinees';
		setTimeout(()=>{
			this.exportModal.onOpenModal();
        },500);
	}

	public onExportAttendanceSummary(){
		this.export_type = this.appService.import_export_type.attendance_summary;
		this.export_title = 'Export Attendance Summary';
		setTimeout(()=>{
			this.exportModal.onOpenModal();
        },500);
	}

	public onExportAttendanceLists(){
		this.export_type = this.appService.import_export_type.attendance_lists;
		this.export_title = 'Export Attendance Lists';
		setTimeout(()=>{
			this.exportModal.onOpenModal();
        },500);
	}

	public onExportExceededAbsence(){
		this.export_type = this.appService.import_export_type.exceeded_absence_limit;
		this.export_title = 'Export Exceeded Absences Limit';
		setTimeout(()=>{
			this.exportModal.onOpenModal();
        },500);
	}
}
