import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { LoginComponent } from '../modals/login/login.component';
import { Modal, Logger, StorageService } from '../service/pos';
import { BatchService } from '../service/batch.service';
import { InfoBroker } from '../broker/info.broker';
import { AccessToken, BatchInfo } from '../data/model';
import { AlertService, AlertState } from '../core/alert/alert.service';
import { AlertType } from '../core/alert/alert-type.enum';
import { LockType } from '../common/header/header.component';
import { SpinnerService } from '../core/spinner/spinner.service';
import Utils from '../core/utils';

@Component({
  selector: 'pos-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  tokeninfo: AccessToken;
  batchNo: string;
  tokensubscription: Subscription;
  batchsubscription: Subscription;
  alertsubscription: Subscription;
  screenLockType: number;
  constructor(
    private modal: Modal,
    private infoBroker: InfoBroker,
    private batch: BatchService,
    private storage: StorageService,
    private alert: AlertService,
    private spinner: SpinnerService,
    private logger: Logger,
    private router: Router) {
    this.tokensubscription = this.infoBroker.getInfo().subscribe(
      (result) => {
        const type = result && result.type;
        const data: any = result && result.data || {};
        if (result === null) {
          this.batchNo = null;
        } else {
          if (type === 'bat') {
            this.logger.set({n: 'dashboard.component', m: 'batch info subscribe ...'}).debug();
            this.batchNo = (data.batchNo === undefined || data.batchNo === null) ? null : data.batchNo;
          } else if (type === 'lck') {
            this.logger.set({n: 'dashboard.component', m: 'screen locktype subscribe ...'}).debug();
            this.screenLockType = data.lockType === undefined ? -1 : data.lockType;
          }
        }
      }
    );
  }

  ngOnInit() {
    this.tokeninfo = this.storage.getTokenInfo();
    this.batchNo = (this.storage.getBatchInfo()) ? this.storage.getBatchInfo().batchNo : null;
    this.screenLockType = this.storage.getScreenLockType();
  }

  ngOnDestroy() {
    if (this.tokensubscription) { this.tokensubscription.unsubscribe(); }
    if (this.batchsubscription) { this.batchsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
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
      this.batchsubscription = this.batch.startBatch().subscribe(
        (data) => {
          if (data && Utils.isNotEmpty(data.batchNo)) {
            this.logger.set({n: 'dashboard.component', m: `start batch info : ${Utils.stringify(data)}`}).debug();
            this.storage.setBatchInfo(data);
            this.infoBroker.sendInfo('bat', data);
            this.alert.show({ alertType: AlertType.info, title: '확인', message: '배치가 시작되었습니다.' });
            this.alertsubscription = this.alert.alertState.subscribe(
              (state: AlertState) => {
                if (!state.show) { // 닫히면...
                  this.router.navigate(['/order']);
                }
              }
            );
          }
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.set({n: 'dashboard.component', m: `start batch error type : ${errdata.type}`}).error();
            this.logger.set({n: 'dashboard.component', m: `start batch error message : ${errdata.message}`}).error();
            this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdata.message}` });
          }
        }
      );
    }
  }

  /**
   * 로그오프 시 배치 정보 저장 후(P7페이지 배치 정보 저장 확인 팝업 뜸) 이후, 대시보드 메인으로 이동
   */
  stopShift() {
      this.logger.set({n: 'dashboard.component', m: 'stop shift'}).debug();
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
    const existbatch: boolean = this.batchNo === null ? false : Utils.isNotEmpty(this.batchNo);
    const isloginBatch: boolean = this.storage.isLogin() && existbatch;
    if (isloginBatch) {
      msg = `POS를 종료하시겠습니까?<br>배치정보 저장 후, 화면 종료가 진행됩니다.`;
    } else {
      msg = `POS를 종료하시겠습니까?<br>화면 종료가 진행됩니다.`;
    }
    this.modal.openConfirm(
      {
        title: 'POS 종료',
        message: msg,
        actionButtonLabel: '계속',
        closeButtonLabel: '취소',
        closeByEscape: true,
        closeByClickOutside: false,
        closeAllModals: false,
        modalId: 'POSEND'
      }
    ).subscribe(
      result => {
        if (result) {
          if (isloginBatch) {
            this.spinner.show();
            this.logger.set({n: 'dashboard.component', m: 'pos end, stop batch...'}).debug();
            this.batchsubscription = this.batch.endBatch().subscribe(data => {
              this.storage.logout();
              this.storage.removeEmployeeName(); // client 담당자 삭제
              this.modal.openConfirm({
                title: 'POS 종료',
                message: `배치 정보 저장이 완료되었습니다.`,
                actionButtonLabel: '확인',
                closeButtonLabel: '취소',
                closeByEnter: false,
                closeByEscape: true,
                closeByClickOutside: false,
                closeAllModals: false,
                modalId: 'POSEND_LAST'
              }).subscribe(ret => {
                if (ret) {
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

}
