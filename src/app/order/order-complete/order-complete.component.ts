import { Component, OnInit, ElementRef, ViewChild, Renderer2, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Pagination, OrderHistoryList, OrderHistory } from '../../data';
import { MessageService, OrderService } from '../../service';
import { Modal, Logger, SpinnerService, AlertService } from '../../core';
import { Utils } from '../../core/utils';
import { Subscription } from 'rxjs/Subscription';
import { OrderDetailComponent } from '../../modals/order/order-detail/order-detail.component';


@Component({
  selector: 'pos-order-complete',
  templateUrl: './order-complete.component.html'
})
export class OrderCompleteComponent implements OnInit, OnDestroy {
  private PAGE_SIZE = 7;
  private orderListSubscription: Subscription;

  @Input() chkSearchTypeABO = true;
  @Input() chkSearchTypeC = false;
  @ViewChild('inputSearchText') private inputSearchText: ElementRef;
  @ViewChild('searchMemberType') private searchMemberType: ElementRef;
  @ViewChild('searchType1') private searchTypeABO: ElementRef;
  @ViewChild('searchType2') private searchTypeC: ElementRef;

  orderHistoryList: OrderHistoryList;
  selectedOrderNum: number;
  searchType: string;
  memberType: string;
  searchText: string;

  constructor(private router: Router,
              private modal: Modal,
              private orderService: OrderService,
              private spinner: SpinnerService,
              private alert: AlertService,
              private messageService: MessageService,
              private renderer: Renderer2,
              private logger: Logger) {
    this.init();

  }

  ngOnInit() {
    setTimeout(() => { this.inputSearchText.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
  }

  ngOnDestroy() {
    if (this.orderListSubscription) { this.orderListSubscription.unsubscribe(); }
  }

  init() {
    this.orderHistoryList = new OrderHistoryList();
    this.orderHistoryList.orders =  new Array<OrderHistory>();
    this.orderHistoryList.pagination = new Pagination();
    this.selectedOrderNum = -1;
    this.searchType = 'abo';
  }

  /**
   * 주문 상세 팝업 전시
   * @param index
   * @param orderCode
   * @param userId
   */
  activeRowCart(index: number, orderCode: string, userId: string): void {
    this.selectedOrderNum = index;
    this.popupOrderDetail(orderCode, userId);
  }

  /**
   * 맴버타입별 초기화 및 Disable 처리
   * @param memberType
   */
  changeMemberType(memberType: string) {
    if (memberType === 'C') {
      this.renderer.removeAttribute(this.searchTypeC.nativeElement, 'disabled');
      this.renderer.setAttribute(this.searchTypeABO.nativeElement, 'disabled', 'disabled');
      this.chkSearchTypeABO = false;
      this.chkSearchTypeC = true;
      this.searchType = 'phone';
    } else {
      this.renderer.removeAttribute(this.searchTypeABO.nativeElement, 'disabled');
      this.renderer.setAttribute(this.searchTypeC.nativeElement, 'disabled', 'disabled');
      this.chkSearchTypeABO = true;
      this.chkSearchTypeC = false;
      this.searchType = 'abo';
    }
  }

  /**
   * 주문 상세 팝업 호출
   * @param orderCode
   * @param userId
   */
  popupOrderDetail(orderCode: string, userId: string) {
    const existedIdx: number = this.orderHistoryList.orders.findIndex(
      function (obj) {
        return obj.code === orderCode;
      }
    );

    if (existedIdx !== -1) {
      this.modal.openModalByComponent(OrderDetailComponent,
        {
          callerData: { orderInfo : this.orderHistoryList.orders[existedIdx] },
          actionButtonLabel: '선택',
          closeButtonLabel: '취소',
          modalId: 'OrderDetailComponent'
        }
      ).subscribe(result => {
        if (result) {
          this.getOrderList(this.searchType, this.memberType, this.searchText, this.orderHistoryList.pagination.currentPage);
        }
      });
    }
  }

  /**
   * 주문 조회
   * @param _memberType
   * @param _searchText
   */
  searchOrder(_memberType: string, _searchText: string) {
    if (_searchText === '' || _searchText === undefined || _searchText === null) {
      this.alert.info({ message: this.messageService.get('noSearchText') });
    } else {
      this.memberType = _memberType;
      this.searchText = _searchText;
      this.getOrderList(this.searchType, _memberType, _searchText, 0);
    }
  }

  /**
   * 주문 리스트 조회
   * @param searchType
   * @param memberType
   * @param searchText
   * @param page
   */
  getOrderList(searchType: string, memberType: string, searchText: string, page: number) {
    this.spinner.show();
    this.orderListSubscription = this.orderService.orderList(searchText, memberType,
                                                             searchType, 'NORMAL_ORDER', 'pos,Web,WebMobile', 'pickup', false, false, page, this.PAGE_SIZE).subscribe(
      resultData => {
        if (resultData) {
          this.orderHistoryList = resultData;
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
   * 주문완료 내역 페이지 이동
   * @param page
   */
  setPage(page: number) {
    if (page > -1 && page < this.orderHistoryList.pagination.totalPages ) {
      this.getOrderList(this.searchType, this.memberType, this.searchText, page);
    }
  }

  /**
   * order 페이지 이동
   */
  goOrder() {
    this.router.navigate(['/order']);
  }

  initialize() {
    setTimeout(() => { this.inputSearchText.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
    this.inputSearchText.nativeElement.value = '';
    this.searchMemberType.nativeElement.value = 'A';
    this.changeMemberType('A');
    this.init();
  }
}
