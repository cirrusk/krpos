import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalService, AlertService } from '../../../../core';
import { OrderHistory } from '../../../../data';

@Component({
  selector: 'pos-cancel-ecp-print',
  templateUrl: './cancel-ecp-print.component.html'
})
export class CancelEcpPrintComponent extends ModalComponent implements OnInit {

  orderInfo: OrderHistory;

  constructor(protected modalService: ModalService, private alert: AlertService) {
    super(modalService);
  }

  ngOnInit() {
    this.orderInfo = this.callerData.orderInfo;
  }

  close() {
    this.closeModal();
  }

}
