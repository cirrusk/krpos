import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Subscription } from 'rxjs/Subscription';
import { TimerObservable } from 'rxjs/observable/TimerObservable';

import { NetworkService, Logger, Modal } from '../../service/pos';
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
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  posName: string;
  posTimer: string;
  tokeninfo: AccessToken;
  subscription: Subscription;
  timersubscription: Subscription;
  tokensubscription: Subscription;
  constructor(
    private terminalService: TerminalService,
    private networkService: NetworkService,
    private modal: Modal,
    private infoBroker: InfoBroker,
    private datePipe: DatePipe,
    private logger: Logger) {
    this.posTimer = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
    this.tokensubscription = this.infoBroker.getInfo().subscribe(
      result => {
        this.logger.debug('access token subscribe ... ', 'header component');
        this.tokeninfo = result;
      }
    );
  }

  ngOnInit() {
    const timer = TimerObservable.create(2000, 1000);
    this.timersubscription = timer.subscribe(
      t => {
        this.posTimer = this.getPosTimer();
      }
    );
    this.tokeninfo = JSON.parse(sessionStorage.getItem('tokenInfo'));
    this.getTerminalInfo();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.timersubscription.unsubscribe();
    this.tokensubscription.unsubscribe();
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
          err => { this.posName = '-'; },
          () => {}
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
