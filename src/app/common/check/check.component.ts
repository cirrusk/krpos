import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/repeatWhen';
import 'rxjs/add/operator/takeWhile';

import { Config } from './../../core/config/config';

@Component({
  selector: 'pos-check',
  templateUrl: './check.component.html'
})
export class CheckComponent implements OnInit, OnDestroy {

  private httpSubscription: Subscription;
  private checkInterval: number;
  private success: number;
  private failure: number;
  private checkUse: boolean;
  constructor(private http: HttpClient, private config: Config) {
    this.checkInterval = this.config.getConfig('healthCheckInterval');
    this.checkUse = this.config.getConfig('healthCheckUse');
    this.success = 0;
    this.failure = 0;
  }

  ngOnInit() {
    if (this.checkUse) {
      const checkUrl = this.config.getConfig('hybrisCheckUrl');
      this.httpSubscription = this.http.get(checkUrl)
      .repeatWhen(() => Observable.timer(1000, this.checkInterval))
      // .repeatWhen(() => TimerObservable.create(0, this.checkInterval))
      .retryWhen(err => {
        return err.do(res => {
          this.failure++;
          if (this.failure > 0) { // 화면 초기화 위해서 실패가 있으면 성공플래그 초기화
            this.success = 0;
          }
        }).delay(this.checkInterval);
      })
      .subscribe(res => {
        if (this.failure > 0) { this.failure--; }
        this.success++;
      });
    }
  }

  ngOnDestroy() {
    if (this.checkUse && this.httpSubscription) { this.httpSubscription.unsubscribe(); }
  }
}
