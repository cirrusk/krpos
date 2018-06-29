import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, PrinterService, AlertService, StorageService, SpinnerService, Logger } from '../../../core';
import { Order } from '../../../data/models/order/order';
import { Cart } from '../../../data/models/order/cart';
import { Accounts, PaymentCapture, StatusDisplay, KeyCode, CapturePaymentInfo } from '../../../data';
import { ReceiptService, PaymentService } from '../../../service';
import { InfoBroker } from '../../../broker';
import { Utils } from '../../../core/utils';

@Component({
  selector: 'pos-complete-payment',
  templateUrl: './complete-payment.component.html'
})
export class CompletePaymentComponent extends ModalComponent implements OnInit, OnDestroy {
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  paidamount: number;
  payamount: number;
  change: number;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  constructor(protected modalService: ModalService,
    private printer: PrinterService, private receipt: ReceiptService, private payments: PaymentService,
    private storage: StorageService, private spinner: SpinnerService, private info: InfoBroker, private logger: Logger
  ) {
    super(modalService);
    this.finishStatus = null;
    this.paidamount = 0;
    this.change = 0;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.account;
    this.cartInfo = this.callerData.cartInfo;
    this.paymentcapture = this.callerData.paymentInfo;
    this.paidamount = this.cartInfo.totalPrice.value;
    this.payamount = this.cartInfo.totalPrice.value; // this.callerData.payAmount;
    // this.change = this.callerData.change;
    this.paidAmount();

  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
  }

  pay(evt: KeyboardEvent): void {
    evt.preventDefault();
    if (this.finishStatus !== null) {
      return;
    }
    // 내신금액이 결제금액보다 크면 처리함.
    if (this.paidamount >= this.payamount) { // payment capture 와 place order (한꺼번에) 실행
      this.paymentAndCapture();
    }
  }

  private paidAmount() {
    let paid = 0;
    if (this.paymentcapture.ccPaymentInfo) { // 신용카드
      const p = this.paymentcapture.ccPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    if (this.paymentcapture.cashPaymentInfo) { // 현금결제
      const p = this.paymentcapture.cashPaymentInfo.received;
      if (p) { paid += Number(p); }
      const strchange = this.paymentcapture.cashPaymentInfo.change;
      this.change = strchange ? Number(strchange) : 0;
    }
    if (this.paymentcapture.voucherPaymentInfo) { // 쿠폰
      const p = this.paymentcapture.voucherPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    if (this.paymentcapture.directDebitPaymentInfo) { // 자동이체
      const p = this.paymentcapture.directDebitPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    if (this.paymentcapture.pointPaymentInfo) { // 포인트
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
    this.paidamount = paid;
  }

  /**
   * 결제 정보 캡쳐
   *
   * @param payAmount 내신금액
   * @param paidAmount 결제금액
   * @param change 거스름돈
   */
  private paymentAndCapture() {
    this.spinner.show();
    const capturepaymentinfo = new CapturePaymentInfo();
    capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
    capturepaymentinfo.capturePaymentInfoData = this.paymentcapture;
    this.logger.set('cash.component', 'cash payment : ' + Utils.stringify(this.paymentcapture)).debug();
    this.paymentsubscription = this.payments.placeOrder(this.accountInfo.parties[0].uid, this.cartInfo.code, capturepaymentinfo).subscribe(result => {
      this.orderInfo = result;
      this.logger.set('complete-payment.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
      this.finishStatus = result.statusDisplay;
      if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
        if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
          this.paidDate = result.created ? result.created : new Date();
          this.printAndCartInit();
          if (this.paymentcapture.cashPaymentInfo && this.paymentcapture.cashPaymentInfo.amount > 0) { // 현금결제가 있으면 캐셔 drawer 오픈
            this.printer.openCashDrawer();
          }
        } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
          this.finishStatus = 'recart';
        } else { // CART 삭제된 상태
          this.finishStatus = 'recart';
        }
      } else { // 결제정보 없는 경우,  CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
        this.finishStatus = 'fail';
        // cart-list.component에 재생성 이벤트 보내서 처리
      }
      this.storage.removePay();
    }, error => {
      this.finishStatus = 'fail';
      this.spinner.hide();
      const errdata = Utils.getError(error);
      if (errdata) {
        this.logger.set('cash.component', `${errdata.message}`).error();
      }
    }, () => { this.spinner.hide(); });
  }

  printAndCartInit() {
    if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
      if (this.paidamount >= this.payamount) {
        this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
        this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
      }
    }
    // this.close();
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

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        this.storage.removePaymentModeCode(); // 주결제 수단 세션 정보 삭제
        this.storage.removePay(); // 복합결제 남은 금액 정보 초기화
        this.logger.set('complete.payment.component', '결제 장바구니 초기화...').debug();
        this.info.sendInfo('orderClear', 'clear');
        this.close();
      } else if (this.finishStatus === 'fail') {
        this.info.sendInfo('orderClear', 'clear');
        this.close();
      } else if (this.finishStatus === 'recart') {
        this.info.sendInfo('recart', this.orderInfo);
        this.info.sendInfo('orderClear', 'clear');
        this.close();
      }
    }
  }
}
