import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ModalComponent, ModalService, AlertService, Modal, SpinnerService, Logger } from '../../../core';
import { SearchService, PagerService, OrderService } from '../../../service';
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
              private logger: Logger,
              private orderService: OrderService,
              private searchService: SearchService,
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

  productConfirm(productCode: string): void {

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

  confirm() {
    // 완료 여부 확인

    // 이상이 있을 경우 메시지 전시
    if (true) {
      this.modal.openConfirm(
        {
          title: 'ECP 컨펌',
          message: '<p class="txt_info02 type02">120351K  글리스터 리후레셔 스프레이 수량이 <em class="fc_red">(0)</em>개<br>' +
                   '<em class="fc_red">(1)</em>개 수량이 더 필요합니다.</p> <span class="blck">해당 상품을 바코드로 스캔하세요!</span>',
          actionButtonLabel: '확인',
          closeButtonLabel: '취소',
          closeByClickOutside: false,
          modalId: 'ECPCONFIRM'
        }
      );
    }
  }

  close() {
    this.closeModal();
  }

}
