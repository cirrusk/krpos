import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { AbstractDriver } from '../abstract.driver';
import { DriverReadyBroker } from '../../broker/driverstatus.broker';
import { QZDriver } from '../qz/qz.driver';

import { Logger } from '../../logger/logger';
import { Config } from '../../config/config';

declare var qz: any;

@Injectable()
export class NetworkDriver extends AbstractDriver {
    private _ipAddress: string;
    private _macAddress: string;

    constructor(
            private qzDriver: QZDriver,
            private driverReadyBroker: DriverReadyBroker,
            private config: Config,
            private logger: Logger) {

        super('Network');

        // Wait QZ Driver
        const waitQz: Subject<any> = this.driverReadyBroker.getQzObserver();

        this.logger.set('network.driver', '1. Waiting QZ...').debug();

        waitQz.subscribe(
            () => {
                this.loadLocalNetworkInfo();
            },
            (err) => {},
            () => {
            }
        );
    }

    private loadLocalNetworkInfo(): void {
        this.logger.set('network.driver', '2. getNetworkInfo...').debug();
        const domain = this.config.getConfig('hybrisEndpointDomain');
        const port = this.config.getConfig('hybrisEndpointPort');
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
        // qz.websocket.getNetworkInfo().then(
        qz.websocket.getNetworkInfo(domain, port).then(
            (result) => {
                this._ipAddress = result.ipAddress;
                this._macAddress = result.macAddress;

                this.logger.set('network.driver', '3. Sending signal to Network Service').debug();

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
