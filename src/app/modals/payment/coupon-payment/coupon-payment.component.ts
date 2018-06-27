import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ModalComponent, ModalService, Modal } from '../../../core';
import { ComplexPaymentComponent } from '../complex-payment/complex-payment.component';
import { Accounts, Coupon } from '../../../data';
import { Cart } from '../../../data/models/order/cart';

@Component({
  selector: 'pos-coupon-payment',
  templateUrl: './coupon-payment.component.html'
})
export class CouponPaymentComponent extends ModalComponent implements OnInit {
  private accountInfo: Accounts;
  private cartInfo: Cart;
  private coupon: Coupon;
  paidamount: number;
  @ViewChild('couponcode') private couponcode: ElementRef;
  constructor(protected modalService: ModalService, private modal: Modal) {
    super(modalService);
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

  openComplexPayment() {
    this.close();
    this.modal.openModalByComponent(ComplexPaymentComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        closeByEnter: false,
        closeByEscape: false,
        modalId: 'ComplexPaymentComponent_Pop'
      }
    );
  }

  close() {
    this.closeModal();
  }
}
