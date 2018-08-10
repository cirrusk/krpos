import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalService, AlertService, Logger } from '../../../../core';
import { OrderHistory } from '../../../../data';
import { OrderService, MessageService } from '../../../../service';
import { Utils } from '../../../../core/utils';

@Component({
  selector: 'pos-cancel-ecp-print',
  templateUrl: './cancel-ecp-print.component.html'
})
export class CancelEcpPrintComponent extends ModalComponent implements OnInit {

  orderInfo: OrderHistory;

  constructor(protected modalService: ModalService,
    private orderService: OrderService,
    private message: MessageService,
    private logger: Logger,
    private alert: AlertService) {
    super(modalService);
  }

  ngOnInit() {
    this.orderInfo = this.callerData.orderInfo;
  }

  /**
   * ECP 출력 취소
   */
  cancelEcpPrint() {
    this.orderService.cancelReceipt(this.orderInfo.user.uid, this.orderInfo.code).subscribe(
      result => {
        if (result) {
          this.close();
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cancel-ecp-print.component', `Cancel Ecp Print error type : ${errdata.type}`).error();
          this.logger.set('cancel-ecp-print.component', `Cancel Ecp Print error message : ${errdata.message}`).error();
          this.alert.error({ message: this.message.get('server.error') });
        }
      });
  }

  close() {
    this.closeModal();
  }

}
