import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/concat';

import { ApiService, Config, SpinnerService, Logger } from '../core';
import { TerminalInfo, HttpData } from '../data';

/**
 * 터미널 정보 취득 서비스
 */
@Injectable()
export class TerminalService {

  private terminalTimeout: number;
  constructor(private api: ApiService, private config: Config, private spinner: SpinnerService, private logger: Logger) {
    this.terminalTimeout = this.config.getConfig('terminalTimeout', 20);
  }

  /**
   * POS 단말기 인증
   *
   * 특이사항)
   * NetworkService 에서 QzTray 상태를 체크 하기 위해
   * wait하고 이때 Terminal 정보를 읽기 위해 http 호출되면서
   * pending 되는 현상, timeout을 주어 오류 발생하도록 처리.
   *
   * @param {string} macaddress 맥어드레스
   * @returns {TerminalInfo} 터미널 정보
   */
  public getTerminalInfo(macaddress: string): Observable<TerminalInfo> {
    const data = new HttpData('terminal', null, null, { macAddress: macaddress, fields: 'DEFAULT' });
    return this.api.post(data)
      .timeout(1000 * this.terminalTimeout)
      .retryWhen(errors => {
        return errors
          .flatMap((error: any) => {
            this.logger.set('terminal.service', error).error();
            if (error.name === 'TimeoutError') {
              return Observable.of(error.status).delay(1000);
            }
            return Observable.throw(error);
          })
          .take(5)
          .concat(Observable.throw(errors));
      })
      .finally(() => { this.spinner.hide(); });
  }

}
