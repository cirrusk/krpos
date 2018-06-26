import { VoucherPaymentInfo, PaymentModeData, CurrencyData } from './../../../../data/models/payment/payment-capture';

import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';

import { ModalComponent, ModalService, Modal } from '../../../../core';
import { Subscription } from 'rxjs/Subscription';

import { CouponPaymentComponent } from '../../coupon-payment/coupon-payment.component';
import { Accounts, OrderEntry, KeyCode, CouponList, Coupon, PaymentCapture, PaymentModes } from '../../../../data';
import { ComplexPaymentComponent } from '../../complex-payment/complex-payment.component';
import { PaymentService } from '../../../../service';

@Component({
  selector: 'pos-coupon',
  templateUrl: './coupon.component.html'
})
export class CouponComponent extends ModalComponent implements OnInit, OnDestroy {
  accountInfo: Accounts;
  private cartList: Array<OrderEntry>;
  private couponubscription: Subscription;
  private coupon: Coupon;
  couponlist: Coupon[];
  activeNum: number;
  couponCount: number;
  constructor(protected modalService: ModalService, private modal: Modal, private payment: PaymentService) {
    super(modalService);
    this.couponCount = 0;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartList = this.callerData.cartList;
    this.couponubscription = this.payment.searchCoupon(this.accountInfo.uid, this.accountInfo.parties[0].uid).subscribe(result => {
      this.couponlist = result.coupons;
      this.couponCount = this.couponlist.length;
    });
  }

  ngOnDestroy() {
    if (this.couponubscription) { this.couponubscription.unsubscribe(); }
  }

  selectCoupon(evt: any) {
    this.modal.openModalByComponent(CouponPaymentComponent,
      {
        closeByClickOutside: false,
        modalId: 'CouponPayComponent'
      }
    );
  }

  paymentCoupon() {
    this.close();
    this.modal.openModalByComponent(CouponPaymentComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartList: this.cartList, coupon: this.coupon },
        closeByClickOutside: false,
        closeByEnter: false,
        modalId: 'CouponPaymentComponent_Pop'
      }
    );
  }

  openComplexPayment() {
    this.close();
    this.modal.openModalByComponent(ComplexPaymentComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartList: this.cartList },
        closeByClickOutside: false,
        closeByEnter: false,
        closeByEscape: false,
        modalId: 'ComplexPaymentComponent_Pop'
      }
    );
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const coupon = new VoucherPaymentInfo(paidamount);
    coupon.setPaymentModeData = new PaymentModeData(PaymentModes.COUPON);
    coupon.setCurrencyData = new CurrencyData();
    const paymentcapture = new PaymentCapture();
    paymentcapture.setVoucherPaymentInfo = coupon;
    return paymentcapture;
  }

  activeRow(index: number, coupon: Coupon) {
    this.activeNum = index;
    this.coupon = coupon;
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onAlertKeyDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ESCAPE) { // 27 : esc
      this.openComplexPayment();
    }
  }

}
