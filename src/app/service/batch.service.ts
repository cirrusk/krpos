import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { InfoBroker } from './../broker/info.broker';
import { Config } from './../core/config/config';
import { Logger } from './pos';

@Injectable()
export class BatchService {

  constructor(
              private http: HttpClient,
              private infoBroker: InfoBroker,
              private config: Config, private logger: Logger) { }

  /**
   * Start Shift
   * 1. 로그인 팝업
   * 2. 로그인/배치저장
   * 3. 대시보드 메인
   */
  startBatch() {
    this.logger.debug('*** start shift start batch...');
  }

  /**
   * 근무종료
   * 로그오프 시 배치 저장 후(POS 종료 확인 팝업 -> 배치 정보 저장  팝업 뜸) 대시보드 메인으로 이동
   */
  endBatch() {
    this.logger.debug('*** end batch, and session storage access token info remove...', 'batch.service');
    sessionStorage.removeItem('tokenInfo'); // remove access token info
    this.infoBroker.sendInfo(null); // info broker에 null access token을 전송해서 초기 상태로 변경.
  }


}
