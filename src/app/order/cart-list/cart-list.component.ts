import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import {
  SerialComponent, SearchAccountComponent, ClientAccountComponent, SearchProductComponent,
  HoldOrderComponent, RestrictComponent, UpdateItemQtyComponent
} from '../../modals';
import { Modal, StorageService, AlertService, Logger, Config, PrinterService } from '../../core';

import { CartService, PagerService, SearchService, MessageService, PaymentService } from '../../service';
import { SearchAccountBroker, RestoreCartBroker, CancleOrderBroker, InfoBroker, PaymentBroker } from '../../broker';
import {
  Accounts, SearchParam, CartInfo, CartModification, OrderEntry, Pagination, RestrictionModel, KeyCode,
  ResCartInfo, MemberType, PaymentCapture, AmwayExtendedOrdering, AbstractOrder, ProductInfo
} from '../../data';
import { Cart } from '../../data/models/order/cart';
import { Product } from '../../data/models/cart/cart-data';
import { Order, OrderList } from '../../data/models/order/order';
import { Utils } from '../../core/utils';

/**
 * 장바구니(Cart) 리스트 컴포넌트
 */
@Component({
  selector: 'pos-cart-list',
  templateUrl: './cart-list.component.html'
})
export class CartListComponent implements OnInit, OnDestroy {
  GROUP_ACCOUNT_PAGE_SIZE = 10;
  private cartInfoSubscription: Subscription;
  private accountInfoSubscription: Subscription;
  private updateVolumeAccountSubscription: Subscription;
  private addCartSubscription: Subscription;
  private updateCartSubscription: Subscription;
  private removeEntrySubscription: Subscription;
  private removeCartSubscription: Subscription;
  private restoreCartSubscription: Subscription;
  private cancleCartSubscription: Subscription;
  private cartListSubscription: Subscription;
  private productInfoSubscription: Subscription;
  private copyCartEntriesSubscription: Subscription;
  private updateItemQtySubscription: Subscription;
  private searchSubscription: Subscription;
  private infoSubscription: Subscription;
  private paymentsubscription: Subscription;
  private paymentChangesubscription: Subscription;

  private searchParams: SearchParam;                                        // 조회 파라미터
  private cartInfo: CartInfo;                                               // 장바구니 기본정보
  private productInfo: OrderEntry;                                          // 상품 정보
  private addCartModel: CartModification[];                                 // 장바구니 담기 응답모델
  private updateCartModel: CartModification;                                // 장바구니 수정 응답모델
  private pager: Pagination;                                                // pagination 정보
  private selectedCartNum: number;                                          // 선택된 카트번호
  private restrictionModel: RestrictionModel;                               // 상품 제한 메시지(ERROR)
  private restrictionMessageList: Array<RestrictionModel>;                  // 상품 제한 메시지 리스트(ERROR)
  private resCartInfo: ResCartInfo;                                         // Cart 정보
  private domain: string;                                                   // api root 도메인
  private serialNumbers: Array<string>;                                     // Serial 정보 받기
  private rfids: Array<string>;                                             // RFID 정보 받기

  accountInfo: Accounts;                                                    // 사용자 정보
  groupAccountInfo: Array<Accounts>;                                        // 그룹 사용자 정보
  currentGroupAccountInfo: Array<Accounts>;                                 // 그룹 사용자 정보()
  userPager: Pagination;                                                    // 그룹 사용자 페이징
  searchMode: string;                                                       // 조회 모드
  cartList: Array<OrderEntry>;                                              // 장바구니 리스트
  currentCartList: Array<OrderEntry>;                                       // 출력 장바구니 리스트
  totalItem: number;                                                        // 총 수량
  totalPrice: number;                                                       // 총 금액
  totalPV: number;                                                          // 총 PV
  totalBV: number;                                                          // 총 Bv
  cartListCount: number;                                                    // 카트 목록 개수
  balance: number;                                                          // 회원 포인트
  recash: number;                                                           // 회원 Re-Cash
  orderType: string;                                                        // 결제타입(일반 = n, 그룹 = g)
  ccamount: number;                                                         // 신용카드 결제금액
  installment: string;                                                      // 카드 할부
  cashamount: number;                                                       // 현금 결제금액
  pointamount: number;                                                      // 포인트 사용금액
  recashamount: number;                                                     // Recash 사용금액
  ddamount: number;                                                         // 자동이체 사용금액
  discount: number;                                                         // 할인금액
  received: number;                                                         // 낸 금액
  change: number;                                                           // 거스름돈
  selectedUserIndex = -1;                                                   // 그룹주문 선택한 유저 Table 상의 index
  selectedUserId: string;
  apprtype: string;
  memberType = MemberType;                                                  // HTML 사용(enum)
  searchValid: FormControl = new FormControl('');
  // 그룹
  amwayExtendedOrdering: AmwayExtendedOrdering;
  groupSelectedCart: AbstractOrder;
  // 결제수단변경
  orderList: OrderList;
  paymentChange: boolean;

  @ViewChild('searchText') private searchText: ElementRef;                  // 입력창
  @Output() public posCart: EventEmitter<any> = new EventEmitter<any>();    // 카트에서 이벤트를 발생시켜 메뉴컴포넌트에 전달
  @Input() public noticeList: string[] = [];                                // 캐셔용 공지사항

  constructor(private modal: Modal,
    private cartService: CartService,
    private searchService: SearchService,
    private storage: StorageService,
    private alert: AlertService,
    private pagerService: PagerService,
    private payment: PaymentService,
    private message: MessageService,
    private searchAccountBroker: SearchAccountBroker,
    private restoreCartBroker: RestoreCartBroker,
    private cancleOrderBroker: CancleOrderBroker,
    private info: InfoBroker,
    private paymentBroker: PaymentBroker,
    private config: Config,
    private printerService: PrinterService,
    private logger: Logger) {
    this.cartListCount = this.config.getConfig('cartListCount');
    this.domain = this.config.getConfig('apiDomain');
    this.init();

    // 주문 완료 후 화면 초기화
    this.infoSubscription = this.info.getInfo().subscribe(
      result => {
        const type = result && result.type;
        if (result !== null && type === 'orderClear') {
          this.init();
        } else if (result != null && type === 'payinfo') {
          const data = result.data;
          this.retreiveInfo(data[0], data[1]);
        } else if (result != null && type === 'recart') {
          this.copyCartByEntries(this.accountInfo, this.cartList);
        }
      }
    );

    // 결제수단 변경
    this.paymentChangesubscription = this.paymentBroker.getInfo().subscribe(
      result => {
        const type = result && result.type;
        if (result != null && type === 'paymentChange') {
          this.orderType = 'n';
          this.paymentChange = true;
          this.orderList = result.data;
          this.selectAccountInfo(this.searchMode, this.orderList.orders[0].user.uid);
        }
      }
    );

    // 그룹 회원 선택
    this.accountInfoSubscription = this.searchAccountBroker.getInfo().subscribe(
      accountInfo => {
        if (accountInfo && accountInfo.type === 'g') {
          if (this.orderType === '' || this.orderType === 'g') {
            if (this.orderType === '') {
              this.orderType = 'g';
            }
            this.getAccountAndSaveCart(accountInfo.data);
          }
        } else if (accountInfo && accountInfo.type === 'n') {
          if (this.orderType === '') {
            this.orderType = 'n';
          }
          this.getAccountAndSaveCart(accountInfo.data);
        }
      }
    );

    // 보류 복원
    this.restoreCartSubscription = this.restoreCartBroker.getInfo().subscribe(
      result => {
        if (result) {
          this.accountInfo = new Accounts();
          this.accountInfo = result.volumeABOAccount;
          const jsonData = { 'parties': [result.user] };
          Object.assign(this.accountInfo, jsonData);
          this.sendRightMenu('a', true, this.accountInfo);
          // this.storage.setCustomer(this.accountInfo);
          this.getBalanceInfo(); // 회원의 포인트와 Re-Cash 조회(Account에 포함하여 setCustomer로 이벤트 전송)
          this.cartInfo.code = result.code;
          this.cartInfo.user = result.user;
          this.cartInfo.volumeABOAccount = result.volumeABOAccount;
          this.cartInfo.guid = result.guid;
          this.restoreSavedCart();
        }
      }
    );

    // 주문 취소
    this.cancleCartSubscription = this.cancleOrderBroker.getInfo().subscribe(
      result => {
        if (result === 'delCart') {
          if (this.orderType === 'n') {
            this.removeCart();
          } else {
            this.removeGroupCart();
          }
        }
      }
    );
  }

  ngOnInit() {
    this.checkChar();
    this.printerService.init();
    setTimeout(() => { this.searchText.nativeElement.focus(); }, 100);
  }

  ngOnDestroy() {
    if (this.cartInfoSubscription) { this.cartInfoSubscription.unsubscribe(); }
    if (this.accountInfoSubscription) { this.accountInfoSubscription.unsubscribe(); }
    if (this.updateVolumeAccountSubscription) { this.updateVolumeAccountSubscription.unsubscribe(); }
    if (this.addCartSubscription) { this.addCartSubscription.unsubscribe(); }
    if (this.removeEntrySubscription) { this.removeEntrySubscription.unsubscribe(); }
    if (this.removeCartSubscription) { this.removeCartSubscription.unsubscribe(); }
    if (this.updateCartSubscription) { this.updateCartSubscription.unsubscribe(); }
    if (this.restoreCartSubscription) { this.restoreCartSubscription.unsubscribe(); }
    if (this.cancleCartSubscription) { this.cancleCartSubscription.unsubscribe(); }
    if (this.cartListSubscription) { this.cartListSubscription.unsubscribe(); }
    if (this.productInfoSubscription) { this.productInfoSubscription.unsubscribe(); }
    if (this.copyCartEntriesSubscription) { this.copyCartEntriesSubscription.unsubscribe(); }
    if (this.updateItemQtySubscription) { this.updateItemQtySubscription.unsubscribe(); }
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    if (this.infoSubscription) { this.infoSubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.paymentChangesubscription) { this.paymentChangesubscription.unsubscribe(); }
  }

  /**
   * 한글이나 특수문자 제거
   * @ignore
   */
  private checkChar() {
    // const spcExp: RegExp = new RegExp(/[`~!@#$%^&*\\\'\";:\/()_+|<>?{}\[\]]]/g);
    // const engExp: RegExp = new RegExp(/[a-z]/gi);
    // const numExp: RegExp = new RegExp(/[0-9]/g);
    // const numEngDelExp: RegExp = new RegExp(/[^0-9a-zA-Z]/g);
    // this.searchValid.valueChanges
    //   .debounceTime(50)
    //   .subscribe(v => {
    //     if (v) {
    //       if (!spcExp.test(v) || !engExp.test(v) || !numExp.test(v)) {
    //         this.searchText.nativeElement.value = v.replace(numEngDelExp, '');
    //       }
    //     }
    //   });
  }

  /**
   * 메뉴에서 전달한 타입 정보를 받음.
   * @param {any} data 타입정보
   */
  setType(data) {
    if (data) {
      this.apprtype = data.type;
    }
  }

  /**
   * 메뉴에서 전달한 프로모션 상품코드를 받음.
   * @param {any} data 프로모션 상품코드
   */
  setPromotion(data) {
    if (data && data.product) {
      this.searchMode = 'P';
      this.popupSearch(data.product);
    }
  }

  /**
   * 메뉴에서 파이토 카페 선택 시 전달된 이벤트 받아
   * 파이토 카페 회원 설정
   * @param {any} data 파이토 카페 여부
   */
  setPytoCafe(data) {
    if (data && data.pytocafe) {
      this.searchPhytoCafeAccount();
    }
  }

  /**
   * 변수 초기화
   */
  private init() {
    this.accountInfo = null;
    this.cartInfo = new CartInfo();
    this.cartList = new Array<OrderEntry>();
    this.currentCartList = new Array<OrderEntry>();
    this.productInfo = new OrderEntry();
    this.searchParams = new SearchParam();
    this.searchMode = 'A';
    this.orderType = '';
    this.totalItem = 0;
    this.totalPrice = 0;
    this.totalPV = 0;
    this.totalBV = 0;
    this.selectedCartNum = -1;
    this.ccamount = 0;
    this.cashamount = 0;
    this.pointamount = 0;
    this.recashamount = 0;
    this.ddamount = 0;
    this.discount = 0;
    this.received = 0;
    this.change = 0;
    this.installment = '';
    this.selectedUserIndex = -1;
    this.apprtype = '';
    this.paymentChange = false;
    this.pager = new Pagination();
    this.userPager = new Pagination();
    this.resCartInfo = new ResCartInfo();
    this.restrictionModel = new RestrictionModel();
    this.restrictionMessageList = Array<RestrictionModel>();
    this.groupAccountInfo = new Array<Accounts>();
    this.currentGroupAccountInfo = new Array<Accounts>();
    this.groupSelectedCart = new AbstractOrder();
    this.sendRightMenu('all', false);
    // client 초기화 : 결제가 완료되면 이 함수를 타고 customer 화면 초기화수행!
    this.storage.setLocalItem('clearclient', {});
    this.storage.removeLocalItem('clearclient');
    this.selectedUserId = '';
    this.initSerialRfid();
    setTimeout(() => { this.searchText.nativeElement.focus(); }, 250); // 초기화된 후에는 포커스 가도록
  }

  /**
   * Serial 과 RFID 변수 초기화
   */
  private initSerialRfid() {
    this.serialNumbers = new Array<string>();
    this.rfids = new Array<string>();
  }

  /**
   * Search 모드 변경
   * 상품검색일 경우 입력창에 포커스
   *
   * @param {string} mode 검색 모드
   */
  activeSearchMode(mode: string): void {
    setTimeout(() => { this.searchText.nativeElement.value = ''; this.searchText.nativeElement.focus(); }, 90);
    this.searchMode = mode;
  }

  /**
   * 현재 선택한 로우
   * @param {number} index 선택 로우 넘버
   */
  activeRowCart(index: number): void {
    this.selectedCartNum = index;
  }

  /**
   * 검색 팝업 호출
   * @param {string} searchText 검색어
   */
  popupSearch(searchText: string): void {
    const searchKey = searchText.toUpperCase();
    this.searchParams.searchMode = this.searchMode;
    this.searchParams.searchText = searchKey;
    if (this.searchMode === 'A') { // 회원검색
      this.selectAccountInfo(this.searchMode, searchText);
    } else { // 상품 검색
      if (this.cartInfo.code === undefined) { // 카트가 생성되지 않았을 경우
        this.createCartInfo(true, searchKey);
      } else {
        if (this.orderType === 'n') {
          this.selectProductInfo(searchKey);
        } else {
          const uid = this.selectedUserId;
          const existedIdx: number = this.amwayExtendedOrdering.orderList.findIndex(
            function (obj) {
              return obj.volumeABOAccount.uid === uid;
            }
          );

          if (existedIdx === -1) {
            this.createGroupCart(this.cartInfo.user.uid, this.cartInfo.code, this.selectedUserId, true, searchKey);
          } else {
            this.selectProductInfo(searchKey);
          }
        }
      }
    }
  }

  /**
   * 유저 정보 검색
   * @param {any} params 검색 파라미터값
   */
  callSearchAccount(params?: any): void {
    this.modal.openModalByComponent(SearchAccountComponent, {
      callerData: { data: params },
      actionButtonLabel: '선택',
      closeButtonLabel: '취소',
      orderType: this.orderType !== '' ? this.orderType : 'n',
      modalId: 'SearchAccountComponent'
    }).subscribe(result => {
      if (result) {
        if (this.orderType === '') {
          this.orderType = 'n';
        }
        this.getAccountAndSaveCart(result); // 검색하여 선택한 회원으로 출력 및 Cart 생성
      }
    });
  }

  /**
   * 상품 검색
   * 상품 검색 후 입력창에 포커스가 있어야함.
   * 이유 : 스캐너가 read 한 값을 올바르게 받음.
   *
   * @param {any} params 검색 파라미터값
   */
  callSearchProduct(params?: any): void {
    this.modal.openModalByComponent(SearchProductComponent, {
      callerData: { data: params },
      actionButtonLabel: '선택',
      closeButtonLabel: '취소',
      modalId: 'SearchProductComponent'
    }).subscribe(data => {
      if (data) {
        this.setSerialAndRfids(data);
        this.addToCart(data.productCode);
      }
      setTimeout(() => { this.searchText.nativeElement.focus(); }, 100);
    });
  }

  /**
   * 상품 수량 수정 팝업
   * Serial 이 있는 상품의 경우 수량변경 불가
   * 사유 : 이미 Add to Cart 한 상품에 대해서 수량 증/감에 따른 Serial 처리 불가
   */
  callUpdateItemQty() {
    if (this.selectedCartNum === -1) {
      this.alert.warn({ message: this.message.get('selectProductUpdate') });
    } else {
      const selectedCart = this.currentCartList[this.selectedCartNum];
      // if (selectedCart.product.serialNumber) {
      //   this.alert.warn({ message: 'Serial이 있는 상품은 개별 스캔해주세요.' });
      //   this.selectedCartNum = -1;
      //   return;
      // }
      const code = selectedCart.product.code;
      const qty = selectedCart.quantity;
      const cartId = this.orderType === 'g' ? this.groupSelectedCart.code : this.cartInfo.code;
      this.modal.openModalByComponent(UpdateItemQtyComponent, {
        callerData: { code: code, qty: qty, product: selectedCart.product },
        actionButtonLabel: '선택',
        closeButtonLabel: '취소',
        modalId: 'UpdateItemQtyComponent'
      }).subscribe(result => {
        if (result) {
          const product: ProductInfo = selectedCart.product;
          // RFID, SERIAL 입력 받음.
          if (product && (product.rfid || product.serialNumber)) {
            this.modal.openModalByComponent(SerialComponent, {
              callerData: { productInfo: product, cartQty: qty, productQty: result.qty },
              closeByClickOutside: false,
              modalId: 'SerialComponent'
            }).subscribe(data => {
              if (data) {
                this.setSerialAndRfids(data);
                this.updateItemQtyCart(cartId, result.code, result.qty);
              }
            });
          } else {
            this.updateItemQtyCart(cartId, result.code, result.qty);
          }
        }
      });
    }
  }

  /**
   * 비회원 가입 팝업
   */
  popupNewAccount() {
    this.storage.setLocalItem('nc', 'Y'); // 클라이언트 화면에 팝업 띄우기 위해 이벤트 전달
    this.modal.openModalByComponent(ClientAccountComponent, {
      modalId: 'ClientAccountComponent'
    }).subscribe(result => {
      if (result) {
        this.getAccountAndSaveCart(result); // 검색하여 선택한 회원으로 출력 및 Cart 생성
      }
    });
  }

  /**
   * 보류 내역 조회
   * 보류 건수가 존재 하지 않을 경우 띄우지 않음.
   */
  holdOrder() {
    this.modal.openModalByComponent(HoldOrderComponent, {
      callerData: { userId: this.accountInfo.uid },
      closeByClickOutside: false,
      modalId: 'HoldOrderComponent'
    });
  }

  /**
   * 회원 검색 결과를 받아 화면에 설정하고 Cart 생성
   *
   * @param account 회원정보
   */
  private getAccountAndSaveCart(account: Accounts) {
    if (this.accountInfo && this.orderType === 'n') {
      this.sendRightMenu('a', true, account);
      this.changeUser(account);
    } else {
      // 그룹 결제시
      if (this.orderType === 'g') {
        // ordering주문자 저장
        if (this.accountInfo === null) {
          this.accountInfo = account;
          this.sendRightMenu('a', true, account);
        }
        // 그룹 주문 사용자 중복확인
        if (this.checkGroupUserId(account.uid) === -1) {
          this.groupAccountInfo.push(account);
          // 그룹주문 사용자 페이징처리
          this.setUserPage(Math.ceil(this.groupAccountInfo.length / this.GROUP_ACCOUNT_PAGE_SIZE));
          // 그룹주문 장바구니 생성되어 있는경우 새로운 사용자로 장바구니 초기화
          if (this.amwayExtendedOrdering && this.amwayExtendedOrdering.orderList.length > 0) {
            this.sendRightMenu('p', false);
            this.cartList.length = 0;
            this.storage.setOrderEntry(this.cartList);
            this.setPage(Math.ceil(this.cartList.length / this.cartListCount));
          }
        } else {
          this.alert.info({
            message: this.message.get('addedABO'),
            timer: true,
            interval: 1500
          });
        }
      } else {
        this.accountInfo = account;
        this.sendRightMenu('a', true, account);
        // 결제수단변경 일 경우
        if (this.paymentChange) {
          this.copyCartByEntries(this.accountInfo, this.orderList.orders[0].entries);
        } else {
          this.getSaveCarts();
        }
      }
      // this.storage.setCustomer(this.accountInfo); // getBalanceInfo로 이동
      this.activeSearchMode('P');
      this.getBalanceInfo();
    }
  }

  /**
   * 사용자 변경시 cart 복제
   * - 현재 장바구니에 있는 정보를 복제함.
   * @param currentUserInfo
   * @param currentCartInfo
   * @param changeUserInfo
   */
  private changeUser(changeUserInfo: Accounts) {
    const msg = this.message.get('changeUserAlert');
    this.modal.openConfirm({
      title: '사용자 변경 확인',
      message: msg,
      actionButtonLabel: '확인',
      closeButtonLabel: '취소',
      closeByClickOutside: false,
      modalId: 'CHANGEUSER'
    }).subscribe(
      result => {
        if (result) {
          if (this.cartList.length > 0) {
            this.copyCartByEntries(changeUserInfo, this.cartList);
          } else {
            this.accountInfo = changeUserInfo;
            // this.storage.setCustomer(this.accountInfo);
            this.getBalanceInfo(); // 회원의 포인트와 Re-Cash 조회(Account에 포함하여 setCustomer로 이벤트 전송)
            this.activeSearchMode('P');
            this.getSaveCarts();
          }
        }
      }
    );
  }

  /**
   * entry 정보를 이용하여 Cart를 복제
   *
   * @param account 사용자 정보
   * @param cartList 카트 엔트리 정보
   */
  private copyCartByEntries(account: Accounts, cartList: Array<OrderEntry>) {
    if (!cartList) {
      return;
    }
    this.copyCartEntriesSubscription = this.cartService.copyCartEntries(account, cartList).subscribe(resultData => {
      this.init();
      this.accountInfo = account;
      // this.storage.setCustomer(this.accountInfo);
      this.getBalanceInfo(); // 회원의 포인트와 Re-Cash 조회(Account에 포함하여 setCustomer로 이벤트 전송)
      this.cartInfo = resultData.cartInfo;
      this.sendRightMenu('a', true, account);
      this.sendRightMenu('all', true);
      this.resCartInfo = resultData.resCartInfo;
      this.addCartModel = resultData.resCartInfo.cartModification;
      this.addCartModel.forEach(model => {
        if (model.statusCode === 'success') {
          this.productInfo = model.entry;
          this.addCartEntry(this.resCartInfo.cartList);
        } else {
          this.restrictionModel = this.makeRestrictionMessage(model);
          this.restrictionMessageList.push(this.restrictionModel);
        }
      });
      if (this.restrictionMessageList.length > 0) {
        this.modal.openModalByComponent(RestrictComponent, {
          callerData: { data: this.restrictionMessageList },
          closeByEnter: true,
          modalId: 'RestictComponent_User'
        });
      } else {
        this.activeSearchMode('P');
        this.getSaveCarts();
      }
    }, error => {
      const errdata = Utils.getError(error);
      if (errdata) {
        this.alert.error({ message: `${errdata.message}` });
      }
    });
  }

  /**
   * 회원 검색 ->  결과 값이 1일 경우 display and create cart
   * searchMode ex) A = ABO, M = MEMBER, C = Customer
   * @param accountid 회원아이디(ABO검색 기본)
   */
  private selectAccountInfo(searchMode: string, accountid?: string): void {
    if (accountid) {
      this.searchSubscription = this.searchService.getAccountList(searchMode, accountid).subscribe(
        result => {
          const accountsize = result.accounts.length;
          if (accountsize === 1) {
            if (this.orderType === '') {
              this.orderType = 'n';
            }
            this.getAccountAndSaveCart(result.accounts[0]);
          } else {
            this.callSearchAccount(this.searchParams);
          }
        },
        error => { this.logger.set('cart.list.component', `${error}`).error(); });
    } else {
      this.callSearchAccount(this.searchParams);
    }
  }

  /**
   * 상품 검색 ->  결과 값이 1일 경우 Add to cart
   *
   * @param {string} productCode 상품코드
   */
  private selectProductInfo(productCode?: string): void {
    if (productCode) {
      this.productInfoSubscription = this.searchService.getBasicProductInfoByCart('sku', productCode, this.cartInfo.user.uid, this.cartInfo.code, 0).subscribe(
        result => {
          const totalCount = result.pagination.totalResults;
          const product: Product = result.products[0];
          if (totalCount === 1 && product.code === productCode.toUpperCase()) {
            if (product.sellableStatusForStock === undefined) {
              // RFID, SERIAL 입력 받음.
              if (product && (product.rfid || product.serialNumber)) {
                this.modal.openModalByComponent(SerialComponent, {
                  callerData: { productInfo: product },
                  closeByClickOutside: false,
                  modalId: 'SerialComponent'
                }).subscribe(data => {
                  if (data) {
                    this.setSerialAndRfids(data);
                    this.addCartEntries(productCode);
                  }
                });
              } else {
                this.addCartEntries(productCode);
              }
            } else {
              if (product.sellableStatusForStock === 'OUTOFSTOCK') {
                this.alert.show({ message: '재고가 부족합니다.', timer: true, interval: 1500 });
              } else if (product.sellableStatusForStock === 'ENDOFSALE') {
                this.alert.show({ message: '단종된 상품입니다.', timer: true, interval: 1500 });
              }
              setTimeout(() => { this.searchText.nativeElement.focus(); }, 500);
            }
          } else {
            this.searchParams.data = this.cartInfo;
            this.callSearchProduct(this.searchParams);
          }
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.alert.error({ message: `${errdata.message}` });
          }
        });
    } else { // 검색어가 없을 경우는 바로 검색팝업
      this.searchParams.data = this.cartInfo;
      this.callSearchProduct(this.searchParams);
    }
  }

  /**
   * 장바구니 생성
   *  - 상품 추가시 생성
   *  - Productcode 가 없을 경우 카트 생성 후 조회
   *`
   * 중요처리사항) OCC를 사용하는 모든 시스템은 주문 시점(Cart 생성 시점) 마다
   * 주문 블록 체크 API를 호출해야함.
   *`
   * @param {boolean} popupFlag 팝업플래그
   * @param {string} productCode  상품 코드
   */
  createCartInfo(popupFlag: boolean, productCode?: string): void {
    let accountId = '';
    if (this.accountInfo) {
      const terminalInfo = this.storage.getTerminalInfo();
      if (this.accountInfo.accountTypeCode.toUpperCase() === this.memberType.CONSUMER || this.accountInfo.accountTypeCode.toUpperCase() === this.memberType.MEMBER) {
        accountId = this.accountInfo.parties[0].uid;
      } else {
        accountId = this.accountInfo.uid;
      }

      const cartType = this.orderType === 'g' ? 'POSGROUP' : 'POS';
      this.cartInfoSubscription = this.cartService.createCartInfo(this.accountInfo ? this.accountInfo.uid : '',
        accountId,
        terminalInfo.pointOfService.name, cartType).subscribe(
          cartResult => {
            this.cartInfo = cartResult;
            this.sendRightMenu('c', true);
            // 그룹 결제일 경우 그룹생성
            if (this.orderType === 'g') {
              let strUserId = '';
              // Ordering ABO 를 제외한 ABO 설정
              this.groupAccountInfo.forEach((account, index) => {
                if (index > 0) {
                  strUserId += ',' + account.parties[0].uid;
                }
              });
              // 그룹 카트 생성
              this.createGroupCart(accountId, this.cartInfo.code, strUserId.slice(1), popupFlag, productCode);
            } else {
              // 상품 검색이 필요 할경우 true
              if (popupFlag) {
                // 상품 코드가 있을 경우 바로 검색
                if (productCode !== undefined) {
                  this.selectProductInfo(productCode);
                } else {
                  // 상품 코드가 없을 경우 상품검색 팝업 노출
                  this.searchParams.data = this.cartInfo;
                  this.callSearchProduct(this.searchParams);
                }
              } else if (productCode !== undefined) {
                this.addCartEntries(productCode);
              }
            }
          },
          error => {
            const errdata = Utils.getError(error);
            if (errdata) {
              this.alert.error({ message: `${errdata.message}` });
            }
          });
    } else {
      this.alert.error({ message: this.message.get('notSelectedUser') });
    }
  }

  /**
   * Update VolumeAccount
   *
   * @param {CartInfo} cartInfo 카트 정보
   */
  updateVolumeAccount(cartInfo: CartInfo): void {
    if (this.cartInfo.code !== undefined) {
      this.updateVolumeAccountSubscription = this.cartService.updateVolumeAccount(this.cartInfo ? this.cartInfo.user.uid : '',
        this.cartInfo ? this.cartInfo.code : '',
        this.cartInfo ? this.cartInfo.volumeABOAccount.uid : '').subscribe(
          res => {
            this.logger.set('cartList.component', `update Volume Account status : ${res.status}`).debug();
          },
          error => {
            const errdata = Utils.getError(error);
            if (errdata) {
              this.alert.error({ message: `${errdata.message}` });
            }
          });
    } else {
      this.alert.error({ message: this.message.get('noCartInfo') });
    }
  }

  /**
   * 현재 장바구니 조회
   *
   * @param {number} page 페이지 정보
   */
  getCartList(page?: number): void {
    const userId = this.orderType === 'g' ? this.groupAccountInfo[0].parties[0].uid : this.cartInfo.user.uid;
    const cartId = this.orderType === 'g' ? this.groupSelectedCart.code : this.cartInfo.code;

    this.cartListSubscription = this.cartService.getCartList(userId, cartId).subscribe(
      result => {
        this.resCartInfo.cartList = result;
        this.cartList = result.entries;
        if (this.cartList.length === 0) {
          this.sendRightMenu('p', false);
        }
        this.storage.setOrderEntry(this.resCartInfo.cartList); // 클라이언트 카트를 갱신하기 위해서 카트 정보를 보내준다.
        this.setPage(page ? page : Math.ceil(this.cartList.length / this.cartListCount));
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.alert.error({ message: `${errdata.message}` });
        }
      });
  }

  /**
   * 장바구니 담기 function
   * @param {string} code 상품코드
   */
  addToCart(code?: string): void {
    if (!this.accountInfo) {
      this.alert.error({ message: this.message.get('notSelectedUser') });
    } else {
      if (this.cartInfo.code === undefined) {
        this.createCartInfo(false, code);
      } else {
        this.addCartEntries(code);
      }
      this.initSerialRfid();
    }
  }

  /**
   * 장바구니 담기
   * 시리얼 넘버가 있을 경우 해당 Serial Number포함하여 전송
   *
   * @param {string} code 상품코드
   */
  addCartEntries(code: string): void {
    if (this.cartInfo.code !== undefined) {
      const userId = this.orderType === 'g' ? this.groupAccountInfo[0].parties[0].uid : this.cartInfo.user.uid;
      const cartId = this.orderType === 'g' ? this.groupSelectedCart.code : this.cartInfo.code;

      this.addCartSubscription = this.cartService.addCartEntry(userId, cartId, code.toUpperCase(), this.serialNumbers, this.rfids).subscribe(
        result => {
          this.resCartInfo = result;
          this.addCartModel = this.resCartInfo.cartModification;
          // 정상적으로 담았을 경우
          if (this.addCartModel[0].statusCode === 'success') {
            this.addCartModel.forEach(addModel => {
              this.productInfo = addModel.entry;
              this.addCartEntry(this.resCartInfo.cartList);
            });

            if (this.orderType === 'g') {
              this.getGroupCart(this.cartInfo.user.uid, this.cartInfo.code);
            }
            this.initSerialRfid();
          } else {
            // Error 메시지 생성하여 팝업 창으로 전달
            this.restrictionModel = this.makeRestrictionMessage(this.addCartModel[0]);
            this.restrictionMessageList.push(this.restrictionModel);
            this.modal.openModalByComponent(RestrictComponent, {
              callerData: { data: this.restrictionMessageList },
              closeByEnter: true,
              modalId: 'RestictComponent_Cart'
            });
          }
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.alert.error({ message: `${errdata.message}` });
          }
        },
        () => { setTimeout(() => { this.searchText.nativeElement.focus(); }, 250); }
      );
    } else {
      this.alert.error({ message: this.message.get('noCartInfo') });
    }
  }

  /**
   * 주문 리스트 추가
   *
   * @param {Cart} cartList 카트 정보
   * @param {number} index 카트 인덱스 정보
   */
  addCartEntry(cartList: Cart, index?: number) {
    this.cartList = cartList.entries;
    if (this.cartList.length > 0) {
      this.sendRightMenu('p', true);
    } else {
      this.sendRightMenu('p', false);
    }

    this.storage.setOrderEntry(cartList); // 장바구니 추가 시 클라이언트에 장바구니 데이터 전송

    // 장바구니에 추가한 페이지로 이동
    const page = index ? index + 1 : this.cartList.length;
    this.setPage(Math.ceil(page / this.cartListCount));
  }

  /**
   * 수량 업데이트
   *
   * @param {string} cartCode 카트 코드
   * @param {string} code 상품코드
   * @param {number} qty 상품 변경 수량
   */
  updateItemQtyCart(cartCode: string, code: string, qty: number): void {
    if (this.cartInfo.code !== undefined || cartCode !== undefined) {
      const index = this.cartList.findIndex(function (obj) {
        return obj.product.code === code;
      });
      this.updateCartSubscription = this.cartService.updateItemQuantityCart(this.cartInfo.user.uid,
        cartCode,
        this.cartList[index].entryNumber,
        code,
        qty).subscribe(
          result => {
            this.resCartInfo = result;
            this.updateCartModel = this.resCartInfo.cartModification[0];
            // 정상적으로 수정이 됐을 경우
            if (this.updateCartModel.statusCode === 'success') {
              this.productInfo = this.updateCartModel.entry;
              this.addCartEntry(this.resCartInfo.cartList, index);

              // 그룹 주문의 경우 총 금액 다시 조회
              if (this.orderType === 'g') {
                this.getGroupCart(this.cartInfo.user.uid, this.cartInfo.code);
              }
              this.initSerialRfid();
            } else {
              this.restrictionModel = this.makeRestrictionMessage(this.updateCartModel);
              this.restrictionMessageList.push(this.restrictionModel);
              this.modal.openModalByComponent(RestrictComponent, {
                callerData: { data: this.restrictionMessageList },
                closeByEnter: true,
                modalId: 'RestictComponent_Qty'
              });
            }
          },
          error => {
            const errdata = Utils.getError(error);
            if (errdata) {
              this.alert.error({ message: `${errdata.message}` });
            }
          });
    } else {
      this.alert.error({ message: this.message.get('noCartInfo') });
    }
  }

  /**
   * 장바구니 개별 삭제
   *
   * @param {string} cartId 카트 아이디
   * @param {string} code 상품코드
   */
  removeItemCart(cartId: string, code: string): void {
    if (this.cartInfo.code !== undefined || cartId !== undefined) {
      const index = this.cartList.findIndex(function (obj) {
        return obj.product.code === code;
      });

      this.removeEntrySubscription = this.cartService.deleteCartEntries(this.cartInfo.user.uid,
        cartId,
        this.cartList[index].entryNumber).subscribe(
          result => {
            this.resCartInfo.cartList = result.cartList;
            this.getCartList(index < this.cartListCount ? 1 : Math.ceil(index / this.cartListCount));
            if (this.orderType === 'g') {
              // 그룹 카트 조회
              this.getGroupCart(this.cartInfo.user.uid, this.cartInfo.code);
            }
          },
          error => {
            const errdata = Utils.getError(error);
            if (errdata) {
              this.alert.error({ message: `${errdata.message}` });
            }
          });
    } else {
      this.alert.error({ message: this.message.get('noCartInfo') });
    }
  }

  /**
   * 장바구니 삭제
   */
  removeCart(): void {
    if (this.cartInfo.code !== undefined) {
      const userId = this.cartInfo.user.uid;
      const cartId = this.cartInfo.code;
      this.removeCartSubscription = this.cartService.deleteCart(userId, cartId).subscribe(
        () => {
          this.init();
          this.storage.clearClient();
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.alert.error({ message: `${errdata.message}` });
          }
        });
    } else {
      this.init();
      this.storage.clearClient();
    }
  }

  /**
   * 그룹 장바구니 삭제
   */
  removeGroupCart(): void {
    if (this.cartInfo.code !== undefined && this.groupSelectedCart.code !== undefined) {
      const userId = this.groupAccountInfo[0].parties[0].uid;
      const cartId = this.groupSelectedCart.code;
      this.removeCartSubscription = this.cartService.deleteCart(userId, cartId).subscribe(
        () => {
          // 확인 필요
          // 그룹주문시 groupAccount 에서 삭제할 Index 확인
          const groupAccountIndex = this.checkGroupUserId(this.groupSelectedCart.volumeABOAccount.uid);
          // Ordering ABO 만 남았을 경우, Ordering ABO 가 카트 삭제시 초기화
          if (this.groupAccountInfo.length < 2 || this.groupAccountInfo[0].parties[0].uid === this.groupSelectedCart.volumeABOAccount.uid) {
            this.init();
            this.storage.clearClient();
          } else {
            // 그룹주문 에서 사용자 삭제
            this.groupAccountInfo.splice(groupAccountIndex, 1);
            // 사용자의 현재 페이지 및 사용자 선택
            const selectIndex = this.selectedUserIndex - 1 === -1 ? 9 : this.selectedUserIndex - 1;
            const page = this.selectedUserIndex - 1 === -1 ? this.userPager.currentPage - 1 : this.userPager.currentPage;
            // 그룹주문 사용자 페이지 전환
            this.setUserPage(page);
            // 사용자 선택하여 CartList 호출
            this.choiceGroupUser(selectIndex, this.groupAccountInfo[groupAccountIndex - 1].uid);
            // 그룹 카트 조회
            this.getGroupCart(this.cartInfo.user.uid, this.cartInfo.code);
          }
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.alert.error({ message: `${errdata.message}` });
          }
        });
    } else {
      const groupAccountIndex = this.checkGroupUserId(this.selectedUserId);
      if (groupAccountIndex <= 0) {
        this.init();
        this.storage.clearClient();
      } else {
        this.groupAccountInfo.splice(groupAccountIndex, 1);
        const selectIndex = this.selectedUserIndex - 1 === -1 ? 9 : this.selectedUserIndex - 1;
        const page = this.selectedUserIndex - 1 === -1 ? this.userPager.currentPage - 1 : this.userPager.currentPage;
        this.setUserPage(page);
        this.choiceGroupUser(selectIndex, this.groupAccountInfo[groupAccountIndex - 1].uid);
      }
    }
  }

  /**
   * 보류된 장바구니 리스트 가져오기
   */
  getSaveCarts() {
    this.cartService.getSaveCarts(this.accountInfo.parties[0].uid).subscribe(
      result => {
        if (result.carts.length > 0) {
          this.holdOrder();
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.alert.error({ message: `${errdata.message}` });
        }
      });
  }

  /**
   * 장바구니 저장(보류)
   */
  saveCart() {
    if (this.cartInfo.code !== undefined && this.cartList.length > 0) {
      this.cartService.saveCart(this.accountInfo.uid, this.cartInfo.user.uid, this.cartInfo.code).subscribe(
        () => {
          this.init();
          this.info.sendInfo('hold', 'add');
          this.storage.removeOrderEntry(); // 보류로 저장되면 클라이언트는 비워줌.
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.alert.error({ message: `${errdata.message}` });
          }
        });
    } else {
      this.alert.error({ message: this.message.get('noCartInfo') });
    }
  }

  /**
   * 보류된 장바구니 복원
   */
  restoreSavedCart() {
    if (this.cartInfo.code !== undefined) {
      this.cartService.restoreSavedCart(this.cartInfo.user.uid, this.cartInfo.code).subscribe(
        result => {
          this.resCartInfo.cartList = result.savedCartData;
          this.setCartInfo(this.resCartInfo.cartList);
          this.sendRightMenu('all', true);
          this.info.sendInfo('hold', 'add');
        },
        error => {
          const errdata = Utils.getError(error);
          if (errdata) {
            this.alert.error({ message: `${errdata.message}` });
          }
        });
    } else {
      this.alert.error({ message: this.message.get('noCartInfo') });
    }
  }

  /**
   * 결제 내역 설정
   * @param {PaymentCapture} paymentcapture Payment Capture 정보
   * @param {Order} order 주문정보
   */
  private retreiveInfo(paymentcapture: PaymentCapture, order: Order) {
    if (paymentcapture) {
      this.getBalanceInfo();
      // 카드 내역
      if (paymentcapture.getCcPaymentInfo) {
        const cc = paymentcapture.getCcPaymentInfo;
        this.ccamount = cc.getAmount;
        this.installment = cc.getInstallmentPlan;
      }

      // 현금 내역
      if (paymentcapture.getCashPaymentInfo) {
        const cash = paymentcapture.getCashPaymentInfo;
        this.cashamount = cash.getAmount;
        this.received = cash.getReceived ? Number(cash.getReceived) : 0;
        this.change = cash.getChange ? Number(cash.getChange) : 0;
      }

      // 포인트 내역
      if (paymentcapture.getPointPaymentInfo) {
        this.pointamount = paymentcapture.getPointPaymentInfo.getAmount;
      }

      // Recash 내역
      if (paymentcapture.getMonetaryPaymentInfo) {
        this.recashamount = paymentcapture.getMonetaryPaymentInfo.getAmount;
      }

      // 자동이체 내역
      if (paymentcapture.getDirectDebitPaymentInfo) {
        this.ddamount = paymentcapture.getDirectDebitPaymentInfo.getAmount;
      }
    }
    if (order) {
      this.discount = order.totalDiscounts ? order.totalDiscounts.value : 0;
      this.totalPV = (order.totalPrice && order.totalPrice.amwayValue) ? order.totalPrice.amwayValue.pointValue : 0;
      this.totalBV = (order.totalPrice && order.totalPrice.amwayValue) ? order.totalPrice.amwayValue.businessVolume : 0;
      this.totalPrice = order.totalPrice ? order.totalPrice.value : 0;
    }
  }
  /**
   * 장바구니 복원 데이터 설정
   * @param {Cart} cartData 카트 데이터
   */
  setCartInfo(cartData: Cart): void {
    this.cartList.length = 0;

    // 카트 리스트
    this.cartList = cartData.entries;
    this.storage.setOrderEntry(cartData);
    this.cartInfo.code = cartData.code;
    this.cartInfo.user = cartData.user;
    this.cartInfo.volumeABOAccount = cartData.volumeABOAccount;
    this.cartInfo.guid = cartData.guid;
    this.setPage(Math.ceil(this.cartList.length / this.cartListCount));
  }

  /**
   * 출력 데이터 생성
   *
   * @param {number} page 페이지 번호
   * @param {boolean} pagerFlag 페이징 여부
   */
  setPage(page: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.pager.totalPages) && pagerFlag) {
      return;
    }

    // true 경우 페이지 이동이므로 선택 초기화
    if (pagerFlag) {
      this.selectedCartNum = -1;
    }

    const currentCartData = this.pagerService.getCurrentPage(this.cartList, page, this.cartListCount);
    // pagination 생성 데이터 조회
    this.pager = currentCartData.get('pager') as Pagination;
    // 출력 리스트 생성
    this.currentCartList = currentCartData.get('list') as Array<OrderEntry>;

    this.selectedCartNum = this.currentCartList.length - 1;

    this.totalPriceInfo();
  }

  /**
   * 그룹 사용자 출력 데이터 생성
   * @param {number}} page 페이지 번호
   * @param {boolean} pagerFlag 페이징 여부
   */
  setUserPage(page: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.userPager.totalPages) && pagerFlag) {
      return;
    }

    const currentUserData = this.pagerService.getCurrentPage(this.groupAccountInfo, page, this.GROUP_ACCOUNT_PAGE_SIZE);

    // pagination 생성 데이터 조회
    this.userPager = currentUserData.get('pager') as Pagination;

    // 출력 리스트 생성
    // 리스트 결과가 없을 경우 리스트 초기화
    this.currentGroupAccountInfo = currentUserData.get('list') as Array<Accounts>;

    this.selectedUserIndex = this.currentGroupAccountInfo.length === 0 ? -1 : this.currentGroupAccountInfo.length - 1;
    this.selectedUserId = this.currentGroupAccountInfo.length === 0 ? '' : this.currentGroupAccountInfo[this.selectedUserIndex].parties[0].uid;
  }

  /**
   * 가격정보 계산
   */
  totalPriceInfo(): void {
    this.totalItem = this.resCartInfo.cartList ? this.resCartInfo.cartList.totalUnitCount : 0;
    this.totalPrice = this.resCartInfo.cartList ? this.resCartInfo.cartList.totalPrice.value : 0;
    this.totalPV = this.resCartInfo.cartList && this.resCartInfo.cartList.totalPrice.amwayValue ? this.resCartInfo.cartList.totalPrice.amwayValue.pointValue : 0;
    this.totalBV = this.resCartInfo.cartList && this.resCartInfo.cartList.totalPrice.amwayValue ? this.resCartInfo.cartList.totalPrice.amwayValue.businessVolume : 0;

    this.sendRightMenu('c', true, this.resCartInfo.cartList);
  }

  /**
   * Restriction Message 생성
   * @param {CartModification} model 카트정보
   */
  private makeRestrictionMessage(model: CartModification) {
    let appendMessage = '';
    let imgUrl = '';
    if (this.restrictionMessageList) {
      this.restrictionMessageList.length = 0;
    } else {
      this.restrictionMessageList = new Array<RestrictionModel>();
    }

    model.messages.forEach(message => {
      // if (message.severity === 'ERROR') {
      const msg = this.message.get(message.message) ? this.message.get(message.message) : message.message;
      if (appendMessage === '') {
        appendMessage += msg;
      } else {
        appendMessage += '<br/>' + msg;
      }
      // }
    });

    try {
      if (model.entry.product.images === null) {
        imgUrl = '/assets/images/temp/198x198.jpg';
      } else {
        imgUrl = this.domain + (model.entry.product.images[1].url).replace('/amwaycommercewebservices/v2', '');
      }
    } catch (e) {
      imgUrl = '/assets/images/temp/198x198.jpg';
    }

    const desciption = '';
    const restrictionModel = new RestrictionModel(imgUrl, appendMessage.replace(/\\n/g, '<br>'), desciption);
    return restrictionModel;
  }

  /**
   * 오른쪽 메뉴에 이벤트 전달하기
   *
   * @param {string} modelType 모델타입
   * @param {boolean} useflag 사용플래그
   * @param {any} model 모델객체
   */
  private sendRightMenu(modelType: string, useflag: boolean, model?: any): void {
    switch (modelType.toUpperCase()) {
      case 'A': { this.posCart.emit({ type: 'account', flag: useflag, data: model }); break; }
      case 'P': { this.posCart.emit({ type: 'product', flag: useflag, data: model }); break; }
      case 'C': { this.posCart.emit({ type: 'cart', flag: useflag, data: model }); break; }
      case 'G': { this.posCart.emit({ type: 'group', flag: useflag, data: model }); break; }
      default: {
        this.posCart.emit({ type: 'account', flag: useflag });
        this.posCart.emit({ type: 'product', flag: useflag });
        this.posCart.emit({ type: 'cart', flag: useflag });
        this.posCart.emit({ type: 'group', flag: useflag });
      }
    }
  }

  /**
   * 파이토 카페 사용자 조회 - 기타에서 파이토 카페 상품 메뉴 선택했을 경우
   */
  private searchPhytoCafeAccount() {
    const phytoUserId = this.config.getConfig('phytoCafeUserId');
    if (phytoUserId) {
      this.searchSubscription = this.searchService.getAccountList('C', phytoUserId).subscribe(
        result => {
          const account = result.accounts[0];
          this.searchAccountBroker.sendInfo('n', account);
          const jsonData = { 'balance': [{ amount: 0 }, { amount: 0 }] };
          Object.assign(account, jsonData);
          this.storage.setCustomer(account);
        });
    }
  }

  /**
   * 회원의 balance(point, re-cash) 정보 조회
   * 조회후 account 정보에 balance merge
   * ABO/MEMBER 만 있음.
   */
  private getBalanceInfo() {
    if (this.accountInfo && this.accountInfo.parties) {
      if (this.accountInfo.accountTypeCode === MemberType.CONSUMER) {
        const jsonData = { 'balance': [{ amount: 0 }, { amount: 0 }] };
        Object.assign(this.accountInfo, jsonData);
        this.storage.setCustomer(this.accountInfo);
      } else {
        this.paymentsubscription = this.payment.getBalanceAndRecash(this.accountInfo.parties[0].uid).subscribe(
          result => {
            if (result && this.accountInfo) {
              this.balance = result[0].amount;
              this.recash = result[1].amount;
              const jsonData = { 'balance': result };
              Object.assign(this.accountInfo, jsonData);
              this.storage.setCustomer(this.accountInfo);
            }
          }
        );
      }

    }
  }

  /**
   * 그룹 사용자 선택
   * @param {number} index 선택된 회원의 인덱스 정보
   * @param {string} uid 회원 아이디
   */
  choiceGroupUser(index: number, uid: string): void {
    this.selectedUserIndex = index;
    this.selectedUserId = uid;
    if (this.amwayExtendedOrdering) {
      // 카트 정보 교체
      const existedIdx: number = this.amwayExtendedOrdering.orderList.findIndex(
        function (obj) {
          return obj.volumeABOAccount.uid === uid;
        }
      );

      if (existedIdx !== -1) {
        this.groupSelectedCart = this.amwayExtendedOrdering.orderList[existedIdx];
        this.getCartList();
        // this.createGroupCart(this.cartInfo.user.uid, this.cartInfo.code, uid, false);
      } else {
        this.groupSelectedCart = new AbstractOrder();
        this.sendRightMenu('p', false);
        this.cartList.length = 0;
        this.storage.setOrderEntry(this.cartList);
        this.setPage(Math.ceil(this.cartList.length / this.cartListCount));
      }
    }
    setTimeout(() => { this.searchText.nativeElement.focus(); }, 100);
  }

  /**
   * 그룹 유저 중복 검사
   * @param {string} uid 회원 아이디
   */
  checkGroupUserId(uid: string): number {
    const existedIdx: number = this.groupAccountInfo.findIndex(
      function (obj) {
        return obj.uid === uid;
      }
    );
    return existedIdx;
  }

  /**
   * 그룹 카트 조회
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   */
  getGroupCart(userId: string, cartId: string) {
    this.cartService.getGroupCart(userId, cartId).subscribe(
      result => {
        if (result) {
          this.amwayExtendedOrdering = result;
          this.sendRightMenu('g', true, this.amwayExtendedOrdering);
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.alert.error({ message: `${errdata.message}` });
        }
      });
  }

  /**
   * 그룹 카트 생성
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @param {string} volumeAccount ex) 7480001,7480002 or 7480001
   * @param {boolean} popupFlag 팝업 여부
   * @param {string} productCode 상품코드
   * sub 추가시 volumeAccount
   * 추가시 가장 앞에 있는 구매자로 조회
   */
  createGroupCart(userId: string, cartId: string, volumeAccount: string, popupFlag: boolean, productCode?: string) {
    this.cartService.createGroupCart(userId, cartId, volumeAccount).subscribe(
      result => {
        if (result) {
          this.amwayExtendedOrdering = result;

          if (volumeAccount) {
            let uid = '';
            uid = this.selectedUserId;

            const existedIdx: number = this.amwayExtendedOrdering.orderList.findIndex(
              function (obj) {
                return obj.volumeABOAccount.uid === uid;
              }
            );

            // 장바구니가 생성된 경우
            if (existedIdx > -1) {
              this.groupSelectedCart = this.amwayExtendedOrdering.orderList[existedIdx];
              this.cartList = this.groupSelectedCart.entries;
              if (popupFlag) {
                if (productCode !== undefined) {
                  this.selectProductInfo(productCode);
                } else {
                  this.searchParams.data = this.cartInfo;
                  this.callSearchProduct(this.searchParams);
                }
              } else if (productCode !== undefined) {
                this.addCartEntries(productCode);
              }
              this.getCartList();
            }
          } else {
            this.groupSelectedCart = this.amwayExtendedOrdering.orderList[0];
            this.cartList = this.groupSelectedCart.entries;
            if (popupFlag) {
              if (productCode !== undefined) {
                this.selectProductInfo(productCode);
              } else {
                this.searchParams.data = this.cartInfo;
                this.callSearchProduct(this.searchParams);
              }
            } else if (productCode !== undefined) {
              this.addCartEntries(productCode);
            }
            this.getCartList();
          }
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.alert.error({ message: `${errdata.message}` });
        }
      });
  }

  /**
   * Serial / RFID 정보 설정
   *
   * @param {any} data Serial / RFID 스캔 정보
   */
  private setSerialAndRfids(data: any) {
    this.logger.set('cart.list.component', `serial / rfid : ${Utils.stringify(data)}`).debug();
    if (Utils.isNotEmpty(data.serialNumber)) {
      this.serialNumbers.push(data.serialNumber);
    }
    if (Utils.isNotEmpty(data.rfid)) {
      this.rfids.push(data.rfid);
    }
    if (data.serialNumbers && Array.isArray(data.serialNumbers)) {
      data.serialNumbers.forEach(serial => {
        this.serialNumbers.push(serial);
      });
    }
    if (data.rfids && Array.isArray(data.rfids)) {
      data.rfids.forEach(rfid => {
        this.rfids.push(rfid);
      });
    }
  }

  @HostListener('document: keydown', ['$event', '$event.target'])
  keyboardInput(event: any, targetElm: HTMLElement) {
    event.stopPropagation();
    // modal 이 없을때만 동작
    const modalData = this.storage.getSessionItem('latestModalId');
    if (modalData === null) {
      if (this.selectedCartNum !== null && this.selectedCartNum < this.cartListCount) {
        if (event.keyCode === KeyCode.INSERT) { // 임시 건수 수정 이벤트
          this.callUpdateItemQty();
        } else if (event.keyCode === KeyCode.DELETE) { // 임시 개별 삭제 이벤트
          if (this.selectedCartNum === -1) {
            this.alert.warn({ message: this.message.get('selectProductDelete') });
          } else {
            const cartId = this.orderType === 'g' ? this.groupSelectedCart.code : this.cartInfo.code;
            this.removeItemCart(cartId, this.currentCartList[this.selectedCartNum].product.code);
          }
        }
      }
      if (event.keyCode === KeyCode.RIGHT_ARROW) { // 임시 저장 이벤트
        this.saveCart();
      }
    }
  }
}
