
import { Component, OnInit } from '@angular/core';

import { ModalComponent, ModalService, Modal } from '../../../../core';
import { CouponPaymentComponent } from '../../coupon-payment/coupon-payment.component';

@Component({
  selector: 'pos-coupon',
  templateUrl: './coupon.component.html'
})
export class CouponComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService, private modal: Modal) {
    super(modalService);
  }

  ngOnInit() {
  }

  selectCoupon(evt: any) {
    this.modal.openModalByComponent(CouponPaymentComponent,
      {
        closeByClickOutside: false,
        modalId: 'CouponPayComponent'
      }
    );
  }

  close() {
    this.closeModal();
  }

}
