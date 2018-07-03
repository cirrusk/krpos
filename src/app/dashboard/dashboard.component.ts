import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Modal, Logger, StorageService, AlertService, AlertState, SpinnerService } from '../core';
import { BatchService } from '../service';
import { InfoBroker } from '../broker';
import { AccessToken, LockType } from '../data';
import { Utils } from '../core/utils';

@Component({
  selector: 'pos-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  tokeninfo: AccessToken;
  batchNo: string;
  screenLockType: number;
  private tokensubscription: Subscription;
  private statssubscription: Subscription;
  private batchsubscription: Subscription;
  private alertsubscription: Subscription;
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
            this.screenLockType = data.lockType === undefined ? LockType.INIT : data.lockType;
          } else if (type === 'ewk') {
            this.tokeninfo = null;
          } else if (type === 'swk') {
            this.tokeninfo = this.storage.getTokenInfo();
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
      this.spinner.show();
      this.batchsubscription = this.batch.startBatch().subscribe(result => {
        if (result && Utils.isNotEmpty(result.batchNo)) {
          this.logger.set('dashboard.component', 'start batch...').debug();
          this.storage.setBatchInfo(result);
          this.info.sendInfo('bat', result);
          this.alert.info({ message: '배치가 시작되었습니다.' });
          this.alertsubscription = this.alert.alertState.subscribe(
            (state: AlertState) => {
              if (!state.show) { this.router.navigate(['/order']); }  // 닫히면 order 화면으로...
            }
          );
        }
      },
        error => {
          this.spinner.hide();
          const errdt = Utils.getError(error);
          if (errdt) {
            this.alert.error({ message: `${errdt.message}` });
          }
        },
        () => { this.spinner.hide(); });
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
          this.batchsubscription = this.batch.endBatch().subscribe(
            () => {
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
            this.batchsubscription = this.batch.endBatch().subscribe(
              () => {
                this.storage.logout();
                // this.storage.removeEmployeeName(); // client 담당자 삭제
                this.storage.clearClient();
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
              (error) => { },
              () => { this.spinner.hide(); });
          } else {
            Utils.kioskModeEnd();
          }
        } else {
          // this.router.navigate(['/order']); // 2018.04.30 대시보드 유지
        }
      }
    );
  }

}
