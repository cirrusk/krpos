import { Component, OnInit, Renderer2 } from '@angular/core';
import { ModalComponent, ModalService, Modal, SpinnerService, StorageService, Logger, AlertService } from '../../../core';
import { OrderService } from '../../../service';
import { Utils } from '../../../core/utils';
import { OrderList } from '../../../data/models/order/order';

@Component({
  selector: 'pos-order-detail',
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent extends ModalComponent implements OnInit {

  orderDetail: OrderList;

  constructor(protected modalService: ModalService,
              private orderService: OrderService,
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
    // this.orderDetail = new OrderList();
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
          this.logger.set('pickup-order.component', `Get Order Detail error type : ${errdata.type}`).error();
          this.logger.set('pickup-order.component', `Get Order Detail error message : ${errdata.message}`).error();
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
