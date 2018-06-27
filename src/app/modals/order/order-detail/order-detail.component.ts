import { PaymentService } from './../../../service/payment/payment.service';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ModalComponent, ModalService, Modal, SpinnerService, StorageService, Logger, AlertService } from '../../../core';
import { OrderService, ReceiptService, MessageService } from '../../../service';
import { Utils } from '../../../core/utils';
import { OrderList } from '../../../data/models/order/order';
import { CancelOrderComponent } from '../..';

@Component({
  selector: 'pos-order-detail',
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent extends ModalComponent implements OnInit {

  orderDetail: OrderList;

  constructor(protected modalService: ModalService,
              private orderService: OrderService,
              private receiptService: ReceiptService,
              private messageService: MessageService,
              private modal: Modal,
              private spinner: SpinnerService,
              private storageService: StorageService,
              private logger: Logger,
              private alert: AlertService,
              private renderer: Renderer2) {
    super(modalService);
    this.init();
  }

  ngOnInit() {
    this.getOrderDetail(this.callerData.userId, this.callerData.orderCode);
  }

  init() {
  }

  popupCancel() {
    this.modal.openModalByComponent(CancelOrderComponent,
      {
        callerData: { },
        closeByClickOutside: false,
        closeByEnter: false,
        closeByEscape: false,
        modalId: 'CancelOrderComponent'
      }
    );
  }

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

  reissueReceipts() {
    try {
      this.receiptService.reissueReceipts(this.orderDetail);
      this.alert.info({ title: '영수증 재발행', message: this.messageService.get('receiptComplete') });
    } catch (e) {
      this.logger.set('order-detail.component', `Reissue Receipts error type : ${e}`).error();
      this.alert.error({ title: '영수증 재발행', message: this.messageService.get('receiptFail') });
    }
  }

  close() {
    this.closeModal();
  }

}
