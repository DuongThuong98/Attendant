import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ClassesComponent } from './classes.component';
import { TooltipModule } from 'ngx-bootstrap';
import { SharedModule } from '../shared/shared.module';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {FileUploadModule} from "ng2-file-upload";
const homeRoutes: Routes = [
  {
    path: '',
    component: ClassesComponent,
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
    ClassesComponent
  ],
  providers: []
})

export class ClassesModule {}
