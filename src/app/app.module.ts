import { NgModule, InjectionToken } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { COMPOSITION_BUFFER_MODE } from '@angular/forms';
// https://angular.io/api/forms/COMPOSITION_BUFFER_MODE
// https://blog.redpumpkin.net/2017/08/13/angular-korean-binding/

import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CheckComponent } from './common/check/check.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { TestModule } from './common/test/test.module';

import { Config, CLIENT_SECRET } from './core/config/config';

import { AuthInterceptor } from './core/interceptor/auth.interceptor';
import { ClientComponent } from './client/client.component';
import { MESSAGE_PROVIDER } from './message/message';
import { OrderModule } from './order/order.module';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    TestModule,
    OrderModule
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    CheckComponent,
    ClientComponent
  ],
  providers: [
    Config,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor , multi: true },
    { provide: COMPOSITION_BUFFER_MODE, useValue: false },
    { provide: CLIENT_SECRET, useValue: '83d8f684-7a35-47f7-96fd-b6587d3ed736' },
    MESSAGE_PROVIDER
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
