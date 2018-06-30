import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, Modal, SpinnerService, Logger, StorageService, AlertService } from '../../../core';
import { ComplexPaymentComponent } from '../complex-payment/complex-payment.component';
import { Accounts, Coupon, PaymentCapture, VoucherPaymentInfo, PaymentModeData, PaymentModes, CurrencyData, StatusDisplay, KeyCode } from '../../../data';
import { Cart } from '../../../data/models/order/cart';
import { InfoBroker } from '../../../broker';
import { PaymentService, MessageService } from '../../../service';
import { Order } from '../../../data/models/order/order';
import { Utils } from '../../../core/utils';

@Component({
  selector: 'pos-coupon-payment',
  templateUrl: './coupon-payment.component.html'
})
export class CouponPaymentComponent extends ModalComponent implements OnInit, OnDestroy {
  paidamount: number;
  isAllPay: boolean;
  changeamount: number; // 결제금액 - 쿠폰 금액
  couponamount: number; // 쿠폰 금액
  checktype: number;
  apprmessage: string;
  finishStatus: string;
  private accountInfo: Accounts;
  private cartInfo: Cart;
  private coupon: Coupon;
  private paymentcapture: PaymentCapture;
  private paymentsubscription: Subscription;
  private couponsubscription: Subscription;
  @ViewChild('couponcode') private couponcode: ElementRef;
  constructor(protected modalService: ModalService, private modal: Modal, private spinner: SpinnerService,
    private info: InfoBroker, private payment: PaymentService, private message: MessageService,
    private storage: StorageService, private logger: Logger, private renderer: Renderer2) {
    super(modalService);
    this.finishStatus = null;
    this.isAllPay = true;
    this.checktype = 0;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.coupon = this.callerData.coupon;
    this.paidamount = this.cartInfo.totalPrice.value;
    if (this.coupon) { // 원래 %쿠폰이 아닌 현금 쿠폰이면 받아야하나 플로우 맞지 않음.(현금 쿠폰 일부 사용 불가함.)
      this.couponcode.nativeElement.value = this.coupon.couponCode;
    }
    setTimeout(() => { this.couponcode.nativeElement.focus(); }, 50);
  }

  ngOnDestroy() {
    if (this.couponsubscription) { this.couponsubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
  }

  searchCoupon(couponcode: string) {
    this.spinner.show();
    this.couponsubscription = this.payment.searchCoupon(this.accountInfo.uid, this.accountInfo.parties[0].uid, couponcode).subscribe(
      result => {
        if (result) {
          this.coupon = result;
          if (this.finishStatus !== StatusDisplay.PAID) {
            this.applyCoupon();
          }
        } else {
          this.checktype = -1;
          this.apprmessage = '해당 쿠폰이 존재하지 않습니다. 쿠폰번호를 다시 확인해주세요.';
          // this.alert.info({ message: `해당 쿠폰이 존재하지 않습니다. 쿠폰 정보를 다시 확인해주세요.` });
        }
      },
      error => {
        this.spinner.hide();
        // this.alert.info({ message: `해당 쿠폰이 존재하지 않습니다. 쿠폰 정보를 다시 확인해주세요.` });
        this.checktype = -1;
        this.apprmessage = '해당 쿠폰이 존재하지 않습니다. 쿠폰번호를 다시 확인해주세요.';
        this.logger.set('coupon.component', `${error}`).error();
      },
      () => { this.spinner.hide(); });
  }

  couponDone() {
    if (this.finishStatus === StatusDisplay.PAID) {
      this.makePaymentCaptureAndApply();
    }
  }

  private applyCoupon() {
    if (this.coupon) {
      this.paymentsubscription = this.payment.applyCoupon(this.accountInfo.parties[0].uid, this.cartInfo.code, this.coupon.couponCode).subscribe(
        result => {
          if (result) {
            this.logger.set('coupon.payment.component', JSON.stringify(result, null, 2)).debug();
            this.finishStatus = StatusDisplay.PAID;
            this.apprmessage = '쿠폰결제에 성공하였습니다.';
            this.changeamount = this.cartInfo.totalPrice.value - result.totalDiscounts.value; // 결제금액 - 쿠폰 금액
            this.couponamount = result.totalDiscounts.value; // 쿠폰 금액
            setTimeout(() => {
              this.couponcode.nativeElement.blur();
              this.renderer.setAttribute(this.couponcode.nativeElement, 'disabled', 'disabled');
            }, 50);
          } else {
            this.finishStatus = 'fail';
            this.apprmessage = '쿠폰결제에 실패하였습니다.';
            this.logger.set('coupon.payment.component', `no apply or exist cart`).error();
          }
        },
        error => {
          this.finishStatus = 'fail';
          this.spinner.hide();
          const errdata = Utils.getError(error);
          if (errdata) {
            this.apprmessage = this.message.get(errdata.message);
          }
        },
        () => { this.spinner.hide(); });
    }
  }

  private makePaymentCaptureAndApply(): void {
    let pcap: PaymentCapture;
    const coupon = new VoucherPaymentInfo(this.couponamount);
    coupon.setName = (this.coupon) ? this.coupon.name : '';
    coupon.setPaymentModeData = new PaymentModeData(PaymentModes.COUPON);
    coupon.setCurrencyData = new CurrencyData();
    pcap = new PaymentCapture();
    pcap.setVoucherPaymentInfo = coupon;
    this.paymentcapture = pcap;
    this.sendPaymentAndOrder(pcap, null);
    this.openComplexPayment(this.paymentcapture);
  }

  /**
 * 장바구니와 클라이언트에 정보 전달, 복합결제 창에 전달
 *
 * @param payment Payment Capture 정보
 * @param order Order 정보
 */
  private sendPaymentAndOrder(payment: PaymentCapture, order: Order) {
    this.info.sendInfo('payinfo', [payment, order]);
    this.storage.setLocalItem('payinfo', [payment, order]);
  }

  openComplexPayment(pc?: PaymentCapture) {
    this.close();
    this.modal.openModalByComponent(ComplexPaymentComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, paymentCapture: pc },
        closeByClickOutside: false,
        closeByEnter: false,
        closeByEscape: false,
        modalId: 'ComplexPaymentComponent_Cpm'
      }
    ).subscribe(result => {
      if (!result) {
        this.storage.removePaymentModeCode();
        this.storage.removePay();
      }
    });
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onCouponPaymentDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        this.couponDone();
      }
    }
  }

}
