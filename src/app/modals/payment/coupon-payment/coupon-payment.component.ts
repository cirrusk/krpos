import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, Modal, SpinnerService, Logger, StorageService, AlertService } from '../../../core';
import { ComplexPaymentComponent } from '../complex-payment/complex-payment.component';
import { Accounts, Coupon, PaymentCapture, VoucherPaymentInfo, PaymentModeData, PaymentModes, CurrencyData } from '../../../data';
import { Cart } from '../../../data/models/order/cart';
import { InfoBroker } from '../../../broker';
import { PaymentService } from '../../../service';
import { Order } from '../../../data/models/order/order';

@Component({
  selector: 'pos-coupon-payment',
  templateUrl: './coupon-payment.component.html'
})
export class CouponPaymentComponent extends ModalComponent implements OnInit, OnDestroy {
  private accountInfo: Accounts;
  private cartInfo: Cart;
  private coupon: Coupon;
  paidamount: number;
  isAllPay: boolean;
  changeamount: number; // 결제금액 - 쿠폰 금액
  couponamount: number; // 쿠폰 금액
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  private paymentsubscription: Subscription;
  private couponsubscription: Subscription;
  @ViewChild('couponcode') private couponcode: ElementRef;
  constructor(protected modalService: ModalService, private modal: Modal, private spinner: SpinnerService,
    private info: InfoBroker, private payment: PaymentService,
    private storage: StorageService, private logger: Logger, private alert: AlertService) {
    super(modalService);
    this.isAllPay = true;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.coupon = this.callerData.coupon;
    this.paidamount = this.cartInfo.totalPrice.value;
    console.log('coupon ---> ' + JSON.stringify(this.coupon));
    if (this.coupon) {
      this.couponcode.nativeElement.value = this.coupon.couponCode;
    }
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
          if (result.coupons && result.coupons.length > 0) {
            this.coupon = result.coupons[0];
          }
        } else {
          this.alert.info({ message: `해당 쿠폰이 존재하지 않습니다. 쿠폰 정보를 다시 확인해주세요.` });
        }
      },
      error => {
        this.spinner.hide();
        this.alert.info({ message: `해당 쿠폰이 존재하지 않습니다. 쿠폰 정보를 다시 확인해주세요.` });
        this.logger.set('coupon.component', `${error}`).error();
      },
      () => { this.spinner.hide(); });
  }

  applyCoupon() {
    if (this.coupon) {
      this.makePaymentCaptureData();
    }
  }

  private makePaymentCaptureData(): void {
    let pcap: PaymentCapture;
    this.paymentsubscription = this.payment.applyCoupon(this.accountInfo.parties[0].uid, this.cartInfo.code, this.coupon.couponCode).subscribe(
      result => {
        if (result) {
          this.logger.set('coupon.payment.component', JSON.stringify(result, null, 2)).debug();

          this.changeamount = this.cartInfo.totalPrice.value - result.totalDiscounts.value; // 결제금액 - 쿠폰 금액
          this.couponamount = result.totalDiscounts.value; // 쿠폰 금액
          const paidamount = result.totalDiscounts.value;
          const coupon = new VoucherPaymentInfo(paidamount);
          coupon.setName = (this.coupon) ? this.coupon.name : '';
          coupon.setPaymentModeData = new PaymentModeData(PaymentModes.COUPON);
          coupon.setCurrencyData = new CurrencyData();
          pcap = new PaymentCapture();
          pcap.setVoucherPaymentInfo = coupon;

          this.paymentcapture = pcap;

          // this.info.sendInfo('payinfo', [pcap, null]);
          this.sendPaymentAndOrder(pcap, null);

          this.openComplexPayment(this.paymentcapture);
        } else {
          this.logger.set('coupon.payment.component', `no apply or exist cart`).error();
        }
      },
      error => {
        this.logger.set('coupon.payment.component', `${error}`).error();
        this.alert.error({ message: `쿠폰 결제가 실패 했습니다. 쿠폰 정보를 다시 확인해주세요.` });
      });
  }

  /**
 * 장바구니와 클라이언트에 정보 전달, 복합결제 창에 전달
 *
 * @param payment Payment Capture 정보
 * @param order Order 정보
 */
  private sendPaymentAndOrder(payment: PaymentCapture, order: Order) {
    this.info.sendInfo('payinfo', [payment, order]);
    // this.info.sendInfo('coupon', payment);
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
        modalId: 'ComplexPaymentComponent_Ck'
      }
    );
  }

  close() {
    this.closeModal();
  }
}
