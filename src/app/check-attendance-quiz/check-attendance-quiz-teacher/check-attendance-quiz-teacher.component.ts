import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService, QuizService, AttendanceService, AuthService, SocketService, AppConfig, CheckAttendanceService } from '../../shared/shared.module';
import { LocalStorageService } from 'angular-2-local-storage';
declare var jQuery: any;
@Component({
    selector: 'check-attendance-quiz-teacher',
    templateUrl: './check-attendance-quiz-teacher.component.html'
})
export class CheckAttendanceQuizTeacherComponent implements OnInit, OnDestroy {
    public stopped_modal_message;
    public constructor(public quizService: QuizService, public location: Location, public checkAttendanceService: CheckAttendanceService,
        public appConfig: AppConfig, public socketService: SocketService,
        public authService: AuthService, public attendanceService: AttendanceService, public localStorage: LocalStorageService, public appService: AppService, public router: Router) {
        socketService.consumeEventOnCheckAttendanceStopped();
        socketService.invokeCheckAttendanceStopped.subscribe(result=>{
            if(this.selected_attendance['course_id'] == result['course_id'] && this.selected_attendance['class_id'] == result['class_id']){  
                this.appService.showPNotify('Info',"Attendance session is " + result['message'],'info');
                this.router.navigate(['/dashboard']);
            }
        });
    }
    public is_edit_quiz = false;
    public is_published = false;
    public apiResult;
    public apiResultMessage;
    public selected_attendance = {};
    public quizzes = [];
    public quiz_types = [];
    public selected_quiz = 0;
    public selected_quiz_type = 1;
    public quiz = {
        id: 0,
        code: '',
        is_randomize_questions: true,
        is_randomize_answers: true,
        required_correct_answers: 0,
        type: this.appService.quiz_type.miscellaneous.id,
        title: 'Attendance Quiz',
        questions: [{
            text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: null,
            timer: 10,
            answers: []
        }]
    };
    public number_misc_question = 3;
    public ngOnDestroy() {
        // this.socketService.stopEventOnQuizAnswered();
        // this.socketService.stopEventOnQuizStopped();
        this.socketService.stopEventOnCheckAttendanceStopped();
    }
    public ngOnInit() {
        if(!this.localStorage.get('selected_attendance')){
            this.router.navigate(['/dashboard']);
        }else{
            this.selected_attendance = this.localStorage.get('selected_attendance');
            this.quiz_types.push(this.appService.quiz_type.miscellaneous);
            this.quiz_types.push(this.appService.quiz_type.academic);
            this.generateMiscQuestion();
        }
    }
    public onAddQuestion() {
        this.quiz.questions.push({
            text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: null,
            timer: 10,
            answers: []
        });
    }
    public onRemoveQuestion(index: number) {
        for (var i = index; i < this.quiz.questions.length - 1; i++) {
            this.quiz.questions[i].text = this.quiz.questions[i + 1].text;
            this.quiz.questions[i].option_a = this.quiz.questions[i + 1].option_a;
            this.quiz.questions[i].option_b = this.quiz.questions[i + 1].option_b;
            this.quiz.questions[i].option_c = this.quiz.questions[i + 1].option_c;
            this.quiz.questions[i].option_d = this.quiz.questions[i + 1].option_d;
            this.quiz.questions[i].correct_option = this.quiz.questions[i + 1].correct_option;
            this.quiz.questions[i].timer = this.quiz.questions[i + 1].timer;
        }
        this.quiz.questions.pop();
    }
    public onPublishQuiz() {
        var w = window.open(this.appConfig.host + '/quiz/display', '_blank', 'height=720,width=1024,scrollbars=yes,status=0,toolbar=0,menubar=0,location=0');
        this.localStorage.remove('quiz_code');
        this.localStorage.remove('get_published_quiz_error');
        this.quizService.publishQuiz(this.selected_attendance['course_id'], this.selected_attendance['class_id'], this.quiz).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (this.apiResult == 'failure') {
                this.localStorage.set('get_published_quiz_error',this.apiResultMessage);
                w.location.href = this.appConfig.host + '/quiz/display';
                this.appService.showPNotify('failure', this.apiResultMessage, 'error');
            } 
            if(result.result == 'success') {
                this.localStorage.set('token',this.authService.token);
                this.localStorage.set('quiz_code',result.quiz_code);
                w.location.href = this.appConfig.host + '/quiz/display';
            }
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't publish quiz", 'error'); });
    }
    public onBack() {
        this.location.back();
    }
    public onChangeQuiz(){
        for(var i = 0 ; i < this.quizzes.length; i++){
            if(this.selected_quiz == this.quizzes[i].id){
                this.is_edit_quiz = (this.quizzes[i].id == 0);
                this.quiz.questions = [];
                this.quiz.id = this.quizzes[i].id;
                this.quiz.title = this.quizzes[i].title;
                this.quiz.code = this.quizzes[i].code;
                this.quiz.required_correct_answers = this.quizzes[i].required_correct_answers;
                for(var j = 0; j < this.quizzes[i].questions.length; j++){
                    this.quiz.questions.push({
                        text : this.quizzes[i].questions[j].text,
                        option_a : this.quizzes[i].questions[j].option_a,
                        option_b : this.quizzes[i].questions[j].option_b,
                        option_c : this.quizzes[i].questions[j].option_c,
                        option_d : this.quizzes[i].questions[j].option_d,
                        correct_option : this.quizzes[i].questions[j].correct_option,
                        timer : this.quizzes[i].questions[j].timer,
                        answers: []
                    });
                }
                return;
            }
        }
    }
    public onChangeQuizType(){
        if(this.selected_quiz_type == this.appService.quiz_type.academic.id){
            this.getQuizList();
        }else{
            this.generateMiscQuestion();
        }
        this.quiz.type = this.selected_quiz_type;
    }
    public getQuizList(){
        this.quizService.getQuizByCourseAndClass(this.selected_attendance['course_id'], this.selected_attendance['class_id']).subscribe(result=>{
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if(this.apiResult == 'failure'){
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'error');
            }else{
                this.quizzes = [];
                for(var i = 0 ; i < result.quiz_list.length; i++){
                    if(result.quiz_list[i].is_template){
                        this.quizzes.push(result.quiz_list[i]);
                    }
                }
                this.quizzes.unshift({
                    id: 0,
                    code: result.quiz_code,
                    is_randomize_questions: true,
                    is_randomize_answers: true,
                    required_correct_answers: 0,
                    type: 0,
                    title: 'New quiz',
                    questions: [{
                        text: '',
                        option_a: '',
                        option_b: '',
                        option_c: '',
                        option_d: '',
                        correct_option: null,
                        timer: 10,
                        answers: []
                    }]
                });
                this.selected_quiz = this.quizzes[0].id;
                this.onChangeQuiz();
            }
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't get quiz list",'error');});
    }
    public generateMiscQuestion(){
        if(this.number_misc_question <= 0){
            this.appService.showPNotify('failure','Number of questions must be greater than 0','error');
        }else{
            this.quizService.getMiscQuestion(this.number_misc_question).subscribe(result=>{
                if(result.result == 'success'){
                    this.quiz.questions = result.questions;
                }else{
                    this.appService.showPNotify('failure',result.message,'error');
                }
            },error=>{this.appService.showPNotify('failure',"Server Error! Can't get miscellaneous questions",'error');});
        }        
    }
}
