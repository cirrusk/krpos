import { Injectable } from '@angular/core';
import { Subscription, Subject, Observable } from 'rxjs';

import { environment } from './../../../environments/environment';
import { QZDriver } from './../qz/qz.driver';
import { AbstractDriver } from "../common/abstract.driver";
import { DriverReadyBroker } from '../common/driverstatus.broker';

declare var qz: any;

@Injectable()
export class NetworkDriver extends AbstractDriver {
    private _ipAddress: string;

    private _macAddress: string;

    constructor(private qzDriver: QZDriver,
                private driverReadyBroker: DriverReadyBroker) {
        super('Network');

        // Wait QZ Driver
        let waitQz: Subject<any> = this.driverReadyBroker.getQzObserver();

        console.log('Network Driver : Waiting QZ');

        waitQz.subscribe(
            () => {
                this.loadLocalNetworkInfo();
            }
        );
    }

    private loadLocalNetworkInfo(): void {
        qz.websocket.getNetworkInfo(environment.hybrisEndpointDomain, environment.hybrisEndpointPort).then(
            (result) => {
                this._ipAddress = result.ipAddress;
                this._macAddress = result.macAddress;

                console.log('Sending signal to Network Service');

                // Send signal
                let notifier: Subject<any> = this.driverReadyBroker.getNetworkObserver();
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