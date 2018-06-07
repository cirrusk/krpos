
import { Injectable } from '@angular/core';
import { fromPromise } from 'rxjs/observable/fromPromise';
// import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AbstractDriver } from '../abstract.driver';
import { QZDriver } from './../qz/qz.driver';
import { DriverReadyBroker } from './../../broker/driverstatus.broker';
import { DocumentFormat } from './../common/document-format.enum';
import { DocumentType } from './../common/document-type.enum';
import { PrinterConfigs } from './helper/printer-configs';
import { Logger } from '../../logger/logger';

const enum Status {
    Disconnected,
    Connected,
    Selected,
    Ready
}

declare var qz: any;

@Injectable()
export class PrinterDriver extends AbstractDriver {
    // Status
    private status: Status;

    private selectedPrinterName: string;

    private curPrinterConfig: any;

    constructor(private qzDriver: QZDriver,
                private driverReadyBroker: DriverReadyBroker,
                private logger: Logger) {
        super('Printer');

        // Wait QZ Driver
        const waitQz: Subject<any> = this.driverReadyBroker.getQzObserver();

        this.logger.set('printer.driver', 'Printer Driver waiting QZ').debug();

        waitQz.subscribe(
            () => {
                this.status = Status.Connected;
                this.selectDefaultPrinter();
            }
        );

        // QZ Tray 종료할때 callback을 받아서 status 변경
        qz.websocket.setClosedCallbacks((evt) => {
            this.status = Status.Disconnected;
        });

    }

    public close(): void {
        this.qzDriver.disconnect();
        this.status = Status.Disconnected;
    }

    private selectDefaultPrinter(): void {
        const waitingForSelection: Subject<any> = new Subject();

        // Selecting default printer
        qz.printers.getDefault().then((printerName) => {
            this.selectedPrinterName = printerName;
            this.status = Status.Selected;

            this.logger.set('printer.driver', `Default printer was selected. Name is ${this.selectedPrinterName}.`).debug();

            waitingForSelection.next();
        })
        .catch((err) => {
            this.errorHandler(err);
        });

        // Waiting for printer selection to be completed
        waitingForSelection.subscribe(
            () => {
                this.initPrinterConfig();

                this.logger.set('printer.driver', 'Sending Msg to Printer service').debug();

                // Send printer ready signal
                const notifier: Subject<any> = this.driverReadyBroker.getPrinterObserver();
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
                // scaleContent: opts.scaleContent
                // density: opts.density
            });
        } catch (err) {
            this.logger.set('printer.driver', `Reconfigure error. ${err}`).error();
        }

        return this.curPrinterConfig;
    }

    /**
     * ready 상태 체크할 경우
     * websocket이 active 상태인지 체크
     * status상태가 ready 상태인지 체크
     */
    private checkReady() {
        const isQzActive = qz.websocket.isActive();
        this.logger.set('printer.driver', `check ready to printer is active ? ${isQzActive}, status : [${this.status}]`).debug();
        if (!isQzActive && (this.status !== Status.Ready)) {
             throw new Error('Printer driver is not ready');
        }
    }

    public printPixelModeHTML(data: string) {
        this.checkReady();

        const printData = [{
            type: DocumentType.HTML,
            format : DocumentFormat.PLAIN,
            data: data
        }];

        return fromPromise(
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

        const printData = [{
            type: DocumentType.RAW,
            data: data
        }];

        return fromPromise(
            qz.print(this.curPrinterConfig, printData)
            .catch(
                (err) => {
                    this.errorHandler(err);
            })
        );
    }
}
