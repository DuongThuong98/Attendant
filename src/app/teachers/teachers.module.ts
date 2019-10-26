import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { TeachersComponent }    from './teachers.component';
import { TeacherDetailComponent } from './teacher-detail/teacher-detail.component';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SharedModule } from '../shared/shared.module';

const teachersRoutes: Routes = [
  { path: '',  component: TeachersComponent },
  { path: ':id', component: TeacherDetailComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(teachersRoutes),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    SharedModule
  ],
  declarations: [
    TeachersComponent,
    TeacherDetailComponent
  ],
  providers: []
})
export class TeachersModule {}
