import { Injectable } from '@angular/core';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AbstractDriver } from '../abstract.driver';
import { DriverReadyBroker } from '../../broker/driverstatus.broker';
import { Config } from '../../config/config';
import { Logger } from '../../logger/logger';
import { QZSelfsignedCert } from './qz.selfsigned.cert';

// import 'rxjs/add/operator/fromPromise';

const enum Status {
    Disconnected,
    Connected,
    Selected,
    Ready
}

declare var qz: any;
declare var KJUR: any;
declare var stob64: any;
declare var KEYUTIL: any;
declare var hextorstr: any;

@Injectable()
export class QZDriver extends AbstractDriver {
    // Observables
    private openConn: Observable<any>;
    private closeConn: Observable<any>;
    // private connInfo: Observable<any>;
    // private qzTrayVersion: Observable<any>;

    // Driver Conneciton status
    private status: Status = Status.Disconnected;

    // Infomation
    private socket: string;
    private host: string;
    private port: number;

    // Provide Connection event subscription to external class
    private notifier: Subject<any>;

    constructor(private driverReadyBroker: DriverReadyBroker, private config: Config, private logger: Logger) {

        super('QZ Driver');

        this.logger.set('qz.driver', `1. qz tray websocket ready..., web socket active? [${qz.websocket.isActive()}]`).debug();
        const prod = this.config.getConfig('production');
        const conf = {retries: 2, delay: 5};
        this.openConn = fromPromise(qz.websocket.connect(conf));
        this.closeConn = fromPromise(qz.websocket.disconnect());
        // this.connInfo = fromPromise(qz.websocket.getConnectionInfo());
        // this.qzTrayVersion = fromPromise(qz.api.getVersion());

        if (prod) {
            this.turnOffDebug();
        } else {
            this.turnOnDebug();
        }

        this.notifier = this.driverReadyBroker.getQzObserver();

        this.connect();

    }

    public connect() {
        const waitingForConnection: Subject<any> = new Subject();

        this.registerCertInfo();

        this.openConn
        .subscribe(
            () => {
                this.status = Status.Connected;
                this.logger.set('qz.driver', `2. qz tray websocket connect, active? [${qz.websocket.isActive()}]`).debug();
                waitingForConnection.next();
            },
            (err) => {
                // this.errorHandler(err);
                this.handleConnectionError(err);
            }
        );

        qz.websocket.setClosedCallbacks((evt) => {
            this.status = Status.Disconnected;
        });

        const waitingForGetDetails: Subject<any> = new Subject();

        waitingForConnection.subscribe(
            () => {
                const result = qz.websocket.getConnectionInfo();

                this.socket = result.socket;
                this.host = result.host;
                this.port = result.port;
                this.logger.set('qz.driver', 'socket : ${this.socket}, host: ${this.host}, port : ${this.port}.').debug();
                waitingForGetDetails.next();
            },
            (err) => {
                this.errorHandler(err);
            }
        );

        waitingForGetDetails.subscribe(
            () => {
                this.logger.set('qz.driver', '3. Explicit connection to QZ tray was opened.').debug();
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

    protected registerCertInfo(): void {
        qz.security.setCertificatePromise( (resolve, reject) => {
            resolve(QZSelfsignedCert.cert.trim());
        });

        qz.security.setSignaturePromise( (toSign) => {
            return (resolve, reject) => {
                try {
                    const pk = KEYUTIL.getKey(QZSelfsignedCert.privateKey.trim());

                    const sig = new KJUR.crypto.Signature({'alg': 'SHA1withRSA'});
                    sig.init(pk);
                    sig.updateString(toSign);
                    const signatureHex = sig.sign();

                    resolve(stob64(hextorstr(signatureHex)));
                } catch (err) {
                    this.logger.set('qz.driver', `${err}`).error();
                    reject(err);
                }
            };
        });
    }
}
