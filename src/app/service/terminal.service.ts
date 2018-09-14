import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/concat';

import { ApiService, Config, SpinnerService, Logger, AlertService } from '../core';
import { TerminalInfo, HttpData } from '../data';
import { MessageService } from '../message';

/**
 * 터미널 정보 취득 서비스
 */
@Injectable()
export class TerminalService {

  private terminalTimeout: number;
  constructor(private api: ApiService, private config: Config, private alert: AlertService, private msg: MessageService, private spinner: SpinnerService, private logger: Logger) {
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

  /**
   * 터미널 접속 시 에러세분화
   * 로그인 처리 에서 가장 먼저 체크하는 부분이므로 에러 설명 추가.
   *
   * @param error 에러 객체
   */
  public terminalError(error: any) {
    let msg = '';
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 500: {
          msg = `[내부 서버 오류] 서버에 오류가 발생하여 요청을 수행할 수 없습니다.<br>${error.message}`;
        } break;
        case 501: {
          msg = `[구현되지 않음] 서버에 요청을 수행할 수 있는 기능이 없습니다.<br>${error.message}`;
        } break;
        case 502: {
          msg = `[Bad Gateway] 서버에서 잘못된 응답을 받았습니다.<br>${error.message}`;
        } break;
        case 503: {
          msg = `[서비스를 사용할 수 없음] 서버가 다운되어 서버를 사용할 수 없습니다.<br>${error.message}`;
        } break;
        case 504: {
          msg = `[시간초과] 서버에서 요청을 받지 못했습니다.<br>${error.message}`;
        } break;
        default: {
          msg = `[${error.status} ${error.name}] ${error.statusText}<br>${error.message}`;
        } break;
      }
    } else {
      msg = `[${error.name}] ${error.message}`;
    }
    this.logger.set('header.component', `Terminal info get fail : ${msg}`).error();
    this.alert.error({ title: '미등록 기기 알림', message: this.msg.get('posNotSet') });
  }
}
