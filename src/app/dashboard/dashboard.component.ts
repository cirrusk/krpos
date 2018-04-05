import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { LoginComponent } from '../modals/login/login.component';
import { Modal, Logger, LoginService } from '../service/pos';
import { BatchService } from './../service/batch.service';
import { InfoBroker } from '../broker/info.broker';
import { AccessToken } from '../data/model';

import Utils from '../core/utils';

@Component({
  selector: 'pos-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  tokeninfo: AccessToken;
  tokensubscription: Subscription;
  constructor(
    private modal: Modal,
    private infoBroker: InfoBroker,
    private batchService: BatchService,
    private loginService: LoginService,
    private logger: Logger) {
    this.tokensubscription = this.infoBroker.getInfo().subscribe(
      result => {
        this.logger.debug('access token subscribe ... ', 'dashboard.component');
        this.tokeninfo = result;
      }
    );
  }

  ngOnInit() {
    this.tokeninfo = this.loginService.getTokenInfo();
  }

  ngOnDestroy() {
    if (this.tokensubscription) { this.tokensubscription.unsubscribe(); }
  }

  /**
   * 1. 로그인 페이지로 이동
   * 2. 로그인 및 배치 저장
   * 3. 대시보드 메인 노출
   */
  startShift() {
    if (!this.loginService.isLogin()) {
      this.modal.openModalByComponent(LoginComponent,
        {
          title: '',
          message: '',
          actionButtonLabel: '확인',
          closeButtonLabel: '취소',
          closeByEnter: false,
          closeByEscape: true,
          closeByClickOutside: true,
          closeAllDialogs: true
        }
      );
    }
  }

  /**
   * 로그오프 시 배치 정보 저장 후(P7페이지 배치 정보 저장 확인 팝업 뜸) 이후, 대시보드 메인으로 이동
   */
  stopShift() {

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
    let msg: string;
    let btn: string;
    const islogin: boolean = this.loginService.isLogin();
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
        closeAllDialogs: true
      }
    ).subscribe(
      result => {
        if (result) {
          if (islogin) {
            this.batchService.endBatch(); // 나중에는 subsrcibe 해야됨.
          } else {
            console.log('login 전 pos 종료[batch 저장하지 않음]');
            Utils.kioskModeEnd();
          }
        } else {
          console.log('팝업 화면 그냥 닫기....');
        }
      }
    );
  }

}
