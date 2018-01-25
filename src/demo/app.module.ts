import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import '../lib/helpers/ExpressionParser';
import '../lib/helpers/RegExpBuilder';
import { PerfectScrollbarDemoModule } from './perfect-scrollbar/PerfectScrollbarDemoModule';
import { QueryBuilderModule } from '../lib/query-builder/query-builder.module';
import { PageStatusMonitor } from '../lib/services/application/PageStatusMonitor';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    QueryBuilderModule,
    PerfectScrollbarDemoModule
  ],
  providers: [PageStatusMonitor],
  bootstrap: [AppComponent]
})
export class AppModule { }
