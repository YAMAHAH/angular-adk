import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { AppComponent } from './app.component';
import '../lib/helpers/ExpressionParser';
import '../lib/helpers/RegExpBuilder';
import { PerfectScrollbarDemoModule } from './perfect-scrollbar/PerfectScrollbarDemoModule';
import { QueryBuilderModule } from '../lib/query-builder/query-builder.module';
import { PageStatusMonitor } from '../lib/services/application/PageStatusMonitor';
import { DrapDropDemoModule } from './drap-drop/DrapDropDemoModule';
import { TranslateModule, TranslateLoader, MissingTranslationHandler, MissingTranslationHandlerParams } from "@ngx-translate/core";
import { MatInputModule, MatFormFieldModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export class MyMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    return params.key;
  }
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MyMissingTranslationHandler
      },
      useDefaultLang: false
    }),
    QueryBuilderModule,
    PerfectScrollbarDemoModule,
    DrapDropDemoModule,
    MatInputModule, MatFormFieldModule

  ],
  providers: [PageStatusMonitor],
  bootstrap: [AppComponent]
})
export class AppModule { }
