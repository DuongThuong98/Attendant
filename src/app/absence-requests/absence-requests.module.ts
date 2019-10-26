import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AbsenceRequestsComponent } from './absence-requests.component';
import { AbsenceRequestsStaffComponent } from './absence-requests-staff/absence-requests-staff.component';
import { AbsenceRequestsStudentComponent } from './absence-requests-student/absence-requests-student.component';
import { CollapseModule , DatepickerModule, TabsModule, PaginationModule} from 'ngx-bootstrap';
import { SharedModule } from '../shared/shared.module';

const AbsenceRequestsRoutes: Routes = [
  { path: '',  component: AbsenceRequestsComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(AbsenceRequestsRoutes),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule,
    DatepickerModule,
    SharedModule
  ],
  declarations: [
    AbsenceRequestsComponent,
    AbsenceRequestsStaffComponent,
    AbsenceRequestsStudentComponent
  ],
  providers: []
})

export class AbsenceRequestsModule{}
