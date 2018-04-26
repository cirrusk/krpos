import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Modal, Logger, StorageService, AlertService, AlertState, AlertType, SpinnerService } from '../core';
import { LoginComponent } from '../modals';
import { BatchService } from '../service/batch.service';
import { InfoBroker } from '../broker';
import { AccessToken, BatchInfo, LockType } from '../data';
import Utils from '../core/utils';

@Component({
  selector: 'pos-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  tokeninfo: AccessToken;
  batchNo: string;
  tokensubscription: Subscription;
  statssubscription: Subscription;
  batchsubscription: Subscription;
  alertsubscription: Subscription;
  screenLockType: number;
  private orderCount: number;
  constructor(
    private modal: Modal,
    private info: InfoBroker,
    private batch: BatchService,
    private storage: StorageService,
    private alert: AlertService,
    private spinner: SpinnerService,
    private logger: Logger,
    private router: Router) {
    this.orderCount = 0;
  }

  ngOnInit() {
    this.tokensubscription = this.info.getInfo().subscribe(
      (result) => {
        const type = result && result.type;
        const data: any = result && result.data || {};
        if (result === null) {
          this.batchNo = null;
        } else {
          if (type === 'bat') {
            this.logger.set('dashboard.component', 'batch info subscribe ...').debug();
            this.batchNo = (data.batchNo === undefined || data.batchNo === null) ? null : data.batchNo;
          } else if (type === 'lck') {
            this.logger.set('dashboard.component', 'screen locktype subscribe ...').debug();
            this.screenLockType = data.lockType === undefined ? -1 : data.lockType;
          }
        }
      }
    );
    this.tokeninfo = this.storage.getTokenInfo();
    this.batchNo = (this.storage.getBatchInfo()) ? this.storage.getBatchInfo().batchNo : null;
    this.screenLockType = this.storage.getScreenLockType();
    this.statssubscription = this.batch.statsBatch().subscribe(result => {
      if (result) {
        this.orderCount = result.ordersCount;
        this.logger.set('dashboard.component', `current order count : ${this.orderCount}`).debug();
      }
    });
  }

  ngOnDestroy() {
    if (this.tokensubscription) { this.tokensubscription.unsubscribe(); }
    if (this.batchsubscription) { this.batchsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
    if (this.statssubscription) { this.statssubscription.unsubscribe(); }
  }

  /**
   * 기본조건 : 로그인 상태일 경우
   * 1. start batch
   * 2. order 페이지 이동
   * 배치 저장 메시지는 필요없는지 확인 필요
   */
  startShift() {
    if (this.screenLockType === LockType.LOCK) { return; }
    if (this.storage.isLogin()) {
      this.batchsubscription = this.batch.getBatch().subscribe(result => {
        if (result && Utils.isNotEmpty(result.batchNo)) { // 기존 배치가 있으면 삭제하고 시작
          this.batchsubscription = this.batch.startBatchAfterClear(result.batchNo).subscribe(data => {
            this.logger.set('dashboard.component', `clear and start batch info : ${Utils.stringify(data)}`).debug();
            this.storage.setBatchInfo(data);
            this.info.sendInfo('bat', data);
            this.alert.show({ alertType: AlertType.info, title: '확인', message: '배치가 시작되었습니다.' });
            this.alertsubscription = this.alert.alertState.subscribe(
              (state: AlertState) => {
                if (!state.show) { this.router.navigate(['/order']); }  // 닫히면 order 화면으로...
              }
            );
          });
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('dashboard.component', `get batch error message : ${errdata.message}`).debug();
          if (Utils.isNoOpenBatchByErrors(errdata)) { // 기존 배치가 없으면 바로 배치 시작
            this.batchsubscription = this.batch.startBatch().subscribe(result => {
              if (result && Utils.isNotEmpty(result.batchNo)) {
                this.logger.set('dashboard.component', `start batch info : ${Utils.stringify(result)}`).debug();
                this.storage.setBatchInfo(result);
                this.info.sendInfo('bat', result);
                this.alert.show({ alertType: AlertType.info, title: '확인', message: '배치가 시작되었습니다.' });
                this.alertsubscription = this.alert.alertState.subscribe(
                  (state: AlertState) => {
                    if (!state.show) { this.router.navigate(['/order']); }  // 닫히면 order 화면으로...
                  }
                );
              }
            },
            err => {
              const errdt = Utils.getError(err);
              if (errdt) {
                this.logger.set('dashboard.component', `start batch error type : ${errdt.type}`).error();
                this.logger.set('dashboard.component', `start batch error message : ${errdt.message}`).error();
                this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdt.message}` });
              }
            });
          }
        }
      });
    }
  }

  /**
   * 로그오프 시 배치 정보 저장 후(P7페이지 배치 정보 저장 확인 팝업 뜸) 이후, 대시보드 메인으로 이동
   */
  stopShift() {
    if (this.screenLockType === LockType.LOCK) { return; }
    this.logger.set('dashboard.component', 'stop shift').debug();
    const existbatch: boolean = this.batchNo === null ? false : Utils.isNotEmpty(this.batchNo);
    const isloginBatch: boolean = this.storage.isLogin() && existbatch;
    if (isloginBatch) {
      let msg: string;
      let btn: string;
      if (this.orderCount > 0) {
        msg = `주문 수량이 (<em class="fc_red">${this.orderCount}</em>)건 입니다.<br>배치 정보를 저장하시겠습니까?`;
        btn = '확인';
      } else {
        msg = `배치를 종료하시겠습니까?<br>배치정보 저장 후, Stop Shift가 진행됩니다.`;
        btn = '계속';
      }
      this.modal.openConfirm(
        {
          title: 'Stop Shift',
          message: msg,
          actionButtonLabel: btn,
          closeButtonLabel: '취소',
          closeByClickOutside: false,
          modalId: 'STOPSHIFT'
        }
      ).subscribe(result => {
        if (result) {
          this.spinner.show();
          this.logger.set('dashboard.component', 'stop shift, stop batch...').debug();
          this.batchsubscription = this.batch.endBatch().subscribe(data => {
            this.storage.removeBatchInfo();
            this.info.sendInfo('bat', { batchNo: null });
            this.modal.openConfirm({
              title: 'Stop Shift',
              message: `배치 정보 저장이 완료되었습니다.`,
              actionButtonLabel: '확인',
              closeButtonLabel: '취소',
              closeByClickOutside: false,
              modalId: 'STOPSHIFT_LAST'
            });
          },
          error => {},
           () => { this.spinner.hide(); });
        }
      });
    }
  }

  /**
   * POS 종료
   * 1. 확인 팝업 출력
   * 2. 배치정보 저장
   * 3. 배치정보 저장 완료 확인 팝업
   * 4. 확인 시 POS 종료
   * 5. 취소, 닫기 시 확인 팝업 종료
   */
  posEnd() {
    if (this.screenLockType === LockType.LOCK) { return; }
    let msg: string;
    let btn: string;
    const existbatch: boolean = this.batchNo === null ? false : Utils.isNotEmpty(this.batchNo);
    const isloginBatch: boolean = this.storage.isLogin() && existbatch;
    if (isloginBatch) {
      if (this.orderCount > 0) {
        msg = `주문 수량이 (<em class="fc_red">${this.orderCount}</em>)건 입니다.<br>배치 정보를 저장하시겠습니까?`;
        btn = '확인';
      } else {
        msg = `POS를 종료하시겠습니까?<br>배치정보 저장 후, 화면 종료가 진행됩니다.`;
        btn = '계속';
      }
    } else {
      msg = `POS를 종료하시겠습니까?<br>화면 종료가 진행됩니다.`;
    }
    this.modal.openConfirm(
      {
        title: 'POS 종료',
        message: msg,
        actionButtonLabel: btn,
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        modalId: 'POSEND'
      }
    ).subscribe(
      result => {
        if (result) {
          if (isloginBatch) {
            this.spinner.show();
            this.batchsubscription = this.batch.endBatch().subscribe(data => {
              this.storage.logout();
              this.storage.removeEmployeeName(); // client 담당자 삭제
              this.modal.openConfirm({
                title: 'POS 종료',
                message: `배치 정보 저장이 완료되었습니다.`,
                actionButtonLabel: '확인',
                closeButtonLabel: '취소',
                closeByClickOutside: false,
                modalId: 'POSEND_LAST'
              }).subscribe(ret => {
                if (ret) {
                  this.storage.logout();
                  Utils.kioskModeEnd();
                }
              });
            },
            (error) => {},
            () => { this.spinner.hide(); });
          } else {
            Utils.kioskModeEnd();
          }
        } else {
          this.router.navigate(['/order']);
        }
      }
    );
  }

  /**
   * 종료 시 배치가 중지되지 않고 닫았을 경우 다시 로그인 할 경우 생성되었던 배치를 삭제해야함.
   * 처음에는 로그인할 경우 처리하고자 했으나 subscribe 가 중첩되어 있어서 get method가 두번 실행되는 오류발생.
   * 로그인하면 broker를 통해 이벤트를 날리고 이벤트를 받을때 처리하도록 변경.
   */
  private clearExistBatch() {
    const isLogin = this.storage.isLogin();
    const batchinfo = this.storage.getBatchInfo();
    const batchno = batchinfo && batchinfo.batchNo;
    const emptybatch = batchno === null ? true : Utils.isEmpty(batchno);
    if (isLogin && emptybatch) {
      this.batchsubscription = this.batch.clearBatch().subscribe(result => {
        this.logger.set('dashboard.component', `end exist batch : ${Utils.stringify(result)}`).debug();
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('dashboard.component', `${errdata.message}, skip clear batch...`).debug();
        }
      });
    } else {
      this.logger.set('dashboard.component', 'not exist session batch, skip clear batch...').debug();
    }
  }

}
