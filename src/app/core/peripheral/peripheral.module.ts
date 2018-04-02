import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverReadyBroker } from '../broker/driverstatus.broker';
import { NetworkDriver } from './network/network.driver';
import { PrinterDriver } from './printer/printer.driver';
import { QZDriver } from './qz/qz.driver';
import { NetworkService, PrinterService } from '../../service/pos';
import { FormatReader } from './common/format-reader';

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
    FormatReader
  ],
  declarations: []
})
export class PeripheralModule { }
