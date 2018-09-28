import { Component, OnInit, ElementRef, ViewChild, Renderer2, OnDestroy, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Pagination, OrderHistoryList, OrderHistory, SearchMemberType, ModalIds, KeyCode } from '../../data';
import { MessageService, OrderService } from '../../service';
import { Modal, Logger, AlertService, KeyboardService, KeyCommand, StorageService, SpinnerService } from '../../core';
import { OrderDetailComponent } from '../../modals/order/order-detail/order-detail.component';
import { Utils } from '../../core/utils';

@Component({
  selector: 'pos-order-complete',
  templateUrl: './order-complete.component.html'
})
export class OrderCompleteComponent implements OnInit, OnDestroy {
  private orderListSubscription: Subscription;
  private keyboardsubscription: Subscription;
  private regexOnlyNum: RegExp = new RegExp(/^[0-9]+(\.[0-9]*){0,1}$/g); // 숫자만
  private regex: RegExp = /[^0-9]+/g;
  private regexMobile: RegExp = /^\d{3}\d{3,4}\d{4}$/;
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'Delete', 'ArrowLeft', 'ArrowRight'];
  private searchMemType: string;
  @Input() chkSearchTypeABO = true;
  @Input() chkSearchTypeC = false;
  @ViewChild('inputSearchText') private inputSearchText: ElementRef;
  @ViewChild('searchMemberType') private searchMemberType: ElementRef;
  @ViewChild('searchType1') private searchTypeABO: ElementRef;
  @ViewChild('searchType2') private searchTypeC: ElementRef;

  PAGE_SIZE = 7;
  orderHistoryList: OrderHistoryList;
  selectedOrderNum: number;
  searchType: string;
  memberType: string;
  searchText: string;

  // spinnerService 는 HostListener 사용중
  constructor(private router: Router,
    private modal: Modal,
    private orderService: OrderService,
    private alert: AlertService,
    private messageService: MessageService,
    private keyboard: KeyboardService,
    private storage: StorageService,
    private spinnerService: SpinnerService,
    private renderer: Renderer2,
    private logger: Logger,
    private element: ElementRef) {
    this.init();

  }

  ngOnInit() {
    this.spinnerService.init();
    this.keyboardsubscription = this.keyboard.commands.subscribe(c => {
      this.handleKeyboardCommand(c);
    });
    setTimeout(() => { this.inputSearchText.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
  }

  ngOnDestroy() {
    if (this.orderListSubscription) { this.orderListSubscription.unsubscribe(); }
    if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
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
  changeMemberType(memberType: string, memIndex: number) {
    this.searchMemType = memberType;
    if (memIndex === -1) {
      this.searchMemberType.nativeElement.value = SearchMemberType.ABO;
    }
    if (this.searchMemType === SearchMemberType.CONSUMER) {
      this.inputSearchText.nativeElement.value = '';
    }
    if (memberType === SearchMemberType.CONSUMER) {
      this.renderer.removeAttribute(this.searchTypeC.nativeElement, 'disabled');
      this.renderer.setAttribute(this.searchTypeABO.nativeElement, 'disabled', 'disabled');
      this.chkSearchTypeABO = false;
      this.chkSearchTypeC = true;
      this.inputSearchText.nativeElement.focus();
      this.inputSearchText.nativeElement.select();
    } else {
      this.renderer.removeAttribute(this.searchTypeABO.nativeElement, 'disabled');
      this.renderer.setAttribute(this.searchTypeC.nativeElement, 'disabled', 'disabled');
      this.chkSearchTypeABO = true;
      this.chkSearchTypeC = false;
      this.inputSearchText.nativeElement.focus();
      this.inputSearchText.nativeElement.select();
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
        modalId: ModalIds.ORDERDETAIL
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
    if (_searchText.trim() === '' || _searchText === undefined || _searchText === null) {
      this.inputSearchText.nativeElement.value = '';
      this.alert.info({ message: this.messageService.get('noSearchText'), timer: true, interval: 1500 });
      setTimeout(() => { this.inputSearchText.nativeElement.focus(); }, 1520);
    } else {
      this.memberType = _memberType;
      if (this.memberType === SearchMemberType.CONSUMER) {
        if (!this.regexMobile.test(_searchText)) {
            this.alert.warn({ message: '잘못된 휴대폰 번호입니다.', timer: true, interval: 1500 });
            setTimeout(() => { this.inputSearchText.nativeElement.focus(); }, 1520);
            return;
        }
      }
      this.searchText = _searchText.trim();
      this.searchType = this.memberType === SearchMemberType.CONSUMER ? 'phone' : 'abo';
      this.inputSearchText.nativeElement.value = this.searchText;
      this.getOrderList(this.searchType, this.memberType, this.searchText, 0);
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
            setTimeout(() => { this.inputSearchText.nativeElement.focus(); this.inputSearchText.nativeElement.select(); }, 50);
          }
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.set('order-complete.component', `Get order list error type : ${errdata.type}`).error();
            this.logger.set('order-complete.component', `Get order list error message : ${errdata.message}`).error();
            this.alert.error({ message: errdata.message, timer: true, interval: 1500 });
            setTimeout(() => { this.inputSearchText.nativeElement.focus(); this.inputSearchText.nativeElement.select(); }, 1520);
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
    this.searchMemberType.nativeElement.value = SearchMemberType.ABO;
    this.changeMemberType(SearchMemberType.ABO, 0);
    this.init();
  }

  protected doArrowUp(evt: KeyboardEvent) { }
  protected doArrowDown(evt: KeyboardEvent) { }
  protected doArrowLeft(evt: KeyboardEvent) { }
  protected doArrowRight(evt: KeyboardEvent) { }

  /**
   * 이전 페이지 이동하기
   *
   * @param evt 키 이벤트
   */
  protected doPageDown(evt: KeyboardEvent) {
    if (this.orderHistoryList.orders.length === 0) { evt.preventDefault(); return; }
    this.selectedOrderNum = -1;
    if (this.orderHistoryList.pagination.currentPage === 0) {
    } else {
      this.setPage(this.orderHistoryList.pagination.currentPage - 1);
    }
  }

  /**
   * 다음 페이지 이동하기
   *
   * @param evt 키 이벤트
   */
  protected doPageUp(evt: KeyboardEvent) {
    if (this.orderHistoryList.orders.length === 0) { evt.preventDefault(); return; }
    this.selectedOrderNum = -1;
    if (this.orderHistoryList.pagination.currentPage === this.orderHistoryList.pagination.totalPages - 1) {
    } else {
      this.setPage(this.orderHistoryList.pagination.currentPage + 1);
    }
  }

  private handleKeyboardCommand(command: KeyCommand) {
    try {
      const modal = this.storage.getLatestModalId();
      if (modal !== ModalIds.ORDERDETAIL) {
        this[command.name](command.ev);
      }
    } catch (e) {
      this.logger.set('order.complete.component', `[${command.combo}] key event, [${command.name}] undefined function!`).info();
    }
  }

  @HostListener('document:keydown', ['$event', 'this.spinnerService.status()'])
  onKeyBoardDown(event: any, isSpinnerStatus: boolean) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER && !isSpinnerStatus) {
      const modal = this.storage.getLatestModalId();
      if (modal !== ModalIds.ORDERDETAIL) {
        const order: any = this.orderHistoryList.orders.find((obj, i) => {
          return i === this.selectedOrderNum;
        });
        if (order) {
          this.activeRowCart(this.selectedOrderNum, order.code);
        }
      }
    }
  }

  /**
   * 소비자인 경우 INPUT에 휴대폰번호(숫자)만 입력되도록 처리
   *
   * @param evt 키보드 이벤트
   */
  @HostListener('input', ['$event'])
  onInputKeyDown(evt: any) {
    if (evt.target.tagName === 'SELECT') { return; }
    if (this.searchMemType === SearchMemberType.CONSUMER) {
      if (this.specialKeys.indexOf(evt.key) !== -1) {
        return;
      }
      evt.target.value = evt.target.value.replace(this.regex, '');
      let current: string = this.element.nativeElement.value;
      current = current ? current : '';
      const next: string = current.concat(evt.key);
      if (next && !String(next).match(this.regexOnlyNum)) {
        evt.preventDefault();
      }
    }
  }
}
