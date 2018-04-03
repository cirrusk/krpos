import { ErrorInfo } from './../../data/error/error-info';
import { Component, OnInit, Input } from '@angular/core';

import { ModalComponent } from '../../core/modal/modal.component';
import { AuthService } from '../../service/auth.service';
import { BatchService } from './../../service/batch.service';
import { ModalService, Modal, Logger } from '../../service/pos';
import { InfoBroker } from '../../broker/info.broker';
import { TerminalInfo } from '../../data/models/terminal-info';
import Utils from '../../core/utils';

/**
 * Component 형식으로 레이어 팝업을 띄울 경우 사용.
 * 별도의 UI를 가지는 경우 ModalComponent를 상속받아 사용.
 * 모달로 Component 자체를 띄우기 위해서는
 * 반드시 @see ModalComponent 를 상속받아서 구현해야함.
 * 그렇지 않을 경우 정상적으로 모달 팝업이 뜨지 않음.
 * 호출은 @see Modal 서비스를 이용하여 호출함.
 * 일반적인 메시지, 확인 창은 기본 Component (@see BasicModalComponent ) 제공하고 있음.
 * 생성된 모달 Component는 반드시 modal.module 에 등록해야 함.
 * 참고) PosModalService 는 Simple Layer 타입으로 화면에 Modal Component selector를 이용하여
 * 레이어를 띄우도록 되어 있으며, 필요한 레이어를 화면에 기술해야함.
 */
@Component({
  selector: 'pos-login',
  templateUrl: './login.component.html'
})
export class LoginComponent extends ModalComponent implements OnInit {

  @Input() loginId: string;
  @Input() loginPassword: string;
  terminalInfo: TerminalInfo;
  constructor(
    modalService: ModalService,
    private authService: AuthService,
    private batchService: BatchService,
    private infoBroker: InfoBroker,
    private modal: Modal,
    private logger: Logger) {
    super(modalService);
  }

  ngOnInit() {
    this.terminalInfo = JSON.parse(sessionStorage.getItem('terminalInfo'));
  }

  /**
   * 로그인 팝업창의 근무 시작 버튼 클릭
   * AD 계정 입력 형식이 맞지 않은 경우,
   * AD 계정 입력 형식이 맞지 않습니다  Alert 뜸
   * 비밀번호가 미입력 된 경우,
   * 근무 시작 버튼 터치 시, 비밀번호가 공란입니다.
   */
  startWork() {
    if (this.loginId) { this.logger.debug(`login id : ${this.loginId}`, 'login.component'); }
    const loginid = this.loginId;
    const loginpwd = this.loginPassword || '';

    // 1. AD 계정 Validation 체크
    // 2. 비밀번호 미입력
    if (Utils.isEmpty(loginpwd)) { // 비어 있으면 미입력
      this.modal.openMessage(
        {
          title: '비밀번호 미입력',
          message: `비밀번호가 공란입니다.`,
          closeButtonLabel: '닫기',
          closeByEnter: false,
          closeByEscape: true,
          closeByClickOutside: true,
          closeAllDialogs: true
        }
      );
      return;
    }
    // authentication code 취득(계속 바뀌고 token 발급 후 삭제되므로 session 저장 필요없음)
    this.authService.authentication(loginid, loginpwd).subscribe(
      result => {
        this.logger.debug('get user authentication code...', 'login.component');
        // access token  취득 및 session 저장
        this.getAccessToken(result.code);
      },
      error => {},
      () => {}
    );

  }

  /**
   * Access Token 취득
   *
   * @param authcode
   */
  private getAccessToken(authcode: string) {
    this.authService.accessToken(authcode).subscribe(
      result => {
        sessionStorage.setItem('tokenInfo', JSON.stringify(result));
      },
      err => {
        const errdata = Utils.parseError(err);
        if (errdata && errdata.error) {
          this.logger.error(`accesstoken error : ${errdata.error.error}`, 'login.component');
          this.logger.error(`accesstoken error desc : ${errdata.error.error_description}`, 'login.component');
        }
      },
      () => {
        this.saveBatch();
        const accesstoken = JSON.parse(sessionStorage.getItem('tokenInfo'));
        this.infoBroker.sendInfo(accesstoken);
        this.close();
      }
    );
  }

  /**
   * 배치 저장
   */
  private saveBatch() {
    this.batchService.startBatch();
  }

  close() {
    this.modal.clearAllModals(this);
  }


}
