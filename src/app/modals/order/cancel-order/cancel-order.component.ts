import { Component, OnInit } from '@angular/core';

import { ModalComponent, ModalService, AlertService } from '../../../core';
import { CancleOrderBroker } from '../../../broker/order/cart/cancle-order.broker';

@Component({
  selector: 'pos-cancel-order',
  templateUrl: './cancel-order.component.html'
})
export class CancelOrderComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService,
              private alert: AlertService,
              private cancleOrderBroker: CancleOrderBroker) {
    super(modalService);
  }

  ngOnInit() {
  }

  cancleOrder() {
    this.cancleOrderBroker.sendInfo('delCart');
    this.close();
  }

  close() {
    this.closeModal();
  }
}
