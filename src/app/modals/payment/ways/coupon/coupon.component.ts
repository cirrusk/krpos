
import { Component, OnInit, HostListener } from '@angular/core';

import { ModalComponent, ModalService, Modal } from '../../../../core';
import { CouponPaymentComponent } from '../../coupon-payment/coupon-payment.component';
import { Accounts, OrderEntry, KeyCode } from '../../../../data';
import { ComplexPaymentComponent } from '../../complex-payment/complex-payment.component';

@Component({
  selector: 'pos-coupon',
  templateUrl: './coupon.component.html'
})
export class CouponComponent extends ModalComponent implements OnInit {
  private account: Accounts;
  private cartList: Array<OrderEntry>;
  constructor(protected modalService: ModalService, private modal: Modal) {
    super(modalService);
  }

  ngOnInit() {
    this.account = this.callerData.accountInfo;
    this.cartList = this.callerData.cartList;
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
        callerData: { accountInfo: this.account, cartList: this.cartList },
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

  @HostListener('document:keydown', ['$event'])
  onAlertKeyDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ESCAPE) { // 27 : esc
      this.openComplexPayment();
    }
  }

}
