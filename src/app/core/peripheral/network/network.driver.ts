import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { AbstractDriver } from '../abstract.driver';
import { DriverReadyBroker } from './../../broker/driverstatus.broker';
import { QZDriver } from './../qz/qz.driver';

import { environment } from '../../../../environments/environment';
import { Logger } from '../../logger/logger';

declare var qz: any;

@Injectable()
export class NetworkDriver extends AbstractDriver {
    private _ipAddress: string;
    private _macAddress: string;

    constructor(
            private qzDriver: QZDriver,
            private driverReadyBroker: DriverReadyBroker,
            private logger: Logger) {

        super('Network');

        // Wait QZ Driver
        const waitQz: Subject<any> = this.driverReadyBroker.getQzObserver();

        this.logger.debug('1. Network Driver : Waiting QZ', 'network.driver');

        waitQz.subscribe(
            () => {
                this.loadLocalNetworkInfo();
            }
        );
    }

    private loadLocalNetworkInfo(): void {
        this.logger.debug('2. loadLocalNetworkInfo start...', 'network.driver');
        /**
         * qz.websocket
         *
         * host
         * port
         * usingSecure : true
         * keepAlive : default: 60, Set to 0 to disable.
         * retries : Number of times to reconnect before failing.
         * delay : Seconds before firing a connection. Ignored if options.retries is 0.
         */
        // qz.websocket.getNetworkInfo(environment.hybrisEndpointDomain, environment.hybrisEndpointPort).then(
        qz.websocket.getNetworkInfo().then(
            (result) => {
                this._ipAddress = result.ipAddress;
                this._macAddress = result.macAddress;

                this.logger.debug('3. Sending signal to Network Service', 'network.driver');

                // Send signal
                const notifier: Subject<any> = this.driverReadyBroker.getNetworkObserver();
                notifier.next();
            }
        )
        .catch(
            (err) => {
                this.errorHandler(err);
            }
        );
    }

    public get ipAddress(): string {
        return this._ipAddress;
    }

    public get macAddress(): string {
        return this._macAddress;
    }

}
