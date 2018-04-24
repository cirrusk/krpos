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
            this.logger.set('dashboard.component', 'batch info subscribe ...').debug();
            this.batchNo = (data.batchNo === undefined || data.batchNo === null) ? null : data.batchNo;
          } else if (type === 'lck') {
            this.logger.set('dashboard.component', 'screen locktype subscribe ...').debug();
            this.screenLockType = data.lockType === undefined ? -1 : data.lockType;
          } else if (type === 'cbt') {
            if (result.data.act) {
              this.clearExistBatch();
            }
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
            this.logger.set('dashboard.component', `start batch info : ${Utils.stringify(data)}`).debug();
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
            this.logger.set('dashboard.component', `start batch error type : ${errdata.type}`).error();
            this.logger.set('dashboard.component', `start batch error message : ${errdata.message}`).error();
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
    if (this.screenLockType === LockType.LOCK) { return; }
    this.logger.set('dashboard.component', 'stop shift').debug();
    const existbatch: boolean = this.batchNo === null ? false : Utils.isNotEmpty(this.batchNo);
    const isloginBatch: boolean = this.storage.isLogin() && existbatch;
    if (isloginBatch) {
      let msg: string;
      let btn: string;
      const orderCount = 1;
      if (orderCount > 0) {
        msg = `주문 수량이 (<em class="fc_red">${orderCount}</em>)건 입니다.<br>배치 정보를 저장하시겠습니까?`;
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
          closeByEscape: true,
          closeByClickOutside: false,
          closeAllModals: false,
          modalId: 'STOPSHIFT'
        }
      ).subscribe(result => {
        if (result) {
          this.spinner.show();
          this.logger.set('dashboard.component', 'stop shift, stop batch...').debug();
          this.batchsubscription = this.batch.endBatch().subscribe(data => {
            this.storage.removeBatchInfo();
            this.infoBroker.sendInfo('bat', { batchNo: null });
            this.modal.openConfirm({
              title: 'Stop Shift',
              message: `배치 정보 저장이 완료되었습니다.`,
              actionButtonLabel: '확인',
              closeButtonLabel: '취소',
              closeByEnter: false,
              closeByEscape: true,
              closeByClickOutside: false,
              closeAllModals: false,
              modalId: 'STOPSHIFT_LAST'
            });
          });
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
      const orderCount = 1;
      if (orderCount > 0) {
        msg = `주문 수량이 (<em class="fc_red">${orderCount}</em>)건 입니다.<br>배치 정보를 저장하시겠습니까?`;
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
            this.logger.set('dashboard.component', 'pos end, stop batch...').debug();
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

  /**
   * 종료 시 배치가 중지되지 않고 닫았을 경우 다시 로그인 할 경우 생성되었던 배치를 삭제해야함.
   * 처음에는 로그인할 경우 처리하고자 했으나 subscribe 가 중첩되어 있어서 get method가 두번 실행되는 오류발생.
   * 로그인하면 broker를 통해 이벤트를 날리고 이벤트를 받을때 처리하도록 변경.
   */
  private clearExistBatch() {
    const tk = this.storage.getTokenInfo();
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
