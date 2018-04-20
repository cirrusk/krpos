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
  batchinfo: BatchInfo;
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
       if (result && Utils.isNotEmpty(result.batchNo)) {
          this.logger.debug('batch info subscribe ... ', 'dashboard.component');
          this.batchinfo = result;
        } else if (result && Utils.isNotEmpty(result.lockType + '')) {
          this.logger.debug('screen locktype subscribe ... ', 'dashboard.component');
          this.screenLockType = result.lockType;
        }
      }
    );
  }

  ngOnInit() {
    this.tokeninfo = this.storage.getTokenInfo();
    this.batchinfo = this.storage.getBatchInfo();
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
            this.storage.setBatchInfo(data);

            this.alert.show({ alertType: AlertType.info, title: '확인', message: '배치가 시작되었습니다.' });

            this.alertsubscription = this.alert.alertState.subscribe(
              (state: AlertState) => {
                if (!state.show) { // 닫히면...
                  console.log('------------------- 닫힌다.');
                  this.router.navigate(['/order']);
                }
              }
            );
          }
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.error(`start batch error type : ${errdata.type}`, 'dashboard.component');
            this.logger.error(`start batch error message : ${errdata.message}`, 'dashboard.component');
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
      this.logger.debug('stop shift', 'dashboard.component');
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
    let btn: string;
    const islogin: boolean = this.storage.isLogin();
    if (islogin) {
      msg = `POS를 종료하시겠습니까?<br>배치정보 저장 후, 화면 종료가 진행됩니다.`;
      btn = '계속';
    } else {
      msg = `POS를 종료하시겠습니까?<br>화면 종료가 진행됩니다.`;
      btn = '확인';
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
        modalId: 'POS_END'
      }
    ).subscribe(
      result => {
        if (result) {
          if (islogin) {
            // 1. 확인 팝업
            // 2. 배치 정보 저장 팝업
            // 3. 화면 종료
            // this.batchService.endBatch(); // 나중에는 subsrcibe 해야됨.
            console.log('batch 저장');
          } else {
            console.log('login 전 pos 종료[batch 저장하지 않음]');
            Utils.kioskModeEnd();
          }
        }
      }
    );
  }

}
