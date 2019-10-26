import { Component, OnInit } from '@angular/core';
import { ScheduleService, AppService, SemesterService } from '../shared/shared.module';
import { Router, ActivatedRoute, Params } from '@angular/router';
@Component({
    selector: 'app-setting',
    templateUrl: './setting.component.html'
})
export class SettingComponent implements OnInit {

    public constructor(public  scheduleService: ScheduleService, public  appService: AppService, public  router: Router, public  semesterService: SemesterService) {}
    public mask = [/\d/, /\d/, ':', /\d/, /\d/];
    public settings = { 
        emails : [
            {
                host_name : '',
                signature : '',
                config: {
                    auth:{
                        user : '',
                        pass : ''
                    }
                },
            }
        ]
    };
    public selected_email_index = 0;
    public ngOnInit() {
        this.appService.getSettings().subscribe(result=>{
            this.settings = result.settings;
            console.log(this.settings.emails);
            this.onChangeHost();
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't get settings",'error');});
    }
    public onChangeHost(){
        for(var i = 0 ; i < this.settings['emails'].length; i++){
            if(this.settings['emails'][i].host_name == this.settings['selected_host']){
                this.selected_email_index = i;
                break;
            }
        }
    }
    public saveSetting(){
    	this.appService.saveSettings(this.settings).subscribe(result=>{
            if(result.result == 'success'){
                this.appService.showPNotify('success',result.message,'success');
            }else{
                this.appService.showPNotify('failure',result.message,'error');
            }
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't get settings",'error');});
    }
}
