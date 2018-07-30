import { PagerService } from './../../../service/common/pager.service';
import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EcpConfirmComponent } from '../ecp-confirm/ecp-confirm.component';
import { ModalComponent, ModalService, Modal, SpinnerService, Logger, AlertService, StorageService } from '../../../core';
import { OrderService, MessageService, ReceiptService } from '../../../service';
import { OrderHistoryList, OrderHistory, OrderEntry, Pagination } from '../../../data';
import { Order, OrderList } from '../../../data/models/order/order';
import { Utils } from '../../../core/utils';

@Component({
  selector: 'pos-pickup-order',
  templateUrl: './pickup-order.component.html'
})
export class PickupOrderComponent extends ModalComponent implements OnInit, OnDestroy {
  PAGE_SIZE = 5;

  private orderListSubscription: Subscription;

  @ViewChildren('ecporders') ecporders: QueryList<ElementRef>;
  @ViewChild('inputSearchText') searchValue: ElementRef;
  @ViewChild('barcodeScan') barcodeScan: ElementRef;
  @ViewChild('searchType') selSearchType: ElementRef;
  @ViewChild('selectAll') selectAll: ElementRef;
  sourceList: OrderHistoryList;
  targetList: OrderHistoryList;
  currentTargetList: OrderHistoryList;
  orderType: string;
  orderTypeName: string;
  targetUserList: Map<string, number>;
  targetListPager: Pagination;
  entryList: Array<OrderEntry>;

  private confirmFlag = false;
  private searchType: string;
  private searchText: string;
  private deliveryModes: string;
  private channels: string;
  private orderStatus: string;
  private isEasyPickupOrder = false;

  constructor(protected modalService: ModalService,
              private orderService: OrderService,
              private pagerService: PagerService,
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
    this.sourceList = new OrderHistoryList(new Array<OrderHistory>());
    this.targetList = new OrderHistoryList(new Array<OrderHistory>());
    this.currentTargetList = new OrderHistoryList(new Array<OrderHistory>());
    this.targetUserList = new Map<string, number>();
    this.targetListPager = new Pagination();
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
  moveOrder(evt: any, orderCode: string, type: string): void {
    let selectedFlag = false;
    if (evt) {
      selectedFlag = this.setSelected(evt);
    } else {
      selectedFlag = type === 'a' ? true :  false;
    }

    if (selectedFlag) {
      let targetExistedIdx = -1;
      if (this.targetList.orders) {
        targetExistedIdx = this.targetList.orders.findIndex(
          function (obj) {
            return obj.code === orderCode;
          }
        );
      } else {
        targetExistedIdx = -1;
      }

      if (targetExistedIdx === -1) {
        const sourceExistedIdx: number = this.sourceList.orders.findIndex(
          function (obj) {
            return obj.code === orderCode;
          }
        );
        this.checkUserDuplicate(this.sourceList.orders[sourceExistedIdx].user.uid, 'a');
        this.targetList.orders.push(this.sourceList.orders[sourceExistedIdx]);
      }
      this.setTargetPage(Math.ceil(this.targetList.orders.length / this.PAGE_SIZE), false);
    } else {
      this.deleteOrder(orderCode);
    }

  }

  /**
   * 컨펌 리스트에서 제거
   * @param orderCode
   */
  deleteOrder(orderCode: string): void {
    const renderer2 = this.renderer;
    this.ecporders.some(function (ecpOrder) {
        if (ecpOrder.nativeElement.firstElementChild.innerText.trim() === orderCode) {
        renderer2.removeClass(ecpOrder.nativeElement, 'on');
        return true;
      }
    });
    const existedIdx: number = this.targetList.orders.findIndex(
      function (obj) {
        return obj.code === orderCode;
      }
    );
    this.checkUserDuplicate(this.targetList.orders[existedIdx].user.uid, 'd');
    this.targetList.orders.splice(existedIdx, 1);
    this.setTargetPage(Math.ceil(this.targetList.orders.length / this.PAGE_SIZE), false);
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

  /**
   * 주문 리스트 페이지 설정
   * @param page
   */
  setPage(page: number) {
    this.getOrderList(this.searchType, this.channels, this.deliveryModes, this.orderStatus, 'A', this.searchText, page, false);

    const chk = this.selectAll.nativeElement.classList.contains('on');
    if (chk) {
      this.renderer.removeClass(this.selectAll.nativeElement, 'on');
    }
  }

  /**
   * 컨펀 리스트 페이지 설정
   * @param page
   * @param pagerFlag
   */
  setTargetPage(page: number, pagerFlag: boolean) {
    if ((page < 1 || page > this.targetListPager.totalPages) && pagerFlag) {
      return;
    }

    const currentUserData = this.pagerService.getCurrentPage(this.targetList.orders, page, this.PAGE_SIZE);

    // pagination 생성 데이터 조회
    this.targetListPager = currentUserData.get('pager') as Pagination;

    // 출력 리스트 생성
    // 리스트 결과가 없을 경우 리스트 초기화
    this.currentTargetList.orders = currentUserData.get('list') as Array<OrderHistory>;
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
          this.sourceList = resultData;
          if (barcodeFlag && this.sourceList.orders.length === 1) {
            this.moveOrder(null, this.sourceList.orders[0].code, 'a');
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
      () => { if (barcodeFlag) { this.barcodeScan.nativeElement.value = ''; } this.spinner.hide(); }
    );
  }

  /**
   * 컨펌 진행
   * @param evt
   */
  confirmECP(evt: any) {
    this.modal.openModalByComponent(EcpConfirmComponent,
      {
        callerData: { orderList: this.targetList  },
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        modalId: 'EcpConfirmComponent'
      }
    );
  }

  /**
   * 사용자별 컨펌 리스트 count
   * @param userId
   * @param type
   */
  checkUserDuplicate(userId: string, type: string) {
    const existedIdx: number = this.targetList.orders.findIndex(
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
    const orderCodes = new Array<string>();
      this.targetList.orders.forEach(order => {
        orderCodes.push(order.code);
      });
      this.spinner.show();
      this.orderService.orderDetails(this.targetList.orders[0].user.uid, orderCodes).subscribe(
        orderDetail => {
          if (orderDetail) {
            this.setEntryList(orderDetail);
          }
        },
        error => {
          this.spinner.hide();
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.set('ecp_confirm.component', `get order detail error type : ${errdata.type}`).error();
            this.logger.set('ecp_confirm.component', `get order detail error message : ${errdata.message}`).error();
            this.alert.error({ message: `${errdata.message}` });
          }
        },
        () => { this.spinner.hide(); }
      );

    // if (this.targetOrderHistoryList) {
    //   const orderCodes = new Array<string>();
    //   this.targetOrderHistoryList.orders.forEach(order => {
    //     orderCodes.push(order.code);
    //   });
    //   this.spinner.show();
    //   this.orderService.orderDetails(this.targetOrderHistoryList.orders[0].user.uid, orderCodes).subscribe(
    //     orderDetail => {
    //       if (orderDetail) {
    //         try {
    //           this.receiptService.reissueReceipts(orderDetail);
    //           this.alert.info({ title: '영수증 재발행', message: this.messageService.get('receiptComplete') });
    //         } catch (e) {
    //           this.logger.set('pickup-order.component', `Reissue Receipts error type : ${e}`).error();
    //           this.alert.error({ title: '영수증 재발행', message: this.messageService.get('receiptFail') });
    //         }
    //       }
    //     },
    //     error => {
    //       this.spinner.hide();
    //       const errdata = Utils.getError(error);
    //       if (errdata) {
    //         this.logger.set('pickup-order.component', `Reissue Receipts error type : ${errdata.type}`).error();
    //         this.logger.set('pickup-order.component', `Reissue Receipts error message : ${errdata.message}`).error();
    //         this.alert.error({ message: `${errdata.message}` });
    //       }
    //     },
    //     () => { this.spinner.hide(); }
    //   );
    // }
  }

  /**
   * 주문별 상품 통합
   *  - 주문별 동일한 상품 통합
   * @param orderList
   */
  setEntryList(orderList: OrderList): void {
    this.entryList = orderList.orders[0].entries;

    orderList.orders.forEach((order, index) => {
      if (index > 0) {
        order.entries.forEach(entry => {
          const existedIdx = this.entryList.findIndex(
            function (obj) {
              return obj.product.code === entry.product.code;
            }
          );
          if (existedIdx === -1) {
            this.entryList.push(entry);
          } else {
            this.entryList[existedIdx].quantity = (this.entryList[existedIdx].quantity + entry.quantity);
          }
        });
      }
    });

    this.receiptService.makeTextAndGroupSummaryPrint(this.entryList , this.orderTypeName);

    if (this.targetList) {
      const orderCodes = new Array<string>();
      this.targetList.orders.forEach(order => {
        orderCodes.push(order.code);
      });
      this.spinner.show();
      this.orderService.orderDetails(this.targetList.orders[0].user.uid, orderCodes).subscribe(
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

  /**
   * 주문리스트 Row 선택 이벤트
   * @param evt
   */
  private setSelected(evt: any): boolean {
    evt.stopPropagation();
    const chk = evt.currentTarget.classList.contains('on');
    if (chk) {
      this.renderer.removeClass(evt.currentTarget, 'on');
      return false;
    } else {
      this.renderer.addClass(evt.currentTarget, 'on');
      return true;
    }
  }

  /**
   * Row 전체 선택 이벤트
   * @param evt
   */
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

  /**
   * 전체 선택 type 별 처리
   * @param type
   */
  selectAllRows(type: string) {
    if (type.toUpperCase() === 'A') {
      this.sourceList.orders.forEach(order => {
        this.moveOrder(null, order.code, 'a');
      });
    } else {
      this.sourceList.orders.forEach(order => {
        this.deleteOrder(order.code);
      });
    }
  }

  /**
   * 초기화 버튼
   */
  initialize() {
    this.init();
    setTimeout(() => { this.searchValue.nativeElement.focus(); }, 100);
    this.selSearchType.nativeElement.value = 'abo';
    this.searchValue.nativeElement.value = '';
    this.barcodeScan.nativeElement.value = '';
  }
}
