import { Component, OnInit, OnDestroy, ViewChild, Input, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';
import { ModalComponent, ModalService, StorageService, Logger, AlertService } from '../../core';
import { AuthService, MessageService } from '../../service';
import { InfoBroker } from '../../broker';
import { Utils } from '../../core/utils';

/**
 * 로그인 입력 화면 팝업
 *
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
  // https://www.regular-expressions.info/javascriptexample.html
  loginIdValid: FormControl = new FormControl('');
  authsubscription: Subscription;
  tokensubscription: Subscription;
  constructor(
    protected modalService: ModalService,
    private auth: AuthService,
    private message: MessageService,
    private storage: StorageService,
    private info: InfoBroker,
    private alert: AlertService,
    private logger: Logger) {
    super(modalService);
  }

  ngOnInit() {
    const spcExp: RegExp = new RegExp(/[`~!@#$%^&*\\\'\";:\/()_+|<>?{}\[\]]]/g);
    const engExp: RegExp = new RegExp(/[a-z]/gi);
    const numExp: RegExp = new RegExp(/[0-9]/g);
    const numEngDelExp: RegExp = new RegExp(/[^0-9a-zA-Z-]/g);
    setTimeout(() => this.loginIdInput.nativeElement.focus(), 50);
    this.loginIdValid.valueChanges
      .debounceTime(70)
      .subscribe(v => {
        if (v) {
          if (!spcExp.test(v) || !engExp.test(v) || !numExp.test(v)) {
            this.loginIdInput.nativeElement.value = v.replace(numEngDelExp, '');
          }
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
    if (this.authsubscription) { this.authsubscription.unsubscribe(); }
    if (this.tokensubscription) { this.tokensubscription.unsubscribe(); }
  }

  /**
   * 로그인 팝업창의 근무 시작 버튼 클릭
   *
   * AD 계정 입력 형식이 맞지 않은 경우,
   * AD 계정 입력 형식이 맞지 않습니다  Alert 뜸
   * 비밀번호가 미입력 된 경우, 근무 시작 버튼 터치 시, 비밀번호가 공란입니다.
   * 
   * 중요 : AD 계정이나 비밀번호가 올바르지 않을 경우 오류 내용을 출력하게 되는데 보안문제로
   * 어떤 이유인지는 메시지 출력하지 않고 정보 올바르지 않음만 메시지 출력해야함.
   *
   * 2018.04.30 : authorization 과 acesstoken 을 merge
   * 2018.04.30 : 처리 프로세스 변경
   * 기존 : Start Shift 할때 배치가 있으면 삭제하고 배치시작
   * 변경 : 로그인 시 체크 : 프로세스는 아래 참조
   * 1. 로그인 후 닫지 않은 배치 있는지 체크
   * 2. 배치가 없으면 : SKIP
   * 3. 배치가 있으면 : 같은 POS 기기 여부 체크
   * 4. 같은 POS 기기 : 해당 배치 그냥 사용
   * 5. 다른 POS 기기 : 메시지 뿌리고 무조건 배치 종료.
   * 
   * 2018.09.27 : 캐셔 계정은 1인 1아이디 기준
   * 해당 기준으로 로그인한 경우 최대 8시간 인증만료 시간이므로 인증만료를 신경쓸 필요는 없음.
   * 아이디를 공유하는 경우 인증만료 시간을 초과하여 인증만료가 될 수 있음.
   * 인증만료 시 `InvalidTokenError` 가 발생하므로 해당 에러를 처리하도록 구성함.
   */
  startWork() {
    if (this.loginId) { this.logger.set('login.component', `login id : ${this.loginId}`).debug(); }
    const loginid = this.loginIdInput.nativeElement.value;
    const loginpwd = this.loginPassword || '';

    // 1. AD 계정 Validation 체크
    if (Utils.isEmpty(loginid)) {
      this.alert.warn({ message: 'AD 계정이 공란입니다.', timer: true, interval: 1000 });
      setTimeout(() => { this.loginIdInput.nativeElement.focus(); }, 1050);
      return;
    }
    // 2. 비밀번호 미입력
    if (Utils.isEmpty(loginpwd)) { // 비어 있으면 미입력
      this.alert.warn({ message: '비밀번호가 공란입니다.', timer: true, interval: 1000 });
      setTimeout(() => { this.loginPwdInput.nativeElement.focus(); }, 1050);
      return;
    }
    // 1. authentication code 취득(계속 바뀌고 token 발급 후 삭제되므로 session 저장 필요없음)
    // 2. access token  취득 및 session 저장
    this.authsubscription = this.auth.authAndToken(loginid, loginpwd).subscribe(result => {
      this.logger.set('login.component', 'get user auth code and token...').debug();
      this.storage.setEmployeeName(result.employeeName);
      this.storage.setEmployeeId(result.employeeId);
      this.storage.setTokenInfo(result);
      this.info.sendInfo('tkn', result);
      this.info.sendInfo('cbt', { act: true }); // 로그인 성공 후 배치 후 처리 진행.
      this.result = true;
      this.modalResult();
      this.close();
    },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('login.component', `auth and token error message : ${errdata.message}`).error();
          this.alert.error({ message: '로그인 정보가 올바르지 않습니다.<br>로그인 정보를 다시 한번 확인하시기 바랍니다.'});
        }
      });
  }

  close() {
    this.closeModal();
  }

  /**
   * AD 계정 입력 후 엔터키 입력
   *
   * @param evt 이벤트
   */
  loginIdEnter(evt: any) {
    const loginid = evt.target.value;
    if (loginid) {
      this.loginPwdInput.nativeElement.focus();
    }
  }

  /**
   * 비밀번호 입력 후 엔터키 입력
   *
   * @param evt 이벤트
   */
  loginPwdEnter(evt: any) {
    const loginpwd = evt.target.value;
    if (loginpwd) {
      this.startWork();
    } else {
      if (Utils.isEmpty(loginpwd)) {
        this.alert.warn({ message: '비밀번호가 공란입니다.', timer: true, interval: 1000 });
        setTimeout(() => { this.loginPwdInput.nativeElement.focus(); }, 250);
      }
    }
  }

}
