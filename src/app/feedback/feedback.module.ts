import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { CollapseModule } from 'ngx-bootstrap';

import { FeedbackComponent } from './feedback.component';
import { FeedbackStaffComponent } from './feedback-staff/feedback-staff.component';
import { FeedbackHistoryComponent } from './feedback-history/feedback-history.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SharedModule} from '../shared/shared.module';
import { AutosizeModule } from '../shared/module/autosize/autosize.module';

const feedbackRoutes: Routes = [
  { path: '',  component: FeedbackComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(feedbackRoutes),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule,
    SharedModule,
    AutosizeModule
  ],
  declarations: [
    FeedbackComponent,
    FeedbackStaffComponent,
    FeedbackHistoryComponent
  ],
  providers: [
  ]
})

export class FeedbackModule {}
