import { Component, OnInit, HostListener, ElementRef, ViewChild, Renderer2, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { MessageService, PaymentService, ReceiptService } from '../../../../service';
import { ModalComponent, ModalService, PrinterService, SpinnerService, Logger, Modal, StorageService } from '../../../../core';
import {
  Accounts, PaymentCapture, PaymentModes, CashType, CashPaymentInfo, PaymentModeData,
  CurrencyData, KeyCode, StatusDisplay, CapturePaymentInfo, AmwayExtendedOrdering
} from '../../../../data';
import { Cart } from '../../../../data/models/order/cart';
import { Order } from '../../../../data/models/order/order';
import { Utils } from '../../../../core/utils';
import { InfoBroker } from '../../../../broker';

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
  private paidamount: number;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentsubscription: Subscription;
  @ViewChild('cashPanel') private cashPanel: ElementRef;
  @ViewChild('paid') private paid: ElementRef;         // 내신금액
  @ViewChild('payment') private payment: ElementRef;   // 결제금액
  constructor(protected modalService: ModalService,
    private message: MessageService,
    private modal: Modal,
    private printer: PrinterService,
    private receipt: ReceiptService,
    private payments: PaymentService,
    private storage: StorageService,
    private spinner: SpinnerService,
    private info: InfoBroker,
    private logger: Logger,
    private renderer: Renderer2) {
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
    if (this.paymentType === 'n') { // 일반결제
      this.payment.nativeElement.value = this.cartInfo.totalPrice.value;
    } else { // 복합결제
      if (this.storage.getPay() === 0) {
        this.payment.nativeElement.value = this.cartInfo.totalPrice.value;
        this.paidamount = this.cartInfo.totalPrice.value;
      } else {
        this.payment.nativeElement.value = this.storage.getPay();
        this.paidamount = this.storage.getPay();
      }
    }
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    this.receipt.dispose();
  }

  searchCheque() {

  }

  cashCal() {
    const paid = this.paid.nativeElement.value ? Number(this.paid.nativeElement.value) : 0;
    const payment = this.payment.nativeElement.value ? Number(this.payment.nativeElement.value) : 0;
    const paychange = this.paidamount - payment; // 장바구니 결제금액 - 실결제금액
    // const change = paid - payment;
    if (paid < 1) { // 1. 내신금액이 작을 경우
      this.paySubmitLock(false); // 버튼 잠금 해제
      this.checktype = -1;
      this.apprmessage = this.message.get('notinputPaid');
      return;
    } else {
      this.checktype = 0;
    }
    // if (change >= 0) {
    //   this.checktype = 0;
    // }
    if (paychange < 0) {
      this.paySubmitLock(false); // 버튼 잠금 해제
      this.checktype = -3;
      this.apprmessage = '결제금액이 장바구니의 금액보다 클 수 없습니다.';
    }
  }

  /**
   * 내신금액에서 엔터키 입력 시 결제금액으로 이동
   */
  paidBlur() {
    const paid = this.paid.nativeElement.value;
    if (paid) {
      setTimeout(() => { this.payment.nativeElement.select(); this.payment.nativeElement.focus(); }, 50);
    }
  }

  /**
   * 결제금엑에서 엔터키 입력 시 포커스 나가기
   */
  paymentBlur() {
    const paid = this.paid.nativeElement.value;
    const payment = this.payment.nativeElement.value;
    if (paid && payment) {
      this.payment.nativeElement.blur();
    }
  }

  /**
   * 현금 결제 처리
   * ABO	현금(수표)	A포인트	Recash			쿠폰
   * Member	현금(수표)	M포인트
   * 소비자	현금(수표)
   *
   * @param receivedAmount 내신금액
   * @param payAmount 결제금액
   */
  pay(evt: KeyboardEvent, receivedAmount: number, payAmount: number): void {
    evt.preventDefault();
    if (this.finishStatus !== null) { // 결제가 한번 처리되면 다시 처리되지 않도록
      return;
    }
    this.paySubmitLock(true);
    const nReceiveAmount = Number(receivedAmount); // 내신금액
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
    if (this.paymentType === 'n') { // 일반결제인 경우
      if (change >= 0) { // 거스름돈 있음.
        if (paychange === 0) { // 결제할 금액이 장바구니 금액과 동일
          this.paymentCaptureAndPlaceOrder(nPayAmount, nReceiveAmount, change);
        }
      } else {
        this.paySubmitLock(false); // 버튼 잠금 해제
        this.checktype = -2;
        this.apprmessage = this.message.get('notEnoughPaid');
        return;
      }
    } else { // 복합결제인 경우
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
        paidAmount: receivedAmount, payAmount: payAmount, change: change, amwayExtendedOrdering : this.amwayExtendedOrdering
      },
      closeByClickOutside: false,
      closeByEscape: false,
      modalId: 'CompletePaymentComponent',
      paymentType: 'c'
    });
  }

  /**
   * 결제 정보 캡쳐
   *
   * @param receivedAmount 내신금액
   * @param paidAmount 결제금액
   * @param change 거스름돈
   */
  private paymentCaptureAndPlaceOrder(receivedAmount: number, paidAmount: number, change: number) {
    this.spinner.show();
    const capturepaymentinfo = this.makePaymentCaptureData(receivedAmount, paidAmount, change);
    this.paymentcapture = capturepaymentinfo.capturePaymentInfoData;
    this.logger.set('cash.component', 'cash payment : ' + Utils.stringify(this.paymentcapture)).debug();
    this.paymentsubscription = this.payments.placeOrder(this.accountInfo.parties[0].uid, this.cartInfo.code, capturepaymentinfo).subscribe(
      result => {
        this.orderInfo = result;
        this.logger.set('cash.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
        this.finishStatus = result.statusDisplay;
        if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
          if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
            this.apprmessage = this.message.get('payment.success'); // '결제가 완료되었습니다.';
            this.paidDate = result.created ? result.created : new Date();
            setTimeout(() => {
              this.payment.nativeElement.blur(); // keydown.enter 처리 안되도록
              this.renderer.setAttribute(this.paid.nativeElement, 'readonly', 'readonly');
              this.renderer.setAttribute(this.payment.nativeElement, 'readonly', 'readonly');
            }, 5);
            this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
            this.printer.openCashDrawer(); // 캐셔 drawer 오픈
          } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
            this.apprmessage = this.message.get('payment.fail'); // '결제에 실패했습니다.';
            this.finishStatus = 'recart';
          } else { // CART 삭제된 상태
            this.apprmessage = this.message.get('payment.fail'); // '결제에 실패했습니다.';
            this.finishStatus = 'recart';
          }
        } else { // 결제정보 없는 경우,  CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
          // cart-list.component에 재생성 이벤트 보내서 처리
          this.finishStatus = 'fail';
          this.apprmessage = this.message.get('payment.fail'); // '결제에 실패했습니다.';
        }
        this.storage.removePay();
      }, error => {
        this.finishStatus = 'fail';
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.apprmessage = errdata.message;
        }
      }, () => { this.spinner.hide(); });
  }

  /**
   * Payment Capture 데이터 생성
   *
   * @param paidamount 지불 금액
   */
  private makePaymentCaptureData(paidamount: number, received: number, change: number): CapturePaymentInfo {
    let paidamountbypayment = paidamount;
    if (this.paymentType === 'c') {
      if (Number(paidamount) > Number(received)) {
        paidamountbypayment = received;
      }
    }
    const capturepaymentinfo = new CapturePaymentInfo();
    const cash = new CashPaymentInfo(paidamountbypayment, CashType.CASH);
    cash.setReceived = received;
    cash.setChange = change < 0 ? 0 : change;
    cash.setPaymentModeData = new PaymentModeData(PaymentModes.CASH);
    cash.setCurrencyData = new CurrencyData();
    if (this.paymentcapture) {
      if (this.paymentType === 'n') {
        const paymentcapture = new PaymentCapture();
        paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
        paymentcapture.setCashPaymentInfo = cash;
        capturepaymentinfo.setPaymentModeCode = PaymentModes.CASH;
        capturepaymentinfo.setCapturePaymentInfoData = paymentcapture;
      } else {
        this.paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
        this.paymentcapture.setCashPaymentInfo = cash;
        capturepaymentinfo.setPaymentModeCode = this.storage.getPaymentModeCode();
        capturepaymentinfo.setCapturePaymentInfoData = this.paymentcapture;
      }
    } else {
      const paymentcapture = new PaymentCapture();
      paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcapture.setCashPaymentInfo = cash;
      capturepaymentinfo.setPaymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.CASH;
      capturepaymentinfo.setCapturePaymentInfoData = paymentcapture;
    }
    return capturepaymentinfo;
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
   * 결제완료 후 Enter Key 치면 팝업 닫힘
   * 일반결제 : 카트 및 클라이언트 초기화
   * 복합결제 : 카트 및 클라이언트 갱신
   */
  private payFinishByEnter() {
    if (this.paymentType === 'n') { // 일반결제
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
        this.info.sendInfo('orderClear', 'clear');
      }
      this.close();
    } else { // 복합결제
      // const paid = this.paid.nativeElement.value ? Number(this.paid.nativeElement.value) : 0; // 내신금액
      const payment = this.payment.nativeElement.value ? Number(this.payment.nativeElement.value) : 0; // 결제금액
      // const change = paid - payment;
      const paychange = this.paidamount - payment;
      if (paychange >= 0) {
        this.close();
        // const nReceiveAmount = this.paid.nativeElement.value ? this.paid.nativeElement.value : 0;
        // let nPayAmount = this.payment.nativeElement.value ? this.payment.nativeElement.value : 0;
        // const change = nReceiveAmount - nPayAmount; // 거스름돈 = 내신금액 - 결제금액
        // if (change < 0) { // 내신금액이 결제금액보다 작으면 결제금액을 내신금액으로 대체
        //   nPayAmount = nReceiveAmount;
        // }
        // this.completePayPopup(nReceiveAmount, nPayAmount, change);
      }
      // const paid = this.paid.nativeElement.value; // 내신금액
      // const payment = this.payment.nativeElement.value; // 결제금액
      // if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
      //   if (paid === payment) { // 금액이 같을 경우만 영수증 출력
      //     this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
      //     this.info.sendInfo('orderClear', 'clear');
      //   }
      // }
      // this.close();
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
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        this.payFinishByEnter();
      } else if (this.finishStatus === 'recart') {
        this.info.sendInfo('recart', this.orderInfo);
        this.info.sendInfo('orderClear', 'clear');
        this.close();
      } else {
        this.pay(event, this.paid.nativeElement.value, this.payment.nativeElement.value);
      }
    }
  }

}
