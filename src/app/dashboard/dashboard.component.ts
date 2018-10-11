import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Modal, Logger, StorageService, AlertService, AlertState } from '../core';
import { BatchService, MessageService, ReceiptService } from '../service';
import { InfoBroker } from '../broker';
import { AccessToken, LockType, ModalIds, EodData } from '../data';
import { Utils } from '../core/utils';

/**
 * 캐셔 대시보드
 *
 * 기본 조건 : 캐셔로그인이 이루어진 후에 처리 가능(POS 종료 제외)
 *
 * 1. 판매등록
 *     Start Shift(배치 시작) 가 이루어진 후 가능
 *     장바구니 화면으로 이동(Start Shift 하면 바로 이동, 이미 배치 시작된 경우 현재 화면 유지)
 *
 * 2. 판매정산
 *     캐셔 EOD 영수증 출력
 *
 * 3. Start Shift / Stop Shift
 *     배치 시작 / 종료
 *
 * 4. POS 종료
 *    배치가 시작되었을 경우 배치종료 포함하여 로그아웃, POS 화면 닫기
 */
@Component({
  selector: 'pos-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  tokeninfo: AccessToken;
  batchNo: string;
  screenLockType: number;
  private tokensubscription: Subscription;
  private statssubscription: Subscription;
  private batchsubscription: Subscription;
  private alertsubscription: Subscription;
  private receiptsubscription: Subscription;
  private eodsubscription: Subscription;
  private orderCount: number;
  constructor(
    private modal: Modal,
    private info: InfoBroker,
    private batch: BatchService,
    private storage: StorageService,
    private alert: AlertService,
    private message: MessageService,
    private receipt: ReceiptService,
    private logger: Logger,
    private router: Router) {
    this.orderCount = 0;
  }

  ngOnInit() {
    this.tokensubscription = this.info.getInfo().subscribe(
      (result) => {
        const type = result && result.type;
        const data: any = result && result.data || {};
        if (result === null) {
          this.batchNo = null;
        } else {
          if (type === 'bat') {
            this.logger.set('dashboard.component', 'batch info receive ...').debug();
            this.batchNo = (data.batchNo === undefined || data.batchNo === null) ? null : data.batchNo;
          } else if (type === 'lck') {
            this.logger.set('dashboard.component', 'screen locktype receive ...').debug();
            this.screenLockType = data.lockType === undefined ? LockType.INIT : data.lockType;
          } else if (type === 'ewk') {
            this.logger.set('dashboard.component', 'end work event receive ...').debug();
            this.tokeninfo = null;
          } else if (type === 'swk') {
            this.logger.set('dashboard.component', 'start work event receive ...').debug();
            this.tokeninfo = this.storage.getTokenInfo();
          }
        }
      }
    );
    this.tokeninfo = this.storage.getTokenInfo();
    this.batchNo = (this.storage.getBatchInfo()) ? this.storage.getBatchInfo().batchNo : null;
    this.screenLockType = this.storage.getScreenLockType();
    this.statssubscription = this.batch.statsBatch().subscribe(result => {
      if (result) {
        this.orderCount = result.ordersCount;
        this.logger.set('dashboard.component', `current order count : ${this.orderCount}`).debug();
      }
    });
  }

  ngOnDestroy() {
    this.receipt.dispose();
    if (this.tokensubscription) { this.tokensubscription.unsubscribe(); }
    if (this.batchsubscription) { this.batchsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
    if (this.statssubscription) { this.statssubscription.unsubscribe(); }
    if (this.receiptsubscription) { this.receiptsubscription.unsubscribe(); }
    if (this.eodsubscription) { this.eodsubscription.unsubscribe(); }
  }

  /**
   * 캐셔 EOD(정산)
   * 
   * 판매정산 관련
   * Case 1) 근무 종료 클릭 > 배치정보 저장 팝업 > 계속 클릭 시 (batch 종료 시) EOD 출력
   * Case 2) 근무 시작 후 대시보드로 이동 > 대시보드에서 Stop shift 클릭 > 계속 클릭 시 (batch 종료 시) EOD 출력
   * 판매정산 버튼 클릭 시 값이 없는 판매정산 템플릿 출력 (Alert : 판매정산 템플릿을 출력 하시겠습니까?)
   */
  startEOD() {
    if (this.screenLockType === LockType.LOCK) { return; }
    if (this.storage.isLogin()) {
      this.modal.openConfirm({
        modalAddClass: 'pop_s',
        title: this.message.get('eod.tmpl.title'),
        message: this.message.get('eod.tmpl.msg'),
        actionButtonLabel: this.message.get('btn.ok.label'),
        closeButtonLabel: this.message.get('btn.no.label'),
        closeByEnter: true,
        closeByClickOutside: true,
        beforeCloseCallback: function () {
          if (this.isEnter) { this.result = this.isEnter; }
        },
        modalId: ModalIds.EOD
      }).subscribe(result => {
        if (result) {
          this.receipt.printEodMockup();
        }
      });
    } else {
      this.alert.warn({ title: this.message.get('eod.tmpl.title'), message: this.message.get('eod.tmpl.warn'), timer: true, interval: 1500 });
    }
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
      this.batchsubscription = this.batch.startBatch().subscribe(result => {
        if (result && Utils.isNotEmpty(result.batchNo)) {
          this.logger.set('dashboard.component', 'start batch...').debug();
          this.storage.setBatchInfo(result);
          this.info.sendInfo('bat', result);
          this.alert.info({ message: this.message.get('start.batch') });
          this.alertsubscription = this.alert.alertState.subscribe(
            (state: AlertState) => {
              if (!state.show) { this.router.navigate(['/order']); }  // 닫히면 order 화면으로...
            }
          );
        }
      }, error => {
        const errdt = Utils.getError(error);
        if (errdt) {
          if (errdt.type === 'AmbiguousIdentifierError') {
            this.logger.set('dashboard.component', `${errdt.message}`).error();
          }
          this.logger.set('dashboard.component', `${errdt.message}`).error();
          this.alert.error({ message: this.message.get('server.error', errdt.message) });
        }
      });
    }
  }

  /**
   * 로그오프 시 배치 정보 저장 후(P7페이지 배치 정보 저장 확인 팝업 뜸) 이후, 대시보드 메인으로 이동
   * 
   * @add 2018.09.27 판매정산 관련
   * Case 1) 근무 종료 클릭 > 배치정보 저장 팝업 > 계속 클릭 시 (batch 종료 시) EOD 출력
   * Case 2) 근무 시작 후 대시보드로 이동 > 대시보드에서 Stop shift 클릭 > 계속 클릭 시 (batch 종료 시) EOD 출력
   */
  stopShift() {
    if (this.screenLockType === LockType.LOCK) { return; }
    this.logger.set('dashboard.component', 'stop shift').debug();
    const existbatch: boolean = this.batchNo === null ? false : Utils.isNotEmpty(this.batchNo);
    const isloginBatch: boolean = this.storage.isLogin() && existbatch;
    if (isloginBatch) {
      let msg: string;
      let btn: string;
      if (this.orderCount > 0) {
        msg = `주문 수량이 (<em class="fc_red">${this.orderCount}</em>)건 입니다.<br>배치 정보를 저장하시겠습니까?`;
        btn = '확인';
      } else {
        msg = `배치를 종료하시겠습니까?<br>배치정보 저장 후, Stop Shift가 진행됩니다.`;
        btn = '계속';
      }
      this.modal.openConfirm({
        title: 'Stop Shift',
        message: msg,
        actionButtonLabel: btn,
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        modalId: ModalIds.STOPSHIFT
      }).subscribe(result => {
        if (result) {
          this.logger.set('dashboard.component', 'stop shift, stop batch...').debug();
          this.batchsubscription = this.batch.endBatch().subscribe(() => {
            // EOD 영수증 출력
            this.eodsubscription = this.batch.getEodData().subscribe(result => {
              const eodData: EodData = this.batch.convertEodData(result);
              this.receipt.printEod(eodData);
              this.stopShiftConfirm();
            }, error => {
              this.stopShiftConfirm();
            });
            
          });
        }
      });
    }
  }

  private stopShiftConfirm() {
    this.storage.removeBatchInfo();
    this.info.sendInfo('bat', { batchNo: null });
    this.modal.openConfirm({
      title: 'Stop Shift',
      message: `배치 정보 저장이 완료되었습니다.`,
      actionButtonLabel: '확인',
      closeButtonLabel: '취소',
      closeByClickOutside: false,
      modalId: ModalIds.STOPSHIFTEND
    });
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
    const existbatch: boolean = this.batchNo === null ? false : Utils.isNotEmpty(this.batchNo);
    const isloginBatch: boolean = this.storage.isLogin() && existbatch;
    if (isloginBatch) {
      if (this.orderCount > 0) {
        msg = `주문 수량이 (<em class="fc_red">${this.orderCount}</em>)건 입니다.<br>배치 정보를 저장하시겠습니까?`;
        btn = '확인';
      } else {
        msg = `POS를 종료하시겠습니까?<br>배치정보 저장 후, 화면 종료가 진행됩니다.`;
        btn = '계속';
      }
    } else {
      msg = `POS를 종료하시겠습니까?<br>화면 종료가 진행됩니다.`;
    }
    this.modal.openConfirm({
      title: 'POS 종료',
      message: msg,
      actionButtonLabel: btn,
      closeButtonLabel: '취소',
      modalId: ModalIds.POSEND
    }).subscribe(
      result => {
        if (result) {
          if (isloginBatch) {
            this.batchsubscription = this.batch.endBatch().subscribe(() => {
              this.storage.logout();
              // this.storage.removeEmployeeName(); // client 담당자 삭제
              this.storage.clearClient();
              this.modal.openConfirm({
                title: 'POS 종료',
                message: `배치 정보 저장이 완료되었습니다.`,
                actionButtonLabel: '확인',
                closeButtonLabel: '취소',
                closeByClickOutside: false,
                modalId: ModalIds.POSENDLAST
              }).subscribe(ret => {
                if (ret) {
                  this.storage.logout();
                  Utils.kioskModeEnd();
                }
              });
            });
          } else {
            Utils.kioskModeEnd();
          }
        } else {
          // this.router.navigate(['/order']); // 2018.04.30 대시보드 유지
        }
      }
    );
  }

}
