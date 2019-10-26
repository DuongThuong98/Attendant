import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService, FeedbackService, SendFeedbackModalComponent, AuthService} from '../../shared/shared.module';
declare var jQuery:any;
@Component({
    selector: 'app-feedback-history',
    templateUrl: './feedback-history.component.html'
})
export class FeedbackHistoryComponent implements OnInit {
    
    public constructor(public  appService: AppService,public  feebackService: FeedbackService, public authService: AuthService) {

    }
    public getFeedbacks(){
        this.feebackService.getFeedbackHistory(this.from_to, this.search_text, this.selected_category, this.selected_status,this.pageNumber, this.itemsPerPage).subscribe(result=>{
            this.feedbacks = result.feedbacks;
            this.totalItems = result.total_items;
        },error=>{this.appService.showPNotify('failure', "Server Error! Can't get feedbacks", 'error');});
    }
    public ngOnInit() {
        this.getFeedbacks();
    }
    public feedbacks =[];
    public selected_status = 0;
    public selected_category = 0;
    public search_text = '';
    public from_to = 0;
    public from_tos = [
        {
            id : 1,
            title : 'From Student'
        },
        {
            id : 0,
            title : 'To Academic Affair'
        }
    ];
    public selected_feedback;
    public feedback_title = '';
    public feedback_content = '';
    public feedback_from = '';
    public feedback_id: number;
    public feedback_category ='';
    public pageNumber: number = 1;
    public limit: number = 15;
    public currentPage: number = 1;
    public totalItems: number = 0;
    public itemsPerPage: number = 10;
    public onPageChanged(event: any) {
        this.pageNumber = event.page;
        this.getFeedbacks();
    }
    public onClickFeedback(index){
        this.selected_feedback = index;
        this.feedback_content = this.feedbacks[index].content;
        this.feedback_title = this.feedbacks[index].title;
        for(var i = 0 ; i < this.appService.feedback_categories.length; i++){
            if(this.appService.feedback_categories[i].id == this.feedbacks[index].category){
                this.feedback_category = this.appService.feedback_categories[i].title;
                break;
            }
        }
        jQuery('#feedbackDetailModal').modal('show');
    }
    public onSearchChange(){
        if(this.search_text.length > 3 || this.search_text.length == 0){
            this.getFeedbacks();
        }
    }
    public deleteFeedback(){
        this.feebackService.deleteFeedback(this.feedbacks[this.selected_feedback].id).subscribe(result=>{
            if(result.result == 'success'){
                this.getFeedbacks();
                jQuery('#feedbackDetailModal').modal('hide');
                this.appService.showPNotify('success',result.message,'success');
            }else{
                this.appService.showPNotify('failure',result.message,'error');
            }
        },error=>{ this.appService.showPNotify('failure',"Server Error! Can't delete feedback",'error'); });
    }

    @ViewChild(SendFeedbackModalComponent)
    public  sendFeedbackModal: SendFeedbackModalComponent;
    public onSendFeedback() {
        this.sendFeedbackModal.onOpenModal();
    }
    public onFeedbackSent(result:string){
        this.getFeedbacks();
    }
}
