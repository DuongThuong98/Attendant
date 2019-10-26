import { Component, OnInit } from '@angular/core';
import {  AppService, AuthService, ProgramsService } from '../shared/shared.module';
declare var jQuery: any;
@Component({
	selector: 'app-programs',
	templateUrl: './programs.component.html'
})
export class ProgramsComponent implements OnInit {

	public constructor(public  appService: AppService,public programService: ProgramsService,public  authService: AuthService) {
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

    public programs: Array < any > = [];

	public ngOnInit() {
		this.getProgramList();
	}

	public getProgramList() {
        this.programService.getProgramList(this.searchText, this.sort_tag[this.sort_index], this.pageNumber, this.itemsPerPage)
            .subscribe(result => {
                this.programs = result.programs;
                this.totalItems = result.total_items;
                this.apiResult = result.result;
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get program list", 'error');  });
    }

	public onPageChanged(event: any) {
        this.pageNumber = event.page;
        this.getProgramList();
    }

    public onCellClick(id: any) {
        
    }

    public new_program_name = '';
	public new_program_code = '';
	public onAddProgram(){
		this.new_program_name = '';
		this.new_program_code = '';
		jQuery("#addProgramModal").modal("show");
	}
	public confirmAddProgram(){
		this.programService.addProgram(this.new_program_name,this.new_program_code).subscribe(result=>{
        	this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (result.result == 'success') {
                this.getProgramList();
                this.new_program_name = '';
				this.new_program_code = '';
                jQuery("#addProgramModal").modal("hide");
            }
        	this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't add class",'error');});
	}
}
