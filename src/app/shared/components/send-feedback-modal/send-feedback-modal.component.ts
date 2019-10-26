import { Component, OnInit, Input, Output , EventEmitter} from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { AppService } from '../../services/app.service';
import { AuthService } from '../../services/auth.service';
import { StudentService } from '../../services/student.service';
declare var jQuery: any;

@Component({
  selector: 'send-feedback-modal',
  templateUrl: './send-feedback-modal.component.html',
})
export class SendFeedbackModalComponent implements OnInit {
	@Output() public onSent : EventEmitter<string> = new EventEmitter<string>();

    public isAnonymous = false;
    public title = '';
    public content = '';

    public teacher_list =[];
    public receivers = [
        {
            id : 0,
            title : 'Academic Affair'
        },
        {
            id : 1,
            title : 'Lecturer/TA'
        }
    ];
    public selected_receiver = 0;
    public selected_teacher = 0;
    public selected_category = 1;
    public apiResult: string;
    public apiResultMessage: string;
    public onOpenModal() {
        this.studentService.getTeachingTeacherList().subscribe(result=>{
            if(result.result == 'success'){
                this.teacher_list = result.teacher_list;
                this.selected_teacher = this.teacher_list[this.teacher_list.length - 1].id;
            }
        },error=>{this.appService.showPNotify('failure', "Server Error! Can't get teaching teacher list", 'error');});
        jQuery("#sendFeedbackModal").modal("show");
    }
    public onSendFeedback() {
        var receiver = this.selected_receiver == 0 ? this.selected_receiver : this.selected_teacher;
        this.feedbackService.sendFeedbacks(receiver, this.title, this.selected_category, this.content, this.isAnonymous).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            this.appService.showPNotify(this.apiResult, this.apiResultMessage, this.apiResult == 'success' ? 'success' : 'error');
            if (this.apiResult == 'success') {
                this.isAnonymous = false;
                this.title = '';
                this.content = '';
                jQuery("#sendFeedbackModal").modal("hide");
                this.onSent.emit('success');
            }
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't send feedbacks", 'error'); });
    }
	public constructor(public  feedbackService : FeedbackService,public  appService: AppService,public authService: AuthService, public studentService: StudentService) { }
	public ngOnInit() {
	    
    }

}