import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/finally';

import { ApiService } from '../core';
import { TerminalInfo, HttpData } from '../data';
import Utils from '../core/utils';

@Injectable()
export class TerminalService {

  constructor(private api: ApiService) { }

  /**
   * POS 단말기 인증
   * 특이사항)
   * NetworkService 에서 QzTray 상태를 체크 하기 위해
   * wait하고 이때 Terminal 정보를 읽기 위해 http 호출되면서
   * pending 되는 현상, timeout을 주어 오류 발생하도록 처리.
   *
   * @param macaddress
   */
  public getTerminalInfo(macaddress: string): Observable<TerminalInfo> {
    const data = new HttpData('terminal', null, null, {macAddress: macaddress});
    return this.api.post(data).timeout(1000 * 15).finally(() => {});
  }

}
