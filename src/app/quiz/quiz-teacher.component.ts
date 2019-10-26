import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { StudentService, AppService, CourseService,AuthService,QuizService } from '../shared/shared.module';
declare var jQuery: any;
@Component({
    selector: 'app-quiz-teacher',
    templateUrl: './quiz-teacher.component.html'
})
export class QuizTeacherComponent implements OnInit {
    public apiResult: string;
    public apiResultMessage: any;

    public courses: Array < any > = [];
    public selected_course;
    public selected_class_id;
    public quiz_list = [];
    public quiz = {
        id: 0,
        title: '',
        is_template: true,
        questions: [{
            text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: null,
            timer:10,
            answers: []
        }]
    };
    public deleting_quiz_id = 0;

    public constructor(public authService: AuthService, public courseService: CourseService, public  appService: AppService,
    public quizService: QuizService, public  studentService: StudentService, public  router: Router) {}

    public ngOnInit() {
        this.courseService.getTeachingCourses(this.authService.current_user.id).subscribe(result=>{
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if(this.apiResult == 'failure'){
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'error');
            }
            this.courses = result.courses;
            this.selected_course = this.courses[0];
            this.loadQuiz();
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't get teaching course",'error');});
    }

    public onChangeCourse() {
        this.loadQuiz();
    }

    public loadQuiz(){
        this.quizService.getQuizByCourseAndClass(this.selected_course['id'],this.selected_course['class_id']).subscribe(result=>{
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if(this.apiResult == 'failure'){
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'error');
            }else{
                this.quiz_list = result.quiz_list;
                for(var i = 0 ; i < this.quiz_list.length; i++){
                    this.quiz_list[i]['isOpen'] = false;
                }
            }
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't get quiz list",'error');});
    }
    public onAddQuiz(){
        this.quiz = {
            id: 0,
            title: '',
            is_template:true,
            questions: [{
                text: '',
                option_a: '',
                option_b: '',
                option_c: '',
                option_d: '',
                correct_option: null,
                timer:10,
                answers: []
            }]
        };
        jQuery('#addQuizModal').modal('show');
    }
    public addQuiz(){
        this.quizService.addQuiz(this.selected_course['id'],this.selected_course['class_id'],this.quiz).subscribe(result=>{
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if(this.apiResult == 'failure'){
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'error');
            }else{
                this.loadQuiz();
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'success');
                jQuery('#addQuizModal').modal('hide');
            }
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't add quiz",'error');});
    }
    public onAddQuestion() {
        this.quiz.questions.push({
            text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: null,
            timer:10,
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

    public onSaveQuiz(index){
        this.quizService.updateQuiz(this.quiz_list[index]).subscribe(result=>{
            if(result.result == 'success'){
                this.appService.showPNotify('success',result.message,'success');
            }else{
                this.appService.showPNotify('failure',result.message,'error');
            }
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't delete quiz",'error');});
    }

    public onDeleteQuiz(quiz_id){
        this.deleting_quiz_id = quiz_id;
        jQuery('#deleteQuizModal').modal('show');
    }
    public deleteQuiz(){
        this.quizService.deleteQuiz(this.deleting_quiz_id).subscribe(result=>{
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if(this.apiResult == 'failure'){
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'error');
            }else{
                this.loadQuiz();
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'success');
            }
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't delete quiz",'error');});
    }


    public onTabInTextarea(event){
        if(event.keyCode === 9) { // tab was pressed
            // // get caret position/selection
            var start = event.target.selectionStart;
            var end = event.target.selectionEnd;

            var value = event.target.value;

            // set textarea value to: text before caret + tab + text after caret
            event.target.value = value.substring(0, start)+ "\t" + value.substring(end);

            // put caret at right position again (add one for the tab)
            event.target.selectionStart = event.target.selectionEnd = start + 1;
            // prevent the focus lose
            event.preventDefault();
        }
    }

    public onAddTemplateQuestion(quiz_index) {
        this.quiz_list[quiz_index].questions.push({
            text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: null,
            timer:10,
            answers: []
        });
    }
    public onRemoveTemplateQuestion(quiz_index, question_index) {
        for (var i = question_index; i < this.quiz_list[quiz_index].questions.length - 1; i++) {
            this.quiz_list[quiz_index].questions[i].text = this.quiz_list[quiz_index].questions[i + 1].text;
            this.quiz_list[quiz_index].questions[i].option_a = this.quiz_list[quiz_index].questions[i + 1].option_a;
            this.quiz_list[quiz_index].questions[i].option_b = this.quiz_list[quiz_index].questions[i + 1].option_b;
            this.quiz_list[quiz_index].questions[i].option_c = this.quiz_list[quiz_index].questions[i + 1].option_c;
            this.quiz_list[quiz_index].questions[i].option_d = this.quiz_list[quiz_index].questions[i + 1].option_d;
            this.quiz_list[quiz_index].questions[i].correct_option = this.quiz_list[quiz_index].questions[i + 1].correct_option;
            this.quiz_list[quiz_index].questions[i].timer = this.quiz_list[quiz_index].questions[i + 1].timer;
        }
        this.quiz_list[quiz_index].questions.pop();
    }
}
