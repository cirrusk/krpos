import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/timeInterval';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/repeatWhen';
import 'rxjs/add/operator/takeWhile';

import { Config } from '../config/config';

declare var qz: any;
declare interface Window {
  navigator: any;
}

declare const window: Window;
@Injectable()
export class NetworkStatusService {

  private qzStatus: Observable<boolean>;
  private networkStatus: Observable<boolean>;
  private hybrisStatus: Observable<boolean>;
  constructor(private http: HttpClient, private config: Config) {
    this.qzCheck();
    this.networkCheck();
    this.hybrisCheck();
  }

  private qzCheck(interval = 180000) { // 기본 3분
    const use: boolean = this.config.getConfig('qzCheck');
    if (use) {
      this.qzStatus = Observable.interval(1000 * interval)
        .map(
          () => {
            return qz.websocket.isActive();
          }
        );
    }
  }

  private networkCheck(interval = 6000) { // 기본 1분
    this.networkStatus = Observable
      .interval(interval)
      .timeInterval()
      .map(() => {
        if (window.navigator.onLine) {
          console.log('online');
          return true;
        } else {
          console.log('offline');
          return false;
        }
      });
  }

  private hybrisCheck(interval = this.config.getConfig('healthCheckInterval')) {
    const use: boolean = this.config.getConfig('healthCheckUse');
    if (use) {
      const checkUrl = this.config.getConfig('hybrisCheckUrl');
      this.hybrisStatus = this.http.get<boolean>(checkUrl)
        .repeatWhen(() => TimerObservable.create(0, interval))
        .retryWhen(err => {
          return err.do(res => {
            if (res.status !== 200) { return false; }
            return true;
          }).delay(interval);
        });
    }
  }

  get isQzAlive(): Observable<boolean> {
    const use: boolean = this.config.getConfig('qzCheck');
    return use ? this.qzStatus : Observable.of(true);
  }

  get isNetworkAlive(): Observable<boolean> {
    return this.networkStatus;
  }

  get isHybrisAlive(): Observable<boolean> {
    const use: boolean = this.config.getConfig('healthCheckUse');
    return use ? this.hybrisStatus : Observable.of(true);
  }
}
