import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { CollapseModule } from 'ngx-bootstrap';
import { CheckAttendanceComponent } from './check-attendance.component'
import { CheckAttendanceTeacherComponent } from './check-attendance-teacher/check-attendance-teacher.component'
import { CheckAttendanceStudentComponent } from './check-attendance-student/check-attendance-student.component'
import { TooltipModule } from 'ngx-bootstrap';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {FileUploadModule} from "ng2-file-upload";
import { SharedModule } from '../shared/shared.module';
const Routes: Routes = [
  { path: '',  component: CheckAttendanceComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(Routes),
    CollapseModule.forRoot(),
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    SharedModule
  ],
  declarations: [
    CheckAttendanceComponent,
    CheckAttendanceStudentComponent,
    CheckAttendanceTeacherComponent,
  ],
  providers: []
})

export class CheckAttendanceModule {}
