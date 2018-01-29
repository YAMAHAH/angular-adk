import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, } from '@angular/forms';
import { QueryBuilderComponent } from './query-builder.component';
import { NgDragDropModule } from 'ng-drag-drop';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgDragDropModule.forRoot(),
    TranslateModule
  ],
  declarations: [
    QueryBuilderComponent
  ],
  exports: [
    QueryBuilderComponent
  ]
})
export class QueryBuilderModule { }
