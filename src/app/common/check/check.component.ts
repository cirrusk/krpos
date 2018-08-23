import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// import { Observable } from 'rxjs/Observable';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/repeatWhen';
import 'rxjs/add/operator/takeWhile';
import { Config, Logger } from '../../core';
import { Utils } from '../../core/utils';

/**
 * Hybris Server 가 alive 상태인지 체크
 *
 * 원래는 ping 체크하거나 별도의 alive 체크 URL 호출로 체크해야하나
 * 해당 프로그램을 사용할 수 없고 체크 URL 이 별도로 없으므로
 * 접근이 쉬운 swagger URL을 호출함
 */
@Component({
  selector: 'pos-check',
  templateUrl: './check.component.html'
})
export class CheckComponent implements OnInit, OnDestroy {

  private httpSubscription: Subscription;
  private checkInterval: number;
  success: number;
  failure: number;
  checkUse: boolean;
  constructor(private http: HttpClient, private config: Config, private logger: Logger) {
    this.checkInterval = this.config.getConfig('healthCheckInterval');
    this.checkUse = this.config.getConfig('healthCheckUse');
    this.success = 0;
    this.failure = 0;
  }

  ngOnInit() {
    if (this.checkUse) {
      const checkUrl = this.config.getConfig('hybrisCheckUrl');
      this.httpSubscription = this.http.get(checkUrl, { responseType: 'text' })
      // .repeatWhen(() => Observable.timer(1000, this.checkInterval * 1000))
      .repeatWhen(() => TimerObservable.create(0, this.checkInterval * 1000))
      .retryWhen(err => {
        return err.do(res => {
          this.logger.set('check.component', `${Utils.stringify(res)}, check interval : ${this.checkInterval} sec.`).error();
          if (res.status !== 200) { this.failure++; }
          if (this.failure > 0) { this.success = 0; } // 화면 초기화 위해서 실패가 있으면 성공플래그 초기화
        }).delay(this.checkInterval * 1000);
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
