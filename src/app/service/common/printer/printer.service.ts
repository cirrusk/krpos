import { DriverReadyBroker } from './../../../peripheral/common/driverstatus.broker';
import { Injectable } from "@angular/core";

import { Observable, Subject, Subscription } from 'rxjs';

import { PrinterConfigs } from "../../../peripheral/printer/interface/override.printerconfig.interface";
import { PrinterDriver } from "../../../peripheral/printer/printer.driver";

@Injectable()
export class PrinterService {
    // 프린터 설정 override
    private printerOpts: PrinterConfigs;

    constructor(private printerDriver: PrinterDriver,
                private driverReadyBroker: DriverReadyBroker) {
        // Wait
        let waitPrinterDriver: Subject<any> = this.driverReadyBroker.getPrinterObserver();

        waitPrinterDriver.subscribe(
            () => {
                this.printerOpts = {
                    size: {width: 79, height: null},
                    units: 'mm',
                    colorType: 'grayscale',
                    interpolation: 'bilinear'
                    //scaleContent: false
                }
                
                console.log('Printer driver is ready');
        
                this.printerDriver.overridePrinterConfig(this.printerOpts);
            }
        );
    }

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
                console.log('Printing is complete');
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
                console.log('Printing is complete')
            }
        );
    }

    public sendCommand(cmd: string) {
        this.printText(cmd);
    }

    public openCashDrawer() {

    }
}