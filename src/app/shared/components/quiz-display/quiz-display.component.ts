import { Component, OnInit,HostListener,OnDestroy } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router } from '@angular/router';
import { StudentService, AppService, CourseService,AuthService,QuizService,SocketService} from '../../shared.module';
declare var jQuery:any;
@Component({
  selector: 'app-quiz-display',
  templateUrl: './quiz-display.component.html'
})
export class QuizDisplayComponent implements OnInit,OnDestroy {
	public quiz = {
        id: 0,
        code: '',
        is_randomize_questions: true,
        is_randomize_answers: true,
        type: 0,
        title: '',
        participants: [],
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
	public quiz_code = null;
	public get_published_quiz_error;
	public is_started = false;
	public is_ended = false;
	public is_ready = false;
	public current_question_index = 0;
	public current_question = {};
	public current_question_timer = 0;
	public ready = 0;
	public ready_progress = 0;
	public interval;
	public ready_time = 5;
	public selected_attendance;
	public student_list = [];
	public attendance_checked_list = [];
	public attendance_not_checked_list = [];
	public not_participated_list = [];
	public miscellaneous_threshold = 0;
	public is_save_quiz_error = false;

	@HostListener('window:unload', ['$event'])
	public onWindowUnload(event: Event) {
		if(this.quiz_code){
    		this.quizService.stopQuiz(this.quiz_code).subscribe(result=>{

			},error=>{this.appService.showPNotify('failure',"Server Error! Can't get quiz detail",'error');});
    	}
	}
	@HostListener('window:beforeunload', ['$event'])
	public onWindowBeforeUnload(event: Event) {
		if(this.is_ended){
			return true;
		}else{
			return false;
		}
		
	}

	public constructor(public  localStorage: LocalStorageService,public  router: Router,public quizService: QuizService,
		public appService: AppService,public socketService: SocketService,public studentService: StudentService) {
		socketService.consumeEventOnJoinedQuiz();
        socketService.invokeJoinedQuiz.subscribe(result => {
            if (this.quiz_code == result['quiz_code']) {
                this.getQuiz();
            }
        });
        socketService.consumeEventOnQuittedQuiz();
        socketService.invokeQuittedQuiz.subscribe(result => {
            if (this.quiz_code == result['quiz_code']) {
                for(var i = 0 ;i < this.quiz['participants'].length; i++){
                	if(this.quiz['participants'][i].id == result['student_id']){
                		this.quiz['participants'].splice(i,1);
                		break;
                	}
                }
            }
        });
        socketService.consumeEventOnCheckAttendanceStopped();
        socketService.invokeCheckAttendanceStopped.subscribe(result=>{
            if(this.selected_attendance['course_id'] == result['course_id'] && this.selected_attendance['class_id'] == result['class_id']){
                this.onStopQuiz();
                this.appService.showPNotify('Info',"Attendance session is " + result['message'],'info');
            }
        });
	}
	public ngOnInit() {
		if(this.localStorage.get('get_published_quiz_error')){
			this.get_published_quiz_error = this.localStorage.get('get_published_quiz_error');
		}
		else{
			this.selected_attendance = this.localStorage.get('selected_attendance');
			if(!this.localStorage.get('quiz_code')){
				this.get_published_quiz_error = 'Quiz is stopped';
			}else{
				this.quiz_code = this.localStorage.get('quiz_code').toString();
				this.localStorage.remove('quiz_code');
				this.getQuiz();
			}
		}
	}
	public closeSocket(){
		this.socketService.stopEventOnJoinedQuiz();
		this.socketService.stopEventOnCheckAttendanceStopped();
		this.socketService.stopEventOnAnsweredQuiz();
	}
	public ngOnDestroy(){
		this.socketService.emitEventOnQuizStopped({'quiz_code':this.quiz_code});
		this.closeSocket();
	}
	
	public getQuiz(){
		this.quizService.getPublishedQuiz(this.quiz_code).subscribe(result=>{
			if(result.result == 'success'){
				this.quiz = result.quiz;
				this.miscellaneous_threshold = this.quiz['questions'].length;
			}
			else{
				this.appService.showPNotify('failure',result.message,'error');
			}
		},error=>{this.appService.showPNotify('failure',"Server Error! Can't get quiz detail",'error');});
	}
	public onStartQuestion(){
		this.interval = setInterval(() => {
			this.quiz['questions'][this.current_question_index]['timer']--;
			if(this.quiz['questions'][this.current_question_index]['timer'] == 0){
				this.socketService.emitEventOnQuizQuestionEnded({'quiz_code': this.quiz_code});
				clearInterval(this.interval);
				this.current_question_index++;
				this.onReadyForNextQuestion(this.current_question_index);
			}
		}, 1000);
	}
	public onReadyForNextQuestion(next_question_index){
		if(next_question_index > 0){
			var last_question_index = next_question_index - 1;
			for(var i = 0 ; i < this.quiz['participants']['length'];i++){
				var check_no_answer = 0;
	    		for(var j = 0 ; j < this.quiz['questions'][last_question_index]['answers'].length;j++){
	    			if(this.quiz['questions'][last_question_index]['answers'][j]['answered_by'] == this.quiz['participants'][i]['id']){
	    				break;
	    			}else{
	    				check_no_answer++;
	    			}
	    		}
	    		if(check_no_answer == this.quiz['questions'][last_question_index]['answers'].length){
	    			this.quiz['questions'][last_question_index]['answers'].push({
		        		answered_by : this.quiz['participants'][i]['id'],
		        		answered_at : null,
		        		selected_option : '',
		        		name : this.quiz['participants'][i]['name'],
		        		code : this.quiz['participants'][i]['code']
		        	});
	    		}
	    	}
		}
		if(next_question_index == this.quiz['questions'].length){
			this.is_ended = true;
			this.is_ready = this.is_started = false;
			this.onEndQuiz();
			this.socketService.emitEventOnQuizEnded({'quiz_code': this.quiz_code});
			this.closeSocket();
			return;
		}
		this.socketService.emitEventOnQuizQuestionReady({'quiz_code': this.quiz_code});
		this.is_started = false;
		this.is_ready = true;
		this.ready = 0;
		this.ready_progress = 0;
		this.interval = setInterval(() => {
			this.ready++;
			if(this.ready > this.ready_time){
				clearInterval(this.interval);
				this.is_started = true;
				this.is_ready = false;
				this.current_question_index = next_question_index;
				this.socketService.emitEventOnQuizQuestionLoaded({'quiz_code': this.quiz_code,'question_index': this.current_question_index});
				this.onStartQuestion();
			}
			this.ready_progress = this.ready * 20;
		}, 1000);
	}
	public onStartQuiz(){
		this.quizService.startQuiz(this.quiz_code).subscribe(result=>{
			if(result.result == 'success'){
				this.quiz['started_at'] = new Date();
				this.socketService.consumeEventOnAnsweredQuiz();
			    this.socketService.invokeAnsweredQuiz.subscribe(result => {
			        if (this.quiz_code == result['quiz_code']) {
			        	var question_index = result['question_index'];
			        	for(var i = 0 ; i < this.quiz['participants']['length'];i++){
			        		if(result['student_id'] == this.quiz['participants'][i]['id']){
			        			this.quiz['questions'][question_index]['answers'].push({
					        		answered_by : result['student_id'],
					        		answered_at : new Date(),
					        		selected_option : result['option'].toUpperCase(),
					        		name : this.quiz['participants'][i]['name'],
					        		code : this.quiz['participants'][i]['code']
					        	});
					        	break;
			        		}
			        	}
			            if(this.quiz['participants'].length == this.quiz['questions'][question_index]['answers'].length){
							this.socketService.emitEventOnQuizQuestionEnded({'quiz_code': this.quiz_code});
							clearInterval(this.interval);
							this.current_question_index++;
							this.onReadyForNextQuestion(this.current_question_index);
						}
			        }
			    });
		        this.onReadyForNextQuestion(this.current_question_index);
			}else{
				this.appService.showPNotify('failure',result.message,'error');
			}
		},error=>{this.appService.showPNotify('failure',"Server Error! Can't start quiz",'error');});
	}

	public onSaveQuiz(){
		this.quizService.saveQuiz(this.quiz,this.attendance_checked_list).subscribe(result=>{
			if(result.result == 'failure'){
				this.appService.showPNotify('failure',result.message,'error');
				this.is_save_quiz_error = true;
			}else{
				this.appService.showPNotify('success',result.message,'success');
				this.is_save_quiz_error = false;
			}
		},error=>{
			this.is_save_quiz_error = true;
			this.appService.showPNotify('failure',"Server Error! Can't save quiz and attendance info",'error');
		});
	}
	public onEndQuiz(){
		this.studentService.getStudentByCourse(this.selected_attendance['course_id'],this.selected_attendance['class_id']).subscribe(result=>{
			if(result.result == 'success'){
				this.student_list = result.student_list;
				for(var i = 0 ; i < this.student_list.length; i++){
					var check_no_participated = 0;
					var check_no_answer = 0;
					var check_right_answer = 0;
					for(var j = 0 ; j < this.quiz['participants']['length']; j++){
						if(this.student_list[i]['id'] == this.quiz['participants'][j]['id']){
							//Có tham gia quiz
							for(var k = 0; k < this.quiz['questions'].length; k++){
								for(var l = 0; l < this.quiz['questions'][k]['answers'].length; l++){
									if(this.quiz['questions'][k]['answers'][l]['answered_by'] == this.student_list[i]['id']){
										if(this.quiz['questions'][k]['answers'][l]['selected_option'] == ''){
											check_no_answer++;
											continue;
										}
										if(this.quiz['questions'][k]['correct_option'] == this.quiz['questions'][k]['option_' + this.quiz['questions'][k]['answers'][l]['selected_option'].toLowerCase()]){
											check_right_answer++;
										}
									}
								}
							}
							break;
						}else{
							//Ko tham gia quiz
							check_no_participated++;
						}
					}
					if(check_no_participated == this.quiz['participants']['length']){
						this.not_participated_list.push({
							id : this.student_list[i]['id'],
							code : this.student_list[i]['code'],
							name : this.student_list[i]['name'],
						});
					}else{
						if(this.quiz['questions']['length'] == check_no_answer){
								//Ko trả lời câu nào
								this.attendance_not_checked_list.push({
									id : this.student_list[i]['id'],
									code : this.student_list[i]['code'],
									name : this.student_list[i]['name'],
									reason : "Didn't answer any question"
								});
						}else{
							if(this.quiz['type'] == this.appService.quiz_type.academic.id){
								if(this.quiz['required_correct_answers'] > check_right_answer){
									this.attendance_not_checked_list.push({
										id : this.student_list[i]['id'],
										code : this.student_list[i]['code'],
										name : this.student_list[i]['name'],
										reason : "Not enough correct answers (" + check_right_answer + "/" + this.quiz['required_correct_answers'] + ")"
									});
								}else{
									this.attendance_checked_list.push({
										id : this.student_list[i]['id'],
										code : this.student_list[i]['code'],
										name : this.student_list[i]['name']
									});
								}
							}else{
								if(check_right_answer < this.miscellaneous_threshold){
									this.attendance_not_checked_list.push({
										id : this.student_list[i]['id'],
										code : this.student_list[i]['code'],
										name : this.student_list[i]['name'],
										reason : "Not enough correct answers (" + check_right_answer + "/" + this.miscellaneous_threshold + ")"
									});
								}else{
									this.attendance_checked_list.push({
										id : this.student_list[i]['id'],
										code : this.student_list[i]['code'],
										name : this.student_list[i]['name']
									});
								}
							}
						}
					}
				}
				this.onSaveQuiz();
			}
		},error=>{this.appService.showPNotify('failure',"Server Error! Can't get student list by course",'error');});
	}
	public onReturn(){
		window.close();
	}
	public onNextQuestion(){
		clearInterval(this.interval);
		this.socketService.emitEventOnQuizQuestionEnded({'quiz_code': this.quiz_code});
		this.onReadyForNextQuestion(this.current_question_index++);
	}
	public onStopQuiz(){
		this.quizService.stopQuiz(this.quiz_code).subscribe(result=>{
			clearInterval(this.interval);
			this.get_published_quiz_error = 'Quiz is stopped';
			this.socketService.emitEventOnQuizStopped({'quiz_code':this.quiz_code});
			this.closeSocket();
		},error=>{this.appService.showPNotify('failure',"Server Error! Can't get quiz detail",'error');});
	}
}