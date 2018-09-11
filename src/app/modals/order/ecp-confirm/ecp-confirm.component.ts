import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ModalComponent, ModalService, AlertService, Modal, Logger, SpinnerService } from '../../../core';
import { PagerService, OrderService, MessageService, SearchService, ReceiptService } from '../../../service';
import { Pagination, OrderEntry, OrderHistoryList, ModalIds } from '../../../data';
import { Utils } from '../../../core/utils';
import { OrderList } from '../../../data/models/order/order';

@Component({
  selector: 'pos-ecp-confirm',
  templateUrl: './ecp-confirm.component.html'
})
export class EcpConfirmComponent extends ModalComponent implements OnInit, OnDestroy {
  private PAGE_SIZE = 5;

  @ViewChild('barcode') private barcode: ElementRef;

  private searchProductInfoSubscription: Subscription;
  private confirmSubscription: Subscription;
  private orderDetailsSubscription: Subscription;

  private orderList: OrderHistoryList;
  private orderDetailList: OrderList;
  private orderCodes: string;
  private orderTypeName: string;
  private orderType: string;

  entryList: Array<OrderEntry>;
  pager: Pagination;                                     // pagination 정보
  currentOrderList: Array<OrderEntry>;
  totalCount: number;

  constructor(private modal: Modal,
    protected modalService: ModalService,
    private alert: AlertService,
    private messageService: MessageService,
    private logger: Logger,
    private orderService: OrderService,
    private pagerService: PagerService,
    private receiptService: ReceiptService,
    private spinnerService: SpinnerService,
    private searchService: SearchService) {
    super(modalService);
    this.init();
  }

  ngOnInit() {
    setTimeout(() => { this.barcode.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
    if (this.callerData.orderList) {
      this.orderList = this.callerData.orderList;
      this.orderType = this.callerData.orderType;
      this.orderTypeName = this.callerData.orderTypeName;
      this.getOrderDetail(this.orderList);
    }
  }

  ngOnDestroy() {
    if (this.searchProductInfoSubscription) { this.searchProductInfoSubscription.unsubscribe(); }
    if (this.orderDetailsSubscription) { this.orderDetailsSubscription.unsubscribe(); }
    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe(); }
  }

  init() {
    this.pager = new Pagination();
    this.totalCount = 0;
    this.orderCodes = '';
    this.entryList = new Array<OrderEntry>();
    this.currentOrderList = new Array<OrderEntry>();
    this.orderList = new OrderHistoryList();
  }

  /**
   * 컨펌 리스트 조회
   * @param {OrderHistoryList} orderList 주문 리스트
   */
  getOrderDetail(orderList: OrderHistoryList): void {
    const orderCodes = new Array<string>();
    orderList.orders.forEach(order => {
      orderCodes.push(order.code);
    });
    this.orderService.orderDetailsByOrderCodes(orderCodes).subscribe(
      orderDetails => {
        if (orderDetails) {
          this.orderDetailList = orderDetails;
          this.setEntryList(orderDetails);
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('ecp_confirm.component', `get order detail error type : ${errdata.type}`).error();
          this.logger.set('ecp_confirm.component', `get order detail error message : ${errdata.message}`).error();
          this.alert.error({ message: this.messageService.get('server.error', errdata.message) });
        }
      });
  }

  /**
   * Order 상품별 그룹핑
   * @param {OrderList} orderList 주문 리스트
   */
  setEntryList(orderList: OrderList): void {
    orderList.orders.forEach((order, index) => {
      this.orderCodes += ',' + order.code;
      order.entries.forEach(entry => {
        const existedIdx = this.entryList.findIndex(
          function (obj) {
            return obj.product.code === entry.product.code;
          }
        );
        const tempEntry = new OrderEntry();
        Object.assign(tempEntry, entry);

        if (existedIdx === -1) {
          this.entryList.push(tempEntry);
        } else {
          this.entryList[existedIdx].quantity = (this.entryList[existedIdx].quantity + tempEntry.quantity);
        }
      });
    });

    this.setPage(Math.ceil(this.entryList.length / this.PAGE_SIZE));
  }

  /**
   * 상품 컨펌
   * @param {string} productCode 제품 코드
   * @param {number} page 페이지번호
   */
  productConfirm(productCode: string, page?: number): void {
    if (productCode.length > 0) {
      this.barcode.nativeElement.value = '';
      const existedIdx = this.entryList.findIndex(
        function (obj) {
          return obj.product.code === productCode;
        }
      );
      if (existedIdx !== -1) {
        this.spinnerService.show();
        try {
          const confirmCount = this.entryList[existedIdx].ecpConfirmQty ? this.entryList[existedIdx].ecpConfirmQty : 0;
          if (this.entryList[existedIdx].quantity > confirmCount) {
            this.barcode.nativeElement.focus();
            this.entryList[existedIdx].ecpConfirmQty = confirmCount + 1;
            this.setPage(Math.ceil((existedIdx + 1) / this.PAGE_SIZE));
          } else {
            const errorCount = (confirmCount + 1) - this.entryList[existedIdx].quantity;
            this.popupExceed(this.entryList[existedIdx].product.code,
              this.entryList[existedIdx].product.name,
              this.entryList[existedIdx].quantity,
              errorCount);
          }
          setTimeout(() => { this.spinnerService.hide(); }, 500);
        } catch (e) {
          this.spinnerService.hide();
        }
      } else {
        this.searchProductInfoSubscription = this.searchService.getBasicProductInfo(productCode).subscribe(
          result => {
            if (result) {
              if (result.products.length > 0) {
                this.popupNoProduct(result.products[0].code, result.products[0].name);
              } else {
                this.alert.warn({ message: this.messageService.get('wrongProductCode'), timer: true, interval: 1500 });
                setTimeout(() => { this.barcode.nativeElement.focus(); }, 1520);
              }
            }
          },
          error => {
            const errdata = Utils.getError(error);
            if (errdata) {
              this.logger.set('ecp-confirm.component', `get order detail error type : ${errdata.type}`).error();
              this.logger.set('ecp-confirm.component', `get order detail error message : ${errdata.message}`).error();
              this.alert.error({ message: this.messageService.get('server.error', errdata.message) });
            }
          });
      }
    } else {
      this.alert.warn({message: this.messageService.get('noProductSearchText'),
                       timer: true,
                       interval: 1500});
      setTimeout(() => { this.barcode.nativeElement.focus(); }, 100);
    }
  }

  /**
   * 출력 데이터 생성
   * @param {number} page 페이지 번호
   * @param {boolean} pagerFlag 페이징
   */
  setPage(page: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.pager.totalPages) && pagerFlag) {
      return;
    }

    const currentData = this.pagerService.getCurrentPage(this.entryList, page, this.PAGE_SIZE);
    // pagination 생성 데이터 조회
    this.pager = Object.assign(currentData.get('pager'));
    // 출력 리스트 생성
    this.currentOrderList = Object.assign(currentData.get('list'));
  }

  /**
   * 전체 컨펌
   */
  confirm() {
    let productCode = '';
    let productName = '';
    let productQty = 0;
    let errorQty = 0;
    let errorType = '';
    let isConfirm = false;
    // 완료 여부 확인
    try {
      isConfirm = this.entryList.some(function (entry, index, arr) {
        if (!entry.ecpConfirmQty) {
          entry.ecpConfirmQty = 0;
        }
        // 수량이 부족할 경우
        if (entry.quantity > entry.ecpConfirmQty) {
          productCode = entry.product.code;
          productName = entry.product.name;
          productQty = entry.quantity;
          errorQty = entry.quantity - entry.ecpConfirmQty;
          errorType = 'S';
          return true;
          // 수량이 초과한 경우
        } else if (entry.quantity < entry.ecpConfirmQty) {
          productCode = entry.product.code;
          productName = entry.product.name;
          productQty = entry.quantity;
          errorQty = entry.ecpConfirmQty - entry.quantity;
          errorType = 'E';
          return true;
        }
      });
    } catch (e) {
      this.logger.set('ecp-confirm.component', `confirm error type : ${e}`).error();
    }

    // 이상이 있을 경우 메시지 전시
    if (isConfirm && errorType === 'S') {
      // 수량 부족
      this.popupShortage(productCode, productName, productQty, errorQty);
    } else if (isConfirm && errorType === 'E') {
      // 수량 초과
      this.popupExceed(productCode, productName, productQty, errorQty);
    } else {
      this.confirmSubscription = this.orderService.confirmPickup(this.orderCodes.slice(1)).subscribe(
        result => {
          let message = '';
          if (this.orderType === 'p') {
            message = this.messageService.get('ecpComplete');
          } else {
            // 영수증 출력시
            this.receiptPrint();
            message = this.messageService.get('ecpReceiptComplete');
          }
          this.alert.info({
            title: this.title + ' 컨펌 확인',
            message: message,
            timer: true,
            interval: 1500
          });
          this.result = true;
          this.closeModal();
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.set('ecp-confirm.component', `confirm error type : ${errdata.type}`).error();
            this.logger.set('ecp-confirm.component', `confirm error message : ${errdata.message}`).error();
            this.alert.error({ message: this.messageService.get('server.error', errdata.message) });
          }
        });
    }
  }

  /**
   * 영수증 출력
   */
  receiptPrint() {
    this.makeReceiptPrintData(this.orderDetailList);
  }

  /**
   * 영수증 출력 DATA 생성
   *  - 복수 선택인 경우 summary도 출력함.
   * @param {OrderList} orderList 주문상세리스트
   */
  makeReceiptPrintData(orderList: OrderList): void {
    // 복수개인 경우 Summary 출력
    if (orderList.orders.length > 1) {
      this.receiptService.makeTextAndGroupSummaryPrint(this.entryList , this.orderTypeName);
    }

    // 사용자별 영수증 출력
    if (orderList.orders.length > 0) {
      setTimeout(() => {
        try {
          this.receiptService.reissueReceipts(orderList, false, false, this.orderTypeName);
          // this.alert.info({ title: '영수증 재발행', message: this.messageService.get('receiptComplete') });
        } catch (e) {
          this.logger.set('ecp-confirm.component', `makeReceiptPrintData error type : ${e}`).error();
          this.alert.error({ title: '영수증 재발행', message: this.messageService.get('receiptFail') });
        }
      }, 500);
    }
  }

  /**
   * 초과 팝업
   * @param {string} productCode 제품코드
   * @param {string} productName 제품명
   * @param {number} productQty  제품수량
   * @param {number} exceedQty   초과수량
   */
  popupExceed(productCode: string, productName: string, productQty: number, exceedQty: number) {
    setTimeout(() => {
      this.modal.openConfirm({
        title: this.title + ' 컨펌',
        message: `<p class="txt_info02 type02">${productCode}  ${productName} 수량은 ` +
          `<em class="fc_red">${productQty}</em>개로<br>` +
          `해당상품이 <em class="fc_red">${exceedQty}</em>개 더 담겼습니다.</p>`,
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        closeByEnter: true,
        modalId: ModalIds.ECPCONFIRMEX
      }).subscribe(
        () => {
          this.barcode.nativeElement.focus();
        }
      );
    }, 100);
  }

  /**
   * 수량이 더 필요할때 팝업
   * @param {string} productCode 제품코드
   * @param {string} productName 제품명
   * @param {number} productQty  제품수량
   * @param {number} shortageQty 부족수량
   */
  popupShortage(productCode: string, productName: string, productQty: number, shortageQty: number) {
    setTimeout(() => {
      this.modal.openConfirm({
        title: this.title + ' 컨펌',
        message: `<p class="txt_info02 type02">${productCode}  ${productName} 수량이 <em class="fc_red">(${productQty})</em>개<br>` +
          `<em class="fc_red">${shortageQty}</em>개 수량이 더 필요합니다.</p> <span class="blck">해당 상품을 바코드로 스캔하세요!</span>`,
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        closeByEnter: true,
        modalId: ModalIds.ECPCONFIRMOV
      }).subscribe(
        () => {
          this.barcode.nativeElement.focus();
        }
      );
    }, 100);
  }

  /**
   * 없는 제품을 추가 했을 경우
   * @param {string} productCode 제품코드
   * @param {string} productName 제품명
   */
  popupNoProduct(productCode: string, productName: string) {
    setTimeout(() => {
      this.modal.openConfirm({
        title: this.title + ' 컨펌',
        message: `<p class="txt_info02 type02">${productCode}  ${productName} <br> 주문하지 않은 상품이 <em class="fc_red">1</em>개 담겼습니다.</p>`,
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        closeByEnter: true,
        modalId: ModalIds.ECPCONFIRMNO
      }).subscribe(
        () => {
          this.barcode.nativeElement.focus();
        }
      );
    }, 100);
  }

  close() {
    this.result = false;
    this.closeModal();
  }

}
