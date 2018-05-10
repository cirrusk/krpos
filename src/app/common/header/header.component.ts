import { Component, OnInit, OnDestroy, Input, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, NavigationStart } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';
import { TimerObservable } from 'rxjs/observable/TimerObservable';

import { InfoBroker } from '../../broker';
import { AlertService, AlertType, AlertState, Config, Logger, Modal, NetworkService, QzHealthChecker, StorageService } from '../../core';
import { BatchComponent, HoldOrderComponent, LoginComponent, LogoutComponent, PasswordComponent } from '../../modals';
import { BatchService, CartService, MessageService, TerminalService } from '../../service';
import { AccessToken, BatchInfo, LockType, TerminalInfo } from '../../data';

import Utils from '../../core/utils';

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
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  isClientScreen: boolean;
  posName: string;
  posTimer: string;
  private subscription: Subscription;
  private timersubscription: Subscription;
  private tokensubscription: Subscription;
  private qzsubscription: Subscription;
  private storagesubscription: Subscription;
  private ordersubscription: Subscription;
  private modalsubscription: Subscription;
  private holdsubscription: Subscription;
  private batchsubscription: Subscription;
  private alertsubscription: Subscription;
  timer_id: any;
  qzCheck: boolean;
  isLogin: boolean;
  batchNo: string;
  hasTerminal: boolean;
  employeeName: string;
  screenLockType = LockType.INIT;
  holdTotalCount: number;
  @Input() isClient: boolean;
  constructor(
    private terminalService: TerminalService,
    private network: NetworkService,
    private cartService: CartService,
    private storage: StorageService,
    private batch: BatchService,
    private msg: MessageService,
    private router: Router,
    private modal: Modal,
    private alert: AlertService,
    private info: InfoBroker,
    private datePipe: DatePipe,
    private qzchecker: QzHealthChecker,
    private logger: Logger,
    private config: Config) {
    this.posTimer = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
    this.isLogin = this.storage.isLogin();
    this.employeeName = this.storage.getEmloyeeName();
    this.qzCheck = this.config.getConfig('qzCheck');
    this.screenLockType = this.storage.getScreenLockType();
    this.holdTotalCount = 0;
  }

  ngOnInit() {
    this.getTerminalInfo();
    this.tokensubscription = this.info.getInfo().subscribe(
      result => {
        const type = result && result.type;
        const data: any = result && result.data || {};
        if (result === null) {
          this.isLogin = false;
        } else {
          if (type === 'tkn') {
            this.logger.set('header component', 'access token receive ...').debug();
            this.isLogin = (data.access_token === undefined || data.access_token === null) ? false : this.storage.isLogin();
            if (this.network.getLocalMacAddress() && this.isLogin) {
              this.getHoldTotalCount();
            }
          } else if (type === 'lck') {
            this.logger.set('header component', 'screen locktype receive ...').debug();
            this.screenLockType = data.lockType === undefined ? 0 : data.lockType;
          } else if (type === 'bat') {
            this.logger.set('header.component', 'batch info receive ...').debug();
            this.batchNo = (data.batchNo === undefined || data.batchNo === null) ? null : data.batchNo;
          } else if (type === 'hold') {
            this.getHoldTotalCount();
          } else if (type === 'cbt') {
            if (result.data.act) { this.checkBatchAfterLogin(); }
          }
        }
      }
    );
    const batchinfo: BatchInfo = this.storage.getBatchInfo();
    this.batchNo = (batchinfo) ? (Utils.isEmpty(batchinfo.batchNo)) ? null : batchinfo.batchNo : null;
    this.storagesubscription = this.storage.storageChanges.subscribe(data => {
      this.logger.set('header.component', `storage subscribe ... ${data.key}`).debug();
      if (data.key === 'employeeName') { this.employeeName = (data.value === null) ? '' : data.value; }
    });
    const timer = TimerObservable.create(2000, 1000);
    this.timersubscription = timer.subscribe(
      t => { this.posTimer = this.getPosTimer(); }
    );

    // QZ websocket alive 정보를 이용하여 QZ Tray 가 살아 있는지 여부 체크
    // 5분에 한번씩 체크, 메모리 문제등이 발생할 경우 다른 방안을 찾자.
    if (this.qzCheck) {
      this.qzsubscription = this.qzchecker.getQzChecker().subscribe(
        result => {
          if (result) {
            this.logger.set('header.component', 'qz websocket connection is alive!!!').debug();
          } else {
            this.logger.set('header.component', 'qz websocket connection is dead!!!, check qz tray running mode...').warn();
            // 체크한 다음에 화면 잠그거나 다른 액션처리하도록 함.
            this.modal.openMessage({
              title: 'QZ Tray 상태 체크',
              message: `QZ Tray가 (<em class="fc_red">비정상</em>)입니다.<br>QZ Tray를 확인하고 실행해주시기 바랍니다.`,
              closeButtonLabel: '닫기',
              closeByEnter: true,
              modalId: 'QZSTATUS'
            });

            if (this.timer_id !== undefined) { clearTimeout(this.timer_id); }
            this.timer_id = setTimeout(() => {
              this.modal.clearAllModals(this.modal.getModalArray()[0]);
            }, 1000 * 60 * 2); // 2분정도 후에 강제로 닫자. 그렇지 않으면 모달이 계속 뜸.
          }
        }
      );
    }
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.timersubscription) { this.timersubscription.unsubscribe(); }
    if (this.tokensubscription) { this.tokensubscription.unsubscribe(); }
    if (this.qzCheck && this.qzsubscription) { this.qzsubscription.unsubscribe(); }
    if (this.storagesubscription) { this.storagesubscription.unsubscribe(); }
    if (this.ordersubscription) { this.ordersubscription.unsubscribe(); }
    if (this.modalsubscription) { this.modalsubscription.unsubscribe(); }
    if (this.holdsubscription) { this.holdsubscription.unsubscribe(); }
    if (this.batchsubscription) { this.batchsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
  }

  ngAfterViewInit() {
    this.ordersubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const clnt = event.url;
        if (clnt && clnt.indexOf('/order') !== -1) { // 장바구니로 왔을 경우 화면 잠금 버튼으로
          this.storage.setScreenLockType(LockType.UNLOCK);
        }
      }
    });
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
   * 별도로 분리하여 처리할 경우 async 이므로 mac address 취득하는 부분보다 먼저 수행되니 주의 필요.
   * 가끔씩 이 부분이 늦게 처리되어 로그인 시 terminal 정보가 없어서 에러가 발생 ---> 확인 필요!!!
   */
  private getTerminalInfo() {
    this.network.wait().subscribe(
      () => {
        const macAddress = this.network.getLocalMacAddress('-');
        this.subscription = this.terminalService.getTerminalInfo(macAddress).subscribe(
          result => {
            this.posName = result.id; // pointOfService.displayName;
            this.storage.setClientId(result.id); // User Authentication에서 가져다 쓰기 편하도록 client Id만 저장
            this.storage.setTerminalInfo(result); // 혹시 몰라서 전체 저장
            this.hasTerminal = true;
          },
          error => {
            this.posName = '-';
            this.logger.set('header.component', `Terminal info get fail : ${error.name} - ${error.message}`).error();
            this.hasTerminal = false;
            this.alert.error({message: this.msg.get('posNotSet')});
          }
        );
      },
      error => {}
    );
  }

  /**
   * 보류 내역 조회
   * 보류 건수가 존재 하지 않을 경우 띄우지 않음.
   */
  holdOrder() {
    if (this.screenLockType === LockType.LOCK) { return; }
    this.modal.openModalByComponent(HoldOrderComponent,
      {
        closeByClickOutside: false,
        modalId: 'HoldOrderComponent'
      }
    );
  }

  /**
   * 보류 건수 조회하기
   */
  getHoldTotalCount() {
    this.holdsubscription = this.cartService.getCarts().subscribe(
      result => {
        this.holdTotalCount = result.carts.length;
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('holdOrder.component', `Get Carts error type : ${errdata.type}`).error();
          this.logger.set('holdOrder.component', `Get Carts error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      }
    );
  }

  /**
   * 헤더 영역 근무 시작
   * 터미널 인증은 완료되었고 로그인되지 않은 상태
   * 아이콘을 터치하면 로그인 팝업
   */
  startWork() {
    if (this.screenLockType === LockType.LOCK) { return; }
    this.modal.openModalByComponent(LoginComponent,
      {
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        modalId: 'LoginComponent'
      }
    );
  }

  /**
   * 근무 종료
   * 터미널 인증은 완료되었고 로그인된 상태
   * 1. 근무종료 팝업
   * 2. 배치 정보 저장 팝업
   * 3. 대시보드 메인으로 이동
   */
  endWork() {
    if (this.screenLockType === LockType.LOCK) { return; }
    this.router.navigate(['/dashboard']);
    this.modal.openModalByComponent(LogoutComponent,
      {
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        modalId: 'LogoutComponent'
      }
    ).subscribe(result => {
      if (!result) {
        this.storage.setScreenLockType(LockType.INIT);
      }
    });
  }

  /**
   * 화면 잠금
   * 캐셔 로그인되어 있을 경우만 체크함.
   * 카트 페이지 에서 화면 잠금 버튼 클릭 시 대시보드로 이동
   * 이 경우 대시보드에서는 어떤 버튼도 동작하지 않음.
   */
  screenLock() {
    this.storage.setScreenLockType(LockType.LOCK);
    this.screenLockType = LockType.LOCK;
    this.router.navigate(['/dashboard']);
  }

  /**
   * 화면 풀림
   * 대시보드 에서 화면 풀림 버튼 클릭 시 비밀번호 입력 창뜨게함.
   * 비밀번호 입력 정상 처리되면 잠금 플래그를 삭제하고 카트 페이지로 이동함.
   * 카트 페이지로 이동할 경우 header 에서 url을 보고 있다가 /order로 들어올 경우
   * 잠금버튼을 활성화함.
   * 이후에는 카트 페이지에서 화면 잠금 버튼을 클릭하면
   * 잠금 플래그를 설정하고 대시보드로 이동.
   * 비밀번호로 잠금을 해제하면 카트로 이동함.
   */
  screenRelease() {
    this.modalsubscription = this.modal.openModalByComponent(PasswordComponent,
      {
        title: '화면풀림',
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        modalId: 'PasswordComponent'
      }
    ).subscribe((result) => {
      if (result) {
        this.storage.removeScreenLock();
        // this.router.navigate(['/order']);
      } else {
        this.screenLockType = LockType.LOCK;
        this.storage.setScreenLockType(LockType.LOCK);
      }
    });
  }

  /**
   * 로그인 후 배치 처리 상세 조건
   *
   * 1. 닫지 않은 배치가 존재
   * 1-1. 닫지 않은 배치 정보의 터미널 정보 와 현재 터미널 정보가 같으면 동일 POS 기기
   * 1-2. 닫지 않은 배치 정보를 그대로 사용
   * 2. 닫지 않은 배치 정보의 터미널 정보 와 현재 터미널 정보가 다르면 다른 POS 기기
   * 2-1. 배치는 존재하나 다른 POS 이므로 배치를 삭제함.
   * 3. 닫지 않은 배치가 존재하지 않음.
   * 3-1. 아무 처리도 하지 않음.
   */
  private checkBatchAfterLogin() {
    this.batchsubscription = this.batch.getBatch().subscribe(result => {
      if (result && Utils.isNotEmpty(result.batchNo)) { // 닫지 않은 배치가 있으면
        this.logger.set('header.component', 'exist started batch').debug();
        const batterm: TerminalInfo = result.terminal;
        const sesterm: TerminalInfo = this.storage.getTerminalInfo();
        if ((batterm && sesterm) && batterm.id === sesterm.id) { // 같은 POS 기기, Batch 유지
          this.logger.set('header.component', 'exist started batch and same pos, load existing batch info!!!').debug();
          this.storage.setBatchInfo(result);
          this.info.sendInfo('bat', result);
        } else { // 다른 POS 기기 - 팝업 출력
          this.logger.set('header.component', 'exist started batch and different pos, clear and start batch!!!').debug();
          this.modal.openModalByComponent(BatchComponent, {
            closeByEnter: false,
            closeByEscape: false,
            closeByClickOutside: false,
            modalId: 'BATCH_CHECK'
          }).subscribe(rst => { // 무조건 로직을 태워서 배치를 삭제해야 하므로 조건 체크 불필요.
            this.logger.set('header.component', `end existing batch, batch no : ${result.batchNo}`).debug();
            this.batchsubscription = this.batch.endBatch(result.batchNo).subscribe(data => {
              this.logger.set('header.component', 'clear and start batch info').debug();
              this.storage.removeBatchInfo();
              this.info.sendInfo('bat', { batchNo: null });
            });
          });
        }
      }
    },
    error => {
      const errdata = Utils.getError(error);
      if (errdata) {
        this.logger.set('dashboard.component', `get batch error message : ${errdata.message}`).debug();
        this.storage.removeBatchInfo();
        this.info.sendInfo('bat', { batchNo: null });
      }
    });
  }

}
