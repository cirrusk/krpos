import { ReceiptService } from './../../../service/receipt.service';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ModalComponent, ModalService, AlertService, Modal, SpinnerService, Logger } from '../../../core';
import { SearchService, PagerService, OrderService, MessageService } from '../../../service';
import { Pagination, OrderEntry, OrderHistoryList } from '../../../data';
import { Order } from '../../../data/models/order/order';
import { Utils } from '../../../core/utils';

@Component({
  selector: 'pos-ecp-confirm',
  templateUrl: './ecp-confirm.component.html'
})
export class EcpConfirmComponent extends ModalComponent implements OnInit, OnDestroy {
  private PAGE_SIZE = 5;

  @ViewChild('barcode') private barcode: ElementRef;

  private searchProductInfoSubscription: Subscription;
  private order: Order;
  entryList: Array<OrderEntry>;
  private orderList: OrderHistoryList;

  pager: Pagination;                 // pagination 정보
  currentOrderList: Array<OrderEntry>;
  totalCount: number;

  constructor(private modal: Modal,
              protected modalService: ModalService,
              private spinner: SpinnerService,
              private alert: AlertService,
              private messageService: MessageService,
              private logger: Logger,
              private orderService: OrderService,
              private searchService: SearchService,
              private receiptService: ReceiptService,
              private pagerService: PagerService) {
    super(modalService);
    this.init();
  }

  ngOnInit() {
    setTimeout(() => { this.barcode.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
    if (this.callerData.orderList) {
      this.orderList = this.callerData.orderList;
      this.getOrderDetail(this.orderList);
    }
  }

  ngOnDestroy() {
    if (this.searchProductInfoSubscription) { this.searchProductInfoSubscription.unsubscribe(); }
  }

  init() {
    this.pager = new Pagination();
    this.totalCount = 0;
    this.entryList = new  Array<OrderEntry>();
    this.currentOrderList = new  Array<OrderEntry>();
    this.orderList = new OrderHistoryList();
  }

  /**
   * 컨펌 리스트 조회
   * @param orderList
   */
  getOrderDetail(orderList: OrderHistoryList): void {
    const orderCodes = new Array<string>();
      orderList.orders.forEach(order => {
        orderCodes.push(order.code);
      });
      this.spinner.show();
      this.orderService.orderDetails(orderList.orders[0].user.uid, orderCodes).subscribe(
        orderDetail => {
          if (orderDetail) {
            this.entryList = orderDetail.orders[0].entries;
            this.setPage(Math.ceil(this.entryList.length / this.PAGE_SIZE));
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
  }

  /**
   * 상품 컨펌
   * @param productCode
   * @param page
   */
  productConfirm(productCode: string, page?: number): void {
    this.spinner.show();
    try {
      const existedIdx = this.entryList.findIndex(
        function (obj) {
          return obj.product.code === productCode;
        }
      );
      if (existedIdx !== -1) {
        this.spinner.hide();
        const confirmCount = this.entryList[existedIdx].ecpConfirmQty ? this.entryList[existedIdx].ecpConfirmQty : 0;

        if (this.entryList[existedIdx].quantity > confirmCount) {
          this.entryList[existedIdx].ecpConfirmQty = confirmCount + 1;
          this.setPage(page);
        } else {
          const errorCount = (confirmCount + 1) - this.entryList[existedIdx].quantity;
          this.popupExceed(this.entryList[existedIdx].product.code, this.entryList[existedIdx].product.name, this.entryList[existedIdx].quantity, errorCount);
        }
      } else {
        this.spinner.hide();
        this.popupShortage(this.entryList[existedIdx].product.code, this.entryList[existedIdx].product.name, this.entryList[existedIdx].quantity, 1);
      }
    } catch (e) {
      this.spinner.hide();
    }
  }

  /**
   * 출력 데이터 생성
   */
  setPage(page: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.pager.totalPages) && pagerFlag) {
      return;
    }

    // pagination 생성 데이터 조회
    this.pager = this.pagerService.getPager(this.entryList.length, page, this.PAGE_SIZE);
    // 출력 리스트 생성
    this.currentOrderList  = this.entryList.slice(this.pager.startIndex, this.pager.endIndex + 1);
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
    // 완료 여부 확인
    try {
      this.spinner.show();

      this.entryList.some(function (entry, index, arr) {
        if (!entry.ecpConfirmQty) {
          entry.ecpConfirmQty = 0;
        }
        // 부족
        if (entry.quantity > entry.ecpConfirmQty) {
          productCode = entry.product.code;
          productName = entry.product.name;
          productQty = entry.quantity;
          errorQty = entry.quantity - entry.ecpConfirmQty;
          errorType = 'S';
          return true;
          // 초과
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
      console.log(e);
      this.spinner.hide();
    }

    // 이상이 있을 경우 메시지 전시
    if (errorType === 'S') {
      this.spinner.hide();
      this.popupShortage(productCode, productName, productQty, errorQty);
    } else if (errorType === 'E') {
      this.spinner.hide();
      this.popupExceed(productCode, productName, productQty, errorQty);
    } else {
      this.spinner.hide();
      this.alert.info({ title: '',
                         message: this.messageService.get('ecpReceiptComplete'),
                         timer: true,
                         interval: 1000});
      this.close();
    }
  }

  receiptPrint() {
    // 영수증 출력

  }

  /**
   * 초과 팝업
   * @param productCode
   * @param productName
   * @param productQty
   * @param exceedQty
   */
  popupExceed(productCode: string, productName: string, productQty: number, exceedQty: number) {
    this.modal.openConfirm(
      {
        title: 'ECP 컨펌',
        message: `<p class="txt_info02 type02">${productCode}  ${productName} 수량이` +
                  `<em class="fc_red">${productQty}</em>개로<br>` +
                  `해당상품이 <em class="fc_red">${exceedQty}</em>개 더 담겼습니다.</p>`,
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        modalId: 'ECPCONFIRM'
      }
    );
  }

  /**
   * 수량이 더 필요할때 팝업
   * @param productCode
   * @param productName
   * @param productQty
   * @param shortageQty
   */
  popupShortage(productCode: string, productName: string, productQty: number, shortageQty: number) {
    this.modal.openConfirm(
      {
        title: 'ECP 컨펌',
        message: `<p class="txt_info02 type02">${productCode}  ${productName} 수량이 <em class="fc_red">(${productQty})</em>개<br>` +
                 `<em class="fc_red">${shortageQty}</em>개 수량이 더 필요합니다.</p> <span class="blck">해당 상품을 바코드로 스캔하세요!</span>`,
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        modalId: 'ECPCONFIRM'
      }
    );
  }

  /**
   * 없는 제품을 추가 했을 경우
   * @param productCode
   */
  popupNoProduct(productCode: string) {
    const productName = '아이템';
    this.modal.openConfirm(
      {
        title: 'ECP 컨펌',
        message: `<p class="txt_info02 type02">${productCode}  ${productName} <br> 주문하지 않은 상품이 <em class="fc_red">1</em>개 담겼습니다.</p>`,
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        modalId: 'ECPCONFIRM'
      }
    );
  }

  close() {
    this.closeModal();
  }

}
