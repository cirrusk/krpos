import { PagerService } from './../../../service/common/pager.service';
import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EcpConfirmComponent } from '../ecp-confirm/ecp-confirm.component';
import { ModalComponent, ModalService, Modal, Logger, AlertService } from '../../../core';
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

    // 간편선물 설정
    if (this.orderType === 'e') {
      this.orderTypeName = '간편선물';
      this.confirmFlag = true;
      this.channels = 'pos,Web,WebMobile';
      this.deliveryModes = 'pickup';
      this.orderStatus = 'READY';
      this.isEasyPickupOrder = true;
      // 설치주문 설정
    } else if (this.orderType === 'i') {
      this.orderTypeName = '설치주문';
      this.confirmFlag = true;
      this.channels = 'pos,Web,WebMobile';
      this.deliveryModes = 'install';
      this.orderStatus = 'READY';
      this.isEasyPickupOrder = false;
      // 픽업예약주문 설정
    } else {
      this.orderTypeName = '픽업예약주문';
      this.confirmFlag = true;
      this.channels = 'pos,Web,WebMobile';
      this.deliveryModes = 'pickup';
      this.orderStatus = 'READY';
      this.isEasyPickupOrder = false;
    }
  }

  ngOnDestroy() {
    if (this.orderListSubscription) { this.orderListSubscription.unsubscribe(); }
    this.receiptService.dispose();
  }

  /**
   * 컨펌 리스트로 이동
   * @param {string} orderCode 주문번호
   * @param {string} type      동작유형 ex) a = ADD, d =  DELETE
   */
  moveOrder(evt: any, orderCode: string, type: string): void {
    let selectedFlag = false;
    if (evt) {
      selectedFlag = this.setSelected(evt);
    } else {
      selectedFlag = type === 'a' ? true : false;
    }

    // source List 에서 row 활성화 일때 target list 로 추가
    if (selectedFlag) {
      let targetExistedIdx = -1;
      // target list 이동시 중복 확인
      if (this.targetList.orders) {
        targetExistedIdx = this.targetList.orders.findIndex(
          function (obj) {
            return obj.code === orderCode;
          }
        );
      } else {
        targetExistedIdx = -1;
      }

      // 중복이 없을 경우 추가
      if (targetExistedIdx === -1) {
        const sourceExistedIdx: number = this.sourceList.orders.findIndex(
          function (obj) {
            return obj.code === orderCode;
          }
        );
        // 유저 count 를 위한 체크
        this.checkUserDuplicate(this.sourceList.orders[sourceExistedIdx].user.uid, 'a');
        // targetList 추가
        this.targetList.orders.push(this.sourceList.orders[sourceExistedIdx]);
      }
      // target list 페이지 갱신
      this.setTargetPage(Math.ceil(this.targetList.orders.length / this.PAGE_SIZE), false);
    } else {
      // target list 에서 삭제
      this.deleteOrder(orderCode);
    }

  }

  /**
   * 컨펌 리스트에서 제거
   *  - target list 에서 row 선택시
   * @param {string} orderCode 주문번호
   */
  deleteOrder(orderCode: string): void {
    const renderer2 = this.renderer;
    // 현재 source list 페이지에서 삭제 되는 orderCode가 있는지 확인
    // 있을 경우 활성화 해제
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
    // 유저 count 를 위한 체크
    this.checkUserDuplicate(this.targetList.orders[existedIdx].user.uid, 'd');
    // target list에서 삭제
    this.targetList.orders.splice(existedIdx, 1);
    // target list 페이지 갱신
    this.setTargetPage(Math.ceil(this.targetList.orders.length / this.PAGE_SIZE), false);
  }

  /**
   * 주문 검색
   * @param {string} searchType 검색유형
   * @param {string} searchText 검색어
   * @param {boolean} barcodeFlag 바코드조회
   */
  searchOrder(searchType: string, searchText: string, barcodeFlag = false) {
    if (searchText === '' || searchText === undefined || searchText === null) {
      this.alert.info({ message: this.messageService.get('noSearchText') });
    } else {
      // source list 페이지 이동을 위해 search 정보 저장
      this.searchType = searchType;
      this.searchText = searchText;
      this.getOrderList(searchType, this.channels, this.deliveryModes, this.orderStatus, 'A', searchText, 0, barcodeFlag);
    }
  }

  /**
   * 주문 리스트 페이지 설정
   * @param {number} page 페이지번호
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
   * @param {string} page 페이지번호
   * @param {boolean} pagerFlag
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
   * @param {string} searchType 검색유형
   * @param {string} memberType 유저유형
   * @param {string} searchText 검색어
   * @param {number} page       페이지번호
   */
  getOrderList(searchType: string, channels: string, deliveryModes: string, orderStatus: string,
    memberType: string, searchText: string, page = 0, barcodeFlag: boolean) {
    const orderTypes = 'NORMAL_ORDER';
    const sort = 'code';
    const asc = false;
    this.orderListSubscription = this.orderService.orderList(searchText,
      memberType,
      searchType,
      orderTypes,
      channels,
      deliveryModes,
      this.confirmFlag,
      this.isEasyPickupOrder,
      page,
      this.PAGE_SIZE,
      sort,
      asc,
      orderStatus).subscribe(
        resultData => {
          if (resultData) {
            this.sourceList = resultData;
            // barcode 조회시 결과값이 하나면 바로 ADD
            if (barcodeFlag && this.sourceList.orders.length === 1) {
              this.moveOrder(null, this.sourceList.orders[0].code, 'a');
            }
          }
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.set('pickup-order.component', `Get order list error type : ${errdata.type}`).error();
            this.logger.set('pickup-order.component', `Get order list error message : ${errdata.message}`).error();
            this.alert.error({ message: `${errdata.message}` });
          }
        },
        () => { if (barcodeFlag) { this.barcodeScan.nativeElement.value = ''; } }
      );
  }

  /**
   * 컨펌 진행
   *  - 컨펌 팝업
   * @param evt
   */
  confirmECP() {
    if (this.targetList.orders.length > 0) {
      this.modal.openModalByComponent(EcpConfirmComponent,
        {
          callerData: { orderList: this.targetList , orderTypeName: this.orderTypeName },
          actionButtonLabel: '확인',
          closeButtonLabel: '취소',
          modalId: 'EcpConfirmComponent'
        }
      );
    } else {
      this.alert.warn({ title: '확인', message: this.messageService.get('noECPOrder') });
    }
  }

  /**
   * 사용자별 컨펌 리스트 count
   * @param {string} userId 유저아이디
   * @param {string} type   동작유형 ex) a = ADD, d =  DELETE
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
  printECP() {
    const orderCodes = new Array<string>();
    this.targetList.orders.forEach(order => {
      orderCodes.push(order.code);
    });
    this.orderService.orderDetails(this.targetList.orders[0].user.uid, orderCodes).subscribe(
      orderDetail => {
        if (orderDetail) {
          this.makeReceiptPrintData(orderDetail);
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('pickup-order.component', `printECP error type : ${errdata.type}`).error();
          this.logger.set('pickup-order.component', `printECP error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      });
  }

  /**
   * 영수증 출력 DATA 생성
   *  - 복수 선택인 경우 summary도 출력함.
   * @param {OrderList} orderList 주문리스트
   */
  makeReceiptPrintData(orderList: OrderList): void {
    this.entryList = orderList.orders[0].entries;

    // 복수 선택의 경우 Summary 영수증 출력
    if (orderList.orders.length > 1) {
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
      this.receiptService.makeTextAndGroupSummaryPrint(this.entryList, this.orderTypeName);
    }

    // 사용자별 영수증 출력
    if (this.targetList) {
      const orderCodes = new Array<string>();
      this.targetList.orders.forEach(order => {
        orderCodes.push(order.code);
      });
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
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.set('pickup-order.component', `Reissue Receipts error type : ${errdata.type}`).error();
            this.logger.set('pickup-order.component', `Reissue Receipts error message : ${errdata.message}`).error();
            this.alert.error({ message: `${errdata.message}` });
          }
        });
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
   * @param {string} type 동작유형 ex) a = ADD, d =  DELETE
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
