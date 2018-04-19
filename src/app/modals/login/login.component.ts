import { Component, OnInit, OnDestroy, ViewChild, Input, ElementRef, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent } from '../../core/modal/modal.component';
import { AuthService } from '../../service/auth.service';
import { ModalService, StorageService, Logger } from '../../service/pos';
import { InfoBroker } from '../../broker/info.broker';
import { ErrorInfo } from '../../data/error/error-info';
import { AlertService } from '../../core/alert/alert.service';
import { AlertType } from '../../core/alert/alert-type.enum';

import Utils from '../../core/utils';
import { SpinnerService } from '../../core/spinner/spinner.service';

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
export class LoginComponent extends ModalComponent implements OnInit, OnDestroy {
  @ViewChild('loginIdTxt') loginIdInput: ElementRef;
  @ViewChild('loginPasswordTxt') loginPwdInput: ElementRef;
  @Input() loginId: string;
  @Input() loginPassword: string;
  authsubscription: Subscription;
  tokensubscription: Subscription;
  private listner: any;
  constructor(
    protected modalService: ModalService,
    private authService: AuthService,
    private storage: StorageService,
    private infoBroker: InfoBroker,
    private alert: AlertService,
    private spinner: SpinnerService,
    private logger: Logger,
    private renderer: Renderer2) {
    super(modalService);
  }

  ngOnInit() {
    setTimeout(() => this.loginIdInput.nativeElement.focus(), 50);
    // this.listner = this.renderer.listen(this.loginIdInput.nativeElement, 'keydown', (event) => {
    //     const t = event.target.value;
    //     console.log(t + '/' + event.keyCode);
    //     const r: RegExp = new RegExp(/^(?=.*[a-z])(?=.*[0-9])$/gi);
    //     console.log('숫자와영문만 ' + String(t).match(r));
    //     if (event.keyCode === 229) {
    //       console.log('한글은 입력이 안되게 해야지');
    //       // event.target.value = event.target.value.replace(/[^0-9]/g, '');
    //       this.loginIdInput.nativeElement.value = '';
    //     }
    // });
  }

  /**
   * 주의)
   * subscribe가 발생하지 않은 상태에서 그냥 destroy되면
   * Cannot read property 'unsubscribe' of undefined 에러가 발생함.
   * 반드시 존재여부를 체크한 후 undescribe 해야함.
   */
  ngOnDestroy() {
    if (this.authsubscription) {this.authsubscription.unsubscribe(); }
    if (this.tokensubscription) { this.tokensubscription.unsubscribe(); }
    // this.listner(); // remove listener;
  }

  private loginIdKeypress(evt: any) {
    // const k = evt.keyCode;
    // if (k >= 48 && k <= 57) {
    //   console.log('숫자');
    //   return true;
    // } else if ((k>=65 && k<=90) || (k>=97 && k<=122)) {
    //   console.log('영문');
    //   return true;
    // } else if ((k>=33 && k<=47) || (k>=58 && k<=64)
    // || (k>=91 && k<=96) || (k>=123 && k<=126)) {
    //   console.log('특수기호');
    //   return false;
    // } else if ((k >= 12592) || (k <= 12687)) {
    //   setTimeout(() => { this.loginIdInput.nativeElement.value = evt.target.value.replace(/[^0-9]/g, ''); }, 50);
    //   return false;
    // }
    // return true;
  }

  private loginIdBlur(evt: any) {
    // const k = evt.target.value;
    // console.log(k);
    // const r: RegExp = new RegExp(/^[a-z0-9]*$/gi);
    // if (k.match(r)) {
    //   console.log('ok');
    // } else {
    //   console.log('한글');
    //   setTimeout(() => { this.loginIdInput.nativeElement.value = evt.target.value.replace(/[^0-9]/g, ''); }, 50);
    // }
  }

  /**
   * 로그인 팝업창의 근무 시작 버튼 클릭
   * AD 계정 입력 형식이 맞지 않은 경우,
   * AD 계정 입력 형식이 맞지 않습니다  Alert 뜸
   * 비밀번호가 미입력 된 경우,
   * 근무 시작 버튼 터치 시, 비밀번호가 공란입니다.
   */
  private startWork() {
    if (this.loginId) { this.logger.debug(`login id : ${this.loginId}`, 'login.component'); }
    const loginid = this.loginId;
    const loginpwd = this.loginPassword || '';

    // 1. AD 계정 Validation 체크
    // 2. 비밀번호 미입력
    if (Utils.isEmpty(loginpwd)) { // 비어 있으면 미입력
      this.alert.show({
          alertType: AlertType.warn,
          title: '확인',
          message: '비밀번호가 공란입니다.'
        });
      return;
    }

    // authentication code 취득(계속 바뀌고 token 발급 후 삭제되므로 session 저장 필요없음)
    this.authsubscription = this.authService.authentication(loginid, loginpwd).subscribe(
      result => {
        this.logger.debug('get user authentication code...', 'login.component');
        this.getAccessToken(result.code); // access token  취득 및 session 저장
      },
      error => {
        const errdata = Utils.parseError(error);
        if (errdata && errdata.errors) {
          this.logger.error(`authentication error type : ${errdata.errors[0].type}`, 'login.component');
          this.logger.error(`authentication error message : ${errdata.errors[0].message}`, 'login.component');
        } else if (errdata && errdata.error) {
          this.logger.error(`accesstoken error : ${errdata.error.error}`, 'login.component');
          this.logger.error(`accesstoken error desc : ${errdata.error.error_description}`, 'login.component');
        }
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  /**
   * Access Token 취득
   *
   * @param authcode
   */
  private getAccessToken(authcode: string) {
    this.tokensubscription = this.authService.accessToken(authcode).subscribe(
      result => {
        this.storage.setEmployeeName(result.employeeName);
        this.storage.setTokenInfo(result);
        const accesstoken = this.storage.getTokenInfo();
        this.infoBroker.sendInfo(accesstoken);
        this.close();
      },
      error => {
        const errdata = Utils.parseError(error);
        if (errdata && errdata.errors) {
          this.logger.error(`authentication error type : ${errdata.errors[0].type}`, 'login.component');
          this.logger.error(`authentication error message : ${errdata.errors[0].message}`, 'login.component');
        } else if (errdata && errdata.error) {
          this.logger.error(`accesstoken error : ${errdata.error.error}`, 'login.component');
          this.logger.error(`accesstoken error desc : ${errdata.error.error_description}`, 'login.component');
          this.alert.show({
            alertType: AlertType.error,
            title: '오류',
            message: `${errdata.error.error_description}`
          });
        }
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  private close() {
    this.closeModal();
  }

  /**
   * AD 계정 입력 후 엔터키 입력
   */
  private loginIdEnter(evt: any) {
    const loginid = evt.target.value;
    if (loginid) {
      this.loginPwdInput.nativeElement.focus();
    }
  }

  /**
   * 비밀번호 입력 후 엔터키 입력
   */
  private loginPwdEnter(evt: any) {
    const loginpwd = evt.target.value;
    if (loginpwd) {
      this.spinner.show();
      this.startWork();
    } else {
      if (Utils.isEmpty(loginpwd)) { // 비어 있으면 미입력
        this.alert.show({
          alertType: AlertType.warn,
          title: '확인',
          message: '비밀번호가 공란입니다.'
        });
      }
    }
  }
}
