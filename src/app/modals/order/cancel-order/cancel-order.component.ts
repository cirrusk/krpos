import { Component, OnInit, OnDestroy } from '@angular/core';

import { ModalComponent, ModalService, AlertService, SpinnerService, Logger } from '../../../core';
import { OrderHistory } from '../../../data';
import { OrderService, ReceiptService, MessageService } from '../../../service';
import { Subscription } from 'rxjs/Subscription';
import { Utils } from '../../../core/utils';
import { OrderList } from '../../../data/models/order/order';

/**
 * 주문 취소 화면
 */
@Component({
  selector: 'pos-cancel-order',
  templateUrl: './cancel-order.component.html'
})
export class CancelOrderComponent extends ModalComponent implements OnInit, OnDestroy {
  private cancelOrderSubscription: Subscription;
  private orderDetailsSubscription: Subscription;

  orderInfo: OrderHistory;
  orderList: OrderList;
  cancelFlag: boolean;

  constructor(protected modalService: ModalService,
    private orderService: OrderService,
    private spinner: SpinnerService,
    private receiptService: ReceiptService,
    private messageService: MessageService,
    private logger: Logger,
    private alert: AlertService) {
    super(modalService);
    this.cancelFlag = false;
  }

  ngOnInit() {
    this.orderInfo = this.callerData.orderInfo;
  }

  ngOnDestroy() {
    if (this.cancelOrderSubscription) { this.cancelOrderSubscription.unsubscribe(); }
    if (this.orderDetailsSubscription) { this.orderDetailsSubscription.unsubscribe(); }
    this.receiptService.dispose();
  }

  /**
   * 취소 요청
   */
  cancelOrder() {
    this.spinner.show();
    this.cancelOrderSubscription = this.orderService.orderCancel(this.orderInfo.amwayAccount.uid, this.orderInfo.user.uid, this.orderInfo.code).subscribe(
      cancelData => {
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

  /**
   * 취소 영수증 출력
   *
   * @param userId 회원 아이디
   * @param orderCode 주문 코드
   */
  cancelReceipts(userId: string, orderCode: string) {
    const orderCodes = new Array<string>();
    orderCodes.push(orderCode);
    this.spinner.show();
    this.orderDetailsSubscription = this.orderService.orderDetails(userId, orderCodes).subscribe(
      orderDetail => {
        if (orderDetail) {
          try {
            this.orderList = orderDetail;
            this.receiptService.reissueReceipts(orderDetail, true);
            this.cancelFlag = true;
            this.alert.info({
              title: '취소 영수증 발행',
              message: this.messageService.get('cancelReceiptComplete'),
              timer: true,
              interval: 1000
            });
            this.close();
          } catch (e) {
            this.cancelFlag = false;
            this.logger.set('cancel-order.component', `Reissue Receipts error type : ${e}`).error();
            this.alert.error({
              title: '취소 영수증 발행',
              message: this.messageService.get('cancelReceiptFail'),
              timer: true,
              interval: 1000
            });

          }
        }
      },
      error => {
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cancel-order.component', `Get Order Detail error type : ${errdata.type}`).error();
          this.logger.set('cancel-order.component', `Get Order Detail error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  close() {
    this.result = this.cancelFlag;
    this.closeModal();
  }
}
