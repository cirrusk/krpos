import { Component, OnInit, OnDestroy, ViewChild, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, AlertService, SpinnerService, Logger, AlertState, StorageService, Modal } from '../../../../core';
import {
  KeyCode, Balance, Accounts, PaymentCapture, AmwayMonetaryPaymentInfo,
  PaymentModes, PaymentModeData, StatusDisplay, CurrencyData
} from '../../../../data';
import { PaymentService, ReceiptService } from '../../../../service';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { InfoBroker } from '../../../../broker';
import { Utils } from '../../../../core/utils';
import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';

@Component({
  selector: 'pos-re-cash',
  templateUrl: './re-cash.component.html'
})
export class ReCashComponent extends ModalComponent implements OnInit, OnDestroy {
  finishStatus: string;
  isAllPay: boolean;
  paidamount: number;
  change: number;
  balance: Balance;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  private paymentsubscription: Subscription;
  private balancesubscription: Subscription;
  private alertsubscription: Subscription;
  @ViewChild('usePoint') usePoint: ElementRef;
  constructor(protected modalService: ModalService, private modal: Modal, private receipt: ReceiptService, private payments: PaymentService,
    private storage: StorageService, private alert: AlertService,
    private spinner: SpinnerService, private info: InfoBroker, private logger: Logger, private renderer: Renderer2) {
    super(modalService);
    this.isAllPay = false;
    this.finishStatus = null;
  }

  ngOnInit() {
    setTimeout(() => { this.usePoint.nativeElement.focus(); }, 50);
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    if (this.callerData.paymentCapture) { this.paymentcapture = this.callerData.paymentCapture; }
    if (this.paymentType === 'n') {
      this.paidamount = this.cartInfo.totalPrice.value;
    } else {
      if (this.storage.getPay() === 0) {
        this.paidamount = this.cartInfo.totalPrice.value;
      } else {
        this.paidamount = this.storage.getPay();
      }
    }
    this.balancesubscription = this.payments.getRecash(this.accountInfo.parties[0].uid).subscribe(result => {
      this.balance = result;
    });
  }

  ngOnDestroy() {
    if (this.balancesubscription) { this.balancesubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
  }

  pay(evt: KeyboardEvent) {
    evt.preventDefault();
    if (this.isAllPay) {
      console.log('*** allpay');
    } else {
      console.log('*** use point : ' + this.usePoint.nativeElement.value);
    }
    const usepoint = this.usePoint.nativeElement.value;
    const check = this.paidamount - usepoint;
    if (this.paymentType === 'n') {
      this.alertsubscription = this.alert.alertState.subscribe(
        (state: AlertState) => {
          if (!state.show) {
            setTimeout(() => {
              this.usePoint.nativeElement.focus();
              this.usePoint.nativeElement.select();
            }, 50);
          }
        }
      );
      if (check > 0) {
        this.alert.warn({ message: '결제 사용할 금액이 부족합니다.' });
      } else if (check < 0) {
        this.alert.warn({ message: '결제에 사용할 금액이 많습니다.' });
      } else {
        this.payment();
      }
    } else {
      this.paymentcapture = this.makePaymentCaptureData(this.paidamount);
      if (check > 0) { // 결제할것이 남음.
        // this.info.sendInfo('payinfo', [this.paymentcapture, null]);
        this.sendPaymentAndOrder(this.paymentcapture, null);
        this.result = this.paymentcapture;
        this.finishStatus = StatusDisplay.PAID;
      } else if (check === 0) {
        // this.payment();
        this.completePayPopup(this.paidamount, usepoint, check);
      }
    }
  }

  private payment() {
    this.spinner.show();
    this.paymentcapture = this.makePaymentCaptureData(this.paidamount);
    this.logger.set('recash.component', 'recash payment : ' + Utils.stringify(this.paymentcapture)).debug();
    this.paymentsubscription = this.payments.placeOrder(this.accountInfo.uid, this.accountInfo.parties[0].uid, this.cartInfo.code, this.paymentcapture).subscribe(result => {
      this.orderInfo = result;
      this.logger.set('cash.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
      this.finishStatus = result.statusDisplay;
      if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
        if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
          setTimeout(() => {
            this.usePoint.nativeElement.blur(); // keydown.enter 처리 안되도록
            this.renderer.setAttribute(this.usePoint.nativeElement, 'readonly', 'readonly');
          }, 5);
          // this.info.sendInfo('payinfo', [this.paymentcapture, this.orderInfo]);
          this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
        } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
        } else { // CART 삭제된 상태
          this.info.sendInfo('recart', this.orderInfo);
        }
      } else { // 결제정보 없는 경우, CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
        // cart-list.component에 재생성 이벤트 보내서 처리
        this.info.sendInfo('recart', this.orderInfo);
      }
      this.storage.removePay();
    }, error => {
      this.finishStatus = 'fail';
      this.spinner.hide();
      const errdata = Utils.getError(error);
      if (errdata) {
        this.logger.set('recash.component', `${errdata.message}`).error();
      }
    }, () => { this.spinner.hide(); });
  }

  useRecash() {
    if (this.balance) {
      const usecash = this.usePoint.nativeElement.value;
      this.change = this.balance.amount - usecash;
    }
  }

  checkPay(type: number) {
    if (type === 0) {
      this.usePoint.nativeElement.value = this.paidamount;
      this.change = this.balance.amount - this.paidamount;
      this.isAllPay = true;
    } else {
      this.isAllPay = false;
    }
    setTimeout(() => { this.usePoint.nativeElement.focus(); }, 50);
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const recash = new AmwayMonetaryPaymentInfo(paidamount);
    recash.setPaymentModeData = new PaymentModeData(PaymentModes.ARCREDIT);
    recash.setCurrencyData = new CurrencyData();
    if (this.paymentcapture) {
      if (this.paymentType === 'n') {
        const paymentcapture = new PaymentCapture();
        paymentcapture.setMonetaryPaymentInfo = recash;
        return paymentcapture;
      } else {
        this.paymentcapture.setMonetaryPaymentInfo = recash;
        return this.paymentcapture;
      }
    } else {
      const paymentcapture = new PaymentCapture();
      paymentcapture.setMonetaryPaymentInfo = recash;
      return paymentcapture;
    }
  }

  cartInitAndClose() {
    if (this.paymentType === 'n') { // 일반결제
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        const rtn = this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
        if (rtn) {
          this.logger.set('recash.component', '일반결제 장바구니 초기화...').debug();
          this.info.sendInfo('orderClear', 'clear');
        } else {
          this.alert.show({ message: '실패' });
        }
      }
      this.close();
    } else {
      console.log('복합결제일 경우...');
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        const check = this.paidamount - this.usePoint.nativeElement.value;
        if (check > 0) {

        } else if (check === 0) {
          const rtn = this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
          if (rtn) {
            this.logger.set('recash.component', '복합결제 장바구니 초기화...').debug();
            this.info.sendInfo('orderClear', 'clear');
          } else {
            this.alert.show({ message: '실패' });
          }
        }
      }
      this.close();
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

  private completePayPopup(paidAmount: number, payAmount: number, change: number) {
    this.close();
    this.modal.openModalByComponent(CompletePaymentComponent,
      {
        callerData: {
          account: this.accountInfo, cartInfo: this.cartInfo, paymentInfo: this.paymentcapture,
          paidAmount: paidAmount, payAmount: payAmount, change: change
        },
        closeByClickOutside: false,
        closeByEscape: false,
        modalId: 'CompletePaymentComponent',
        paymentType: 'c'
      }
    );
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onAlertKeyDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        this.cartInitAndClose();
      }
    }
  }

}
