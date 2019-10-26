import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TabsModule,TooltipModule } from 'ngx-bootstrap';
import { QRCodeModule } from 'angular2-qrcode';
import {TranslateModule} from '@ngx-translate/core';
import { LocalStorageModule } from 'angular-2-local-storage';
import {FileUploadModule} from "ng2-file-upload";
import { AppConfig } from './config'
import { AgmCoreModule } from '@agm/core';

export {AppConfig};

import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { TopNavigationComponent } from './components/top-navigation/top-navigation.component';
import { FooterComponent } from './components/footer/footer.component';
import { PageNotFoundComponent } from './components/page-not-found.component';
export {PageNotFoundComponent};
import { EditScheduleModalComponent } from './components/edit-schedule-modal/edit-schedule-modal.component';
export { EditScheduleModalComponent };
import { ResultMessageModalComponent } from './components/result-message-modal/result-message-modal.component';
export { ResultMessageModalComponent };
import { ImportModalComponent } from './components/import-modal/import-modal.component';
export { ImportModalComponent };
import { MapModalComponent } from './components/map-modal/map-modal.component';
export { MapModalComponent };
import { ExportModalComponent } from './components/export-modal/export-modal.component';
export { ExportModalComponent };
import { CreateAbsenceRequestModalComponent } from './components/create-absence-request-modal/create-absence-request-modal.component';
export { CreateAbsenceRequestModalComponent };
import { SendFeedbackModalComponent } from './components/send-feedback-modal/send-feedback-modal.component';
export { SendFeedbackModalComponent };
import { QRCodeComponent } from './components/qr-code.component';
export { QRCodeComponent };
import { QuizDisplayComponent } from './components/quiz-display/quiz-display.component';
export { QuizDisplayComponent };
import {AppService} from './services/app.service';
export {AppService};
import {CourseService} from './services/courses.service';
export {CourseService};
import {TeacherService} from './services/teachers.service';
export {TeacherService};
import {AttendanceService} from './services/attendance.service';
export {AttendanceService};
import {ExcelService} from './services/excel.service';
export {ExcelService};
import {ScheduleService} from './services/schedule.service';
export {ScheduleService};
import {StudentService} from './services/student.service';
export {StudentService};
import {AbsenceRequestService} from './services/absence-request.service';
export {AbsenceRequestService};
import {AuthGuardService} from './services/auth-guard.service';
export {AuthGuardService};
import {AuthService} from './services/auth.service';
export {AuthService};
import {SemesterService} from './services/semester.service';
export {SemesterService};
import {FeedbackService} from './services/feedback.service';
export {FeedbackService};
import {SocketService} from './services/socket.service';
export {SocketService};
import {CheckAttendanceService} from './services/check-attendance.service';
export {CheckAttendanceService};
import {QuizService} from './services/quiz.service';
export {QuizService};
import {ClassesService} from './services/classes.service';
export {ClassesService};
import {ProgramsService} from './services/programs.service';
export {ProgramsService};
import {NotificationService} from './services/notification.service';
export {NotificationService};
import {MapService} from './services/map.service';
export {MapService};
/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TabsModule,
    QRCodeModule,
    LocalStorageModule.withConfig({
            prefix: 'qldd',
            storageType: 'localStorage'
        }),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAaHGDoehkovVBMyKmJL1Q-7-4wZRYpqVg'
    }),
    FileUploadModule,
    TooltipModule.forRoot(),
    TranslateModule
  ],
  declarations: [
    FooterComponent,
    SideMenuComponent,
    TopNavigationComponent,
    PageNotFoundComponent,
    EditScheduleModalComponent,
    ResultMessageModalComponent,
    ImportModalComponent,
    MapModalComponent,
    CreateAbsenceRequestModalComponent,
    SendFeedbackModalComponent,
    ExportModalComponent,
    QRCodeComponent,
    QuizDisplayComponent
  ],
  exports: [
    FooterComponent,
    SideMenuComponent,
    TopNavigationComponent,
    PageNotFoundComponent,
    EditScheduleModalComponent,
    ResultMessageModalComponent,
    ImportModalComponent,
    MapModalComponent,
    CreateAbsenceRequestModalComponent,
    SendFeedbackModalComponent,
    ExportModalComponent,
    QRCodeComponent,
    QuizDisplayComponent,
    TranslateModule
  ],  
  providers: [
    AppService,
    CourseService,
    TeacherService,
    AttendanceService,
    ScheduleService,
    StudentService,
    ExcelService,
    AbsenceRequestService,
    AppConfig,
    AuthGuardService,
    SemesterService,
    FeedbackService,
    CheckAttendanceService,
    SocketService,
    QuizService,
    ClassesService,
    ProgramsService,
    NotificationService,
    MapService
  ]
})
export class SharedModule {}