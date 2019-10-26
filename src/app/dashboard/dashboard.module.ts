import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { DashboardStudentComponent } from './dashboard-student/dashboard-student.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { DashboardStaffComponent } from './dashboard-staff/dashboard-staff.component';
import { DashboardTeacherComponent } from './dashboard-teacher/dashboard-teacher.component';
import { TooltipModule } from 'ngx-bootstrap';
import { SharedModule } from '../shared/shared.module';

const homeRoutes: Routes = [
  { path: '',   redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent,
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(homeRoutes),
    SharedModule,
    TooltipModule.forRoot()
  ],
  declarations: [
    DashboardComponent,
    DashboardStaffComponent,
    DashboardAdminComponent,
    DashboardStudentComponent,
    DashboardTeacherComponent
  ],
  providers: []
})

export class DashboardModule {}
