import { QzHealthChecker } from './service/qz-health-checker';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PeripheralModule } from './peripheral/peripheral.module';
import { ModalModule } from './modal/modal.module';
import { TerminalService } from './../service/terminal.service';
import { AuthService } from '../service/auth.service';
import { BatchService } from '../service/batch.service';

import { Logger } from './logger/logger';
import { InfoBroker } from '../broker/info.broker';
import { SearchService } from '../service/order/search.service';
import { SearchAccountBroker } from '../broker/order/search/search-account.broker';
import { SearchBroker } from '../broker/order/search/search.broker';
import { LoginService } from './service/login.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PeripheralModule,
    ModalModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PeripheralModule
  ],
  providers: [
    TerminalService,
    AuthService,
    BatchService,
    SearchService,
    LoginService,
    InfoBroker,
    SearchAccountBroker,
    QzHealthChecker,
    DatePipe,
    Logger
  ],
  declarations: []
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}

export function throwIfAlreadyLoaded(parentModule: any, moduleName: string) {
  if (parentModule) {
    throw new Error(`${moduleName} has already been loaded. Import Core modules in the AppModule only.`);
  }
}
