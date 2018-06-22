import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverReadyBroker } from '../broker/driverstatus.broker';
import { NetworkDriver } from './network/network.driver';
import { PrinterDriver } from './printer/printer.driver';
import { QZDriver } from './qz/qz.driver';
import { NetworkService, PrinterService } from '..';
import { FormatReader } from './common/format-reader';
import { NiceDriver } from './niceterminal/nice.driver';
import { NicePaymentService } from './niceterminal/nice.payment.service';


@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    DriverReadyBroker,
    QZDriver,
    PrinterDriver,
    NetworkDriver,
    PrinterService,
    NetworkService,
    FormatReader,
    NiceDriver,
    NicePaymentService
  ],
  declarations: []
})
export class PeripheralModule { }
