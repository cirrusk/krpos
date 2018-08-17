import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ModalComponent, ModalService, AlertService, Logger, SpinnerService, CardCancelResult, NicePaymentService, ICCardCancelResult } from '../../../core';
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
    private receiptService: ReceiptService,
    private messageService: MessageService,
    private nicepay: NicePaymentService,
    private spinner: SpinnerService,
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
   * 주문 취소 요청
   */
  cancelOrder() {
    this.cancelOrderSubscription = this.orderService.orderCancel(this.orderInfo.amwayAccount.uid,
      this.orderInfo.user.uid,
      this.orderInfo.code).subscribe(
        cancelData => {
          if (cancelData) {
            this.cancelReceipts(this.orderInfo.user.uid, this.orderInfo.code);
          }
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.set('cancel-order.component', `cancel order error message : ${errdata.message}`).error();
            this.alert.error({ message: this.messageService.get('server.error') });
          }
        });
  }

  /**
   * 취소 영수증 출력
   *
   * @param {string} userId 회원 아이디
   * @param {string} orderCode 주문 코드
   */
  cancelReceipts(userId: string, orderCode: string) {
    const orderCodes = new Array<string>();
    orderCodes.push(orderCode);
    this.orderDetailsSubscription = this.orderService.orderDetails(userId, orderCodes).subscribe(
      orderDetail => {
        if (orderDetail) {
          try {
            this.orderList = orderDetail;
            this.receiptService.reissueReceipts(orderDetail, true).subscribe(
              () => {
                this.cancelFlag = true;
                setTimeout(() => { this.close(); }, 1000);
                this.alert.info({
                  title: '취소 영수증 발행',
                  message: this.messageService.get('cancelReceiptComplete'),
                  timer: true,
                  interval: 1200
                });

              });
            // this.receiptService.reissueReceipts(orderDetail, true);
            // this.cancelFlag = true;
            // this.alert.info({
            //   title: '취소 영수증 발행',
            //   message: this.messageService.get('cancelReceiptComplete'),
            //   timer: true,
            //   interval: 1000
            // });
            // this.close();
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
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cancel-order.component', `Get Order Detail error message : ${errdata.message}`).error();
          this.alert.error({ message: this.messageService.get('server.error') });
        }
      });
  }

  /**
   * 신용카드 결제 취소
   *
   * @param payprice 결제금액
   * @param approvalNumber 승인번호
   * @param approvalDateTime 승인일시
   * @param installment 할부개월수
   */
  creditCardCancel(payprice: number, approvalNumber: string, approvalDateTime?: string, installment = 0) {
    this.spinner.show();
    const apprdate = approvalDateTime ? approvalDateTime.substring(0, 6) : '';
    const resultNotifier: Subject<CardCancelResult> = this.nicepay.cardCancel(String(payprice), approvalNumber, apprdate, String(installment));
    resultNotifier.subscribe(
      (res: CardCancelResult) => {
        if (res.approved) {
          this.logger.set('cancel.order.component', 'credit card cancel success').debug();
        } else {
          this.logger.set('cancel.order.component', `credit card cancel error : ${res.resultMsg1}, ${res.resultMsg2}`).error();
        }
      },
      error => {
        this.spinner.hide();
        this.logger.set('credit.card.component', `${error}`).error();
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 현금IC카드 결제 취소
   *
   * @param payprice 결제금액
   * @param approvalNumber 승인번호
   * @param approvalDateTime 승인일시
   */
  icCardCancel(payprice: number, approvalNumber: string, approvalDateTime?: string) {
    this.spinner.show();
    const apprdate = approvalDateTime ? approvalDateTime.substring(0, 6) : '';
    const resultNotifier: Subject<ICCardCancelResult> = this.nicepay.icCardCancel(String(payprice), approvalNumber, apprdate);
    resultNotifier.subscribe(
      (res: ICCardCancelResult) => {
        if (res.approved) {
          this.logger.set('cancel.order.component', 'ic card cancel success').debug();
        } else {
          this.logger.set('cancel.order.component', `ic card cancel error : ${res.resultMsg1}, ${res.resultMsg2}`).error();
        }
      },
      error => {
        this.spinner.hide();
        this.logger.set('ic.card.component', `${error}`).error();
      },
      () => { this.spinner.hide(); }
    );
  }

  close() {
    this.result = { 'cancelFlag': this.cancelFlag, 'data': this.orderList };
    this.closeModal();
  }
}
