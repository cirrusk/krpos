import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Logger } from '../logger/logger';

/**
 * 각종 Device Driver에 대한 이벤트 처리 broker
 */
@Injectable()
export class DriverReadyBroker {
    private waitQz: Subject<any> = new Subject();

    private waitPrinterDriver: Subject<any> = new Subject();

    private waitNetworkDriver: Subject<any> = new Subject();

    constructor(private logger: Logger) {
        this.logger.set('driver.ready.broker', '0. Broker init...').debug();
    }

    /**
     * QZ Tray Observer 취득
     */
    public getQzObserver(): Subject<any> {
        return this.waitQz;
    }

    /**
     * QZ Tray 준비 메시지 전송
     */
    public sendQzReadyMsg() {
        this.waitQz.next();
    }

    /**
     * Printer Observer 취득
     */
    public getPrinterObserver(): Subject<any> {
        return this.waitPrinterDriver;
    }

    /**
     * Printer 준비 메시지 전송
     */
    public sendPrinterReadyMsg() {
        this.waitPrinterDriver.next();
    }

    /**
     * 네트워크 Observer 취득
     */
    public getNetworkObserver(): Subject<any> {
        return this.waitNetworkDriver;
    }

    /**
     * 네트워크 준비 메시지 전송
     */
    public sendNetworkReadyMsg() {
        this.waitNetworkDriver.next();
    }
}
