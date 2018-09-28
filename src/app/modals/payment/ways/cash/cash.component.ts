import { Component, OnInit, HostListener, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { ChecksComponent } from '../checks/checks.component';
import { MessageService, ReceiptService, PaymentService, CartService } from '../../../../service';
import { ModalComponent, ModalService, Modal, StorageService, Logger, KeyboardService, KeyCommand, SpinnerService } from '../../../../core';
import {
  Accounts, PaymentCapture, KeyCode, StatusDisplay, AmwayExtendedOrdering, ModalIds
} from '../../../../data';
import { Cart } from '../../../../data/models/order/cart';
import { Order } from '../../../../data/models/order/order';
import { InfoBroker } from '../../../../broker';
import { Utils } from '../../../../core/utils';

/**
 * 현금 결제 컴포넌트
 * 받은 금액 입력 후 엔터로 결제 처리 진행
 */
@Component({
  selector: 'pos-cash',
  templateUrl: './cash.component.html'
})
export class CashComponent extends ModalComponent implements OnInit, OnDestroy {

  paylock: boolean;                                    // 결제버튼잠금
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  checktype: number;
  apprmessage: string;
  payamount: number;  // 현재 원 결제금액
  orderType: string;
  private regex: RegExp = /[^0-9]+/g;
  // private paidamount: number;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentsubscription: Subscription;
  private keyboardsubscription: Subscription;
  @ViewChild('paid') private paid: ElementRef;         // 받은금액

  // spinnerService 는 HostListener 사용중
  constructor(protected modalService: ModalService,
    private message: MessageService,
    private modal: Modal,
    private payment: PaymentService,
    private receipt: ReceiptService,
    private storage: StorageService,
    private cartService: CartService,
    private spinnerService: SpinnerService,
    private keyboard: KeyboardService,
    private logger: Logger,
    private info: InfoBroker) {
    super(modalService);
    this.finishStatus = null;
    this.checktype = 0;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    if (this.callerData.paymentCapture) { this.paymentcapture = this.callerData.paymentCapture; }
    this.keyboardsubscription = this.keyboard.commands.subscribe(c => {
      this.handleKeyboardCommand(c);
    });
    this.loadPayment();
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
    this.receipt.dispose();
  }

  searchCheque() {
    this.modal.openModalByComponent(ChecksComponent, {
      closeByClickOutside: false,
      closeByEscape: true,
      modalId: ModalIds.CHECKS
    }).subscribe(result => {
      if (result) {
        this.paid.nativeElement.value = result; // payment 구성할때 수표지불처리해야함.
        setTimeout(() => { this.paid.nativeElement.focus(); }, 50);
      }
    });
  }

  private loadPayment() {
    this.payamount = this.cartService.getTotalPriceWithTax(this.cartInfo); // this.cartInfo.totalPrice.value; // 원 결제 금액
    const p: PaymentCapture = this.paymentcapture || this.storage.getPaymentCapture();
    if (p && p.cashPaymentInfo) {
      this.paid.nativeElement.value = p.cashPaymentInfo.received;
    } else {
      this.paid.nativeElement.value = 0;
      if (this.storage.getPay() > 0) {
        this.payamount = this.storage.getPay();
      } else {
        this.payamount = this.cartService.getPaymentPriceByPaid(this.paymentcapture, this.cartInfo);
      }
    }
    this.cashCal();
    setTimeout(() => { this.paid.nativeElement.focus(); this.paid.nativeElement.select(); }, 50);
  }

  cashCal() {
    const paid = this.paid.nativeElement.value ? Number(this.paid.nativeElement.value.replace(this.regex, '')) : 0; // 받은금액 결제할 금액
    if (paid < 1) { // 1. 받은금액이 작을 경우
      this.paySubmitLock(false); // 버튼 잠금 해제
      this.checktype = -1;
      this.apprmessage = this.message.get('notinputPaid');
      return;
    } else {
      this.checktype = 0;
    }
  }

  /**
   * 입력창에서 엔터 입력시 바로 처리
   *
   * @param evt 이벤트
   * @param paid 받은금액
   */
  payEnter(evt: any, paid: string) {
    const nPaid = Number(paid.replace(this.regex, ''));
    if (paid && nPaid > 0) {
      this.payButton(evt);
    }
  }

  payButton(evt: any) {
    this.doPay(evt);
    this.paySubmitLock(false);
  }

  /**
   * 현금 결제 처리
   * ABO	현금(수표)	A포인트	Recash			쿠폰
   * Member	현금(수표)	M포인트
   * 소비자	현금(수표)
   *
   * @param {string} receivedAmount 받은금액
   * @param {number} payAmount 결제금액
   */
  pay(evt: KeyboardEvent, receivedAmount: string, payAmount: number): void {
    evt.preventDefault();
    if (this.finishStatus !== null) { // 결제가 한번 처리되면 다시 처리되지 않도록
      return;
    }
    this.paySubmitLock(true);
    const nReceiveAmount = Number(receivedAmount.replace(this.regex, '')); // 받은금액
    let nPayAmount = Number(payAmount); // 결제금액
    if (nReceiveAmount < 1) {
      this.paySubmitLock(false); // 버튼 잠금 해제
      this.checktype = -1;
      setTimeout(() => { this.paid.nativeElement.select(); this.paid.nativeElement.focus(); }, 50);
      this.apprmessage = this.message.get('notinputPaid');
      return;
    }
    let paychange = this.payamount - nPayAmount; // 장바구니 결제금액 - 실결제금액
    const change = nReceiveAmount - nPayAmount; // 거스름돈 = 내신금액 - 결제금액
    if (change < 0) { // 내신금액이 결제금액보다 작으면 결제금액을 내신금액으로 대체
      nPayAmount = nReceiveAmount;
      paychange = this.payamount - nPayAmount;
    }
    if (paychange > 0) { // 결제할 금액이 더있음.
      this.storage.setPay(this.payamount - nPayAmount); // 현재까지 결제할 남은 금액(전체결제금액 - 실결제금액)을 세션에 저장
      this.paymentcapture = this.payment.makeCashPaymentCaptureData(this.paymentcapture, nPayAmount, nReceiveAmount, change).capturePaymentInfoData;
      this.result = this.paymentcapture;
      this.finishStatus = StatusDisplay.PAID;
      this.payment.sendPaymentAndOrderInfo(this.paymentcapture, null);
      this.apprmessage = this.message.get('payment.success.next'); // '결제가 완료되었습니다.';
      this.close();
    } else if (paychange === 0) { // 결제 완료
      this.paymentcapture = this.payment.makeCashPaymentCaptureData(this.paymentcapture, nPayAmount, nReceiveAmount, change).capturePaymentInfoData;
      this.result = this.paymentcapture;
      this.apprmessage = this.message.get('payment.success'); // '결제가 완료되었습니다.';
      this.payment.sendPaymentAndOrderInfo(this.paymentcapture, null);
      const ordercheck = this.payment.getPaymentCheck(this.paymentcapture);
      if (ordercheck === 1) { // 일반결제
        this.completePayPopup(nReceiveAmount, nPayAmount, change);
      } else if (ordercheck > 1) { // 복합결제
        this.completePayPopup(nReceiveAmount, nPayAmount, change);
      }
    }
  }

  private paySubmitLock(lock: boolean) {
    this.paylock = lock;
  }

  /**
   * 최종 결제 완료 팝업
   * @param receivedAmount 내신금액
   * @param payAmount 결제금액
   * @param change 거스름돈
   */
  private completePayPopup(receivedAmount: number, payAmount: number, change: number) {
    this.close();
    change = (change < 0) ? 0 : change;
    this.modal.openModalByComponent(CompletePaymentComponent, {
      callerData: {
        account: this.accountInfo, cartInfo: this.cartInfo, paymentInfo: this.paymentcapture,
        paidAmount: receivedAmount, payAmount: payAmount, change: change, amwayExtendedOrdering: this.amwayExtendedOrdering
      },
      closeByClickOutside: false,
      closeByEscape: false,
      modalId: ModalIds.COMPLETELAST,
      paymentType: 'c'
    });
  }

  close() {
    this.closeModal();
  }

  /**
   * 결제완료 후 Enter Key 치면 팝업 닫힘
   * 일반결제 : 카트 및 클라이언트 초기화
   * 복합결제 : 카트 및 클라이언트 갱신
   */
  private payFinishByEnter() {
    const payment = this.paid.nativeElement.value ? Number(this.paid.nativeElement.value.replace(this.regex, '')) : 0; // 받은금액 결제할 금액
    const paychange = payment - this.payamount; // 받은금액 - 결제금액
    if (paychange >= 0) {
      this.close();
    }
  }

  /**
   * 결제 처리
   *
   * @param {any} event 이벤트
   */
  private doPay(event: any) {
    if (Utils.isPaymentSuccess(this.finishStatus)) {
      this.payFinishByEnter();
    } else if (this.finishStatus === 'recart') {
      this.info.sendInfo('recart', this.orderInfo);
      this.info.sendInfo('orderClear', 'clear');
      this.close();
    } else {
      this.pay(event, this.paid.nativeElement.value, this.payamount);
    }
  }

  @HostListener('document:keydown', ['$event', 'this.spinnerService.status()'])
  onKeyBoardDown(event: any, isSpinnerStatus: boolean) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER && !isSpinnerStatus) {
      const lastmodal = this.storage.getLatestModalId();
      if (lastmodal === ModalIds.COMPLETE) {
        return;
      }
      this.doPay(event);
    }
  }

  protected doCheque(evt: any) {
    this.searchCheque();
  }

  private handleKeyboardCommand(command: KeyCommand) {
    try {
      this[command.name](command.ev);
    } catch (e) {
      this.logger.set('cash.component', `[${command.combo}] key event, [${command.name}] undefined function!`).info();
    }
  }
}
