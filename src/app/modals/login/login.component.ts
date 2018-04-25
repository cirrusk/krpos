import { Component, OnInit, OnDestroy, ViewChild, Input, ElementRef, Renderer2 } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';
import { ModalComponent, ModalService, StorageService, Logger, AlertService, AlertType, SpinnerService } from '../../core';
import { AuthService } from '../../service';
import { InfoBroker } from '../../broker';
import { ErrorInfo } from '../../data';
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
export class LoginComponent extends ModalComponent implements OnInit, OnDestroy {
  @ViewChild('loginIdTxt') loginIdInput: ElementRef;
  @ViewChild('loginPasswordTxt') loginPwdInput: ElementRef;
  @Input() loginId: string;
  @Input() loginPassword: string;
  private regExp: RegExp = new RegExp(/[\ㄱ-ㅎㅏ-ㅣ가-힣`~!@#$%^&*|\\\'\";:\/()_+|<>?{}\[\]]/g);
  loginIdValid: FormControl = new FormControl('');
  authsubscription: Subscription;
  tokensubscription: Subscription;
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
    this.loginIdValid.valueChanges
    .debounceTime(400)
    .subscribe(v => {
      if (v) {
        if (this.regExp.test(v)) { this.loginIdInput.nativeElement.value = v.replace(this.regExp, ''); }
      }
    });
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
  }

  /**
   * 로그인 팝업창의 근무 시작 버튼 클릭
   * AD 계정 입력 형식이 맞지 않은 경우,
   * AD 계정 입력 형식이 맞지 않습니다  Alert 뜸
   * 비밀번호가 미입력 된 경우,
   * 근무 시작 버튼 터치 시, 비밀번호가 공란입니다.
   */
  startWork() {
    if (this.loginId) { this.logger.set('login.component', `login id : ${this.loginId}`).debug(); }
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
        this.logger.set('login.component', 'get user authentication code...').debug();
        this.getAccessToken(result.code); // access token  취득 및 session 저장
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('login.component', `authentication error type : ${errdata.type}`).error();
          this.logger.set('login.component', `authentication error message : ${errdata.message}`).error();
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
        this.storage.setEmployeeId(result.employeeId);
        this.storage.setTokenInfo(result);
        const accesstoken = this.storage.getTokenInfo();
        this.infoBroker.sendInfo('tkn', accesstoken);
        this.infoBroker.sendInfo('cbt', {act: true});
        this.close();
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('login.component', `authentication error type : ${errdata.type}`).error();
          this.logger.set('login.component', `authentication error message : ${errdata.message}`).error();
          this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdata.message}` });
        }
      }
    );

  }

  close() {
    this.closeModal();
  }

  /**
   * AD 계정 입력 후 엔터키 입력
   */
  loginIdEnter(evt: any) {
    const loginid = evt.target.value;
    if (loginid) {
      this.loginPwdInput.nativeElement.focus();
    }
  }

  /**
   * 비밀번호 입력 후 엔터키 입력
   */
  loginPwdEnter(evt: any) {
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
