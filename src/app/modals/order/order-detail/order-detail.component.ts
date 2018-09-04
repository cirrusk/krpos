import { TotalPrice } from './../../../data/models/cart/cart-data';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalComponent, ModalService, Modal, StorageService, Logger, AlertService } from '../../../core';
import { OrderService, ReceiptService, MessageService, PaymentService } from '../../../service';
import { Utils } from '../../../core/utils';
import { OrderList, Order } from '../../../data/models/order/order';
import { CancelOrderComponent, CancelEcpPrintComponent } from '../..';
import { OrderHistory, PaymentCapture, Balance, MemberType, OrderType, PointReCash, ModalIds } from '../../../data';
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
  isCancelButton: boolean;
  orderType: string;
  orderTypeName: string;
  paymentCapture: PaymentCapture;
  ABOFlag: boolean;
  pointType: string;
  personalBusinessVolume = 0;
  personalPointValue = 0;
  groupBusinessVolume = 0;
  groupPointValue = 0;
  apprPrice = 0;

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
    if (this.orderInfo.isGroupCombinationOrder) {
      this.orderType = OrderType.GROUP;
      this.orderTypeName = this.messageService.get('group.order.type');
    } else if (this.orderInfo.isArrangementSalesOrder) {
      this.orderTypeName = this.messageService.get('mediateOrder.order.type');
    }

    if (this.orderInfo.channel.code === 'Web') {
      this.orderTypeName = this.orderTypeName + ' (' + this.messageService.get('pickupConfirm.order.type') + ')';
    }

    if (this.orderInfo.amwayAccount.accountTypeCode === MemberType.ABO) {
      this.pointType = 'A';
    } else if (this.orderInfo.amwayAccount.accountTypeCode === MemberType.MEMBER) {
      this.pointType = 'M';
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
    this.pointType = '';
    this.cancelFlag = false;
    this.activeFlag = false;
    this.isCancelButton = false;
    this.groupMainFlag = true;
    this.orderType = OrderType.NORMAL;
    this.orderTypeName = this.messageService.get('default.order.type');
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

    if (orderInfo.orderStatus.code === 'PICKUP_COMPLETED' || orderInfo.orderStatus.code === 'COMPLETED') {
      this.isCancelButton = true;
    }

    if (this.orderInfo.isGroupCombinationOrder && this.orderInfo.code !== this.orderInfo.parentOrder) {
      this.groupMainFlag = false;
    }
  }

  /**
   * 주문 취소 팝업
   */
  popupCancel() {
    if (this.isCancelButton) {
      this.modal.openModalByComponent(CancelOrderComponent, {
        callerData: { orderInfo: this.orderInfo },
        closeByClickOutside: false,
        closeByEnter: false,
        modalId: ModalIds.CANCEL
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
  }

  /**
   * 결제수단변경/재결제
   */
  paymentChange() {
    if (this.isCancelButton) {
      this.modal.openModalByComponent(CancelOrderComponent, {
        callerData: { orderInfo: this.orderInfo },
        closeByClickOutside: false,
        closeByEnter: false,
        closeByEscape: false,
        modalId: ModalIds.REORDER
      }
      ).subscribe(
        result => {
          if (result.cancelFlag) {
            // 재결제 추가
            const data = { 'orderDetail': result.data, 'orderType': this.orderInfo.isGroupCombinationOrder ? this.orderInfo.isGroupCombinationOrder : false };
            this.info.sendInfo('paymentChange', data);
            this.goOrder();
            this.close();
          }
        }
      );
    }
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
      modalId: ModalIds.CANCELECP
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

          let sumPrice = orderDetail.orders[0].totalPrice.value;

          // ABO인 경우 PV, BV 계산
          if (this.ABOFlag && orderDetail.orders[0].value) {
            this.setBonusValue(orderDetail.orders[0]);
          }

          if (this.paymentCapture.pointPaymentInfo) {
            sumPrice -= Number(this.paymentCapture.pointPaymentInfo.amount);
          }

          if (this.paymentCapture.monetaryPaymentInfo) {
            sumPrice -= Number(this.paymentCapture.monetaryPaymentInfo.amount);
          }

          this.orderDetail = orderDetail;
          // 결제 금액(Point + re-cash 를 뺀 금액)
          this.apprPrice = sumPrice;
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('order-detail.component', `Get Order Detail error type : ${errdata.type}`).error();
          this.logger.set('order-detail.component', `Get Order Detail error message : ${errdata.message}`).error();
          this.alert.error({ message: this.messageService.get('server.error', errdata.message) });
        }
      });
  }

  /**
   * 포인트 정보 조회
   * @param {string} userId 유저아이디
   */
  getBalance(userId: string): void {
    const pointrecash: PointReCash = this.storageService.getPointReCash();
    if (pointrecash && pointrecash.point) {
      this.balance = pointrecash.point;
    } else {
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
            this.alert.error({ message: this.messageService.get('server.error', errdata.message) });
          }
        });
    }
  }

  /**
   * PV, BV 값 SUM
   *  - 개인, 그룹 PV, BV 값 SUM
   * @param {Order} order 주문 상세 정보
   */
  setBonusValue(order: Order) {
    if (this.orderInfo.orderStatus.code === 'CANCELLED') {
      this.groupBusinessVolume = order.value.groupBusinessVolume;
      this.groupPointValue = order.value.groupPointValue;
      this.personalBusinessVolume = order.value.personalBusinessVolume;
      this.personalPointValue = order.value.personalPointValue;
    } else {
      this.groupBusinessVolume = order.value.groupBusinessVolume + order.totalPrice.amwayValue.businessVolume;
      this.groupPointValue = order.value.groupPointValue + order.totalPrice.amwayValue.pointValue;
      this.personalBusinessVolume = order.value.personalBusinessVolume + order.totalPrice.amwayValue.businessVolume;
      this.personalPointValue = order.value.personalPointValue + order.totalPrice.amwayValue.pointValue;
    }
  }


  /**
   * 영수증 재발행
   */
  reissueReceipts() {
    try {
      const cancelFlag = this.cancelSymbol === '-' ? true : false;
      if (this.orderType === OrderType.GROUP) {
        this.receiptService.reissueReceipts(this.orderDetail, cancelFlag, true, this.orderTypeName);
      } else {
        this.receiptService.reissueReceipts(this.orderDetail, cancelFlag, false, this.orderTypeName).subscribe(
          () => {
            this.alert.info({
              title: '영수증 재발행',
              message: this.messageService.get('receiptComplete'),
              timer: true,
              interval: 1500
            });
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
