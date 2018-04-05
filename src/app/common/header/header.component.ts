import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Subscription } from 'rxjs/Subscription';
import { TimerObservable } from 'rxjs/observable/TimerObservable';

import { NetworkService, Logger, Modal, QzHealthChecker, LoginService } from '../../service/pos';

import { InfoBroker } from '../../broker/info.broker';

import { AccessToken } from './../../data/models/access-token';
import { TerminalService } from './../../service/terminal.service';
import { PasswordComponent } from '../../modals/password/password.component';

/**
 * 1. 보류
 * 2. 근무시작 : 아이콘을 터치하면 비밀번호 입력 페이지로 이동
 * 3. 화면 풀림 : 화면 잠금 기능 화면 잠금 후 대시보드 메인으로 이동
 * 4. 판매등록 : 근무 시작 후, 장바구니로 이동(일반 결제 Default)
 * 5. 판매정산 : 근무 시작 후, 계산원 판매 정산(EOD)내역으로 이동
 * 6. Start Shift : 로그인 페이지로 이동, 로그인 및 배치 저장 후, 대시보드 메인 노출
 * 7. POS 종료 : POS 종료 터치 시 확인 팝업 출력 후, POS 종료 (근무 종료 된 후, 포스 화면 닫기)
 */
@Component({
  selector: 'pos-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {

  posName: string;
  posTimer: string;
  tokeninfo: AccessToken;
  subscription: Subscription;
  timersubscription: Subscription;
  tokensubscription: Subscription;
  qzsubscription: Subscription;
  timer_id: any;
  constructor(
    private terminalService: TerminalService,
    private networkService: NetworkService,
    private loginService: LoginService,
    private modal: Modal,
    private infoBroker: InfoBroker,
    private datePipe: DatePipe,
    private qzchecker: QzHealthChecker,
    private logger: Logger) {
    this.posTimer = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
    this.tokensubscription = this.infoBroker.getInfo().subscribe(
      result => {
        this.logger.debug('access token subscribe ... ', 'header component');
        this.tokeninfo = result;
      }
    );
    this.tokeninfo = this.loginService.getTokenInfo();
  }

  ngOnInit() {
    const timer = TimerObservable.create(2000, 1000);
    this.timersubscription = timer.subscribe(
      t => {
        this.posTimer = this.getPosTimer();
      }
    );
    this.getTerminalInfo();
    // QZ websocket alive 정보를 이용하여 QZ Tray 가 살아 있는지 여부 체크
    // 5분에 한번씩 체크
    // 메모리 문제등이 발생할 경우 다른 방안을 찾자.
    this.qzsubscription = this.qzchecker.getQzChecker().subscribe(
      result => {
        if (result) {
          this.logger.debug('qz websocket connection is alive!!!', 'header.component');
        } else {
          this.logger.warn('qz websocket connection is dead!!!, check qz tray running mode...', 'header.component');
          // 체크한 다음에 화면 잠그거나 다른 액션처리하도록 함.
          this.modal.openMessage({
            title: 'QZ Tray 상태 체크',
            message: `QZ Tray가 (<em class="fc_red">비정상</em>)입니다.<br>QZ Tray를 확인하고 실행해주시기 바랍니다.`,
            closeButtonLabel: '닫기',
            closeByEnter: true,
            closeByEscape: true,
            closeByClickOutside: true,
            closeAllDialogs: true
          });

          if (this.timer_id !== undefined) { clearTimeout(this.timer_id); }
          this.timer_id = setTimeout(() => {
            this.modal.clearAllModals(this.modal.getModalArray()[0]);
          }, 1000 * 60 * 2); // 2분정도 후에 강제로 닫자. 그렇지 않으면 모달이 계속 뜸.
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.timersubscription) { this.timersubscription.unsubscribe(); }
    if (this.tokensubscription) { this.tokensubscription.unsubscribe(); }
    if (this.qzsubscription) { this.qzsubscription.unsubscribe(); }
  }

  private getPosTimer(): string {
    return this.datePipe.transform(new Date(), 'yyyy.MM.dd HH:mm:ss');
  }

  /**
   * Terminal 정보 가져오기
   *
   * qz tray 와 시간차 때문에 mac address를 조회할때
   * network service를 waiting 하게 하고 mac address 취득
   * 그래야 정상적으로 QZ tray web socket established 된후 처리할 수 있음.
   * 관련 작업은 이후에 해주어야함.
   * 별도로 분리하여 처리할 경우 async 이므로 mac address 취득하는 부분보다
   * 먼저 수행되니 주의 필요.
   */
  private getTerminalInfo() {
    this.networkService.wait().subscribe(
      () => {
        const macAddress = this.networkService.getLocalMacAddress();
        this.subscription = this.terminalService.getTerminalInfo(macAddress).subscribe(
          result => {
            this.posName = result.pointOfService.displayName;
            sessionStorage.setItem('clientId', result.id); // User Authentication에서 가져다 쓰기 편하도록 client Id만 저장
            sessionStorage.setItem('terminalInfo', JSON.stringify(result)); // 혹시 몰라서 전체 저장
          },
          error => {
            this.posName = '-';
            this.logger.error(`Terminal info get fail : ${error.name} - ${error.message}`, 'header.component');
          }
        );
      }
    );
  }

  /**
   * 헤더 영역 근무 시작
   * 아이콘을 터치하면 비밀번호 입력 페이지로 이동
   */
  startWork() {

  }

  /**
   * 근무 종료
   * 1. POS 종료 확인 팝업
   * 2. 배치 정보 저장 팝업
   * 3. 대시보드 메인으로 이동
   */
  endWork() {

  }

  /**
   * 화면 잠금
   * 화면 잠금 후 대시보드메인으로 이동.
   */
  screenLock() {
    this.modal.openModalByComponent(PasswordComponent,
      {
        title: '화면풀림',
        message: '',
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByEnter: false,
        closeByEscape: true,
        closeByClickOutside: false,
        closeAllDialogs: true
      }
    );
  }

  /**
   * 화면 풀림
   * 화면 잠금 기능 화면 잠금 후 대시보드 메인으로 이동  (P6참고)
   */
  screenRelease() {

  }

  test() {
    const thisref: any = this;
    this.modal.openConfirm(
      {
        title: '화면 테스트',
        message: `주문 수량이 (<em class="fc_red">0</em>)건 이하입니다.<br>배치 정보를 저장하시겠습니까?`,
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByEnter: false,
        closeByEscape: true,
        closeByClickOutside: true,
        closeAllDialogs: true,
        keepOpenForAction: false,
        keepOpenForClose: false,
        beforeActionCallback: function(value) {
          console.log('before action callback');
        },
        beforeCloseCallback: function(value) {
          console.log('before close callback');
          const rtn = thisref.modal.openConfirm({message: 'OK?'});
          return rtn;
        }
      }
    ).subscribe(
      result => {
        if (result) {
          console.log('확인');
        } else {
          console.log('취소');
        }
      }
    );
  }
}
