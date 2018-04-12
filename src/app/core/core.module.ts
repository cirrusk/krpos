import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PeripheralModule } from './peripheral/peripheral.module';
// import { ModalModule } from './modal/modal.module';
import { ModalsModule } from '../modals/modals.module';
import { CheckComponent } from '../common/check/check.component';
import { TerminalService } from '../service/terminal.service';
import { AuthService } from '../service/auth.service';
import { BatchService } from '../service/batch.service';

import { QzHealthChecker } from './service/qz-health-checker';
import { Logger } from './logger/logger';
import { InfoBroker } from '../broker/info.broker';
import { SearchService } from '../service/order/search.service';
import { SearchAccountBroker } from '../broker/order/search/search-account.broker';
import { SearchBroker } from '../broker/order/search/search.broker';
import { CartService } from '../service/order/cart.service';
import { StorageService } from './service/storage.service';
import { SpinnerModule } from './spinner/spinner.module';
import { AlertModule } from './alert/alert.module';
import { throwIfAlreadyLoaded } from './module-import-guard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PeripheralModule,
    ModalsModule,
    SpinnerModule,
    AlertModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PeripheralModule,
    SpinnerModule,
    AlertModule
  ],
  providers: [
    TerminalService,
    AuthService,
    BatchService,
    SearchService,
    CartService,
    StorageService,
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
