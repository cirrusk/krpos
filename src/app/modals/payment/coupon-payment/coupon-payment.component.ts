import { Component, OnInit } from '@angular/core';

import { ModalComponent, ModalService, Modal } from '../../../core';
import { ComplexPaymentComponent } from '../complex-payment/complex-payment.component';
import { Accounts, OrderEntry } from '../../../data';

@Component({
  selector: 'pos-coupon-payment',
  templateUrl: './coupon-payment.component.html'
})
export class CouponPaymentComponent extends ModalComponent implements OnInit {
  private account: Accounts;
  private cartList: Array<OrderEntry>;
  constructor(protected modalService: ModalService, private modal: Modal) {
    super(modalService);
  }

  ngOnInit() {
    this.account = this.callerData.accountInfo;
    this.cartList = this.callerData.cartList;
  }

  openComplexPayment() {
    this.close();
    this.modal.openModalByComponent(ComplexPaymentComponent,
      {
        callerData: { accountInfo: this.account, cartList: this.cartList },
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
