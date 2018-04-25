import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { DriverReadyBroker } from '../../broker/driverstatus.broker';
import { NetworkDriver } from './network.driver';
import { Logger } from '../../logger/logger';
import Utils from '../../utils';

@Injectable()
export class NetworkService {

  private ipAddress: string = null;
  private macAddress: string = null;

  private waitNWService: Subject<any> = new Subject();

  constructor(private networkDriver: NetworkDriver,
    private driverReadyBroker: DriverReadyBroker,
    private logger: Logger) {
    // Wait
    const waitNetwork: Subject<any> = this.driverReadyBroker.getNetworkObserver();
    waitNetwork.subscribe(
      () => {
          this.logger.set('network.service', '2. Network service ready to receive data from network driver...').debug();
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

  public getLocalMacAddress(splitter?: string): string {
    if (this.macAddress === null) {
      if (splitter) {
        this.macAddress = Utils.convertMacAddress(this.networkDriver.macAddress, splitter);
      } else {
        this.macAddress = this.networkDriver.macAddress;
      }
    }
    this.logger.set('network.service', '3. Local Mac Address received successfully...' + this.macAddress).debug();
    return this.macAddress;
  }

  public wait(): Observable<any> {
    this.logger.set('network.service', '1. Network waiting...').debug();
    return this.waitNWService.asObservable();
 }

}
