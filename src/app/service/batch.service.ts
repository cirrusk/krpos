import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { InfoBroker } from '../broker/info.broker';
import { StorageService, Logger, Config } from './pos';
import { BatchInfo } from '../data/model';
import Utils from '../core/utils';

@Injectable()
export class BatchService {

  constructor(
              private http: HttpClient,
              private storage: StorageService,
              private infoBroker: InfoBroker,
              private config: Config, private logger: Logger) { }

  /**
   * Start Shift
   * 1. 로그인 팝업
   * 2. 로그인/배치저장
   * 3. 대시보드 메인
   * terminal: Terminal id of POS machine.
   * startingBalance: Starting Cash drawer balance. | (string) e.g 120
   * pickupStore: Store associated with terminal. | (string) e.g 01
   */
  startBatch(): Observable <BatchInfo> {
    this.logger.debug('Start shift start batch...', 'batch.service');
    const tokeninfo = this.storage.getTokenInfo();
    const terminalinfo = this.storage.getTerminalInfo();
    const tid = terminalinfo && terminalinfo.id;
    const tnm = terminalinfo && terminalinfo.pointOfService.name;
    const userid = tokeninfo && tokeninfo.employeeId;
    const batchUrl = this.config.getApiUrl('batchStart', { user_id: userid });
    console.log(batchUrl);
    const dataParams = { pickupStore: tid, terminal: tnm, startingBalance: '120' };
    console.log(JSON.stringify(dataParams));
    const httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(batchUrl, dataParams, { headers: httpHeaders, responseType: 'json' })
    .map(Utils.extractData)
    .catch(Utils.handleError);
  }

  /**
   * 근무종료
   * 로그오프 시 배치 저장 후(POS 종료 확인 팝업 -> 배치 정보 저장  팝업 뜸) 대시보드 메인으로 이동
   */
  endBatch() {
    this.logger.debug('End batch, and session storage access token info remove...', 'batch.service');
    this.storage.removeSessionItem('tokenInfo'); // remove access token info
    this.infoBroker.sendInfo(null); // info broker에 null access token을 전송해서 초기 상태로 변경.
  }


}
