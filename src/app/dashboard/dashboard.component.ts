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
    private batchService: BatchService,
    private storage: StorageService,
    private alert: AlertService,
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
      this.batchsubscription = this.batchService.startBatch().subscribe(
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
   * 배치 저장
   */
  private saveBatch() {
    this.batchService.startBatch();
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
    const isloginBatch: boolean = this.storage.isLogin() && Utils.isNotEmpty(this.batchNo);
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
        modalId: 'POS_END'
      }
    ).subscribe(
      result => {
        if (result) {
          if (isloginBatch) {
            // 1. 확인 팝업
            // 2. 배치 정보 저장 팝업
            // 3. 화면 종료
            // this.batchService.endBatch(); // 나중에는 subsrcibe 해야됨.

          } else {
            Utils.kioskModeEnd();
          }
        }
      }
    );
  }

}
