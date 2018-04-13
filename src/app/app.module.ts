import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CheckComponent } from './common/check/check.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { TestModule } from './common/test/test.module';

import { Config } from './core/config/config';
import { OrderComponent } from './order/order.component';
import { OrderListComponent } from './order/order-list/order-list.component';
import { OrderMenuComponent } from './order/order-menu/order-menu.component';
import { PriceInfoComponent } from './order/price-info/price-info.component';
import { OrderCompleteComponent } from './order/order-complete/order-complete.component';

import { AddCartBroker } from './broker/order/cart/add-cart.broker';
import { SearchBroker } from './broker/order/search/search.broker';
import { AuthInterceptor } from './core/interceptor/auth.interceptor';
import { ClientComponent } from './client/client.component';


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
    PriceInfoComponent,
    CheckComponent,
    ClientComponent,
    OrderCompleteComponent
  ],
  providers: [
    Config,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor , multi: true },
    SearchBroker,
    AddCartBroker
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
