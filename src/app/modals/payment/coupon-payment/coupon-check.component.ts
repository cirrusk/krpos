import { Component, OnInit, HostListener } from '@angular/core';

import { ModalComponent, ModalService, Modal } from '../../../core';
import { ComplexPaymentComponent } from '../complex-payment/complex-payment.component';
import { CouponComponent } from '../ways/coupon/coupon.component';
import { Accounts, OrderEntry, KeyCode } from '../../../data';

@Component({
  selector: 'pos-coupon-check',
  templateUrl: './coupon-check.component.html'
})
export class CouponCheckComponent extends ModalComponent implements OnInit {
  private account: Accounts;
  private cartList: Array<OrderEntry>;
  constructor(protected modalService: ModalService, private modal: Modal) {
    super(modalService);
  }

  ngOnInit() {
    this.account = this.callerData.accountInfo;
    this.cartList = this.callerData.cartList;
  }

  includeCoupon() {
    this.close();
    this.modal.openModalByComponent(CouponComponent,
      {
        callerData: { accountInfo: this.account, cartList: this.cartList },
        closeByClickOutside: false,
        closeByEnter: false,
        closeByEscape: false,
        modalId: 'CouponComponent'
      }
    );
  }

  excludeCoupon() {
    this.close();
    this.modal.openModalByComponent(ComplexPaymentComponent,
      {
        callerData: { accountInfo: this.account, cartList: this.cartList },
        closeByClickOutside: false,
        closeByEnter: false,
        closeByEscape: false,
        modalId: 'ComplexPaymentComponent_Coupon'
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
      this.excludeCoupon();
    }
  }

}
