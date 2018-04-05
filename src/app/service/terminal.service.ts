import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

import { TerminalInfo } from '../data/model';
import { Config, Logger } from './pos';
import Utils from '../core/utils';

@Injectable()
export class TerminalService {

  constructor(private http: HttpClient, private config: Config, private logger: Logger) { }

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
    const terminalApiUrl = this.config.getConfig('terminalApiUrl');
    console.log(terminalApiUrl);
    const httpParams = new HttpParams().set('macAddress', macaddress);
    const httpHeaders = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post(terminalApiUrl, httpParams.toString(), { headers: httpHeaders, responseType: 'json' })
    .timeout(1000 * 15)
    .map(Utils.extractData)
    .catch(Utils.handleError);
  }

}
