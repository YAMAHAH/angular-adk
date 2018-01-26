import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgDragDropModule } from 'ng-drag-drop';
import { SwapListComponent } from './swap-list/swap-list.component';


@NgModule({
    imports: [
        CommonModule,
        NgDragDropModule.forRoot()
    ],
    exports: [SwapListComponent],
    declarations: [SwapListComponent],
    providers: [],
})
export class DrapDropDemoModule { }