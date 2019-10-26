import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { QuizTeacherComponent }    from './quiz-teacher.component';
import { TabsModule,AccordionModule ,PaginationModule } from 'ngx-bootstrap';
import { AutosizeModule } from '../shared/module/autosize/autosize.module';
import { SharedModule } from '../shared/shared.module';
import { TooltipModule } from 'ngx-bootstrap';
const Routes: Routes = [
  { path: '',  component: QuizTeacherComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(Routes),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    AccordionModule.forRoot(),
    TabsModule.forRoot(),
    SharedModule,
    AutosizeModule
  ],
  declarations: [
    QuizTeacherComponent,
  ],
  providers: []
})
export class QuizModule {}
