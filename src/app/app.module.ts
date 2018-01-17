import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { QueryBuilderModule } from './query-builder/query-builder.module';
import './helpers/ExpressionParser';
import './helpers/RegExpBuilder';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    QueryBuilderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
