import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ModalComponent, ModalService, AlertService, Logger, SpinnerService, CardCancelResult, NicePaymentService, ICCardCancelResult, PrinterService } from '../../../core';
import { OrderHistory, PaymentDetails, AmwayPaymentInfoData, PaymentModes } from '../../../data';
import { OrderService, ReceiptService, MessageService, PaymentService } from '../../../service';
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
    private payment: PaymentService,
    private nicepay: NicePaymentService,
    private printer: PrinterService,
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
   * 신용카드, 현금IC카드가 포함되어 있을 경우
   * 해당 카드 결제 취소를 먼저 수행해야함.
   * 변경(2018.08.23)
   * 주문 취소 시 카드의 경우 무카드 취소 이므로 Hybris 내부적으로
   * 거래 일련번호로 취소됨.
   * 현금 IC 카드의 경우는 반드시 카드를 단말에 꼽은 후 처리해야함.
   */
  cancelOrder() {
    const userId = this.orderInfo.user.uid;
    const orderCodes = new Array<string>();
    orderCodes.push(this.orderInfo.code);
    this.orderDetailsSubscription = this.orderService.orderDetails(userId, orderCodes).subscribe(
      orderDetail => {
        if (orderDetail) {
          this.orderList = orderDetail;
          const paymentdetails: PaymentDetails = this.orderList.orders[0].paymentDetails;
          let amount;
          let approvalNumber: string;
          let approvalDate: string;
          let paymentType: string;
          const paymentinfos: AmwayPaymentInfoData[] = paymentdetails.paymentInfos.filter(
            paymentinfo => (paymentinfo.paymentMode.code === PaymentModes.ICCARD)
          );
          paymentinfos.forEach(paymentinfo => {
            if (paymentinfo.paymentMode.code === PaymentModes.ICCARD) {
              amount = paymentinfo.amount;
              approvalNumber = paymentinfo.paymentInfoLine4; // 승인번호
              approvalDate = Utils.convertDateToString(new Date(), 'YYYYMMDDHHmmss');
              paymentType = paymentinfo.paymentMode.code;
            }
          });
          if (paymentType === PaymentModes.ICCARD) {
            this.doIcCardCancel(amount, approvalNumber, approvalDate);
          } else {
            this.doOrderCancel();
          }
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cancel-order.component', `Get Order Detail error message : ${errdata.message}`).error();
          this.alert.error({ message: this.messageService.get('server.error', errdata.message) });
        }
      });
  }

  private doOrderCancel() {
    const accountuid = this.orderInfo.amwayAccount.uid;
    const useruid = this.orderInfo.user.uid;
    const ordercode = this.orderInfo.code;
    this.cancelOrderSubscription = this.orderService.orderCancel(accountuid, useruid, ordercode).subscribe(
      cancelData => {
        if (cancelData) {
          // 현금이 있을 경우 돈통 열림
          const paymentdetails: PaymentDetails = this.orderList.orders[0].paymentDetails;
          const paymentinfos: AmwayPaymentInfoData[] = paymentdetails.paymentInfos.filter(
            paymentinfo => (paymentinfo.paymentMode.code === PaymentModes.CASH)
          );
          paymentinfos.forEach(paymentinfo => {
            if (paymentinfo.paymentMode.code === PaymentModes.CASH) {
              const amount = paymentinfo.amount;
              if (amount > 0) {
                this.printer.openCashDrawer(); // cash drawer open
                // cash drawer open logging
                this.payment.cashDrawerLogging().subscribe(
                  result => {
                    this.logger.set('cancel.order.component', `${result.returnMessage}`).debug();
                  },
                  error => {
                    const errdata = Utils.getError(error);
                    if (errdata) {
                      this.logger.set('cancel.order.component', `${errdata.message}`).error();
                    }
                  });
              }
            }
          });
          this.cancelReceipts();
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cancel-order.component', `cancel order error message : ${errdata.message}`).error();
          if (errdata.type === 'OrderCancelDeniedError') {
            this.alert.error({ message: this.messageService.get('server.error', errdata.type) });
          } else {
            this.alert.error({ message: this.messageService.get('server.error', errdata.message) });
          }
        }
      });
  }

  /**
   * 취소 영수증 출력
   *
   * @param {string} userId 회원 아이디
   * @param {string} orderCode 주문 코드
   */
  private cancelReceipts() {
    this.receiptService.reissueReceipts(this.orderList, true).subscribe(
      () => {
        this.cancelFlag = true;
        this.alert.info({
          title: '취소 영수증 발행',
          message: this.messageService.get('cancelReceiptComplete'),
          timer: true,
          interval: 1200
        });
      },
      error => {
        this.cancelFlag = false;
        this.logger.set('cancel-order.component', `Reissue Receipts error type : ${error}`).error();
        this.alert.error({
          title: '취소 영수증 발행',
          message: this.messageService.get('cancelReceiptFail'),
          timer: true,
          interval: 1000
        });
      },
    () => {
      setTimeout(() => { this.close(); }, 1500);
    });
  }

  /**
   * 현금IC카드 결제 취소
   * 당일건에 한해서만 취소가 가능함.
   *
   * @param payprice 결제금액
   * @param approvalNumber 승인번호
   * @param approvalDateTime 승인일시
   */
  private doIcCardCancel(payprice: number, approvalNumber: string, approvalDateTime?: string) {
    this.spinner.show();
    const apprdate = approvalDateTime ? approvalDateTime.substring(2, 8) : '';
    const resultNotifier: Subject<ICCardCancelResult> = this.nicepay.icCardCancel(String(payprice), approvalNumber, apprdate);
    resultNotifier.subscribe(
      (res: ICCardCancelResult) => {
        if (res.approved) {
          this.logger.set('cancel.order.component', 'ic card cancel success').debug();
          this.doOrderCancel();
          this.spinner.hide();
        } else {
          this.logger.set('cancel.order.component', `ic card cancel error : ${res.resultMsg1} ${res.resultMsg2}`).error();
          this.spinner.hide();
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
