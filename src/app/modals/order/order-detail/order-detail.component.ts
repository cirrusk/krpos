import { PaymentService } from './../../../service/payment/payment.service';
import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { ModalComponent, ModalService, Modal, SpinnerService, StorageService, Logger, AlertService } from '../../../core';
import { OrderService, ReceiptService, MessageService } from '../../../service';
import { Utils } from '../../../core/utils';
import { OrderList } from '../../../data/models/order/order';
import { CancelOrderComponent, CancelEcpPrintComponent } from '../..';
import { OrderHistory, PaymentCapture } from '../../../data';
import { InfoBroker } from '../../../broker';
import { Router } from '@angular/router';

@Component({
  selector: 'pos-order-detail',
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent extends ModalComponent implements OnInit, OnDestroy {

  orderDetail: OrderList;
  orderInfo: OrderHistory;

  clientId: string;
  emloyeeName: string;
  cancelSymbol: string;
  cancelFlag: boolean;
  activeFlag: boolean;
  paymentCapture: PaymentCapture;

  constructor(protected modalService: ModalService,
              private router: Router,
              private orderService: OrderService,
              private receiptService: ReceiptService,
              private messageService: MessageService,
              private modal: Modal,
              private spinner: SpinnerService,
              private storageService: StorageService,
              private logger: Logger,
              private alert: AlertService,
              private info: InfoBroker,
              private renderer: Renderer2) {
    super(modalService);
    this.init();
  }

  ngOnInit() {
    this.orderInfo = this.callerData.orderInfo;
    this.getOrderDetail(this.orderInfo.user.uid, this.orderInfo.code);
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
    this.paymentCapture = new PaymentCapture();
  }

  checkCancelStatus(orderInfo: OrderHistory) {
    if (orderInfo.orderStatus.code === 'CANCELLED') {
      this.cancelSymbol = '-';
      this.cancelFlag = true;

    } else {
      this.cancelSymbol = '';
      this.cancelFlag = false;

      if (orderInfo.orderType.code === 'GROUP_COMBINED_ORDER' && orderInfo.user.uid !== orderInfo.volumeAccount.uid) {
        this.cancelFlag = true;
      }
    }
  }

  /**
   * 주문 취소 팝업
   */
  popupCancel() {
    this.modal.openModalByComponent(CancelOrderComponent,
      {
        callerData: { orderInfo : this.orderInfo },
        closeByClickOutside: false,
        closeByEnter: false,
        closeByEscape: false,
        modalId: 'CancelOrderComponent'
      }
    ).subscribe( result => {
      if (result) {
        this.cancelSymbol = '-';
        this.cancelFlag = true;
        this.activeFlag = true;
        this.result = this.activeFlag;
        this.getOrderDetail(this.orderInfo.user.uid, this.orderInfo.code);
      }
    }

    );
  }

  /**
   * 결제수단변경/재결제
   */
  paymentChange() {
    this.modal.openModalByComponent(CancelOrderComponent,
      {
        callerData: { orderInfo : this.orderInfo },
        closeByClickOutside: false,
        closeByEnter: false,
        closeByEscape: false,
        modalId: 'CancelOrderComponent'
      }
    ).subscribe(
      result => {
        if (result) {
          // 재결제 추가
          this.info.sendInfo('paymentChange', result);
          this.goOrder();
          this.close();
        }
      }
    );
  }

  /**
   * ECP 출력 취소
   */
  cancelECPPrint() {
    this.modal.openModalByComponent(CancelEcpPrintComponent,
      {
        callerData: { orderInfo : this.orderInfo },
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
      }
    );
  }

  /**
   * 주문 상세 정보 조회
   * @param userId
   * @param orderCode
   */
  getOrderDetail(userId: string, orderCode: string) {
    const orderCodes = new Array<string>();
    orderCodes.push(orderCode);
    this.spinner.show();
    this.orderService.orderDetails(userId, orderCodes).subscribe(
      orderDetail => {
        if (orderDetail) {
          let jsonPaymentData = {};
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
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('order-detail.component', `Get Order Detail error type : ${errdata.type}`).error();
          this.logger.set('order-detail.component', `Get Order Detail error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 영수증 재발행
   */
  reissueReceipts() {
    try {
      this.receiptService.reissueReceipts(this.orderDetail);
      this.alert.info({ title: '영수증 재발행',
                        message: this.messageService.get('receiptComplete'),
                        timer: true,
                        interval: 1000});
    } catch (e) {
      this.logger.set('order-detail.component', `Reissue Receipts error type : ${e}`).error();
      this.alert.error({ title: '영수증 재발행', message: this.messageService.get('receiptFail'),
                         timer: true,
                         interval: 1000});
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
