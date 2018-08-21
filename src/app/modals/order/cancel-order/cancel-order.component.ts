import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ModalComponent, ModalService, AlertService, Logger, SpinnerService, CardCancelResult, NicePaymentService, ICCardCancelResult } from '../../../core';
import { OrderHistory, PaymentDetails, AmwayPaymentInfoData, PaymentModes } from '../../../data';
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
   * 신용카드, 현금IC카드가 포함되어 있을 경우
   * 해당 카드 결제 취소를 먼저 수행해야함.
   */
  cancelOrder() {
    // 신용카드 취소인 경우
    // 현금IC카드 취소인 경우
    const userId = this.orderInfo.user.uid;
    const orderCodes = new Array<string>();
    orderCodes.push(this.orderInfo.code);
    this.orderDetailsSubscription = this.orderService.orderDetails(userId, orderCodes).subscribe(
      orderDetail => {
        if (orderDetail) {
          this.orderList = orderDetail;
          const paymentdetails: PaymentDetails = this.orderList.orders[0].paymentDetails;
          // 신용카드
          // 현금IC카드
          let amount;
          let installment: string;
          let approvalNumber: string;
          let approvalDate: string;
          let paymentType: string;
          const paymentinfos: AmwayPaymentInfoData[] = paymentdetails.paymentInfos.filter(
            paymentinfo => (paymentinfo.paymentMode.code === PaymentModes.CREDITCARD || paymentinfo.paymentMode.code === PaymentModes.ICCARD)
          );
          paymentinfos.forEach(paymentinfo => {
            console.log('======== ' + paymentinfo.paymentMode.code);
            console.log('credit card : ' + PaymentModes.CREDITCARD);
            console.log('ic card : ' + PaymentModes.ICCARD);
            if (paymentinfo.paymentMode.code === PaymentModes.CREDITCARD
              || paymentinfo.paymentMode.code === PaymentModes.ICCARD) {
              amount = paymentinfo.amount;
              installment = paymentinfo.paymentInfoLine3; // 할부
              approvalNumber = paymentinfo.paymentInfoLine4; // 승인번호
              approvalDate = Utils.convertDateToString(new Date(), 'YYYYMMDDHHmmss');
              paymentType = paymentinfo.paymentMode.code;
              console.log('amount : ' + amount);
              console.log('installment : ' + installment);
              console.log('approvalnumber : ' + approvalNumber);
              console.log('paymentType : ' + paymentType);
            }
          });
          if (paymentType === PaymentModes.CREDITCARD) {
            this.doCreditCardCancel(amount, approvalNumber, approvalDate, installment);
          } else if (paymentType === PaymentModes.ICCARD) {
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
        setTimeout(() => { this.close(); }, 1000);
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
  private doCreditCardCancel(payprice: number, approvalNumber: string, approvalDateTime?: string, installment = '0') {
    this.spinner.show();
    const apprdate = approvalDateTime ? approvalDateTime.substring(2, 8) : '';
    const resultNotifier: Subject<CardCancelResult> = this.nicepay.cardCancel(String(payprice), approvalNumber, apprdate, installment);
    resultNotifier.subscribe(
      (res: CardCancelResult) => {
        if (res.approved) {
          this.logger.set('cancel.order.component', 'credit card cancel success').debug();
          this.doOrderCancel();
        } else {
          this.logger.set('cancel.order.component', `credit card cancel error : ${res.resultMsg1} ${res.resultMsg2}`).error();
          this.spinner.hide();
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
  private doIcCardCancel(payprice: number, approvalNumber: string, approvalDateTime?: string) {
    this.spinner.show();
    const apprdate = approvalDateTime ? approvalDateTime.substring(2, 8) : '';
    const resultNotifier: Subject<ICCardCancelResult> = this.nicepay.icCardCancel(String(payprice), approvalNumber, apprdate);
    resultNotifier.subscribe(
      (res: ICCardCancelResult) => {
        if (res.approved) {
          this.logger.set('cancel.order.component', 'ic card cancel success').debug();
          this.doOrderCancel();
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
