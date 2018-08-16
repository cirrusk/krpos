import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CashReceiptComponent } from '../ways/cash-receipt/cash-receipt.component';
import {
  ModalComponent, ModalService, PrinterService, StorageService,
  KeyboardService, KeyCommand, Modal, Logger
} from '../../../core';
import { Order } from '../../../data/models/order/order';
import { Cart } from '../../../data/models/order/cart';
import { Accounts, PaymentCapture, StatusDisplay, KeyCode, CapturePaymentInfo, AmwayExtendedOrdering } from '../../../data';
import { ReceiptService, PaymentService, MessageService } from '../../../service';
import { InfoBroker } from '../../../broker';
import { Utils } from '../../../core/utils';

/**
 * 결제 완료 컴포넌트
 * 모든 결제 수행 시 최종 결제 완료 창을 출력해야함.
 * 카드결제 시 최소 결제 금액은 200원 이상임.
 */
@Component({
  selector: 'pos-complete-payment',
  templateUrl: './complete-payment.component.html'
})
export class CompletePaymentComponent extends ModalComponent implements OnInit, OnDestroy {
  finishStatus: string;                                // 결제완료 상태
  apprmessage: string;
  paidDate: Date;
  paidamount: number;
  payamount: number;
  change: number;
  checktype: number;
  orderType: string;
  private dupcheck = false;
  private orderInfo: Order;
  private cartInfo: Cart;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  private keyboardsubscription: Subscription;
  constructor(protected modalService: ModalService,
    private printer: PrinterService, private receipt: ReceiptService,
    private payments: PaymentService, private keyboard: KeyboardService,
    private storage: StorageService, private message: MessageService, private modal: Modal, private info: InfoBroker, private logger: Logger
  ) {
    super(modalService);
    this.finishStatus = null;
    this.orderType = null;
    this.paidamount = 0;
    this.change = 0;
    this.checktype = 0;
  }

  ngOnInit() {
    this.keyboardsubscription = this.keyboard.commands.subscribe(c => {
      this.handleKeyboardCommand(c);
    });
    this.accountInfo = this.callerData.account;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;

    this.paymentcapture = this.callerData.paymentInfo;
    this.paidamount = this.cartInfo.totalPrice.value; // 내신금액
    this.payamount = this.cartInfo.totalPrice.value;  // 결제금액
    this.calcPaidAmount();
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
    if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
  }

  /**
   * 결제 처리
   *
   * @param evt 이벤트
   */
  pay(evt: KeyboardEvent): void {
    evt.preventDefault();
    if (this.finishStatus !== null) {
      return;
    }
    const calpaid = this.calAmountByPayment();
    if (calpaid >= this.payamount) { // payment capture 와 place order (한꺼번에) 실행
      if (Utils.isEmpty(this.storage.getPaymentModeCode())) {
        this.checktype = -1;
        this.apprmessage = this.message.get('not.choose.payment'); // '주결제 수단이 선택되지 않았습니다. 다시 결제를 진행해주세요.';
      } else {
        this.checktype = 0;
        this.paymentCaptureAndPlaceOrder();
      }
    }
  }

  /**
   * 전체 결재 금액 계산
   */
  private calAmountByPayment(): number {
    let paid = 0;
    if (this.paymentcapture.ccPaymentInfo) { // 신용카드
      const p = this.paymentcapture.ccPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    if (this.paymentcapture.cashPaymentInfo) { // 현금결제
      const p = this.paymentcapture.cashPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    if (this.paymentcapture.directDebitPaymentInfo) { // 자동이체
      const p = this.paymentcapture.directDebitPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    if (this.paymentcapture.voucherPaymentInfo) { // 쿠폰결제

    }
    if (this.paymentcapture.pointPaymentInfo) { // 포인트결제
      const p = this.paymentcapture.pointPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    if (this.paymentcapture.monetaryPaymentInfo) { // 미수금결제(AR)
      const p = this.paymentcapture.monetaryPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    if (this.paymentcapture.icCardPaymentInfo) { // 현금IC카드결제
      const p = this.paymentcapture.icCardPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    return paid;
  }

  /**
   * 결제금액 설정
   */
  private calcPayAmount() {
    let pay = 0;
    if (this.paymentcapture.ccPaymentInfo) {
      const p = this.paymentcapture.ccPaymentInfo.amount;
      if (p) {
        pay = Number(p);
      }
      this.payamount = pay;
    }
  }

  /**
   * 내신금액 설정
   */
  private calcPaidAmount() {
    let paid = 0;
    if (this.paymentcapture.cashPaymentInfo) { // 현금결제
      const p = this.paymentcapture.cashPaymentInfo.received;
      if (p) {
        paid += Number(p);
      }
      const strchange = this.paymentcapture.cashPaymentInfo.change;
      this.change = strchange ? Number(strchange) : 0;
    }
    if (this.paymentcapture.pointPaymentInfo) { // 포인트결제
      const p = this.paymentcapture.pointPaymentInfo.amount;
      if (p) {
        paid += Number(p);
      }
    }
    if (this.paymentcapture.monetaryPaymentInfo) { // Re-Cash결제
      const p = this.paymentcapture.monetaryPaymentInfo.amount;
      if (p) {
        paid += Number(p);
      }
    }
    this.paidamount = paid;
  }

  /**
   * 주결제 수단 설정 및 결제 정보 캡쳐
   *
   * @param payAmount 내신금액
   * @param paidAmount 결제금액
   * @param change 거스름돈
   */
  private paymentCaptureAndPlaceOrder() {
    const capturepaymentinfo = new CapturePaymentInfo();
    capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
    capturepaymentinfo.capturePaymentInfoData = this.paymentcapture;
    this.logger.set('complete.payment.component', 'payment capture : ' + Utils.stringify(this.paymentcapture)).debug();
    this.paymentsubscription = this.payments.placeOrder(this.accountInfo.parties[0].uid, this.cartInfo.code, capturepaymentinfo).subscribe(
      result => {
        this.orderInfo = result;
        this.logger.set('complete.payment.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
        this.finishStatus = result.statusDisplay;
        if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
          this.orderType = result.orderType.code;
          if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
            this.paidDate = result.created ? result.created : new Date();
            this.apprmessage = this.message.get('payment.success'); // '결제가 완료되었습니다.';
            this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
          } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
            this.finishStatus = 'recart';
            this.apprmessage = this.message.get('payment.fail'); // '결제에 실패했습니다.';
          } else { // CART 삭제된 상태
            this.finishStatus = 'recart';
            this.apprmessage = this.message.get('payment.fail'); // '결제에 실패했습니다.';
          }
        } else { // 결제정보 없는 경우,  CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
          this.finishStatus = 'fail';
          this.apprmessage = this.message.get('payment.fail'); // '결제에 실패했습니다.';
        }
        this.storage.removePay();
      }, error => {
        this.finishStatus = 'fail';
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('complete.payment.component', `${errdata.message}`).error();
          this.apprmessage = errdata.message;
        }
      });
  }

  /**
   * 영수증 출력 및 카트 초기화
   *
   * @param isCashReceipt 현금영수증 증빙 여부
   */
  private printAndCartInit(isCashReceipt?: boolean) {
    if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
      if (this.amwayExtendedOrdering !== undefined) {
        this.receipt.groupPrint(this.orderInfo, this.paymentcapture, false, isCashReceipt);
        this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
      } else {
        const params = {
          isCashReceipt: isCashReceipt
        };
        this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture, params);
        this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
      }
    }
  }

  /**
   * 장바구니와 클라이언트에 정보 전달
   *
   * @param payment Payment Capture 정보
   * @param order Order 정보
   */
  private sendPaymentAndOrder(payment: PaymentCapture, order: Order) {
    this.info.sendInfo('payinfo', [payment, order]);
    this.storage.setLocalItem('payinfo', [payment, order]);
  }

  close() {
    this.closeModal();
  }

  /**
   * 영수증 출력 팝업 : 키보드에서 현금영수증 버튼 선택 시, 현금영수증 팝업
   */
  protected popupCashReceipt() {
    this.modal.openModalByComponent(CashReceiptComponent, {
      callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, orderInfo: this.orderInfo, paymentcapture: this.paymentcapture },
      closeByClickOutside: false,
      modalId: 'CashReceiptComponent',
      paymentType: 'c'
    }).subscribe(result => {
      if (result && result === '200') {
        this.payFinishByEnter(true); // 현금영수증 출력.
      }
    });
  }

  /**
   * 결제 최종 엔터키 입력 시
   *
   * @param isCashReceipt 현금영수증 증빙 여부
   */
  private payFinishByEnter(isCashReceipt?: boolean) {
    if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
      if (this.paymentcapture.cashPaymentInfo && this.paymentcapture.cashPaymentInfo.amount > 0) { // 현금결제가 있으면 캐셔 drawer 오픈
        this.printer.openCashDrawer();
      }
      this.printAndCartInit(isCashReceipt);
      this.storage.removePaymentModeCode(); // 주결제 수단 세션 정보 삭제
      this.storage.removePay(); // 복합결제 남은 금액 정보 초기화
      this.info.sendInfo('orderClear', 'clear');
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onPaymentdDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      const modalid = this.storage.getLatestModalId();
      if (modalid !== 'SerialComponent' && modalid !== 'CashReceiptComponent') {
        if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
          this.payFinishByEnter();
        } else if (this.finishStatus === 'fail') {
          this.info.sendInfo('orderClear', 'clear');
          this.close();
        } else if (this.finishStatus === 'recart') {
          this.info.sendInfo('recart', this.orderInfo);
          this.info.sendInfo('orderClear', 'clear');
          this.close();
        } else {
          if (!this.dupcheck) {
            setTimeout(() => { this.pay(event); }, 300);
            this.dupcheck = true;
          }
        }
      }
    }
  }

  /**
   * 현금영수증 버튼 선택 시에만 이벤트 처리하면됨.
   * 반드시 결제가 완료된 후에만 처리됨.
   *
   * @param command 키보드 명령어
   */
  private handleKeyboardCommand(command: KeyCommand) {
    try {
      switch (command.combo) {
        case 'ctrl+r': {
          if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
            if (this.isReceiptEnable()) { // 현금, Recash 인 경우 출력
              this[command.name]();
            }
          }
        } break;
      }
    } catch (e) {
      this.logger.set('complete.payment.component', `[${command.combo}] key event, [${command.name}] undefined function!`).error();
    }
  }

  /**
   * 현금 결제가 포함되면 현금 영수증 신청이 가능
   * directDebitPaymentInfo // 자동이체
   * monetaryPaymentInfo // Re-Cash
   * cashPaymentInfo // 현금
   */
  private isReceiptEnable() {
    if (this.paymentcapture.cashPaymentInfo // 현금
      || this.paymentcapture.monetaryPaymentInfo // AP
      || this.paymentcapture.directDebitPaymentInfo // 자동이체
    ) {
      return true;
    }
    return false;
  }
}
