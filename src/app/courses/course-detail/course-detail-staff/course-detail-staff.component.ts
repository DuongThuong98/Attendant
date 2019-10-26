import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CourseService, StudentService, AttendanceService, AppService,MapService , EditScheduleModalComponent,
 ScheduleService, ResultMessageModalComponent, AuthService, ExcelService, ImportModalComponent, MapModalComponent } from '../../../shared/shared.module';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
 declare let jQuery: any;
@Component({
    selector: 'course-detail-staff',
    templateUrl: './course-detail-staff.component.html'
})
export class CourseDetailStaffComponent implements OnInit {
    public schedules = [];
    public course_not_found = false;
    public course_id: any;
    public course: Array < any > = [];
    public lecturers: Array < any > = [];
    public TAs: Array < any > = [];
    public class_has_course: Array < any > = [{
        classId: 0,
        class_name: '',
        schedule: '',
        isAddStudentFromCLass: true,
        addStudentFromFile: '',
        studentListFromFile: [],
    }];
    public attendance_lists: Array < any > = [];
    public attendance_list: Array < any > = [];
    public apiResult: string;
    public apiResultMessage: string;
    @ViewChild(ResultMessageModalComponent)
    public  resultMessageModal: ResultMessageModalComponent;

    public constructor(public route: ActivatedRoute, public studentService: StudentService, public  router: Router,
        public  appService: AppService, public  courseService: CourseService, public  attendanceService: AttendanceService,
         public  scheduleService: ScheduleService, public authService: AuthService,public excelService: ExcelService, public mapService: MapService) {}

    public getAttendanceList() {
        var classes_id: Array<number> = [];
        for(var i = 0 ; i < this.class_has_course.length; i++) {
            classes_id.push(this.class_has_course[i].class_id);
        }
        this.attendanceService.getAttendanceListByCourse(this.course_id, classes_id).subscribe(result => {
            this.apiResult = result.result;
            this.attendance_lists = result.attendance_lists;
            this.onChangeClass(0);
            this.cloneAttendanceList(true);
        }, error => { this.appService.showPNotify('failure', 'Server Error! Can\'t get attendance_list', 'error'); });
    }

    public ngOnInit(): void {
        this.route.params.subscribe(params => { this.course_id = params['id']; });
        // get course info
        this.courseService.getCourseDetail(this.course_id).subscribe(result => {
            this.course = result.course;
            this.lecturers = result.lecturers;
            this.TAs = result.TAs;
            this.class_has_course = result.class_has_course;
            if (this.course === undefined || this.course == null) {
                this.course_not_found = true;
            }else {
                // get student list
                this.getAttendanceList();
            }
        }, error => { this.appService.showPNotify('failure', 'Server Error! Can\'t get course detail', 'error'); });
    }

    public onEditCourse() {
        this.router.navigate(['/courses/', this.course_id, 'edit']);
    }

    //Schedule
    @ViewChild(EditScheduleModalComponent)
    public  editScheduleModal: EditScheduleModalComponent;

    public scheduleModal = {
        id: 'scheduleModal',
        title: 'Schedule'
    }
    public onSaveSchedule(schedule: Array < string > ) {
        //this.course.schedule = schedule;
        for (var i = 0; i < this.class_has_course.length; i++) {
            this.class_has_course[i].schedules = schedule[i];
        }
        this.scheduleService.updateSchedule(this.class_has_course).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            //this.resultMessageModal.onOpenModal();
            this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
        }, error => { this.appService.showPNotify('failure',"Server Error! Can't save schedule",'error');});
    }
    public onOpenSchedule() {
        this.editScheduleModal.onOpenModal();
    }

    public isEdittingAttendance = false;
    public temp_attendance_lists: Array < any > = [];
    public selected_class_index = 0;
    public onChangeClass(index){
        this.selected_class_index = index;
        this.attendance_list = this.attendance_lists[index];
        for(var i = 0; i < this.attendance_list.length;i++){
            for(var j = 0 ; j < this.attendance_list[i].attendance_details.length; j++){
                switch (this.attendance_list[i].attendance_details[j].attendance_type) {
                    case this.appService.attendance_type.checklist:
                        this.attendance_list[i].attendance_details[j]['icon'] = 'fa-check';
                        this.attendance_list[i].attendance_details[j]['method'] = 'Checklist';
                        break;
                    case this.appService.attendance_type.qr:
                        this.attendance_list[i].attendance_details[j]['icon'] = 'fa-qrcode';
                        this.attendance_list[i].attendance_details[j]['method'] = 'QR Code';
                        break;
                    case this.appService.attendance_type.quiz:
                        this.attendance_list[i].attendance_details[j]['icon'] = 'fa-question-circle';
                        this.attendance_list[i].attendance_details[j]['method'] = 'Quiz';
                        break;
                    case this.appService.attendance_type.permited_absent:
                        this.attendance_list[i].attendance_details[j]['icon'] = 'fa-envelope-square';
                        this.attendance_list[i].attendance_details[j]['method'] = 'Permited Absent';
                        break;        
                    default:
                        this.attendance_list[i].attendance_details[j]['icon'] = '';
                        this.attendance_list[i].attendance_details[j]['method'] = 'Absent';
                        break;
                }
            }
        }
    }

    public cloneAttendanceList(isTempDes: boolean) {
        if (isTempDes) {
            console.log('Temp_attendance_lists is destroyed, Cloning attendance lists');
            this.temp_attendance_lists = [];
            for(var k = 0 ; k < this.attendance_lists.length; k++) {
                var temp_attendance_list = [];
                for (var i = 0; i < this.attendance_lists[k].length; i++) {
                    var attendance = {
                        id: this.attendance_lists[k][i].id,
                        code: this.attendance_lists[k][i].code,
                        name: this.attendance_lists[k][i].name,
                        exemption: this.attendance_lists[k][i].exemption,
                        attendance_details: []
                    };
                    for (var j = 0; j < this.attendance_lists[k][i].attendance_details.length; j++) {
                        var attendance_detail = {
                            attendance_id: this.attendance_lists[k][i].attendance_details[j].attendance_id,
                            attendance_type: this.attendance_lists[k][i].attendance_details[j].attendance_type,
                            attendance_time: this.attendance_lists[k][i].attendance_details[j].attendance_time,
                            created_at: this.attendance_lists[k][i].attendance_details[j].created_at,
                            edited_reason: this.attendance_lists[k][i].attendance_details[j].edited_reason,
                            edited_by: this.attendance_lists[k][i].attendance_details[j].edited_by,
                            editor: this.attendance_lists[k][i].attendance_details[j].editor,
                            icon: this.attendance_lists[k][i].attendance_details[j].icon,
                            method: this.attendance_lists[k][i].attendance_details[j].method,
                        };
                        attendance.attendance_details.push(attendance_detail);
                    }
                    temp_attendance_list.push(attendance);
                }
                this.temp_attendance_lists.push(temp_attendance_list);
            }
        } else {
            console.log('Temp_attendance_lists exists, no cloning, pushing temp_lists back to attendance_lists');
            this.attendance_lists = [];
            for (var k = 0; k < this.temp_attendance_lists.length; k++) {
                var attendance_list = [];
                for (var i = 0; i < this.temp_attendance_lists[k].length; i++) {
                    var attendance = {
                        id: this.temp_attendance_lists[k][i].id,
                        code: this.temp_attendance_lists[k][i].code,
                        name: this.temp_attendance_lists[k][i].name,
                        exemption: this.temp_attendance_lists[k][i].exemption,
                        attendance_details: []
                    };
                    for (var j = 0; j < this.temp_attendance_lists[k][i].attendance_details.length; j++) {
                        var attendance_detail = {
                            attendance_id: this.temp_attendance_lists[k][i].attendance_details[j].attendance_id,
                            attendance_type: this.temp_attendance_lists[k][i].attendance_details[j].attendance_type,
                            attendance_time: this.temp_attendance_lists[k][i].attendance_details[j].attendance_time,
                            created_at: this.temp_attendance_lists[k][i].attendance_details[j].created_at,
                            edited_reason: this.temp_attendance_lists[k][i].attendance_details[j].edited_reason,
                            edited_by: this.temp_attendance_lists[k][i].attendance_details[j].edited_by,
                            editor: this.temp_attendance_lists[k][i].attendance_details[j].editor,
                            icon: this.temp_attendance_lists[k][i].attendance_details[j].icon,
                            method: this.temp_attendance_lists[k][i].attendance_details[j].method,
                        };
                        attendance.attendance_details.push(attendance_detail);
                    }
                    attendance_list.push(attendance);
                }
                this.attendance_lists.push(attendance_list);
            }
        }
    }

    public onEditAttendance() {
        this.isEdittingAttendance = true;
        this.cloneAttendanceList(true);
    }
    public onCancelEditAttendance() {
        this.isEdittingAttendance = false;
    }
    public onSaveEditAttendance() {
        // this.cloneAttendanceList(false); // Push temp_lists back to attendance_lists
        console.log('onSaveEditAttendanceClick');
        let classes_id: Array<number> = [];
        for (let i = 0 ; i < this.class_has_course.length; i++) {
            classes_id.push(this.class_has_course[i].class_id);
        }
        this.attendanceService.updateAttendanceListByCourse(this.course_id, classes_id, this.temp_attendance_lists)
        .subscribe(results => {
            if (results.result === 'success') {
                this.cloneAttendanceList(false);
                this.onChangeClass(this.selected_class_index);
                this.isEdittingAttendance = false;
                console.log('Save successfully');
            }else {
                // this.cloneAttendanceList(true);
                // this.onChangeClass(this.selected_class_index);
                // this.isEdittingAttendance = true;
                console.log('Save failed');
            }
            this.apiResult = results.result;
            this.apiResultMessage = results.message;
            this.resultMessageModal.onOpenModal();
            this.appService.showPNotify(this.apiResult, this.apiResultMessage,this.apiResult === 'success' ? 'success' : 'error');
        }, error => {this.appService.showPNotify('failure', 'Server Error! Can\'t get save attendance', 'error'); });
    }

    public edit_attendance_reason = '';
    public current_attendance_index = 0;
    public current_attendance_detail_index = 0;
    public onAttendanceCheckClick(attendance_index: number, attendance_detail_index: number) {
        jQuery('#confirmChangeAttendanceDetailModal').modal('show');
        this.current_attendance_index = attendance_index;
        this.current_attendance_detail_index = attendance_detail_index;
    }
    public confirmChangeAttendanceDetail() {
        if (this.edit_attendance_reason === '') {
            this.appService.showPNotify('failure',"Error! Reason is required to change attendance detail",'error'); 
        }else {
            if (this.temp_attendance_lists[this.selected_class_index][this.current_attendance_index].attendance_details[this.current_attendance_detail_index].attendance_type) {
                this.temp_attendance_lists[this.selected_class_index][this.current_attendance_index].attendance_details[this.current_attendance_detail_index].attendance_type = this.appService.attendance_type.absent;
                this.temp_attendance_lists[this.selected_class_index][this.current_attendance_index].attendance_details[this.current_attendance_detail_index].icon = '';
                this.temp_attendance_lists[this.selected_class_index][this.current_attendance_index].attendance_details[this.current_attendance_detail_index].method = 'Absent';
            } else {
                this.temp_attendance_lists[this.selected_class_index][this.current_attendance_index].attendance_details[this.current_attendance_detail_index].attendance_type = this.appService.attendance_type.checklist;
                this.temp_attendance_lists[this.selected_class_index][this.current_attendance_index].attendance_details[this.current_attendance_detail_index].icon = 'fa-check';
                this.temp_attendance_lists[this.selected_class_index][this.current_attendance_index].attendance_details[this.current_attendance_detail_index].method = 'Checklist';
            }
            this.temp_attendance_lists[this.selected_class_index][this.current_attendance_index].attendance_details[this.current_attendance_detail_index].attendance_time = new Date();
            this.temp_attendance_lists[this.selected_class_index][this.current_attendance_index].attendance_details[this.current_attendance_detail_index].edited_by = this.authService.current_user.id;
            this.temp_attendance_lists[this.selected_class_index][this.current_attendance_index].attendance_details[this.current_attendance_detail_index].edited_reason = this.edit_attendance_reason;
            this.temp_attendance_lists[this.selected_class_index][this.current_attendance_index].attendance_details[this.current_attendance_detail_index].editor = this.authService.current_user.first_name + ' ' + this.authService.current_user.last_name;
            jQuery('#confirmChangeAttendanceDetailModal').modal('hide');
        }
    }

    public new_code: string = '';
    public new_name: string = '';
    public keyDownFunction(event) {
      if (event.keyCode === 13) {
        this.onAddToAttendanceList();
      }
    }
    public getSearchingStudentDetail(){
        if(this.new_code.length > 6){
            this.studentService.getStudentDetailByCode(this.new_code).subscribe(result=>{
                if(result.result == 'success'){
                    this.new_name = result.student.first_name + ' ' + result.student.last_name;
                }
                else{
                    this.new_name = '';
                }
            },error =>{console.log(error)});
        }
    }
    public onAddToAttendanceList() {
        this.attendanceService.checkAddToCourse(this.course_id, this.new_code, this.new_name).subscribe(results => {
            if (results.result === 'success') {
                var attendance = {
                    id: 0,
                    code: this.new_code,
                    name: this.new_name,
                    exemption: this.appService.attendance_status.normal,
                    attendance_details: []
                };
                for (var j = 0; j < this.temp_attendance_lists[this.selected_class_index][0].attendance_details.length; j++) {
                    var attendance_detail = {
                        attendance_id: this.attendance_lists[this.selected_class_index][0].attendance_details[j].attendance_id,
                        attendance_type: 0,
                        attendance_time: new Date(),
                        created_at: this.attendance_lists[this.selected_class_index][0].attendance_details[j].created_at,
                        edited_by: null,
                        edited_reason: null,
                        icon : '',
                        method : 'Absent'
                    };
                    attendance.attendance_details.push(attendance_detail);
                }
                this.temp_attendance_lists[this.selected_class_index].push(attendance);
                this.new_name = '';
                this.new_code = '';
            }else {
                this.apiResult = results.result;
                this.apiResultMessage = results.message;
                // this.resultMessageModal.onOpenModal();
                this.appService.showPNotify(this.apiResult, this.apiResultMessage, this.apiResult === 'success' ? 'success' : 'error');
            }
        }, error => {this.appService.showPNotify('failure', 'Server Error! Can\'t check student', 'error'); });
    }

    public delete_student_index = 0;
    public onRemoveAttendanceClick(index: number) {
        console.log('onRemoveAttendanceClick');
        jQuery('#confirmRemoveModal').modal('show');
        this.delete_student_index = index;
        console.log(this.delete_student_index);
    }

    // Function working on interface, missing query to update changes back to the database
    public onRemoveFromAttendanceList() {
        console.log('confirmRemoveAttendance');

        /*
        this.attendanceService.checkRemoveFromCourse(this.course_id, this.delete_student_index).subscribe(results => {
            if (results.result === 'success') {
                // Remove the student at delete_index
                this.temp_attendance_lists[this.selected_class_index].splice(this.delete_student_index, 1);
                console.log('Remove succesfully');
            }else {
                this.apiResult = results.result;
                this.apiResultMessage = results.message;
                // this.resultMessageModal.onOpenModal();
                this.appService.showPNotify(this.apiResult, this.apiResultMessage, this.apiResult === 'success' ? 'success' : 'error');
            }
        }, error => {this.appService.showPNotify('failure', 'Server Error! Can\'t check student', 'error'); });
        */

        // Remove the student at delete_index
        this.temp_attendance_lists[this.selected_class_index].splice(this.delete_student_index, 1);
        console.log('Remove student successfully');
    }

    public import_title;
    @ViewChild(ImportModalComponent)
    public  importModal: ImportModalComponent;
    public onCloseImport(attendance_list : any){
        if(attendance_list == 'close'){
            return;
        }
        const temp_attendance_list = this.temp_attendance_lists[this.selected_class_index];
        for(let i = 0 ; i < attendance_list.length; i++){
            let check_new_student = true;
            for(let j = 0 ; j < temp_attendance_list.length; j++){
                if(attendance_list[i].code.toString() === temp_attendance_list[j].code.toString()){
                    let length = 0;
                    if (attendance_list[i].attendance_details.length < temp_attendance_list[j].attendance_details.length){
                        length = attendance_list[i].attendance_details.length;
                    }else{
                        length = temp_attendance_list[j].attendance_details.length;
                    }
                    for (let k = 0 ; k < length; k++){
                        temp_attendance_list[j].attendance_details[k].attendance_type = attendance_list[i].attendance_details[k].attendance_type;
                        temp_attendance_list[j].attendance_details[k].attendance_time = new Date();
                        temp_attendance_list[j].attendance_details[k].icon = attendance_list[i].attendance_details[k].icon;
                        temp_attendance_list[j].attendance_details[k].method = attendance_list[i].attendance_details[k].method;
                    }
                    check_new_student = false;
                    break;
                }
            }
            if (check_new_student){
                const attendance = {
                    id: 0,
                    code: attendance_list[i].code,
                    name: attendance_list[i].name,
                    exemption : attendance_list[i].exemption,
                    attendance_details: []
                };
                if (temp_attendance_list.length > 0 && temp_attendance_list[0].attendance_details.length > 0){
                    let length = 0;
                    if (attendance_list[i].attendance_details.length < temp_attendance_list[0].attendance_details.length){
                        length = attendance_list[i].attendance_details.length;
                    }else{
                        length = temp_attendance_list[0].attendance_details.length;
                    }
                    for (let j = 0; j < length; j++) {
                        const attendance_detail = {
                            attendance_id: temp_attendance_list[0].attendance_details[j].attendance_id,
                            attendance_type: attendance_list[i].attendance_details[j].attendance_type,
                            attendance_time: new Date(),
                            created_at: temp_attendance_list[0].attendance_details[j].created_at,
                            edited_reason: null,
                            edited_by: null,
                            editor: null,
                            icon: attendance_list[i].attendance_details[j].icon,
                            method: attendance_list[i].attendance_details[j].method,
                        };
                        attendance.attendance_details.push(attendance_detail);
                    }
                }
                temp_attendance_list.push(attendance);
            }
        }
    }
    public onImportAttendanceList(){
        this.import_title = 'Load Attendance List For ' + this.class_has_course[this.selected_class_index].class_name;
        this.importModal.onOpenModal();
    }
    
    
    public map_title;
    @ViewChild(MapModalComponent)
    public  mapModal: MapModalComponent;
    public onMapAttendanceList(){
        this.map_title = 'Load Location List For ' + this.class_has_course[this.selected_class_index].class_name;
        this.mapModal.onOpenModal();
    }
    

    public onExportAttendanceList(){
        let lecturers = '';
        for (let i = 0; i < this.lecturers.length; i++){
            lecturers += this.lecturers[i].first_name + ' ' + this.lecturers[i].last_name + '\r\n';
        }
        this.excelService.writeAttendanceList(
            this.attendance_list,
            this.course['code'] + ' - ' + this.course['name'] + ' - ' + this.class_has_course[this.selected_class_index].class_name + ' (' + this.course['semester_name'] + ')',
            lecturers
            );
    }
    public onTemplateAttendanceList(){
        let lecturers = '';
        for (let i = 0; i < this.lecturers.length; i++){
            lecturers += this.lecturers[i].first_name + ' ' + this.lecturers[i].last_name + '\r\n';
        }
        var file_name = this.course['code'] + ' - ' + this.course['name'] + ' - ' + this.class_has_course[this.selected_class_index].class_name + ' (' + this.course['semester_name'] + ')'        
        var dd = {
            pageOrientation: 'landscape',
            pageMargins: [ 10, 10, 10, 10 ],
            content: [
                {
                columns: [
                {
                    width: '*',
                    text:[
                    {text: 'Checking Attendend ' + file_name , style: 'header'},
                    {text: '\nTeacher ' + lecturers, style: 'subheader'}
                    ]
                },
                {
                    qr : file_name,
                    width: 'auto'
                } 
            ]

                },
                {
                    style: 'tableExample',
                    color: '#444',
                    table: {
                        body: [
                            [ {text: 'No', style: 'tableHeader'},
                            {text: 'ID', style: 'tableHeader'},
                            {text: 'Name', style: 'tableHeader'},
                            { text: 'Week 1', style: 'tableHeader', colSpan: 2},
                            '',
                            { text: 'Week 2', style: 'tableHeader', colSpan: 2},
                            '',
                            { text: 'Week 3', style: 'tableHeader', colSpan: 2},
                            '',
                            { text: 'Week 4', style: 'tableHeader', colSpan: 2},
                            '',
                            { text: 'Week 5', style: 'tableHeader', colSpan: 2},
                            '',
                            { text: 'Week 6', style: 'tableHeader', colSpan: 2},
                            '',
                            { text: 'Week 7', style: 'tableHeader', colSpan: 2},
                            '',
                            { text: 'Week 8', style: 'tableHeader', colSpan: 2},
                            '',
                            { text: 'Week 9', style: 'tableHeader', colSpan: 2},
                            '',
                            { text: 'Week 10', style: 'tableHeader', colSpan: 2},
                            '',
                            { text: 'Week 11', style: 'tableHeader', colSpan: 2},
                            ''
                            ]
                        ],
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i == 1 || i === node.table.body.length) ? 2 : 0
                        }
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10],
                    alignment: 'center'
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [10, 10, 0, 5],
                    alignment: 'center'
                },
                tableExample: {
                    margin: [0, 5, 0, 5],
                    alignment: 'center'
                },
                tableHeader: {
                    bold: true,
                    fontSize: 12,
                    color: 'black',
                    alignment: 'center'
                },
            },
            defaultStyle: {
                // alignment: 'justify'
            }
            
        }
        let qrcontent = file_name
        for (let i = 0; i < this.attendance_list.length; i++){
            let item = [i+1, this.attendance_list[i].code, this.attendance_list[i].name]
            qrcontent += ' - ' + this.attendance_list[i].code.toString()
            for(let i = 1 ;i<= 22;i++)
                item.push({
                    image: 'data: image/png; base64, data:image/png;base64,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evfuHYkR+x7gZyc/IyIivpUMTAR2Us9p9ZEjRxpLly6N9rlc5D8sXbrUGDlyZCSm43cAd5z8zIiI+Mpg6nn7WUZGhnHHHXcYGzdujPZ5W8TSxo0bjTvuuMPIyMiob7CvO/nZERGJuo7APOpxUmvWrJnxwAMPGPv27Yv2eVokLPv27TPuv/9+44wzzqhvsL8DFLr+aRUROY1s4BHMR07W6STWunVr4/nnn9dqdQm8iooK49lnnzVatWpVn1CvOvmZynb90ysiwtfXyfdRxxNXy5YtjWeeecaoqqqK9nlYJKKqqqqMp556ymjRokV9gn0f5vX1RNc/zSISty6lHtfJmzZtajzxxBNGRUVFtM+7Iq46duyY8fjjj9d3Kn4VcIkHn2sRiSM5mI+NrKUOJ6a8vDzj97//vZ5yJnGnvLzcePjhh43c3Ny6hnot8AKahheRCBhFHfdcz87ONv7v//7POHLkSLTPqyJRdfjwYeP+++83srOz6xrsO4GRnnziRSTmtATeog4nn+TkZOOnP/2pHpQi8i379+83Jk6caCQnJ9c12N8AWnhyBhCRwEvAXJBTp33XBw8ebKxbty7a500RX1u3bp0xePDguoZ6KTABbd0tIhY6AIupw0nm3HPPNebNmxft86RIoLz99ttGYWFhXYP9Q6C9J2cGCYSkaDcgvpCM+QCVV4F24bwxOzubBx54gJdeeokOHTq40pxIrGrfvj2333472dnZrFy5ksrKynDe3hq4DagBlmOGvIjEsbbAUupwnXzixIna3U0kQvbt22fcfvvtdd0nfglQ4M0pQ/xK12Di203Ak4T5rObu3bvz4osv0q1bN3e6Eoljn376KbfddhufffZZuG89DPwYmBr5riQItBNRfMoGpgMvE0aYp6en88c//pHly5crzEVc0r17d1auXMnvf/970tPDespqY+CvwDQgy5XmxNc0Qo8/lwKvAK3CedPAgQN5/vnnadu2rTtdich3lJSUMGHCBN5///1w37oVuBH4KPJdiV9phB4/UoDfAYsII8xzcnKYPHky7733nsJcxGOFhYUsXLiQF198kZycnHDe2hp4H3gAPXM9bmiEHh/aY15X6xHOm0aNGsWTTz5J06ZN3elKRBzbvXs3d955J6+99lq4b10J3ACURL4r8RMFeuwbCbxEGNfKc3JyeO655xg9erR7XYlIncyc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EvMBFeOBVpH8D6emptKvXz8GDx7M4MGD6dxZ5+VYUFxczPz585k/fz5Lliyhuro60j9iKzDp5GtnpP/jIvWlQBe/S8TcVnY8MBxIifQPOPPMM78K90GDBpGVpYXJQVBWVsaCBQu+CvHt27e78WNqgLeAFzEvCdW68UNEIkGBLkFyBnArMA44240fkJycTJ8+fRg8eDADBgyge/fuJCdrd04/qKmpYdWqVSxatIj58+ezbNkyjh8/7taP+wJzJD4Fc1MYEd9ToEsQJQCXYo7ar8XFbTQbNmxIjx496Nu3L3379qVPnz4awXuktLSUpUuXUlRUxJIlS1i5ciUVFRVu/sgKzKeevQAsxrxeLhIYCnQJusEaurMAAAOESURBVMbA1cBozKl5V28bSkxMpGPHjvTr14++ffvSu3dv2rVr5+aPjAuGYbBp0yaKior46KOPWLZsGZ9//jm1ta7PcFcB/wBmYU6tH3b7B4q4RYEusSQH+D5muA/Ehevtp9O4cWM6d+5M586d6dKly1f/rJH86ZWWlrJ27VqKi4tZvXo1xcXFrF27lsOHPcvSGmAhMAN4E3NXN5HAU6BLrMoFRmKGe38gyesGCgoKvgr3Dh060LZtWwoKCmjRogWJiYlet+Op2tpaduzYwebNm9myZQvr16+nuLiY4uJitm7dGo2WTgCLMEP8DcznCojEFAW6xIN8zGn5wZibgER16JyamkqrVq0oKCj4KuS/+crLyyMlxZPJhTqrqalh//79bNmy5avXpk2bvvrnbdu2uXHbWLgOYq5Mnw+8g/nUP5GYpUCXeJMM9MEM98GYG9n47nOQlZVFfn4+ubm533nl5eWRn59PVlYWiYmJX03tN2jQgPT09K/en5iYSEpKCpmZ5oO+ysvLqampoba2lrKyMgAqKiqorKwEzKlwwzAoKytj7969HDhw4LSvvXv3ejk9Ho5a4FPMAJ8HrMQcmYvEBd+dyEQ81oyvw/17QJPotiNhOogZ3vMwF7dpFC5xS4Eu8rUkzBF7H6A3cAnmjnXiH9uApUAR5q1la9EoXARQoIvYaQX0PfnqB3QiCgvs4tQJzMBejBngSzEDXUROQ4EuEp5GmKP3XkB3zAd0tIlqR7HBALZgPkr3U8wAXwEciWJPIoGiQBepv8aYwd4Z6PKNf9aN6KdXijnyLgZWn/zftWhTF5F6UaCLuKeAr8O9A9D25L9rgfnQmVhWC+wANmOOvNdjBncx5lPLRCTCFOgi3kvFvDZfwNch/81XHh7tclcPNcB+zLA+9dr0jX/ehvlMexHxiAJdxJ+yMDfEyT3NK+/ksSzMkf6pqf0GQPo33p+I+cUg8+S/K8cM4lqg7OS/qwAqT/5zKea17DLMJ4wdCPHai6bHRUREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREQkRvx/iGy3QOTOquEAAAAASUVORK5CYII=',                    
                    fit: [15, 15]
                })
            dd.content[1]['table'].body.push(item)
        }
        // console.log(dd.content[0]['columns'][1]['qr'])
        // dd.content[0]['columns'][1]['qr'] = qrcontent


        // playground requires you to assign document definition to a variable called dd
        pdfMake.createPdf(dd).download(file_name + '.pdf');
    }
}
