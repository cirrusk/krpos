import { Component, OnInit, ElementRef, ViewChild, Renderer2, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Pagination, OrderHistoryList, OrderHistory } from '../../data';
import { MessageService, OrderService } from '../../service';
import { Modal, Logger, AlertService } from '../../core';
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
    this.orderHistoryList.orders = new Array<OrderHistory>();
    this.orderHistoryList.pagination = new Pagination();
    this.selectedOrderNum = -1;
    this.searchType = 'abo';
  }

  /**
   * 주문 상세 팝업 전시
   * @param {number} index     row번호
   * @param {string} orderCode 주문번호
   * @param {string} userId    사용자아이디
   */
  activeRowCart(index: number, orderCode: string): void {
    this.selectedOrderNum = index;
    this.popupOrderDetail(orderCode);
  }

  /**
   * 맴버타입별 초기화 및 Disable 처리
   * @param {string} memberType 사용자유형
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
   * @param {string}} orderCode
   */
  popupOrderDetail(orderCode: string) {
    const existedIdx: number = this.orderHistoryList.orders.findIndex(
      function (obj) {
        return obj.code === orderCode;
      }
    );

    if (existedIdx !== -1) {
      this.modal.openModalByComponent(OrderDetailComponent, {
        callerData: { orderInfo: this.orderHistoryList.orders[existedIdx] },
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
   * @param {string} _memberType 사용자유형
   * @param {string} _searchText 검색어
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
   * @param {string} searchType 검색유형
   * @param {string} memberType 사용자유형
   * @param {string} searchText 검색어
   * @param {number} page       페이지번호
   */
  getOrderList(searchType: string, memberType: string, searchText: string, page: number) {
    this.orderListSubscription = this.orderService.orderList(searchText, memberType,
      searchType, 'NORMAL_ORDER', 'pos,Web,WebMobile', 'pickup', false, false, page, this.PAGE_SIZE).subscribe(
        resultData => {
          if (resultData) {
            this.orderHistoryList = resultData;
          }
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.set('order-complete.component', `Get order list error type : ${errdata.type}`).error();
            this.logger.set('order-complete.component', `Get order list error message : ${errdata.message}`).error();
            this.alert.error({ message: this.messageService.get('server.error', errdata.message), timer: true, interval: 1500 });
            setTimeout(() => { this.inputSearchText.nativeElement.focus(); this.inputSearchText.nativeElement.select(); }, 1550);
          }
        });
  }

  /**
   * 주문완료 내역 페이지 이동
   * @param {number} page 페이지번호
   */
  setPage(page: number) {
    if (page > -1 && page < this.orderHistoryList.pagination.totalPages) {
      this.getOrderList(this.searchType, this.memberType, this.searchText, page);
    }
  }

  /**
   * order 페이지 이동
   */
  goOrder() {
    this.router.navigate(['/order']);
  }

  /**
   * 초기화
   *  - 취소버튼
   */
  initialize() {
    setTimeout(() => { this.inputSearchText.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
    this.inputSearchText.nativeElement.value = '';
    this.searchMemberType.nativeElement.value = 'A';
    this.changeMemberType('A');
    this.init();
  }
}
