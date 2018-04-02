import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { TestModule } from './common/test/test.module';

import { Config } from './core/config/config';
import { OrderComponent } from './order/order.component';
import { OrderListComponent } from './order/order-list/order-list.component';
import { OrderMenuComponent } from './order/order-menu/order-menu.component';
import { PriceInfoComponent } from './order/price-info/price-info.component';
import { SearchBroker } from './broker/order/search/search.broker';
import { AuthInterceptor } from './core/interceptor/auth.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    TestModule
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    OrderComponent,
    OrderListComponent,
    OrderMenuComponent,
    PriceInfoComponent
  ],
  providers: [
    Config,
    { provide: APP_INITIALIZER, useFactory: initConfig, deps: [Config], multi: true },
    {provide : HTTP_INTERCEPTORS, useClass: AuthInterceptor , multi: true},
    SearchBroker
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function initConfig(config: Config) { return () => config.load(); }
