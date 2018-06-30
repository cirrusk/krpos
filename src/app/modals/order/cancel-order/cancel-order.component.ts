import { Component, OnInit, OnDestroy } from '@angular/core';

import { ModalComponent, ModalService, AlertService, SpinnerService, Logger } from '../../../core';
import { OrderHistory } from '../../../data';
import { OrderService, ReceiptService, MessageService } from '../../../service';
import { Subscription } from 'rxjs/Subscription';
import { Utils } from '../../../core/utils';

@Component({
  selector: 'pos-cancel-order',
  templateUrl: './cancel-order.component.html'
})
export class CancelOrderComponent extends ModalComponent implements OnInit, OnDestroy {
  private cancelOrderSubscription: Subscription;

  orderInfo: OrderHistory;

  constructor(protected modalService: ModalService,
              private orderService: OrderService,
              private spinner: SpinnerService,
              private receiptService: ReceiptService,
              private messageService: MessageService,
              private logger: Logger,
              private alert: AlertService) {
    super(modalService);
  }

  ngOnInit() {
    this.orderInfo = this.callerData.orderInfo;
  }

  ngOnDestroy() {
    if (this.cancelOrderSubscription) { this.cancelOrderSubscription.unsubscribe(); }
  }

  cancelOrder() {
    this.spinner.show();
    this.cancelOrderSubscription = this.orderService.orderCancel(this.orderInfo.amwayAccount.uid, this.orderInfo.user.uid, this.orderInfo.code).subscribe(
      cancelData => {
        this.logger.set('cancelOrder', '성공').debug();
        if (cancelData) {
          this.cancelReceipts(this.orderInfo.user.uid, this.orderInfo.code);
        }
      },
      error => {
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cancel-order.component', `cancel order error type : ${errdata.type}`).error();
          this.logger.set('cancel-order.component', `cancel order error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  cancelReceipts(userId: string, orderCode: string) {
    const orderCodes = new Array<string>();
    orderCodes.push(orderCode);
    this.spinner.show();
    this.orderService.orderDetails(userId, orderCodes).subscribe(
      orderDetail => {
        if (orderDetail) {
          try {
            this.receiptService.reissueReceipts(orderDetail, true);
            this.alert.info({ title: '취소 영수증 발행', message: this.messageService.get('cancelReceiptComplete') });
          } catch (e) {
            this.logger.set('cancel-order.component', `Reissue Receipts error type : ${e}`).error();
            this.alert.error({ title: '취소 영수증 발행', message: this.messageService.get('cancelReceiptFail') });
          }
        }
      },
      error => {
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('order-complete.component', `Get Order Detail error type : ${errdata.type}`).error();
          this.logger.set('order-complete.component', `Get Order Detail error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  close() {
    this.closeModal();
  }
}
