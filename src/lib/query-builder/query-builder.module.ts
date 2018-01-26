import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, } from '@angular/forms';
import { QueryBuilderComponent } from './query-builder.component';
import { NgDragDropModule } from 'ng-drag-drop';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgDragDropModule.forRoot()
  ],
  declarations: [
    QueryBuilderComponent
  ],
  exports: [
    QueryBuilderComponent
  ]
})
export class QueryBuilderModule { }
