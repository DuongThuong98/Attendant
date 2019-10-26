import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ProgramsComponent } from './programs.component';
import { TooltipModule } from 'ngx-bootstrap';
import { SharedModule } from '../shared/shared.module';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {FileUploadModule} from "ng2-file-upload";
const homeRoutes: Routes = [
  {
    path: '',
    component: ProgramsComponent,
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(homeRoutes),
    SharedModule,
    TooltipModule.forRoot(),
    FileUploadModule,
    PaginationModule.forRoot(),
  ],
  declarations: [
    ProgramsComponent
  ],
  providers: []
})

export class ProgramsModule {}
