import { Component, OnInit } from '@angular/core';

import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { AlertService } from '../../../core/alert/alert.service';
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
