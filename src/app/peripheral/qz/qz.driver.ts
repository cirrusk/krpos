import { Injectable } from '@angular/core';
import { Subject, Observable } from "rxjs";

import { AbstractDriver } from "../common/abstract.driver";
import { QzConnectionDeatil } from "../printer/interface/qzconnection.interface";
import { environment } from "../../../environments/environment";
import { DriverReadyBroker } from '../common/driverstatus.broker';

declare var qz: any;

enum Status {
    Disconnected,
    Connected
}

@Injectable()
export class QZDriver extends AbstractDriver {
    // Observables
    private openConn: Observable<any>;
    private closeConn: Observable<any>;
    private connInfo: Observable<any>
    private qzTrayVersion: Observable<any>;

    // Driver Conneciton status
    private status: Status = Status.Disconnected;

    // Infomation
    private socket: string;
    private host: string;
    private port: number;

    // Provide Connection event subscription to external class
    private notifier: Subject<any>;

    constructor(private driverReadyBroker: DriverReadyBroker) {
        super('QZ Driver');

        this.openConn = Observable.fromPromise(qz.websocket.connect());
        this.closeConn = Observable.fromPromise(qz.websocket.disconnect());
        //this.connInfo = Observable.fromPromise(qz.websocket.getConnectionInfo());
        this.qzTrayVersion = Observable.fromPromise(qz.api.getVersion());

        if (!environment.production) {
            this.turnOnDebug();
        } else {
            this.turnOffDebug();
        }

        this.notifier = this.driverReadyBroker.getQzObserver();

        this.connect();
    }

    public connect() {
        let waitingForConnection: Subject<any> = new Subject();

        this.openConn.subscribe(
            () => {
                this.status = Status.Connected;

                waitingForConnection.next();
            },
            (err) => {
                this.errorHandler(err);
            }
        );

        let waitingForGetDetails: Subject<any> = new Subject();

        waitingForConnection.subscribe(
            () => {
                let result = qz.websocket.getConnectionInfo();

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
                console.log('Explicit connection to QZ tray was opened.');
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
                this.errorHandler(err);
            }
        );
    }

    public isActiveConn(): boolean {
        return (this.status === Status.Connected) ? true : false;
    };

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