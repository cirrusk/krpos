import { PaymentService } from './../../../service/payment/payment.service';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ModalComponent, ModalService, Modal, SpinnerService, StorageService, Logger, AlertService } from '../../../core';
import { OrderService, ReceiptService, MessageService } from '../../../service';
import { Utils } from '../../../core/utils';
import { OrderList } from '../../../data/models/order/order';
import { CancelOrderComponent } from '../..';
import { OrderHistory } from '../../../data';
import { InfoBroker } from '../../../broker';
import { Router } from '@angular/router';

@Component({
  selector: 'pos-order-detail',
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent extends ModalComponent implements OnInit {

  orderDetail: OrderList;
  orderInfo: OrderHistory;

  emloyeeId: string;
  emloyeeName: string;

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
    this.emloyeeId = this.storageService.getEmloyeeId();
    this.emloyeeName = this.storageService.getEmloyeeName();
  }

  init() {
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
    this.closeModal();
  }

}
