import { Component, OnInit } from '@angular/core';

import { ModalComponent, ModalService, AlertService } from '../../../core';

@Component({
  selector: 'pos-cancel-order',
  templateUrl: './cancel-order.component.html'
})
export class CancelOrderComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService,
              private alert: AlertService) {
    super(modalService);
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }
}
