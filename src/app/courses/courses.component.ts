import { Component, OnInit,ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CourseService, AppService,ImportModalComponent,ExportModalComponent } from '../shared/shared.module';

@Component({
    selector: 'app-courses',
    templateUrl: './courses.component.html'
})
export class CoursesComponent implements OnInit {
    public isCollapsed = true;

    public apiCallResult: string;
    public error_message: any;
    public success_message: any;
    public sort_tag = ['none', 'asc', 'dsc'];
    public sort_index = 0;

    public semesters: Array < any > = [];
    public programs: Array < any > = [];
    public classes: Array < any > = [];

    public current_courses: Array < any > = [];
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

    public newCourseName :string = ""; newCourseCode :string = ""; newCourseLecturer:string = "" ; newCourseTA:string = "";
    

    public constructor(public appService: AppService, public courseService: CourseService, public router: Router) {}
    public getCourseList() {
        this.courseService.getCourseLists(this.selectedProgram, this.selectedClasses,this.selectedSemester,this.searchText, this.sort_tag[this.sort_index], this.pageNumber, this.itemsPerPage)
            .subscribe(result => {
                this.current_courses = result.courses;
                this.totalItems = result.total_items;
                this.apiCallResult = result.result;
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get course list", 'error');  });
    }

    public onChangeProgram() {
        this.filteredClasses = [{ id: 0, name: 'All Classes' }];
        for (var i = 0; i < this.classes.length; i++) {
            if (this.classes[i].program_id == this.selectedProgram) {
                this.filteredClasses.push(this.classes[i]);
            }
        }
        this.selectedClasses = this.filteredClasses[0].id;
        this.getCourseList();
    }

    public onPageChanged(event: any) {
        this.pageNumber = event.page;
        this.getCourseList();
    }
    public ngOnInit() {
        this.appService.getSemesterProgramClass().subscribe(results => {
            this.semesters = results.semesters;
            this.selectedSemester = this.semesters.length > 0 ? this.semesters[this.semesters.length - 1].id : 0;
            this.classes = results.classes;
            this.programs = results.programs;
            this.selectedProgram = this.programs.length > 0 ? this.programs[0].id : 0;
            this.onChangeProgram();
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get semester_program_class", 'error'); });
    }

    public onCellClick(id: any) {
        this.router.navigate(['/courses/', id]);
    }
    public onAddCourse() {
        this.router.navigate(['/courses/add']);
    }
    
    @ViewChild(ImportModalComponent)
    public  importModal: ImportModalComponent;
    public onImportCourse(){
        this.importModal.onOpenModal();
    }
    public onCloseImport(event : any){
        this.getCourseList();
    }

    @ViewChild(ExportModalComponent)
    public  exportModal: ExportModalComponent;
    public export_search_data : any = {};
    public onExportCourse(){
        this.export_search_data = {};
        this.export_search_data['program_id'] = this.selectedProgram;
        this.export_search_data['class_id'] = this.selectedClasses;
        this.export_search_data['semester_id'] = this.selectedSemester;
        this.export_search_data['search_text'] = this.searchText;
        this.exportModal.onOpenModal();
    }
}
