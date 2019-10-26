import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { StudentService, AppService,ImportModalComponent,ExportModalComponent } from '../shared/shared.module';
declare var jQuery: any;
@Component({
    selector: 'app-students',
    templateUrl: './students.component.html'
})
export class StudentsComponent implements OnInit {
    public apiResult: string;
    public apiResultMessage: any;
    public sort = 'none'; // ['none', 'asc', 'dsc'];
    public sort_tag = '';

    public semesters: Array < any > = [];
    public programs: Array < any > = [];
    public classes: Array < any > = [];

    public selected_status = this.appService.student_status.active.id;
    public student_list: Array < any > = [];
    public selectedSemester: any;
    public selectedProgram: any;
    public filteredClasses: Array < any > ;
    public selectedClasses: any;
    public searchText: string;
    public pageNumber: number = 1;
    public limit: number = 15;
    public currentPage: number = 1;
    public totalItems: number = 0;
    public itemsPerPage: number = 10;

    public newFirstName: string = "";
    public newLastName: string = "";
    public newPhone: string = "";
    public newEmail: string = "";
    public newCode: string = "";
    public newClass: number = 0;
    public newProgram: number = 0;
    public newNote: string = '';
    public constructor(public  appService: AppService, public  studentService: StudentService, public  router: Router) {}

    public ngOnInit() {
        this.getSemesterProgramClass();
    }
    public getSemesterProgramClass(){
        this.appService.getSemesterProgramClass().subscribe(results => {
            this.semesters = results.semesters;
            this.selectedSemester = this.semesters.length > 0 ? this.semesters[this.semesters.length - 1].id : 0;
            this.classes = results.classes;
            this.programs = this.new_programs = results.programs;
            this.selectedProgram = this.programs.length > 0 ? this.programs[0].id : 0;
            this.onChangeProgram();
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't semester class program", 'error'); });   
    }
    public getCurrentList() {
        this.studentService.getListStudents(this.selectedProgram, this.selectedClasses,this.selected_status,this.searchText, this.pageNumber, this.itemsPerPage)
            .subscribe(result => {
                this.student_list = result.student_list;
                this.totalItems = result.total_items;
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't student list", 'error'); });
    }

    public onChangeProgram() {
        this.filteredClasses = [{ id: 0, name: 'All Classes' }];
        for (var i = 0; i < this.classes.length; i++) {
            if (this.classes[i].program_id == this.selectedProgram) {
                this.filteredClasses.push(this.classes[i]);
            }
        }
        this.selectedClasses = this.filteredClasses[0].id;
        this.getCurrentList();
    }

    public onPageChanged(event: any) {
        this.pageNumber = event.page;
        this.getCurrentList();
    }

    public onCellClick(id: any) {
        this.router.navigate(['/students/', id]);
    }
    onChangeStudentCode(){
        this.newEmail = this.newCode + "@student.hcmus.edu.vn";
    }
    public onOpenAddStudent() {
        this.newProgram = this.programs.length > 0 ? this.new_programs[this.new_programs.length - 1].id : 0;
        this.newEmail = "@student.hcmus.edu.vn";
        this.onChangeNewProgram();
        jQuery("#addStudentModal").modal("show");
    }
    public onCancelAddStudent() {
        this.newFirstName = this.newLastName = this.newPhone = this.newEmail = this.newCode = this.newNote = '';
        this.newClass = this.newProgram = 0;
        jQuery("#addStudentModal").modal("hide");
    }
    public onAddStudent() {
        this.studentService.addStudent(this.newProgram, this.newClass, this.newCode, this.newFirstName, this.newLastName, this.newEmail, this.newPhone, this.newNote)
            .subscribe(list => {
                this.apiResult = list.result;
                this.apiResultMessage = list.message;
                if (this.apiResult == 'success') {
                    jQuery("#addStudentModal").modal("hide");
                    this.newFirstName = this.newLastName = this.newPhone = this.newEmail = this.newCode = this.newNote = '';
                    this.newClass = this.newProgram = 0;
                    this.getCurrentList();
                }
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
            }, err => { this.appService.showPNotify('failure', "Server Error! Can't add student", 'error'); });
    }
    public new_programs = [];
    public new_classes = [];
    public onChangeNewProgram() {
        this.new_classes = [];
        for (var i = 0; i < this.classes.length; i++) {
            if (this.classes[i].program_id == this.newProgram) {
                this.new_classes.push(this.classes[i]);
            }
        }
        this.newClass = this.new_classes[0].id;
    }

    @ViewChild(ImportModalComponent)
    public  importModal: ImportModalComponent;
    public onImportStudent(){
        this.importModal.onOpenModal();
    }
    public onCloseImport(event : any){
        this.getSemesterProgramClass();
    }

    @ViewChild(ExportModalComponent)
    public  exportModal: ExportModalComponent;
    public export_search_data : any = {};
    public onExportStudent(){
        this.export_search_data = {};
        this.export_search_data['search_text'] = this.searchText;
        this.export_search_data['program_id'] = this.selectedProgram;
        this.export_search_data['class_id'] = this.selectedClasses;
        this.export_search_data['status'] = this.selected_status;
        this.exportModal.onOpenModal();
    }
}
