import { Injectable } from "@angular/core";

import { Observable, Subject, Subscription } from 'rxjs';

import { PrinterConfigs } from "../../../peripheral/printer/interface/override.printerconfig.interface";
import { PrinterDriver } from "../../../peripheral/printer/printer.driver";
import { FileDownloader } from './../file/filedownloader';
import { DriverReadyBroker } from './../../../peripheral/common/driverstatus.broker';
import { EscPos } from './helpers/escpos';
import { UTF8ArrayConverter } from "../utils/utf8.arrayconverter";

@Injectable()
export class PrinterService {
    // 프린터 설정 override
    private printerOpts: PrinterConfigs;

    constructor(private printerDriver: PrinterDriver,
                private driverReadyBroker: DriverReadyBroker,
                private fileDownloader: FileDownloader) {
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

    public initXmlTemplates() {
        this.fileDownloader.readContents('assets/template/receipt/test2.xml')
        .subscribe(
            (text) => {
                console.log(`===== Original : \n${text}`);
                //let build: number[] = EscPos.getBufferFromXML(text);
                let raw: Uint8Array = EscPos.getTransformedRaw(text);
                console.log(`===== Raw data : \n${raw}`);

                let converted: string = UTF8ArrayConverter.decode(raw);
                console.log(`===== convertedToString : \n${converted}\n${converted.split('')}`);

                let escaped = EscPos.escapeNull(converted);
                console.log(`===== Null Escaped :\n ${escaped}\n${escaped.split('')}`);

                let parsed = EscPos.getParsed(escaped, {
                    'subtitle':'MJMJ'
                });
                console.log(`===== Parsed : \n${parsed}`);

                let unescaped = EscPos.unescapeNull(parsed);
                console.log(`===== Unescaped : \n${unescaped}`);

                let encoded = UTF8ArrayConverter.encode(converted);
                console.log(`==== Encoded : \n${encoded}`);

                // let same = (encoded === org) ? true : false;

                // console.log(`==== Check : \n${same}`);
            }
        );
    }
}