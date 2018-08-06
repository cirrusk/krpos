import { Injectable } from '@angular/core';
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

/**
 * 네트워크 상태 체크 서비스
 */
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

  /**
   * QZ Tray 체크
   *
   * @param {number} interval 체크 간격
   */
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

  /**
   * 네트워크 온라인 여부 체크 - 동작하지 않음.
   * WIFI 연결을 끌때 체크되지 않음.
   *
   * @param {number} interval 체크 간격
   */
  private networkCheck(interval = 6000) { // 기본 1분
    this.networkStatus = Observable
      .interval(interval)
      .timeInterval()
      .map(() => {
        if (window.navigator.onLine) {
          return true;
        } else {
          return false;
        }
      });
  }

  /**
   * Hybris(API 서버) Alive 체크
   *
   * @param {number} interval 체크 간격
   */
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
