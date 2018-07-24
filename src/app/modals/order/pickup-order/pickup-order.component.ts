import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EcpConfirmComponent } from '../ecp-confirm/ecp-confirm.component';
import { ModalComponent, ModalService, Modal, SpinnerService, Logger, AlertService, StorageService } from '../../../core';
import { OrderService, MessageService, ReceiptService } from '../../../service';
import { OrderHistoryList, OrderHistory } from '../../../data';
import { Order } from '../../../data/models/order/order';
import { Utils } from '../../../core/utils';

@Component({
  selector: 'pos-pickup-order',
  templateUrl: './pickup-order.component.html'
})
export class PickupOrderComponent extends ModalComponent implements OnInit, OnDestroy {
  private PAGE_SIZE = 5;

  private orderListSubscription: Subscription;

  @ViewChildren('ecporders') ecporders: QueryList<ElementRef>;
  @ViewChild('inputSearchText') searchValue: ElementRef;
  sourceOrderHistoryList: OrderHistoryList;
  targetOrderHistoryList: OrderHistoryList;
  orderType: string;
  orderTypeName: string;
  targetUserList: Map<string, number>;

  private confirmFlag = false;
  private searchType: string;
  private searchText: string;
  private deliveryModes: string;
  private channels: string;
  private orderStatus: string;
  private isEasyPickupOrder = false;

  constructor(protected modalService: ModalService,
              private orderService: OrderService,
              private modal: Modal,
              private spinner: SpinnerService,
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
    this.targetUserList = new Map<string, number>();
    this.searchType = '';
    this.searchText = '';
  }

  ngOnInit() {
    setTimeout(() => { this.searchValue.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
    this.orderType = this.callerData.searchType;

    if (this.orderType === 'e') {
      this.orderTypeName = '간편선물';
      this.confirmFlag = true;
      this.channels = 'pos,Web,WebMobile';
      this.deliveryModes  = 'pickup';
      this.orderStatus = 'COMPLETED';
      this.isEasyPickupOrder = true;
    } else if (this.orderType === 'i') {
      this.orderTypeName = '설치주문';
      this.confirmFlag = true;
      this.channels = 'pos,Web,WebMobile';
      this.deliveryModes  = 'install';
      this.orderStatus = 'COMPLETED';
      this.isEasyPickupOrder = false;
    } else {
      this.orderTypeName = '픽업예약주문';
      this.confirmFlag = true;
      this.channels = 'pos,Web,WebMobile';
      this.deliveryModes  = 'pickup';
      this.orderStatus = 'COMPLETED';
      this.isEasyPickupOrder = false;
    }
  }

  ngOnDestroy() {
    this.receiptService.dispose();
  }

  /**
   * 컨펌 리스트로 이동
   * @param orderCode
   */
  moveOrder(evt: any, orderCode: string): void {
    if (evt) {
      this.setSelected(evt);
    }

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
      this.checkUserDuplicate(this.sourceOrderHistoryList.orders[sourceExistedIdx].user.uid, 'a');
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
    this.checkUserDuplicate(this.targetOrderHistoryList.orders[existedIdx].user.uid, 'd');
    this.targetOrderHistoryList.orders.splice(existedIdx, 1);
  }

  /**
   * 조회
   * @param searchType
   * @param searchText
   */
  searchOrder(searchType: string, searchText: string, barcodeFlag= false) {
    if (searchText === '' || searchText === undefined || searchText === null) {
      this.alert.info({ message: this.messageService.get('noSearchText') });
    } else {
      this.searchType = searchType;
      this.searchText = searchText;
      this.getOrderList(searchType, this.channels, this.deliveryModes, this.orderStatus, 'A', searchText, 0, barcodeFlag);
    }
  }

  setPage(page: number) {
    this.getOrderList(this.searchType, this.channels, this.deliveryModes, this.orderStatus, 'A', this.searchText, page, false);
  }

  /**
   * 주문 조회
   * @param searchType
   * @param memberType
   * @param searchText
   * @param page
   */
  getOrderList(searchType: string, channels: string, deliveryModes: string, orderStatus: string,  memberType: string, searchText: string, page = 0, barcodeFlag: boolean) {
    this.spinner.show();
    this.orderListSubscription = this.orderService.orderList(searchText, memberType,
                                                             searchType, 'NORMAL_ORDER', channels, deliveryModes, this.confirmFlag, this.isEasyPickupOrder,
                                                             page, this.PAGE_SIZE, orderStatus).subscribe(
      resultData => {
        if (resultData) {
          this.sourceOrderHistoryList = resultData;
          if (barcodeFlag && this.sourceOrderHistoryList.orders.length === 1) {
            this.moveOrder(null, this.sourceOrderHistoryList.orders[0].code);
          }
        }
      },
      error => {
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('pickup-order.component', `Get order list error type : ${errdata.type}`).error();
          this.logger.set('pickup-order.component', `Get order list error message : ${errdata.message}`).error();
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

  checkUserDuplicate(userId: string, type: string) {
    const existedIdx: number = this.targetOrderHistoryList.orders.findIndex(
      function (obj) {
        return obj.user.uid === userId;
      }
    );

    if (type.toUpperCase() === 'A') {
      if (existedIdx === -1) {
        this.targetUserList.set(userId, 1);
      } else {
        this.targetUserList.set(userId, this.targetUserList.get(userId) + 1);
      }
    } else {
      if (existedIdx > -1) {
        this.targetUserList.set(userId, this.targetUserList.get(userId) - 1);
        if (this.targetUserList.get(userId) === 0) {
          this.targetUserList.delete(userId);
        }
      }
    }
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

  activeAll(evt: any) {
    evt.stopPropagation();
    const chk = evt.currentTarget.classList.contains('on');
    if (chk) {
      this.renderer.removeClass(evt.currentTarget, 'on');
      this.ecporders.forEach(ecpOrder => {
        this.renderer.removeClass(ecpOrder.nativeElement, 'on');
      });
      this.selectAllRows('d');
    } else {
      this.renderer.addClass(evt.currentTarget, 'on');
      this.ecporders.forEach(ecpOrder => {
        this.renderer.addClass(ecpOrder.nativeElement, 'on');
      });
      this.selectAllRows('a');
    }
  }

  selectAllRows(type: string) {
    if (type.toUpperCase() === 'A') {
      this.sourceOrderHistoryList.orders.forEach(order => {
        this.moveOrder(null, order.code);
      });
    } else {
      this.sourceOrderHistoryList.orders.forEach(order => {
        this.deleteOrder(order.code);
      });
    }
  }
}
