import { Component, OnInit } from '@angular/core';

import { ModalComponent, ModalService, Modal } from '../../../core';

@Component({
  selector: 'pos-coupon-payment',
  templateUrl: './coupon-payment.component.html'
})
export class CouponPaymentComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }
}
