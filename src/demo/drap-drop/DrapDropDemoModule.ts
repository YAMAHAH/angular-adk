import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgDragDropModule } from 'ng-drag-drop';
import { SwapListComponent } from './swap-list/swap-list.component';
import { CompleteDemoComponent } from './complete-demo/complete-demo.component';
import { FormsModule } from '@angular/forms';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgDragDropModule.forRoot()
    ],
    exports: [SwapListComponent, CompleteDemoComponent],
    declarations: [SwapListComponent, CompleteDemoComponent],
    providers: [],
})
export class DrapDropDemoModule { }