import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CollapseModule } from 'ngx-bootstrap';
import { ScheduleComponent }    from './schedule.component';
import { ScheduleStudentComponent }  from './schedule-student/schedule-student.component';
import { ScheduleStaffComponent }    from './schedule-staff/schedule-staff.component';
import { ScheduleTeacherComponent }  from './schedule-teacher/schedule-teacher.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {FileUploadModule} from "ng2-file-upload";
import { SharedModule } from '../shared/shared.module';
const scheduleRoutes: Routes = [
  { path: '',  component: ScheduleComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(scheduleRoutes),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule,
    FileUploadModule,
    SharedModule,
  ],
  declarations: [
    ScheduleComponent,
    ScheduleStaffComponent,
    ScheduleStudentComponent,
    ScheduleTeacherComponent
  ],
  providers: []
})
export class ScheduleModule {}
