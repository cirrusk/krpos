import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { TestModule } from './common/test/test.module';

import { Config } from './core/config/config';

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
    DashboardComponent
  ],
  providers: [
    Config,
    { provide: APP_INITIALIZER, useFactory: initConfig, deps: [Config], multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function initConfig(config: Config) { return () => config.load(); }
