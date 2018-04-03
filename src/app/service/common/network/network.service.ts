import { Injectable } from "@angular/core";

import { Subject, Observable } from "rxjs";
import { NetworkDriver } from "../../../core/peripheral/network/network.driver";
import { DriverReadyBroker } from "../../../core/broker/driverstatus.broker";


@Injectable()
export class NetworkService {
    private ipAddress: string = null;

    private macAddress: string = null;

    private waitNWService: Subject<any> = new Subject();

    constructor(private networkDriver:NetworkDriver,
                private driverReadyBroker: DriverReadyBroker) {
        // Wait
        let waitNetwork: Subject<any> = this.driverReadyBroker.getNetworkObserver();

        waitNetwork.subscribe(
            () => {
                console.log('Network service is ready');

                // Init 시점 기다리는 모듈에 통보
                this.waitNWService.next();
            }
        );
    }

    public getLocalIpAddress(): string {
        if (this.ipAddress === null) {
            this.ipAddress = this.networkDriver.ipAddress;
        }

        return this.ipAddress;
    }

    public getLocalMacAddress(): string {
        if (this.macAddress === null) {
            this.macAddress = this.networkDriver.macAddress;
        }
        
        return this.macAddress;
    }

    public wait(): Observable<any> {
        return this.waitNWService.asObservable();
    }
}