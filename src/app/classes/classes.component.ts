import { Component, OnInit, ViewChild } from '@angular/core';
import {  AppService, AuthService,ExcelService,ClassesService,ImportModalComponent,ExportModalComponent } from '../shared/shared.module';
declare var jQuery: any;
@Component({
	selector: 'app-classes',
	templateUrl: './classes.component.html'
})
export class ClassesComponent implements OnInit {

	public constructor(public  appService: AppService,public  excelService: ExcelService,public  authService: AuthService,
        public classesService: ClassesService) {
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

    public programs = [];
    public current_classes: Array < any > = [];

    public selectedProgram: any;

	public ngOnInit() {
		this.appService.getSemesterProgramClass().subscribe(results => {
            this.programs = this.new_programs = results.programs;
            this.selectedProgram = this.programs.length > 0 ? this.programs[0].id : 0;
            this.getClassList();
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get semester_program_class", 'error'); });
	}

	public getClassList() {
        this.classesService.getClassList(this.selectedProgram,this.searchText, this.sort_tag[this.sort_index], this.pageNumber, this.itemsPerPage)
            .subscribe(result => {
                this.current_classes = result.classes;
                this.totalItems = result.total_items;
                this.apiResult = result.result;
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get class list", 'error');  });
    }

    public onPageChanged(event: any) {
        this.pageNumber = event.page;
        this.getClassList();
    }

    public onCellClick(id: any) {
        
    }
    public new_programs = [];
    public new_class_name = '';
	public new_class_email = '';
	public new_student_list = [];
	public addStudentFromFile = '';
	public new_class_program = 0;
	public onSelectFile(file: any) {
        this.addStudentFromFile = file;
    }
    public onRemoveFile() {
        this.addStudentFromFile = '';
    }
    public onChangeNewClassName(){
    	this.new_class_email = this.new_class_name.toLowerCase() + '@student.hcmus.edu.vn';
    }
	public onAddClass(){
		this.new_class_name = '';
        this.new_class_program = this.new_programs.length > 0 ? this.new_programs[0].id : 0;
		this.new_class_email = '@student.hcmus.edu.vn';
		jQuery("#addClassModal").modal("show");
	}

	public confirmAddClass(){
		this.excelService.readStudentListFile(this.addStudentFromFile).subscribe(result => {
			this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (this.apiResult == 'success') {
                this.new_student_list = result.student_list.slice();
        		this.classesService.addClass(this.new_class_name,this.new_class_email,this.new_class_program,this.new_student_list).subscribe(result=>{
		        	this.apiResult = result.result;
		            this.apiResultMessage = result.message;
		            if (result.result == 'success') {
		                this.getClassList();
		            }
			        this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
                    jQuery("#addClassModal").modal("hide");
		        },error=>{this.appService.showPNotify('failure',"Server Error! Can't add class",'error');});
            }
        }, error => {this.appService.showPNotify('failure',"Server Error! Can't read student list file",'error');});
	}
}
