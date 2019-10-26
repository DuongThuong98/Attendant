import { Component, OnInit, OnDestroy,HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService, AttendanceService, AuthService, SocketService, AppConfig, CheckAttendanceService, QuizService } from '../../shared/shared.module';
import { LocalStorageService } from 'angular-2-local-storage';
declare var jQuery: any;
@Component({
    selector: 'check-attendance-quiz-student',
    templateUrl: './check-attendance-quiz-student.component.html'
})
export class CheckAttendanceQuizStudentComponent implements OnInit, OnDestroy {
    public stopped_modal_message;
    public apiResult;
    public apiResultMessage;
    public quiz_code_checked = false;
    public quiz_code = '';
    public quiz_id = 0;
    public quiz = {
        questions:[]
    };
    public is_started = false;
    public is_ready = false;
    public is_ended = false;
    public is_answered = false;
    public current_question_index = 0;
    public ready = 0;
    public ready_progress = 0;
    public interval;
    public ready_time = 5;
    public selected_option;
    public correct_answers = 0;
    public no_answer = false;

    public constructor(public quizService: QuizService, public checkAttendanceService: CheckAttendanceService,
        public appConfig: AppConfig, public socketService: SocketService, public authService: AuthService,
        public attendanceService: AttendanceService, public localStorage: LocalStorageService, public appService: AppService,
        public router: Router) {
    }
    @HostListener('window:unload', ['$event'])
    public onWindowUnload(event: Event) {
       if(!this.is_ended) 
           this.socketService.emitEventOnQuittedQuiz({'quiz_code':this.quiz_code,'student_id': this.authService.current_user.id}); 
    }
    @HostListener('window:beforeunload', ['$event'])
    public onWindowBeforeUnload(event: Event) {
        return false;
    }
    public ngOnInit() {
        jQuery('#enterQuizCodeModal').modal({ backdrop: 'static', keyboard: false });
    }
    public ngOnDestroy() {
        if(!this.is_ended) 
            this.socketService.emitEventOnQuittedQuiz({'quiz_code':this.quiz_code,'student_id': this.authService.current_user.id});
        this.closeSocket();
    }
    public cancelCheckQuizCode() {
        jQuery("#enterQuizCodeModal").modal("hide");
        this.router.navigate(['/dashboard']);
    }
    public keyDownFunction(event) {
      if(event.keyCode == 13) {
        this.checkQuizCode();
      }
    }
    public checkQuizCode() {
        this.quizService.joinQuiz(this.quiz_code).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (this.apiResult == 'success') {
                this.quiz_code_checked = true;
                jQuery("#enterQuizCodeModal").modal("hide");
                setTimeout( () => {
                    jQuery("#quizModal").modal({ backdrop: 'static', keyboard: false });
                },1000);
                this.getQuizDetail();

                this.socketService.consumeEventOnQuizStopped();
                this.socketService.invokeQuizStopped.subscribe(result => {
                    if (this.quiz_code == result['quiz_code']) {
                        this.closeSocket();
                        jQuery("#quizModal").modal('hide');
                        this.stopped_modal_message = "Quiz is stopped";
                        jQuery('#quizStoppedModal').modal({ backdrop: 'static', keyboard: false });
                    }
                });

                this.socketService.consumeEventOnQuizEnded();
                this.socketService.invokeQuizEnded.subscribe(result => {
                    if (this.quiz_code == result['quiz_code']) {
                        this.is_ended = true;
                        this.is_started = false;
                        this.is_ready = false;
                    }
                });

                this.socketService.consumeEventOnQuizQuestionReady();
                this.socketService.invokeQuizQuestionReady.subscribe(result => {
                    if (this.quiz_code == result['quiz_code']) {
                        this.ready = 0;
                        this.ready_progress = 0;
                        this.is_ready = true;
                        this.is_started = false;
                        this.interval = setInterval(() => {
                            this.ready++;
                            if(this.ready > this.ready_time){
                                clearInterval(this.interval);
                                this.ready = 0;
                                this.ready_progress = 0;
                            }else{
                                this.ready_progress = this.ready * 20;
                            }
                        }, 1000);
                    }
                });

                this.socketService.consumeEventOnQuizQuestionLoaded();
                this.socketService.invokeQuizQuestionLoaded.subscribe(result => {
                    console.log(result['quiz_code'] + '==' + this.quiz_code);
                    if (this.quiz_code == result['quiz_code']) {
                        this.is_answered = false;
                        this.is_started = true;
                        this.is_ready = false;
                        this.current_question_index = result['question_index'];
                    }
                });

                this.socketService.consumeEventOnQuizQuestionEnded();
                this.socketService.invokeQuizQuestionEnded.subscribe(result => {
                    if (this.quiz_code == result['quiz_code']) {
                        this.is_started = false;
                        this.is_ready = true;
                        this.correct_answers = 0;
                        var check_no_answer = 0;
                        for(var i = 0 ; i < this.quiz['questions']['length']; i++){
                            if(this.quiz['questions'][i]['answers'] == 0){
                                check_no_answer++;
                            }else{
                                var selected_answers = this.quiz['questions'][i]['option_' + this.quiz['questions'][i]['answers']];
                                if(this.quiz['questions'][i]['correct_option'] == selected_answers){
                                    this.correct_answers++;
                                }
                            }
                        }
                        if(check_no_answer == this.quiz['questions']['length']){
                            this.no_answer = true;
                        }
                    }
                });
            } else {
                this.appService.showPNotify(this.apiResult, this.apiResultMessage, 'error');
            }
        }, error => {
            this.appService.showPNotify('failure', "Server Error! Can't check quiz code", 'error');
        });
    }

    public onReturn(){
        jQuery("#quizModal").modal('hide');
        this.router.navigate(['/dashboard']);
    }
    public onClickAnswer(option:string){
        this.selected_option = option.toLowerCase();
        this.is_answered = true;
        this.socketService.emitEventOnAnsweredQuiz({
            'quiz_code':this.quiz_code,
            'question_index': this.current_question_index,
            'option': option.toLowerCase(),
            'student_id': this.authService.current_user.id,
        });
        this.quiz['questions'][this.current_question_index]['answers'] = option.toLowerCase();
    }

    public closeSocket(){
        this.socketService.stopEventOnQuizStopped();
        this.socketService.stopEventOnQuizEnded();
        this.socketService.stopEventOnQuizQuestionEnded();
        this.socketService.stopEventOnQuizQuestionLoaded();
        this.socketService.stopEventOnQuizQuestionReady();
    }
    public getQuizDetail() {
        this.quizService.getPublishedQuiz(this.quiz_code).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (this.apiResult == 'success') {
                this.quiz = result.quiz;
                for(var i = 0 ; i < this.quiz['questions'].length; i++){
                    this.quiz['questions'][i]['answers'] = 0;
                }
            } else {
                this.appService.showPNotify(this.apiResult, this.apiResultMessage, 'error');
            }
        }, error => {
            this.appService.showPNotify('failure', "Server Error! Can't get quiz detail", 'error');
        });
    }
}
