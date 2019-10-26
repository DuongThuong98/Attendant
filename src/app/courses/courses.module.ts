import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { CollapseModule } from 'ngx-bootstrap';
import { CoursesComponent } from './courses.component'
import { AddCourseComponent } from './add-course/add-course.component'
import { CourseDetailComponent } from './course-detail/course-detail.component'
import { CourseDetailStaffComponent } from './course-detail/course-detail-staff/course-detail-staff.component'
import { CourseDetailTeacherComponent } from './course-detail/course-detail-teacher/course-detail-teacher.component'
import { EditCourseComponent } from './edit-course/edit-course.component'


import { TooltipModule } from 'ngx-bootstrap';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {FileUploadModule} from "ng2-file-upload";
import { SharedModule } from '../shared/shared.module';
const coursesRoutes: Routes = [
  { path: '',  component: CoursesComponent },
  { path: 'add', component: AddCourseComponent },
  { path: ':id', component: CourseDetailComponent },
  { path: ':id/edit', component: EditCourseComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(coursesRoutes),
    CollapseModule.forRoot(),
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule,
    FileUploadModule,
    SharedModule
  ],
  declarations: [
    CoursesComponent,
    CourseDetailComponent,
    CourseDetailTeacherComponent,
    CourseDetailStaffComponent,
    AddCourseComponent,
    EditCourseComponent
  ],
  providers: []
})

export class CoursesModule {}
