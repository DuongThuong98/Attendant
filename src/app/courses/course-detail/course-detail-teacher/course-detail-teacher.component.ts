import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CourseService, AttendanceService, AppService, EditScheduleModalComponent, ScheduleService, ResultMessageModalComponent,AuthService } from '../../../shared/shared.module';
declare let jQuery: any;
@Component({
    selector: 'course-detail-teacher',
    templateUrl: './course-detail-teacher.component.html'
})
export class CourseDetailTeacherComponent implements OnInit {
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
    public apiResult;
    public apiResultMessage: string;
    @ViewChild(ResultMessageModalComponent)
    public  resultMessageModal: ResultMessageModalComponent;

    public constructor(public  route: ActivatedRoute, public  router: Router,public authService: AuthService, public  appService: AppService, public  courseService: CourseService, public  attendanceSerivce: AttendanceService, public  scheduleService: ScheduleService) {}

    public getAttendanceList() {
        var classes_id : Array<number> = [];
        for(var i = 0 ; i < this.class_has_course.length; i++){
            classes_id.push(this.class_has_course[i].class_id);
        }
        this.attendanceSerivce.getAttendanceListByCourse(this.course_id,classes_id).subscribe(result => {
            this.apiResult = result.result;
            this.attendance_lists = result.attendance_lists;
            this.onChangeClass(0);
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get attendance_lists by course", 'error');  });
    }
    public ngOnInit(): void {
        this.route.params.subscribe(params => { this.course_id = params['id'] });
        //get course info
        this.courseService.getCourseDetail(this.course_id).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if(this.apiResult == 'failure'){
                this.course_not_found = true;
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
            }else{
                this.course = result.course;
                this.lecturers = result.lecturers;
                this.TAs = result.TAs;
                this.class_has_course = result.class_has_course;
                if(this.course == undefined || this.course == null){
                    this.course_not_found = true;
                }else{
                    var check_not_teaching = true;
                    for(var i = 0 ; i < this.lecturers.length; i++){
                        if(this.lecturers[i].id == this.authService.current_user.id){
                            check_not_teaching = false;
                        }
                    }
                    for(var i = 0 ; i < this.TAs.length; i++){
                        if(this.TAs[i].id == this.authService.current_user.id){
                            check_not_teaching = false;
                        }
                    }
                    if(check_not_teaching){
                        this.course_not_found = true;
                    }else{
                       //get list student
                        this.getAttendanceList();
                    }
                }
            }
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't course detail", 'error');  });
    }

    //Schedule
    @ViewChild(EditScheduleModalComponent)
    public  editScheduleModal: EditScheduleModalComponent;

    public scheduleModal = {
        id: 'scheduleModal',
        title: 'Schedule'
    }
    public onOpenSchedule() {
        this.editScheduleModal.onOpenModal();
    }
    public selected_class_index = 0;
    public onChangeClass(index){
        this.selected_class_index = index;
        this.attendance_list = this.attendance_lists[index];
        for(var i = 0; i < this.attendance_list.length;i++){
            var absences = 0;
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
}
