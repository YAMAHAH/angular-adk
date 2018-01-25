import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PerfectScrollbarDemo } from './PerfectScrollbarDemo';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from '../../lib/perfect-scrollbar/perfect-scrollbar.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PerfectScrollbarModule
        
    ],
    exports: [PerfectScrollbarDemo],
    declarations: [PerfectScrollbarDemo],
    providers: [],
})
export class PerfectScrollbarDemoModule { }
