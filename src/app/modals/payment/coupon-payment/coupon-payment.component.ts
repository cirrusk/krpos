import { Component, OnInit } from '@angular/core';

import { ModalComponent, ModalService, Modal } from '../../../core';
import { ComplexPaymentComponent } from '../complex-payment/complex-payment.component';
import { Accounts, OrderEntry, Coupon } from '../../../data';
import { Cart } from '../../../data/models/order/cart';

@Component({
  selector: 'pos-coupon-payment',
  templateUrl: './coupon-payment.component.html'
})
export class CouponPaymentComponent extends ModalComponent implements OnInit {
  private accountInfo: Accounts;
  private cartInfo: Cart;
  private coupon: Coupon;
  constructor(protected modalService: ModalService, private modal: Modal) {
    super(modalService);
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.coupon = this.callerData.coupon;
    console.log('coupon ---> ' + this.coupon);
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
