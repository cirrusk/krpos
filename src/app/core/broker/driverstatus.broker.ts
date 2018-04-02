import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Logger } from '../logger/logger';

@Injectable()
export class DriverReadyBroker {
    private waitQz: Subject<any> = new Subject();

    private waitPrinterDriver: Subject<any> = new Subject();

    private waitNetworkDriver: Subject<any> = new Subject();

    constructor(private logger: Logger) {
        this.logger.info('Broker');
    }

    public getQzObserver(): Subject<any> {
        return this.waitQz;
    }

    public sendQzReadyMsg() {
        this.waitQz.next();
    }

    public getPrinterObserver(): Subject<any> {
        return this.waitPrinterDriver;
    }

    public sendPrinterReadyMsg() {
        this.waitPrinterDriver.next();
    }

    public getNetworkObserver(): Subject<any> {
        return this.waitNetworkDriver;
    }

    public sendNetworkReadyMsg() {
        this.waitNetworkDriver.next();
    }
}
