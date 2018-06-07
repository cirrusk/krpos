import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { PrinterDriver } from './printer.driver';
// import { FormatReader } from '../common/format-reader';
import { DriverReadyBroker } from '../../broker/driverstatus.broker';
import { PrinterConfigs } from './helper/printer-configs';
import { Logger } from '../../logger/logger';
// import { EscPos } from './helper/escpos/escpos';
// import { Utils } from '../../utils';

@Injectable()
export class PrinterService {

    // 프린터 설정 override
    private printerOpts: PrinterConfigs;
    constructor(private printerDriver: PrinterDriver,
        private dirverReadyBroker: DriverReadyBroker,
        // private formatReaderService: FormatReader,
        private logger: Logger) {
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

    }
}
