import { Component, OnInit } from '@angular/core';

import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { AlertService } from '../../../core/alert/alert.service';

@Component({
  selector: 'pos-cancel-order',
  templateUrl: './cancel-order.component.html'
})
export class CancelOrderComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService, private alert: AlertService) {
    super(modalService);
  }

  ngOnInit() {
  }

  cancleOrder() {

  }

  close() {
    this.closeModal();
  }
}
