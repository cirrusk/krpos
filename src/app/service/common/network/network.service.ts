import { Injectable } from "@angular/core";
import { NetworkDriver } from "../../../peripheral/network/network.driver";
import { DriverReadyBroker } from "../../../peripheral/common/driverstatus.broker";
import { Subject } from "rxjs";

@Injectable()
export class NetworkService {
    private ipAddress: string = null;

    private macAddress: string = null;

    constructor(private networkDriver:NetworkDriver,
                private driverReadyBroker: DriverReadyBroker) {
        // Wait
        let waitNetwork: Subject<any> = this.driverReadyBroker.getNetworkObserver();

        waitNetwork.subscribe(
            () => {
                console.log('Network service is ready');
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
}