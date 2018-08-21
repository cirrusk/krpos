import { Component, OnInit, HostListener, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { ChecksComponent } from '../checks/checks.component';
import { MessageService, ReceiptService } from '../../../../service';
import { ModalComponent, ModalService, Modal, StorageService } from '../../../../core';
import {
  Accounts, PaymentCapture, PaymentModes, CashType, CashPaymentInfo, PaymentModeData,
  CurrencyData, KeyCode, StatusDisplay, CapturePaymentInfo, AmwayExtendedOrdering
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
  payamount: number;
  private paidamount: number;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentsubscription: Subscription;
  @ViewChild('paid') private paid: ElementRef;         // 받은금액
  constructor(protected modalService: ModalService,
    private message: MessageService,
    private modal: Modal,
    private receipt: ReceiptService,
    private storage: StorageService,
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
    setTimeout(() => {
      this.paid.nativeElement.value = 0;
      this.paid.nativeElement.select();
      this.paid.nativeElement.focus();
    }, 50);
    this.paidamount = this.cartInfo.totalPrice.value; // 원 결제 금액
    if (this.storage.getPay() === 0) {
      // this.payment.nativeElement.value = this.cartInfo.totalPrice.value;
      this.payamount = this.cartInfo.totalPrice.value;
      this.paidamount = this.cartInfo.totalPrice.value;
    } else {
      // this.payment.nativeElement.value = this.storage.getPay();
      this.payamount = this.storage.getPay();
      this.paidamount = this.storage.getPay();
    }
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    this.receipt.dispose();
  }

  searchCheque() {
    this.modal.openModalByComponent(ChecksComponent, {
      closeByClickOutside: false,
      closeByEscape: true,
      modalId: 'ChecksComponent'
    }).subscribe(result => {
      if (result) {
        this.paid.nativeElement.value = result;
        // payment 구성할때 수표지불처리해야함.
        setTimeout(() => { this.paid.nativeElement.focus(); }, 50);
      }
    });
  }

  cashCal() {
    const paid = this.paid.nativeElement.value ? Number(this.paid.nativeElement.value) : 0;
    // const payment = this.payment.nativeElement.value ? Number(this.payment.nativeElement.value) : 0;
    const payment = this.payamount ? Number(this.payamount) : 0;
    const paychange = this.paidamount - payment; // 장바구니 결제금액 - 실결제금액
    if (paid < 1) { // 1. 받은금액이 작을 경우
      this.paySubmitLock(false); // 버튼 잠금 해제
      this.checktype = -1;
      this.apprmessage = this.message.get('notinputPaid');
      return;
    } else {
      this.checktype = 0;
    }
    if (paychange < 0) {
      this.paySubmitLock(false); // 버튼 잠금 해제
      this.checktype = -3;
      this.apprmessage = '결제금액이 장바구니의 금액보다 클 수 없습니다.';
    }
  }

  /**
   * 입력창에서 엔터 입력시 바로 처리
   *
   * @param evt 이벤트
   * @param paid 받은금액
   */
  payEnter(evt: any, paid: number) {
    if (paid && paid > 0) {
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
   * @param receivedAmount 받은금액
   * @param payAmount 결제금액
   */
  pay(evt: KeyboardEvent, receivedAmount: number, payAmount: number): void {
    evt.preventDefault();
    if (this.finishStatus !== null) { // 결제가 한번 처리되면 다시 처리되지 않도록
      return;
    }
    this.paySubmitLock(true);
    const nReceiveAmount = Number(receivedAmount); // 받은금액
    let nPayAmount = Number(payAmount); // 결제금액
    if (nReceiveAmount < 1) {
      this.paySubmitLock(false); // 버튼 잠금 해제
      this.checktype = -1;
      setTimeout(() => { this.paid.nativeElement.select(); this.paid.nativeElement.focus(); }, 50);
      this.apprmessage = this.message.get('notinputPaid');
      return;
    }
    let paychange = this.paidamount - nPayAmount; // 장바구니 결제금액 - 실결제금액
    const change = nReceiveAmount - nPayAmount; // 거스름돈 = 내신금액 - 결제금액

    if (change < 0) { // 내신금액이 결제금액보다 작으면 결제금액을 내신금액으로 대체
      nPayAmount = nReceiveAmount;
      paychange = this.paidamount - nPayAmount;
    }
    if (paychange > 0) { // 결제할 금액이 더있음.
      this.storage.setPay(this.paidamount - nPayAmount); // 현재까지 결제할 남은 금액(전체결제금액 - 실결제금액)을 세션에 저장
      this.paymentcapture = this.makePaymentCaptureData(nPayAmount, nReceiveAmount, change).capturePaymentInfoData;
      this.result = this.paymentcapture;
      this.finishStatus = StatusDisplay.PAID;
      this.apprmessage = this.message.get('payment.success.next'); // '결제가 완료되었습니다.';
    } else if (paychange === 0) { // 결제 완료
      this.paymentcapture = this.makePaymentCaptureData(nPayAmount, nReceiveAmount, change).capturePaymentInfoData;
      this.apprmessage = this.message.get('payment.success'); // '결제가 완료되었습니다.';
      // this.finishStatus = StatusDisplay.PAID;
      this.completePayPopup(nReceiveAmount, nPayAmount, change);
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
      modalId: 'CompletePaymentComponent',
      paymentType: 'c'
    });
  }

  /**
   * Payment Capture 데이터 생성
   *
   * @param paidamount 지불 금액
   */
  private makePaymentCaptureData(paidamount: number, received: number, change: number): CapturePaymentInfo {
    let paidamountbypayment = paidamount;
    if (Number(paidamount) > Number(received)) {
      paidamountbypayment = received;
    }
    const capturepaymentinfo = new CapturePaymentInfo();
    const cash = new CashPaymentInfo(paidamountbypayment, CashType.CASH);
    cash.setReceived = received;
    cash.setChange = change < 0 ? 0 : change;
    cash.setPaymentModeData = new PaymentModeData(PaymentModes.CASH);
    cash.setCurrencyData = new CurrencyData();
    if (this.paymentcapture) {
      this.paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      this.paymentcapture.setCashPaymentInfo = cash;
      capturepaymentinfo.setPaymentModeCode = this.storage.getPaymentModeCode();
      capturepaymentinfo.setCapturePaymentInfoData = this.paymentcapture;
    } else {
      const paymentcapture = new PaymentCapture();
      paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcapture.setCashPaymentInfo = cash;
      capturepaymentinfo.setPaymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.CASH;
      capturepaymentinfo.setCapturePaymentInfoData = paymentcapture;
    }
    return capturepaymentinfo;
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
    const payment = this.payamount ? Number(this.payamount) : 0; // 결제금액
    const paychange = this.paidamount - payment;
    if (paychange >= 0) {
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      const lastmodal = this.storage.getLatestModalId();
      if (lastmodal === 'CompletePaymentComponent') {
        return;
      }
      this.doPay(event);
    }
  }

  private doPay(event: any) {
    if (Utils.isPaymentSuccess(this.finishStatus)) {
      this.payFinishByEnter();
    } else if (this.finishStatus === 'recart') {
      this.info.sendInfo('recart', this.orderInfo);
      this.info.sendInfo('orderClear', 'clear');
      this.close();
    } else { // INPUT에 포커스가 없을 경우 결제 처리
      this.pay(event, this.paid.nativeElement.value, this.payamount);
    }
  }
}
