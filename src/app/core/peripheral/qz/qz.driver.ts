import { Logger } from './../../logger/logger';
import { Injectable } from '@angular/core';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AbstractDriver } from '../abstract.driver';
import { DriverReadyBroker } from './../../broker/driverstatus.broker';

import { environment } from '../../../../environments/environment';

// import 'rxjs/add/operator/fromPromise';

const enum Status {
    Disconnected,
    Connected,
    Selected,
    Ready
}

declare var qz: any;

@Injectable()
export class QZDriver extends AbstractDriver {
    // Observables
    private openConn: Observable<any>;
    private closeConn: Observable<any>;
    private connInfo: Observable<any>;
    private qzTrayVersion: Observable<any>;

    // Driver Conneciton status
    private status: Status = Status.Disconnected;

    // Infomation
    private socket: string;
    private host: string;
    private port: number;

    // Provide Connection event subscription to external class
    private notifier: Subject<any>;

    constructor(private driverReadyBroker: DriverReadyBroker, private logger: Logger) {

        super('QZ Driver');

        this.logger.debug(`1. qz tray websocket ready..., web socket active? [${qz.websocket.isActive()}]`, 'qz.driver');

        const config = {retries: 5, delay: 1};
        this.openConn = fromPromise(qz.websocket.connect(config));
        this.closeConn = fromPromise(qz.websocket.disconnect());
        // this.connInfo = fromPromise(qz.websocket.getConnectionInfo());
        this.qzTrayVersion = fromPromise(qz.api.getVersion());

        if (environment.production) {
            this.turnOffDebug();
        } else {
            this.turnOnDebug();
        }

        this.notifier = this.driverReadyBroker.getQzObserver();

        this.connect();

    }

    public connect() {
        const waitingForConnection: Subject<any> = new Subject();

        this.openConn
        .subscribe(
            () => {
                this.status = Status.Connected;
                this.logger.debug(`2. qz tray websocket connect..., web socket active? [${qz.websocket.isActive()}]`, 'qz.driver');
                waitingForConnection.next();
            },
            (err) => {
                // this.errorHandler(err);
                this.handleConnectionError(err);
            }
        );

        qz.websocket.setClosedCallbacks((evt) => {
            this.status = Status.Disconnected;
            this.logger.debug(`[qz.driver] qz tray close callback for qz driver : ${evt}, status : ${this.status}`, 'qz.driver');
        });

        const waitingForGetDetails: Subject<any> = new Subject();

        waitingForConnection.subscribe(
            () => {
                const result = qz.websocket.getConnectionInfo();

                this.socket = result.socket;
                this.host = result.host;
                this.port = result.port;

                waitingForGetDetails.next();
            },
            (err) => {
                this.errorHandler(err);
            }
        );

        waitingForGetDetails.subscribe(
            () => {
                this.logger.debug('3. Explicit connection to QZ tray was opened.', 'qz.driver');
                this.notifier.next();
            },
            (err) => {
                this.errorHandler(err);
            }
        );
    }

    public disconnect() {
        this.closeConn.subscribe(
            () => {
                this.status = Status.Disconnected;
            },
            (err) => {
                // this.errorHandler(err);
                this.handleConnectionError(err);
            }
        );
    }

    public isActiveConn(): boolean {
        return (this.status === Status.Connected) ? true : false;
    }

    public notActiveConn(): boolean {
        return (this.status === Status.Disconnected) ? true : false;
    }

    protected turnOnDebug(): void {
        qz.api.showDebug(true);
    }

    protected turnOffDebug(): void {
        qz.api.showDebug(false);
    }
}
