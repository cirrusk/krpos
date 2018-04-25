import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/empty';

import { ApiService, StorageService, Logger } from '../core';
import { BatchInfo, BatchStats, HttpData } from '../data';
import Utils from '../core/utils';


@Injectable()
export class BatchService {

  constructor(private api: ApiService,
              private storage: StorageService,
              private logger: Logger) { }

  /**
   * Start Shift
   * 1. 로그인 팝업
   * 2. 로그인/배치저장
   * 3. 대시보드 메인
   * terminal: Terminal id of POS machine.
   * startingBalance: Starting Cash drawer balance. | (string) e.g 120
   * pickupStore: Store associated with terminal. | (string) e.g 01
   */
  startBatch(): Observable<BatchInfo> {
    this.logger.set('batch.service', 'Start shift start batch...').debug();
    const tokeninfo = this.storage.getTokenInfo();
    const terminalinfo = this.storage.getTerminalInfo();
    const tid = terminalinfo && terminalinfo.id;
    const tnm = terminalinfo && terminalinfo.pointOfService.name;
    const userid = tokeninfo && tokeninfo.employeeId;
    const dataParams = { pickupStore: tnm, terminal: tid, startingBalance: '0' };
    const data = new HttpData('batchStart', { user_id: userid }, dataParams, null, 'json');
    return this.api.post(data);
  }

  /**
   * 근무종료
   * 배치 아이디가 있으면(getBatch 에서 넘어온 배치 아이디) 그 값으로 배치 종료
   * 배치 아이디가 없으면 세션의 배치정보 배치 아이디 값으로 배치 종료
   * 로그오프 시 배치 저장 후(POS 종료 확인 팝업 -> 배치 정보 저장  팝업 뜸) 대시보드 메인으로 이동
   */
  endBatch(batchno?: string): Observable<BatchInfo> {
    let batchid: string;
    if (batchno) {
      batchid = batchno;
    } else {
      const batchinfo = this.storage.getBatchInfo();
      batchid = batchinfo && batchinfo.batchNo;
    }
    this.logger.set('batch.service', `end batch of [${batchid}]`).debug();
    const data = new HttpData('batchStop', { batch_id: batchid }, null, {endingBalance: '0'} );
    return this.api.put(data);
  }

  /**
   * 현재 배치 정보 조회
   * 배치를 시작하고 그냥 브라우저를 닫았을 경우
   * 다시 들어가면 배치정보가 있으면 그냥 정보를 넣어주어
   * 다시 배치 시작하지 않도록 함.
   * 왜냐하면 브라우저 종료 후 다시 들어가면 Batch 세션 정보가 날라가므로
   * Batch 시작 안된 상태가 되며, 여기서 Batch 를 시작하면 already exist error 발생.
   */
  getBatch(): Observable<BatchInfo> {
    this.logger.set('batch.service', 'get current batch...').debug();
    const terminalinfo = this.storage.getTerminalInfo();
    const tid = terminalinfo && terminalinfo.id;
    const tnm = terminalinfo && terminalinfo.pointOfService.name;
    const data = new HttpData('batch', null, null, { pickupStore: tnm, terminal: tid });
    return this.api.get(data);
  }

  /**
   * 배치 조회와 삭제를 동시에 merge 한다.
   */
  clearBatch(): Observable<BatchInfo> {
    this.logger.set('batch.service', 'get current batch and clear exist batch start...').debug();
    return this.getBatch()
    .flatMap((batchinfo: BatchInfo) => {
      return this.endBatch(batchinfo.batchNo);
    });
  }

  /**
   * 배치 통계 정보 조회
   */
  statsBatch(): Observable<BatchStats> {
    this.logger.set('batch.service', 'get batch statistics...').debug();
    const batchinfo = this.storage.getBatchInfo();
    const batchid = batchinfo && batchinfo.batchNo;
    if (batchid === null) {
      return Observable.empty();
    } else {
      const data = new HttpData('batchStats', {batch_id: batchid}, null, null);
      return this.api.get(data);
    }
  }

}
