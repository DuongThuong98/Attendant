import { Component, OnInit } from '@angular/core';
import {  AppService, AuthService, SemesterService } from '../shared/shared.module';
declare var jQuery: any;
@Component({
	selector: 'app-semesters',
	templateUrl: './semesters.component.html'
})
export class SemestersComponent implements OnInit {

	public constructor(public  appService: AppService,public  authService: AuthService,public semesterService: SemesterService) {
	}

	public apiResult;
	public apiResultMessage;
    public error_message: any;
    public success_message: any;
    public sort_tag = ['none', 'asc', 'dsc'];
    public sort_index = 0;
    public searchText: string;
    public pageNumber: number = 1;
    public limit: number = 15;
    public currentPage: number = 1;
    public totalItems: number = 0;
    public itemsPerPage: number = 10;

	public ngOnInit() {
		this.getSemesterList();
        jQuery('#from_to').daterangepicker(null, function(start, end, label) {

        });
	}
	public semesters = [];
	public getSemesterList() {
        this.semesterService.getSemesterList(this.searchText, this.sort_tag[this.sort_index], this.pageNumber, this.itemsPerPage)
            .subscribe(result => {
                this.semesters = result.semesters;
                this.totalItems = result.total_items;
                this.apiResult = result.result;
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get program list", 'error');  });
    }

	public onPageChanged(event: any) {
        this.pageNumber = event.page;
        this.getSemesterList();
    }

    public onCellClick(id: any) {
        
    }

	public new_semester_name = '';
	public new_semester_vacation_time = '';
	public new_semester_start_date;
	public new_semester_end_date;
	public onAddSemester(){
		this.new_semester_name = '';
		this.new_semester_vacation_time = '';
		jQuery("#addSemesterModal").modal("show");
	}
	public confirmAddSemester(){
		this.new_semester_start_date = jQuery('#from_to').data('daterangepicker').startDate;
        this.new_semester_end_date = jQuery('#from_to').data('daterangepicker').endDate;
        this.semesterService.addSemester(this.new_semester_name,this.new_semester_start_date,this.new_semester_end_date,this.new_semester_vacation_time).subscribe(result=>{
        	this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (result.result == 'success') {
                this.getSemesterList();
                this.new_semester_name = '';
				this.new_semester_vacation_time = '';
				this.new_semester_start_date = '';
				this.new_semester_end_date = '';
                jQuery("#addSemesterModal").modal("hide");
            }
        	this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't add semester",'error');});
	}
}
