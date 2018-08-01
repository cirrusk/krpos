import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
// import 'rxjs/add/operator/delay';

import { PrinterDriver } from './printer.driver';
import { DriverReadyBroker } from '../../broker/driverstatus.broker';
import { PrinterCommands } from './helper/printer-commands';
import { PrinterConfigs } from './helper/printer-configs';
import { Logger } from '../../logger/logger';

@Injectable()
export class PrinterService {

    // 프린터 설정 override
    private printerOpts: PrinterConfigs;
    private prtCmd: PrinterCommands;
    constructor(private printerDriver: PrinterDriver,
        private dirverReadyBroker: DriverReadyBroker,
        private logger: Logger) {
        this.prtCmd = new PrinterCommands();
        // Wait
        const waitPrinterDriver: Subject<any> = this.dirverReadyBroker.getPrinterObserver();
        waitPrinterDriver.subscribe(
            () => {
                this.printerOpts = {
                    size: { width: 79, height: null },
                    units: 'mm',
                    colorType: 'grayscale',
                    interpolation: 'bilinear'
                    // scaleContent: false
                };

                this.logger.set('printer.service', 'Printer driver is ready').debug();

                this.printerDriver.overridePrinterConfig(this.printerOpts);
            }
        );
    }

    public init(): void { }

    public closeConnection(): void {
        this.printerDriver.close();
    }

    public printInlineHTML(html: string) {
        this.printerDriver.printPixelModeHTML(html).subscribe(
            (result) => {

            },
            (err) => {
                throw err;
            },
            () => {
                this.logger.set('printer.service', 'Printing[HTML] is complete').debug();
            }
        );
    }

    public printText(rawData: string) {
        this.printerDriver.printRawModeText(rawData).subscribe(
            () => {

            },
            (err) => {
                throw err;
            },
            () => {
                this.logger.set('printer.service', 'Printing[Text] is complete').debug();
            }
        );
    }

    public sendCommand(cmd: string) {
        this.printText(cmd);
    }

    public openCashDrawer() {
        this.sendCommand(this.prtCmd.initPrinter() + this.prtCmd.openCashDrawer());
    }
}
