import { Subject, Observable } from 'rxjs';

import { QZDriver } from './../qz/qz.driver';
import { AbstractDriver } from "../common/abstract.driver";
import { PrinterConfigs } from './interface/override.printerconfig.interface';
import { Injectable } from '@angular/core';
import { DriverReadyBroker } from '../common/driverstatus.broker';

declare var qz: any;

enum Status {
    Connected,
    Selected,
    Ready
}

enum DocumentType {
    HTML = 'html',
    PDF = 'pdf',
    IMAGE = 'image',
    RAW = 'raw'
}

enum DocumentFormat {
    PLAIN = 'plain',
    FILE = 'file',
    BASE64 = 'base64'
}

@Injectable()
export class PrinterDriver extends AbstractDriver {
    // Status
    private status: Status;

    private selectedPrinterName: string;

    private curPrinterConfig: any;

    constructor(private qzDriver: QZDriver,
                private driverReadyBroker: DriverReadyBroker) {
        super('Printer');

        // Wait QZ Driver
        let waitQz: Subject<any> = this.driverReadyBroker.getQzObserver();

        console.log('Printer Driver waiting QZ');

        waitQz.subscribe(
            () => {
                this.status = Status.Connected;
                this.selectDefaultPrinter();
            }
        );
    }

    public close(): void {
        this.qzDriver.disconnect();
    }

    private selectDefaultPrinter(): void {
        let waitingForSelection: Subject<any> = new Subject();

        // Selecting default printer
        qz.printers.getDefault().then((printerName) => {
            this.selectedPrinterName = printerName;
            this.status = Status.Selected;

            console.log(`Default printer was selected. Name is ${this.selectedPrinterName}.`);

            waitingForSelection.next();
        })
        .catch((err) => {
            this.errorHandler(err);
        });

        // Waiting for printer selection to be completed
        waitingForSelection.subscribe(
            () => {
                this.initPrinterConfig();

                console.log('Sending Msg to Printer service');

                // Send printer ready signal
                let notifier: Subject<any> = this.driverReadyBroker.getPrinterObserver();
                notifier.next();
            }
        );
    }

    public getStatus(): string {
        return this.status.toString();
    }

    private initPrinterConfig() {
        this.curPrinterConfig = qz.configs.create(this.selectedPrinterName);
        this.status = Status.Ready;
    }

    public overridePrinterConfig(opts: PrinterConfigs): any {
        this.checkReady();

        try {
            this.curPrinterConfig.reconfigure({
                size: opts.size,
                units: opts.units,
                colorType: opts.colorType,
                interpolation: opts.interpolation
                //scaleContent: opts.scaleContent
                //density: opts.density
            });
        } catch (err) {
            console.log(`Reconfigure error. ${err}`);
        }

        return this.curPrinterConfig;
    }

    private checkReady() {
        if (this.status !== Status.Ready) {
            throw new Error('Printer driver is not ready');
        }
    }

    public printPixelModeHTML(data: string) {
        this.checkReady();

        let printData = [{
            type: DocumentType.HTML,
            format : DocumentFormat.PLAIN,
            data: data
        }];

        return Observable.fromPromise(
            qz.print(this.curPrinterConfig, printData)
            .catch(
                (err) => {
                    this.errorHandler(err);
                }
            )
        );
    }

    public printRawModeText(data: string) {
        this.checkReady();

        let printData = [{
            type: DocumentType.RAW,
            data: data
        }];

        return Observable.fromPromise(
            qz.print(this.curPrinterConfig, printData)
            .catch(
                (err) => {
                    this.errorHandler(err);
            })
        );
    }
}