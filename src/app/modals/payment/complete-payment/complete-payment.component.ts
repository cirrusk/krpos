import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, PrinterService, AlertService, StorageService, SpinnerService, Logger } from '../../../core';
import { Order } from '../../../data/models/order/order';
import { Cart } from '../../../data/models/order/cart';
import { Accounts, PaymentCapture, StatusDisplay, KeyCode } from '../../../data';
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
    private alert: AlertService, private storage: StorageService,
    private spinner: SpinnerService, private info: InfoBroker, private logger: Logger
  ) {
    super(modalService);
    this.finishStatus = null;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.account;
    this.cartInfo = this.callerData.cartInfo;
    this.paymentcapture = this.callerData.paymentInfo;
    this.paidamount = this.callerData.paidAmount;
    this.payamount = this.callerData.payAmount;
    this.change = this.callerData.change;

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

  /**
   * 결제 정보 캡쳐
   *
   * @param payAmount 내신금액
   * @param paidAmount 결제금액
   * @param change 거스름돈
   */
  private paymentAndCapture() {
    this.spinner.show();
    this.logger.set('cash.component', 'cash payment : ' + Utils.stringify(this.paymentcapture)).debug();
    this.paymentsubscription = this.payments.placeOrder(this.accountInfo.uid, this.accountInfo.parties[0].uid, this.cartInfo.code, this.paymentcapture).subscribe(result => {
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
        } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
        } else { // CART 삭제된 상태
        }
      } else { // 결제정보 없는 경우, CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
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
        const rtn = this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
        if (rtn) {
          this.logger.set('complete.payment.component', '결제 장바구니 초기화...').debug();
          this.info.sendInfo('orderClear', 'clear');
        } else {
          this.alert.show({ message: '실패' });
        }
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
        this.close();
      }
    }
  }
}
