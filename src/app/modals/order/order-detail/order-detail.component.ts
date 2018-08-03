import { PaymentService } from './../../../service/payment/payment.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalComponent, ModalService, Modal, StorageService, Logger, AlertService } from '../../../core';
import { OrderService, ReceiptService, MessageService } from '../../../service';
import { Utils } from '../../../core/utils';
import { OrderList } from '../../../data/models/order/order';
import { CancelOrderComponent, CancelEcpPrintComponent } from '../..';
import { OrderHistory, PaymentCapture, Balance, MemberType } from '../../../data';
import { InfoBroker } from '../../../broker';
import { Router } from '@angular/router';

/**
 * 주문 상세 페이지
 */
@Component({
  selector: 'pos-order-detail',
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent extends ModalComponent implements OnInit, OnDestroy {

  orderDetail: OrderList;
  orderInfo: OrderHistory;
  balance: Balance;
  clientId: string;
  emloyeeName: string;
  cancelSymbol: string;
  cancelFlag: boolean;
  groupMainFlag: boolean;
  activeFlag: boolean;
  orderType: string;
  paymentCapture: PaymentCapture;
  ABOFlag: boolean;

  constructor(protected modalService: ModalService,
    private router: Router,
    private orderService: OrderService,
    private receiptService: ReceiptService,
    private paymentService: PaymentService,
    private messageService: MessageService,
    private modal: Modal,
    private storageService: StorageService,
    private logger: Logger,
    private alert: AlertService,
    private info: InfoBroker) {
    super(modalService);
    this.init();
  }

  ngOnInit() {
    this.orderInfo = this.callerData.orderInfo;
    this.getOrderDetail(this.orderInfo.user.uid, this.orderInfo.code);
    this.getBalance(this.orderInfo.user.uid);
    if (this.orderInfo.parentOrder !== '') {
      this.orderType = 'g';
    }
    this.checkCancelStatus(this.orderInfo);
    this.clientId = this.storageService.getClientId();
    this.emloyeeName = this.storageService.getEmloyeeName();
  }

  ngOnDestroy() {
    this.receiptService.dispose();
  }

  init() {
    this.cancelSymbol = '';
    this.cancelFlag = false;
    this.activeFlag = false;
    this.groupMainFlag = true;
    this.orderType = 'n';
    this.paymentCapture = new PaymentCapture();
  }

  /**
   * 주문 취소 활성화 여부 확인
   * @param {OrderHistory} orderInfo 주문정보
   */
  checkCancelStatus(orderInfo: OrderHistory) {
    if (orderInfo.orderStatus.code === 'CANCELLED') {
      this.cancelSymbol = '-';
      this.cancelFlag = true;
    } else {
      this.cancelSymbol = '';
      this.cancelFlag = false;
    }

    if (this.orderInfo.parentOrder !== undefined && this.orderInfo.code !== this.orderInfo.parentOrder) {
      this.groupMainFlag = false;
    }
  }

  /**
   * 주문 취소 팝업
   */
  popupCancel() {
    this.modal.openModalByComponent(CancelOrderComponent, {
      callerData: { orderInfo: this.orderInfo },
      closeByClickOutside: false,
      closeByEnter: false,
      closeByEscape: false,
      modalId: 'CancelOrderComponent'
    }
    ).subscribe(result => {
      if (result.cancelFlag) {
        this.cancelSymbol = '-';
        this.cancelFlag = true;
        this.activeFlag = true;
        this.result = this.activeFlag;
        this.getOrderDetail(this.orderInfo.user.uid, this.orderInfo.code);
        this.getBalance(this.orderInfo.user.uid);
      }
    });
  }

  /**
   * 결제수단변경/재결제
   */
  paymentChange() {
    this.modal.openModalByComponent(CancelOrderComponent, {
      callerData: { orderInfo: this.orderInfo },
      closeByClickOutside: false,
      closeByEnter: false,
      closeByEscape: false,
      modalId: 'CancelOrderComponent'
    }
    ).subscribe(
      result => {
        if (result.cancelFlag) {
          // 재결제 추가
          this.info.sendInfo('paymentChange', result.data);
          this.goOrder();
          this.close();
        }
      });
  }

  /**
   * ECP 출력 취소
   */
  cancelECPPrint() {
    this.modal.openModalByComponent(CancelEcpPrintComponent, {
      callerData: { orderInfo: this.orderInfo },
      closeByClickOutside: false,
      closeByEnter: false,
      closeByEscape: false,
      modalId: 'CancelEcpPrintComponent'
    }
    ).subscribe(
      result => {
        if (result) {
          this.close();
        }
      });
  }

  /**
   * 주문 상세 정보 조회
   * @param {string} userId    유저아이디
   * @param {string} orderCode 주문번호
   */
  getOrderDetail(userId: string, orderCode: string) {
    const orderCodes = new Array<string>();
    orderCodes.push(orderCode);
    this.orderService.orderDetails(userId, orderCodes).subscribe(
      orderDetail => {
        if (orderDetail) {
          let jsonPaymentData = {};
          this.ABOFlag = orderDetail.orders[0].account.accountTypeCode === MemberType.ABO ? true : false;
          orderDetail.orders[0].paymentDetails.paymentInfos.forEach(paymentInfo => {
            switch (paymentInfo.paymentMode.code) {
              case 'creditcard': { jsonPaymentData = { 'ccPaymentInfo': paymentInfo }; } break;
              case 'cashiccard': { jsonPaymentData = { 'icCardPaymentInfo': paymentInfo }; } break;
              case 'cash': { jsonPaymentData = { 'cashPaymentInfo': paymentInfo }; } break;
              case 'directdebit': { jsonPaymentData = { 'directDebitPaymentInfo': paymentInfo }; } break;
              case 'arCredit': { jsonPaymentData = { 'monetaryPaymentInfo': paymentInfo }; } break;
              case 'point': { jsonPaymentData = { 'pointPaymentInfo': paymentInfo }; } break;
              case 'creditvoucher': { jsonPaymentData = { 'voucherPaymentInfo': paymentInfo }; } break;
              default: { jsonPaymentData = {}; } break;
            }
            Object.assign(this.paymentCapture, jsonPaymentData);
            jsonPaymentData = {};
          });
          this.orderDetail = orderDetail;
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('order-detail.component', `Get Order Detail error type : ${errdata.type}`).error();
          this.logger.set('order-detail.component', `Get Order Detail error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      });
  }

  /**
   * 포인트 정보 조회
   * @param {string} userId 유저아이디
   */
  getBalance(userId: string): void {
    this.paymentService.getBalance(userId).subscribe(
      balance => {
        if (balance) {
          this.balance = balance;
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('order-detail.component', `Get Balance error type : ${errdata.type}`).error();
          this.logger.set('order-detail.component', `Get Balance error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      });
  }


  /**
   * 영수증 재발행
   */
  reissueReceipts() {
    try {
      const cancelFlag = this.cancelSymbol === '-' ? true : false;
      if (this.orderType === 'g') {
        this.receiptService.reissueReceipts(this.orderDetail, cancelFlag, true);
      } else {
        this.receiptService.reissueReceipts(this.orderDetail, cancelFlag);
        this.alert.info({
          title: '영수증 재발행',
          message: this.messageService.get('receiptComplete'),
          timer: true,
          interval: 1000
        });
      }
    } catch (e) {
      this.logger.set('order-detail.component', `Reissue Receipts error type : ${e}`).error();
      this.alert.error({
        title: '영수증 재발행', message: this.messageService.get('receiptFail'),
        timer: true,
        interval: 1000
      });
    }
  }

  /**
   * Order 페이지로 이동
   */
  goOrder() {
    this.router.navigate(['/order']);
  }

  close() {
    this.result = this.activeFlag;
    this.closeModal();
  }

}
