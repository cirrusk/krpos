import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { EcpPrintComponent } from '../ecp-print/ecp-print.component';
import { EcpConfirmComponent } from '../ecp-confirm/ecp-confirm.component';
import { ModalComponent, ModalService, Modal, SpinnerService, Logger, AlertService, StorageService } from '../../../core';
import { StringBuilder, Utils } from '../../../core/utils';
import { OrderHistoryList, OrderHistory } from '../../../data';
import { OrderService, MessageService, ReceiptService } from '../../../service';
import { Order } from '../../../data/models/order/order';

@Component({
  selector: 'pos-pickup-order',
  templateUrl: './pickup-order.component.html'
})
export class PickupOrderComponent extends ModalComponent implements OnInit {

  private orderListSubscription: Subscription;

  @ViewChildren('ecporders') ecporders: QueryList<ElementRef>;
  @ViewChild('inputSearchText') searchValue: ElementRef;
  sourceOrderHistoryList: OrderHistoryList;
  targetOrderHistoryList: OrderHistoryList;
  private order: Order;
  orderType: string;
  private orderTypeName: string;
  private confirmFlag = false;
  private selectedOrderNum = -1;
  private searchType: string;
  private searchText: string;

  constructor(protected modalService: ModalService,
              private orderService: OrderService,
              private modal: Modal,
              private spinner: SpinnerService,
              private storageService: StorageService,
              private messageService: MessageService,
              private receiptService: ReceiptService,
              private logger: Logger,
              private alert: AlertService,
              private renderer: Renderer2) {
    super(modalService);
    this.init();
  }

  init() {
    this.sourceOrderHistoryList = new OrderHistoryList(new Array<OrderHistory>());
    this.targetOrderHistoryList = new OrderHistoryList(new Array<OrderHistory>());
    this.searchType = '';
    this.searchText = '';
  }

  ngOnInit() {
    setTimeout(() => { this.searchValue.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
    this.orderType = this.callerData.searchType;

    if (this.orderType === 'e') {
      this.orderTypeName = '간편선물';
    } else if (this.orderType === 'i') {
      this.orderTypeName = '설치주문';
    } else {
      this.orderTypeName = '픽업예약주문';
      this.confirmFlag = true;
    }
  }

  /**
   * 컨펌 리스트로 이동
   * @param orderCode
   */
  moveOrder(evt: any, orderCode: string): void {
    this.setSelected(evt);

    let targetExistedIdx = -1;
    if (this.targetOrderHistoryList.orders) {
      targetExistedIdx = this.targetOrderHistoryList.orders.findIndex(
        function (obj) {
          return obj.code === orderCode;
        }
      );
    } else {
      targetExistedIdx = -1;
    }

    if (targetExistedIdx === -1) {
      const sourceExistedIdx: number = this.sourceOrderHistoryList.orders.findIndex(
        function (obj) {
          return obj.code === orderCode;
        }
      );

      this.targetOrderHistoryList.orders.push(this.sourceOrderHistoryList.orders[sourceExistedIdx]);
    }
  }

  /**
   * 컨펌 리스트에서 제거
   * @param orderCode
   */
  deleteOrder(orderCode: string): void {
    const existedIdx: number = this.targetOrderHistoryList.orders.findIndex(
      function (obj) {
        return obj.code === orderCode;
      }
    );

    this.targetOrderHistoryList.orders.splice(existedIdx, 1);
  }

  /**
   * 조회
   * @param searchType
   * @param searchText
   */
  searchOrder(searchType: string, searchText: string) {
    if (searchText === '' || searchText === undefined || searchText === null) {
      this.alert.info({ message: this.messageService.get('noSearchText') });
    } else {
      this.searchType = searchType;
      this.searchText = searchText;
      this.getOrderList(searchType, 'A', searchText, 0);
    }
  }

  setPage(page: number) {
    this.getOrderList(this.searchType, 'A', this.searchText, page);
  }

  /**
   * 주문 조회
   * @param searchType
   * @param memberType
   * @param searchText
   * @param page
   */
  getOrderList(searchType: string, memberType: string, searchText: string, page = 0) {
    this.spinner.show();
    this.orderListSubscription = this.orderService.orderList(searchText, memberType,
                                                             searchType, 'NORMAL_ORDER', 'pos', 'pickup', this.confirmFlag, page, 5).subscribe(
      resultData => {
        if (resultData) {
          this.sourceOrderHistoryList = resultData;
        }
      },
      error => {
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('order-complete.component', `Get order list error type : ${errdata.type}`).error();
          this.logger.set('order-complete.component', `Get order list error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 컨펌 진행
   * @param evt
   */
  confirmECP(evt: any) {
    this.setSelected(evt);

    this.modal.openModalByComponent(EcpConfirmComponent,
      {
        callerData: { orderList: this.targetOrderHistoryList  },
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        modalId: 'EcpConfirmComponent'
      }
    );
  }

  /**
   * 영수증 출력
   * @param evt
   */
  printECP(evt: any) {
    this.setSelected(evt);

    if (this.targetOrderHistoryList) {
      const orderCodes = new Array<string>();
      this.targetOrderHistoryList.orders.forEach(order => {
        orderCodes.push(order.code);
      });
      this.spinner.show();
      this.orderService.orderDetails(this.targetOrderHistoryList.orders[0].user.uid, orderCodes).subscribe(
        orderDetail => {
          if (orderDetail) {
            try {
              this.receiptService.reissueReceipts(orderDetail);
              this.alert.info({ title: '영수증 재발행', message: this.messageService.get('receiptComplete') });
            } catch (e) {
              this.logger.set('pickup-order.component', `Reissue Receipts error type : ${e}`).error();
              this.alert.error({ title: '영수증 재발행', message: this.messageService.get('receiptFail') });
            }
          }
        },
        error => {
          this.spinner.hide();
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.set('pickup-order.component', `Reissue Receipts error type : ${errdata.type}`).error();
            this.logger.set('pickup-order.component', `Reissue Receipts error message : ${errdata.message}`).error();
            this.alert.error({ message: `${errdata.message}` });
          }
        },
        () => { this.spinner.hide(); }
      );
    }
  }

  close() {
    this.closeModal();
  }

  private setSelected(evt: any) {
    evt.stopPropagation();
    const chk = evt.currentTarget.classList.contains('on');
    if (chk) {
      this.renderer.removeClass(evt.currentTarget, 'on');
    } else {
      this.renderer.addClass(evt.currentTarget, 'on');
    }
  }
}
