import { Logger } from './../../logger/logger';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { DriverReadyBroker } from '../../broker/driverstatus.broker';
import { NetworkDriver } from './network.driver';

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
          this.logger.debug('Network service is ready', 'network.service');
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
    this.logger.debug('Network waiting...', 'network.service');
    return this.waitNWService.asObservable();
 }

}
