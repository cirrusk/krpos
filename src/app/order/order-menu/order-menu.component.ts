import { Component, OnInit } from '@angular/core';
import { Modal } from '../../service/pos';
import { NormalPaymentComponent } from '../../modals/payment/normal-payment/normal-payment.component';

@Component({
  selector: 'pos-order-menu',
  templateUrl: './order-menu.component.html'
})
export class OrderMenuComponent implements OnInit {

  constructor(private modal: Modal) { }

  ngOnInit() {
  }

  normalPayment() {
    this.modal.openModalByComponent(NormalPaymentComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByEnter: false,
        closeByEscape: true,
        closeByClickOutside: false,
        closeAllDialogs: false
      }
    );
  }
}
