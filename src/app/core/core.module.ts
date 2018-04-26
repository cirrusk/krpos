import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PeripheralModule } from './peripheral/peripheral.module';
import { ModalsModule } from '../modals/modals.module';
import { SpinnerModule } from './spinner/spinner.module';
import { AlertModule } from './alert/alert.module';

import { AuthService, BatchService, CartService, SearchService, TerminalService, MessageService, PagerService } from '../service';
import { InfoBroker, CancleOrderBroker, RestoreCartBroker, SearchBroker, SearchAccountBroker } from '../broker';
import { ChecksComponent } from '../modals';

import { throwIfAlreadyLoaded } from './module-import-guard';
import { ApiService, StorageService, QzHealthChecker, Logger } from '.';

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
    ApiService,
    AuthService,
    BatchService,
    SearchService,
    CartService,
    StorageService,
    PagerService,
    MessageService,
    InfoBroker,
    SearchAccountBroker,
    RestoreCartBroker,
    CancleOrderBroker,
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
